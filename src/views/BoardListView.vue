<script setup>
import { computed, onMounted, ref } from 'vue'
import { createPost, getPosts } from '../services/boardService.js'

const posts = ref([])
const title = ref('')
const category = ref('자유게시판')
const content = ref('')
const password = ref('')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const categoryOptions = [
  '관광지',
  '레포츠',
  '문화시설',
  '쇼핑',
  '숙박',
  '여행코스',
  '음식점',
  '축제·공연·행사',
  '자유게시판',
]

const postCount = computed(() => posts.value.length)

function loadPosts() {
  posts.value = getPosts()
}

function resetForm() {
  title.value = ''
  category.value = '자유게시판'
  content.value = ''
  password.value = ''
}

async function submitPost() {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    createPost({
      title: title.value,
      category: category.value,
      content: content.value,
      password: password.value,
    })

    loadPosts()
    resetForm()
    successMessage.value = '게시글이 등록되었습니다.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : '게시글 등록 중 오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return '날짜 정보 없음'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(() => {
  loadPosts()
})
</script>

<template>
  <div class="page-view board-page">
    <section class="board-header">
      <h1>지역 커뮤니티</h1>
      <p>대전·충청권의 지역 이야기를 자유롭게 공유해 보세요.</p>
      <p class="board-count">현재 게시글 {{ postCount }}개</p>
    </section>

    <div class="board-layout">
      <section class="board-form-section">
        <div class="board-form">
          <h2>새 게시글 작성</h2>

          <p v-if="successMessage" class="board-success">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="board-error">
            {{ errorMessage }}
          </p>

          <form @submit.prevent="submitPost">
            <div class="board-field">
              <label class="board-field-label" for="board-title">제목</label>
              <input
                id="board-title"
                class="board-input"
                type="text"
                v-model="title"
                maxlength="60"
                required
                placeholder="게시글 제목을 입력하세요"
              />
            </div>

            <div class="board-field">
              <label class="board-field-label" for="board-category">카테고리</label>
              <select
                id="board-category"
                class="board-select"
                v-model="category"
                required
              >
                <option
                  v-for="option in categoryOptions"
                  :key="option"
                  :value="option"
                >
                  {{ option }}
                </option>
              </select>
            </div>

            <div class="board-field">
              <label class="board-field-label" for="board-content">내용</label>
              <textarea
                id="board-content"
                class="board-textarea"
                v-model="content"
                maxlength="2000"
                rows="8"
                required
                placeholder="지역 이야기를 자유롭게 작성해 보세요"
              />
            </div>

            <div class="board-field">
              <label class="board-field-label" for="board-password"
                >수정·삭제용 비밀번호</label
              >
              <input
                id="board-password"
                class="board-input"
                type="password"
                v-model="password"
                maxlength="20"
                required
                placeholder="4자 이상 입력하세요"
              />
              <p class="board-password-help">
                게시글 수정과 삭제에 사용됩니다.
              </p>
            </div>

            <button
              type="submit"
              class="board-submit-button"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? '등록 중...' : '등록하기' }}
            </button>
          </form>
        </div>
      </section>

      <section class="board-list-section">
        <h2>게시글 목록</h2>

        <div class="board-list">
          <p v-if="posts.length === 0" class="board-empty">
            아직 등록된 게시글이 없습니다. 첫 번째 이야기를 남겨보세요.
          </p>

          <article
            v-for="post in posts"
            :key="post.id"
            class="board-post-card"
          >
            <span class="board-post-category">{{ post.category }}</span>
            <h3 class="board-post-title">{{ post.title }}</h3>
            <p class="board-post-content">{{ post.content }}</p>
            <div class="board-post-meta">
              <span>익명</span>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>