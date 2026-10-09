// 模拟多人课堂的“机器人同学”引擎：5 个机器人扮演其余角色，
// 在搜证阶段自动找线索、答题阶段自动作答，并产出小组动态消息流。
import { reactive } from 'vue';
import { roles, chapters, clues, questions, scoringRules } from '../data/gameData.js';

const BOT_NAMES = ['小明', '小红', '小刚', '小丽', '小芳'];

const room = reactive({
  created: false,
  bots: [],   // {id, name, roleId, score, unlockedClueIds, answers:[{id,correct,points}], skill}
  feed: []    // {id, text, kind} 最新在前
});

let timers = [];

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function later(fn, delay) {
  timers.push(setTimeout(fn, delay));
}

function pushFeed(text, kind = 'info') {
  room.feed.unshift({ id: `${Date.now()}-${Math.random()}`, text, kind });
  if (room.feed.length > 40) room.feed.pop();
}

function roleShortName(roleId) {
  const map = { doctor: '住院医师', lab: '检验科技师', family: '患者家属', cdc: '流调员', neuro: '神经科医师', pharmacist: '临床药师' };
  return map[roleId] || '';
}

// 某角色在一章里能解锁的线索：公开线索 + 自己角色的专属线索
export function visibleClueIds(roleId, chapter) {
  const role = roles.find(r => r.id === roleId);
  return chapter.clueIds.filter(id => {
    const clue = clues.find(c => c.id === id);
    return clue && (clue.owner === '公开' || role?.clueIds.includes(id));
  });
}

function botAnswer(bot, questionId, silent = false) {
  if (bot.answers.some(a => a.id === questionId)) return;
  const q = questions.find(x => x.id === questionId);
  if (!q) return;
  const correct = Math.random() < bot.skill;
  bot.answers.push({ id: questionId, correct, points: correct ? q.points : 0 });
  if (correct) bot.score += q.points;
  if (!silent) pushFeed(`${bot.name}（${roleShortName(bot.roleId)}）已作答`, 'answer');
}

export function useRoom() {
  // 选定角色后创建房间：其余角色自动分配给机器人，答题正确率各不相同
  function createRoom(myRoleId) {
    clearTimers();
    room.bots = roles
      .filter(r => r.id !== myRoleId)
      .map((role, i) => ({
        id: `bot-${role.id}`,
        name: BOT_NAMES[i],
        roleId: role.id,
        score: 0,
        unlockedClueIds: [],
        answers: [],
        skill: 0.55 + Math.random() * 0.35
      }));
    room.feed = [];
    room.created = true;
    pushFeed('小组已组成，其余 5 名同学由机器人扮演', 'info');
  }

  // 剧情全部揭示后调用：机器人陆续找出本章各自可见的线索
  function startScavenging(chapterIndex) {
    const chapter = chapters[chapterIndex];
    if (!chapter) return;
    room.bots.forEach(bot => {
      const ids = visibleClueIds(bot.roleId, chapter)
        .filter(id => !bot.unlockedClueIds.includes(id));
      let delay = 800 + Math.random() * 1500;
      ids.forEach(clueId => {
        later(() => {
          if (bot.unlockedClueIds.includes(clueId)) return;
          bot.unlockedClueIds.push(clueId);
          bot.score += scoringRules.clueUnlocked;
          const clue = clues.find(c => c.id === clueId);
          pushFeed(`${bot.name}（${roleShortName(bot.roleId)}）找到了线索《${clue.title}》`, 'clue');
        }, delay);
        delay += 1200 + Math.random() * 2200;
      });
    });
  }

  // 每出一道新题调用：机器人经随机延迟后作答
  function startQuestion(questionId) {
    room.bots.forEach(bot => {
      if (bot.answers.some(a => a.id === questionId)) return;
      later(() => botAnswer(bot, questionId), 1500 + Math.random() * 4000);
    });
  }

  // 玩家推进到下一题前调用：未答的机器人立即静默补答，保证统计完整
  function flushAnswers(questionId) {
    room.bots.forEach(bot => botAnswer(bot, questionId, true));
  }

  // “继续游戏”时调用：把机器人进度快进到当前章节（无动画、无动态）
  function fastForwardBots(chapterIndex, myAnsweredIds) {
    room.bots.forEach(bot => {
      for (let ci = 0; ci <= chapterIndex && ci < chapters.length; ci++) {
        const ch = chapters[ci];
        const isPast = ci < chapterIndex;
        visibleClueIds(bot.roleId, ch).forEach(id => {
          if (isPast && !bot.unlockedClueIds.includes(id)) {
            bot.unlockedClueIds.push(id);
            bot.score += scoringRules.clueUnlocked;
          }
        });
        // 已完成的章节补答全部题目；当前章只补答玩家已答过的题
        ch.questionIds
          .filter(qid => isPast || myAnsweredIds.includes(qid))
          .forEach(qid => botAnswer(bot, qid, true));
      }
    });
  }

  function answeredCount(questionId, myAnswered) {
    return room.bots.filter(b => b.answers.some(a => a.id === questionId)).length + (myAnswered ? 1 : 0);
  }

  function destroyRoom() {
    clearTimers();
    room.created = false;
    room.bots = [];
    room.feed = [];
  }

  return {
    room,
    createRoom,
    startScavenging,
    startQuestion,
    flushAnswers,
    fastForwardBots,
    answeredCount,
    destroyRoom,
    visibleClueIds
  };
}
