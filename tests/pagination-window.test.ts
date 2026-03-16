import { describe, expect, it } from 'vitest'
import { buildVisiblePages } from '../app/utils/pagination'

describe('buildVisiblePages', () => {
  it('returns a fixed-size window when total pages is larger than max', () => {
    expect(buildVisiblePages(1, 10)).toEqual([1, 2, 3, 4, 5])
    expect(buildVisiblePages(5, 10)).toEqual([3, 4, 5, 6, 7])
    expect(buildVisiblePages(10, 10)).toEqual([6, 7, 8, 9, 10])
  })

  it('returns all pages when total is below window size', () => {
    expect(buildVisiblePages(1, 3)).toEqual([1, 2, 3])
    expect(buildVisiblePages(2, 0)).toEqual([])
  })
})
