<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CATEGORY_OPTIONS,
  loadCategoryData,
} from '../services/localDataService.js'

const route = useRoute()
const router = useRouter()

function resolveCategoryKey(categoryQuery) {
  const categoryKey = Array.isArray(categoryQuery)
    ? categoryQuery[0]
    : categoryQuery

  const isValidCategory = CATEGORY_OPTIONS.some(
    (option) => option.key === categoryKey,
  )

  return isValidCategory ? categoryKey : 'attractions'
}

const selectedCategory = ref(
  resolveCategoryKey(route.query.category),
)

const CATEGORY_BADGE_STYLES = {
  attractions: {
    color: '#0000FF',
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
    borderColor: 'rgba(0, 0, 255, 0.25)',
  },
  leisure: {
    color: '#008000',
    backgroundColor: 'rgba(0, 128, 0, 0.1)',
    borderColor: 'rgba(0, 128, 0, 0.25)',
  },
  culture: {
    color: '#0785b8',
    backgroundColor: 'rgba(14, 180, 252, 0.12)',
    borderColor: 'rgba(14, 180, 252, 0.3)',
  },
  shopping: {
    color: '#b51d7d',
    backgroundColor: 'rgba(214, 37, 152, 0.1)',
    borderColor: 'rgba(214, 37, 152, 0.25)',
  },
  accommodations: {
    color: '#4c00b0',
    backgroundColor: 'rgba(76, 0, 176, 0.1)',
    borderColor: 'rgba(76, 0, 176, 0.25)',
  },
  courses: {
    color: '#666666',
    backgroundColor: 'rgba(128, 128, 128, 0.12)',
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  restaurants: {
    color: '#d60000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: 'rgba(255, 0, 0, 0.25)',
  },
  festivals: {
    color: '#d95700',
    backgroundColor: 'rgba(255, 106, 0, 0.12)',
    borderColor: 'rgba(255, 106, 0, 0.3)',
  },
}

const placeCategoryStyle = computed(() => {
  return (
    CATEGORY_BADGE_STYLES[selectedCategory.value] ||
    CATEGORY_BADGE_STYLES.attractions
  )
})

const currentCategoryData = ref({
  key: 'attractions',
  label: '관광지',
  total: 0,
  items: [],
})

const isLoading = ref(false)
const errorMessage = ref('')
const failedImages = ref({})
const searchKeyword = ref('')
const currentPage = ref(1)

const itemsPerPage = 12

const currentCategory = computed(() => {
  return (
    CATEGORY_OPTIONS.find(
      (item) => item.key === selectedCategory.value,
    ) || CATEGORY_OPTIONS[0]
  )
})

const filteredItems = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return currentCategoryData.value.items
  }

  return currentCategoryData.value.items.filter((place) => {
    const title = (place.title || '').toLowerCase()
    const address = (place.address || '').toLowerCase()

    return title.includes(keyword) || address.includes(keyword)
  })
})

const totalPages = computed(() => {
  const totalItems = filteredItems.value.length
  if (totalItems === 0) {
    return 0
  }
  return Math.ceil(totalItems / itemsPerPage)
})

const displayStart = computed(() => {
  if (filteredItems.value.length === 0) {
    return 0
  }
  return (currentPage.value - 1) * itemsPerPage + 1
})

const displayEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredItems.value.length)
})

const visibleItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredItems.value.slice(startIndex, endIndex)
})

const visiblePageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const start = Math.max(1, Math.min(current - 2, total - 4))
  const end = Math.min(total, start + 4)

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

function handleImageError(id) {
  failedImages.value = {
    ...failedImages.value,
    [id]: true,
  }
}

function scrollToTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

function goToPage(pageNumber) {
  if (pageNumber < 1 || pageNumber > totalPages.value) {
    return
  }

  currentPage.value = pageNumber
  scrollToTop()
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

async function fetchCategoryData(categoryKey) {
  isLoading.value = true
  errorMessage.value = ''
  failedImages.value = {}
  currentCategoryData.value = {
    key: categoryKey,
    label: '',
    total: 0,
    items: [],
  }

  try {
    const result = await loadCategoryData(categoryKey)
    currentCategoryData.value = result

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1
    }
  } catch (error) {
    console.error('지역정보 로딩 오류:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : '데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

async function selectCategory(categoryKey) {
  if (selectedCategory.value === categoryKey) {
    return
  }

  await router.push({
    path: '/places',
    query: {
      category: categoryKey,
    },
  })
}

watch(searchKeyword, () => {
  currentPage.value = 1
})

watch(
  () => route.query.category,
  async (categoryQuery) => {
    const categoryKey = resolveCategoryKey(categoryQuery)

    if (
      selectedCategory.value === categoryKey &&
      currentCategoryData.value.items.length > 0
    ) {
      return
    }

    selectedCategory.value = categoryKey
    searchKeyword.value = ''
    currentPage.value = 1

    await fetchCategoryData(categoryKey)
  },
)

onMounted(() => {
  fetchCategoryData(selectedCategory.value)
})
</script>

<template>
  <div class="page-view">
    <section class="place-header">
      <h1>대전·충청권 지역정보</h1>

      <p>
        관광지부터 음식점, 축제까지 다양한 지역정보를 확인해 보세요.
      </p>

      <p class="place-count">
        <span v-if="searchKeyword">
          검색 결과 {{ filteredItems.length }}개
        </span>
        <span v-else>
          전체 {{ currentCategory.label }} 수:
          {{ currentCategoryData.total }}개
        </span>
      </p>
    </section>

    <section class="place-tabs" aria-label="지역정보 카테고리">
      <button
        v-for="option in CATEGORY_OPTIONS"
        :key="option.key"
        type="button"
        class="place-tab"
        :class="{ active: selectedCategory === option.key }"
        :aria-pressed="selectedCategory === option.key"
        @click="selectCategory(option.key)"
      >
        <span class="place-tab-icon" aria-hidden="true">
          {{ option.icon }}
        </span>
        <span>{{ option.label }}</span>
      </button>
    </section>

    <section class="place-search">
      <label class="place-search-label" for="place-search-input">
        지역정보 검색
      </label>

      <div class="place-search-row">
        <input
          id="place-search-input"
          class="place-search-input"
          type="search"
          v-model="searchKeyword"
          placeholder="장소명 또는 주소를 입력하세요"
        />

        <button
          v-if="searchKeyword"
          type="button"
          class="place-search-clear"
          @click="searchKeyword = ''"
        >
          초기화
        </button>
      </div>
    </section>

    <section class="place-status" aria-live="polite">
      <p v-if="isLoading">
        {{ currentCategory.label }} 정보를 불러오는 중입니다.
      </p>

      <p v-else-if="errorMessage" class="place-error">
        {{ errorMessage }}
      </p>

      <p
        v-else-if="searchKeyword && filteredItems.length === 0"
        class="place-empty"
      >
        검색 조건에 맞는 지역정보가 없습니다.
      </p>

      <p
        v-else-if="!searchKeyword && filteredItems.length === 0"
        class="place-empty"
      >
        표시할 {{ currentCategory.label }} 정보가 없습니다.
      </p>
    </section>

    <section
      v-if="
        !isLoading &&
        !errorMessage &&
        visibleItems.length > 0
      "
      class="place-list"
    >
      <RouterLink
        v-for="place in visibleItems"
        :key="place.id"
        :to="{
          name: 'PlaceDetail',
          params: {
            categoryKey: selectedCategory,
            placeId: place.id
          }
        }"
        class="place-card-link"
        :aria-label="'지역정보 상세 보기: ' + place.title"
      >
        <article class="place-card">
          <div class="place-image-wrap">
            <img
              v-if="place.image && !failedImages[place.id]"
              :src="place.image"
              :alt="place.title"
              class="place-image"
              @error="handleImageError(place.id)"
            />
            <div v-else class="place-image-empty">
              이미지 준비 중
            </div>
          </div>

          <div class="place-info">
            <span
              class="place-category"
              :style="placeCategoryStyle"
            >
              {{ place.category }}
            </span>

            <h2 class="place-title">
              {{ place.title }}
            </h2>

            <p class="place-address">
              {{ place.address || '주소 정보 없음' }}
            </p>
          </div>
        </article>
      </RouterLink>
    </section>

    <section
      v-if="
        !isLoading &&
        !errorMessage &&
        filteredItems.length > 0
      "
      class="place-pagination-wrapper"
      aria-label="지역정보 페이지 이동"
    >
      <p class="place-pagination-info">
        총 {{ filteredItems.length }}개 중
        {{ displayStart }}–{{ displayEnd }}개 표시
      </p>

      <div class="place-pagination">
        <button
          type="button"
          class="place-pagination-button"
          :disabled="currentPage === 1"
          @click="goToPreviousPage"
        >
          이전
        </button>

        <div class="place-pagination-list">
          <button
            v-for="page in visiblePageNumbers"
            :key="page"
            type="button"
            class="place-pagination-button"
            :class="{ active: currentPage === page }"
            :aria-current="currentPage === page ? 'page' : null"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          type="button"
          class="place-pagination-button"
          :disabled="currentPage === totalPages || totalPages === 0"
          @click="goToNextPage"
        >
          다음
        </button>
      </div>
    </section>
  </div>
</template>