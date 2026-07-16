import OpenAI from 'openai'

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .filter(
      (message) =>
        (message?.role === 'user' || message?.role === 'assistant') &&
        typeof message?.content === 'string' &&
        message.content.trim(),
    )
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 500),
    }))
}

/**
 * Responses API 응답에서 텍스트를 안전하게 추출합니다.
 */
function extractResponseText(response) {
  const directText =
    typeof response?.output_text === 'string'
      ? response.output_text.trim()
      : ''

  if (directText) {
    return directText
  }

  if (!Array.isArray(response?.output)) {
    return ''
  }

  return response.output
    .filter((item) => item?.type === 'message')
    .flatMap((item) =>
      Array.isArray(item?.content) ? item.content : [],
    )
    .filter(
      (content) =>
        content?.type === 'output_text' &&
        typeof content?.text === 'string',
    )
    .map((content) => content.text.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

/**
 * 프론트엔드에서 받은 지역정보를 문자열로 변환합니다.
 *
 * 배열과 객체를 모두 허용하며,
 * 장소 개수와 문자열 길이를 자르지 않습니다.
 */
function createContextText(context) {
  if (context === undefined || context === null) {
    return ''
  }

  try {
    return JSON.stringify(context, null, 2)
  } catch (error) {
    console.error('지역정보 데이터 변환 오류:', {
      message: error?.message,
    })

    return ''
  }
}

export default async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'POST 요청만 허용됩니다.',
      },
      405,
    )
  }

  let body

  try {
    body = await request.json()
  } catch {
    return jsonResponse(
      {
        error: '요청 형식이 올바르지 않습니다.',
      },
      400,
    )
  }

  const messages = normalizeMessages(body.messages)

  if (!messages.some((message) => message.role === 'user')) {
    return jsonResponse(
      {
        error: '질문을 입력해 주세요.',
      },
      400,
    )
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error('OPENAI_API_KEY가 설정되지 않았습니다.')

    return jsonResponse(
      {
        error: '챗봇 서버 설정을 확인해 주세요.',
      },
      500,
    )
  }

  /*
   * 기존 제한 제거:
   *
   * 기존 코드
   * body.context.slice(0, 10)
   *
   * 변경 코드
   * body.context 전체 사용
   */
  const contextData = body.context ?? []
  const contextText = createContextText(contextData)

  /*
   * 실제로 오월드 데이터가 서버에 전달됐는지 확인하기 위한 로그입니다.
   * API 키나 전체 데이터 내용은 출력하지 않습니다.
   */
  console.log('챗봇 지역정보 context 확인:', {
    contextType: Array.isArray(contextData)
      ? 'array'
      : typeof contextData,
    contextCount: Array.isArray(contextData)
      ? contextData.length
      : undefined,
    contextLength: contextText.length,
    hasOworld: contextText.includes('오월드'),
    hasDaejeonOworld:
      contextText.includes('대전') &&
      contextText.includes('오월드'),
  })

  try {
    const openai = new OpenAI({
      apiKey,
      maxRetries: 1,
      timeout: 20000,
    })

    const response = await openai.responses.create({
      model: 'gpt-5-mini',

      reasoning: {
        effort: 'low',
      },

      instructions: `
당신은 LocalHub의 대전·충청 지역정보 안내 챗봇입니다.

규칙:
- 한국어로 간결하고 친절하게 답변합니다.
- 아래에 제공된 지역정보 데이터를 가장 우선하여 사용합니다.
- 사용자가 장소의 위치나 주소를 질문하면 데이터에서 장소명과 주소를 검색하여 답변합니다.
- 장소명이 정확히 일치하지 않더라도 띄어쓰기와 일부 표현이 비슷하면 관련 데이터를 확인합니다.
- 데이터에서 확인할 수 없는 장소나 일정을 사실처럼 만들지 않습니다.
- 데이터에 정보가 존재하면 "제공된 지역정보가 없다"고 답하지 않습니다.
- 정보가 실제로 없는 경우에만 확인 가능한 정보가 부족하다고 안내합니다.
- 답변은 가급적 5문장 이내로 작성합니다.

제공된 지역정보 데이터:
${contextText || '제공된 추가 지역정보 없음'}
      `.trim(),

      input: messages,
      max_output_tokens: 800,
      store: false,
    })

    const reply = extractResponseText(response)

    if (!reply) {
      const incompleteReason =
        response?.incomplete_details?.reason || 'empty_response'

      console.error('OpenAI 응답에 텍스트가 없습니다:', {
        responseId: response?.id,
        responseStatus: response?.status,
        incompleteReason,
        outputTypes: Array.isArray(response?.output)
          ? response.output.map((item) => item?.type)
          : [],
        contentTypes: Array.isArray(response?.output)
          ? response.output.flatMap((item) =>
              Array.isArray(item?.content)
                ? item.content.map(
                    (content) => content?.type,
                  )
                : [],
            )
          : [],
        usage: response?.usage,
      })

      const emptyResponseError = new Error(
        'OpenAI 응답 내용이 비어 있습니다.',
      )

      emptyResponseError.code = incompleteReason

      throw emptyResponseError
    }

    return jsonResponse({
      reply,
    })
  } catch (error) {
    console.error('OpenAI API 호출 오류:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
    })

    if (error?.status === 401) {
      return jsonResponse(
        {
          error: 'OpenAI API 키가 올바르지 않습니다.',
        },
        500,
      )
    }

    if (error?.status === 429) {
      return jsonResponse(
        {
          error: 'API 사용 한도 또는 요청 제한을 확인해 주세요.',
        },
        500,
      )
    }

    if (error?.code === 'max_output_tokens') {
      return jsonResponse(
        {
          error:
            '답변 생성 길이 제한에 도달했습니다. 질문을 조금 짧게 입력해 주세요.',
        },
        500,
      )
    }

    if (error?.status === 400) {
      return jsonResponse(
        {
          error:
            '전달된 지역정보가 너무 많거나 챗봇 요청 형식에 문제가 있습니다.',
        },
        500,
      )
    }

    return jsonResponse(
      {
        error: '챗봇 답변을 생성하는 중 오류가 발생했습니다.',
      },
      500,
    )
  }
}

export const config = {
  path: '/api/chat',
}