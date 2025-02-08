import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface GameType {
    name: string,
    election?: string,
    sentenceSource: string,
}

export const validGameTypes = ['election', 'mission_statements', 'party_platforms']

export const useGameTypesStore = defineStore('gameTypes', () => {
    const loading = ref(false)

    const gameTypes = ref<GameType[]>([])

    async function fetchGameTypes() {
        loading.value = true
        const reponse = await fetch('/elections.json')
        gameTypes.value = (await reponse.json()).map((gameType: string) => {
            return {
                name: "election",
                election: gameType,
                sentenceSource: `/election/${gameType}.json`,
            }
        })

        gameTypes.value.push(...[{
            name: 'mission_statements',
            sentenceSource: '/mission_statements.json',
        }, {
            name: 'party_platforms',
            sentenceSource: '/party_platforms.json',
        }])

        loading.value = false
        return gameTypes.value
    }

    return {
        loading,
        gameTypes,
        fetchGameTypes,
    }
})