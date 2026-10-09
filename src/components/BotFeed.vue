<template>
  <div class="bot-feed">
    <h4 class="bot-feed__title">👥 小组动态</h4>
    <div class="bot-feed__list">
      <p v-if="!items.length" class="bot-feed__empty">等待其他同学行动……</p>
      <div
        v-for="item in items"
        :key="item.id"
        class="bot-feed__item"
        :class="`bot-feed__item--${item.kind}`"
      >{{ item.text }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
});
</script>

<style scoped>
.bot-feed {
  margin: 20px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.bot-feed__title {
  margin: 0;
  padding: 10px 14px;
  background: var(--primary-light);
  color: var(--text-color);
  font-size: 14px;
}

.bot-feed__list {
  max-height: 140px;
  overflow-y: auto;
  padding: 8px 14px;
}

.bot-feed__empty {
  margin: 6px 0;
  font-size: 13px;
  color: var(--muted-color);
}

.bot-feed__item {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
  border-bottom: 1px dashed var(--border-color);
  line-height: 1.5;
}

.bot-feed__item:last-child {
  border-bottom: none;
}

.bot-feed__item--clue {
  color: var(--primary-color);
}
</style>
