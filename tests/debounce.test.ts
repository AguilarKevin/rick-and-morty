import { describe, expect, it, vi } from 'vitest'
import { debounce } from '../app/utils/debounce'

describe('debounce', () => {
  it('calls function once after delay', () => {
    vi.useFakeTimers()

    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced('a')
    debounced('b')
    debounced('c')

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenLastCalledWith('c')

    vi.useRealTimers()
  })
})
