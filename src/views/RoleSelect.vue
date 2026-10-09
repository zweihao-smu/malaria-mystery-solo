<template>
  <div class="role-select">
    <div class="role-select__header">
      <button class="btn btn--ghost" @click="$emit('change-page', 'home')">← 返回</button>
      <h2>选择你的角色</h2>
      <p>每个角色拥有不同的专属线索和视角，其余角色由机器人同学扮演</p>
    </div>

    <div class="role-select__grid">
      <RoleAvatar
        v-for="role in roles"
        :key="role.id"
        :role="role"
        :selected="selectedRoleId === role.id"
        @select="selectRole"
      />
    </div>

    <div v-if="selectedRole" class="role-select__detail">
      <h3>{{ selectedRole.name }}</h3>
      <p>{{ selectedRole.background }}</p>
      <div class="role-select__task">
        <strong>核心任务：</strong>{{ selectedRole.task }}
      </div>
    </div>

    <div class="role-select__actions">
      <button
        class="btn btn--primary"
        :disabled="!selectedRoleId"
        @click="confirmRole"
      >确认角色，进入第一章</button>
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

const selectedRoleId = computed({
  get: () => state.selectedRoleId,
  set: (id) => setRole(id)
});

const selectedRole = computed(() =>
  roles.find(r => r.id === selectedRoleId.value)
);

function selectRole(id) {
  selectedRoleId.value = id;
}

function confirmRole() {
  if (!selectedRoleId.value) return;
  // 组建 6 人小组：其余角色分给机器人；“继续游戏”时把机器人进度快进到当前章节
  createRoom(selectedRoleId.value);
  fastForwardBots(state.currentChapterIndex, state.answeredQuestionIds.map(q => q.id));
  // 解锁该角色第一张线索
  const role = roles.find(r => r.id === selectedRoleId.value);
  if (role && role.clueIds.length > 0) {
    unlockClue(role.clueIds[0]);
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
}

.role-select__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.role-select__detail {
  background: white;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
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
