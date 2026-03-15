<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRickAndMortyApi } from '~/composables/useRickAndMortyApi'
import { useFavoritesStore } from '~/stores/favorites'
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

const currentPage = computed(() => {
  const raw = Number(route.query.page ?? 1)
  return Number.isFinite(raw) && raw > 0 ? raw : 1
})

const search = computed(() => (
  typeof route.query.search === 'string' ? route.query.search.trim() : ''
))

const favoritesOnly = computed(() => route.query.favorites === '1')

watch(search, (value) => {
  if (value !== searchInput.value) {
    searchInput.value = value
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

  router.push({
    query: sanitized
  })
}

const applySearch = debounce((value: string) => {
  updateQuery({
    search: value || undefined,
    page: '1'
  })
}, 350)

watch(searchInput, (value) => {
  applySearch(value)
})

const {
  data: charactersResponse,
  pending,
  error
} = await useAsyncData(
  () => `characters:${currentPage.value}:${search.value}`,
  () => fetchCharacters(currentPage.value, search.value),
  {
    watch: [currentPage, search],
    server: false
  }
)

const { data: favoritesData } = await useAsyncData(
  () => `favorites:${favoritesOnly.value ? favoriteIds.value.join(',') : 'inactive'}`,
  () => favoritesOnly.value ? fetchCharactersByIds(favoriteIds.value) : [],
  {
    watch: [favoriteIds, favoritesOnly],
    server: false
  }
)

const characters = computed(() => (
  favoritesOnly.value
    ? (favoritesData.value ?? [])
    : (charactersResponse.value?.results ?? [])
))

const totalCount = computed(() => (
  favoritesOnly.value
    ? favoriteIds.value.length
    : (charactersResponse.value?.info.count ?? 0)
))

const totalPages = computed(() => charactersResponse.value?.info.pages ?? 0)

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
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
          Rick and Morty Characters
        </h1>
        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
          Browse, search, and save your favorite characters.
        </p>
      </div>

      <UButton
        color="neutral"
        :variant="favoritesOnly ? 'solid' : 'outline'"
        icon="i-lucide-heart"
        :label="favoritesOnly ? 'Showing Favorites' : 'Show Favorites'"
        @click="toggleFavoritesFilter"
      />
    </div>

    <UCard>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UInput
          v-model="searchInput"
          icon="i-lucide-search"
          placeholder="Search by character name..."
          class="w-full"
        />
        <p class="text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
          {{ totalCount }} result{{ totalCount === 1 ? '' : 's' }}
        </p>
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
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-8 w-full" />
        <USkeleton class="h-8 w-full" />
      </div>

      <template v-else-if="characters.length">
        <div class="hidden md:block overflow-x-auto">
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
                class="border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 cursor-pointer"
                @click="openCharacter(character.id)"
              >
                <td class="px-3 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      :src="character.image"
                      :alt="character.name"
                      class="h-10 w-10 rounded-full object-cover"
                    >
                    <span class="font-medium">{{ character.name }}</span>
                  </div>
                </td>
                <td class="px-3 py-3">
                  {{ character.species }}
                </td>
                <td class="px-3 py-3">
                  {{ character.status }}
                </td>
                <td class="px-3 py-3">
                  {{ character.origin.name }}
                </td>
                <td class="px-3 py-3 text-right">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    :icon="favoritesStore.isFavorite(character.id) ? 'i-lucide-heart' : 'i-lucide-heart-off'"
                    :aria-label="favoritesStore.isFavorite(character.id) ? 'Remove from favorites' : 'Add to favorites'"
                    @click.stop="favoritesStore.toggle(character.id)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="text-sm text-neutral-500 dark:text-neutral-400">
        No characters found.
      </div>
    </UCard>

    <div v-if="!favoritesOnly && totalPages > 1" class="flex flex-wrap items-center gap-2">
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
