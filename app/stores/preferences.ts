import { defineStore } from 'pinia'

const STORAGE_KEYS = {
  theme: 'rm-theme',
  layout: 'rm-layout'
} as const

type Theme = 'light' | 'dark'
type LayoutMode = 'table' | 'grid'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    theme: 'light' as Theme,
    layout: 'table' as LayoutMode,
    hydrated: false
  }),

  actions: {
    loadTheme() {
      if (typeof localStorage === 'undefined') {
        return
      }

      const saved = localStorage.getItem(STORAGE_KEYS.theme)
      if (saved === 'light' || saved === 'dark') {
        this.theme = saved
      }

      this.hydrated = true
    },

    setTheme(value: Theme) {
      this.theme = value

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.theme, value)
      }
    },

    loadLayout() {
      if (typeof localStorage === 'undefined') {
        return
      }

      const saved = localStorage.getItem(STORAGE_KEYS.layout)
      if (saved === 'table' || saved === 'grid') {
        this.layout = saved
      }
    },

    setLayout(value: LayoutMode) {
      this.layout = value

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.layout, value)
      }
    },

    toggleTheme() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    }
  }
})
