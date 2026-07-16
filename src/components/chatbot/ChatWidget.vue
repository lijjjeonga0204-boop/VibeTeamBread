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
.chat-toggle {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #007acc;
  color: white;
  font-size: 22px;
  border: none;
  z-index: 1000;
}
.chat-panel {
  position: fixed;
  right: 18px;
  bottom: 86px;
  width: 340px;
  max-height: 60vh;
  background: white;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}
.chat-header {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  display:flex; justify-content:space-between; align-items:center;
}
.chat-body {
  padding: 12px;
  overflow:auto;
  flex:1 1 auto;
}
.chat-footer {
  padding: 8px;
  border-top: 1px solid #eee;
  display:flex;
  flex-direction:column;
}
.chat-msg { margin-bottom:8px; display:flex; }
.chat-msg.user { justify-content:flex-end; }
.chat-msg.assistant { justify-content:flex-start; }
.chat-bubble {
  max-width:75%;
  padding:8px 10px;
  border-radius:8px;
  background:#f1f1f1;
}
.chat-msg.user .chat-bubble { background:#007acc;color:white; }
.chat-actions { display:flex; justify-content:flex-end; margin-top:6px; }
.chat-error { color:#b00020; font-size:12px; margin-top:6px; }
@media (max-width:600px) {
  .chat-panel { right: 12px; left: 12px; width: auto; bottom: 80px; max-height: 70vh; }
}
</style>