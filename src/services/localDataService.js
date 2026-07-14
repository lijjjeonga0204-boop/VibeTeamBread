export const CATEGORY_OPTIONS = [
  {
    key: 'attractions',
    label: '관광지',
    icon: '🏞️',
    path: '/data/attractions.json'
  },
  {
    key: 'leisure',
    label: '레포츠',
    icon: '🚴',
    path: '/data/leisure-sports.json'
  },
  {
    key: 'culture',
    label: '문화시설',
    icon: '🏛️',
    path: '/data/cultural-facilities.json'
  },
  {
    key: 'shopping',
    label: '쇼핑',
    icon: '🛍️',
    path: '/data/shopping.json'
  },
  {
    key: 'accommodations',
    label: '숙박',
    icon: '🏨',
    path: '/data/accommodations.json'
  },
  {
    key: 'courses',
    label: '여행코스',
    icon: '🗺️',
    path: '/data/travel-courses.json'
  },
  {
    key: 'restaurants',
    label: '음식점',
    icon: '🍽️',
    path: '/data/restaurants.json'
  },
  {
    key: 'festivals',
    label: '축제·공연·행사',
    icon: '🎉',
    path: '/data/festivals.json'
  }
]

export async function loadCategoryData(categoryKey) {
  const option = CATEGORY_OPTIONS.find((item) => item.key === categoryKey)

  if (!option) {
    throw new Error(`알 수 없는 카테고리입니다: ${categoryKey}`)
  }

  const response = await fetch(option.path)

  if (!response.ok) {
    throw new Error(`${option.label} 데이터를 불러오는 중 오류가 발생했습니다.`)
  }

  const data = await response.json()

  if (!Array.isArray(data.items)) {
    throw new Error(`${option.label} 목록이 올바른 형식이 아닙니다.`)
  }

  const category = data.contentType || option.label

  const items = data.items.map((item) => {
    const addressParts = [item.addr1, item.addr2].filter(Boolean)
    const rawImage = item.firstimage || ''
    const image = rawImage.startsWith('http://')
      ? rawImage.replace(/^http:\/\//, 'https://')
      : rawImage

    const latitude = Number(item.mapy)
    const longitude = Number(item.mapx)

    return {
      id: item.contentid,
      title: item.title,
      category,
      address: addressParts.join(' '),
      image: image || '',
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      telephone: item.tel,
      zipcode: item.zipcode,
      copyrightType: item.cpyrhtDivCd
    }
  })

  const total = Number(data.total)
  return {
    key: option.key,
    label: option.label,
    total: Number.isFinite(total) ? total : items.length,
    items
  }
}