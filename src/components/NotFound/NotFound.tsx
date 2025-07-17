import React from 'react'
import { Link } from 'react-router-dom'
import { Home, MessageSquare } from 'lucide-react'

interface NotFoundProps {
  type?: 'page' | 'channel'
}

const NotFound: React.FC<NotFoundProps> = ({ type = 'page' }) => {
  const isChannelNotFound = type === 'channel'

  return (
    <main 
      data-testid="not-found-page"
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4"
      aria-label="Error page"
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {isChannelNotFound ? (
            <MessageSquare 
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" 
              aria-hidden="true"
            />
          ) : (
            <Home 
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" 
              aria-hidden="true"
            />
          )}
          
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isChannelNotFound ? 'Channel Not Found' : 'Page Not Found'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {isChannelNotFound 
              ? "The channel you're looking for doesn't exist or you don't have access to it."
              : "The page you're looking for doesn't exist or has been moved."
            }
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/channel/general"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Go to general channel"
          >
            <MessageSquare className="w-4 h-4 mr-2" aria-hidden="true" />
            Go to General
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors focus:outline-none focus:underline"
              aria-label="Go back to previous page"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NotFound