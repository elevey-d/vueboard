import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useBoardStore } from './boardStore'

export const useUserStore = defineStore('user', () => {
  const getUsersFromStorage = () => {
    const raw = localStorage.getItem('projectflow_users')
    return raw
      ? JSON.parse(raw)
      : [
          {
            name: 'Андрій р',
            email: 'danil.klimovskiy@gmail.com',
            password: '123',
            role: 'Project Manager',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
          },
        ]
  }

  // Реактивні покажчики сесії та списку користувачів
  const currentEmail = ref(
    localStorage.getItem('projectflow_current_email') || 'danil.klimovskiy@gmail.com',
  )
  const usersList = ref(getUsersFromStorage())

  // Метод синхронізації списків (викликатиметься при реєстрації, логіні чи змінах)
  const loadUsers = () => {
    usersList.value = getUsersFromStorage()
    currentEmail.value =
      localStorage.getItem('projectflow_current_email') || 'danil.klimovskiy@gmail.com'
  }

  // Визначаємо поточного залогіненого юзера
  const currentUser = computed(() => {
    return (
      usersList.value.find((u) => u.email.toLowerCase() === currentEmail.value.toLowerCase()) ||
      usersList.value[0]
    )
  })

  // Примітивні рефи для зв'язку з формами введення
  const name = ref(currentUser.value.name)
  const email = ref(currentUser.value.email)
  const avatar = ref(currentUser.value.avatar)
  const role = ref(currentUser.value.role || 'Project Manager')

  // Якщо відбувається перемикання сесій користувачів, миттєво оновлюємо рефи
  watch(
    currentUser,
    (newWith) => {
      if (newWith) {
        name.value = newWith.name
        email.value = newWith.email
        avatar.value = newWith.avatar
        role.value = newWith.role || 'Project Manager'
      }
    },
    { immediate: true, deep: true },
  )

  const emailNotificationsEnabled = ref(
    localStorage.getItem('projectflow_email_notifications') !== 'false',
  )

  // ВІДНОВЛЕНО ТA ОПТИМІЗОВАНО: Тепер вкладка «Команда» рендерить СТРОГО реальних юзерів із бази!
  const team = computed(() => {
    return usersList.value.map((user) => ({
      name: user.name,
      role: user.role || 'Project Manager',
      email: user.email,
      avatar:
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=eef2ff&color=4f46e5&bold=true`,
    }))
  })

  watch(emailNotificationsEnabled, (newVal) => {
    localStorage.setItem('projectflow_email_notifications', newVal)
  })

  const updateProfile = (newName, newEmail, newRole) => {
    const oldName = name.value
    const oldEmail = email.value
    const cleanedName = newName.trim()
    const cleanedEmail = newEmail.trim().toLowerCase()
    const cleanedRole = newRole.trim()

    if (cleanedName) name.value = cleanedName
    if (cleanedEmail) email.value = cleanedEmail
    if (cleanedRole) role.value = cleanedRole

    if (cleanedName && cleanedName !== oldName) {
      const boardStore = useBoardStore()
      boardStore.updateOwnerName(oldName, cleanedName)
    }

    let allUsers = getUsersFromStorage()
    const userIndex = allUsers.findIndex((u) => u.email.toLowerCase() === oldEmail.toLowerCase())
    if (userIndex !== -1) {
      allUsers[userIndex].name = cleanedName
      allUsers[userIndex].email = cleanedEmail
      allUsers[userIndex].role = cleanedRole
      allUsers[userIndex].avatar = avatar.value
      localStorage.setItem('projectflow_users', JSON.stringify(allUsers))
    }

    localStorage.setItem('projectflow_current_email', cleanedEmail)
    loadUsers() // Перераховуємо команду миттєво
  }

  const updateAvatar = (base64Image) => {
    avatar.value = base64Image

    let allUsers = getUsersFromStorage()
    const userIndex = allUsers.findIndex((u) => u.email.toLowerCase() === email.value.toLowerCase())
    if (userIndex !== -1) {
      allUsers[userIndex].avatar = base64Image
      localStorage.setItem('projectflow_users', JSON.stringify(allUsers))
    }
    loadUsers() // Перераховуємо команду миттєво
  }

  return {
    name,
    email,
    avatar,
    role,
    team,
    emailNotificationsEnabled,
    loadUsers,
    updateProfile,
    updateAvatar,
  }
})
