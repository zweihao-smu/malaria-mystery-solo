<template>
  <div class="story-card" :class="{ revealed: revealed }">
    <div class="story-card__icon">📖</div>
    <div class="story-card__content">
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
  revealed: { type: Boolean, default: true }
});
</script>

<style scoped>
.story-card {
  display: flex;
  gap: 14px;
  background: white;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  opacity: 0.5;
  transform: translateY(8px);
  transition: all 0.4s ease;
}

.story-card.revealed {
  opacity: 1;
  transform: translateY(0);
}

.story-card__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.story-card__content {
  flex: 1;
}

.story-card__content p {
  margin: 0;
  line-height: 1.7;
  color: var(--text-color);
}
</style>
