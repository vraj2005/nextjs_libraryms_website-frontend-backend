'use client'
import { useState } from 'react'

interface NotificationResult {
  sent: number
  failed: number
}

interface AutomatedResults {
  action: string
  results: NotificationResult
  timestamp: Date
}

export default function NotificationManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AutomatedResults[]>([])
  const [message, setMessage] = useState('')

  const triggerNotifications = async (action: string) => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/notifications/automated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'your-secret-key'}`
        },
        body: JSON.stringify({ action })
      })

      if (!response.ok) {
        throw new Error('Failed to trigger notifications')
      }

      const data = await response.json()
      
      setResults(prev => [{
        action: data.action,
        results: data.results,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]) // Keep last 10 results

      setMessage(`✅ ${data.message}: ${data.results.sent} sent, ${data.results.failed} failed`)
      
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ Failed to trigger notifications')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📨 Notification Management
        </h2>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => triggerNotifications('due-date-reminders')}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            📅 Send Due Date Reminders
          </button>

          <button
            onClick={() => triggerNotifications('overdue-notifications')}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            ⏰ Send Overdue Notices
          </button>

          <button
            onClick={() => triggerNotifications('daily-notifications')}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 Daily Batch (Both)
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Processing notifications...</span>
          </div>
        )}

        {/* Results History */}
        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-800">
                        {result.action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        ✅ {result.results.sent} sent
                        {result.results.failed > 0 && (
                          <span className="text-red-600 ml-2">❌ {result.results.failed} failed</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ How It Works</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Due Date Reminders:</strong> Sent 7, 3, and 1 days before due date</li>
            <li>• <strong>Overdue Notices:</strong> Sent for books past due date, updates status to OVERDUE</li>
            <li>• <strong>Daily Batch:</strong> Combines both reminder types for scheduled execution</li>
            <li>• <strong>Automated:</strong> Set up cron jobs to call the API endpoint for scheduled notifications</li>
          </ul>
        </div>

        {/* Cron Setup Info */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Automated Setup</h4>
          <p className="text-sm text-yellow-700 mb-2">
            To automate these notifications, set up a cron job or scheduled task to call:
          </p>
          <code className="block bg-yellow-100 p-2 rounded text-xs text-yellow-800">
            POST /api/notifications/automated<br/>
            Headers: Authorization: Bearer [CRON_SECRET]<br/>
            Body: &#123;"action": "daily-notifications"&#125;
          </code>
          <p className="text-xs text-yellow-600 mt-2">
            Recommended: Run daily at 9:00 AM using your hosting platform's cron service
          </p>
        </div>
      </div>
    </div>
  )
}
