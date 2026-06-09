<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import Sidebar from '@/components/Sidebar.vue'
import { Bell, Mail, Clock, Check, Eye, BellOff } from '@lucide/vue'

const boardStore = useBoardStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const route = useRoute()

// Стан відкриття випадаючого вікна сповіщень
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

watch(
  () => route.path,
  () => {
    boardStore.searchQuery = ''
  },
)

const formatMinLogTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="route.path === '/auth'">
    <router-view />
  </div>

  <div
    v-else
    class="flex h-screen w-screen overflow-hidden bg-slate-50/50 font-sans antialiased relative"
  >
    <div class="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      <div
        v-for="toast in notificationStore.toasts"
        :key="toast.id"
        class="pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3 border border-slate-800 animate-slide-in"
      >
        <div class="p-1 bg-indigo-500/20 text-indigo-400 rounded-lg mt-0.5 shrink-0">
          <Mail class="w-4 h-4" />
        </div>
        <div class="text-xs font-semibold leading-relaxed tracking-wide text-slate-200">
          {{ toast.message }}
        </div>
      </div>
    </div>

    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header
        class="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0"
      >
        <div class="w-full max-w-xs">
          <input
            v-if="route.name !== 'settings'"
            v-model="boardStore.searchQuery"
            type="text"
            :placeholder="route.name === 'team' ? 'Пошук учасників...' : 'Швидкий пошук...'"
            class="w-full bg-slate-100 border border-transparent px-4 py-2 rounded-xl text-sm outline-none focus:bg-white focus:border-slate-200 transition-all font-medium text-slate-700"
          />
        </div>

        <div class="flex items-center gap-4 relative">
          <div class="relative">
            <button
              @click.stop="toggleDropdown"
              class="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              :class="isDropdownOpen ? 'bg-slate-50 text-indigo-600' : ''"
            >
              <Bell class="w-5 h-5 transition-colors" />
              <span
                v-if="notificationStore.unreadCount > 0"
                class="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse"
              ></span>
            </button>

            <div
              v-if="isDropdownOpen"
              @click.stop
              class="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-2xl z-50 overflow-hidden animate-dropdown-in"
            >
              <div
                class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"
              >
                <span class="font-bold text-xs uppercase tracking-wider text-slate-500"
                  >Сповіщення</span
                >
                <button
                  v-if="notificationStore.unreadCount > 0"
                  @click="notificationStore.markAllAsRead"
                  class="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  Прочитати всі
                </button>
              </div>

              <div
                v-if="notificationStore.history.length > 0"
                class="divide-y divide-slate-100 max-h-[320px] overflow-y-auto custom-scrollbar"
              >
                <div
                  v-for="log in notificationStore.history.slice(0, 4)"
                  :key="log.id"
                  class="p-3.5 flex items-start justify-between gap-3 transition-colors relative group/item"
                  :class="!log.isRead ? 'bg-indigo-50/15' : 'bg-white'"
                >
                  <div class="flex items-start gap-2.5 flex-1 min-w-0">
                    <span
                      v-if="!log.isRead"
                      class="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0"
                    ></span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-slate-700 leading-normal line-clamp-2">
                        {{ log.message }}
                      </p>
                      <span
                        class="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1"
                        ><Clock class="w-2.5 h-2.5" /> {{ formatMinLogTime(log.timestamp) }}</span
                      >
                    </div>
                  </div>
                  <button
                    v-if="!log.isRead"
                    @click="notificationStore.markAsRead(log.id)"
                    class="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all cursor-pointer shrink-0"
                    title="Прочитано"
                  >
                    <Check class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                v-else
                class="py-8 px-4 text-center flex flex-col items-center justify-center gap-2"
              >
                <div
                  class="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center"
                >
                  <BellOff class="w-4 h-4" />
                </div>
                <p class="text-xs text-slate-400 font-medium">Нових сповіщень немає</p>
              </div>

              <router-link
                to="/settings?section=notifications"
                @click="closeDropdown"
                class="block text-center py-3 bg-slate-50 border-t border-slate-100 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer group"
              >
                <span class="inline-flex items-center gap-1"
                  >Переглянути всі
                  <Eye
                    class="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors"
                /></span>
              </router-link>
            </div>
          </div>

          <router-link
            to="/settings"
            class="shrink-0 block rounded-xl hover:opacity-85 active:scale-95 transition-all cursor-pointer group"
            title="Налаштування профілю"
          >
            <img
              :src="userStore.avatar"
              alt="User Avatar"
              class="w-8 h-8 rounded-xl object-cover ring-2 ring-white group-hover:ring-indigo-500/50 transition-all"
            />
          </router-link>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-slide-in {
  animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-dropdown-in {
  animation: dropdownIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
