<template>
  <div class="end-game">
    <div class="end-game__card">
      <div class="end-game__badge">游戏结束</div>
      <h2>最终诊断报告</h2>

      <div class="end-game__grade">
        <div class="end-game__score">{{ finalInfo.percent }}</div>
        <div class="end-game__grade-text">{{ finalInfo.grade }}</div>
        <p>{{ finalInfo.comment }}</p>
      </div>

      <div class="end-game__stats">
        <div class="end-game__stat">
          <div class="end-game__stat-value">{{ state.score }}</div>
          <div class="end-game__stat-label">总分</div>
        </div>
        <div class="end-game__stat">
          <div class="end-game__stat-value">{{ correctCount }}/{{ state.answeredQuestionIds.length }}</div>
          <div class="end-game__stat-label">答题正确</div>
        </div>
        <div class="end-game__stat">
          <div class="end-game__stat-value">{{ state.unlockedClueIds.length }}</div>
          <div class="end-game__stat-label">解锁线索</div>
        </div>
      </div>
    </div>

    <div class="end-game__section">
      <h3>小组最终排行榜</h3>
      <div class="end-game__board">
        <div
          v-for="(p, idx) in leaderboard"
          :key="p.id"
          class="end-game__rank-row"
          :class="{ me: p.isMe }"
        >
          <span>{{ ['🥇','🥈','🥉'][idx] || `${idx + 1}.` }}</span>
          <span class="end-game__rank-name">{{ p.name }}（{{ p.roleName }}）</span>
          <span class="end-game__rank-score">{{ p.score }} 分</span>
        </div>
      </div>
    </div>

    <div class="end-game__section">
      <h3>我的线索本</h3>
      <div class="end-game__clues">
        <ClueCard
          v-for="clue in unlockedClues"
          :key="clue.id"
          :clue="clue"
        />
      </div>
    </div>

    <div class="end-game__section">
      <h3>知识点复盘</h3>
      <KnowledgeItem
        v-for="item in knowledgeSummary"
        :key="item.title"
        :item="item"
      />
    </div>

    <div class="end-game__actions">
      <button class="btn btn--primary" @click="replay">再玩一次</button>
      <button class="btn btn--secondary" @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { clues, knowledgeSummary } from '../data/gameData.js';
import { useGameState } from '../composables/useGameState.js';
import { useRoom } from '../composables/useRoom.js';
import ClueCard from '../components/ClueCard.vue';
import KnowledgeItem from '../components/KnowledgeItem.vue';

const emit = defineEmits(['change-page']);

const { state, resetGame, getGrade } = useGameState();
const { room, destroyRoom } = useRoom();

const finalInfo = computed(() => getGrade(state.score));

const correctCount = computed(() => {
  return state.answeredQuestionIds.filter(q => q.correct).length;
});

const unlockedClues = computed(() => {
  return state.unlockedClueIds
    .map(id => clues.find(c => c.id === id))
    .filter(Boolean);
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

function replay() {
  destroyRoom();
  resetGame();
  emit('change-page', 'home');
}

function goHome() {
  destroyRoom();
  emit('change-page', 'home');
}
</script>

<style scoped>
.end-game {
  min-height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
  background: var(--bg-color);
}

.end-game__card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  text-align: center;
  margin-bottom: 20px;
}

.end-game__badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary-color);
  color: white;
  border-radius: 16px;
  font-size: 13px;
  margin-bottom: 12px;
}

.end-game__card h2 {
  margin: 0 0 16px 0;
  color: var(--text-color);
}

.end-game__grade {
  margin: 20px 0;
}

.end-game__score {
  font-size: 56px;
  font-weight: bold;
  color: var(--primary-color);
}

.end-game__grade-text {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin: 8px 0;
}

.end-game__grade p {
  color: var(--text-secondary);
  margin: 0;
}

.end-game__stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.end-game__stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
}

.end-game__stat-label {
  font-size: 13px;
  color: var(--muted-color);
}

.end-game__section {
  margin-bottom: 24px;
}

.end-game__section h3 {
  margin: 0 0 14px 0;
  color: var(--text-color);
}

.end-game__board {
  background: white;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.end-game__rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.end-game__rank-row.me {
  background: var(--primary-light);
  font-weight: bold;
  color: var(--text-color);
}

.end-game__rank-name {
  flex: 1;
}

.end-game__rank-score {
  color: var(--primary-color);
  font-weight: bold;
}

.end-game__clues {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.end-game__actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 32px 0;
}

@media (max-width: 480px) {
  .end-game__stats {
    gap: 20px;
  }
}
</style>
