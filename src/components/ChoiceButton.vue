<template>
  <button
    class="choice-button"
    :class="[statusClass, { selected: selected }]"
    :disabled="disabled"
    @click="$emit('select')"
  >
    <span class="choice-button__label">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  selected: { type: Boolean, default: false },
  status: { type: String, default: '' } // 'correct' | 'wrong' | ''
});

defineEmits(['select']);

const statusClass = computed(() => {
  if (props.status === 'correct') return 'is-correct';
  if (props.status === 'wrong') return 'is-wrong';
  return '';
});

const disabled = computed(() => props.status !== '');
</script>

<style scoped>
.choice-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 10px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-size: 15px;
}

.choice-button:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.choice-button.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.choice-button.is-correct {
  border-color: var(--success-color);
  background: rgba(76, 175, 80, 0.1);
}

.choice-button.is-wrong {
  border-color: var(--error-color);
  background: rgba(244, 67, 54, 0.1);
}

.choice-button:disabled {
  cursor: default;
}

.choice-button__label {
  flex: 1;
}
</style>
