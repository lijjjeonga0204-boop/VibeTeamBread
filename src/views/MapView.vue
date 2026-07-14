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

const route = useRoute()
const router = useRouter()

const mapContainer = ref(null)
let leafletMap = null
let markerLayer = null

const selectedCategory = ref('attractions')
const selectedPlaceId = ref(null)
const mapItems = ref([])
const totalCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const markerByPlaceId = new Map()
const placeCardElements = new Map()

const DEFAULT_MARKER_STYLE = {
  radius: 7,
  color: '#54b3ff',
  weight: 2,
  fillColor: '#8edb5c',
  fillOpacity: 0.75,
}

const SELECTED_MARKER_STYLE = {
  radius: 10,
  color: '#174c7d',
  weight: 4,
  fillColor: '#ffd54f',
  fillOpacity: 1,
}

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
  const safePlace = place || {}

  const container = document.createElement('div')
  container.className = 'map-popup-card'

  if (safePlace.image) {
    const image = document.createElement('img')
    image.className = 'map-popup-image'
    image.src = safePlace.image
    image.alt = `${safePlace.title || '장소'} 대표 이미지`
    image.loading = 'lazy'
    image.addEventListener('error', () => {
      image.style.display = 'none'
    })
    container.appendChild(image)
  }

  const body = document.createElement('div')
  body.className = 'map-popup-body'

  const category = document.createElement('p')
  category.className = 'map-popup-category'
  category.textContent = safePlace.category || '카테고리 없음'
  body.appendChild(category)

  const title = document.createElement('p')
  title.className = 'map-popup-title'
  title.textContent = safePlace.title || '이름 없음'
  body.appendChild(title)

  const address = document.createElement('p')
  address.className = 'map-popup-address'
  address.textContent = safePlace.address || '주소 정보 없음'
  body.appendChild(address)

  const telephone = document.createElement('p')
  telephone.className = 'map-popup-telephone'
  telephone.textContent =
    safePlace.telephone || '전화번호 정보 없음'
  body.appendChild(telephone)

  container.appendChild(body)
  return container
}

function updateMarkerStyles() {
  const currentId = selectedPlaceId.value
  markerByPlaceId.forEach((marker, placeId) => {
    const isSelected = String(placeId) === String(currentId)
    marker.setStyle(isSelected ? SELECTED_MARKER_STYLE : DEFAULT_MARKER_STYLE)
  })
}

function scrollSelectedCardIntoView() {
  if (!selectedPlaceId.value) {
    return
  }

  const card = placeCardElements.get(String(selectedPlaceId.value))
  if (card && typeof card.scrollIntoView === 'function') {
    card.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }
}

function selectPlaceFromMarker(place) {
  selectedPlaceId.value = String(place.id)
  updateMarkerStyles()

  nextTick(() => {
    scrollSelectedCardIntoView()
  })
}

function selectPlaceFromList(place) {
  selectedPlaceId.value = String(place.id)
  updateMarkerStyles()

  if (
    leafletMap &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude)
  ) {
    leafletMap.flyTo([place.latitude, place.longitude], 14, {
      animate: true,
    })

    const marker = markerByPlaceId.get(String(place.id))
    if (marker && typeof marker.openPopup === 'function') {
      marker.openPopup()
    }
  }
}

function setPlaceCardRef(element, placeId) {
  const id = String(placeId)

  if (element) {
    placeCardElements.set(id, element)
  } else {
    placeCardElements.delete(id)
  }
}

function renderMarkers() {
  if (!leafletMap || !markerLayer) {
    return
  }

  markerLayer.clearLayers()
  markerByPlaceId.clear()

  if (validMapItems.value.length === 0) {
    leafletMap.setView([36.5, 127.5], 8)
    return
  }

  validMapItems.value.forEach((place) => {
    const marker = L.circleMarker([place.latitude, place.longitude], {
      ...DEFAULT_MARKER_STYLE,
    })

    marker.bindPopup(createPopupContent(place), {
      maxWidth: 280,
      minWidth: 220,
      closeButton: true,
      autoPan: true,
      autoPanPadding: [24, 24],
      className: 'map-place-popup',
    })

    marker.on('click', () => {
      selectPlaceFromMarker(place)
      if (typeof marker.openPopup === 'function') {
        marker.openPopup()
      }
    })

    markerByPlaceId.set(String(place.id), marker)
    markerLayer.addLayer(marker)
  })

  updateMarkerStyles()

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
  selectedPlaceId.value = null
  markerByPlaceId.clear()
  placeCardElements.clear()

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
    const validCategory = getValidCategory(String(newCategory))
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

  markerByPlaceId.clear()
  placeCardElements.clear()
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

    <section class="map-content-layout">
      <div class="map-wrapper">
        <div
            ref="mapContainer"
            class="map-canvas"
            :aria-label="`${currentCategory.label} 지도`"
        ></div>
      </div>

      <aside class="map-place-panel">
        <div class="map-place-panel-header">
          <div>
            <p class="map-place-panel-title">지도 장소 목록</p>
            <p class="map-place-panel-count">
              {{ validMapItems.length }}개의 장소
            </p>
          </div>
        </div>

        <div class="map-place-list">
          <button
            v-for="place in validMapItems"
            :key="place.id"
            :ref="(element) => setPlaceCardRef(element, place.id)"
            type="button"
            class="map-place-item"
            :class="{ active: selectedPlaceId === String(place.id) }"
            :aria-pressed="selectedPlaceId === String(place.id)"
            @click="selectPlaceFromList(place)"
          >
            <span class="map-place-item-category">
              {{ place.category || '카테고리 없음' }}
            </span>
            <strong class="map-place-item-title">
              {{ place.title || '이름 없음' }}
            </strong>
            <p class="map-place-item-address">
              {{ place.address || '주소 정보 없음' }}
            </p>
          </button>
        </div>
      </aside>
    </section>
  </div>
</template>