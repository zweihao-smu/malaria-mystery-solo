<template>
  <div class="home-page">
    <div class="home-page__hero">
      <div class="home-page__badge">医学剧本杀 · 单机模拟课堂</div>
      <h1>昏迷的建筑工程师</h1>
      <h2>恶性疟疑案</h2>

      <p class="home-page__desc">
        35岁建筑工程师从非洲归国后突发昏迷……
        选择一个角色，与其余 5 名机器人同学组队，揭开恶性疟的真相。
      </p>

      <div class="home-page__meta">
        <span>🤖 1人 + 5机器人</span>
        <span>⏱️ 30-50分钟</span>
        <span>🎯 临床推理</span>
      </div>
    </div>

    <div class="home-page__actions">
      <button class="btn btn--primary" @click="onStartNewGame">开始新游戏</button>
      <button
        v-if="hasSave"
        class="btn btn--secondary"
        @click="continueGame"
      >继续游戏</button>
    </div>

    <div class="home-page__footer">
      基于南方医科大学PBL案例《昏迷的建筑工程师》改编
    </div>
  </div>
</template>

<script setup>
import { useGameState } from '../composables/useGameState.js';
import { useRoom } from '../composables/useRoom.js';

const props = defineProps({
  page: { type: String, default: 'home' }
});

const emit = defineEmits(['change-page']);

const { hasSave, startNewGame, state } = useGameState();
const { createRoom, fastForwardBots, destroyRoom } = useRoom();

function onStartNewGame() {
  const gs = useGameState();
  gs.resetGame();
  gs.startNewGame();
  destroyRoom(); // 清掉上一局的机器人与计时器
  emit('change-page', 'role-select');
}

function continueGame() {
  // 存档不含机器人状态，重建小组并快进到当前进度
  createRoom(state.selectedRoleId);
  fastForwardBots(state.currentChapterIndex, state.answeredQuestionIds.map(q => q.id));
  if (state.currentChapterIndex >= 4) {
    emit('change-page', 'end-game');
  } else {
    emit('change-page', 'chapter');
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  text-align: center;
}

.home-page__hero {
  max-width: 520px;
}

.home-page__badge {
  display: inline-block;
  padding: 6px 14px;
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  margin-bottom: 20px;
}

.home-page h1 {
  font-size: 36px;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.home-page h2 {
  font-size: 28px;
  color: var(--primary-color);
  margin: 0 0 20px 0;
}

.home-page__desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 24px;
}

.home-page__meta {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  font-size: 14px;
  color: var(--muted-color);
}

.home-page__actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

.home-page__footer {
  font-size: 13px;
  color: var(--muted-color);
}

@media (max-width: 480px) {
  .home-page h1 {
    font-size: 28px;
  }
  .home-page h2 {
    font-size: 22px;
  }
}
</style>
