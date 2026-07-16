<script setup>
import { onMounted, ref } from 'vue'
import { getRecentPosts } from '../services/boardService.js'

const categories = [
  { key: 'attractions', emoji: '🗺️', label: '관광지' },
  { key: 'leisure', emoji: '🚴', label: '레포츠' },
  { key: 'culture', emoji: '🎭', label: '문화시설' },
  { key: 'shopping', emoji: '🛍️', label: '쇼핑' },
  { key: 'accommodations', emoji: '🛏️', label: '숙박' },
  { key: 'courses', emoji: '🗺️', label: '여행코스' },
  { key: 'restaurants', emoji: '🍜', label: '음식점' },
  { key: 'festivals', emoji: '🎉', label: '축제·공연·행사' },
]

const recentPosts = ref([])
const isPostsLoading = ref(false)
const postsErrorMessage = ref('')

function getPostPreview(content) {
  if (!content) {
    return ''
  }

  const trimmed = String(content).replace(/\s+/g, ' ').trim()
  if (trimmed.length <= 80) {
    return trimmed
  }
  return `${trimmed.slice(0, 80)}...`
}

function formatPostDate(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return '날짜 정보 없음'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

async function loadRecentPosts() {
  isPostsLoading.value = true
  postsErrorMessage.value = ''

  try {
    recentPosts.value = getRecentPosts(3)
  } catch (error) {
    postsErrorMessage.value =
      error instanceof Error
        ? error.message
        : '최근 게시글을 불러오는 중 오류가 발생했습니다.'
  } finally {
    isPostsLoading.value = false
  }
}

onMounted(() => {
  loadRecentPosts()
})
</script>

<template>
  <div class="page-view home-page">
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
              category: item.key,
            },
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
        <RouterLink to="/board" class="home-posts-more">
          커뮤니티 전체 보기
        </RouterLink>
      </div>

      <p v-if="isPostsLoading" class="home-posts-loading">
        최근 게시글을 불러오는 중입니다.
      </p>

      <p v-if="postsErrorMessage" class="home-posts-error">
        {{ postsErrorMessage }}
      </p>

      <div v-if="!isPostsLoading && !postsErrorMessage">
        <div v-if="recentPosts.length === 0" class="home-posts-empty">
          <p>아직 등록된 게시글이 없습니다.</p>
          <p>커뮤니티에서 첫 번째 지역 이야기를 남겨보세요.</p>
          <RouterLink to="/board" class="home-posts-empty-link">
            커뮤니티로 이동
          </RouterLink>
        </div>

        <div v-else class="posts-list">
          <article
            v-for="post in recentPosts"
            :key="post.id"
            class="post-card"
          >
            <span class="post-category">{{ post.category }}</span>
            <h3>{{ post.title }}</h3>
            <p class="home-post-preview">
              {{ getPostPreview(post.content) }}
            </p>
            <div class="post-meta">
              <span class="home-post-author">
                {{ post.author || '익명' }}
              </span>
              <span>{{ formatPostDate(post.createdAt) }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>