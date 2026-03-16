<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  visiblePages: number[]
}

defineProps<Props>()

const emit = defineEmits<{
  goToPage: [page: number]
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <UButton
      color="neutral"
      variant="outline"
      label="Previous"
      :disabled="currentPage <= 1"
      @click="emit('goToPage', currentPage - 1)"
    />

    <UButton
      v-for="page in visiblePages"
      :key="page"
      color="neutral"
      :variant="page === currentPage ? 'solid' : 'outline'"
      :label="String(page)"
      @click="emit('goToPage', page)"
    />

    <UButton
      color="neutral"
      variant="outline"
      label="Next"
      :disabled="currentPage >= totalPages"
      @click="emit('goToPage', currentPage + 1)"
    />
  </div>
</template>
