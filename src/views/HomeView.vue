<script setup>
const categories = [
  { key: 'attractions', emoji: '🗺️', label: '관광지' },
  { key: 'leisure', emoji: '🚴', label: '레포츠' },
  { key: 'culture', emoji: '🎭', label: '문화시설' },
  { key: 'shopping', emoji: '🛍️', label: '쇼핑' },
  { key: 'accommodations', emoji: '🛏️', label: '숙박' },
  { key: 'courses', emoji: '🗺️', label: '여행코스' },
  { key: 'restaurants', emoji: '🍜', label: '음식점' },
  { key: 'festivals', emoji: '🎉', label: '축제·공연·행사' }
]

const recentPosts = [
  { title: '대전 동구 숨은 맛집 탐방기', date: '2026-07-12', category: '음식점' },
  { title: '충청권 여름 축제 추천 3곳', date: '2026-07-08', category: '축제·공연·행사' },
  { title: '아이들과 함께 가기 좋은 문화시설', date: '2026-07-05', category: '문화시설' }
]
</script>

<template>
  <div class="page-view">
    <section class="hero-section">
      <div class="hero-text">
        <p class="eyebrow">대전·충청권 지역정보 서비스</p>
        <h1>대전·충청권의 모든 지역정보를 한곳에서</h1>
        <p class="hero-description">
          관광지부터 맛집, 축제, 여행 이야기까지 지역의 다양한 정보를 확인하고 공유해 보세요.
        </p>
        <div class="hero-actions">
          <RouterLink to="/places" class="primary-button">
            지역정보 둘러보기
          </RouterLink>
          <RouterLink to="/board" class="secondary-button">
            커뮤니티 가기
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <h2>카테고리</h2>
      <div class="categories-grid">
        <RouterLink
            v-for="item in categories"
            :key="item.key"
            :to="{
                path: '/places',
                query: {
                    category: item.key
                }
            }"
            class="category-card"
            :aria-label="`${item.label} 지역정보 보기`"
        >
            <span class="category-emoji">{{ item.emoji }}</span>
            <span>{{ item.label }}</span>
            </RouterLink>
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
  </div>
</template>