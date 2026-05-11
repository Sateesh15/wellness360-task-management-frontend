<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="overlay" @click.self="$emit('close')">
        <Transition name="slide-up">
          <div v-if="show" class="modal card">
            <div class="modal-header">
              <h2>{{ isEdit ? 'Edit Task' : 'New Task' }}</h2>
              <button class="close-btn" @click="$emit('close')">✕</button>
            </div>

            <form @submit.prevent="submit" class="modal-form">
              <div class="field">
                <label>Title <span class="required">*</span></label>
                <input v-model="form.title" type="text" class="input" placeholder="What needs to be done?" required maxlength="200" />
                <span class="char-count">{{ form.title.length }}/200</span>
              </div>

              <div class="field">
                <label>Description</label>
                <textarea v-model="form.description" class="input textarea" placeholder="Add details…" maxlength="1000" rows="3"></textarea>
                <span class="char-count">{{ (form.description || '').length }}/1000</span>
              </div>

              <div class="field-row">
                <div class="field">
                  <label>Due Date</label>
                  <input v-model="form.dueDate" type="date" class="input" :min="today" />
                </div>
                <div class="field" v-if="isEdit">
                  <label>Status</label>
                  <select v-model="form.status" class="input">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div v-if="error" class="error-msg">{{ error }}</div>

              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="$emit('close')">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner"></span>
                  {{ loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Task') }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../store'

const props = defineProps({
  show: Boolean,
  task: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])
const store = useTaskStore()

const isEdit = computed(() => !!props.task)
const loading = ref(false)
const error = ref('')
const today = new Date().toISOString().split('T')[0]

const blank = () => ({ title: '', description: '', dueDate: '', status: 'pending' })
const form = ref(blank())

watch(() => props.task, (t) => {
  if (t) {
    form.value = {
      title: t.title || '',
      description: t.description || '',
      dueDate: t.dueDate || '',
      status: t.status || 'pending'
    }
  } else {
    form.value = blank()
  }
}, { immediate: true })

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const payload = {
      title: form.value.title,
      description: form.value.description || null,
      dueDate: form.value.dueDate || null
    }
    let result
    if (isEdit.value) {
      result = await store.updateTask(props.task.id, { ...payload, status: form.value.status })
    } else {
      result = await store.createTask(payload)
    }
    emit('saved', result)
    emit('close')
  } catch (e) {
    const data = e.response?.data
    if (data?.data && typeof data.data === 'object') {
      error.value = Object.values(data.data).join(', ')
    } else {
      error.value = data?.message || e.message || 'Failed to save task'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}
.modal {
  width: 100%; max-width: 520px; padding: 32px;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px;
}
.modal-header h2 { font-size: 18px; font-weight: 600; }
.close-btn {
  border: none; background: var(--mist); color: #666;
  width: 32px; height: 32px; border-radius: 8px; font-size: 14px;
  cursor: pointer; transition: all var(--transition);
}
.close-btn:hover { background: var(--mist-2); color: var(--ink); }

.modal-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 5px; position: relative; }
.field label { font-size: 13px; font-weight: 500; color: #555; }
.required { color: var(--red); }
.char-count { position: absolute; right: 0; top: 0; font-size: 11px; color: #bbb; font-family: var(--font-mono); }
.textarea { resize: vertical; min-height: 80px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.error-msg { padding: 10px 14px; background: var(--red-soft); color: var(--red); border-radius: var(--radius-sm); font-size: 13px; }
.spinner {
  width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; display: inline-block; animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
