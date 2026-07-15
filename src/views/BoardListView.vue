<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from '../services/boardService.js'

const posts = ref([])
const title = ref('')
const category = ref('자유게시판')
const content = ref('')
const password = ref('')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const isActionModalOpen = ref(false)
const actionMode = ref('')
const selectedPostId = ref('')
const selectedPostTitle = ref('')
const editTitle = ref('')
const editCategory = ref('자유게시판')
const editContent = ref('')
const actionPassword = ref('')
const modalErrorMessage = ref('')
const isProcessingAction = ref(false)

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

function openEditModal(post) {
  actionMode.value = 'edit'
  selectedPostId.value = String(post.id)
  selectedPostTitle.value = post.title || ''
  editTitle.value = post.title || ''
  editCategory.value = post.category || '자유게시판'
  editContent.value = post.content || ''
  actionPassword.value = ''
  modalErrorMessage.value = ''
  isActionModalOpen.value = true
}

function openDeleteModal(post) {
  actionMode.value = 'delete'
  selectedPostId.value = String(post.id)
  selectedPostTitle.value = post.title || ''
  actionPassword.value = ''
  modalErrorMessage.value = ''
  isActionModalOpen.value = true
}

function closeActionModal() {
  isActionModalOpen.value = false
  actionMode.value = ''
  selectedPostId.value = ''
  selectedPostTitle.value = ''
  editTitle.value = ''
  editCategory.value = '자유게시판'
  editContent.value = ''
  actionPassword.value = ''
  modalErrorMessage.value = ''
  isProcessingAction.value = false
}

async function submitPostEdit() {
  if (isProcessingAction.value) {
    return
  }

  isProcessingAction.value = true
  modalErrorMessage.value = ''

  try {
    updatePost(
      selectedPostId.value,
      {
        title: editTitle.value,
        category: editCategory.value,
        content: editContent.value,
      },
      actionPassword.value,
    )

    loadPosts()
    closeActionModal()
    successMessage.value = '게시글이 수정되었습니다.'
  } catch (error) {
    modalErrorMessage.value =
      error instanceof Error
        ? error.message
        : '게시글 수정 중 오류가 발생했습니다.'
  } finally {
    isProcessingAction.value = false
  }
}

async function submitPostDelete() {
  if (isProcessingAction.value) {
    return
  }

  isProcessingAction.value = true
  modalErrorMessage.value = ''

  try {
    deletePost(selectedPostId.value, actionPassword.value)
    loadPosts()
    closeActionModal()
    successMessage.value = '게시글이 삭제되었습니다.'
  } catch (error) {
    modalErrorMessage.value =
      error instanceof Error
        ? error.message
        : '게시글 삭제 중 오류가 발생했습니다.'
  } finally {
    isProcessingAction.value = false
  }
}

function handleActionSubmit() {
  if (actionMode.value === 'edit') {
    submitPostEdit()
  } else if (actionMode.value === 'delete') {
    submitPostDelete()
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

      <p v-if="successMessage" class="board-success">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="board-error">
        {{ errorMessage }}
      </p>
    </section>

    <div class="board-layout">
      <section class="board-form-section">
        <div class="board-form">
          <h2>새 게시글 작성</h2>

          <form @submit.prevent="submitPost">
            <div class="board-field">
              <label class="board-field-label" for="board-title"
                >제목</label
              >
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
              <label class="board-field-label" for="board-category"
                >카테고리</label
              >
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
              <label class="board-field-label" for="board-content"
                >내용</label
              >
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
                autocomplete="current-password"
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
            <div class="board-post-actions">
              <button
                type="button"
                class="board-edit-button"
                @click="openEditModal(post)"
              >
                수정
              </button>
              <button
                type="button"
                class="board-delete-button"
                @click="openDeleteModal(post)"
              >
                삭제
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div
      v-if="isActionModalOpen"
      class="board-modal-overlay"
      aria-modal="true"
      role="dialog"
    >
      <div class="board-modal" role="document">
        <header class="board-modal-header">
          <h2 id="board-modal-title" class="board-modal-title">
            {{ actionMode === 'edit' ? '게시글 수정' : '게시글 삭제' }}
          </h2>
        </header>

        <form class="board-modal-form" @submit.prevent="handleActionSubmit">
          <p class="board-modal-description" v-if="actionMode === 'edit'">
            게시글 작성 시 설정한 비밀번호를 입력해 주세요.
          </p>

          <div v-if="actionMode === 'delete'" class="board-modal-description">
            <span class="board-selected-post-title">
              {{ selectedPostTitle }}
            </span>
            게시글을 삭제하시겠습니까?
          </div>

          <p class="board-modal-warning" v-if="actionMode === 'delete'">
            삭제한 게시글은 복구할 수 없습니다.
          </p>

          <div v-if="actionMode === 'edit'">
            <div class="board-field">
              <label class="board-field-label" for="edit-title">제목</label>
              <input
                id="edit-title"
                class="board-input"
                type="text"
                v-model="editTitle"
                maxlength="60"
                required
              />
            </div>

            <div class="board-field">
              <label class="board-field-label" for="edit-category"
                >카테고리</label
              >
              <select
                id="edit-category"
                class="board-select"
                v-model="editCategory"
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
              <label class="board-field-label" for="edit-content"
                >내용</label
              >
              <textarea
                id="edit-content"
                class="board-textarea"
                v-model="editContent"
                maxlength="2000"
                rows="8"
                required
              />
            </div>
          </div>

          <div class="board-field">
            <label class="board-field-label" for="action-password"
              >비밀번호</label
            >
            <input
              id="action-password"
              class="board-input"
              type="password"
              v-model="actionPassword"
              maxlength="20"
              autocomplete="current-password"
              required
            />
          </div>

          <p v-if="modalErrorMessage" class="board-modal-error">
            {{ modalErrorMessage }}
          </p>

          <div class="board-modal-actions">
            <button
              type="button"
              class="board-modal-cancel"
              @click="closeActionModal"
              :disabled="isProcessingAction"
            >
              취소
            </button>
            <button
              type="submit"
              class="board-modal-confirm"
              :class="{ delete: actionMode === 'delete' }"
              :disabled="isProcessingAction"
            >
              {{
                actionMode === 'edit'
                  ? isProcessingAction
                    ? '수정 중...'
                    : '수정하기'
                  : isProcessingAction
                  ? '삭제 중...'
                  : '삭제하기'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>