export async function sendChat(messages, contextPlaces) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context: contextPlaces }),
  });

  if (!res.ok) {
    throw new Error("챗봇 응답을 받을 수 없습니다. 잠시 후 다시 시도하세요.");
  }

  const data = await res.json();
  if (!data || !data.reply) {
    throw new Error("챗봇 응답이 비어있습니다.");
  }

  return data.reply;
}