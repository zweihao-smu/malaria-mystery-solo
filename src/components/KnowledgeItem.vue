<template>
  <div class="knowledge-item">
    <div class="knowledge-item__header" @click="isOpen = !isOpen">
      <h4>{{ item.title }}</h4>
      <span class="knowledge-item__toggle">{{ isOpen ? '▲' : '▼' }}</span>
    </div>
    <div v-show="isOpen" class="knowledge-item__body">
      <ul>
        <li v-for="(point, idx) in item.points" :key="idx">{{ point }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  item: { type: Object, required: true }
});

const isOpen = ref(false);
</script>

<style scoped>
.knowledge-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  overflow: hidden;
}

.knowledge-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  background: var(--primary-light);
}

.knowledge-item__header h4 {
  margin: 0;
  color: var(--text-color);
  font-size: 15px;
}

.knowledge-item__toggle {
  color: var(--primary-color);
  font-size: 12px;
}

.knowledge-item__body {
  padding: 12px 16px;
}

.knowledge-item__body ul {
  margin: 0;
  padding-left: 18px;
}

.knowledge-item__body li {
  margin-bottom: 8px;
  line-height: 1.6;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
