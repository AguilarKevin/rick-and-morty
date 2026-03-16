<script setup>
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '~/stores/preferences'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Rick and Morty Directory'
const description = 'Explore characters, save favorites, and browse details with a fast, responsive interface.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/favicon.ico',
  twitterImage: '/favicon.ico',
  twitterCard: 'summary_large_image'
})

const preferencesStore = usePreferencesStore()
const { theme } = storeToRefs(preferencesStore)

onMounted(() => {
  preferencesStore.loadTheme()
})

watch(theme, (value) => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', value === 'dark')
  }
}, { immediate: true })
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors">
      <header class="sticky top-0 z-20 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/85 dark:bg-neutral-900/85 backdrop-blur">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2"
          >
            <div class="h-8 w-8 rounded-lg bg-primary-500 text-white grid place-content-center font-bold">
              RM
            </div>
            <span class="font-semibold tracking-tight">Character Directory</span>
          </NuxtLink>

          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              :icon="theme === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
              @click="preferencesStore.toggleTheme"
            />
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
