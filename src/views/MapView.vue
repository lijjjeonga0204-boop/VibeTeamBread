<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CATEGORY_OPTIONS,
  loadCategoryData,
} from '../services/localDataService.js'

const mapContainer = ref(null)
let leafletMap = null
let markerLayer = null

const route = useRoute()
const router = useRouter()

const selectedCategory = ref('attractions')
const mapItems = ref([])
const totalCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const validMapItems = computed(() => {
  return mapItems.value.filter((place) => {
    return (
      Number.isFinite(place.latitude) &&
      Number.isFinite(place.longitude)
    )
  })
})

const currentCategory = computed(() => {
  return (
    CATEGORY_OPTIONS.find(
      (item) => item.key === selectedCategory.value,
    ) || CATEGORY_OPTIONS[0]
  )
})

const displaySummary = computed(() => {
  return `전체 ${totalCount.value}개 중 좌표가 있는 장소 ${validMapItems.value.length}개 표시`
})

function getValidCategory(value) {
  return CATEGORY_OPTIONS.some((item) => item.key === value)
    ? value
    : 'attractions'
}

function createMap() {
  if (!mapContainer.value || leafletMap) {
    return
  }

  leafletMap = L.map(mapContainer.value, {
    preferCanvas: true,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(leafletMap)

  markerLayer = L.layerGroup().addTo(leafletMap)
  leafletMap.setView([36.5, 127.5], 8)
}

function createPopupContent(place) {
  const container = document.createElement('div')

  const title = document.createElement('p')
  title.style.fontWeight = '700'
  title.textContent = place.title || '정보 없음'

  const category = document.createElement('p')
  category.textContent = place.category || '정보 없음'

  const address = document.createElement('p')
  address.textContent = place.address || '주소 정보 없음'

  container.append(title, category, address)

  return container
}

function renderMarkers() {
  if (!leafletMap || !markerLayer) {
    return
  }

  markerLayer.clearLayers()

  if (validMapItems.value.length === 0) {
    leafletMap.setView([36.5, 127.5], 8)
    return
  }

  validMapItems.value.forEach((place) => {
    const marker = L.circleMarker(
      [place.latitude, place.longitude],
      {
        radius: 9,
        color: '#1f4f7f',      // 외곽선 색
        fillColor: '#ffbf47',  // 채움 색
        fillOpacity: 0.95,
        weight: 3,
      },
    )

    marker.bindPopup(createPopupContent(place))
    markerLayer.addLayer(marker)
  })

  if (validMapItems.value.length === 1) {
    const place = validMapItems.value[0]
    leafletMap.setView([place.latitude, place.longitude], 13)
    return
  }

  const bounds = L.latLngBounds(
    validMapItems.value.map((place) => [
      place.latitude,
      place.longitude,
    ]),
  )

  leafletMap.fitBounds(bounds, {
    padding: [30, 30],
    maxZoom: 13,
  })
}

async function fetchMapData(categoryKey) {
  isLoading.value = true
  errorMessage.value = ''
  mapItems.value = []
  totalCount.value = 0

  try {
    const result = await loadCategoryData(categoryKey)
    totalCount.value = result.total
    mapItems.value = result.items

    await nextTick()

    if (leafletMap) {
      leafletMap.invalidateSize()
    }

    renderMarkers()
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : '지도를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

function selectCategory(categoryKey) {
  if (selectedCategory.value === categoryKey) {
    return
  }

  router.push({
    path: '/map',
    query: { category: categoryKey },
  })
}

watch(
  () => route.query.category,
  (newCategory) => {
    const validCategory = getValidCategory(
      String(newCategory),
    )
    if (selectedCategory.value !== validCategory) {
      selectedCategory.value = validCategory
    }
    fetchMapData(validCategory)
  },
)

onMounted(() => {
  createMap()

  const initialCategory = getValidCategory(
    String(route.query.category),
  )
  selectedCategory.value = initialCategory
  fetchMapData(initialCategory)
})

onBeforeUnmount(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
    markerLayer = null
  }
})
</script>

<template>
  <div class="page-view map-page">
    <section class="map-header">
      <h1>대전·충청권 지역 지도</h1>

      <p>
        카테고리를 선택하여 관광지와 지역시설의 위치를 확인해
        보세요.
      </p>

      <p class="map-summary">{{ displaySummary }}</p>
    </section>

    <section class="map-tabs" aria-label="지도 카테고리">
      <button
        v-for="option in CATEGORY_OPTIONS"
        :key="option.key"
        type="button"
        class="map-tab"
        :class="{ active: selectedCategory === option.key }"
        :aria-pressed="selectedCategory === option.key"
        @click="selectCategory(option.key)"
      >
        <span>{{ option.icon }}</span>
        <span>{{ option.label }}</span>
      </button>
    </section>

    <section class="map-status" aria-live="polite">
      <p v-if="isLoading">지도를 불러오는 중입니다.</p>

      <p v-else-if="errorMessage" class="map-error">
        {{ errorMessage }}
      </p>

      <p
        v-else-if="!isLoading && !errorMessage && validMapItems.length === 0"
      >
        좌표가 있는 장소가 없습니다. 다른 카테고리를 선택해 보세요.
      </p>
    </section>

    <section class="map-wrapper">
      <div
        ref="mapContainer"
        class="map-canvas"
        :aria-label="`${currentCategory.label} 지도`"
      />
    </section>
  </div>
</template>