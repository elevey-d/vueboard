<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Mail, Lock, Eye, EyeOff, User, ChevronLeft, CheckCircle2 } from '@lucide/vue'

const authStore = useAuthStore()

// Режими екрану: 'login' | 'register' | 'recovery' | 'recovery-success'
const mode = ref('login')

// Поля форми
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)
const acceptTerms = ref(false)

// Стан паролів та помилок
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')

const clearFields = () => {
  name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
}

const switchToMode = (newMode) => {
  mode.value = newMode
  clearFields()
}

const handleLogin = () => {
  errorMessage.value = ''
  if (!email.value || !password.value) return

  const result = authStore.login(email.value, password.value)
  if (!result.success) {
    errorMessage.value = result.message
  }
}

const handleRegister = () => {
  errorMessage.value = ''
  if (!name.value || !email.value || !password.value || !confirmPassword.value) return

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Паролі не збігаються!'
    return
  }

  if (!acceptTerms.value) {
    errorMessage.value = 'Необхідно погодитися з умовами!'
    return
  }

  const result = authStore.register(name.value, email.value, password.value)
  if (!result.success) {
    errorMessage.value = result.message
  }
}

const handleRecovery = () => {
  if (!email.value) return
  mode.value = 'recovery-success'
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex h-screen w-screen bg-white overflow-hidden select-none">
    <div
      class="hidden md:flex md:w-[42%] bg-[#0B1224] text-white p-12 flex-col justify-between relative overflow-hidden shrink-0"
    >
      <div
        class="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"
      ></div>

      <div class="flex items-center gap-3 relative z-10">
        <img
          src="@/assets/logo.png"
          alt="ProjectFlow Logo"
          class="w-10 h-10 rounded-xl object-cover shadow-md shadow-indigo-500/10 shrink-0"
        />
        <span class="font-bold text-lg tracking-tight">ProjectFlow</span>
      </div>

      <div class="space-y-4 max-w-sm my-auto relative z-10">
        <h1 class="text-3xl font-bold tracking-tight leading-tight">
          Управляйте проектами ефективно
        </h1>
        <p class="text-slate-400 text-sm leading-relaxed font-medium">
          Створюйте задачі, відстежуйте прогрес та досягайте цілей разом з командою.
        </p>
      </div>

      <div class="text-xs text-slate-500 font-medium relative z-10">
        © 2026 ProjectFlow. All rights reserved.
      </div>
    </div>

    <div
      class="flex-1 bg-white flex flex-col justify-center items-center px-6 py-12 overflow-y-auto custom-scrollbar"
    >
      <div class="w-full max-w-[400px] flex flex-col gap-6 animate-fade-in">
        <div class="flex flex-col items-center gap-2 md:hidden mb-2">
          <img
            src="@/assets/logo.png"
            alt="ProjectFlow Logo"
            class="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-indigo-500/10 shrink-0"
          />
          <span class="font-bold text-xl text-slate-900 tracking-tight">ProjectFlow</span>
        </div>

        <div
          v-if="errorMessage"
          class="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold text-center animate-shake"
        >
          {{ errorMessage }}
        </div>

        <div v-if="mode === 'login'" class="space-y-5">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Вхід до акаунту</h2>
            <p class="text-slate-400 text-xs mt-1 font-medium">
              Раді вас бачити знову! Увійдіть, щоб продовжити.
            </p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <div class="relative flex items-center">
                <Mail class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Введіть ваш email"
                  required
                  class="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">Пароль</label>
              <div class="relative flex items-center">
                <Lock class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Введіть ваш password"
                  required
                  class="w-full border border-slate-200 pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors font-medium text-slate-800"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <label class="flex items-center gap-2 text-slate-500 font-medium cursor-pointer">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-0 w-4 h-4"
                />
                <span>Запам'ятати мене</span>
              </label>
              <button
                type="button"
                @click="switchToMode('recovery')"
                class="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Забули пароль?
              </button>
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 mt-2 cursor-pointer"
            >
              Увійти
            </button>
          </form>

          <p class="text-center text-xs text-slate-400 font-medium pt-2">
            Немає акаунту?
            <button
              @click="switchToMode('register')"
              class="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Зареєструватися
            </button>
          </p>
        </div>

        <div v-if="mode === 'register'" class="space-y-5">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Створення акаунту</h2>
            <p class="text-slate-400 text-xs mt-1 font-medium">
              Розпочніть роботу з ProjectFlow вже сьогодні.
            </p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">Ім'я</label>
              <div class="relative flex items-center">
                <User class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  v-model="name"
                  type="text"
                  placeholder="Введіть ваше ім'я"
                  required
                  class="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <div class="relative flex items-center">
                <Mail class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Введіть ваш email"
                  required
                  class="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">Пароль</label>
              <div class="relative flex items-center">
                <Lock class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Створіть пароль"
                  required
                  class="w-full border border-slate-200 pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors font-medium text-slate-800"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5"
                >Підтвердіть пароль</label
              >
              <div class="relative flex items-center">
                <Lock class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Підтвердіть пароль"
                  required
                  class="w-full border border-slate-200 pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors font-medium text-slate-800"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <Eye v-if="!showConfirmPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="pt-1">
              <label
                class="flex items-start gap-2.5 text-xs text-slate-500 font-medium cursor-pointer leading-normal"
              >
                <input
                  v-model="acceptTerms"
                  type="checkbox"
                  required
                  class="rounded border-slate-300 text-indigo-600 focus:ring-0 w-4 h-4 mt-0.5 shrink-0"
                />
                <span
                  >Я погоджуюсь з
                  <span class="text-indigo-600 font-semibold hover:underline"
                    >Умовами використання</span
                  >
                  та
                  <span class="text-indigo-600 font-semibold hover:underline"
                    >Політикою конфіденційності</span
                  ></span
                >
              </label>
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 mt-2 cursor-pointer"
            >
              Зареєструватися
            </button>
          </form>

          <p class="text-center text-xs text-slate-400 font-medium pt-2">
            Вже маєте акаунт?
            <button
              @click="switchToMode('login')"
              class="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Увійти
            </button>
          </p>
        </div>

        <div v-if="mode === 'recovery'" class="space-y-5">
          <button
            @click="switchToMode('login')"
            class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer mb-2"
          >
            <ChevronLeft class="w-4 h-4" /> Повернутися до входу
          </button>

          <div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Відновлення паролю</h2>
            <p class="text-slate-400 text-xs mt-1 font-medium">
              Введіть email, і ми надішлемо вам інструкції для відновлення паролю.
            </p>
          </div>

          <form @submit.prevent="handleRecovery" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <div class="relative flex items-center">
                <Mail class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Введіть ваш email"
                  required
                  class="w-full border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 mt-2 cursor-pointer"
            >
              Надіслати інструкції
            </button>
          </form>
        </div>

        <div
          v-if="mode === 'recovery-success'"
          class="text-center space-y-6 py-6 flex flex-col items-center"
        >
          <div
            class="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center shadow-inner animate-scale-up"
          >
            <CheckCircle2 class="w-10 h-10" />
          </div>

          <div class="space-y-2">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Інструкції надіслано!</h2>
            <p class="text-slate-400 text-xs max-w-xs leading-relaxed font-medium">
              Ми відправили інструкції для відновлення вашого паролю на ваш email.
            </p>
          </div>

          <button
            @click="switchToMode('login')"
            class="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all pt-4 cursor-pointer"
          >
            Повернутися до входу
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-4px);
  }
  40%,
  80% {
    transform: translateX(4px);
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
