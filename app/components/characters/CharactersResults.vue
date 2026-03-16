<script setup lang="ts">
import type { CharacterListItem } from '~/types/character'
import { speciesBadgeColor, statusBadgeColor } from '~/utils/characterBadgeColor'

interface Props {
  characters: CharacterListItem[]
  layoutMode: 'table' | 'grid'
  isFavorite: (id: string) => boolean
  favoriteIconClass: (id: string) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  openCharacter: [id: string]
  prefetchCharacter: [id: string]
  toggleFavorite: [id: string]
}>()

const favoriteIcon = (id: string) => (
  props.isFavorite(id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'
)
</script>

<template>
  <template v-if="layoutMode === 'table'">
    <div class="overflow-x-auto">
      <table class="min-w-[720px] w-full text-left text-sm">
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
            @mouseenter="emit('prefetchCharacter', character.id)"
            @touchstart.passive="emit('prefetchCharacter', character.id)"
            @click="emit('openCharacter', character.id)"
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
                :aria-label="isFavorite(character.id) ? 'Remove from favorites' : 'Add to favorites'"
                :class="favoriteIconClass(character.id)"
                @click.stop="emit('toggleFavorite', character.id)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <div
    v-else
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    <article
      v-for="character in characters"
      :key="character.id"
      role="button"
      tabindex="0"
      class="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.45),0_0_28px_rgba(16,185,129,0.35)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-cyan-300/70"
      @mouseenter="emit('prefetchCharacter', character.id)"
      @focus="emit('prefetchCharacter', character.id)"
      @touchstart.passive="emit('prefetchCharacter', character.id)"
      @click="emit('openCharacter', character.id)"
      @keydown.enter.prevent="emit('openCharacter', character.id)"
      @keydown.space.prevent="emit('openCharacter', character.id)"
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
          :aria-label="isFavorite(character.id) ? 'Remove from favorites' : 'Add to favorites'"
          :class="favoriteIconClass(character.id)"
          @click.stop="emit('toggleFavorite', character.id)"
        />
      </div>

      <div class="mt-3 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        <p>Status: {{ character.status }}</p>
        <p>Origin: {{ character.origin.name }}</p>
      </div>
    </article>
  </div>
</template>
