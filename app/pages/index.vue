<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRickAndMortyApi } from '~/composables/useRickAndMortyApi'
import { useFavoritesStore } from '~/stores/favorites'
import { speciesBadgeColor, statusBadgeColor } from '~/utils/characterBadgeColor'
import { debounce } from '~/utils/debounce'

const route = useRoute()
const router = useRouter()

const { fetchCharacters, fetchCharactersByIds } = useRickAndMortyApi()
const favoritesStore = useFavoritesStore()
const { ids: favoriteIds } = storeToRefs(favoritesStore)

onMounted(() => {
  favoritesStore.loadFromStorage()
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
const layoutMode = computed(() => route.query.layout === 'grid' ? 'grid' : 'table')

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
  updateQuery({
    layout: mode
  })
}

const favoriteIcon = (id: string) => (
  favoritesStore.isFavorite(id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'
)

const favoriteIconClass = (id: string) => (
  favoritesStore.isFavorite(id) ? 'text-rose-500 [&_path]:fill-current' : ''
)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Rick and Morty Characters
        </h1>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Explore all characters from the universe.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <UButton
            color="neutral"
            :variant="layoutMode === 'table' ? 'solid' : 'ghost'"
            icon="i-heroicons-table-cells"
            label="Table"
            size="sm"
            :aria-pressed="layoutMode === 'table'"
            :class="layoutMode === 'table' ? '' : 'text-neutral-600 dark:text-neutral-300'"
            @click="setLayoutMode('table')"
          />
          <UButton
            color="neutral"
            :variant="layoutMode === 'grid' ? 'solid' : 'ghost'"
            icon="i-heroicons-squares-2x2"
            label="Grid"
            size="sm"
            :aria-pressed="layoutMode === 'grid'"
            :class="layoutMode === 'grid' ? '' : 'text-neutral-600 dark:text-neutral-300'"
            @click="setLayoutMode('grid')"
          />
        </div>
        <UButton
          color="neutral"
          :variant="favoritesOnly ? 'solid' : 'outline'"
          icon="i-heroicons-heart"
          :label="favoritesOnly ? 'Showing Favorites' : 'Show Favorites'"
          @click="toggleFavoritesFilter"
        />
      </div>
    </div>

    <UCard>
      <div class="grid gap-3 md:grid-cols-3">
        <UInput
          v-model="searchInput"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search by character name..."
        />
        <UInput
          v-model="speciesInput"
          icon="i-lucide-dna"
          placeholder="Filter by species (e.g. Human)"
        />
        <USelect
          v-model="statusInput"
          :items="[
            { label: 'All statuses', value: 'all' },
            { label: 'Alive', value: 'Alive' },
            { label: 'Dead', value: 'Dead' },
            { label: 'Unknown', value: 'unknown' }
          ]"
          placeholder="Filter by status"
        />
      </div>
      <div class="mt-3 flex items-center justify-between gap-3">
        <p class="text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
          {{ totalCount }} result{{ totalCount === 1 ? '' : 's' }}
        </p>
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-heroicons-x-mark"
          label="Clear filters"
          :disabled="!hasActiveFilters"
          @click="clearFilters"
        />
      </div>
    </UCard>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Unable to load characters"
      :description="error.message"
    />

    <UCard v-else>
      <div
        v-if="pending"
        class="space-y-3"
      >
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-8 w-full" />
      </div>

      <template v-else-if="characters.length">
        <div v-if="layoutMode === 'table'">
          <div class="space-y-2 md:hidden">
            <button
              v-for="character in characters"
              :key="character.id"
              type="button"
              class="w-full rounded-xl border border-neutral-200 p-3 text-left transition-all duration-200 hover:border-cyan-400/70 hover:bg-primary-500/10 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_0_20px_rgba(16,185,129,0.2)] dark:border-neutral-800 dark:hover:border-cyan-300/70 dark:hover:bg-primary-400/10"
              @click="openCharacter(character.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <img
                    :src="character.image"
                    :alt="character.name"
                    loading="lazy"
                    class="h-10 w-10 rounded-full object-cover"
                  >
                  <div>
                    <p class="font-medium">
                      {{ character.name }}
                    </p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      {{ character.origin.name }}
                    </p>
                  </div>
                </div>
                <UButton
                  color="neutral"
                  variant="ghost"
                  :icon="favoriteIcon(character.id)"
                  :aria-label="favoritesStore.isFavorite(character.id) ? 'Remove from favorites' : 'Add to favorites'"
                  :class="favoriteIconClass(character.id)"
                  @click.stop="favoritesStore.toggle(character.id)"
                />
              </div>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <UBadge
                  :label="character.species"
                  variant="soft"
                  size="xs"
                  :color="speciesBadgeColor(character.species)"
                />
                <UBadge
                  :label="character.status"
                  variant="soft"
                  size="xs"
                  :color="statusBadgeColor(character.status)"
                />
              </div>
            </button>
          </div>

          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm">
              <thead class="text-neutral-500 dark:text-neutral-300">
                <tr class="border-b border-neutral-200 dark:border-neutral-800">
                  <th class="px-3 py-2 font-medium">
                    Character
                  </th>
                  <th class="px-3 py-2 font-medium">
                    Species
                  </th>
                  <th class="px-3 py-2 font-medium">
                    Status
                  </th>
                  <th class="px-3 py-2 font-medium">
                    Origin
                  </th>
                  <th class="px-3 py-2 font-medium text-right">
                    Favorite
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="character in characters"
                  :key="character.id"
                  class="cursor-pointer border-b border-neutral-100 transition-all duration-200 hover:bg-primary-500/10 hover:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.4),0_0_24px_rgba(16,185,129,0.25)] dark:border-neutral-900 dark:hover:bg-primary-400/10"
                  @click="openCharacter(character.id)"
                >
                  <td class="px-3 py-3">
                    <div class="flex items-center gap-3">
                      <img
                        :src="character.image"
                        :alt="character.name"
                        loading="lazy"
                        class="h-10 w-10 rounded-full object-cover"
                      >
                      <span class="font-medium">{{ character.name }}</span>
                    </div>
                  </td>
                  <td class="px-3 py-3">
                    <UBadge
                      :label="character.species"
                      variant="soft"
                      :color="speciesBadgeColor(character.species)"
                    />
                  </td>
                  <td class="px-3 py-3">
                    <UBadge
                      :label="character.status"
                      variant="soft"
                      :color="statusBadgeColor(character.status)"
                    />
                  </td>
                  <td class="px-3 py-3">
                    {{ character.origin.name }}
                  </td>
                  <td class="px-3 py-3 text-right">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      :icon="favoriteIcon(character.id)"
                      :aria-label="favoritesStore.isFavorite(character.id) ? 'Remove from favorites' : 'Add to favorites'"
                      :class="favoriteIconClass(character.id)"
                      @click.stop="favoritesStore.toggle(character.id)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-else
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <button
            v-for="character in characters"
            :key="character.id"
            type="button"
            class="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.45),0_0_28px_rgba(16,185,129,0.35)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-cyan-300/70"
            @click="openCharacter(character.id)"
          >
            <span class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_45%)]" />
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <img
                  :src="character.image"
                  :alt="character.name"
                  loading="lazy"
                  class="h-12 w-12 rounded-lg object-cover"
                >
                <div>
                  <p class="font-medium">
                    {{ character.name }}
                  </p>
                  <div class="mt-1 flex items-center gap-2">
                    <UBadge
                      :label="character.species"
                      variant="soft"
                      size="xs"
                      :color="speciesBadgeColor(character.species)"
                    />
                    <UBadge
                      :label="character.status"
                      variant="soft"
                      size="xs"
                      :color="statusBadgeColor(character.status)"
                    />
                  </div>
                </div>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                :icon="favoriteIcon(character.id)"
                :aria-label="favoritesStore.isFavorite(character.id) ? 'Remove from favorites' : 'Add to favorites'"
                :class="favoriteIconClass(character.id)"
                @click.stop="favoritesStore.toggle(character.id)"
              />
            </div>

            <div class="mt-3 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
              <p>Status: {{ character.status }}</p>
              <p>Origin: {{ character.origin.name }}</p>
            </div>
          </button>
        </div>
      </template>

      <div
        v-else
        class="text-sm text-neutral-500 dark:text-neutral-400"
      >
        No characters found.
      </div>
    </UCard>

    <div
      v-if="totalPages > 1"
      class="flex flex-wrap items-center gap-2"
    >
      <UButton
        color="neutral"
        variant="outline"
        label="Previous"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      />

      <UButton
        v-for="page in visiblePages"
        :key="page"
        color="neutral"
        :variant="page === currentPage ? 'solid' : 'outline'"
        :label="String(page)"
        @click="goToPage(page)"
      />

      <UButton
        color="neutral"
        variant="outline"
        label="Next"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      />
    </div>
  </section>
</template>
