<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  CATEGORY_OPTIONS,
  loadCategoryData,
} from '../services/localDataService.js'

const selectedCategory = ref('attractions')

const currentCategoryData = ref({
  key: 'attractions',
  label: '관광지',
  total: 0,
  items: [],
})

const isLoading = ref(false)
const errorMessage = ref('')
const failedImages = ref({})

/*
 * script 영역에서는 ref 값을 사용할 때 .value가 필요하다.
 */
const visibleItems = computed(() =>
  currentCategoryData.value.items.slice(0, 12),
)

const currentCategory = computed(() => {
  return (
    CATEGORY_OPTIONS.find(
      (item) => item.key === selectedCategory.value,
    ) || CATEGORY_OPTIONS[0]
  )
})

function handleImageError(id) {
  failedImages.value = {
    ...failedImages.value,
    [id]: true,
  }
}

async function fetchCategoryData(categoryKey) {
  isLoading.value = true
  errorMessage.value = ''
  failedImages.value = {}

  /*
   * 카테고리를 변경할 때 이전 카테고리의 카드가
   * 잠시 남지 않도록 데이터를 초기화한다.
   */
  currentCategoryData.value = {
    key: categoryKey,
    label: '',
    total: 0,
    items: [],
  }

  try {
    const result = await loadCategoryData(categoryKey)
    currentCategoryData.value = result
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

  selectedCategory.value = categoryKey
  await fetchCategoryData(categoryKey)
}

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
        전체 {{ currentCategory.label }} 수:
        {{ currentCategoryData.total }}개
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

    <section class="place-status" aria-live="polite">
      <p v-if="isLoading">
        {{ currentCategory.label }} 정보를 불러오는 중입니다.
      </p>

      <p
        v-else-if="errorMessage"
        class="place-error"
      >
        {{ errorMessage }}
      </p>

      <p
        v-else-if="visibleItems.length === 0"
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
      <article
        v-for="place in visibleItems"
        :key="place.id"
        class="place-card"
      >
        <div class="place-image-wrap">
          <img
            v-if="place.image && !failedImages[place.id]"
            :src="place.image"
            :alt="place.title"
            class="place-image"
            @error="handleImageError(place.id)"
          />

          <div
            v-else
            class="place-image-empty"
          >
            이미지 준비 중
          </div>
        </div>

        <div class="place-info">
          <span class="place-category">
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
    </section>
  </div>
</template>