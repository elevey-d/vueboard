<script setup>
import { useUserStore } from '@/stores/userStore' // Імпортуємо наш стор профілю
import { LayoutDashboard, KanbanSquare, Users, Settings } from '@lucide/vue'

const userStore = useUserStore() // Ініціалізуємо
</script>

<template>
  <aside
    class="w-64 bg-slate-900 text-slate-400 flex flex-col h-full border-r border-slate-800 shrink-0"
  >
    <!-- Логотип -->
    <div class="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
      <div
        class="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30"
      >
        P
      </div>
      <span class="text-white font-bold text-lg tracking-tight">ProjectFlow</span>
    </div>

    <!-- Навігація -->
    <nav class="flex-1 px-4 py-6 space-y-1.5">
      <router-link
        to="/"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group hover:bg-slate-800 hover:text-white"
        active-class="bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
      >
        <KanbanSquare class="w-5 h-5 mr-3 transition-colors" /> Дошка
      </router-link>

      <router-link
        to="/tasks"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group hover:bg-slate-800 hover:text-white"
        active-class="bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
      >
        <LayoutDashboard class="w-5 h-5 mr-3 transition-colors" /> Мої завдання
      </router-link>

      <router-link
        to="/team"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group hover:bg-slate-800 hover:text-white"
        active-class="bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
      >
        <Users class="w-5 h-5 mr-3 transition-colors" /> Команда
      </router-link>

      <router-link
        to="/settings"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group hover:bg-slate-800 hover:text-white"
        active-class="bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
      >
        <Settings class="w-5 h-5 mr-3 transition-colors" /> Налаштування
      </router-link>
    </nav>

    <!-- ТЕПЕР ДИНАМІЧНИЙ БЛОК КОРИСТУВАЧА ВНИЗУ СУДБАРУ -->
    <div class="p-4 border-t border-slate-800 flex items-center gap-3">
      <img
        :src="userStore.avatar"
        alt="Avatar"
        class="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-800"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-white truncate">{{ userStore.name }}</p>
        <p class="text-xs text-slate-500 truncate">{{ userStore.role }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.router-link-active svg {
  color: #ffffff;
}
</style>
