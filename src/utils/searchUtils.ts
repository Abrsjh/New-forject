/**
 * Search utilities for advanced search functionality
 * Includes debouncing, highlighting, and search state management
 */

/**
 * Creates a debounced version of a search function
 * @param callback - Function to call after debounce delay
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounceSearch<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

/**
 * Escapes special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Highlights search terms in text with HTML mark tags
 * @param text - Text to search in
 * @param searchTerm - Term to highlight
 * @returns Text with highlighted search terms
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim() || !text) {
    return text
  }

  // Escape special regex characters in search term
  const escapedTerm = escapeRegExp(searchTerm.trim())
  
  // Create case-insensitive regex with global flag
  const regex = new RegExp(`(${escapedTerm})`, 'gi')
  
  // Replace matches with highlighted version
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

/**
 * Creates a reusable highlighter function for a specific search term
 * @param searchTerm - Term to create highlighter for
 * @returns Function that highlights the search term in any text
 */
export function createSearchHighlighter(searchTerm: string): (text: string) => string {
  return (text: string) => highlightSearchTerm(text, searchTerm)
}

/**
 * Keyboard shortcut constants for search functionality
 */
export const SEARCH_SHORTCUTS = {
  CLEAR: 'Escape',
  FOCUS: 'KeyK', // Ctrl/Cmd + K
  NAVIGATE_DOWN: 'ArrowDown',
  NAVIGATE_UP: 'ArrowUp',
  SELECT: 'Enter'
} as const

/**
 * Checks if a keyboard event matches a search shortcut
 * @param event - Keyboard event
 * @param shortcut - Shortcut to check
 * @returns True if event matches shortcut
 */
export function isSearchShortcut(event: KeyboardEvent, shortcut: keyof typeof SEARCH_SHORTCUTS): boolean {
  const key = SEARCH_SHORTCUTS[shortcut]
  
  switch (shortcut) {
    case 'CLEAR':
      return event.key === key
    case 'FOCUS':
      return (event.ctrlKey || event.metaKey) && event.code === key
    case 'NAVIGATE_DOWN':
    case 'NAVIGATE_UP':
    case 'SELECT':
      return event.key === key.replace('Arrow', '')
    default:
      return false
  }
}

/**
 * Search result highlighting configuration
 */
export interface SearchHighlightConfig {
  className?: string
  maxResults?: number
  caseSensitive?: boolean
}

/**
 * Advanced search result with highlighting
 */
export interface SearchResult<T> {
  item: T
  highlightedText: string
  matchCount: number
  relevanceScore: number
}

/**
 * Performs advanced search with highlighting and scoring
 * @param items - Items to search through
 * @param searchTerm - Term to search for
 * @param getSearchText - Function to extract searchable text from item
 * @param config - Search configuration
 * @returns Array of search results with highlighting
 */
export function performAdvancedSearch<T>(
  items: T[],
  searchTerm: string,
  getSearchText: (item: T) => string,
  config: SearchHighlightConfig = {}
): SearchResult<T>[] {
  const {
    maxResults = 50,
    caseSensitive = false
  } = config

  if (!searchTerm.trim()) {
    return items.slice(0, maxResults).map(item => ({
      item,
      highlightedText: getSearchText(item),
      matchCount: 0,
      relevanceScore: 0
    }))
  }

  const escapedTerm = escapeRegExp(searchTerm.trim())
  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(escapedTerm, flags)

  const results: SearchResult<T>[] = []

  for (const item of items) {
    const text = getSearchText(item)
    const matches = text.match(regex)
    
    if (matches) {
      const matchCount = matches.length
      const highlightedText = highlightSearchTerm(text, searchTerm)
      
      // Calculate relevance score based on:
      // - Number of matches
      // - Position of first match (earlier = higher score)
      // - Exact word matches vs partial matches
      const firstMatchIndex = caseSensitive 
        ? text.indexOf(searchTerm)
        : text.toLowerCase().indexOf(searchTerm.toLowerCase())
      
      const positionScore = firstMatchIndex === 0 ? 10 : Math.max(0, 10 - firstMatchIndex / 10)
      const matchScore = matchCount * 5
      const exactWordBonus = new RegExp(`\\b${escapedTerm}\\b`, flags).test(text) ? 5 : 0
      
      const relevanceScore = positionScore + matchScore + exactWordBonus

      results.push({
        item,
        highlightedText,
        matchCount,
        relevanceScore
      })
    }
  }

  // Sort by relevance score (highest first) and limit results
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults)
}

/**
 * Search state management utilities
 */
export interface SearchState {
  query: string
  isActive: boolean
  results: any[]
  selectedIndex: number
  lastSearchTime: number
}

/**
 * Creates initial search state
 * @returns Initial search state object
 */
export function createInitialSearchState(): SearchState {
  return {
    query: '',
    isActive: false,
    results: [],
    selectedIndex: -1,
    lastSearchTime: 0
  }
}

/**
 * Updates search state with new query
 * @param state - Current search state
 * @param query - New search query
 * @returns Updated search state
 */
export function updateSearchState(state: SearchState, query: string): SearchState {
  return {
    ...state,
    query,
    isActive: query.trim().length > 0,
    selectedIndex: query !== state.query ? -1 : state.selectedIndex,
    lastSearchTime: Date.now()
  }
}

/**
 * Clears search state
 * @param state - Current search state
 * @returns Cleared search state
 */
export function clearSearchState(state: SearchState): SearchState {
  return {
    ...state,
    query: '',
    isActive: false,
    results: [],
    selectedIndex: -1
  }
}