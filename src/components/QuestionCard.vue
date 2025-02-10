<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useGameStore } from '@/stores/game';
import { RedoDot } from 'lucide-vue-next';

const gameStore = useGameStore();

// Referenz auf das <p>-Element, das den Satz enthält
const sentenceRef = ref<HTMLElement | null>(null);

// Funktion, die die Schriftgröße anpasst
const adjustFontSize = () => {
    if (!sentenceRef.value) return;

    // Hole den Container, in dem der Text enthalten ist
    const container = sentenceRef.value.parentElement;
    if (!container) return;

    // Setze zunächst die Schriftgröße auf einen Ausgangswert zurück
    // (z. B. den in CSS definierten Maximalwert)
    sentenceRef.value.style.fontSize = '';

    // Hole die aktuelle Schriftgröße (als Zahl)
    let fontSize = parseFloat(window.getComputedStyle(sentenceRef.value).fontSize);

    // Definiere minimale Schriftgröße, um zu verhindern, dass der Text zu klein wird
    const minFontSize = 12;

    // Falls der Text den Container in Breite oder Höhe überschreitet,
    // verringere die Schriftgröße schrittweise
    while (
        (sentenceRef.value.scrollWidth > container.clientWidth ||
            sentenceRef.value.scrollHeight > container.clientHeight - 64) &&
        fontSize > minFontSize
    ) {
        fontSize -= 1;
        sentenceRef.value.style.fontSize = fontSize + 'px';
    }
};

onMounted(() => {
    // Warte, bis der DOM vollständig gerendert ist
    nextTick(() => {
        adjustFontSize();
    });
});

// Beobachte, wenn sich der Satz ändert, und passe die Schriftgröße erneut an
watch(
    () => gameStore.currentQuestion?.sentence,
    async () => {
        // Warte, bis der neue Satz im DOM gerendert wurde
        await nextTick();
        // Setze die Schriftgröße zurück (z. B. auf den CSS-Standardwert)
        if (sentenceRef.value) {
            sentenceRef.value.style.fontSize = '';
        }
        adjustFontSize();
    }
);
</script>

<template>
    <div :class="{
        'input-error': gameStore.currentQuestion?.answer && gameStore.currentQuestion?.correct !== gameStore.currentQuestion?.answer,
        'input-success': gameStore.currentQuestion?.answer && gameStore.currentQuestion?.correct === gameStore.currentQuestion?.answer
    }"
        class="@container flex flex-col items-center justify-center w-full rounded-xl shadow-lg bg-brand-900 px-5 py-5 gap-4 @lg:px-10 @lg:py-8 @lg:gap-6 border-black border">
        <div class="flex items-center justify-between w-full">
            <span class="text-sm uppercase">Frage {{ gameStore.currentQuestion?.index }}</span>
            <button class="cursor-pointer" @click="gameStore.nextQuestion">
                <RedoDot :size="18" />
            </button>
        </div>
        <div
            class="bg-brand-950 px-2 py-4 @lg:px-4 @lg:py-8 w-full rounded-lg font-mono flex justify-center items-center h-36 overflow-y-auto">
            <!-- Binde die Referenz an das p-Element -->
            <p ref="sentenceRef" class="text-center">
                {{ gameStore.currentQuestion?.sentence }}
            </p>
        </div>
        <div class="@sm:grid-cols-2 grid-cols-1 grid w-full gap-4">
            <button v-for="option in gameStore.currentQuestion?.options" @click="gameStore.answerQuestion(option)"
                class="bg-brand-800 w-full @lg:text-lg p-4 rounded-lg cursor-pointer transition-all" :class="{
                    'bg-correct duration-150 ease-initial': gameStore.currentQuestion?.answer && gameStore.currentQuestion?.correct === option,
                    'bg-wrong duration-150 ease-initial': gameStore.currentQuestion?.answer === option && gameStore.currentQuestion?.correct !== option,
                    'bg-brand-800 hover:bg-brand-700 duration-300': !gameStore.currentQuestion?.answer
                }">
                <span class="block truncate">{{ option }}</span>
            </button>
        </div>
    </div>
</template>


<style scoped>
@keyframes shake {
    0% {
        transform: translateX(0);
    }

    20% {
        transform: translateX(-10px);
    }

    40% {
        transform: translateX(10px);
    }

    60% {
        transform: translateX(-8px);
    }

    80% {
        transform: translateX(8px);
    }

    100% {
        transform: translateX(0);
    }
}

@keyframes success {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }

    50% {
        transform: scale(1.01);
        opacity: 1;
    }

    100% {
        transform: scale(1);
    }
}


.input-success {
    animation: success 0.3s ease-in-out;
}

.input-error {
    animation: shake 0.3s ease-in-out;
}
</style>