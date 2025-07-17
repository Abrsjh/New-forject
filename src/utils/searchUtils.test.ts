import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounceSearch, highlightSearchTerm, createSearchHighlighter } from './searchUtils'

describe('searchUtils', () => {
  describe('debounceSearch', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should debounce search function calls', () => {
      const mockCallback = vi.fn()
      const debouncedSearch = debounceSearch(mockCallback, 300)

      // Call multiple times rapidly
      debouncedSearch('test1')
      debouncedSearch('test2')
      debouncedSearch('test3')

      // Should not have been called yet
      expect(mockCallback).not.toHaveBeenCalled()

      // Fast-forward time
      vi.advanceTimersByTime(300)

      // Should only be called once with the last value
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith('test3')
    })

    it('should reset debounce timer on new calls', () => {
      const mockCallback = vi.fn()
      const debouncedSearch = debounceSearch(mockCallback, 300)

      debouncedSearch('test1')
      vi.advanceTimersByTime(200)
      
      debouncedSearch('test2')
      vi.advanceTimersByTime(200)
      
      // Should not have been called yet
      expect(mockCallback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      
      // Should be called with the last value
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith('test2')
    })

    it('should handle empty search terms', () => {
      const mockCallback = vi.fn()
      const debouncedSearch = debounceSearch(mockCallback, 300)

      debouncedSearch('')
      vi.advanceTimersByTime(300)

      expect(mockCallback).toHaveBeenCalledWith('')
    })

    it('should allow immediate execution with zero delay', () => {
      const mockCallback = vi.fn()
      const debouncedSearch = debounceSearch(mockCallback, 0)

      debouncedSearch('test')
      
      expect(mockCallback).toHaveBeenCalledWith('test')
    })
  })

  describe('highlightSearchTerm', () => {
    it('should highlight single occurrence of search term', () => {
      const result = highlightSearchTerm('Hello world', 'world')
      expect(result).toBe('Hello <mark class="bg-yellow-200 dark:bg-yellow-800">world</mark>')
    })

    it('should highlight multiple occurrences of search term', () => {
      const result = highlightSearchTerm('test test test', 'test')
      expect(result).toBe('<mark class="bg-yellow-200 dark:bg-yellow-800">test</mark> <mark class="bg-yellow-200 dark:bg-yellow-800">test</mark> <mark class="bg-yellow-200 dark:bg-yellow-800">test</mark>')
    })

    it('should be case insensitive', () => {
      const result = highlightSearchTerm('Hello World', 'WORLD')
      expect(result).toBe('Hello <mark class="bg-yellow-200 dark:bg-yellow-800">World</mark>')
    })

    it('should handle empty search term', () => {
      const result = highlightSearchTerm('Hello world', '')
      expect(result).toBe('Hello world')
    })

    it('should handle empty text', () => {
      const result = highlightSearchTerm('', 'test')
      expect(result).toBe('')
    })

    it('should handle special regex characters', () => {
      const result = highlightSearchTerm('test (hello) world', '(hello)')
      expect(result).toBe('test <mark class="bg-yellow-200 dark:bg-yellow-800">(hello)</mark> world')
    })

    it('should handle partial word matches', () => {
      const result = highlightSearchTerm('testing', 'test')
      expect(result).toBe('<mark class="bg-yellow-200 dark:bg-yellow-800">test</mark>ing')
    })

    it('should preserve original case in highlights', () => {
      const result = highlightSearchTerm('Hello WORLD world', 'world')
      expect(result).toBe('Hello <mark class="bg-yellow-200 dark:bg-yellow-800">WORLD</mark> <mark class="bg-yellow-200 dark:bg-yellow-800">world</mark>')
    })
  })

  describe('createSearchHighlighter', () => {
    it('should create a highlighter function', () => {
      const highlighter = createSearchHighlighter('test')
      expect(typeof highlighter).toBe('function')
    })

    it('should highlight text using the created highlighter', () => {
      const highlighter = createSearchHighlighter('world')
      const result = highlighter('Hello world')
      expect(result).toBe('Hello <mark class="bg-yellow-200 dark:bg-yellow-800">world</mark>')
    })

    it('should handle empty search term in highlighter', () => {
      const highlighter = createSearchHighlighter('')
      const result = highlighter('Hello world')
      expect(result).toBe('Hello world')
    })

    it('should be reusable for multiple texts', () => {
      const highlighter = createSearchHighlighter('test')
      
      expect(highlighter('test one')).toBe('<mark class="bg-yellow-200 dark:bg-yellow-800">test</mark> one')
      expect(highlighter('another test')).toBe('another <mark class="bg-yellow-200 dark:bg-yellow-800">test</mark>')
      expect(highlighter('no match')).toBe('no match')
    })
  })

  describe('Integration', () => {
    it('should work together for debounced highlighting', () => {
      vi.useFakeTimers()
      
      const mockHighlight = vi.fn()
      const debouncedHighlight = debounceSearch((term: string) => {
        const highlighter = createSearchHighlighter(term)
        mockHighlight(highlighter('test content'))
      }, 300)

      debouncedHighlight('test')
      vi.advanceTimersByTime(300)

      expect(mockHighlight).toHaveBeenCalledWith('<mark class="bg-yellow-200 dark:bg-yellow-800">test</mark> content')
      
      vi.useRealTimers()
    })
  })
})