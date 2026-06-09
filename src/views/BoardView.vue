<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBoardStore } from '@/stores/boardStore'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import draggable from 'vuedraggable'
import {
  Plus,
  MoreVertical,
  Trash2,
  Calendar,
  Clock,
  Edit2,
  Check,
  X,
  KanbanSquare,
  LayoutGrid,
  AlignLeft,
  ChevronDown,
  FolderPlus,
  PlusCircle,
} from '@lucide/vue'

const boardStore = useBoardStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// Стан для редагування назви дошки
const isEditingBoardTitle = ref(false)
const editedBoardTitle = ref('')

const startEditingTitle = (currentTitle) => {
  editedBoardTitle.value = currentTitle
  isEditingBoardTitle.value = true
}

const saveBoardTitle = () => {
  if (editedBoardTitle.value.trim() && boardStore.activeBoardId) {
    boardStore.updateBoardTitle(boardStore.activeBoardId, editedBoardTitle.value)
    isEditingBoardTitle.value = false
  }
}

// Поточна відкрита дошка
const currentBoard = computed(() => {
  return boardStore.boards.find((b) => b.id === boardStore.activeBoardId)
})

// Управління списками випадаючих меню дій колонок
const activeMenuColumnId = ref(null)
const toggleMenu = (columnId) => {
  activeMenuColumnId.value = activeMenuColumnId.value === columnId ? null : columnId
}

// Функція автоматичного закриття меню трикрапки при кліку на пусте поле
const closeDropdownMenu = () => {
  activeMenuColumnId.value = null
}

onMounted(() => {
  window.addEventListener('click', closeDropdownMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdownMenu)
})

// Методи обробники для повної сумісності з форматуванням Prettier
const handleSortColumn = (type, columnId) => {
  if (type === 'priority') boardStore.sortColumnByPriority(columnId)
  if (type === 'deadline') boardStore.sortColumnByDeadline(columnId)
  if (type === 'createdAt') boardStore.sortColumnByCreatedAt(columnId)
  activeMenuColumnId.value = null
}

const handleClearColumn = (columnId) => {
  boardStore.clearColumn(columnId)
  activeMenuColumnId.value = null
}

// Перехоплення drag-and-drop переміщень для журналу сповіщень
const handleDragChange = (event, columnTitle) => {
  if (event.added) {
    const task = event.added.element
    notificationStore.addNotification(
      `🔄 Перетягування: Завдання "${task.title}" переміщено в статус "${columnTitle}"`,
      'info',
    )
  }
}

// Стан вікна створення нової дошки
const isNewBoardModalOpen = ref(false)
const newBoardName = ref('')

const handleCreateBoard = () => {
  if (newBoardName.value.trim()) {
    boardStore.addBoard(newBoardName.value)
    newBoardName.value = ''
    isNewBoardModalOpen.value = false
  }
}

// Стан та змінні модального вікна завдань
const isModalOpen = ref(false)
const modalMode = ref('create') // 'create' | 'edit' | 'view'

const targetColumnId = ref('')
const currentTaskId = ref('')

const taskTitle = ref('')
const taskDescription = ref('')
const taskPriority = ref('Низький')
const taskDeadline = ref('')
const taskAssignee = ref('')
const taskReporter = ref('')

const openCreateModal = (columnId = 'todo') => {
  modalMode.value = 'create'
  targetColumnId.value = columnId
  taskTitle.value = ''
  taskDescription.value = ''
  taskPriority.value = 'Низький'
  taskDeadline.value = new Date().toISOString().split('T')[0]
  taskAssignee.value = userStore.name
  taskReporter.value = userStore.name
  isModalOpen.value = true
}

const openViewModal = (columnId, task) => {
  modalMode.value = 'view'
  targetColumnId.value = columnId
  currentTaskId.value = task.id
  taskTitle.value = task.title
  taskDescription.value = task.description
  taskPriority.value = task.priority
  taskDeadline.value = task.deadline
  taskAssignee.value = task.assignee || userStore.name
  taskReporter.value = task.reporter || userStore.name
  isModalOpen.value = true
}

const switchToEditMode = () => {
  modalMode.value = 'edit'
}

const handleSaveTask = () => {
  if (!taskTitle.value.trim()) return

  const taskData = {
    title: taskTitle.value,
    description: taskDescription.value,
    priority: taskPriority.value,
    deadline: taskDeadline.value,
    assignee: taskAssignee.value,
    reporter: taskReporter.value,
    columnId: targetColumnId.value,
  }

  if (modalMode.value === 'create') {
    boardStore.addTask(targetColumnId.value, taskData)
  } else {
    boardStore.updateTask(currentTaskId.value, taskData)
  }
  isModalOpen.value = false
}

const handleDeleteTask = () => {
  boardStore.deleteTask(currentTaskId.value)
  isModalOpen.value = false
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'Високий':
      return 'bg-rose-50 text-rose-500 border-rose-100'
    case 'Середній':
      return 'bg-amber-50 text-amber-500 border-amber-100'
    case 'Низький':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200'
  }
}

const getDateColorClass = (priority) => {
  return priority === 'Низький' ? 'text-slate-400 font-medium' : 'text-rose-500 font-semibold'
}

const getAvatar = (name) => {
  const member = userStore.team.find((m) => m.name === name)
  return member
    ? member.avatar
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'
}

const formatStringDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }).replace(' р.', '')
}
</script>

<template>
  <div class="h-full flex flex-col w-full min-w-0 overflow-hidden">
    <div
      v-if="boardStore.boards.length === 0"
      class="flex-1 flex flex-col items-center justify-center py-16 animate-fade-in"
    >
      <div
        class="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-200/40"
      >
        <KanbanSquare class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold text-slate-900 tracking-tight">Робочий простір порожній</h2>
      <p class="text-sm text-slate-400 mt-1 max-w-sm text-center leading-normal">
        Ви видалили всі робочі дошки. Створіть новий проєкт, щоб розпочати планування завдань.
      </p>
      <button
        @click="isNewBoardModalOpen = true"
        class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
      >
        <Plus class="w-4 h-4" /> Створити першу дошку
      </button>
    </div>

    <div v-else class="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0 w-full"
      >
        <div class="flex-wrap flex items-center gap-3 min-w-0">
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight shrink-0">Дошка проєкту</h1>

          <div v-if="isEditingBoardTitle" class="flex items-center gap-1.5">
            <input
              v-model="editedBoardTitle"
              type="text"
              @keyup.enter="saveBoardTitle"
              class="bg-white border border-indigo-500 px-3 py-1 rounded-lg text-sm font-semibold text-slate-700 outline-none shadow-xs"
              autofocus
            />
            <button
              @click="saveBoardTitle"
              class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Check class="w-3.5 h-3.5" />
            </button>
            <button
              @click="isEditingBoardTitle = false"
              class="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            v-else
            @click="startEditingTitle(currentBoard?.title)"
            class="bg-slate-100 text-slate-500 font-semibold text-xs px-3 py-1.5 rounded-xl border border-slate-200/40 cursor-pointer hover:bg-slate-200/60 transition-colors flex items-center gap-1"
          >
            <span>{{ currentBoard?.title }}</span>
            <Edit2 class="w-2.5 h-2.5 text-slate-400" />
          </div>

          <select
            v-model="boardStore.activeBoardId"
            class="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-semibold text-slate-400 outline-none focus:border-slate-300 transition-all cursor-pointer"
          >
            <option v-for="b in boardStore.boards" :key="b.id" :value="b.id">{{ b.title }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <button
            @click="isNewBoardModalOpen = true"
            class="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Plus class="w-4 h-4" /><span class="hidden xs:inline">Нова дошка</span>
          </button>

          <button
            @click="openCreateModal('todo')"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus class="w-4 h-4" /> <span class="hidden xs:inline">Додати завдання</span>
          </button>

          <button
            @click="boardStore.deleteBoard(boardStore.activeBoardId)"
            class="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-slate-400 border border-transparent px-3 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
            title="Видалити цю дошку"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div class="flex-1 w-full overflow-x-auto custom-scrollbar">
        <div class="flex gap-6 pb-4 items-start pr-4">
          <div
            v-for="column in boardStore.columns"
            :key="column.id"
            class="w-72 max-h-full bg-slate-100/70 border border-slate-200/50 rounded-2xl p-4 flex flex-col shrink-0"
          >
            <div class="flex justify-between items-center mb-4 shrink-0 px-1">
              <div class="flex items-center gap-2">
                <h2 class="font-bold text-slate-800 text-sm tracking-tight">{{ column.title }}</h2>
                <span
                  class="bg-slate-200 text-slate-600 font-bold text-xs px-2 py-0.5 rounded-full"
                >
                  {{ column.tasks.length }}
                </span>
              </div>

              <div class="flex items-center gap-1">
                <button
                  @click="openCreateModal(column.id)"
                  class="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-200/40 transition-colors cursor-pointer"
                >
                  <Plus class="w-4 h-4" />
                </button>

                <div class="relative">
                  <button
                    @click.stop="toggleMenu(column.id)"
                    class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/40 transition-colors cursor-pointer"
                  >
                    <MoreVertical class="w-4 h-4" />
                  </button>

                  <div
                    v-if="activeMenuColumnId === column.id"
                    @click.stop
                    class="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 font-medium text-xs"
                  >
                    <button
                      @click="handleSortColumn('priority', column.id)"
                      class="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-600"
                    >
                      Сортувати за пріоритетом
                    </button>
                    <button
                      @click="handleSortColumn('deadline', column.id)"
                      class="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-600"
                    >
                      Сортувати за дедлайном
                    </button>
                    <button
                      @click="handleSortColumn('createdAt', column.id)"
                      class="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-600"
                    >
                      Сортувати за новістю
                    </button>
                    <hr class="border-slate-100 my-1" />
                    <button
                      @click="handleClearColumn(column.id)"
                      class="w-full px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-rose-600"
                    >
                      Очистити колонку
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <draggable
              v-model="column.tasks"
              group="tasks"
              item-key="id"
              class="flex-1 overflow-y-auto space-y-3 pr-0.5 custom-scrollbar min-h-[150px]"
              ghost-class="opacity-40"
              drag-class="rotate-2"
              :animation="200"
              @change="handleDragChange($event, column.title)"
            >
              <template #item="{ element: task }">
                <div
                  v-show="
                    task.title.toLowerCase().includes(boardStore.searchQuery.toLowerCase()) ||
                    (task.description &&
                      task.description.toLowerCase().includes(boardStore.searchQuery.toLowerCase()))
                  "
                  @click="openViewModal(column.id, task)"
                  class="bg-white p-4 rounded-xl shadow-xs border border-slate-100/60 flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-all duration-150"
                >
                  <h3 class="font-medium text-slate-900 text-sm leading-snug">
                    {{ task.title }}
                  </h3>
                  <p
                    v-if="task.description"
                    class="text-xs text-slate-400 line-clamp-2 leading-relaxed"
                  >
                    {{ task.description }}
                  </p>

                  <div class="flex flex-col gap-1 mt-1 pt-2 border-t border-slate-50">
                    <div
                      v-if="task.createdAt"
                      class="flex items-center gap-1 text-[10px] text-slate-400 font-medium"
                    >
                      <Clock class="w-3 h-3 text-slate-300" />
                      <span>Створено: {{ formatStringDate(task.createdAt) }}</span>
                    </div>

                    <div class="flex justify-between items-center mt-1">
                      <div class="flex items-center gap-2">
                        <span
                          :class="getPriorityClass(task.priority)"
                          class="text-[10px] font-bold px-2 py-0.5 rounded-lg border"
                        >
                          {{ task.priority }}
                        </span>
                        <div
                          class="flex items-center gap-1 text-[11px]"
                          :class="getDateColorClass(task.priority)"
                        >
                          <Calendar class="w-3 h-3 text-slate-300" />
                          <span>{{ formatStringDate(task.deadline) }}</span>
                        </div>
                      </div>
                      <img
                        :src="getAvatar(task.assignee)"
                        alt="Avatar"
                        class="w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isNewBoardModalOpen"
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in"
      @click="isNewBoardModalOpen = false"
    >
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm mx-4 animate-scale-up"
        @click.stop
      >
        <h2 class="text-base font-bold text-slate-900 mb-4">Створення нового проєкту</h2>
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >Назва дошки</label
            >
            <input
              v-model="newBoardName"
              type="text"
              placeholder="Наприклад, Маркетинг..."
              class="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all text-slate-800 font-medium"
              @keyup.enter="handleCreateBoard"
            />
          </div>
          <div class="flex justify-end gap-2.5 pt-2">
            <button
              @click="isNewBoardModalOpen = false"
              class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-500 transition-colors cursor-pointer"
            >
              Скасувати
            </button>
            <button
              @click="handleCreateBoard"
              :disabled="!newBoardName.trim()"
              class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Створити
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isModalOpen && modalMode === 'view'"
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in"
      @click="isModalOpen = false"
    >
      <div
        class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl relative animate-scale-up flex flex-col gap-5"
        @click.stop
      >
        <div class="flex justify-between items-start gap-4">
          <h2 class="text-xl font-bold text-slate-900 leading-tight tracking-tight">
            {{ taskTitle }}
          </h2>
          <button
            @click="isModalOpen = false"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div
          class="flex items-center justify-between bg-slate-50/40 p-1.5 rounded-xl border border-slate-100"
        >
          <div
            class="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100/80 px-2.5 py-1.5 rounded-lg"
          >
            <LayoutGrid class="w-3.5 h-3.5 text-slate-400" />
            <span>СТАТУС:</span>
            <span class="text-slate-600 font-semibold ml-0.5">
              {{ boardStore.columns.find((c) => c.id === targetColumnId)?.title }}
            </span>
          </div>
          <span
            :class="getPriorityClass(taskPriority)"
            class="text-xs font-bold px-3 py-1 rounded-lg border"
          >
            {{ taskPriority }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 pb-1">
          <div>
            <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
              >Постановник</span
            >
            <div class="flex items-center gap-2.5">
              <img
                :src="getAvatar(taskReporter)"
                class="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
              />
              <span class="text-sm font-semibold text-slate-700 truncate">{{ taskReporter }}</span>
            </div>
          </div>
          <div>
            <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
              >Виконавець</span
            >
            <div class="flex items-center gap-2.5">
              <img
                :src="getAvatar(taskAssignee)"
                class="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
              />
              <span class="text-sm font-semibold text-slate-700 truncate">{{ taskAssignee }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <span
            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"
          >
            <AlignLeft class="w-3.5 h-3.5" /> Опис завдання
          </span>
          <div
            class="bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl text-sm text-slate-600 leading-relaxed min-h-[60px]"
          >
            {{ taskDescription || 'Опис відсутній...' }}
          </div>
        </div>

        <div
          class="bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between"
        >
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >Термін дедлайну</span
          >
          <div class="flex items-center gap-1.5 text-rose-500 font-bold text-sm">
            <Calendar class="w-4 h-4 text-rose-400" />
            <span>{{ formatStringDate(taskDeadline) }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
          <button
            @click="handleDeleteTask"
            class="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 class="w-4 h-4" /> Видалити
          </button>

          <button
            @click="switchToEditMode"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Edit2 class="w-3.5 h-3.5" /> Редагувати
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isModalOpen && (modalMode === 'create' || modalMode === 'edit')"
      class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in"
      @click="isModalOpen = false"
    >
      <div
        class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl relative animate-scale-up"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-slate-900">
            {{ modalMode === 'create' ? 'Створити завдання' : 'Редагування завдання' }}
          </h2>
          <button
            @click="isModalOpen = false"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Назва</label>
            <input
              v-model="taskTitle"
              type="text"
              placeholder="Назва завдання"
              class="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1">Опис</label>
            <textarea
              v-model="taskDescription"
              placeholder="Опис завдання"
              class="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500 h-24 resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Пріоритет</label>
              <select
                v-model="taskPriority"
                class="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Низький">Низький</option>
                <option value="Середній">Середній</option>
                <option value="Високий">Високий</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Дедлайн</label>
              <input
                v-model="taskDeadline"
                type="date"
                class="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Виконавець</label>
              <select
                v-model="taskAssignee"
                class="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option v-for="member in userStore.team" :key="member.name" :value="member.name">
                  {{ member.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1">Постановник</label>
              <select
                v-model="taskReporter"
                class="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option v-for="member in userStore.team" :key="member.name" :value="member.name">
                  {{ member.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-50">
            <button
              @click="isModalOpen = false"
              class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
            >
              Скасувати
            </button>
            <button
              @click="handleSaveTask"
              :disabled="!taskTitle.trim()"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              Зберегти
            </button>
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
    transform: scale(0.96);
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
  animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
