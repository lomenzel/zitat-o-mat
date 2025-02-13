<script lang="ts" setup>
import { useGameStore, type Question } from '@/stores/game';
import { Trash } from 'lucide-vue-next';

const props = defineProps<{
    question: Question
}>()

const gameStore = useGameStore()
</script>

<template>
    <div class="@container flex flex-col items-center justify-center w-full rounded-xl shadow-lg bg-brand-900 @lg:px-6 @lg:py-5 px-3 py-3 gap-4 border"
        :class="{
            'border-correct': props.question.answer && props.question.correct === props.question.answer,
            'border-wrong': props.question.answer && props.question.correct !== props.question.answer
        }">
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center justify-between text-xs uppercase gap-2">
                <span>Frage {{ props.question.index }}</span>
                <div class="bg-brand-200 rounded-full h-1 w-1"></div>
                <span>{{ props.question.answer === props.question.correct ? "Richtig" : "Falsch" }} beantwortet</span>
                <div v-if="props.question.program_type != 'election'" class="bg-brand-200 rounded-full h-1 w-1"></div>
                <span v-if="props.question.program_type != 'election'">Auf {{ props.question.program_type == "mission_statement"? "Leitbild" : "Grundsatzprogramm" }} zurückgegriffen</span>
            </div>
            <button @click="gameStore.removeQuestionFromHistory(props.question.index)" class="cursor-pointer">
                <Trash :size="16" />
            </button>
        </div>
        <div class="flex gap-4 @md:h-24 h-64 w-full @md:flex-row flex-col">
            <div
                class="bg-brand-950 px-4 rounded-lg h-full overflow-hidden flex items-center @md:w-3/4 w-full relative">
                <div class="absolute h-full w-full bg-gradient-to-b from-brand-950 via-transparent to-brand-950"></div>
                <p class="text-xs font-mono"><span v-for="sentence in question.context" :class="{
                    'text-brand-500': sentence !== props.question.sentence,
                    'text-brand-100': sentence === props.question.sentence
                }">{{ sentence + " " }}</span></p>
            </div>
            <div class="flex flex-col gap-2 @md:w-1/4 w-full @md:h-full">
                <div class="flex items-center justify-center rounded-lg h-full px-2 py-2 w-full" :class="{
                    'bg-correct': props.question.answer && props.question.correct === props.question.answer,
                    'bg-wrong': props.question.answer && props.question.correct !== props.question.answer
                }">
                    <span class="block truncate">{{ props.question.answer }}</span>
                </div>
                <div class="flex items-center justify-center rounded-lg h-full bg-correct px-2 py-2 w-full">
                    <span class="block truncate">{{ props.question.correct }}</span>
                </div>
            </div>
        </div>
    </div>
</template>