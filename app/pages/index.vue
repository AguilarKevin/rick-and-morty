<script setup lang="ts">
const {
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
} = useCharactersPageController()
</script>

<template>
  <section class="space-y-6">
    <CharactersHeader
      :layout-mode="layoutMode"
      :favorites-only="favoritesOnly"
      @set-layout="setLayoutMode"
      @toggle-favorites="toggleFavoritesFilter"
    />

    <CharactersFilters
      :search-input="searchInput"
      :species-input="speciesInput"
      :status-input="statusInput"
      :total-count="totalCount"
      :has-active-filters="hasActiveFilters"
      @update-search-input="searchInput = $event"
      @update-species-input="speciesInput = $event"
      @update-status-input="statusInput = $event"
      @clear-filters="clearFilters"
    />

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

      <CharactersResults
        v-else-if="characters.length"
        :characters="characters"
        :layout-mode="layoutMode"
        :is-favorite="favoritesStore.isFavorite"
        :favorite-icon-class="favoriteIconClass"
        @open-character="openCharacter"
        @toggle-favorite="favoritesStore.toggle"
      />

      <div
        v-else
        class="text-sm text-neutral-500 dark:text-neutral-400"
      >
        No characters found.
      </div>
    </UCard>

    <CharactersPagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      @go-to-page="goToPage"
    />
  </section>
</template>
