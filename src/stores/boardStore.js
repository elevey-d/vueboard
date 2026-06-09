import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import { useNotificationStore } from './notificationStore'
import { sendRealEmail } from '../services/emailService'

export const useBoardStore = defineStore('board', () => {
  const savedBoards = localStorage.getItem('projectflow_boards')
  const savedActiveBoardId = localStorage.getItem('projectflow_active_board_id')

  const defaultBoards = []

  // Стан (State)
  const boards = ref(savedBoards ? JSON.parse(savedBoards) : defaultBoards)
  const activeBoardId = ref(
    savedActiveBoardId && boards.value.length > 0
      ? savedActiveBoardId
      : boards.value.length > 0
        ? boards.value[0].id
        : null,
  )
  const searchQuery = ref('')

  const formatStoreDate = (dateStr) => {
    if (!dateStr) return 'Не вказано'
    try {
      const date = new Date(dateStr)
      return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(date)
    } catch (e) {
      return dateStr
    }
  }

  const columns = computed(() => {
    if (!activeBoardId.value) return []
    const board = boards.value.find((b) => b.id === activeBoardId.value)
    return board ? board.columns : []
  })

  // Синхронізація з LocalStorage
  watch(
    boards,
    (newBoards) => {
      localStorage.setItem('projectflow_boards', JSON.stringify(newBoards))
    },
    { deep: true },
  )

  watch(activeBoardId, (newId) => {
    if (newId) localStorage.setItem('projectflow_active_board_id', newId)
    else localStorage.removeItem('projectflow_active_board_id')
  })

  // Створення дошки
  const addBoard = async (title) => {
    const newId = `board-${Date.now()}`
    boards.value.push({
      id: newId,
      title,
      columns: [
        { id: 'todo', title: 'До виконання', tasks: [] },
        { id: 'in-progress', title: 'В роботі', tasks: [] },
        { id: 'testing', title: 'Тестування', tasks: [] },
        { id: 'done', title: 'Готово', tasks: [] },
      ],
    })
    activeBoardId.value = newId

    const userStore = useUserStore()
    const notificationStore = useNotificationStore()

    const isEmailEnabled =
      typeof userStore.emailNotificationsEnabled === 'object'
        ? userStore.emailNotificationsEnabled.value
        : userStore.emailNotificationsEnabled

    if (isEmailEnabled && String(isEmailEnabled) !== 'false') {
      notificationStore.addToastOnly(`⏳ Відправляємо лист про створення дошки...`, 'info')
      const success = await sendRealEmail(userStore.email, {
        recipient_name: userStore.name,
        name: userStore.name,
        to_name: userStore.name,
        message_text: `Ви успішно створили нову робочу дошку проєктів "${title}" у системі ProjectFlow.`,
      })
      if (success) {
        notificationStore.addNotification(
          `📧 Реальний лист успішно надіслано на ${userStore.email}!`,
        )
      } else {
        notificationStore.addNotification(`❌ Лист на пошту не пішов через помилку API.`, 'error')
      }
    } else {
      notificationStore.addNotification(
        `📋 Створено нову робочу дошку "${title}" (Email-сповіщення вимкнені)`,
      )
    }
  }

  const updateBoardTitle = (boardId, newTitle) => {
    const board = boards.value.find((b) => b.id === boardId)
    if (board && newTitle.trim()) {
      const oldTitle = board.title
      board.title = newTitle.trim()

      const notificationStore = useNotificationStore()
      notificationStore.addNotification(
        `✏️ Проєкт перейменовано: "${oldTitle}" тепер називається "${board.title}"`,
        'info',
      )
    }
  }

  const deleteBoard = (boardId) => {
    const index = boards.value.findIndex((b) => b.id === boardId)
    if (index !== -1) {
      const deletedTitle = boards.value[index].title
      boards.value.splice(index, 1)

      if (activeBoardId.value === boardId) {
        activeBoardId.value = boards.value.length > 0 ? boards.value[0].id : null
      }

      const notificationStore = useNotificationStore()
      notificationStore.addNotification(`🗑️ Видалено робочий проєкт "${deletedTitle}"`)
    }
  }

  // Керування завданнями
  const addTask = async (
    columnId,
    { title, description, priority, deadline, assignee, reporter },
  ) => {
    const column = columns.value.find((col) => col.id === columnId)
    if (column) {
      column.tasks.push({
        id: `task-${Date.now()}`,
        title,
        description,
        priority,
        assignee,
        reporter,
        deadline: deadline || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      })

      const userStore = useUserStore()
      const notificationStore = useNotificationStore()

      const targetMember = userStore.team.find((m) => m.name === assignee)
      const recipientEmail = targetMember ? targetMember.email : userStore.email
      const recipientName = targetMember ? targetMember.name : assignee

      const isEmailEnabled =
        typeof userStore.emailNotificationsEnabled === 'object'
          ? userStore.emailNotificationsEnabled.value
          : userStore.emailNotificationsEnabled

      if (isEmailEnabled && String(isEmailEnabled) !== 'false') {
        notificationStore.addToastOnly(
          `⏳ Сповіщаємо виконавця ${recipientName} по email...`,
          'info',
        )
        const success = await sendRealEmail(recipientEmail, {
          recipient_name: recipientName,
          name: recipientName,
          to_name: recipientName,
          message_text: `Вас призначено виконавцем нового завдання: "${title}". Постановник: ${reporter}. Дедлайн: ${formatStoreDate(deadline)}.`,
        })
        if (success) {
          notificationStore.addNotification(
            `📧 Лист-запрошення доставлено на пошту ${recipientEmail}!`,
          )
        } else {
          notificationStore.addNotification(
            `❌ Не вдалося надіслати email через збій мережі.`,
            'error',
          )
        }
      } else {
        notificationStore.addNotification(
          `📌 Завдання "${title}" закріплено за ${recipientName} (Email-сповіщення вимкнені)`,
        )
      }
    }
  }

  const updateTask = (
    taskId,
    { title, description, priority, deadline, assignee, reporter, columnId },
  ) => {
    let foundTask = null
    let oldColumnTitle = ''
    let originalCreatedAt = new Date().toISOString()

    columns.value.forEach((col) => {
      const index = col.tasks.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        foundTask = col.tasks.splice(index, 1)[0]
        oldColumnTitle = col.title
        originalCreatedAt = foundTask.createdAt
      }
    })

    if (foundTask) {
      foundTask.title = title
      foundTask.description = description
      foundTask.priority = priority
      foundTask.deadline = deadline
      foundTask.assignee = assignee
      foundTask.reporter = reporter
      foundTask.createdAt = originalCreatedAt

      const targetColumn = columns.value.find((col) => col.id === columnId)
      if (targetColumn) {
        targetColumn.tasks.push(foundTask)
        if (oldColumnTitle && oldColumnTitle !== targetColumn.title) {
          const notificationStore = useNotificationStore()
          notificationStore.addNotification(
            `📝 Status змінено: Завдання "${title}" переведено з "${oldColumnTitle}" до "${targetColumn.title}"`,
            'info',
          )
        }
      }
    }
  }

  // НОВИЙ МЕТОД: Кліковий перенос завдань (Tap-to-Move) для смартфонів
  const moveTaskDirectly = (taskId, fromColumnId, toColumnId) => {
    if (fromColumnId === toColumnId) return

    const sourceColumn = columns.value.find((c) => c.id === fromColumnId)
    const targetColumn = columns.value.find((c) => c.id === toColumnId)

    if (sourceColumn && targetColumn) {
      const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId)
      if (taskIndex !== -1) {
        const [task] = sourceColumn.tasks.splice(taskIndex, 1)
        targetColumn.tasks.push(task)
        localStorage.setItem('projectflow_boards', JSON.stringify(boards.value))
      }
    }
  }

  const deleteTask = (taskId) => {
    columns.value.forEach((column) => {
      column.tasks = column.tasks.filter((task) => task.id !== taskId)
    })
  }

  const clearColumn = (columnId) => {
    const column = columns.value.find((col) => col.id === columnId)
    if (column) column.tasks = []
  }

  const sortColumnByDeadline = (columnId) => {
    const column = columns.value.find((col) => col.id === columnId)
    if (column) column.tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  }

  const sortColumnByCreatedAt = (columnId) => {
    const column = columns.value.find((col) => col.id === columnId)
    if (column) column.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const sortColumnByPriority = (columnId) => {
    const column = columns.value.find((col) => col.id === columnId)
    if (column) {
      const weight = { Високий: 3, Середній: 2, Низький: 1 }
      column.tasks.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0))
    }
  }

  const updateOwnerName = (oldName, newName) => {
    boards.value.forEach((board) => {
      board.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          if (task.assignee === oldName) task.assignee = newName
          if (task.reporter === oldName) task.reporter = newName
        })
      })
    })
  }

  return {
    boards,
    activeBoardId,
    columns,
    searchQuery,
    addBoard,
    updateBoardTitle,
    deleteBoard,
    addTask,
    updateTask,
    moveTaskDirectly, // ← експортовано функціонал
    deleteTask,
    clearColumn,
    sortColumnByDeadline,
    sortColumnByCreatedAt,
    sortColumnByPriority,
    updateOwnerName,
  }
})
