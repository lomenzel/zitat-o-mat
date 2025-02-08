import { createRouter, createWebHistory } from 'vue-router'
import GameView from '@/views/GameView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/game/:gameType/:id?',
      name: 'game',
      component: GameView,
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    }
  ],
})

export default router
