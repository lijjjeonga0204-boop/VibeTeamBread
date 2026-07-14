<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadAttractions } from '../services/localDataService.js'

const attractions = ref([])
const totalCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')
const failedImages = ref({})

const visibleAttractions = computed(() => attractions.value.slice(0, 12))

function handleImageError(id) {
  failedImages.value = { ...failedImages.value, [id]: true }
}

async function fetchAttractions() {
  isLoading.value = true
  errorMessage.value = ''
  attractions.value = []
  totalCount.value = 0

  try {
    const result = await loadAttractions()
    attractions.value = result.items
    totalCount.value = result.total
  } catch (error) {
    errorMessage.value = error.message || '데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAttractions)
</script>

<template>
  <div class="page-view">
    <section class="place-header">
      <h1>대전·충청권 지역정보</h1>
      <p>대전·충청권의 관광지를 확인해 보세요.</p>
      <p class="place-count">전체 관광지 수: {{ totalCount }}개</p>
    </section>

    <section class="place-status">
      <p v-if="isLoading">관광지 정보를 불러오는 중입니다.</p>
      <p v-else-if="errorMessage" class="place-error">{{ errorMessage }}</p>
      <p v-else-if="!visibleAttractions.length">표시할 관광지가 없습니다.</p>
    </section>

    <section class="place-list" v-if="!isLoading && !errorMessage && visibleAttractions.length">
      <div
        class="place-card"
        v-for="place in visibleAttractions"
        :key="place.id"
      >
        <div class="place-image-wrap">
          <img
            v-if="place.image && !failedImages[place.id]"
            :src="place.image"
            :alt="place.title"
            class="place-image"
            @error="() => handleImageError(place.id)"
          />
          <div
            v-else
            class="place-image-empty"
            aria-label="이미지 준비 중"
          >
            이미지 준비 중
          </div>
        </div>

        <div class="place-info">
          <span class="place-category">{{ place.category }}</span>
          <h2 class="place-title">{{ place.title }}</h2>
          <p class="place-address">{{ place.address || '주소 정보 없음' }}</p>
        </div>
      </div>
    </section>
  </div>
</template>