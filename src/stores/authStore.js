import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from './userStore'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const userStore = useUserStore()

  const isAuthenticated = ref(localStorage.getItem('projectflow_logged_in') === 'true')

  const getRegisteredUsers = () => {
    const users = localStorage.getItem('projectflow_users')
    return users
      ? JSON.parse(users)
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

  const login = (emailVal, password) => {
    const users = getRegisteredUsers()
    const user = users.find(
      (u) => u.email === emailVal.toLowerCase().trim() && u.password === password,
    )

    if (user) {
      isAuthenticated.value = true
      localStorage.setItem('projectflow_logged_in', 'true')
      localStorage.setItem('projectflow_current_email', user.email)

      // Наказуємо оновити базу реактивних користувачів для перемальовки Команди
      userStore.loadUsers()

      router.push('/')
      return { success: true }
    }
    return { success: false, message: 'Невірний Email або пароль' }
  }

  const register = (name, emailVal, password) => {
    const users = getRegisteredUsers()
    const exists = users.some((u) => u.email === emailVal.toLowerCase().trim())

    if (exists) {
      return { success: false, message: 'Користувач з таким Email вже існує' }
    }

    const trimmedName = name.trim()
    const dynamicAvatarStub = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=eef2ff&color=4f46e5&bold=true`

    users.push({
      name: trimmedName,
      email: emailVal.toLowerCase().trim(),
      password,
      role: 'Project Manager',
      avatar: dynamicAvatarStub,
    })

    localStorage.setItem('projectflow_users', JSON.stringify(users))

    return login(emailVal, password)
  }

  const logout = () => {
    isAuthenticated.value = false
    localStorage.removeItem('projectflow_logged_in')
    localStorage.removeItem('projectflow_current_email')

    userStore.loadUsers() // Скидаємо списки до дефолту при розлогіненні
    router.push('/auth')
  }

  return {
    isAuthenticated,
    login,
    register,
    changePassword: (emailVal, currentPassword, newPassword) => {
      const users = getRegisteredUsers()
      const userIndex = users.findIndex(
        (u) => u.email.toLowerCase() === emailVal.toLowerCase().trim(),
      )
      if (userIndex !== -1) {
        if (users[userIndex].password !== currentPassword)
          return { success: false, message: 'Поточний пароль невірний!' }
        users[userIndex].password = newPassword
        localStorage.setItem('projectflow_users', JSON.stringify(users))
        return { success: true }
      }
      return { success: false, message: 'Користувача не знайдено' }
    },
    logout,
  }
})
