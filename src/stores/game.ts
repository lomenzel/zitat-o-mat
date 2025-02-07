import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Manifesto {
    party: string
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
    context?: string[]
}

export interface GameState {
    answeredQuestions: Question[],
    index: number
}

const saveState = (gamestate: GameState) => {
    localStorage.setItem('state', JSON.stringify(gamestate))
}

const loadState = () => {
    const state = localStorage.getItem('state')
    if (state) {
        return JSON.parse(state)
    } else {
        return []
    }
}

export const useGameStore = defineStore('game', () => {
    const loading = ref(false)

    const data = ref<Manifesto[]>([])
    const currentQuestion = ref<Question | null>(null)
    const answeredQuestions = ref<Question[]>(loadState().answeredQuestions || [])
    const currentIndex = ref(loadState().index || 0)

    const score = computed(() => answeredQuestions.value.filter(q => q.answer === q.correct).length)

    const loadManifesto = async () => {
        loading.value = true
        const response = await fetch('/data.json')
        data.value = await response.json()
        loading.value = false
    }

    function startGame() {
        nextQuestion()
    }

    const nextQuestion = () => {
        if (data.value.length === 0) return
        const manifesto = data.value[Math.floor(Math.random() * data.value.length)]
        const sentenceIndex = Math.floor(Math.random() * manifesto.phrases.length)
        const sentence = manifesto.phrases[sentenceIndex]

        if (answeredQuestions.value.some(q => q.sentence === sentence && q.sentenceIndex === sentenceIndex && q.correct === manifesto.party)) {
            nextQuestion()
            return
        }

        let options = data.value
            .filter(m => m.party !== manifesto.party)
            .map(m => m.party)

        // Shuffle the options and pick three random ones
        options = options.sort(() => 0.5 - Math.random()).slice(0, 3)

        // Add the correct answer and shuffle again
        options.push(manifesto.party)
        options = options.sort(() => 0.5 - Math.random())

        const index = sentenceIndex
        const sentences = manifesto.phrases
        const start = Math.max(0, index - 2)
        const end = Math.min(sentences?.length || 0, index + 3)
        const context = sentences?.slice(start, end)

        const correct = manifesto.party
        const answer = ''
        currentQuestion.value = { index: ++currentIndex.value, sentence, sentenceIndex, options, correct, answer, context }
    }

    const answerQuestion = async (answer: string) => {
        if (!currentQuestion.value || currentQuestion.value.answer) return
        currentQuestion.value.answer = answer
        // Insert the current question to the start of the answeredQuestions array
        answeredQuestions.value = [currentQuestion.value, ...answeredQuestions.value]
        saveState({ answeredQuestions: answeredQuestions.value, index: currentIndex.value })
        await sleep(1000)
        nextQuestion()
    }

    const deleteState = () => {
        localStorage.removeItem('state')
        answeredQuestions.value = []
        currentIndex.value = 0
    }

    function removeQuestionFromHistory(index: number) {
        answeredQuestions.value = answeredQuestions.value.filter(q => q.index !== index)
        saveState({ answeredQuestions: answeredQuestions.value, index: currentIndex.value })
    }

    return {
        loading,
        data,
        currentQuestion,
        answeredQuestions,
        score,
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
