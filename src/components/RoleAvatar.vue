<template>
  <div
    class="role-avatar"
    :class="{ selected: selected, optional: role.id === 'pharmacist' }"
    @click="$emit('select', role.id)"
  >
    <div class="role-avatar__icon">{{ roleIcon }}</div>
    <div class="role-avatar__info">
      <h4>{{ role.name }}</h4>
      <p>{{ role.identity }}</p>
      <span v-if="role.id === 'pharmacist'" class="role-avatar__badge">可选</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  role: { type: Object, required: true },
  selected: { type: Boolean, default: false }
});

defineEmits(['select']);

const icons = {
  doctor: '👨‍⚕️',
  lab: '🔬',
  family: '👩',
  cdc: '🏥',
  neuro: '🧠',
  pharmacist: '💊'
};

const roleIcon = computed(() => icons[props.role.id] || '👤');
</script>

<style scoped>
.role-avatar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-avatar:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.role-avatar.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.15);
}

.role-avatar.optional {
  opacity: 0.85;
}

.role-avatar__icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.role-avatar__info {
  flex: 1;
}

.role-avatar__info h4 {
  margin: 0 0 4px 0;
  color: var(--text-color);
}

.role-avatar__info p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.role-avatar__badge {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  font-size: 12px;
  background: var(--warning-color);
  color: white;
  border-radius: 10px;
}
</style>
