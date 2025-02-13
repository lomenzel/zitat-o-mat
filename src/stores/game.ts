import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Party {
    short_name: string // Used as ID
    full_name: string
    color: {
        r: number
        g: number
        b: number
    },
    election: string
    website: string
    wikipedia: string
    logo: {
        svg: string
    }
}

export type GameId = string

export interface Manifesto {
    party: Party,
    type: string,
    election: string,
    source: string,
    phrases: string[]
}

export interface Question {
    index: number,
    sentence: string,
    sentenceIndex: number,
    options: string[]
    correct: string
    answer: string,
    program_type: string,
    context?: string[]
}

export interface GameState {
    answeredQuestions: Question[],
    index: number
}

function saveState(gamestate: GameState, election: GameId) {
    localStorage.setItem('state_' + election, JSON.stringify(gamestate))
}

function loadState(election: GameId): GameState {
    const state = localStorage.getItem('state_' + election)
    if (state) {
        return JSON.parse(state)
    } else {
        return { answeredQuestions: [], index: 0 }
    }
}

export const useGameStore = defineStore('game', () => {
    const loading = ref(false)

    const gameId = ref<GameId | null>(null)
    const data = ref<Manifesto[]>([])
    const currentQuestion = ref<Question | null>(null)
    const answeredQuestions = ref<Question[]>([])
    const currentIndex = ref(0)

    const score = computed(() => answeredQuestions.value.filter(q => q.answer === q.correct).length)

    async function init(sentenceSource: string, gameType: string) {
        loading.value = true

        gameId.value = gameType

        await loadManifesto(sentenceSource)

        const state = loadState(gameId.value!)
        answeredQuestions.value = state.answeredQuestions
        currentIndex.value = state.index

        loading.value = false
    }

    function checkIfLoaded() {
        return data.value.length > 0
    }

    async function loadManifesto(url: string) {
        const response = await fetch(url)
        data.value = await response.json()
    }

    function startGame() {
        if (!checkIfLoaded()) return

        nextQuestion()
    }

    function nextQuestion() {
        if (!checkIfLoaded()) return

        if (data.value.length === 0) return
        const manifesto = data.value[Math.floor(Math.random() * data.value.length)]

        const sentenceIndex = Math.floor(Math.random() * manifesto.phrases.length)
        const sentence = manifesto.phrases[sentenceIndex]

        if (answeredQuestions.value.some(q => q.sentence === sentence && q.sentenceIndex === sentenceIndex && q.correct === manifesto.party.short_name)) {
            nextQuestion()
            return
        }

        let options = data.value
            .filter(m => m.party.short_name !== manifesto.party.short_name)
            .map(m => m.party.short_name)

        // Shuffle the options and pick three random ones
        options = options.sort(() => 0.5 - Math.random()).slice(0, Math.min(3, options.length))

        // Add the correct answer and shuffle again
        options.push(manifesto.party.short_name)
        options = options.sort(() => 0.5 - Math.random())

        const index = sentenceIndex
        const sentences = manifesto.phrases
        const start = Math.max(0, index - 2)
        const end = Math.min(sentences?.length || 0, index + 3)
        const context = sentences?.slice(start, end)

        const correct = manifesto.party.short_name
        const answer = ''
        currentQuestion.value = { index: ++currentIndex.value, sentence, sentenceIndex, options, correct, answer, context, program_type: manifesto.type }
    }

    async function answerQuestion(answer: string) {
        if (!checkIfLoaded()) return


        if (!currentQuestion.value || currentQuestion.value.answer) return
        currentQuestion.value.answer = answer
        // Insert the current question to the start of the answeredQuestions array
        answeredQuestions.value = [currentQuestion.value, ...answeredQuestions.value]
        saveState({ answeredQuestions: answeredQuestions.value, index: currentIndex.value }, gameId.value!)
        await sleep(1000)
        nextQuestion()
    }

    function resetGame() {
        if (!checkIfLoaded()) return

        localStorage.removeItem('state_' + gameId.value)
        answeredQuestions.value = []
        currentIndex.value = 0
        nextQuestion()
    }

    function removeQuestionFromHistory(index: number) {
        if (!checkIfLoaded()) return

        answeredQuestions.value = answeredQuestions.value.filter(q => q.index !== index)
        saveState({ answeredQuestions: answeredQuestions.value, index: currentIndex.value }, gameId.value!)
    }

    return {
        gameId,
        loading,
        data,
        currentQuestion,
        answeredQuestions,
        score,
        resetGame,
        init,
        loadManifesto,
        startGame,
        nextQuestion,
        answerQuestion,
        removeQuestionFromHistory
    }
})

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
