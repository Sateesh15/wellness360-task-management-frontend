<template>
  <div class="page">
    <NavBar />
    <main class="main">
      <div class="page-header">
        <div>
          <h1 class="page-title">Tasks</h1>
          <p class="page-sub">{{ store.totalTasks }} task{{ store.totalTasks !== 1 ? 's' : '' }} total</p>
        </div>
        <button class="btn btn-primary" @click="openCreate">+ New Task</button>
      </div>

      <!-- Filters -->
      <div class="filters card">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input v-model="search" type="text" class="input search-input" placeholder="Search tasks…" />
        </div>
        <div class="filter-tabs">
          <button
            v-for="f in filters"
            :key="f.value"
            :class="['filter-tab', { active: activeFilter === f.value }]"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
            <span class="filter-count">{{ f.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="store.loading" class="loading-state">
        <div class="spinner-lg"></div>
        <span>Loading tasks…</span>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="empty-state card">
        <div class="empty-icon">📭</div>
        <p>{{ search ? 'No tasks match your search.' : 'No tasks here yet.' }}</p>
        <button class="btn btn-primary" @click="openCreate">Create a task</button>
      </div>

      <Transition name="fade">
        <div v-if="!store.loading && filteredTasks.length > 0" class="tasks-grid">
          <TransitionGroup name="slide-up" tag="div" class="grid-inner">
            <TaskCard
              v-for="task in filteredTasks"
              :key="task.id"
              :task="task"
              @edit="openEdit"
              @delete="confirmDelete"
              @complete="handleComplete"
            />
          </TransitionGroup>
        </div>
      </Transition>
    </main>

    <TaskModal :show="showModal" :task="editTask" @close="closeModal" @saved="onSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../store'
import NavBar from '../components/NavBar.vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'

const store = useTaskStore()
const showModal = ref(false)
const editTask = ref(null)
const search = ref('')
const activeFilter = ref('all')

const filters = computed(() => [
  { value: 'all', label: 'All', count: store.totalTasks },
  { value: 'pending', label: 'Pending', count: store.pendingCount },
  { value: 'in_progress', label: 'In Progress', count: store.inProgressCount },
  { value: 'completed', label: 'Completed', count: store.completedCount }
])

const filteredTasks = computed(() => {
  let list = store.tasks
  if (activeFilter.value !== 'all') list = list.filter(t => t.status === activeFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    )
  }
  return list
})

onMounted(() => store.fetchTasks())

function openCreate() { editTask.value = null; showModal.value = true }
function openEdit(task) { editTask.value = task; showModal.value = true }
function closeModal() { showModal.value = false; editTask.value = null }
function onSaved() { store.fetchTasks() }

async function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    await store.deleteTask(id)
  }
}

async function handleComplete(id) {
  await store.markComplete(id)
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--mist); }
.main { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
}
.page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
.page-sub { font-size: 14px; color: #888; margin-top: 4px; }

.filters {
  padding: 16px 20px; display: flex; gap: 16px; align-items: center;
  margin-bottom: 24px; flex-wrap: wrap;
}
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; }
.search-input { padding-left: 36px; }

.filter-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.filter-tab {
  padding: 6px 14px; border-radius: var(--radius-sm); border: 1.5px solid var(--mist-3);
  background: transparent; font-family: var(--font-body); font-size: 13px;
  font-weight: 500; color: #666; cursor: pointer; transition: all var(--transition);
  display: flex; align-items: center; gap: 6px;
}
.filter-tab:hover { border-color: var(--accent); color: var(--accent); }
.filter-tab.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.filter-count {
  font-size: 11px; background: rgba(0,0,0,.1); padding: 1px 6px;
  border-radius: 99px; font-family: var(--font-mono);
}
.filter-tab.active .filter-count { background: rgba(255,255,255,.25); }

.loading-state { display: flex; align-items: center; gap: 12px; color: #888; padding: 40px 0; }
.spinner-lg {
  width: 20px; height: 20px; border: 2.5px solid var(--mist-3);
  border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  padding: 56px 24px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.empty-icon { font-size: 40px; }
.empty-state p { color: #888; font-size: 15px; }

.tasks-grid .grid-inner {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;
}
</style>
