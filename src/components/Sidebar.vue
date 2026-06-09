<script setup>
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut } from '@lucide/vue'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { useRoute } from 'vue-router'
import { X } from '@lucide/vue' // Додаємо іконку закриття

// Приймаємо пропс для керування видимістю на мобільних
defineProps(['isOpen'])
defineEmits(['close'])

const userStore = useUserStore()
const authStore = useAuthStore()
const route = useRoute()

const menuItems = [
  { name: 'Дошка', icon: LayoutDashboard, path: '/' },
  { name: 'Мої завдання', icon: CheckSquare, path: '/tasks' },
  { name: 'Команда', icon: Users, path: '/team' },
  { name: 'Налаштування', icon: Settings, path: '/settings' },
]
</script>

<template>
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
  ></div>

  <aside
    class="fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1224] text-white flex flex-col transition-transform duration-300 transform lg:relative lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="p-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter shadow-lg shadow-indigo-600/20 text-white"
        >
          P
        </div>
        <span class="font-bold text-xl tracking-tight text-white">ProjectFlow</span>
      </div>
      <button
        @click="$emit('close')"
        class="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
      >
        <X class="w-6 h-6" />
      </button>
    </div>

    <nav class="flex-1 px-4 space-y-2 mt-4">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        @click="$emit('close')"
        class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group"
        :class="
          route.path === item.path
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        "
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
      </router-link>
    </nav>

    <div class="p-6 mt-auto border-t border-slate-800/50">
      <div class="flex items-center gap-3 p-2">
        <img
          :src="userStore.avatar"
          class="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
        />
        <div class="min-w-0">
          <p class="text-sm font-bold text-slate-200 truncate">{{ userStore.name }}</p>
          <p class="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            {{ userStore.role }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
