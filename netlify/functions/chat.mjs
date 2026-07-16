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

  const contextPlaces = Array.isArray(body.context)
    ? body.context.slice(0, 10)
    : []

  const contextText = JSON.stringify(contextPlaces).slice(0, 6000)

  try {
    const openai = new OpenAI({
      apiKey,
    })

    const response = await openai.responses.create({
      model: 'gpt-5-mini',

      instructions: `
당신은 LocalHub의 대전·충청 지역정보 안내 챗봇입니다.

규칙:
- 한국어로 간결하고 친절하게 답변합니다.
- 제공된 지역정보 데이터가 있으면 해당 데이터를 우선 사용합니다.
- 데이터에서 확인할 수 없는 장소나 일정을 사실처럼 만들지 않습니다.
- 정보가 부족하면 확인 가능한 정보가 부족하다고 안내합니다.
- 답변은 가급적 5문장 이내로 작성합니다.

제공된 지역정보:
${contextText || '제공된 추가 지역정보 없음'}
      `.trim(),

      input: messages,
      max_output_tokens: 300,
      store: false,
    })

    const reply = response.output_text?.trim()

    if (!reply) {
      throw new Error('OpenAI 응답 내용이 비어 있습니다.')
    }

    return jsonResponse({
      reply,
    })
  } catch (error) {
    console.error('OpenAI API 호출 오류:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
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