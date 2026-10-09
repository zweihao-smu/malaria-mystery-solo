<template>
  <div class="clue-book" :class="{ open: isOpen }">
    <div class="clue-book__overlay" @click="$emit('close')"></div>
    <div class="clue-book__panel">
      <div class="clue-book__header">
        <h3>线索本</h3>
        <button class="clue-book__close" @click="$emit('close')">✕</button>
      </div>

      <div class="clue-book__filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="['clue-book__filter', { active: currentFilter === filter.value }]"
          @click="currentFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="clue-book__list">
        <div v-if="filteredClues.length === 0" class="clue-book__empty">
          暂无已解锁线索
        </div>
        <ClueCard
          v-for="clue in filteredClues"
          :key="clue.id"
          :clue="clue"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { clues } from '../data/gameData.js';
import ClueCard from './ClueCard.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  unlockedClueIds: { type: Array, default: () => [] }
});

defineEmits(['close']);

const filters = [
  { label: '全部', value: 'all' },
  { label: '第一章', value: 'ch1' },
  { label: '第二章', value: 'ch2' },
  { label: '第三章', value: 'ch3' },
  { label: '第四章', value: 'ch4' }
];

const currentFilter = ref('all');

const unlockedClues = computed(() => {
  return clues.filter(c => props.unlockedClueIds.includes(c.id));
});

const filteredClues = computed(() => {
  if (currentFilter.value === 'all') return unlockedClues.value;
  return unlockedClues.value.filter(c => c.chapter === currentFilter.value);
});
</script>

<style scoped>
.clue-book__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.clue-book.open .clue-book__overlay {
  opacity: 1;
  visibility: visible;
}

.clue-book__panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  max-width: 90vw;
  height: 100vh;
  background: var(--bg-color);
  z-index: 201;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.clue-book.open .clue-book__panel {
  transform: translateX(0);
}

.clue-book__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.clue-book__header h3 {
  margin: 0;
  color: var(--text-color);
}

.clue-book__close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-color);
}

.clue-book__filters {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  border-bottom: 1px solid var(--border-color);
}

.clue-book__filter {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
}

.clue-book__filter.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.clue-book__list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.clue-book__empty {
  text-align: center;
  color: var(--muted-color);
  padding: 40px 0;
}
</style>
