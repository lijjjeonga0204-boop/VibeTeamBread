<script setup>
import { ref, reactive, computed, nextTick } from "vue";
import { sendChat } from "../../services/chatService.js";
import { loadCategoryData } from "../../services/localDataService.js";

const isChatOpen = ref(false);
const inputText = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const messages = reactive([]); // { role: 'user'|'assistant', text }

const lastSent = ref("");

const panelRef = ref(null);
const listRef = ref(null);

const chatInputRef = ref(null);

function focusInput() {
  if (chatInputRef.value) {
    chatInputRef.value.focus();
  }
}

async function toggleOpen() {
  isChatOpen.value = !isChatOpen.value;
  errorMessage.value = "";
  if (isChatOpen.value) {
    await nextTick();
    focusInput();
  }
}

function pushMessage(role, text) {
  messages.push({ role, text });
}

async function collectContextPlaces(queryText) {
  const context = [];
  const keys = ["attractions","leisure","culture","shopping","accommodations","courses","restaurants","festivals"];
  for (const k of keys) {
    try {
      const res = await loadCategoryData(k);
      const found = res.items.filter(item => {
        const title = String(item.title || item.name || "").toLowerCase();
        return title.includes((queryText || "").toLowerCase());
      });
      for (const f of found) {
        if (context.length >= 10) break;
        context.push({
          title: f.title || f.name || "",
          category: f.category || k,
          address: f.address || "",
          description: f.description || f.shortDescription || f.overview || ""
        });
      }
      if (context.length >= 10) break;
    } catch {
      /* ignore */
    }
  }
  return context;
}

async function send() {
  const text = inputText.value.trim();
  if (!text) return;
  if (isLoading.value) return;
  if (text === lastSent.value) return;

  if (text.length > 500) {
    errorMessage.value = "질문은 최대 500자까지 가능합니다.";
    return;
  }

  errorMessage.value = "";
  pushMessage("user", text);
  lastSent.value = text;
  inputText.value = "";
  isLoading.value = true;

  const ctx = await collectContextPlaces(text);

  try {
    const reply = await sendChat(
      [...messages].slice(-6).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
      ctx
    );
    pushMessage("assistant", reply);
    await nextTick();
    scrollToBottom();
  } catch (e) {
    errorMessage.value = e.message || "서버와 통신중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
    await nextTick();
    focusInput();
}
}

function onKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

function scrollToBottom() {
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight;
  }
}
</script>

<template>
  <div>
    <button class="chat-toggle" @click="toggleOpen" aria-label="챗봇 열기">
      💬
    </button>

    <div v-if="isChatOpen" class="chat-panel" ref="panelRef" role="dialog" aria-live="polite">
      <header class="chat-header">
        <strong>지역정보 챗봇</strong>
        <button class="chat-close" @click="toggleOpen">✕</button>
      </header>

      <div class="chat-body" ref="listRef">
        <div v-for="(m, i) in messages" :key="i" :class="['chat-msg', m.role]">
          <div class="chat-bubble">{{ m.text }}</div>
        </div>
        <div v-if="isLoading" class="chat-msg assistant">
          <div class="chat-bubble">응답 생성 중...</div>
        </div>
      </div>

      <footer class="chat-footer">
        <textarea
          ref="chatInputRef"
          v-model="inputText"
          @keydown="onKeydown"
          :disabled="isLoading"
          placeholder="질문을 입력하세요 (Shift+Enter 줄바꿈)"
          rows="2"
        ></textarea>

        <div class="chat-actions">
          <button @click="send" :disabled="isLoading || !inputText.trim()">전송</button>
        </div>

        <p v-if="errorMessage" class="chat-error">{{ error }}</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* 챗봇 열기 버튼 */
.chat-toggle {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;

  display: grid;
  place-items: center;

  width: 60px;
  height: 60px;
  padding: 0;

  color: #ffffff;
  font-size: 1.5rem;

  cursor: pointer;
  border: none;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--primary),
    var(--accent)
  );
  box-shadow:
    0 16px 32px rgba(126, 198, 255, 0.28),
    0 6px 18px rgba(46, 102, 59, 0.14);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.chat-toggle:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 38px rgba(126, 198, 255, 0.34),
    0 8px 22px rgba(46, 102, 59, 0.16);
}

.chat-toggle:active {
  transform: translateY(-1px) scale(0.97);
}

.chat-toggle:focus-visible {
  outline: 3px solid rgba(126, 198, 255, 0.32);
  outline-offset: 4px;
}

/* 챗봇 플로팅 창 */
.chat-panel {
  position: fixed;
  right: 24px;
  bottom: 96px;
  z-index: 1000;

  display: flex;
  flex-direction: column;

  width: 380px;
  height: 540px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 130px);

  overflow: hidden;

  background: var(--surface);
  border: 1px solid rgba(142, 219, 92, 0.35);
  border-radius: 24px;
  box-shadow:
    0 24px 56px rgba(46, 102, 59, 0.14),
    0 8px 24px rgba(0, 0, 0, 0.08);

  animation: chat-panel-open 180ms ease both;
}

@keyframes chat-panel-open {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 상단 헤더 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  min-height: 68px;
  padding: 14px 16px;

  color: var(--text);
  background: linear-gradient(
    120deg,
    rgba(233, 248, 184, 0.95),
    rgba(216, 240, 255, 0.95)
  );
  border-bottom: 1px solid rgba(142, 219, 92, 0.22);
}

.chat-header::before {
  content: "💬";

  display: grid;
  place-items: center;
  flex: 0 0 38px;

  width: 38px;
  height: 38px;

  font-size: 1.1rem;

  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.chat-header > :first-child {
  margin-right: auto;
  font-weight: 800;
}

/* 헤더의 닫기 버튼 */
.chat-header button {
  display: grid;
  place-items: center;

  width: 36px;
  height: 36px;
  padding: 0;

  color: var(--text);
  font-size: 1rem;

  cursor: pointer;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;

  transition:
    background 0.16s ease,
    transform 0.16s ease;
}

.chat-header button:hover {
  background: #ffffff;
  transform: rotate(4deg);
}

.chat-header button:focus-visible {
  outline: 3px solid rgba(126, 198, 255, 0.3);
  outline-offset: 2px;
}

/* 메시지 영역 */
.chat-body {
  flex: 1 1 auto;

  padding: 18px;
  overflow-y: auto;
  scroll-behavior: smooth;

  background:
    radial-gradient(
      circle at top right,
      rgba(126, 198, 255, 0.1),
      transparent 38%
    ),
    linear-gradient(
      180deg,
      #fffef4,
      #ffffff
    );
}

.chat-body::-webkit-scrollbar {
  width: 8px;
}

.chat-body::-webkit-scrollbar-thumb {
  background: rgba(111, 139, 93, 0.25);
  border-radius: 999px;
}

.chat-body::-webkit-scrollbar-track {
  background: transparent;
}

/* 메시지 한 줄 */
.chat-msg {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  margin-bottom: 14px;
}

.chat-msg.assistant {
  justify-content: flex-start;
}

.chat-msg.assistant::before {
  content: "✦";

  display: grid;
  place-items: center;
  flex: 0 0 30px;

  width: 30px;
  height: 30px;

  color: var(--primary);
  font-size: 0.85rem;

  background: var(--primary-soft);
  border: 1px solid rgba(142, 219, 92, 0.25);
  border-radius: 50%;
}

.chat-msg.user {
  justify-content: flex-end;
}

/* 메시지 말풍선 */
.chat-bubble {
  max-width: 78%;
  padding: 11px 14px;

  color: var(--text);
  font-size: 0.94rem;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  background: #f2f3f1;
  border: 1px solid rgba(220, 232, 213, 0.85);
  border-radius: 17px 17px 17px 7px;
  box-shadow: 0 5px 15px rgba(46, 102, 59, 0.06);
}

.chat-msg.user .chat-bubble {
  color: #ffffff;

  background: linear-gradient(
    135deg,
    #68baf6,
    var(--accent)
  );
  border-color: transparent;
  border-radius: 17px 17px 7px 17px;
  box-shadow: 0 7px 18px rgba(126, 198, 255, 0.24);
}

/* 하단 입력 영역 */
.chat-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 12px 14px 14px;

  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid var(--border);
}

/* 입력창 */
.chat-footer textarea {
  width: 100%;
  min-height: 48px;
  max-height: 120px;
  padding: 12px 14px;

  color: var(--text);
  font: inherit;
  line-height: 1.45;

  resize: vertical;
  outline: none;
  background: #fffef4;
  border: 1px solid var(--border);
  border-radius: 14px;

  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.chat-footer textarea::placeholder {
  color: var(--text-muted);
}

.chat-footer textarea:focus {
  background: #ffffff;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(126, 198, 255, 0.14);
}

/* 전송 버튼 영역 */
.chat-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

/* 전송 버튼 */
.chat-actions button {
  min-width: 74px;
  min-height: 40px;
  padding: 9px 16px;

  color: #000000;
  font-weight: 700;

  cursor: pointer;
  background: linear-gradient(
    135deg,
    var(--accent),
    var(--primary)
  );
  border: none;
  border-radius: 12px;
  box-shadow: 0 7px 16px rgba(126, 198, 255, 0.2);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease;
}

.chat-actions button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(126, 198, 255, 0.26);
}

.chat-actions button:active:not(:disabled) {
  transform: translateY(0);
}

.chat-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

.chat-actions button:focus-visible {
  outline: 3px solid rgba(126, 198, 255, 0.28);
  outline-offset: 3px;
}

/* 오류 메시지 */
.chat-error {
  margin: 2px 0 0;
  padding: 9px 11px;

  color: #a53d3d;
  font-size: 0.82rem;
  line-height: 1.4;

  background: #fff1f1;
  border: 1px solid #f2c6c6;
  border-radius: 10px;
}

/* 모바일 */
@media (max-width: 680px) {
  .chat-toggle {
    right: 16px;
    bottom: 16px;

    width: 56px;
    height: 56px;
  }

  .chat-panel {
    right: 12px;
    bottom: 82px;
    left: 12px;

    width: auto;
    height: min(540px, calc(100vh - 110px));
    max-width: none;
    max-height: calc(100vh - 110px);

    border-radius: 20px;
  }

  .chat-header {
    min-height: 62px;
    padding: 12px 14px;
  }

  .chat-body {
    padding: 14px 12px;
  }

  .chat-bubble {
    max-width: 84%;
  }

  .chat-footer {
    padding: 10px 12px 12px;
  }
}
</style>