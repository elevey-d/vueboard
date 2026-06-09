<script setup>
import { ref, computed } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import { Calendar, Clock, CheckCircle, Inbox, X, AlignLeft, LayoutGrid } from '@lucide/vue'

const boardStore = useBoardStore()
const userStore = useUserStore()
const currentUser = computed(() => userStore.name)

const getAvatar = (name) => {
  if (name === userStore.name) return userStore.avatar
  const member = userStore.team.find((m) => m.name === name)
  return member
    ? member.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eef2ff&color=4f46e5&bold=true`
}

const currentTab = ref('active')
const isModalOpen = ref(false)
const selectedTask = ref(null)

const allUserTasks = computed(() => {
  const tasks = []
  if (!boardStore.boards || boardStore.boards.length === 0) return tasks

  boardStore.boards.forEach((board) => {
    if (board && board.columns) {
      board.columns.forEach((column) => {
        if (column && column.tasks) {
          column.tasks.forEach((task) => {
            if (task.assignee === currentUser.value) {
              tasks.push({
                ...task,
                columnTitle: column.title,
                columnId: column.id,
                boardTitle: board.title,
              })
            }
          })
        }
      })
    }
  })
  return tasks
})

const activeTasks = computed(() => allUserTasks.value.filter((task) => task.columnId !== 'done'))
const completedTasks = computed(() => allUserTasks.value.filter((task) => task.columnId === 'done'))

const displayedTasks = computed(() => {
  const baseList = currentTab.value === 'active' ? activeTasks.value : completedTasks.value
  if (!boardStore.searchQuery || !boardStore.searchQuery.trim()) return baseList

  const query = boardStore.searchQuery.toLowerCase().trim()
  return baseList.filter(
    (task) =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)),
  )
})

const openViewModal = (task) => {
  selectedTask.value = task
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
  selectedTask.value = null
}

const formatStringDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(date)
}

const isOverdue = (dateStr) => {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

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
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-0 animate-fade-in">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Мої завдання</h1>
      <p class="text-sm text-slate-400 mt-1 font-medium">
        Персональний список завдань для користувача {{ currentUser }}
      </p>
    </div>

    <div
      class="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto custom-scrollbar shrink-0"
    >
      <button
        @click="currentTab = 'active'"
        class="pb-3 text-sm font-semibold border-b-2 transition-all relative cursor-pointer whitespace-nowrap"
        :class="
          currentTab === 'active'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        "
      >
        Активні
        <span
          class="ml-1.5 px-1.5 py-0.5 text-xs rounded-md font-bold"
          :class="
            currentTab === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
          "
          >{{ activeTasks.length }}</span
        >
      </button>
      <button
        @click="currentTab = 'completed'"
        class="pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap"
        :class="
          currentTab === 'completed'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        "
      >
        Виконані
        <span
          class="ml-1.5 px-1.5 py-0.5 text-xs rounded-md font-bold"
          :class="
            currentTab === 'completed'
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-slate-100 text-slate-400'
          "
          >{{ completedTasks.length }}</span
        >
      </button>
    </div>

    <div v-if="displayedTasks.length > 0" class="space-y-3">
      <div
        v-for="task in displayedTasks"
        :key="task.id"
        @click="openViewModal(task)"
        class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-300 hover:shadow-md transition-all group cursor-pointer"
      >
        <div class="flex items-start gap-3.5 flex-1 min-w-0">
          <div class="mt-0.5 shrink-0">
            <CheckCircle v-if="task.columnId === 'done'" class="w-5 h-5 text-emerald-500" />
            <Clock v-else class="w-5 h-5 text-indigo-500" />
          </div>

          <div class="min-w-0 w-full">
            <h3
              class="font-bold text-slate-900 text-[15px] leading-snug truncate group-hover:text-indigo-600 transition-colors"
            >
              {{ task.title }}
            </h3>
            <p
              v-if="task.description"
              class="text-xs text-slate-400 line-clamp-1 mt-0.5 leading-relaxed"
            >
              {{ task.description }}
            </p>

            <div
              class="text-[11px] text-slate-400/80 mt-2 flex items-center gap-1 font-medium bg-slate-50 border border-slate-100/50 px-2 py-0.5 rounded-lg w-max max-w-full truncate"
            >
              <Clock class="w-3 h-3 text-slate-400 shrink-0" />
              <span class="truncate"
                >{{ task.boardTitle }} • Створено: {{ formatStringDate(task.createdAt) }}</span
              >
            </div>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center gap-3 sm:gap-4 sm:shrink-0 sm:justify-end pt-2.5 sm:pt-0 border-t border-dashed border-slate-100 sm:border-none"
        >
          <span
            class="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl"
          >
            {{ task.columnTitle }}
          </span>
          <span
            class="text-[11px] font-bold px-2 py-0.5 rounded-md border tracking-wide"
            :class="getPriorityClass(task.priority)"
          >
            {{ task.priority }}
          </span>
          <div
            class="text-xs flex items-center gap-1.5 font-medium sm:min-w-[95px] sm:justify-end"
            :class="
              isOverdue(task.deadline) && task.columnId !== 'done'
                ? 'text-rose-500 font-semibold'
                : 'text-slate-400'
            "
          >
            <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{{ formatStringDate(task.deadline) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto mt-8 flex flex-col items-center justify-center gap-3 animate-fade-in"
    >
      <div
        class="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"
      >
        <Inbox class="w-6 h-6" />
      </div>
      <div>
        <h3 class="font-bold text-slate-800 text-base">Список порожній</h3>
        <p class="text-sm text-slate-400 mt-1">У цій категорії наразі немає завдань.</p>
      </div>
    </div>

    <div
      v-if="isModalOpen && selectedTask"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
      @click.self="closeModal"
    >
      <div
        class="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div class="flex justify-between items-start gap-4">
          <h2 class="text-lg font-bold text-slate-900 leading-snug">{{ selectedTask.title }}</h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-5">
          <div
            class="flex items-center justify-between bg-slate-50/40 border border-slate-100/60 p-2.5 rounded-xl"
          >
            <div class="flex items-center gap-2 min-w-0">
              <LayoutGrid class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0"
                >СТАТУС:</span
              >
              <span
                class="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg truncate"
              >
                {{ selectedTask.columnTitle }}
              </span>
            </div>
            <div class="shrink-0">
              <span
                class="text-xs font-bold px-3 py-1 rounded-lg border inline-block"
                :class="getPriorityClass(selectedTask.priority)"
              >
                {{ selectedTask.priority }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
            <div class="space-y-1.5">
              <span
                class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"
                >Постановник</span
              >
              <div class="flex items-center gap-2">
                <img
                  :src="getAvatar(selectedTask.reporter)"
                  class="w-6 h-6 rounded-full object-cover ring-1 ring-slate-100"
                />
                <span class="text-sm font-medium text-slate-700 truncate">{{
                  selectedTask.reporter || 'Не вказано'
                }}</span>
              </div>
            </div>
            <div class="space-y-1.5">
              <span
                class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"
                >Виконавець</span
              >
              <div class="flex items-center gap-2">
                <img
                  :src="getAvatar(selectedTask.assignee)"
                  class="w-6 h-6 rounded-full object-cover ring-1 ring-slate-100"
                />
                <span class="text-sm font-medium text-slate-700 truncate">{{
                  selectedTask.assignee
                }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <span
              class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"
              >Опис завдання</span
            >
            <div
              class="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[60px]"
            >
              {{ selectedTask.description || 'До цього завдання немає додаткового опису.' }}
            </div>
          </div>

          <div
            class="grid grid-cols-2 gap-3 bg-slate-50/40 border border-slate-100/60 p-3 rounded-xl"
          >
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1"
                >Дата створення</span
              >
              <span class="text-xs text-slate-600 inline-flex items-center gap-1 font-medium">
                <Clock class="w-3.5 h-3.5 text-slate-400" />
                {{ formatStringDate(selectedTask.createdAt) }}
              </span>
            </div>
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1"
                >Термін дедлайну</span
              >
              <span
                class="text-xs inline-flex items-center gap-1.5 font-semibold"
                :class="
                  isOverdue(selectedTask.deadline) && selectedTask.columnId !== 'done'
                    ? 'text-rose-600'
                    : 'text-slate-700'
                "
              >
                <Calendar class="w-3.5 h-3.5 text-slate-400" />
                {{ formatStringDate(selectedTask.deadline) }}
              </span>
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
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
