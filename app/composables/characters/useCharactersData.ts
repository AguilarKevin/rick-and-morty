import type { Ref } from 'vue'
import type { Character, CharactersResponse } from '~/types/character'

interface UseCharactersDataOptions {
  currentPage: Ref<number>
  search: Ref<string>
  status: Ref<string>
  species: Ref<string>
  favoritesOnly: Ref<boolean>
  favoriteIds: Ref<string[]>
  fetchCharacters: (page: number, name: string, status: string, species: string) => Promise<CharactersResponse>
  fetchCharactersByIds: (ids: string[]) => Promise<Character[]>
}

export function useCharactersData(options: UseCharactersDataOptions) {
  const {
    currentPage,
    search,
    status,
    species,
    favoritesOnly,
    favoriteIds,
    fetchCharacters,
    fetchCharactersByIds
  } = options

  const {
    data: charactersResponse,
    pending,
    error
  } = useAsyncData<CharactersResponse>(
    () => `characters:${currentPage.value}:${search.value}:${status.value}:${species.value}`,
    () => fetchCharacters(currentPage.value, search.value, status.value, species.value),
    {
      server: false
    }
  )

  const { data: favoritesData } = useAsyncData<Character[]>(
    () => `favorites:${favoritesOnly.value ? favoriteIds.value.join(',') : 'inactive'}`,
    async () => favoritesOnly.value ? fetchCharactersByIds(favoriteIds.value) : [],
    {
      server: false
    }
  )

  const favoritesPageSize = 20

  const paginatedFavorites = computed(() => {
    const items = favoritesData.value ?? []
    const start = (currentPage.value - 1) * favoritesPageSize
    return items.slice(start, start + favoritesPageSize)
  })

  const characters = computed(() => (
    favoritesOnly.value
      ? paginatedFavorites.value
      : (charactersResponse.value?.results ?? [])
  ))

  const totalCount = computed(() => (
    favoritesOnly.value
      ? (favoritesData.value?.length ?? 0)
      : (charactersResponse.value?.info?.count ?? 0)
  ))

  const totalPages = computed(() => {
    if (favoritesOnly.value) {
      const total = favoritesData.value?.length ?? 0
      return total > 0 ? Math.ceil(total / favoritesPageSize) : 0
    }

    return charactersResponse.value?.info?.pages ?? 0
  })

  const visiblePages = computed(() => {
    const pages = totalPages.value
    const maxVisiblePages = 5

    if (pages < 1) {
      return []
    }

    const page = currentPage.value
    const start = Math.min(
      Math.max(page - Math.floor(maxVisiblePages / 2), 1),
      Math.max(pages - maxVisiblePages + 1, 1)
    )
    const length = Math.min(maxVisiblePages, pages)

    return Array.from({ length }, (_, index) => start + index)
  })

  return {
    characters,
    error,
    pending,
    totalCount,
    totalPages,
    visiblePages
  }
}
