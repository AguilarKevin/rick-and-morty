import type { usePreferencesStore } from '~/stores/preferences'
import { debounce } from '~/utils/debounce'

export function useCharactersQueryController(preferencesStore: ReturnType<typeof usePreferencesStore>) {
  const route = useRoute()
  const router = useRouter()
  const isValidPageQuery = (value: unknown): value is string => (
    typeof value === 'string' && /^[1-9]\d*$/.test(value)
  )

  const searchInput = ref(typeof route.query.search === 'string' ? route.query.search : '')
  const speciesInput = ref(typeof route.query.species === 'string' ? route.query.species : '')
  const statusInput = ref(typeof route.query.status === 'string' ? route.query.status : 'all')

  const currentPage = computed(() => {
    return isValidPageQuery(route.query.page) ? Number(route.query.page) : 1
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

  const goToPage = (page: number) => {
    updateQuery({ page: String(page) })
  }

  const toggleFavoritesFilter = () => {
    updateQuery({
      favorites: favoritesOnly.value ? undefined : '1',
      page: '1'
    })
  }

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

  watch(() => route.query.page, (pageValue) => {
    if (pageValue === undefined || isValidPageQuery(pageValue)) {
      return
    }

    updateQuery({
      page: undefined
    })
  }, { immediate: true })

  const hasActiveFilters = computed(() => (
    Boolean(search.value || species.value || status.value || favoritesOnly.value)
  ))

  return {
    clearFilters,
    currentPage,
    favoritesOnly,
    goToPage,
    hasActiveFilters,
    layoutMode,
    search,
    searchInput,
    setLayoutMode,
    species,
    speciesInput,
    status,
    statusInput,
    toggleFavoritesFilter
  }
}
