import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFavoritesStore } from '../app/stores/favorites'

function createStorageMock() {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    }
  }
}

describe('favorites store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    const storage = createStorageMock()
    vi.stubGlobal('localStorage', storage)
  })

  it('adds and removes favorites correctly', () => {
    const store = useFavoritesStore()

    store.add('1')
    store.add('2')

    expect(store.ids).toEqual(['1', '2'])
    expect(store.isFavorite('2')).toBe(true)

    store.remove('1')

    expect(store.ids).toEqual(['2'])
    expect(store.isFavorite('1')).toBe(false)
  })

  it('loads persisted ids from localStorage', () => {
    const store = useFavoritesStore()

    localStorage.setItem('rm-favorites', JSON.stringify(['4', '6']))
    store.loadFromStorage()

    expect(store.ids).toEqual(['4', '6'])
  })
})
