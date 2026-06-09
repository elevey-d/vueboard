import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', () => {
  const toasts = ref([])

  const savedHistory = localStorage.getItem('projectflow_notifications_history')
  const history = ref(savedHistory ? JSON.parse(savedHistory) : [])

  watch(
    history,
    (newHistory) => {
      localStorage.setItem('projectflow_notifications_history', JSON.stringify(newHistory))
    },
    { deep: true },
  )

  const addNotification = (message, type = 'success') => {
    const id = Date.now()

    // 1. Швидкий тост (зникає через 4 секунди)
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 4000)

    // 2. Запис в журнал (додаємо поле isRead)
    history.value.unshift({
      id,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
    })
  }

  // Позначити конкретне сповіщення як прочитане
  const markAsRead = (id) => {
    const log = history.value.find((t) => t.id === id)
    if (log) {
      log.isRead = true
    }
  }

  // Видалити конкретне сповіщення з журналу
  const deleteLog = (id) => {
    history.value = history.value.filter((t) => t.id !== id)
  }

  const clearHistory = () => {
    history.value = []
  }

  // Лічильник, рахує тільки непрочитані сповіщення
  const unreadCount = computed(() => {
    return history.value.filter((t) => !t.isRead).length
  })

  const addToastOnly = (message, type = 'success') => {
    const id = Date.now()
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 4000)
  }

  const markAllAsRead = () => {
    history.value.forEach((log) => {
      log.isRead = true
    })
  }

  return {
    toasts,
    history,
    unreadCount,
    addNotification,
    markAsRead,
    deleteLog,
    clearHistory,
    addToastOnly,
    markAllAsRead,
  }
})
