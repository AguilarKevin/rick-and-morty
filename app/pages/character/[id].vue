<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'
import { useRickAndMortyApi } from '~/composables/useRickAndMortyApi'
import { speciesBadgeColor, statusBadgeColor } from '~/utils/characterBadgeColor'

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
      icon="i-heroicons-arrow-left"
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

    <UCard
      v-else
      class="overflow-hidden"
    >
      <div
        v-if="pending"
        class="space-y-3"
      >
        <USkeleton class="h-8 w-48" />
        <USkeleton class="h-48 w-full" />
      </div>

      <div
        v-else-if="character"
        class="-m-6"
      >
        <div class="relative h-52 sm:h-64 md:h-72">
          <img
            :src="character.image"
            :alt="`${character.name} cover`"
            class="absolute inset-0 h-full w-full object-cover"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.25),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.2),transparent_45%)]" />
        </div>

        <div class="px-4 pb-4 sm:px-6 sm:pb-6">
          <div class="relative -mt-12 sm:-mt-16">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div class="flex items-end gap-4">
                <img
                  :src="character.image"
                  :alt="character.name"
                  class="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-xl dark:border-neutral-900 sm:h-36 sm:w-36"
                >
                <div class="pt-2 sm:pt-3">
                  <h1 class="text-2xl font-semibold tracking-tight text-neutral-900 drop-shadow sm:text-3xl dark:text-white">
                    {{ character.name }}
                  </h1>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <UBadge
                      :label="character.species"
                      variant="soft"
                      size="sm"
                      :color="speciesBadgeColor(character.species)"
                    />
                    <UBadge
                      v-if="character.type"
                      :label="character.type"
                      variant="outline"
                      size="sm"
                      color="neutral"
                    />
                    <UBadge
                      :label="character.status"
                      variant="soft"
                      size="sm"
                      :color="statusBadgeColor(character.status)"
                    />
                  </div>
                </div>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                :icon="favoritesStore.isFavorite(character.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                :aria-label="favoritesStore.isFavorite(character.id) ? 'Remove from favorites' : 'Add to favorites'"
                :class="favoritesStore.isFavorite(character.id) ? 'text-rose-500 [&_path]:fill-current' : 'text-neutral-600 dark:text-neutral-300'"
                @click="favoritesStore.toggle(character.id)"
              />
            </div>
          </div>

          <div class="mt-6 grid gap-4 lg:grid-cols-2">
            <div class="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
              <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                Identity
              </h2>
              <dl class="mt-3 space-y-3 text-sm">
                <div class="flex items-center justify-between gap-3">
                  <dt class="text-neutral-500 dark:text-neutral-400">
                    Status
                  </dt>
                  <dd class="font-medium">
                    {{ character.status }}
                  </dd>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <dt class="text-neutral-500 dark:text-neutral-400">
                    Species
                  </dt>
                  <dd class="font-medium">
                    {{ character.species }}
                  </dd>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <dt class="text-neutral-500 dark:text-neutral-400">
                    Type (sub-species)
                  </dt>
                  <dd class="font-medium">
                    {{ character.type || 'Not specified' }}
                  </dd>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <dt class="text-neutral-500 dark:text-neutral-400">
                    Gender
                  </dt>
                  <dd class="font-medium">
                    {{ character.gender }}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
              <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                Origins
              </h2>
              <dl class="mt-3 space-y-3 text-sm">
                <div>
                  <dt class="text-neutral-500 dark:text-neutral-400">
                    Origin
                  </dt>
                  <dd class="mt-1 font-medium">
                    {{ character.origin.name }}
                  </dd>
                </div>
                <div>
                  <dt class="text-neutral-500 dark:text-neutral-400">
                    Last known location
                  </dt>
                  <dd class="mt-1 font-medium">
                    {{ character.location.name }}
                  </dd>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <dt class="text-neutral-500 dark:text-neutral-400">
                    Episode appearances
                  </dt>
                  <dd class="font-medium">
                    {{ character.episode.length }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div class="mt-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                Episodes
              </h2>
              <UBadge
                color="neutral"
                variant="soft"
                :label="`${character.episode.length}`"
              />
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-2">
              <div
                v-for="entry in character.episode"
                :key="entry.id"
                class="rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2"
              >
                <p class="text-xs font-medium text-primary-600 dark:text-primary-400">
                  {{ entry.episode ?? 'Episode' }}
                </p>
                <p class="text-sm text-neutral-700 dark:text-neutral-200">
                  {{ entry.name ?? `Episode #${entry.id}` }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  Air date: {{ entry.air_date ?? 'Unknown' }}
                </p>
              </div>
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
