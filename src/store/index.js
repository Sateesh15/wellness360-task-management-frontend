import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService, authService } from '../services/api'

// ── Auth Store ────────────────────────────────────────────────────────────────
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('jwt_token'))
  const username = ref(localStorage.getItem('username'))

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(data) {
    token.value = data.token
    username.value = data.username
    localStorage.setItem('jwt_token', data.token)
    localStorage.setItem('username', data.username)
  }

  function logout() {
    token.value = null
    username.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('username')
  }

  async function login(credentials) {
    const res = await authService.login(credentials)
    setAuth(res.data.data)
  }

  async function register(data) {
    const res = await authService.register(data)
    setAuth(res.data.data)
  }

  return { token, username, isLoggedIn, login, register, logout }
})

// ── Task Store ────────────────────────────────────────────────────────────────
export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalTasks = computed(() => tasks.value.length)
  const pendingCount = computed(() => tasks.value.filter(t => t.status === 'pending').length)
  const inProgressCount = computed(() => tasks.value.filter(t => t.status === 'in_progress').length)
  const completedCount = computed(() => tasks.value.filter(t => t.status === 'completed').length)

  async function fetchTasks() {
    loading.value = true
    error.value = null
    try {
      const res = await taskService.getAll()
      tasks.value = res.data.data
    } catch (e) {
      error.value = getError(e)
    } finally {
      loading.value = false
    }
  }

  async function createTask(data) {
    const res = await taskService.create(data)
    tasks.value.unshift(res.data.data)
    return res.data.data
  }

  async function updateTask(id, data) {
    const res = await taskService.update(id, data)
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = res.data.data
    return res.data.data
  }

  async function deleteTask(id) {
    await taskService.delete(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  async function markComplete(id) {
    const res = await taskService.markComplete(id)
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = res.data.data
    return res.data.data
  }

  function getError(e) {
    return e.response?.data?.message || e.message || 'An error occurred'
  }

  return {
    tasks, loading, error,
    totalTasks, pendingCount, inProgressCount, completedCount,
    fetchTasks, createTask, updateTask, deleteTask, markComplete
  }
})
