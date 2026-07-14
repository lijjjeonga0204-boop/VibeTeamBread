<script setup>
const navItems = [
  { label: '홈', to: '/' },
  { label: '지역정보', to: '/places' },
  { label: '커뮤니티', to: '/board' },
  { label: '지도', to: '/map' }
]
</script>

<template>
  <div class="app-container">
    <header class="page-header">
      <div class="logo">LocalHub</div>

      <nav class="main-nav" aria-label="메인 메뉴">
        <ul>
          <li v-for="item in navItems" :key="item.to">
            <RouterLink
              :to="item.to"
              class="nav-link"
              active-class="active"
              exact-active-class="active"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <button type="button" class="chatbot-button" aria-label="챗봇 열기">
      💬
    </button>
  </div>
</template>