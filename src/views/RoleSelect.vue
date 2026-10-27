<template>
  <div class="role-select">
    <div class="role-select__header">
      <button class="btn btn--ghost" @click="$emit('change-page', 'home')">← 返回</button>
      <h2>你的角色：住院医师</h2>
      <p>你是急诊科值班医师，负责整合各方信息、做出诊断与治疗方案。<br>其他角色的专属线索，需要你主动向他们提问才能获得。</p>
    </div>

    <div class="role-select__grid">
      <RoleAvatar
        :role="doctorRole"
        :selected="true"
        @select="() => {}"
      />
      <div class="role-select__detail">
        <h3>{{ doctorRole.name }}</h3>
        <p>{{ doctorRole.background }}</p>
        <div class="role-select__task">
          <strong>核心任务：</strong>{{ doctorRole.task }}
        </div>
      </div>

      <h3 class="role-select__team-title">你的团队成员（由机器人扮演，可向他们提问）</h3>
      <RoleAvatar
        v-for="role in botRoles"
        :key="role.id"
        :role="role"
        :selected="false"
        @select="() => {}"
      />
    </div>

    <div class="role-select__actions">
      <button class="btn btn--primary" @click="confirmRole">开始接诊，进入第一章</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { roles } from '../data/gameData.js';
import { useGameState } from '../composables/useGameState.js';
import { useRoom } from '../composables/useRoom.js';
import RoleAvatar from '../components/RoleAvatar.vue';

const emit = defineEmits(['change-page']);

const { state, selectRole: setRole, unlockClue } = useGameState();
const { createRoom, fastForwardBots } = useRoom();

// 单机模拟课堂版固定扮演住院医师，其余角色全部由机器人承担
const doctorRole = roles.find(r => r.id === 'doctor');
const botRoles = computed(() => roles.filter(r => r.id !== 'doctor'));

function confirmRole() {
  setRole('doctor');
  // 组建 6 人小组；“继续游戏”时把机器人进度快进到当前章节
  createRoom('doctor');
  fastForwardBots(state.currentChapterIndex, state.answeredQuestionIds.map(q => q.id));
  // 解锁该角色第一张线索
  if (doctorRole.clueIds.length > 0) {
    unlockClue(doctorRole.clueIds[0]);
  }
  emit('change-page', 'chapter');
}
</script>

<style scoped>
.role-select {
  min-height: 100vh;
  max-width: 680px;
  margin: 0 auto;
  padding: 20px;
}

.role-select__header {
  text-align: center;
  margin-bottom: 24px;
}

.role-select__header h2 {
  margin: 12px 0 8px 0;
  color: var(--text-color);
}

.role-select__header p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.role-select__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

/* 机器人角色卡置灰，表示不可选 */
.role-select__grid > .role-avatar:not(:first-child) {
  opacity: 0.6;
  pointer-events: none;
}

.role-select__team-title {
  margin: 16px 0 4px 0;
  font-size: 15px;
  color: var(--text-secondary);
  text-align: center;
}

.role-select__detail {
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.role-select__detail h3 {
  margin: 0 0 10px 0;
  color: var(--primary-color);
}

.role-select__detail p {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 14px;
}

.role-select__task {
  padding: 12px;
  background: var(--primary-light);
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.role-select__actions {
  text-align: center;
}
</style>
