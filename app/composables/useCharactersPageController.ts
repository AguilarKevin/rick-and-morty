import { storeToRefs } from 'pinia'
import { useRickAndMortyApi } from '~/composables/useRickAndMortyApi'
import { useFavoritesStore } from '~/stores/favorites'
import { usePreferencesStore } from '~/stores/preferences'
import { debounce } from '~/utils/debounce'

export async function useCharactersPageController() {
  const route = useRoute()
  const router = useRouter()

  const { fetchCharacters, fetchCharactersByIds } = useRickAndMortyApi()
  const favoritesStore = useFavoritesStore()
  const preferencesStore = usePreferencesStore()
  const { ids: favoriteIds } = storeToRefs(favoritesStore)

  onMounted(() => {
    favoritesStore.loadFromStorage()
    preferencesStore.loadLayout()
  })

  const searchInput = ref(typeof route.query.search === 'string' ? route.query.search : '')
  const speciesInput = ref(typeof route.query.species === 'string' ? route.query.species : '')
  const statusInput = ref(typeof route.query.status === 'string' ? route.query.status : 'all')

  const currentPage = computed(() => {
    const raw = Number(route.query.page ?? 1)
    return Number.isFinite(raw) && raw > 0 ? raw : 1
  })

  const search = computed(() => (
    typeof route.query.search === 'string' ? route.query.search.trim() : ''
  ))
  const species = computed(() => (
    typeof route.query.species === 'string' ? route.query.species.trim() : ''
  ))
  const status = computed(() => (
    typeof route.query.status === 'string' ? route.query.status.trim() : ''
  ))

  const favoritesOnly = computed(() => route.query.favorites === '1')
  const layoutMode = computed<'table' | 'grid'>(() => {
    if (route.query.layout === 'grid' || route.query.layout === 'table') {
      return route.query.layout
    }

    return preferencesStore.layout
  })

  watch(search, (value) => {
    if (value !== searchInput.value) {
      searchInput.value = value
    }
  }, { immediate: true })

  watch(species, (value) => {
    if (value !== speciesInput.value) {
      speciesInput.value = value
    }
  }, { immediate: true })

  watch(status, (value) => {
    const normalized = value || 'all'
    if (normalized !== statusInput.value) {
      statusInput.value = normalized
    }
  }, { immediate: true })

  const updateQuery = (patch: Record<string, string | undefined>) => {
    const next = {
      ...route.query,
      ...patch
    }

    const sanitized = Object.entries(next).reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        accumulator[key] = value
      }

      return accumulator
    }, {})

    const current = Object.entries(route.query).reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        accumulator[key] = value
      }

      return accumulator
    }, {})

    const hasSameQuery = Object.keys(sanitized).length === Object.keys(current).length
      && Object.entries(sanitized).every(([key, value]) => current[key] === value)

    if (hasSameQuery) {
      return
    }

    router.push({
      query: sanitized
    })
  }

  const applyFilters = debounce((payload: { search: string, species: string }) => {
    updateQuery({
      search: payload.search || undefined,
      species: payload.species || undefined,
      page: '1'
    })
  }, 350)

  watch(searchInput, (value) => {
    applyFilters({
      search: value,
      species: speciesInput.value
    })
  })

  watch(speciesInput, (value) => {
    applyFilters({
      search: searchInput.value,
      species: value
    })
  })

  watch(statusInput, (value) => {
    updateQuery({
      status: value === 'all' ? undefined : value,
      page: '1'
    })
  })

  const {
    data: charactersResponse,
    pending,
    error
  } = await useAsyncData(
    () => `characters:${currentPage.value}:${search.value}:${status.value}:${species.value}`,
    () => fetchCharacters(currentPage.value, search.value, status.value, species.value),
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
      : (charactersResponse.value?.info.count ?? 0)
  ))

  const totalPages = computed(() => {
    if (favoritesOnly.value) {
      const total = favoritesData.value?.length ?? 0
      return total > 0 ? Math.ceil(total / favoritesPageSize) : 0
    }

    return charactersResponse.value?.info.pages ?? 0
  })

  const visiblePages = computed(() => {
    const pages = totalPages.value
    const page = currentPage.value
    const radius = 2
    const start = Math.max(1, page - radius)
    const end = Math.min(pages, page + radius)
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index)
  })

  const goToPage = (page: number) => {
    updateQuery({ page: String(page) })
  }

  watch(totalPages, (pages) => {
    if (pages > 0 && currentPage.value > pages) {
      goToPage(pages)
    }
  })

  const openCharacter = (id: string) => {
    navigateTo({
      path: `/character/${id}`,
      query: route.query
    })
  }

  const toggleFavoritesFilter = () => {
    updateQuery({
      favorites: favoritesOnly.value ? undefined : '1',
      page: '1'
    })
  }

  const hasActiveFilters = computed(() => (
    Boolean(search.value || species.value || status.value || favoritesOnly.value)
  ))

  const clearFilters = () => {
    updateQuery({
      search: undefined,
      species: undefined,
      status: undefined,
      favorites: undefined,
      page: undefined
    })
  }

  const setLayoutMode = (mode: 'table' | 'grid') => {
    preferencesStore.setLayout(mode)
    updateQuery({
      layout: mode
    })
  }

  const favoriteIconClass = (id: string) => (
    favoritesStore.isFavorite(id) ? 'text-rose-500 [&_path]:fill-current' : ''
  )

  return {
    characters,
    clearFilters,
    error,
    favoriteIconClass,
    favoritesOnly,
    favoritesStore,
    goToPage,
    hasActiveFilters,
    layoutMode,
    openCharacter,
    pending,
    searchInput,
    setLayoutMode,
    speciesInput,
    statusInput,
    toggleFavoritesFilter,
    totalCount,
    totalPages,
    visiblePages
  }
}
