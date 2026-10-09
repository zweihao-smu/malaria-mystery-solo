import { reactive, computed } from 'vue';
import { chapters, clues, questions, roles, scoringRules } from '../data/gameData.js';

// 与单人版/多人版存档分开，互不影响
const STORAGE_KEY = 'malaria-mystery-solo-state';

function createDefaultState() {
  return {
    selectedRoleId: null,
    currentChapterIndex: 0,
    unlockedClueIds: [],
    answeredQuestionIds: [],
    score: 0,
    startedAt: null,
    lastSavedAt: null
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...createDefaultState(), ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load game state from localStorage', e);
  }
  return createDefaultState();
}

function saveState(state) {
  try {
    state.lastSavedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save game state to localStorage', e);
  }
}

const state = reactive(loadState());

export function useGameState() {
  const hasSave = computed(() => !!state.startedAt && state.currentChapterIndex < chapters.length);
  const isComplete = computed(() => state.currentChapterIndex >= chapters.length);

  function startNewGame() {
    Object.assign(state, createDefaultState());
    state.startedAt = Date.now();
    saveState(state);
  }

  function selectRole(roleId) {
    state.selectedRoleId = roleId;
    saveState(state);
  }

  function unlockClue(clueId) {
    if (!state.unlockedClueIds.includes(clueId)) {
      state.unlockedClueIds.push(clueId);
      state.score += scoringRules.clueUnlocked;
      saveState(state);
    }
  }

  function unlockClues(clueIds) {
    let added = 0;
    clueIds.forEach(id => {
      if (!state.unlockedClueIds.includes(id)) {
        state.unlockedClueIds.push(id);
        added++;
      }
    });
    if (added > 0) {
      state.score += added * scoringRules.clueUnlocked;
      saveState(state);
    }
  }

  function answerQuestion(questionId, isCorrect, points) {
    const existing = state.answeredQuestionIds.find(q => q.id === questionId);
    if (existing) return;

    state.answeredQuestionIds.push({
      id: questionId,
      correct: isCorrect,
      points: isCorrect ? points : 0
    });

    if (isCorrect) {
      state.score += points;
    }
    saveState(state);
  }

  function nextChapter() {
    if (state.currentChapterIndex < chapters.length) {
      state.currentChapterIndex++;
      saveState(state);
    }
  }

  function resetGame() {
    Object.assign(state, createDefaultState());
    localStorage.removeItem(STORAGE_KEY);
  }

  function getGrade(totalScore) {
    // 按角色权限计算满分：全部题目分 + 我可见的线索数（公开 + 本角色专属），
    // 否则任何角色都无法达到“优秀”
    const role = roles.find(r => r.id === state.selectedRoleId);
    const clueMax = role
      ? clues.filter(c => c.owner === '公开' || role.clueIds.includes(c.id)).length
      : clues.length;
    const questionMax = chapters.reduce(
      (sum, ch) => sum + ch.questionIds.reduce(
        (s, qid) => s + (questions.find(q => q.id === qid)?.points || 0), 0
      ), 0
    );
    const max = questionMax + clueMax;
    const percent = Math.min(100, Math.round((totalScore / max) * 100));
    for (const threshold of scoringRules.thresholds) {
      if (percent >= threshold.min) {
        return { ...threshold, percent };
      }
    }
    return { ...scoringRules.thresholds[scoringRules.thresholds.length - 1], percent };
  }

  return {
    state,
    hasSave,
    isComplete,
    startNewGame,
    selectRole,
    unlockClue,
    unlockClues,
    answerQuestion,
    nextChapter,
    resetGame,
    getGrade
  };
}
