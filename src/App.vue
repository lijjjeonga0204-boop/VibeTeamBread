<script setup>
const navItems = ['홈', '지역정보', '커뮤니티', '지도']

const categories = [
  { emoji: '🗺️', label: '관광지' },
  { emoji: '🚴', label: '레포츠' },
  { emoji: '🎭', label: '문화시설' },
  { emoji: '🛍️', label: '쇼핑' },
  { emoji: '🛏️', label: '숙박' },
  { emoji: '🗺️', label: '여행코스' },
  { emoji: '🍜', label: '음식점' },
  { emoji: '🎉', label: '축제·공연·행사' }
]

const recentPosts = [
  {
    title: '대전 동구 숨은 맛집 탐방기',
    date: '2026-07-12',
    category: '음식점'
  },
  {
    title: '충청권 여름 축제 추천 3곳',
    date: '2026-07-08',
    category: '축제·공연·행사'
  },
  {
    title: '아이들과 함께 가기 좋은 문화시설',
    date: '2026-07-05',
    category: '문화시설'
  }
]
</script>

<template>
  <div class="app-container">
    <header class="page-header">
      <div class="logo">LocalHub</div>
      <nav class="main-nav" aria-label="메인 메뉴">
        <ul>
          <li v-for="item in navItems" :key="item">
            <button type="button">{{ item }}</button>
          </li>
        </ul>
      </nav>
    </header>

    <main class="main-content">
      <section class="hero-section">
        <div class="hero-text">
          <p class="eyebrow">대전·충청권 지역정보 서비스</p>
          <h1>대전·충청권의 모든 지역정보를 한곳에서</h1>
          <p class="hero-description">
            관광지부터 맛집, 축제, 여행 이야기까지 지역의 다양한 정보를 확인하고 공유해 보세요.
          </p>
          <div class="hero-actions">
            <button type="button" class="primary-button">지역정보 둘러보기</button>
            <button type="button" class="secondary-button">커뮤니티 가기</button>
          </div>
        </div>
      </section>

      <section class="categories-section">
        <h2>카테고리</h2>
        <div class="categories-grid">
          <button
            v-for="item in categories"
            :key="item.label"
            type="button"
            class="category-card"
          >
            <span class="category-emoji">{{ item.emoji }}</span>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </section>

      <section class="posts-section">
        <div class="section-header">
          <h2>최근 게시글</h2>
          <p>예시 게시글을 통해 화면 구성을 확인하세요.</p>
        </div>
        <div class="posts-list">
          <article v-for="post in recentPosts" :key="post.title" class="post-card">
            <h3>{{ post.title }}</h3>
            <div class="post-meta">
              <span>{{ post.date }}</span>
              <span class="post-category">{{ post.category }}</span>
            </div>
          </article>
        </div>
      </section>
    </main>

    <button type="button" class="chatbot-button" aria-label="챗봇 열기">
      💬
    </button>
  </div>
</template>