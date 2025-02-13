<script lang="ts" setup>
import { useGameTypesStore } from '@/stores/gameTypes';
import { onMounted } from 'vue';

const gameTypesStore = useGameTypesStore()

onMounted(() => {
    gameTypesStore.fetchGameTypes()
})
</script>

<template>
    <ul class="flex flex-col gap-4 w-full max-w-4xl @container">
        <router-link v-for="gameType in gameTypesStore.gameTypes" :key="gameType.sentenceSource"
            :to="{ name: 'game', params: { gameType: gameType.name, id: gameType.election } }">
            <li
                class="@lg:text-xl text-lg uppercase w-full bg-brand-900 border-black px-4 py-10 rounded-lg font-bold flex items-center justify-center hover:bg-brand-800 transition-all cursor-pointer">
                {{ gameType.election.replace(/btw/, "Bundestagswahl").replace(/bw/,"Bürgerschaftswahl").replace(/_/g, " ") }}
            </li>
        </router-link>
    </ul>
</template>