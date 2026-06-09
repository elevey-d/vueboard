<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useBoardStore } from '@/stores/boardStore'
import { Mail, ChevronRight, X, LayoutGrid, Clock, Briefcase, Inbox } from '@lucide/vue'

const userStore = useUserStore()
const boardStore = useBoardStore()

// Модальний стан
const isModalOpen = ref(false)
const selectedMember = ref(null)

const openMemberModal = (member) => {
  selectedMember.value = member
  isModalOpen.value = true
}

const closeMemberModal = () => {
  isModalOpen.value = false
  selectedMember.value = null
}

// РОЗУМНИЙ СКАНЕР: Тепер збирає СТРОГО активні завдання (ігнорує колонку 'done')
const selectedMemberTasks = computed(() => {
  if (!selectedMember.value) return []
  const tasks = []
  if (!boardStore.boards || boardStore.boards.length === 0) return tasks

  boardStore.boards.forEach((board) => {
    if (board && board.columns) {
      board.columns.forEach((column) => {
        // ДОДAНО ФІЛЬТР: пропускаємо колонку "Готово" (id === 'done')
        if (column && column.id !== 'done' && column.tasks) {
          column.tasks.forEach((task) => {
            if (task.assignee === selectedMember.value.name) {
              tasks.push({
                ...task,
                boardTitle: board.title,
                columnTitle: column.title,
                columnId: column.id,
              })
            }
          })
        }
      })
    }
  })
  return tasks
})

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'Високий':
      return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'Середній':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'Низький':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100'
  }
}

const formatStringDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(date)
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-0 animate-fade-in">
    <div class="mb-8 shrink-0 w-full">
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Команда проєкту</h1>
      <p class="text-sm text-slate-400 mt-1 font-medium leading-relaxed">
        Повний список учасників простору та моніторинг їхньої поточної завантаженості
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3.5">
      <div
        v-for="member in userStore.team"
        :key="member.email"
        @click="openMemberModal(member)"
        class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4 hover:border-slate-300 hover:shadow-md transition-all duration-150 group cursor-pointer"
      >
        <div class="flex items-center gap-4 min-w-0">
          <img
            :src="member.avatar"
            alt="Team Member"
            class="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100/80 shadow-2xs shrink-0 bg-slate-50"
          />

          <div class="min-w-0">
            <h3 class="font-bold text-slate-900 text-[15px] leading-snug truncate">
              {{ member.name }}
            </h3>
            <p class="text-xs text-indigo-600 font-bold mt-0.5 tracking-wide truncate">
              {{ member.role }}
            </p>
            <div
              class="text-[11px] text-slate-400/90 font-medium mt-1.5 flex items-center gap-1.5 truncate"
            >
              <Mail class="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span class="truncate">{{ member.email }}</span>
            </div>
          </div>
        </div>

        <div class="shrink-0 p-1">
          <ChevronRight
            class="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all duration-150"
          />
        </div>
      </div>
    </div>

    <div
      v-if="isModalOpen && selectedMember"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
      @click.self="closeMemberModal"
    >
      <div
        class="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl p-6 pb-7 flex flex-col gap-5 max-h-[90vh] overflow-hidden animate-scale-up relative"
      >
        <button
          @click="closeMemberModal"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors shrink-0 cursor-pointer z-10"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-4 pb-4 border-b border-slate-100 mt-2">
          <img
            :src="selectedMember.avatar"
            class="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 shadow-sm"
          />
          <div class="min-w-0">
            <h2 class="text-lg font-bold text-slate-900 leading-tight tracking-tight truncate">
              {{ selectedMember.name }}
            </h2>
            <p class="text-xs text-indigo-600 font-bold mt-0.5">{{ selectedMember.role }}</p>
            <div class="text-xs text-slate-400 font-medium mt-1.5 flex items-center gap-1.5">
              <Mail class="w-3.5 h-3.5 text-slate-300" />
              <span>{{ selectedMember.email }}</span>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0">
          <span
            class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3"
          >
            <Briefcase class="w-3.5 h-3.5 text-slate-400" /> Активні завдання учасника ({{
              selectedMemberTasks.length
            }})
          </span>

          <div
            v-if="selectedMemberTasks.length === 0"
            class="flex-1 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2"
          >
            <div
              class="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"
            >
              <Inbox class="w-4 h-4" />
            </div>
            <p class="text-xs font-bold text-slate-700">Немає активних завдань</p>
            <p class="text-[11px] text-slate-400 max-w-[240px]">
              Цей розробник виконав усі поточні таски або ще не отримав нових.
            </p>
          </div>

          <div v-else class="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar max-h-[45vh]">
            <div
              v-for="task in selectedMemberTasks"
              :key="task.id"
              class="bg-white p-3.5 border border-slate-100 shadow-2xs rounded-xl flex flex-col gap-2"
            >
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-xs font-bold text-slate-800 leading-snug truncate flex-1">
                  {{ task.title }}
                </h4>
                <span
                  class="text-[9px] font-bold px-2 py-0.5 rounded-md border tracking-wide shrink-0"
                  :class="getPriorityClass(task.priority)"
                >
                  {{ task.priority }}
                </span>
              </div>

              <div
                class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-medium"
              >
                <div
                  class="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md truncate max-w-[180px]"
                >
                  <LayoutGrid class="w-3 h-3 text-slate-400 shrink-0" />
                  <span class="truncate">{{ task.columnTitle }}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <Clock class="w-3 h-3 text-indigo-400" />
                  <span>Дедлайн: {{ formatStringDate(task.deadline) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
.animate-scale-up {
  animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
