<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="w-screen min-h-screen bg-brand-950 text-brand-100 flex flex-col items-center px-5 pb-10">
    <div class="w-full max-w-4xl flex items-center justify-between pt-14 pb-20">
      <div class="flex flex-col">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-bold uppercase">
            Wer sagt denn sowas?
          </h1>
          <div class="bg-brand-800 rounded text-xs font-bold px-2 py-1">BTW25</div>
        </div>
        <p class="text-xl text-brand-400">Aus welchem Wahlprogramm stammt dieses Zitat?</p>
      </div>
      <div>
        <a href="https://github.com/lomenzel/btw-quizz" target="_blank"
          class="bg-brand-200 rounded-full p-2 text-brand-950 flex items-center justify-center">
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
