<script setup lang="ts">
import QuestionCard from '@/components/QuestionCard.vue';
import HistoryCard from '@/components/HistoryCard.vue';
import { useGameStore } from '@/stores/game';
import { onMounted } from 'vue';
import router from '@/router';
import { validGameTypes } from '@/stores/gameTypes';
import { Loader2 } from 'lucide-vue-next';

const props = defineProps({
  gameType: String,
  id: String
})

const gameStore = useGameStore()

onMounted(async () => {
  if (!props.gameType || !validGameTypes.includes(props.gameType)) {
    router.push({ name: 'home' })
  } else {
    try {
      if (props.gameType === 'election' && !props.id) {
        router.push({ name: 'home' })
      } else if (props.gameType === 'election') {
        await gameStore.init(`/${props.gameType}/${props.id}.json`, props.id!)
        gameStore.startGame()
      } else {
        await gameStore.init(`/${props.gameType}.json`, props.gameType)
        gameStore.startGame()
      }
    } catch (error) {
      router.push({ name: 'home' })
    }
  }
})
</script>

<template>
  <main class="max-w-4xl w-full">
    <div v-if="!gameStore.loading">
      <QuestionCard />
      <div class="mt-20 flex flex-col gap-6">
        <TransitionGroup name="list">
          <HistoryCard v-for="question in gameStore.answeredQuestions" :question="question" :key="question.index" />
        </TransitionGroup>
      </div>
    </div>
    <div v-else>
      <div class="w-full flex items-center justify-center h-96">
        <Loader2 class="animate-spin" :size="34" />
      </div>
    </div>
  </main>

</template>
