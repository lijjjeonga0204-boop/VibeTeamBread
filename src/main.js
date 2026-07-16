import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { installChatContextInterceptor } from './utils/chatData'

installChatContextInterceptor()

createApp(App).use(router).mount('#app')