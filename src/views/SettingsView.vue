<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import {
  Camera,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Save,
  ArrowLeft,
  Trash2,
  Clock,
  Check,
  Eye,
  EyeOff,
} from '@lucide/vue'

const userStore = useUserStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const route = useRoute()

const currentSection = ref(route.query.section === 'notifications' ? 'notifications' : 'profile')

watch(
  () => route.query.section,
  (newSection) => {
    currentSection.value = newSection === 'notifications' ? 'notifications' : 'profile'
  },
)

// Поля форми профілю
const inputName = ref(userStore.name)
const inputEmail = ref(userStore.email)
const inputRole = ref(userStore.role)

const showSuccessAlert = ref(false)
const successMessage = ref('')
const fileInput = ref(null)

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const triggerFileInput = () => fileInput.value.click()

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => userStore.updateAvatar(e.target.result)
    reader.readAsDataURL(file)
  }
}

const handleSaveSettings = () => {
  if (!inputName.value.trim() || !inputEmail.value.trim() || !inputRole.value.trim()) return
  // Передаємо три параметри у метод оновлення
  userStore.updateProfile(inputName.value, inputEmail.value, inputRole.value)
  successMessage.value = 'Налаштування профілю успішно збережено!'
  showSuccessAlert.value = true
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 3000)
}

const backToProfile = () => {
  currentSection.value = 'profile'
  passwordError.value = ''
}

const handleChangePasswordSubmit = () => {
  passwordError.value = ''
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) return

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Нові паролі не збігаються між собою!'
    return
  }

  if (newPassword.value.length < 3) {
    passwordError.value = 'Новий пароль має бути не менше 3 символів!'
    return
  }

  const result = authStore.changePassword(userStore.email, oldPassword.value, newPassword.value)

  if (result.success) {
    notificationStore.addNotification(
      'Ви успішно змінили пароль від свого облікового запису',
      'info',
    )
    successMessage.value = 'Пароль успішно та надійно оновлено!'
    showSuccessAlert.value = true

    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    setTimeout(() => {
      showSuccessAlert.value = false
      currentSection.value = 'profile'
    }, 2000)
  } else {
    passwordError.value = result.message
  }
}

const formatLogTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
  const day = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
  return `${time} • ${day}`
}
</script>

<template>
  <div class="max-w-2xl mx-auto relative">
    <div
      v-if="showSuccessAlert"
      class="fixed top-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-600/20 z-50 animate-fade-in flex items-center gap-2 text-sm"
    >
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="currentSection === 'profile'" class="space-y-6 animate-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Налаштування</h1>
        <p class="text-sm text-slate-500 mt-1">
          Особистий профіль користувача та параметри додатка
        </p>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Профіль</h2>

        <div class="flex items-center gap-5 pb-2">
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept="image/*"
            @change="handleAvatarUpload"
          />
          <div @click="triggerFileInput" class="relative group cursor-pointer shrink-0">
            <img
              :src="userStore.avatar"
              alt="Avatar"
              class="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 group-hover:opacity-80 transition-opacity"
            />
            <div
              class="absolute inset-0 flex items-center justify-center bg-slate-950/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera class="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">{{ userStore.name }}</h3>
            <p class="text-xs text-slate-400 font-medium mt-0.5">{{ userStore.role }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >Ім'я користувача</label
            >
            <input
              v-model="inputName"
              type="text"
              class="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >Посада</label
            >
            <input
              v-model="inputRole"
              type="text"
              class="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
            />
          </div>

          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >Електронна пошта (Email)</label
            >
            <input
              v-model="inputEmail"
              type="email"
              class="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
            />
          </div>

          <div class="sm:col-span-2 pt-2">
            <div
              class="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl transition-all hover:bg-slate-100/40"
            >
              <div class="pr-4">
                <h3 class="text-sm font-bold text-slate-800 tracking-tight">
                  Зовнішні Email-сповіщення
                </h3>
                <p class="text-xs text-slate-400 mt-0.5 leading-normal">
                  Дублювати звіти про створення нових проєктів та завдань листами на поштову
                  скриньку
                </p>
              </div>

              <button
                type="button"
                @click="userStore.emailNotificationsEnabled = !userStore.emailNotificationsEnabled"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-indigo-500/20"
                :class="userStore.emailNotificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                  :class="userStore.emailNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="handleSaveSettings"
            :disabled="!inputName.trim() || !inputEmail.trim() || !inputRole.trim()"
            class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Save class="w-4 h-4" /> Зберегти зміни
          </button>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100"
      >
        <button
          @click="currentSection = 'notifications'"
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
        >
          <div class="flex items-center gap-3 text-slate-700 font-medium text-sm">
            <Bell class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            Сповіщення
            <span
              v-if="notificationStore.unreadCount > 0"
              class="ml-1 bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full ring-4 ring-indigo-50"
            >
              {{ notificationStore.unreadCount }}
            </span>
          </div>
          <ChevronRight class="w-4 h-4 text-slate-300" />
        </button>

        <button
          @click="currentSection = 'change-password'"
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
        >
          <div class="flex items-center gap-3 text-slate-700 font-medium text-sm">
            <Lock class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            Зміна паролю
          </div>
          <ChevronRight class="w-4 h-4 text-slate-300" />
        </button>
      </div>

      <div class="flex justify-start">
        <button
          @click="authStore.logout()"
          class="px-5 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut class="w-4 h-4" /> Вихід з акаунту
        </button>
      </div>
    </div>

    <div v-else-if="currentSection === 'notifications'" class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <button
          @click="currentSection = 'profile'"
          class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Назад до
          налаштувань
        </button>

        <button
          v-if="notificationStore.history.length > 0"
          @click="notificationStore.clearHistory"
          class="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" /> Очистити весь журнал
        </button>
      </div>

      <div class="mb-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Журнал активності</h1>
        <p class="text-sm text-slate-500 mt-1">
          Керуйте вашими персональними сповіщеннями та хронологією дій
        </p>
      </div>

      <div
        v-if="notificationStore.history.length > 0"
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 max-h-[520px] overflow-y-auto custom-scrollbar"
      >
        <div
          v-for="log in notificationStore.history"
          :key="log.id"
          class="p-4 flex items-start justify-between gap-4 transition-all group/log relative"
          :class="!log.isRead ? 'bg-indigo-50/25 border-l-2 border-indigo-600 p-3.5' : 'bg-white'"
        >
          <div class="flex items-start gap-3.5 flex-1 min-w-0">
            <div class="mt-0.5 relative shrink-0">
              <div class="p-1.5 rounded-lg text-slate-400 bg-slate-100 flex">
                <Bell class="w-3.5 h-3.5" :class="!log.isRead ? 'text-indigo-600' : ''" />
              </div>
              <span
                v-if="!log.isRead"
                class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white"
              ></span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium leading-relaxed pr-2 text-slate-700">
                {{ log.message }}
              </p>
              <div class="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-1.5">
                <Clock class="w-3 h-3" />
                <span>{{ formatLogTime(log.timestamp) }}</span>
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-1 shrink-0 opacity-0 group-hover/log:opacity-100 transition-opacity bg-gradient-to-l from-white via-white pl-4 z-10"
          >
            <button
              v-if="!log.isRead"
              @click="notificationStore.markAsRead(log.id)"
              class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all cursor-pointer"
              title="Позначити як прочитане"
            >
              <Check class="w-4 h-4" />
            </button>
            <button
              @click="notificationStore.deleteLog(log.id)"
              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all cursor-pointer"
              title="Видалити сповіщення"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2"
      >
        <div
          class="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"
        >
          <Bell class="w-5 h-5" />
        </div>
        <h3 class="font-bold text-slate-800 text-sm mt-1">Журнал сповіщень порожній</h3>
        <p class="text-xs text-slate-400 max-w-xs">
          Усі сповіщення успішно опрацьовані або видалені.
        </p>
      </div>
    </div>

    <div v-else-if="currentSection === 'change-password'" class="space-y-6 animate-fade-in">
      <div>
        <button
          @click="backToProfile"
          class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Назад до
          налаштувань
        </button>
      </div>

      <div class="mb-4">
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Зміна паролю</h1>
        <p class="text-sm text-slate-500 mt-1">
          Оновіть свій секретний пароль для максимального захисту облікового запису
        </p>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div
          v-if="passwordError"
          class="mb-5 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold text-center animate-fade-in"
        >
          {{ passwordError }}
        </div>

        <form @submit.prevent="handleChangePasswordSubmit" class="space-y-5">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >Поточний пароль</label
            >
            <div class="relative flex items-center">
              <input
                v-model="oldPassword"
                :type="showOldPassword ? 'text' : 'password'"
                placeholder="Введіть ваш теперішній пароль"
                required
                class="w-full bg-slate-50 border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
              />
              <button
                type="button"
                @click="showOldPassword = !showOldPassword"
                class="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <Eye v-if="!showOldPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >Новий пароль</label
            >
            <div class="relative flex items-center">
              <input
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Придумайте новий безпечний пароль"
                required
                class="w-full bg-slate-50 border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <Eye v-if="!showNewPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >Підтвердження нового паролю</label
            >
            <div class="relative flex items-center">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Повторіть новий пароль ще раз"
                required
                class="w-full bg-slate-50 border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800 font-semibold"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <Eye v-if="!showConfirmPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="!oldPassword || !newPassword || !confirmPassword"
              class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Lock class="w-4 h-4" /> Оновити пароль
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.18s ease-out forwards;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
