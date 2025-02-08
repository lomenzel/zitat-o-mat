<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useGameStore } from './stores/game';
import { ChevronsUpDown, RotateCcw } from 'lucide-vue-next';
import router from './router';

const gameStore = useGameStore()
</script>

<template>
  <div class="@container w-screen min-h-screen bg-brand-950 text-brand-100 flex flex-col items-center px-5 pb-10">
    <div class="w-full max-w-4xl flex flex-wrap gap-4 items-center justify-between @lg:pt-14 @lg:pb-16 pt-8 pb-10">
      <div class="flex flex-col">
        <div class="flex items-center gap-4">
          <h1 class="@lg:text-3xl text-xl font-bold uppercase">
            Wer sagt denn sowas?
          </h1>
          <router-link to="/" v-if="gameStore.gameId && router.currentRoute.value.name === 'game'">
            <div class="bg-brand-800 rounded text-xs font-bold pl-2 pr-1 py-1 uppercase flex items-center gap-1">
              {{ gameStore.gameId }}
              <ChevronsUpDown :size="14" />
            </div>
          </router-link>
        </div>
        <p class="@lg:text-xl text-brand-400">Aus welchem Wahlprogramm stammt dieses Zitat?</p>
      </div>
      <div class="flex items-center gap-4 justify-end">
        <button v-if="gameStore.answeredQuestions.length > 0 && router.currentRoute.value.name === 'game'"
          @click="gameStore.resetGame"
          class="bg-brand-200 rounded-full p-2 text-brand-950 flex items-center justify-center cursor-pointer">
          <RotateCcw :size="16" />
        </button>
        <a href="https://github.com/lomenzel/btw-quizz" target="_blank"
          class="bg-brand-200 rounded-full p-2 text-brand-950 flex items-center justify-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-github">
            <path
              d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>
      </div>
    </div>
    <RouterView />
  </div>
</template>
