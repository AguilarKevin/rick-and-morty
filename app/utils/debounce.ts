export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay = 300
) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
