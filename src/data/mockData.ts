import type { User, Channel, Message } from '../types'

// Mock Users with diverse profiles
export const mockUsers: User[] = [
  {
    id: 'user-alice',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    email: 'alice@example.com'
  },
  {
    id: 'user-bob',
    name: 'Bob Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'online'
  },
  {
    id: 'user-carol',
    name: 'Carol Williams',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'away',
    email: 'carol@example.com'
  },
  {
    id: 'user-david',
    name: 'David Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'offline'
  },
  {
    id: 'user-emma',
    name: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    status: 'online',
    email: 'emma@example.com'
  },
  {
    id: 'user-frank',
    name: 'Frank Miller',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    status: 'away'
  }
]

// Mock Channels with meaningful purposes
export const mockChannels: Channel[] = [
  {
    id: 'general',
    name: 'General',
    description: 'General discussion and announcements',
    type: 'public',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    memberCount: 6
  },
  {
    id: 'tech',
    name: 'Tech Talk',
    description: 'Technical discussions, programming, and development',
    type: 'public',
    createdAt: new Date('2024-01-02T14:30:00Z'),
    memberCount: 4
  },
  {
    id: 'random',
    name: 'Random',
    description: 'Off-topic conversations and casual chat',
    type: 'public',
    createdAt: new Date('2024-01-03T09:15:00Z'),
    memberCount: 5
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Important updates and company news',
    type: 'public',
    createdAt: new Date('2024-01-01T08:00:00Z'),
    memberCount: 6
  },
  {
    id: 'project-alpha',
    name: 'Project Alpha',
    description: 'Private discussion for Project Alpha team',
    type: 'private',
    createdAt: new Date('2024-01-05T16:45:00Z'),
    memberCount: 3
  }
]

// Helper function to create timestamps
const createTimestamp = (daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0): Date => {
  const now = new Date()
  now.setDate(now.getDate() - daysAgo)
  now.setHours(now.getHours() - hoursAgo)
  now.setMinutes(now.getMinutes() - minutesAgo)
  return now
}

// Mock Messages grouped by channel
export const mockMessages: Record<string, Message[]> = {
  general: [
    {
      id: 'msg-gen-001',
      channelId: 'general',
      userId: 'user-alice',
      content: 'Welcome everyone to OpenBoard! 🎉',
      timestamp: createTimestamp(7, 10, 30),
      type: 'text'
    },
    {
      id: 'msg-gen-002',
      channelId: 'general',
      userId: 'user-bob',
      content: 'Thanks Alice! Excited to be here.',
      timestamp: createTimestamp(7, 10, 15),
      type: 'text'
    },
    {
      id: 'msg-gen-003',
      channelId: 'general',
      userId: 'user-carol',
      content: 'This looks like a great platform for team communication.',
      timestamp: createTimestamp(7, 9, 45),
      type: 'text'
    },
    {
      id: 'msg-gen-004',
      channelId: 'general',
      userId: 'user-david',
      content: 'Has anyone tried the dark mode yet? It looks amazing! 🌙',
      timestamp: createTimestamp(6, 14, 20),
      type: 'text'
    },
    {
      id: 'msg-gen-005',
      channelId: 'general',
      userId: 'user-emma',
      content: 'Yes! The dark mode is perfect for late-night coding sessions.',
      timestamp: createTimestamp(6, 13, 55),
      type: 'text',
      editedAt: createTimestamp(6, 13, 50)
    },
    {
      id: 'msg-gen-006',
      channelId: 'general',
      userId: 'user-frank',
      content: 'Good morning everyone! Ready for another productive day? ☀️',
      timestamp: createTimestamp(1, 2, 10),
      type: 'text'
    }
  ],

  tech: [
    {
      id: 'msg-tech-001',
      channelId: 'tech',
      userId: 'user-bob',
      content: 'Anyone working with React 18 lately? The new concurrent features are impressive.',
      timestamp: createTimestamp(5, 16, 30),
      type: 'text'
    },
    {
      id: 'msg-tech-002',
      channelId: 'tech',
      userId: 'user-alice',
      content: 'Yes! The automatic batching has really improved our app performance.',
      timestamp: createTimestamp(5, 15, 45),
      type: 'text'
    },
    {
      id: 'msg-tech-003',
      channelId: 'tech',
      userId: 'user-emma',
      content: 'I\'ve been experimenting with Zustand for state management. Much simpler than Redux!',
      timestamp: createTimestamp(4, 11, 20),
      type: 'text'
    },
    {
      id: 'msg-tech-004',
      channelId: 'tech',
      userId: 'user-david',
      content: 'TypeScript has been a game-changer for our codebase. Catching so many bugs at compile time.',
      timestamp: createTimestamp(3, 9, 15),
      type: 'text'
    },
    {
      id: 'msg-tech-005',
      channelId: 'tech',
      userId: 'user-carol',
      content: 'Has anyone tried Vite? The build times are incredibly fast compared to webpack.',
      timestamp: createTimestamp(2, 14, 40),
      type: 'text'
    },
    {
      id: 'msg-tech-006',
      channelId: 'tech',
      userId: 'user-bob',
      content: 'Vite is amazing! We migrated our entire project and saw 10x faster builds.',
      timestamp: createTimestamp(2, 14, 25),
      type: 'text'
    }
  ],

  random: [
    {
      id: 'msg-rand-001',
      channelId: 'random',
      userId: 'user-carol',
      content: 'Anyone else excited for the weekend? Planning to try that new coffee shop downtown ☕',
      timestamp: createTimestamp(3, 18, 45),
      type: 'text'
    },
    {
      id: 'msg-rand-002',
      channelId: 'random',
      userId: 'user-frank',
      content: 'I heard they have amazing pastries too! Let me know how it is.',
      timestamp: createTimestamp(3, 18, 30),
      type: 'text'
    },
    {
      id: 'msg-rand-003',
      channelId: 'random',
      userId: 'user-emma',
      content: 'Just finished reading "The Pragmatic Programmer". Highly recommend it! 📚',
      timestamp: createTimestamp(2, 20, 15),
      type: 'text'
    },
    {
      id: 'msg-rand-004',
      channelId: 'random',
      userId: 'user-alice',
      content: 'That\'s on my reading list! How long did it take you to get through it?',
      timestamp: createTimestamp(2, 19, 50),
      type: 'text'
    },
    {
      id: 'msg-rand-005',
      channelId: 'random',
      userId: 'user-david',
      content: 'Beautiful sunset today! 🌅 Sometimes it\'s good to step away from the screen.',
      timestamp: createTimestamp(1, 19, 30),
      type: 'text'
    }
  ],

  announcements: [
    {
      id: 'msg-ann-001',
      channelId: 'announcements',
      userId: 'user-alice',
      content: 'System maintenance scheduled for this weekend. Please save your work!',
      timestamp: createTimestamp(10, 9, 0),
      type: 'system'
    },
    {
      id: 'msg-ann-002',
      channelId: 'announcements',
      userId: 'user-alice',
      content: 'New feature release: Dark mode is now available! Toggle it in the top-right corner.',
      timestamp: createTimestamp(8, 14, 30),
      type: 'text'
    },
    {
      id: 'msg-ann-003',
      channelId: 'announcements',
      userId: 'user-alice',
      content: 'Welcome to our new team members! Please introduce yourselves in #general.',
      timestamp: createTimestamp(5, 10, 15),
      type: 'text'
    },
    {
      id: 'msg-ann-004',
      channelId: 'announcements',
      userId: 'user-alice',
      content: 'Reminder: Team meeting tomorrow at 2 PM in the main conference room.',
      timestamp: createTimestamp(1, 16, 45),
      type: 'text'
    }
  ],

  'project-alpha': [
    {
      id: 'msg-alpha-001',
      channelId: 'project-alpha',
      userId: 'user-bob',
      content: 'Project Alpha kickoff meeting went well. Next milestone is end of month.',
      timestamp: createTimestamp(6, 11, 30),
      type: 'text'
    },
    {
      id: 'msg-alpha-002',
      channelId: 'project-alpha',
      userId: 'user-emma',
      content: 'I\'ll have the initial designs ready by Wednesday for review.',
      timestamp: createTimestamp(6, 11, 15),
      type: 'text'
    },
    {
      id: 'msg-alpha-003',
      channelId: 'project-alpha',
      userId: 'user-david',
      content: 'Backend API endpoints are 80% complete. Should be ready for integration testing soon.',
      timestamp: createTimestamp(4, 15, 20),
      type: 'text'
    },
    {
      id: 'msg-alpha-004',
      channelId: 'project-alpha',
      userId: 'user-bob',
      content: 'Great progress everyone! Let\'s sync up tomorrow to discuss the final sprint.',
      timestamp: createTimestamp(2, 17, 10),
      type: 'text'
    }
  ]
}

// Export a helper function to get users by ID for easy lookup
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

// Export a helper function to get channel by ID
export const getChannelById = (id: string): Channel | undefined => {
  return mockChannels.find(channel => channel.id === id)
}