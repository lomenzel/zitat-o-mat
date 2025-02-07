<script setup lang="ts">
import QuestionCard from '@/components/QuestionCard.vue';
import HistoryCard from '@/components/HistoryCard.vue';
import { useGameStore } from '@/stores/game';
import { onMounted } from 'vue';

const gameStore = useGameStore()

onMounted(async () => {
  await gameStore.loadManifesto()
  gameStore.startGame()
})
</script>

<template>
  <main class="max-w-4xl w-full">
    <QuestionCard />
    <div class="mt-20 flex flex-col gap-6">
      <TransitionGroup name="list">
        <HistoryCard v-for="question in gameStore.answeredQuestions" :question="question" :key="question.index" />
      </TransitionGroup>
    </div>
  </main>
</template>
