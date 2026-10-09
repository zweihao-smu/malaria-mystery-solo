<template>
  <div class="chapter-page">
    <ScoreBar
      :chapter-index="state.currentChapterIndex"
      :score="state.score"
      :unlocked-clue-ids="state.unlockedClueIds"
      @toggle-clue-book="showClueBook = true"
    />

    <ScoreBoard :players="boardPlayers" />

    <div class="chapter-page__content">
      <div class="chapter-page__intro">
        <span class="chapter-page__number">第 {{ state.currentChapterIndex + 1 }} 章</span>
        <h2>{{ currentChapter.title }}</h2>
        <p>{{ currentChapter.summary }}</p>
      </div>

      <div class="chapter-page__story">
        <StoryCard
          v-for="(card, idx) in currentChapter.storyCards"
          :key="card.id"
          :text="card.text"
          :revealed="idx <= revealedIndex"
        />
      </div>

      <div class="chapter-page__clues">
        <h3>本章线索</h3>
        <p v-if="!allRevealed" class="chapter-page__tip">读完剧情后开始搜证；你只能解锁「公开」和「{{ myRoleShort }}」的线索</p>
        <div class="chapter-page__clue-grid">
          <button
            v-for="clue in chapterClues"
            :key="clue.id"
            class="chapter-page__clue-btn"
            :class="{ unlocked: isUnlocked(clue.id), 'not-mine': !isMine(clue) }"
            :disabled="!canUnlock(clue)"
            @click="onUnlockClue(clue.id)"
          >
            <span class="chapter-page__clue-status">{{ clueIcon(clue) }}</span>
            <span class="chapter-page__clue-name">{{ clue.title }}</span>
            <span class="chapter-page__clue-owner">{{ clue.owner }}</span>
          </button>
        </div>
      </div>

      <BotFeed :items="room.feed" />

      <div class="chapter-page__actions">
        <button
          v-if="!allRevealed"
          class="btn btn--primary"
          @click="nextCard"
        >下一段剧情</button>

        <button
          v-else
          class="btn btn--primary"
          :disabled="!myCluesDone"
          @click="goToQuiz"
        >
          {{ myCluesDone ? '做出判断' : '先解锁你能找到的线索' }}
        </button>
      </div>
    </div>

    <ClueBook
      :is-open="showClueBook"
      :unlocked-clue-ids="state.unlockedClueIds"
      @close="showClueBook = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { chapters, clues, roles } from '../data/gameData.js';
import { useGameState } from '../composables/useGameState.js';
import { useRoom, visibleClueIds } from '../composables/useRoom.js';
import ScoreBar from '../components/ScoreBar.vue';
import ScoreBoard from '../components/ScoreBoard.vue';
import BotFeed from '../components/BotFeed.vue';
import StoryCard from '../components/StoryCard.vue';
import ClueBook from '../components/ClueBook.vue';

const emit = defineEmits(['change-page']);

const { state, unlockClue: unlock } = useGameState();
const { room, startScavenging } = useRoom();

const currentChapter = computed(() => chapters[state.currentChapterIndex]);
const revealedIndex = ref(0);
const showClueBook = ref(false);

const chapterClues = computed(() => {
  return currentChapter.value.clueIds
    .map(id => clues.find(c => c.id === id))
    .filter(Boolean);
});

// 多人规则：我只能解锁「公开」线索和我角色的专属线索，其余只能看
const myClueIds = computed(() => visibleClueIds(state.selectedRoleId, currentChapter.value));

const isMine = (clue) => myClueIds.value.includes(clue.id);

const allRevealed = computed(() =>
  revealedIndex.value >= currentChapter.value.storyCards.length - 1
);

// 剧情一读完，机器人同学立刻开始搜证
watch(allRevealed, (done) => {
  if (done) startScavenging(state.currentChapterIndex);
});

const myCluesDone = computed(() =>
  myClueIds.value.every(id => state.unlockedClueIds.includes(id))
);

const myRoleShort = computed(() => {
  const map = { doctor: '住院医师', lab: '检验科技师', family: '患者家属', cdc: '流行病调查员', neuro: '神经内科', pharmacist: '临床药师' };
  return map[state.selectedRoleId] || '';
});

const boardPlayers = computed(() => [
  { id: 'me', name: '我', roleId: state.selectedRoleId, score: state.score, isMe: true },
  ...room.bots.map(b => ({ id: b.id, name: b.name, roleId: b.roleId, score: b.score }))
]);

function isUnlocked(clueId) {
  return state.unlockedClueIds.includes(clueId);
}

function canUnlock(clue) {
  return allRevealed.value && isMine(clue) && !isUnlocked(clue.id);
}

function clueIcon(clue) {
  if (isUnlocked(clue.id)) return '✓';
  return isMine(clue) ? '🔍' : '🔒';
}

function onUnlockClue(clueId) {
  if (!isUnlocked(clueId)) {
    unlock(clueId);
  }
}

function nextCard() {
  if (!allRevealed.value) {
    revealedIndex.value++;
  }
}

function goToQuiz() {
  emit('change-page', 'quiz');
}
</script>

<style scoped>
.chapter-page {
  min-height: 100vh;
  background: var(--bg-color);
}

.chapter-page__content {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
}

.chapter-page__intro {
  text-align: center;
  margin-bottom: 24px;
}

.chapter-page__number {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: 16px;
  font-size: 13px;
  margin-bottom: 10px;
}

.chapter-page__intro h2 {
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.chapter-page__intro p {
  margin: 0;
  color: var(--text-secondary);
}

.chapter-page__clues {
  margin: 24px 0 8px 0;
}

.chapter-page__clues h3 {
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.chapter-page__tip {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--muted-color);
}

.chapter-page__clue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.chapter-page__clue-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.chapter-page__clue-btn.unlocked {
  border-color: var(--success-color);
  background: rgba(76, 175, 80, 0.08);
}

.chapter-page__clue-btn.not-mine {
  opacity: 0.55;
}

.chapter-page__clue-btn:disabled {
  cursor: not-allowed;
}

.chapter-page__clue-status {
  flex-shrink: 0;
  font-size: 14px;
}

.chapter-page__clue-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
}

.chapter-page__clue-owner {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--tag-bg);
  color: var(--tag-color);
  border-radius: 8px;
  flex-shrink: 0;
}

.chapter-page__actions {
  text-align: center;
  margin: 28px 0;
}
</style>
