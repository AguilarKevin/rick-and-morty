import type { Ref } from 'vue'

interface UseCharactersDataOptions {
  currentPage: Ref<number>
  search: Ref<string>
  status: Ref<string>
  species: Ref<string>
  favoritesOnly: Ref<boolean>
  favoriteIds: Ref<string[]>
  fetchCharacters: (page: number, name: string, status: string, species: string) => Promise<unknown>
  fetchCharactersByIds: (ids: string[]) => Promise<unknown[]>
}

export async function useCharactersData(options: UseCharactersDataOptions) {
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
  } = await useAsyncData(
    () => `characters:${currentPage.value}:${search.value}:${status.value}:${species.value}`,
    () => fetchCharacters(currentPage.value, search.value, status.value, species.value) as Promise<{ info?: { count?: number, pages?: number }, results?: unknown[] }>,
    {
      server: false
    }
  )

  const { data: favoritesData } = await useAsyncData(
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
    const page = currentPage.value
    const radius = 2
    const start = Math.max(1, page - radius)
    const end = Math.min(pages, page + radius)
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
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
