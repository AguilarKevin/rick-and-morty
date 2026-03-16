<script setup lang="ts">
interface Props {
  layoutMode: 'table' | 'grid'
  favoritesOnly: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  setLayout: [mode: 'table' | 'grid']
  toggleFavorites: []
}>()
</script>

<template>
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
          @click="emit('setLayout', 'table')"
        />
        <UButton
          color="neutral"
          :variant="layoutMode === 'grid' ? 'solid' : 'ghost'"
          icon="i-heroicons-squares-2x2"
          label="Grid"
          size="sm"
          :aria-pressed="layoutMode === 'grid'"
          :class="layoutMode === 'grid' ? '' : 'text-neutral-600 dark:text-neutral-300'"
          @click="emit('setLayout', 'grid')"
        />
      </div>
      <UButton
        color="neutral"
        :variant="favoritesOnly ? 'solid' : 'outline'"
        icon="i-heroicons-heart"
        :label="favoritesOnly ? 'Showing Favorites' : 'Show Favorites'"
        @click="emit('toggleFavorites')"
      />
    </div>
  </div>
</template>
