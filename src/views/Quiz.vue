<template>
  <div class="quiz-page">
    <ScoreBoard :players="boardPlayers" />

    <div class="quiz-page__header">
      <span class="quiz-page__badge">关键决策</span>
      <h2>{{ currentChapter.title }}</h2>
      <div class="quiz-page__progress">
        第 {{ currentQuestionIndex + 1 }} / {{ chapterQuestions.length }} 题
        · 已作答 {{ answeredCount }}/6
      </div>
    </div>

    <div class="quiz-page__card">
      <h3>{{ currentQuestion.text }}</h3>

      <div class="quiz-page__options">
        <ChoiceButton
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          :label="option"
          :selected="selectedIndex === idx"
          :status="getOptionStatus(idx)"
          @select="selectOption(idx)"
        />
      </div>

      <div v-if="answered" class="quiz-page__feedback">
        <div class="quiz-page__result" :class="isCorrect ? 'correct' : 'wrong'">
          {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误' }}
        </div>
        <p>{{ currentQuestion.explanation }}</p>
      </div>
    </div>

    <BotFeed :items="room.feed" />

    <div class="quiz-page__actions">
      <button
        v-if="!answered"
        class="btn btn--primary"
        :disabled="selectedIndex === null"
        @click="submitAnswer"
      >提交答案</button>

      <button
        v-else-if="currentQuestionIndex < chapterQuestions.length - 1"
        class="btn btn--primary"
        @click="nextQuestion"
      >下一题</button>

      <button
        v-else
        class="btn btn--primary"
        @click="finishChapter"
      >完成本章</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { chapters, questions } from '../data/gameData.js';
import { useGameState } from '../composables/useGameState.js';
import { useRoom } from '../composables/useRoom.js';
import ChoiceButton from '../components/ChoiceButton.vue';
import ScoreBoard from '../components/ScoreBoard.vue';
import BotFeed from '../components/BotFeed.vue';

const emit = defineEmits(['change-page']);

const { state, answerQuestion, nextChapter } = useGameState();
const { room, startQuestion, flushAnswers } = useRoom();

const currentChapter = computed(() => chapters[state.currentChapterIndex]);

const chapterQuestions = computed(() => {
  return currentChapter.value.questionIds
    .map(id => questions.find(q => q.id === id))
    .filter(Boolean);
});

const currentQuestionIndex = ref(0);
const selectedIndex = ref(null);
const answered = ref(false);
const isCorrect = ref(false);

const currentQuestion = computed(() => chapterQuestions.value[currentQuestionIndex.value]);

// 每出现一道新题，机器人们各自思考片刻后作答
watch(currentQuestion, (q) => {
  if (q) startQuestion(q.id);
});
onMounted(() => {
  if (currentQuestion.value) startQuestion(currentQuestion.value.id);
});

const answeredCount = computed(() => {
  const qid = currentQuestion.value?.id;
  if (!qid) return 0;
  const botCount = room.bots.filter(b => b.answers.some(a => a.id === qid)).length;
  return botCount + (answered.value ? 1 : 0);
});

const boardPlayers = computed(() => [
  { id: 'me', name: '我', roleId: state.selectedRoleId, score: state.score, isMe: true },
  ...room.bots.map(b => ({ id: b.id, name: b.name, roleId: b.roleId, score: b.score }))
]);

function getOptionStatus(idx) {
  if (!answered.value) return '';
  const correctIdx = currentQuestion.value.options.findIndex(o => o.startsWith(currentQuestion.value.correct + '.'));
  if (idx === correctIdx) return 'correct';
  if (idx === selectedIndex.value && idx !== correctIdx) return 'wrong';
  return '';
}

function selectOption(idx) {
  if (answered.value) return;
  selectedIndex.value = idx;
}

function submitAnswer() {
  if (selectedIndex.value === null) return;
  const q = currentQuestion.value;
  const selectedOption = q.options[selectedIndex.value];
  const correct = selectedOption.startsWith(q.correct + '.');
  isCorrect.value = correct;
  answered.value = true;
  answerQuestion(q.id, correct, q.points);
}

// 推进前先让还没作答的机器人静默补答，保证成绩完整
function nextQuestion() {
  flushAnswers(currentQuestion.value.id);
  currentQuestionIndex.value++;
  selectedIndex.value = null;
  answered.value = false;
  isCorrect.value = false;
}

function finishChapter() {
  flushAnswers(currentQuestion.value.id);
  nextChapter();
  if (state.currentChapterIndex >= chapters.length) {
    emit('change-page', 'end-game');
  } else {
    emit('change-page', 'chapter-summary');
  }
}
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
  background: var(--bg-color);
}

.quiz-page__header {
  text-align: center;
  margin-bottom: 24px;
}

.quiz-page__badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--warning-color);
  color: white;
  border-radius: 16px;
  font-size: 13px;
  margin-bottom: 10px;
}

.quiz-page__header h2 {
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.quiz-page__progress {
  color: var(--muted-color);
  font-size: 14px;
}

.quiz-page__card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  margin-bottom: 20px;
}

.quiz-page__card h3 {
  margin: 0 0 20px 0;
  color: var(--text-color);
  line-height: 1.5;
}

.quiz-page__feedback {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  background: #f8f9fa;
}

.quiz-page__result {
  font-weight: bold;
  margin-bottom: 10px;
}

.quiz-page__result.correct {
  color: var(--success-color);
}

.quiz-page__result.wrong {
  color: var(--error-color);
}

.quiz-page__feedback p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.quiz-page__actions {
  text-align: center;
}
</style>
