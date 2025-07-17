import React from 'react'
import { useAppStore } from '../../stores/useAppStore'
import Sidebar from '../Sidebar/Sidebar'
import MessageView from '../MessageView/MessageView'
import ThemeToggle from '../ThemeToggle/ThemeToggle'

const Layout: React.FC = () => {
  const { sidebarOpen } = useAppStore()

  return (
    <div 
      data-testid="app-layout"
      className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'block' : 'hidden md:block'
        } w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0`}
        role="complementary"
        aria-label="Channel sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Header with theme toggle */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              OpenBoard
            </h1>
            <ThemeToggle />
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-hidden">
            <Sidebar />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main 
        className="flex-1 flex flex-col min-w-0"
        role="main"
        aria-label="Main content area"
      >
        <MessageView />
      </main>
    </div>
  )
}

export default Layout