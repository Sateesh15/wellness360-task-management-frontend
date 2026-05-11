<template>
  <div :class="['task-card card', { completed: task.status === 'completed' }]">
    <div class="task-top">
      <span :class="['badge', `badge-${task.status}`]">
        {{ statusLabel }}
      </span>
      <span v-if="task.dueDate" :class="['due-date', { overdue: isOverdue }]">
        {{ isOverdue ? '⚠ ' : '📅 ' }}{{ formatDate(task.dueDate) }}
      </span>
    </div>

    <h3 class="task-title">{{ task.title }}</h3>

    <p v-if="task.description" class="task-desc">{{ task.description }}</p>

    <div class="task-meta">
      <span class="meta-time">Created {{ timeAgo(task.createdAt) }}</span>
    </div>

    <div class="task-actions">
      <button
        v-if="task.status !== 'completed'"
        class="btn btn-ghost btn-sm action-complete"
        @click="$emit('complete', task.id)"
        title="Mark complete"
      >✓ Complete</button>
      <button class="btn btn-ghost btn-sm" @click="$emit('edit', task)" title="Edit">✎ Edit</button>
      <button class="btn btn-danger btn-sm" @click="$emit('delete', task.id)" title="Delete">✕</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ task: Object })
defineEmits(['edit', 'delete', 'complete'])

const statusLabel = computed(() => ({
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed'
}[props.task.status] || props.task.status))

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'completed') return false
  return new Date(props.task.dueDate) < new Date()
})

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
</script>

<style scoped>
.task-card {
  padding: 20px; display: flex; flex-direction: column; gap: 10px;
  transition: all var(--transition);
}
.task-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.task-card.completed { opacity: .7; }

.task-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.due-date { font-size: 12px; color: #888; }
.due-date.overdue { color: var(--red); font-weight: 500; }

.task-title { font-size: 15px; font-weight: 600; line-height: 1.4; }
.task-card.completed .task-title { text-decoration: line-through; color: #999; }

.task-desc {
  font-size: 13px; color: #666; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.task-meta { font-size: 11.5px; color: #bbb; font-family: var(--font-mono); }

.task-actions { display: flex; gap: 6px; margin-top: 4px; }
.action-complete { color: var(--green) !important; border-color: var(--green-soft) !important; }
.action-complete:hover { background: var(--green-soft) !important; }
</style>
