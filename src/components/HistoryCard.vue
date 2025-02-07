<script lang="ts" setup>
import { useGameStore, type Question } from '@/stores/game';
import { Trash } from 'lucide-vue-next';

const props = defineProps<{
    question: Question
}>()

const gameStore = useGameStore()
</script>

<template>
    <div class="flex flex-col items-center justify-center w-full rounded-xl shadow-lg bg-brand-900 px-6 py-5 gap-4 border"
        :class="{
            'border-correct': props.question.answer && props.question.correct === props.question.answer,
            'border-wrong': props.question.answer && props.question.correct !== props.question.answer
        }">
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center justify-between text-xs uppercase gap-2">
                <span>Frage {{ props.question.index }}</span>
                <div class="bg-brand-200 rounded-full h-1 w-1"></div>
                <span>{{ props.question.answer === props.question.correct ? "Richtig" : "Falsch" }} beantwortet</span>
            </div>
            <button @click="gameStore.removeQuestionFromHistory(props.question.index)" class="cursor-pointer">
                <Trash :size="16" />
            </button>
        </div>
        <div class="flex gap-4 h-24 w-full">
            <div class="bg-brand-950 px-4 rounded-lg h-full overflow-hidden flex items-center w-3/4 relative">
                <div class="absolute h-full w-full bg-gradient-to-b from-brand-950 via-transparent to-brand-950"></div>
                <p class="text-xs font-mono"><span v-for="sentence in question.context" :class="{
                    'text-brand-500': sentence !== props.question.sentence,
                    'text-brand-100': sentence === props.question.sentence
                }">{{ sentence + " " }}</span></p>
            </div>
            <div class="flex flex-col gap-2 w-1/4 h-full">
                <div class="flex items-center justify-center rounded-lg h-full truncate w-full" :class="{
                    'bg-correct': props.question.answer && props.question.correct === props.question.answer,
                    'bg-wrong': props.question.answer && props.question.correct !== props.question.answer
                }">
                    {{ props.question.answer }}
                </div>
                <div class="flex items-center justify-center rounded-lg h-full bg-correct">
                    {{ props.question.correct }}
                </div>
            </div>
        </div>
    </div>
</template>