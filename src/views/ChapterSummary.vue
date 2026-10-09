<template>
  <div class="chapter-summary">
    <div class="chapter-summary__card">
      <div class="chapter-summary__badge">章节完成</div>
      <h2>{{ previousChapter.title }}</h2>

      <div class="chapter-summary__score">
        <div class="chapter-summary__score-value">+{{ chapterScore }}</div>
        <div class="chapter-summary__score-label">本章得分</div>
      </div>

      <div class="chapter-summary__recap">
        <h4>教师要点回顾</h4>
        <p>{{ previousChapter.recap }}</p>
      </div>

      <div class="chapter-summary__clues">
        <h4>本章解锁线索</h4>
        <div class="chapter-summary__clue-list">
          <span
            v-for="clue in chapterUnlockedClues"
            :key="clue.id"
            class="chapter-summary__clue-tag"
          >
            {{ clue.title }}
          </span>
        </div>
      </div>

      <div class="chapter-summary__board">
        <h4>小组排名</h4>
        <div
          v-for="(p, idx) in leaderboard"
          :key="p.id"
          class="chapter-summary__rank-row"
          :class="{ me: p.isMe }"
        >
          <span>{{ ['🥇','🥈','🥉'][idx] || `${idx + 1}.` }}</span>
          <span class="chapter-summary__rank-name">{{ p.name }}（{{ p.roleName }}）</span>
          <span class="chapter-summary__rank-score">{{ p.score }} 分</span>
        </div>
      </div>
    </div>

    <div class="chapter-summary__actions">
      <button class="btn btn--primary" @click="next">进入下一章</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { chapters, clues, roles } from '../data/gameData.js';
import { useGameState } from '../composables/useGameState.js';
import { useRoom } from '../composables/useRoom.js';

const emit = defineEmits(['change-page']);

const { state } = useGameState();
const { room } = useRoom();

const previousChapter = computed(() => {
  const idx = Math.max(0, state.currentChapterIndex - 1);
  return chapters[idx];
});

const chapterUnlockedClues = computed(() => {
  return previousChapter.value.clueIds
    .filter(id => state.unlockedClueIds.includes(id))
    .map(id => clues.find(c => c.id === id))
    .filter(Boolean);
});

const chapterScore = computed(() => {
  const qIds = previousChapter.value.questionIds;
  return state.answeredQuestionIds
    .filter(q => qIds.includes(q.id))
    .reduce((sum, q) => sum + q.points, 0)
    + chapterUnlockedClues.value.length;
});

const roleShort = (roleId) => {
  const map = { doctor: '住院医师', lab: '检验科技师', family: '患者家属', cdc: '流调员', neuro: '神经科医师', pharmacist: '临床药师' };
  return map[roleId] || '';
};

const leaderboard = computed(() => {
  const me = { id: 'me', name: '我', roleName: roleShort(state.selectedRoleId), score: state.score, isMe: true };
  const bots = room.bots.map(b => ({ id: b.id, name: b.name, roleName: roleShort(b.roleId), score: b.score }));
  return [me, ...bots].sort((a, b) => b.score - a.score);
});

function next() {
  emit('change-page', 'chapter');
}
</script>

<style scoped>
.chapter-summary {
  min-height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--bg-color);
}

.chapter-summary__card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  text-align: center;
  margin-bottom: 20px;
}

.chapter-summary__badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--success-color);
  color: white;
  border-radius: 16px;
  font-size: 13px;
  margin-bottom: 12px;
}

.chapter-summary__card h2 {
  margin: 0 0 16px 0;
  color: var(--text-color);
}

.chapter-summary__score {
  margin: 20px 0;
}

.chapter-summary__score-value {
  font-size: 48px;
  font-weight: bold;
  color: var(--primary-color);
}

.chapter-summary__score-label {
  color: var(--muted-color);
  font-size: 14px;
}

.chapter-summary__recap,
.chapter-summary__clues {
  text-align: left;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.chapter-summary__recap h4,
.chapter-summary__clues h4 {
  margin: 0 0 10px 0;
  color: var(--text-color);
}

.chapter-summary__recap p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.chapter-summary__clue-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chapter-summary__clue-tag {
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 16px;
  font-size: 13px;
}

.chapter-summary__board {
  text-align: left;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.chapter-summary__board h4 {
  margin: 0 0 10px 0;
  color: var(--text-color);
}

.chapter-summary__rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.chapter-summary__rank-row.me {
  background: var(--primary-light);
  font-weight: bold;
  color: var(--text-color);
}

.chapter-summary__rank-name {
  flex: 1;
}

.chapter-summary__rank-score {
  color: var(--primary-color);
  font-weight: bold;
}

.chapter-summary__actions {
  text-align: center;
}
</style>
