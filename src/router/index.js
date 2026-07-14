import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegionInfoView from '../views/RegionInfoView.vue'
import BoardListView from '../views/BoardListView.vue'
import MapView from '../views/MapView.vue'

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
    path: '/board',
    name: 'BoardList',
    component: BoardListView
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router