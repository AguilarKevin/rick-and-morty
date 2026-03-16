<script setup lang="ts">
interface Props {
  searchInput: string
  speciesInput: string
  statusInput: string
  totalCount: number
  hasActiveFilters: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  updateSearchInput: [value: string]
  updateSpeciesInput: [value: string]
  updateStatusInput: [value: string]
  clearFilters: []
}>()
</script>

<template>
  <UCard>
    <div class="grid gap-3 md:grid-cols-3">
      <UInput
        :model-value="searchInput"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search by character name..."
        @update:model-value="emit('updateSearchInput', String($event))"
      />
      <UInput
        :model-value="speciesInput"
        icon="i-lucide-dna"
        placeholder="Filter by species (e.g. Human)"
        @update:model-value="emit('updateSpeciesInput', String($event))"
      />
      <USelect
        :model-value="statusInput"
        :items="[
          { label: 'All statuses', value: 'all' },
          { label: 'Alive', value: 'Alive' },
          { label: 'Dead', value: 'Dead' },
          { label: 'Unknown', value: 'unknown' }
        ]"
        placeholder="Filter by status"
        @update:model-value="emit('updateStatusInput', String($event))"
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
        @click="emit('clearFilters')"
      />
    </div>
  </UCard>
</template>
