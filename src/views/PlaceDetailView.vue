<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { loadCategoryData } from '../services/localDataService.js'

const route = useRoute()
const categoryKey = route.params.categoryKey
const placeId = String(route.params.placeId || '')

const place = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const detailImageFailed = ref(false)
const categoryLabel = ref('')

const hasLocation = computed(() => {
  return (
    place.value &&
    place.value.latitude != null &&
    place.value.longitude != null
  )
})

const mapLink = computed(() => {
  if (!hasLocation.value) {
    return null
  }

  return {
    path: '/map',
    query: {
      placeId: String(place.value.id)
    }
  }
})

function handleDetailImageError() {
  detailImageFailed.value = true
}

function formatValue(value) {
  return value || '정보 없음'
}

async function loadPlaceDetail() {
  isLoading.value = true
  errorMessage.value = ''
  place.value = null
  detailImageFailed.value = false
  categoryLabel.value = ''

  if (!categoryKey || !placeId) {
    errorMessage.value = '잘못된 경로입니다. 올바른 지역정보를 확인해주세요.'
    isLoading.value = false
    return
  }

  try {
    const result = await loadCategoryData(categoryKey)
    categoryLabel.value = result.label

    const found = result.items.find(
      (item) => String(item.id) === placeId
    )

    if (!found) {
      throw new Error('해당 장소를 찾을 수 없습니다.')
    }

    place.value = found
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : '상세 정보를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPlaceDetail()
})
</script>

<template>
  <div class="page-view">
    <section class="place-detail-header">
      <RouterLink to="/places" class="place-detail-back">
        지역정보 목록으로
      </RouterLink>
    </section>

    <section class="place-detail-status" v-if="isLoading">
      상세 정보를 불러오는 중입니다.
    </section>

    <section class="place-detail-status place-error" v-else-if="errorMessage">
      {{ errorMessage }}
      <div>
        <RouterLink to="/places" class="place-detail-back">
          지역정보 목록으로
        </RouterLink>
      </div>
    </section>

    <section v-else-if="place" class="place-detail">
      <p class="place-detail-category">
        {{ place.category || categoryLabel || '정보 없음' }}
      </p>

      <h1 class="place-detail-title">{{ place.title || '정보 없음' }}</h1>

      <div class="place-detail-grid">
        <div class="place-detail-image-wrap">
          <img
            v-if="place.image && !detailImageFailed"
            :src="place.image"
            :alt="place.title"
            class="place-detail-image"
            @error="handleDetailImageError"
          />

          <div v-else class="place-detail-image-empty">
            이미지 준비 중
          </div>
        </div>

        <div class="place-detail-info">
          <dl class="place-detail-list">
            <div class="place-detail-row">
              <dt>주소</dt>
              <dd>{{ formatValue(place.address) }}</dd>
            </div>

            <div class="place-detail-row">
              <dt>전화번호</dt>
              <dd>{{ formatValue(place.telephone) }}</dd>
            </div>

            <div class="place-detail-row">
              <dt>우편번호</dt>
              <dd>{{ formatValue(place.zipcode) }}</dd>
            </div>

            <div class="place-detail-row">
              <dt>위도</dt>
              <dd>
                {{ place.latitude != null ? place.latitude : '정보 없음' }}
              </dd>
            </div>

            <div class="place-detail-row">
              <dt>경도</dt>
              <dd>
                {{ place.longitude != null ? place.longitude : '정보 없음' }}
              </dd>
            </div>
          </dl>

          <RouterLink
            v-if="hasLocation"
            :to="mapLink"
            class="place-detail-map-link"
          >
            지도에서 보기
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>