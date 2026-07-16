import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegionInfoView from '../views/RegionInfoView.vue'
import PlaceDetailView from '../views/PlaceDetailView.vue'
import BoardListView from '../views/BoardListView.vue'
import MapView from '../views/MapView.vue'
import CalendarView from '../views/CalendarView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/places',
    name: 'RegionInfo',
    component: RegionInfoView
  },
  {
    path: '/places/:categoryKey/:placeId',
    name: 'PlaceDetail',
    component: PlaceDetailView
  },
  {
    path: '/board',
    name: 'BoardList',
    component: BoardListView
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router