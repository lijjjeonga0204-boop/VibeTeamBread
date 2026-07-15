export const config = {
  path: "/api/chat",
};

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: "잘못된 요청" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const latestMessage =
    body.messages
      .slice()
      .reverse()
      .find((message) => message.role === "user")?.content || "";

  return new Response(
    JSON.stringify({
      reply: `테스트 응답입니다. 입력한 질문: ${latestMessage}`,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};