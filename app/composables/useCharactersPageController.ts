import { storeToRefs } from 'pinia'
import { useRickAndMortyApi } from '~/composables/useRickAndMortyApi'
import { useCharactersData } from '~/composables/characters/useCharactersData'
import { useCharactersQueryController } from '~/composables/characters/useCharactersQueryController'
import { useFavoritesStore } from '~/stores/favorites'
import { usePreferencesStore } from '~/stores/preferences'

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
  const data = useCharactersData({
    currentPage: query.currentPage,
    search: query.search,
    status: query.status,
    species: query.species,
    favoritesOnly: query.favoritesOnly,
    favoriteIds,
    fetchCharacters,
    fetchCharactersByIds
  })

  watch(data.totalPages, (pages) => {
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
    characters: data.characters,
    clearFilters: query.clearFilters,
    currentPage: query.currentPage,
    error: data.error,
    favoriteIconClass,
    favoritesOnly: query.favoritesOnly,
    favoritesStore,
    goToPage: query.goToPage,
    hasActiveFilters: query.hasActiveFilters,
    layoutMode: query.layoutMode,
    openCharacter,
    pending: data.pending,
    searchInput: query.searchInput,
    setLayoutMode: query.setLayoutMode,
    speciesInput: query.speciesInput,
    statusInput: query.statusInput,
    toggleFavoritesFilter: query.toggleFavoritesFilter,
    totalCount: data.totalCount,
    totalPages: data.totalPages,
    visiblePages: data.visiblePages
  }
}
