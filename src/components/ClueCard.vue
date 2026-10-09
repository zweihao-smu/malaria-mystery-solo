<template>
  <div class="clue-card" :class="`owner-${clue.owner}`">
    <div class="clue-card__header">
      <span class="clue-card__id">{{ clue.id }}</span>
      <span class="clue-card__owner">{{ clue.owner }}</span>
    </div>
    <h4 class="clue-card__title">{{ clue.title }}</h4>
    <p class="clue-card__content">{{ clue.content }}</p>
  </div>
</template>

<script setup>
defineProps({
  clue: { type: Object, required: true }
});
</script>

<style scoped>
.clue-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  border-left: 4px solid var(--primary-color);
}

.clue-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.clue-card__id {
  font-size: 12px;
  color: var(--muted-color);
  font-weight: 600;
}

.clue-card__owner {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
  background: var(--tag-bg);
  color: var(--tag-color);
}

.clue-card__title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: var(--text-color);
}

.clue-card__content {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
