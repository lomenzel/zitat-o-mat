import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

export type Theme = {
    name: string,
    color: string,
    class: string,
}

export const themes: Theme[] = [
    { name: 'light', color: '#ffffff', class: '' },
    { name: 'dark', color: '#000000', class: 'dark' },
]

export const useUIPreferencesStore = defineStore('uiPreferences', () => {
    let initialized = false

    const theme = ref<Theme>(JSON.parse(localStorage.getItem('theme') || 'null') || getDefaultTheme())

    function setTheme(newTheme: Theme, save = true) {
        theme.value = newTheme
        if (save)
            localStorage.setItem('theme', JSON.stringify(newTheme))
    }

    function applyTheme() {
        document.documentElement.classList.remove(...themes.filter(t => t.class).map(theme => theme.class))
        if (theme.value.class) {
            document.documentElement.classList.add(theme.value.class)
        }
    }

    function resetToDefaultTheme() {
        setTheme(getDefaultTheme())
        localStorage.removeItem('theme')
    }

    function getDefaultTheme() {
        // Get the user preference for dark mode
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
        console.log(prefersDarkScheme)
        // Use the user preference if available
        if (prefersDarkScheme.matches) {
            return themes.find(theme => theme.name === 'dark') || themes[0]
        } else {
            return themes.find(theme => theme.name === 'light') || themes[0]
        }
    }

    function initSystemPreferenceWatcher() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', function (e) {
            console.log("change")
            if (e.matches) {
                setTheme(themes.find(theme => theme.name === 'dark') || themes[0], false)
            } else {
                setTheme(themes.find(theme => theme.name === 'light') || themes[0], false)
            }
        });
    }

    function init() {
        if (!initialized) {
            initSystemPreferenceWatcher()
            initialized = true
        }
    }

    return {
        theme: computed(() => {
            applyTheme()
            return theme.value
        }),
        setTheme,
        resetToDefaultTheme,
        init,
    }
})