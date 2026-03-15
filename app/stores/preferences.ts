import { defineStore } from 'pinia'

const STORAGE_KEY = 'rm-theme'

type Theme = 'light' | 'dark'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    theme: 'light' as Theme,
    hydrated: false
  }),

  actions: {
    loadTheme() {
      if (typeof localStorage === 'undefined') {
        return
      }

      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'light' || saved === 'dark') {
        this.theme = saved
      }

      this.hydrated = true
    },

    setTheme(value: Theme) {
      this.theme = value

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, value)
      }
    },

    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    }
  }
})
