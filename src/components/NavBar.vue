<template>
  <nav class="navbar">
    <div class="nav-inner">
      <RouterLink to="/dashboard" class="nav-logo">
        <span class="logo-icon">✦</span>
        <span>TaskFlow</span>
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
        <RouterLink to="/tasks" class="nav-link">Tasks</RouterLink>
      </div>

      <div class="nav-user">
        <span class="user-chip">{{ auth.username }}</span>
        <button class="btn btn-ghost btn-sm" @click="handleLogout">Sign out</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../store'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: #fff; border-bottom: 1px solid var(--mist-3);
  position: sticky; top: 0; z-index: 100;
}
.nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
  height: 60px; display: flex; align-items: center; gap: 32px;
}
.nav-logo {
  display: flex; align-items: center; gap: 7px;
  font-weight: 700; font-size: 17px; text-decoration: none;
  color: var(--ink); letter-spacing: -0.3px;
}
.logo-icon { color: var(--accent); }
.nav-links { display: flex; gap: 4px; flex: 1; }
.nav-link {
  padding: 6px 14px; border-radius: var(--radius-sm); text-decoration: none;
  font-size: 14px; font-weight: 500; color: #666;
  transition: all var(--transition);
}
.nav-link:hover { color: var(--ink); background: var(--mist); }
.nav-link.router-link-active { color: var(--accent); background: var(--accent-soft); }
.nav-user { display: flex; align-items: center; gap: 10px; }
.user-chip {
  font-size: 13px; font-weight: 500; color: #555;
  background: var(--mist-2); padding: 4px 10px; border-radius: 99px;
}
</style>
