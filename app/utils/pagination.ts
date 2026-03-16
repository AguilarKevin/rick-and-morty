export function buildVisiblePages(currentPage: number, totalPages: number, maxVisiblePages = 5) {
  if (totalPages < 1) {
    return []
  }

  const start = Math.min(
    Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1),
    Math.max(totalPages - maxVisiblePages + 1, 1)
  )
  const length = Math.min(maxVisiblePages, totalPages)

  return Array.from({ length }, (_, index) => start + index)
}
