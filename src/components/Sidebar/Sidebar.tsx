import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hash, Lock, Search, X, Menu, Users } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { debounceSearch, highlightSearchTerm, isSearchShortcut } from '../../utils/searchUtils'
import type { Channel } from '../../types'

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  
  const {
    channels,
    activeChannelId,
    searchQuery,
    sidebarOpen,
    setActiveChannel,
    setSearchQuery,
    toggleSidebar,
    getFilteredChannels
  } = useAppStore()

  const filteredChannels = getFilteredChannels()

  // Debounced search function
  const debouncedSearch = useCallback(
    debounceSearch((query: string) => {
      setSearchQuery(query)
    }, 300),
    [setSearchQuery]
  )

  // Sync local search with store
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const handleChannelClick = (channelId: string) => {
    setActiveChannel(channelId)
    navigate(`/channel/${channelId}`)
  }

  const handleChannelKeyDown = (event: React.KeyboardEvent, channelId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleChannelClick(channelId)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setLocalSearchQuery(value)
    debouncedSearch(value)
    setSelectedResultIndex(-1) // Reset selection when typing
  }

  const clearSearch = () => {
    setLocalSearchQuery('')
    setSearchQuery('')
    setSelectedResultIndex(-1)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Handle keyboard shortcuts and navigation
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSearchShortcut(event.nativeEvent, 'CLEAR')) {
      event.preventDefault()
      clearSearch()
      return
    }

    if (isSearchShortcut(event.nativeEvent, 'NAVIGATE_DOWN')) {
      event.preventDefault()
      const nextIndex = Math.min(selectedResultIndex + 1, filteredChannels.length - 1)
      setSelectedResultIndex(nextIndex)
      
      // Focus the selected channel item
      if (nextIndex >= 0) {
        const channelElement = document.querySelector(`[data-testid="channel-item-${filteredChannels[nextIndex].id}"]`) as HTMLElement
        channelElement?.focus()
      }
      return
    }

    if (isSearchShortcut(event.nativeEvent, 'NAVIGATE_UP')) {
      event.preventDefault()
      const prevIndex = Math.max(selectedResultIndex - 1, -1)
      setSelectedResultIndex(prevIndex)
      
      if (prevIndex === -1) {
        // Return focus to search input
        searchInputRef.current?.focus()
      } else {
        // Focus the selected channel item
        const channelElement = document.querySelector(`[data-testid="channel-item-${filteredChannels[prevIndex].id}"]`) as HTMLElement
        channelElement?.focus()
      }
      return
    }

    if (isSearchShortcut(event.nativeEvent, 'SELECT') && selectedResultIndex >= 0) {
      event.preventDefault()
      const selectedChannel = filteredChannels[selectedResultIndex]
      if (selectedChannel) {
        handleChannelClick(selectedChannel.id)
      }
      return
    }
  }

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (isSearchShortcut(event, 'FOCUS')) {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const renderChannelIcon = (channel: Channel) => {
    const iconClass = "w-4 h-4 text-gray-500 dark:text-gray-400"
    
    if (channel.type === 'private') {
      return <Lock className={iconClass} data-testid="channel-icon-private" aria-hidden="true" />
    }
    return <Hash className={iconClass} data-testid="channel-icon-public" aria-hidden="true" />
  }

  const renderChannelItem = (channel: Channel, index: number) => {
    const isActive = channel.id === activeChannelId
    const isSelected = index === selectedResultIndex
    
    // Highlight search terms in channel name and description
    const highlightedName = searchQuery 
      ? highlightSearchTerm(channel.name, searchQuery)
      : channel.name
    
    const highlightedDescription = searchQuery && channel.description
      ? highlightSearchTerm(channel.description, searchQuery)
      : channel.description
    
    return (
      <button
        key={channel.id}
        data-testid={`channel-item-${channel.id}`}
        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
            : isSelected
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        onClick={() => handleChannelClick(channel.id)}
        onKeyDown={(e) => handleChannelKeyDown(e, channel.id)}
        tabIndex={0}
        aria-current={isActive ? 'page' : undefined}
        aria-label={`${channel.name} channel`}
      >
        <div className="flex items-center min-w-0 flex-1">
          {renderChannelIcon(channel)}
          <div className="ml-3 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span 
                className="text-sm font-medium truncate"
                dangerouslySetInnerHTML={{ __html: highlightedName }}
              />
              <div className="flex items-center ml-2 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3 mr-1" aria-hidden="true" />
                <span>{channel.memberCount} members</span>
              </div>
            </div>
            {channel.description && (
              <p 
                className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                dangerouslySetInnerHTML={{ __html: highlightedDescription }}
              />
            )}
          </div>
        </div>
      </button>
    )
  }

  const renderEmptyState = () => {
    if (channels.length === 0) {
      return (
        <div className="text-center py-8">
          <Hash className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No channels available
          </p>
        </div>
      )
    }

    if (searchQuery && filteredChannels.length === 0) {
      return (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            No channels found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Try adjusting your search terms
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <div data-testid="sidebar-container" className="h-full flex flex-col">
      {/* Mobile toggle button */}
      <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search channels..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            aria-label="Search channels"
          />
          {localSearchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4" role="list" aria-label="Channel list">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Channels
            </h2>
            {searchQuery && (
              <span 
                data-testid="search-results-count"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                {filteredChannels.length} {filteredChannels.length === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>
          
          {renderEmptyState() || (
            <div className="space-y-1">
              {filteredChannels.map((channel, index) => renderChannelItem(channel, index))}
            </div>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div 
          data-testid="search-shortcuts-hint"
          className="px-4 pb-2 text-xs text-gray-400 dark:text-gray-500"
        >
          <span>Ctrl+K to focus, Esc to clear</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar