<template>
  <div class="page">
    <NavBar />
    <main class="main">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">Welcome back, <strong>{{ auth.username }}</strong></p>
        </div>
        <RouterLink to="/tasks" class="btn btn-primary">View All Tasks →</RouterLink>
      </div>

      <div class="stats-grid" v-if="!store.loading">
        <div class="stat-card card">
          <div class="stat-icon total">📋</div>
          <div class="stat-value">{{ store.totalTasks }}</div>
          <div class="stat-label">Total Tasks</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon pending">⏳</div>
          <div class="stat-value amber">{{ store.pendingCount }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon progress">🔄</div>
          <div class="stat-value accent">{{ store.inProgressCount }}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon done">✅</div>
          <div class="stat-value green">{{ store.completedCount }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="progress-section card" v-if="store.totalTasks > 0">
        <div class="prog-header">
          <span class="prog-label">Overall Progress</span>
          <span class="prog-pct">{{ completionPct }}%</span>
        </div>
        <div class="prog-track">
          <div class="prog-fill" :style="{ width: completionPct + '%' }"></div>
        </div>
      </div>

      <!-- Recent tasks -->
      <section class="recent-section">
        <h2 class="section-title">Recent Tasks</h2>
        <div v-if="store.loading" class="loading-state">Loading…</div>
        <div v-else-if="recentTasks.length === 0" class="empty-state">
          <p>No tasks yet. <RouterLink to="/tasks">Create your first task →</RouterLink></p>
        </div>
        <div v-else class="tasks-grid">
          <TaskCard
            v-for="task in recentTasks"
            :key="task.id"
            :task="task"
            @edit="openEdit"
            @delete="confirmDelete"
            @complete="handleComplete"
          />
        </div>
      </section>
    </main>

    <TaskModal :show="showModal" :task="editTask" @close="showModal = false" @saved="store.fetchTasks" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useTaskStore, useAuthStore } from '../store'
import NavBar from '../components/NavBar.vue'
import TaskCard from '../components/TaskCard.vue'
import TaskModal from '../components/TaskModal.vue'

const store = useTaskStore()
const auth = useAuthStore()
const showModal = ref(false)
const editTask = ref(null)

const recentTasks = computed(() => store.tasks.slice(0, 6))
const completionPct = computed(() => {
  if (!store.totalTasks) return 0
  return Math.round((store.completedCount / store.totalTasks) * 100)
})

onMounted(() => store.fetchTasks())

function openEdit(task) { editTask.value = task; showModal.value = true }

async function confirmDelete(id) {
  if (confirm('Delete this task?')) await store.deleteTask(id)
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
  margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
}
.page-title { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
.page-sub { font-size: 14px; color: #888; margin-top: 4px; }

.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px; margin-bottom: 20px;
}
.stat-card {
  padding: 24px 20px; display: flex; flex-direction: column; gap: 8px;
}
.stat-icon { font-size: 22px; }
.stat-value { font-size: 32px; font-weight: 700; line-height: 1; }
.stat-value.amber { color: var(--amber); }
.stat-value.accent { color: var(--accent); }
.stat-value.green { color: var(--green); }
.stat-label { font-size: 13px; color: #888; }

.progress-section { padding: 20px 24px; margin-bottom: 28px; }
.prog-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.prog-label { font-size: 14px; font-weight: 500; }
.prog-pct { font-family: var(--font-mono); font-size: 14px; color: var(--accent); font-weight: 600; }
.prog-track { height: 8px; background: var(--mist-2); border-radius: 99px; overflow: hidden; }
.prog-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--green)); border-radius: 99px; transition: width .5s ease; }

.section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.loading-state, .empty-state { color: #888; padding: 24px 0; font-size: 14px; }
.empty-state a { color: var(--accent); text-decoration: none; }
</style>
