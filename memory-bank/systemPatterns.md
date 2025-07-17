# System Patterns

## Component Architecture
- **Layout**: Two-column responsive layout (sidebar + main content)
- **Sidebar**: Channel list with search filtering and active state
- **MessageView**: Message display with auto-scroll and composer
- **ThemeToggle**: Dark/light mode switcher

## Zustand State Structure
```typescript
interface AppState {
  // Channel Management
  channels: Channel[]
  activeChannelId: string | null
  
  // Message Management
  messages: Record<string, Message[]> // Messages grouped by channelId
  
  // UI State
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  searchQuery: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setActiveChannel: (id: string) => void
  addMessage: (channelId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  toggleTheme: () => void
  setSearchQuery: (query: string) => void
  toggleSidebar: () => void
  clearError: () => void
  
  // Computed getters
  getChannelMessages: (channelId: string) => Message[]
  getFilteredChannels: () => Channel[]
}
```

## Routing Layout
- `/` - Redirect to first available channel
- `/channel/:channelId` - Channel-specific message view
- 404 handling for invalid channels

## localStorage Usage
- `openboard-theme` - User theme preference
- `openboard-settings` - Additional user preferences

## File Organization
```
src/
├── components/
│   ├── Layout/
│   ├── Sidebar/
│   ├── MessageView/
│   └── ThemeToggle/
├── stores/
│   └── useAppStore.ts
├── data/
│   └── mockData.js
├── types/
│   └── index.ts
├── utils/
│   └── storage.ts
└── App.tsx
```