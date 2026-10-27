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
        <h2>{{ chapterTitle }}</h2>
        <p>{{ chapterSummary }}</p>
      </div>

      <div class="chapter-page__story">
        <!-- 剧情自动逐段播放，未播到的卡不渲染，避免剧透 -->
        <StoryCard
          v-for="card in chapterStory.slice(0, revealedIndex + 1)"
          :key="card.id"
          :text="card.text"
          :revealed="true"
        />
        <p v-if="!allRevealed" class="chapter-page__playing">剧情播放中…</p>
      </div>

      <div v-if="chapterClues.length" class="chapter-page__clues">
        <h3>本章线索</h3>
        <p v-if="allRevealed" class="chapter-page__tip">
          🔍 解锁公开与自己的线索；其他角色的线索不会自动出现——点击下面团队成员向他们提问
        </p>
        <p v-else class="chapter-page__tip">读完剧情后开始搜证与提问</p>

        <div v-if="myChapterClues.length" class="chapter-page__clue-grid">
          <button
            v-for="clue in myChapterClues"
            :key="clue.id"
            class="chapter-page__clue-btn"
            :class="{ unlocked: isUnlocked(clue.id) }"
            :disabled="!allRevealed || isUnlocked(clue.id)"
            @click="onClueClick(clue)"
          >
            <span class="chapter-page__clue-status">{{ isUnlocked(clue.id) ? '✓' : '🔍' }}</span>
            <span class="chapter-page__clue-name">{{ clue.title }}</span>
            <span class="chapter-page__clue-owner">{{ clue.owner }}</span>
          </button>
        </div>

        <h4 class="chapter-page__team-title">🙋 向团队提问</h4>
        <div class="chapter-page__team">
          <button
            v-for="mate in teammates"
            :key="mate.id"
            class="chapter-page__mate"
            :class="{ asking: pendingAsks.has(mate.roleId), done: allRevealed && remainingCount(mate.roleId) === 0 }"
            :disabled="!allRevealed || pendingAsks.has(mate.roleId) || remainingCount(mate.roleId) === 0"
            @click="askTeammate(mate)"
          >
            <span class="chapter-page__mate-icon">{{ mateIcon(mate.roleId) }}</span>
            <span class="chapter-page__mate-name">{{ mate.name }}<br><small>{{ roleShort(mate.roleId) }}</small></span>
            <span class="chapter-page__mate-status">{{ mateStatus(mate.roleId) }}</span>
          </button>
        </div>
      </div>

      <BotFeed :items="room.feed" />

      <div class="chapter-page__actions">
        <button
          v-if="allRevealed"
          class="btn btn--primary"
          :disabled="!allCluesDone"
          @click="goToQuiz"
        >
          {{ allCluesDone ? '做出判断' : '收集完本章所有线索' }}
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
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
const { room, startScavenging, askClue } = useRoom();

const currentChapter = computed(() => chapters[state.currentChapterIndex]);
const revealedIndex = ref(0);
const showClueBook = ref(false);
const pendingAsks = ref(new Set()); // 已提问、等待机器人答复的角色

// 剧情自动逐段播放（约 2.5 秒一段），播完自动开放搜证与提问
let playTimer = null;
onMounted(() => {
  playTimer = setInterval(() => {
    if (allRevealed.value) {
      clearInterval(playTimer);
      playTimer = null;
      return;
    }
    revealedIndex.value++;
  }, 2500);
});
onUnmounted(() => {
  if (playTimer) clearInterval(playTimer);
});

// 第四章有两个版本：治疗方案错误走“再燃”原剧情，正确走“随访康复”好结局版
const useAlt = computed(() =>
  !!currentChapter.value.storyCardsAlt && state.ending !== 'relapse'
);

const chapterTitle = computed(() =>
  useAlt.value ? currentChapter.value.titleAlt : currentChapter.value.title
);
const chapterSummary = computed(() =>
  useAlt.value ? currentChapter.value.summaryAlt : currentChapter.value.summary
);
const chapterStory = computed(() =>
  useAlt.value ? currentChapter.value.storyCardsAlt : currentChapter.value.storyCards
);
const chapterClueIdList = computed(() =>
  useAlt.value ? (currentChapter.value.clueIdsAlt ?? []) : currentChapter.value.clueIds
);

const chapterClues = computed(() => {
  return chapterClueIdList.value
    .map(id => clues.find(c => c.id === id))
    .filter(Boolean);
});

// 我能直接解锁的：公开线索 + 住院医师（玩家角色）专属线索
const myClueIds = computed(() => visibleClueIds(state.selectedRoleId, {
  clueIds: chapterClueIdList.value
}));

// 网格里只列出公开/自己的线索；其他角色的线索不展示标题，只能提问获得
const myChapterClues = computed(() =>
  chapterClues.value.filter(c => myClueIds.value.includes(c.id))
);

// 团队成员（机器人）及其本章尚未被问出的线索
const teammates = computed(() => room.bots);

function roleClueIdsInChapter(roleId) {
  const role = roles.find(r => r.id === roleId);
  if (!role) return [];
  return chapterClueIdList.value.filter(id => role.clueIds.includes(id));
}

function remainingCount(roleId) {
  return roleClueIdsInChapter(roleId)
    .filter(id => !state.unlockedClueIds.includes(id))
    .length;
}

const roleIcons = { lab: '🔬', family: '👩', cdc: '🏥', neuro: '🧠', pharmacist: '💊', doctor: '👨‍⚕️' };
const mateIcon = (roleId) => roleIcons[roleId] || '👤';
const roleShort = (roleId) => {
  const map = { doctor: '住院医师', lab: '检验科技师', family: '患者家属', cdc: '流行病调查员', neuro: '神经内科', pharmacist: '临床药师' };
  return map[roleId] || '';
};

function mateStatus(roleId) {
  if (!allRevealed.value) return '等待剧情';
  if (pendingAsks.value.has(roleId)) return '💬 回答中…';
  const total = roleClueIdsInChapter(roleId).length;
  if (total === 0) return '本章无线索';
  return remainingCount(roleId) === 0 ? '已问完' : `可问 ${total} 条`;
}

const allRevealed = computed(() =>
  revealedIndex.value >= chapterStory.value.length - 1
);

// 剧情一读完，机器人同学立刻开始搜证（好结局版第四章无线索，跳过）
watch(allRevealed, (done) => {
  if (done && chapterClueIdList.value.length) {
    startScavenging(state.currentChapterIndex);
  }
});

// 需要集齐本章全部线索（含提问获得的）才能进入答题
const allCluesDone = computed(() =>
  chapterClueIdList.value.every(id => state.unlockedClueIds.includes(id))
);

const boardPlayers = computed(() => [
  { id: 'me', name: '我', roleId: state.selectedRoleId, score: state.score, isMe: true },
  ...room.bots.map(b => ({ id: b.id, name: b.name, roleId: b.roleId, score: b.score }))
]);

function isUnlocked(clueId) {
  return state.unlockedClueIds.includes(clueId);
}

// 公开/自己的线索：直接解锁
function onClueClick(clue) {
  if (!isUnlocked(clue.id)) unlock(clue.id);
}

// 向团队成员提问：每次问出该角色本章尚未共享的第一条线索
function askTeammate(mate) {
  if (!allRevealed.value || pendingAsks.value.has(mate.roleId)) return;
  const nextId = roleClueIdsInChapter(mate.roleId)
    .find(id => !state.unlockedClueIds.includes(id));
  if (!nextId) return;
  const next = new Set(pendingAsks.value);
  next.add(mate.roleId);
  pendingAsks.value = next;
  askClue(mate.roleId, nextId, () => {
    unlock(nextId);
    const done = new Set(pendingAsks.value);
    done.delete(mate.roleId);
    pendingAsks.value = done;
  });
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

.chapter-page__playing {
  text-align: center;
  color: var(--muted-color);
  font-size: 13px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
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

.chapter-page__clue-btn:disabled {
  cursor: not-allowed;
}

.chapter-page__team-title {
  margin: 18px 0 10px 0;
  font-size: 15px;
  color: var(--text-color);
}

.chapter-page__team {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.chapter-page__mate {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid var(--warning-color);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.chapter-page__mate.asking {
  border-color: var(--primary-color);
}

.chapter-page__mate.done {
  border-color: var(--border-color);
  opacity: 0.6;
}

.chapter-page__mate:disabled {
  cursor: not-allowed;
}

.chapter-page__mate-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.chapter-page__mate-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.4;
}

.chapter-page__mate-name small {
  color: var(--text-secondary);
  font-size: 12px;
}

.chapter-page__mate-status {
  font-size: 12px;
  color: var(--primary-color);
  flex-shrink: 0;
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
