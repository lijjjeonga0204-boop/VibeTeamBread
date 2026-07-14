<script setup>
import { ref, computed, onMounted } from 'vue'
import { CATEGORY_OPTIONS, loadCategoryData } from '../services/localDataService.js'

const selectedCategory = ref('attractions')
const currentCategoryData = ref({
  key: 'attractions',
  label: '관광지',
  total: 0,
  items: []
})
const isLoading = ref(false)
const errorMessage = ref('')
const failedImages = ref({})

const visibleItems = computed(() => currentCategoryData.value.items.slice(0, 12))

const currentCategory = computed(
  () =>
    CATEGORY_OPTIONS.find((item) => item.key === selectedCategory.value) ||
    CATEGORY_OPTIONS[0]
)

function handleImageError(id) {
  failedImages.value = { ...failedImages.value, [id]: true }
}

async function fetchCategoryData(categoryKey) {
  isLoading.value = true
  errorMessage.value = ''
  failedImages.value = {}
  currentCategoryData.value = {
    key: categoryKey,
    label: '',
    total: 0,
    items: []
  }

  try {
    const result = await loadCategoryData(categoryKey)
    currentCategoryData.value = result
  } catch (error) {
    errorMessage.value =
      error?.message || '데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

function selectCategory(categoryKey) {
  if (selectedCategory.value === categoryKey) return
  selectedCategory.value = categoryKey
  fetchCategoryData(categoryKey)
}

onMounted(() => {
  fetchCategoryData(selectedCategory.value)
})
</script>

<template>
  <div class="page-view">
    <section class="place-header">
      <h1>대전·충청권 지역정보</h1>
      <p>관광지부터 음식점, 축제까지 다양한 지역정보를 확인해 보세요.</p>
      <p class="place-count">
        전체 {{ currentCategory.value.label }} 수:
        {{ currentCategoryData.value.total }}개
      </p>
    </section>

    <section class="place-tabs">
      <button
        v-for="option in CATEGORY_OPTIONS"
        :key="option.key"
        type="button"
        class="place-tab"
        :class="{ active: selectedCategory.value === option.key }"
        @click="selectCategory(option.key)"
      >
        <span class="place-tab-icon">{{ option.icon }}</span>
        <span>{{ option.label }}</span>
      </button>
    </section>

    <section class="place-status">
      <p v-if="isLoading">관광지 정보를 불러오는 중입니다.</p>
      <p v-else-if="errorMessage" class="place-error">{{ errorMessage }}</p>
      <p v-else-if="!visibleItems.length" class="place-empty">
        표시할 관광지가 없습니다.
      </p>
    </section>

    <section
      class="place-list"
      v-if="!isLoading && !errorMessage && visibleItems.length"
    >
      <div class="place-card" v-for="place in visibleItems" :key="place.id">
        <div class="place-image-wrap">
          <img
            v-if="place.image && !failedImages[place.id]"
            :src="place.image"
            :alt="place.title"
            class="place-image"
            @error="() => handleImageError(place.id)"
          />
          <div class="place-image-empty">이미지 준비 중</div>
        </div>

        <div class="place-info">
          <span class="place-category">{{ place.category }}</span>
          <h2 class="place-title">{{ place.title }}</h2>
          <p class="place-address">
            {{ place.address || '주소 정보 없음' }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>