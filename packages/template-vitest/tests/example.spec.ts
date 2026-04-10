import { describe, it, expect, vi } from 'vitest'

describe('example', () => {
  it('makeAbsUrl should work', () => {
    vi.spyOn(k.site.info, 'makeAbsUrl').mockImplementation(
      (relativePath) => `https://example.com${relativePath}`
    )

    expect(k.site.info.makeAbsUrl('/test')).toBe('https://example.com/test')
  })
})
