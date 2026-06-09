import { createRouter, createWebHistory } from 'vue-router'
import BoardView from '../views/BoardView.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'board',
      component: BoardView,
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TasksView.vue'),
    },
    {
      path: '/team',
      name: 'team',
      component: () => import('../views/TeamView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
  ],
})

// Навігаційний захист глобальних екранів
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Якщо користувач не авторизований і намагається зайти кудись, окрім /auth
  if (!authStore.isAuthenticated && to.name !== 'auth') {
    next({ name: 'auth' })
  }
  // Якщо користувач вже авторизований і йде на сторінку логіну
  else if (authStore.isAuthenticated && to.name === 'auth') {
    next({ name: 'board' })
  } else {
    next()
  }
})

export default router
