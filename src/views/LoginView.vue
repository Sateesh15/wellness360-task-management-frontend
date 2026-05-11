<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <div class="logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">TaskFlow</span>
        </div>
        <p class="auth-sub">Wellness360 Task Management</p>
      </div>

      <div class="tabs">
        <button :class="['tab', { active: mode === 'login' }]" @click="mode = 'login'">Sign In</button>
        <button :class="['tab', { active: mode === 'register' }]" @click="mode = 'register'">Register</button>
      </div>

      <form @submit.prevent="submit" class="auth-form">
        <div class="field">
          <label>Username</label>
          <input v-model="form.username" type="text" class="input" placeholder="e.g. admin" required autocomplete="username" />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="form.password" type="password" class="input" placeholder="••••••••" required autocomplete="current-password" />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account') }}
        </button>
      </form>

      <p class="auth-hint">
        Demo credentials: <code>admin</code> / <code>password123</code>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const loading = ref(false)
const error = ref('')
const form = ref({ username: '', password: '' })

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(form.value)
    } else {
      await auth.register(form.value)
    }
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f4f0 0%, #eae8ff 100%);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}

.auth-header { text-align: center; margin-bottom: 28px; }

.logo {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-bottom: 6px;
}
.logo-icon { font-size: 22px; color: var(--accent); }
.logo-text { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
.auth-sub { font-size: 13px; color: #888; }

.tabs {
  display: flex; border: 1.5px solid var(--mist-3); border-radius: var(--radius-sm);
  margin-bottom: 24px; padding: 3px; gap: 3px;
}
.tab {
  flex: 1; padding: 8px; border-radius: 6px; border: none;
  background: transparent; font-family: var(--font-body); font-size: 14px;
  font-weight: 500; cursor: pointer; color: #888; transition: all var(--transition);
}
.tab.active { background: var(--accent); color: #fff; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 500; color: #555; }

.submit-btn { width: 100%; padding: 12px; margin-top: 4px; font-size: 15px; }

.error-msg {
  padding: 10px 14px; background: var(--red-soft); color: var(--red);
  border-radius: var(--radius-sm); font-size: 13px;
}

.auth-hint {
  text-align: center; margin-top: 20px; font-size: 12.5px; color: #999;
}
.auth-hint code {
  font-family: var(--font-mono); background: var(--mist-2);
  padding: 1px 5px; border-radius: 4px; color: var(--accent);
}

.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  display: inline-block; animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
