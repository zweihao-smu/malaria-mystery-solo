<template>
  <!-- 不用 transition 包裹：后台标签页 rAF 暂停会让过渡卡住，导致页面不同步 -->
  <component
    :is="currentView"
    @change-page="changePage"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import Home from './views/Home.vue';
import RoleSelect from './views/RoleSelect.vue';
import Chapter from './views/Chapter.vue';
import Quiz from './views/Quiz.vue';
import ChapterSummary from './views/ChapterSummary.vue';
import EndGame from './views/EndGame.vue';

const pages = {
  home: Home,
  'role-select': RoleSelect,
  chapter: Chapter,
  quiz: Quiz,
  'chapter-summary': ChapterSummary,
  'end-game': EndGame
};

const currentPage = ref('home');

const currentView = computed(() => pages[currentPage.value] || Home);

function changePage(page) {
  currentPage.value = page;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
