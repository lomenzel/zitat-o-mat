import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

interface Manifesto {
    party: string
    type: string,
    election: string,
    source: string,
    phrases: string[]
}

interface Question {
    index: number,
    sentence: string,
    sentenceIndex: number,
    options: string[]
    correct: string
    answer: string
}

const saveState = (answeredQuestions: Question[]) => {
    const state = { answeredQuestions: answeredQuestions }
    localStorage.setItem('state', JSON.stringify(state))
}

const loadState = () => {
    const state = localStorage.getItem('state')
    if (state) {
        return JSON.parse(state).answeredQuestions
    } else {
        return []
    }
}

export const useGameStore = defineStore('game', () => {
    const loading = ref(false)

    const data = ref<Manifesto[]>([])
    const currentQuestion = ref<Question | null>(null)
    const answeredQuestions = ref<Question[]>(loadState())

    const score = computed(() => answeredQuestions.value.filter(q => q.answer === q.correct).length)

    watch(answeredQuestions, (newValue) => {
        saveState(newValue)
    })

    const loadManifesto = async () => {
        loading.value = true
        const response = await fetch('/result.json')
        data.value = await response.json()
        loading.value = false
    }

    function startGame() {
        console.log('Starting game')
        nextQuestion()
    }

    const nextQuestion = () => {
        if (data.value.length === 0) return
        const manifesto = data.value[Math.floor(Math.random() * data.value.length)]
        const sentenceIndex = Math.floor(Math.random() * manifesto.phrases.length)
        const sentence = manifesto.phrases[sentenceIndex]

        let options = data.value
            .filter(m => m.party !== manifesto.party)
            .map(m => m.party)

        // Shuffle the options and pick three random ones
        options = options.sort(() => 0.5 - Math.random()).slice(0, 3)

        // Add the correct answer and shuffle again
        options.push(manifesto.party)
        options = options.sort(() => 0.5 - Math.random())

        const correct = manifesto.party
        const answer = ''
        currentQuestion.value = { index: answeredQuestions.value.length, sentence, sentenceIndex, options, correct, answer }
    }

    const answerQuestion = (answer: string) => {
        if (!currentQuestion.value) return
        currentQuestion.value.answer = answer
        answeredQuestions.value.push(currentQuestion.value)
        nextQuestion()
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
        answerQuestion
    }
})
