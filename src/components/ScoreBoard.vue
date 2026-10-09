<template>
  <div class="score-board">
    <div
      v-for="(p, idx) in sorted"
      :key="p.id"
      class="score-board__chip"
      :class="{ me: p.isMe }"
    >
      <span class="score-board__medal">{{ medal(idx) }}</span>
      <span class="score-board__icon">{{ icon(p.roleId) }}</span>
      <span class="score-board__name">{{ p.name }}</span>
      <span class="score-board__score">{{ p.score }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // [{id, name, roleId, score, isMe}]
  players: { type: Array, default: () => [] }
});

const icons = { doctor: '👨‍⚕️', lab: '🔬', family: '👩', cdc: '🏥', neuro: '🧠', pharmacist: '💊' };
const medals = ['🥇', '🥈', '🥉'];

const sorted = computed(() => [...props.players].sort((a, b) => b.score - a.score));
const medal = (idx) => medals[idx] || `${idx + 1}.`;
const icon = (roleId) => icons[roleId] || '👤';
</script>

<style scoped>
.score-board {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 4px;
}

.score-board__chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.score-board__chip.me {
  border-color: var(--primary-color);
  background: var(--primary-light);
  font-weight: bold;
}

.score-board__medal {
  font-size: 12px;
  color: var(--muted-color);
}

.score-board__score {
  color: var(--primary-color);
  font-weight: bold;
}
</style>
