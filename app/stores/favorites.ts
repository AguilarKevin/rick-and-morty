import { defineStore } from 'pinia'

const STORAGE_KEY = 'rm-favorites'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    ids: [] as string[]
  }),

  getters: {
    isFavorite: state => (id: string) => state.ids.includes(id)
  },

  actions: {
    loadFromStorage() {
      if (typeof localStorage === 'undefined') {
        return
      }

      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return
      }

      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          this.ids = parsed.map(value => String(value))
        }
      } catch {
        this.ids = []
      }
    },

    saveToStorage() {
      if (typeof localStorage === 'undefined') {
        return
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids))
    },

    add(id: string) {
      if (this.ids.includes(id)) {
        return
      }

      this.ids.push(id)
      this.saveToStorage()
    },

    remove(id: string) {
      this.ids = this.ids.filter(item => item !== id)
      this.saveToStorage()
    },

    toggle(id: string) {
      if (this.isFavorite(id)) {
        this.remove(id)
      } else {
        this.add(id)
      }
    }
  }
})
