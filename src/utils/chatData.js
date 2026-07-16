const DATA_FILES = [
  'accommodations.json',
  'attractions.json',
  'cultural-facilities.json',
  'festivals.json',
  'leisure-sports.json',
  'restaurants.json',
  'shopping.json',
  'travel-courses.json',
]

const CATEGORY_BY_FILE = {
  'accommodations.json': 'accommodations',
  'attractions.json': 'attractions',
  'cultural-facilities.json': 'cultural-facilities',
  'festivals.json': 'festivals',
  'leisure-sports.json': 'leisure-sports',
  'restaurants.json': 'restaurants',
  'shopping.json': 'shopping',
  'travel-courses.json': 'travel-courses',
}

const STOP_WORDS = new Set([
  '위치',
  '주소',
  '어디',
  '알려',
  '알려줘',
  '줘',
  '좀',
  '해줘',
  '해주세요',
  '정보',
  '소개',
  '말해',
  '말해줘',
  '찾아',
  '찾아줘',
  '의',
  '가',
  '이',
  '에',
  '에서',
  '을',
  '를',
  '와',
  '과',
  '한',
  '하고',
  '또',
])

const NAME_LIKE_FIELDS = new Set([
  'name',
  'title',
  'place',
  'placename',
  'place_name',
  'facilityname',
  'facility_name',
  'restaurantname',
  'restaurant_name',
  'attractionname',
  'attraction_name',
  'subtitle',
  'label',
])

const ADDRESS_LIKE_FIELDS = new Set([
  'address',
  'addr',
  'addr1',
  'location',
  'locationname',
  'location_name',
  'fulladdress',
  'full_address',
])

let regionalDataCache = null
let regionalDataPromise = null

function normalizeWhitespace(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '')
}

function extractArrayFromPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of ['items', 'data', 'records', 'results', 'list', 'places']) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  return []
}

function attachDataCategory(item, category) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return item

  if (
    item.dataCategory === undefined ||
    item.dataCategory === null ||
    item.dataCategory === ''
  ) {
    return { ...item, dataCategory: category }
  }

  return item
}

function normalizeDataFile(payload, fileName) {
  const category = CATEGORY_BY_FILE[fileName] || ''
  return extractArrayFromPayload(payload)
    .filter((item) => item && typeof item === 'object')
    .map((item) => attachDataCategory(item, category))
}

function walkStringValues(value, path = []) {
  if (typeof value === 'string') {
    return [{ path, value }]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => walkStringValues(item, [...path, index]))
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      walkStringValues(child, [...path, key]),
    )
  }

  return []
}

function tokenizeQuestion(question) {
  return (question || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

function scoreItem(item, question, tokens) {
  const normalizedQuestion = normalizeWhitespace(question)
  let score = 0
  const stringValues = walkStringValues(item)

  for (const { path, value } of stringValues) {
    if (typeof value !== 'string') continue

    const normalizedValue = normalizeWhitespace(value)
    if (!normalizedValue) continue

    const key = (path[path.length - 1] || '').toLowerCase()

    if (normalizedValue === normalizedQuestion) {
      score += 200
    } else if (
      normalizedQuestion.includes(normalizedValue) ||
      normalizedValue.includes(normalizedQuestion)
    ) {
      score += 150
    } else {
      const matchedTokens = tokens.filter((token) => {
        const normalizedToken = normalizeWhitespace(token)
        return (
          normalizedValue.includes(normalizedToken) ||
          normalizedToken.includes(normalizedValue)
        )
      })

      if (matchedTokens.length) {
        score += 80 + matchedTokens.length * 20
      }
    }

    if (NAME_LIKE_FIELDS.has(key)) {
      score += 30
    } else if (ADDRESS_LIKE_FIELDS.has(key)) {
      score += 10
    }
  }

  return score
}

export async function loadRegionalData() {
  if (regionalDataCache) return regionalDataCache
  if (regionalDataPromise) return regionalDataPromise

  regionalDataPromise = (async () => {
    const combined = []

    const srcDataModules = import.meta.glob('../data/*.json', {
      eager: true,
      import: 'default',
    })

    for (const fileName of DATA_FILES) {
      const moduleKey = `../data/${fileName}`
      const moduleValue = srcDataModules[moduleKey]

      if (moduleValue !== undefined) {
        combined.push(...normalizeDataFile(moduleValue, fileName))
        continue
      }

      try {
        const response = await fetch(`/data/${fileName}`)
        if (response.ok) {
          const payload = await response.json()
          combined.push(...normalizeDataFile(payload, fileName))
        }
      } catch (error) {
        console.warn(`지역정보 로드 실패: ${fileName}`, error)
      }
    }

    regionalDataCache = combined
    return regionalDataCache
  })()

  return regionalDataPromise
}

export function buildChatContext(question, allRegionalData) {
  const trimmedQuestion = (question || '').trim()

  if (!trimmedQuestion || !Array.isArray(allRegionalData)) {
    return []
  }

  const tokens = tokenizeQuestion(trimmedQuestion)
  if (!tokens.length) {
    return []
  }

  const scoredItems = allRegionalData
    .map((item) => ({
      item,
      score: scoreItem(item, trimmedQuestion, tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 30)
    .map((entry) => entry.item)

  return scoredItems
}

export function extractLastUserQuestion(messages) {
  if (!Array.isArray(messages)) {
    return ''
  }

  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message?.role === 'user' && typeof message?.content === 'string')

  return lastUserMessage?.content?.trim() || ''
}

export function installChatContextInterceptor() {
  if (typeof window === 'undefined' || window.__localhubChatContextInstalled) {
    return
  }

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init = {}) => {
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : ''

    if (!requestUrl.includes('/api/chat')) {
      return originalFetch(input, init)
    }

    let bodyText = ''
    if (typeof init?.body === 'string') {
      bodyText = init.body
    } else if (input instanceof Request) {
      bodyText = await input.clone().text()
    }

    let parsedBody = {}
    if (bodyText) {
      try {
        parsedBody = JSON.parse(bodyText)
      } catch (error) {
        console.warn('챗봇 요청 본문 파싱 실패:', error)
      }
    }

    const messages = Array.isArray(parsedBody.messages) ? parsedBody.messages : []
    const allRegionalData = await loadRegionalData()
    const question = extractLastUserQuestion(messages)
    const context = buildChatContext(question, allRegionalData)

    console.log('지역정보 전체 개수:', allRegionalData.length)
    console.log(
      '오월드 데이터 존재 여부:',
      allRegionalData.some((item) => {
        const text = JSON.stringify(item)
        return text.includes('오월드') || text.includes('대전오월드') || text.includes('대전 오월드')
      }),
    )
    console.log('챗봇에 전달하는 context 개수:', context.length)
    console.log(
      '챗봇 context에 오월드 포함 여부:',
      context.some((item) => {
        const text = JSON.stringify(item)
        return text.includes('오월드') || text.includes('대전오월드') || text.includes('대전 오월드')
      }),
    )

    const headers = new Headers(init?.headers)
    headers.set('Content-Type', 'application/json; charset=utf-8')

    return originalFetch('/api/chat', {
      ...init,
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...parsedBody,
        messages,
        context,
      }),
    })
  }

  window.__localhubChatContextInstalled = true
}