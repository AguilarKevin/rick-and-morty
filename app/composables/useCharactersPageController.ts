import { storeToRefs } from 'pinia'
import { useRickAndMortyApi } from '~/composables/useRickAndMortyApi'
import { useCharactersQueryController } from '~/composables/characters/useCharactersQueryController'
import { useFavoritesStore } from '~/stores/favorites'
import { usePreferencesStore } from '~/stores/preferences'
import type { Character, CharactersResponse } from '~/types/character'
import { buildVisiblePages } from '~/utils/pagination'

export function useCharactersPageController() {
  const route = useRoute()
  const { fetchCharacters, fetchCharactersByIds } = useRickAndMortyApi()
  const favoritesStore = useFavoritesStore()
  const preferencesStore = usePreferencesStore()
  const { ids: favoriteIds } = storeToRefs(favoritesStore)

  onMounted(() => {
    favoritesStore.loadFromStorage()
    preferencesStore.loadLayout()
  })

  const query = useCharactersQueryController(preferencesStore)
  const {
    data: charactersResponse,
    pending,
    error
  } = useAsyncData<CharactersResponse>(
    () => `characters:${query.currentPage.value}:${query.search.value}:${query.status.value}:${query.species.value}`,
    () => fetchCharacters(query.currentPage.value, query.search.value, query.status.value, query.species.value)
  )

  const { data: favoritesData } = useAsyncData<Character[]>(
    () => `favorites:${query.favoritesOnly.value ? favoriteIds.value.join(',') : 'inactive'}`,
    async () => query.favoritesOnly.value ? fetchCharactersByIds(favoriteIds.value) : [],
    {
      server: false
    }
  )

  const favoritesPageSize = 20

  const paginatedFavorites = computed(() => {
    const items = favoritesData.value ?? []
    const start = (query.currentPage.value - 1) * favoritesPageSize
    return items.slice(start, start + favoritesPageSize)
  })

  const characters = computed(() => (
    query.favoritesOnly.value
      ? paginatedFavorites.value
      : (charactersResponse.value?.results ?? [])
  ))

  const totalCount = computed(() => (
    query.favoritesOnly.value
      ? (favoritesData.value?.length ?? 0)
      : (charactersResponse.value?.info?.count ?? 0)
  ))

  const totalPages = computed(() => {
    if (query.favoritesOnly.value) {
      const total = favoritesData.value?.length ?? 0
      return total > 0 ? Math.ceil(total / favoritesPageSize) : 0
    }

    return charactersResponse.value?.info?.pages ?? 0
  })

  const visiblePages = computed(() => (
    buildVisiblePages(query.currentPage.value, totalPages.value)
  ))

  watch(totalPages, (pages) => {
    if (pages > 0 && query.currentPage.value > pages) {
      query.goToPage(pages)
    }
  })

  const openCharacter = (id: string) => {
    navigateTo({
      path: `/character/${id}`,
      query: route.query
    })
  }

  const favoriteIconClass = (id: string) => (
    favoritesStore.isFavorite(id) ? 'text-rose-500 [&_path]:fill-current' : ''
  )

  return {
    characters,
    clearFilters: query.clearFilters,
    currentPage: query.currentPage,
    error,
    favoriteIconClass,
    favoritesOnly: query.favoritesOnly,
    favoritesStore,
    goToPage: query.goToPage,
    hasActiveFilters: query.hasActiveFilters,
    layoutMode: query.layoutMode,
    openCharacter,
    pending,
    searchInput: query.searchInput,
    setLayoutMode: query.setLayoutMode,
    speciesInput: query.speciesInput,
    statusInput: query.statusInput,
    toggleFavoritesFilter: query.toggleFavoritesFilter,
    totalCount,
    totalPages,
    visiblePages
  }
}
