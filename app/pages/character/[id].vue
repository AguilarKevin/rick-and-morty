<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'
import { useRickAndMortyApi } from '~/composables/useRickAndMortyApi'

const route = useRoute()
const favoritesStore = useFavoritesStore()
const { fetchCharacterById } = useRickAndMortyApi()

onMounted(() => {
  favoritesStore.loadFromStorage()
})

const characterId = computed(() => String(route.params.id))

const {
  data: character,
  pending,
  error
} = await useAsyncData(
  () => `character:${characterId.value}`,
  () => fetchCharacterById(characterId.value),
  { watch: [characterId] }
)

const backQuery = computed(() => {
  const query: Record<string, string> = {}

  if (typeof route.query.page === 'string') {
    query.page = route.query.page
  }

  if (typeof route.query.search === 'string') {
    query.search = route.query.search
  }

  if (route.query.favorites === '1') {
    query.favorites = '1'
  }

  return query
})
</script>

<template>
  <section class="space-y-4">
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      label="Back to characters"
      :to="{ path: '/', query: backQuery }"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Unable to load character"
      :description="error.message"
    />

    <UCard v-else>
      <div
        v-if="pending"
        class="space-y-3"
      >
        <USkeleton class="h-8 w-48" />
        <USkeleton class="h-48 w-full" />
      </div>

      <div
        v-else-if="character"
        class="grid gap-6 lg:grid-cols-[260px_1fr]"
      >
        <img
          :src="character.image"
          :alt="character.name"
          class="w-full max-w-[260px] rounded-2xl object-cover"
        >

        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">
              {{ character.name }}
            </h1>
            <UButton
              color="neutral"
              :variant="favoritesStore.isFavorite(character.id) ? 'solid' : 'outline'"
              :icon="favoritesStore.isFavorite(character.id) ? 'i-lucide-heart' : 'i-lucide-heart-off'"
              :label="favoritesStore.isFavorite(character.id) ? 'Favorited' : 'Add to favorites'"
              @click="favoritesStore.toggle(character.id)"
            />
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Status
              </p>
              <p class="mt-1 font-medium">
                {{ character.status }}
              </p>
            </div>

            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Species
              </p>
              <p class="mt-1 font-medium">
                {{ character.species }}
              </p>
            </div>

            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Gender
              </p>
              <p class="mt-1 font-medium">
                {{ character.gender }}
              </p>
            </div>

            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Origin
              </p>
              <p class="mt-1 font-medium">
                {{ character.origin.name }}
              </p>
            </div>

            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Last known location
              </p>
              <p class="mt-1 font-medium">
                {{ character.location.name }}
              </p>
            </div>

            <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
              <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Episode appearances
              </p>
              <p class="mt-1 font-medium">
                {{ character.episode.length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p
        v-else
        class="text-sm text-neutral-500 dark:text-neutral-400"
      >
        Character not found.
      </p>
    </UCard>
  </section>
</template>
