<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadCategoryData } from '../services/localDataService.js'

const router = useRouter()
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const selectedDate = ref(new Date(today))
const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']
const eventsByDate = ref({})
const errorMessage = ref('')
const isLoading = ref(false)

function normalizeDateString(value) {
  if (!value || typeof value !== 'string') return null
  const text = value.trim()
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }
  return null
}

function parseDate(value) {
  const normalized = normalizeDateString(value)
  if (!normalized) return null
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildEventMap(items) {
  const map = {}
  items.forEach((item) => {
    const start = parseDate(item.eventStartDate || item.eventstartdate)
    const end = parseDate(item.eventEndDate || item.eventenddate)
    if (!start || !end || end < start) return

    const current = new Date(start)
    while (current <= end) {
      const key = dateKey(current)
      map[key] = map[key] || []
      map[key].push(item)
      current.setDate(current.getDate() + 1)
    }
  })

  Object.values(map).forEach((events) => {
    events.sort((a, b) => String(a.title || '').localeCompare(b.title || ''))
  })

  eventsByDate.value = map
}

const monthLabel = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long'
  })
})

const calendarCells = computed(() => {
  const firstOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  const startDay = firstOfMonth.getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7
  const cells = []

  for (let index = 0; index < totalCells; index += 1) {
    const date = new Date(currentYear.value, currentMonth.value, index - startDay + 1)
    const inCurrentMonth = date.getMonth() === currentMonth.value
    const key = dateKey(date)
    cells.push({
      date,
      inCurrentMonth,
      events: inCurrentMonth ? eventsByDate.value[key] || [] : []
    })
  }

  return cells
})

const selectedEvents = computed(() => {
  const key = dateKey(selectedDate.value)
  return eventsByDate.value[key] || []
})

function selectDate(cell) {
  if (!cell.inCurrentMonth) return
  selectedDate.value = new Date(cell.date)
}

function jumpMonth(delta) {
  const next = new Date(currentYear.value, currentMonth.value + delta, 1)
  currentYear.value = next.getFullYear()
  currentMonth.value = next.getMonth()
  selectedDate.value = new Date(next)
}

function goToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectedDate.value = new Date(today)
}

function openPlaceDetail(event) {
  router.push({
    name: 'PlaceDetail',
    params: {
      categoryKey: 'festivals',
      placeId: String(event.id)
    }
  })
}

onMounted(async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await loadCategoryData('festivals')
    buildEventMap(result.items)
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : '축제 데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="calendar-page page-view">
    <section class="calendar-header">
      <div>
        <h1>축제 캘린더</h1>
        <p>월별 축제공연행사 일정을 확인하고 상세 정보로 이동합니다.</p>
      </div>

      <div class="calendar-actions">
        <button type="button" @click="jumpMonth(-1)">이전 달</button>
        <button type="button" @click="goToday">오늘</button>
        <button type="button" @click="jumpMonth(1)">다음 달</button>
      </div>
    </section>

    <section class="calendar-board">
      <div class="calendar-summary">
        <strong>{{ monthLabel }}</strong>
        <p>{{ selectedDate.value.getFullYear() }}년 {{ selectedDate.value.getMonth() + 1 }}월 {{ selectedDate.value.getDate() }}일</p>
      </div>

      <div v-if="errorMessage" class="calendar-error">{{ errorMessage }}</div>

      <div v-else class="calendar-grid-wrap">
        <div class="calendar-weekdays">
          <div v-for="day in daysOfWeek" :key="day" class="calendar-weekday">{{ day }}</div>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(cell, index) in calendarCells"
            :key="index"
            :class="[
              'calendar-cell',
              { disabled: !cell.inCurrentMonth },
              { today: sameDay(cell.date, today) },
              { selected: sameDay(cell.date, selectedDate.value) }
            ]"
            @click="selectDate(cell)"
          >
            <div class="calendar-cell-date">{{ cell.date.getDate() }}</div>

            <div class="calendar-cell-events" v-if="cell.inCurrentMonth">
              <div
                v-for="(event, idx) in cell.events.slice(0, 2)"
                :key="event.id || `${cell.date}-${idx}`"
                class="calendar-event-chip"
              >
                {{ event.title }}
              </div>

              <div v-if="cell.events.length > 2" class="calendar-event-more">
                외 {{ cell.events.length - 2 }}개
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="calendar-list">
        <h2>선택한 날짜 행사</h2>

        <p v-if="!selectedEvents.length" class="calendar-empty">
          해당 날짜에는 등록된 행사가 없습니다.
        </p>

        <ul v-else>
          <li v-for="event in selectedEvents" :key="event.id" class="calendar-list-item">
            <button type="button" @click="openPlaceDetail(event)">
              <strong>{{ event.title }}</strong>
              <div class="calendar-list-meta">
                <span>
                  {{ normalizeDateString(event.eventStartDate || event.eventstartdate) }}
                  ~
                  {{ normalizeDateString(event.eventEndDate || event.eventenddate) }}
                </span>
                <span>{{ event.eventPlace || event.address || '장소 정보 없음' }}</span>
              </div>
            </button>
          </li>
        </ul>
      </section>
    </section>
  </div>
</template>

<style scoped>
.calendar-page {
  padding: 16px;
}
.calendar-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
}
.calendar-actions button {
  margin-left: 8px;
}
.calendar-board {
  margin-top: 16px;
}
.calendar-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}
.calendar-grid-wrap {
  overflow-x: auto;
  margin-top: 16px;
}
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  background: #f5f5f5;
  padding: 10px 0;
  text-align: center;
  border-radius: 8px 8px 0 0;
}
.calendar-weekday {
  font-weight: 700;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  padding: 8px;
}
.calendar-cell {
  min-height: 94px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  background: #fff;
}
.calendar-cell.disabled {
  opacity: 0.35;
  pointer-events: none;
}
.calendar-cell.today {
  border-color: #007acc;
}
.calendar-cell.selected {
  background: #eef6ff;
  border-color: #007acc;
}
.calendar-cell-date {
  font-weight: 700;
}
.calendar-cell-events {
  margin-top: 8px;
  display: grid;
  gap: 4px;
}
.calendar-event-chip {
  background: #f0f8ff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.calendar-event-more {
  font-size: 12px;
  color: #666;
}
.calendar-list {
  margin-top: 22px;
}
.calendar-list-item {
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 10px;
}
.calendar-list-item button {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 14px 16px;
  display: grid;
  gap: 6px;
  cursor: pointer;
}
.calendar-list-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  color: #555;
  font-size: 13px;
}
.calendar-empty {
  color: #555;
}
@media (max-width: 640px) {
  .calendar-header,
  .calendar-summary {
    flex-direction: column;
    align-items: stretch;
  }
  .calendar-actions button {
    margin-left: 0;
    margin-top: 8px;
  }
  .calendar-grid {
    gap: 4px;
  }
  .calendar-cell {
    min-height: 84px;
    padding: 8px;
  }
}
</style>