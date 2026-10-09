<template>
  <div class="score-bar">
    <div class="score-bar__left">
      <span class="score-bar__chapter">{{ chapterTitle }}</span>
    </div>
    <div class="score-bar__right">
      <span class="score-bar__score">得分：{{ score }}</span>
      <button class="score-bar__clue-btn" @click="$emit('toggle-clue-book')">
        线索本 ({{ unlockedCount }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { chapters } from '../data/gameData.js';

const props = defineProps({
  chapterIndex: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  unlockedClueIds: { type: Array, default: () => [] }
});

defineEmits(['toggle-clue-book']);

const chapterTitle = computed(() => {
  if (props.chapterIndex >= chapters.length) return '游戏结束';
  return chapters[props.chapterIndex].title;
});

const unlockedCount = computed(() => props.unlockedClueIds.length);
</script>

<style scoped>
.score-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--primary-color);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.score-bar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-bar__clue-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.score-bar__clue-btn:hover {
  background: rgba(255,255,255,0.3);
}

@media (max-width: 480px) {
  .score-bar {
    padding: 10px 12px;
    font-size: 14px;
  }
  .score-bar__clue-btn {
    padding: 5px 10px;
    font-size: 13px;
  }
}
</style>
