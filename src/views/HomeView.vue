<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { onMounted } from 'vue';

const gameStore = useGameStore()

onMounted(() => {
  gameStore.loadManifesto()
})
</script>

<template>
  <main>
    <button v-if="!gameStore.currentQuestion" @click="gameStore.startGame" class="p-3 bg-amber-200 cursor-pointer">Spiel
      starten!</button>
    <div v-if="gameStore.currentQuestion">
      <h2>{{ gameStore.currentQuestion.sentence }}</h2>
      <ul>
        <li v-for="option in gameStore.currentQuestion.options" :key="option">
          <button @click="gameStore.answerQuestion(option)">{{ option }}</button>
        </li>
      </ul>
    </div>
  </main>
</template>
