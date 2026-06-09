<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useBoardStore } from '@/stores/boardStore' // Імпортуємо boardStore для доступу до searchQuery
import { Plus, Mail, ArrowRight, Inbox } from '@lucide/vue'

const userStore = useUserStore()
const boardStore = useBoardStore()

// Розумна фільтрація команди за текстом із глобального інпуту в шапці
const filteredTeam = computed(() => {
  const query = boardStore.searchQuery.toLowerCase().trim()

  // Якщо нічого не введено — віддаємо весь склад команди
  if (!query) return userStore.team

  // Якщо є текст — шукаємо збіги в іменах або в назвах посад (ролей)
  return userStore.team.filter(
    (member) =>
      member.name.toLowerCase().includes(query) || member.role.toLowerCase().includes(query),
  )
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Команда проєкту</h1>
        <p class="text-sm text-slate-500 mt-1">Керуйте учасниками та доступами до дошки VueBoard</p>
      </div>
      <button
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-sm shadow-indigo-600/20"
      >
        <Plus class="w-4 h-4" /> Запросити учасника
      </button>
    </div>

    <div v-if="filteredTeam.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="member in filteredTeam"
        :key="member.email"
        class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all group animate-fade-in"
      >
        <img
          :src="member.avatar"
          :alt="member.name"
          class="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50"
        />
        <div class="flex-1 min-w-0">
          <h3
            class="font-bold text-slate-950 text-base truncate group-hover:text-indigo-600 transition-colors"
          >
            {{ member.name }}
          </h3>
          <p class="text-xs font-semibold text-indigo-600 mt-0.5">{{ member.role }}</p>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <Mail class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">{{ member.email }}</span>
          </div>
        </div>
        <button
          class="text-slate-300 group-hover:text-slate-500 p-2 rounded-xl hover:bg-slate-50 transition-all shrink-0"
        >
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div
      v-else
      class="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto mt-8 flex flex-col items-center justify-center gap-3 animate-fade-in"
    >
      <div
        class="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"
      >
        <Inbox class="w-6 h-6" />
      </div>
      <div>
        <h3 class="font-bold text-slate-800 text-base">Нікого не знайдено</h3>
        <p class="text-sm text-slate-400 mt-1">
          За запитом "{{ boardStore.searchQuery }}" немає збігів серед команди.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
</style>
