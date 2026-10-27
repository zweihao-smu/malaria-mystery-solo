import { reactive, computed } from 'vue';
import { chapters, questions, scoringRules } from '../data/gameData.js';

// 与单人版/多人版存档分开，互不影响
const STORAGE_KEY = 'malaria-mystery-solo-state';

function createDefaultState() {
  return {
    selectedRoleId: null,
    currentChapterIndex: 0,
    unlockedClueIds: [],
    answeredQuestionIds: [],
    score: 0,
    ending: null, // null=进行中/未触发, 'good' | 'relapse' | 'bad'
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

  // 记录结局；bad ending 直接结束游戏（不再进入后续章节）
  function setEnding(ending) {
    state.ending = ending;
    if (ending === 'bad') {
      state.currentChapterIndex = chapters.length;
    }
    saveState(state);
  }

  function resetGame() {
    Object.assign(state, createDefaultState());
    localStorage.removeItem(STORAGE_KEY);
  }

  function getGrade(totalScore) {
    // 满分按实际走过的路径计算：
    // 线索全收集（好结局版第四章无线索）+ 章节题目 + 关键抉择分
    // bad ending 只经历前两章，相应缩小分母
    const isGoodPath = state.ending !== 'relapse';
    const chs = state.ending === 'bad' ? chapters.slice(0, 2) : chapters;
    let max = 0;
    chs.forEach(ch => {
      const clueCount = (ch.storyCardsAlt && isGoodPath) ? (ch.clueIdsAlt ?? []).length : ch.clueIds.length;
      max += clueCount;
      max += ch.questionIds.reduce(
        (s, qid) => s + (questions.find(q => q.id === qid)?.points || 0), 0
      );
      if (ch.decisionId) max += scoringRules.correctAnswer;
    });
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
    setEnding,
    resetGame,
    getGrade
  };
}
