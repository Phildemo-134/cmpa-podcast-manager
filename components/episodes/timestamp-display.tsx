import { Clock, Play } from 'lucide-react'
import { Button } from '../ui/button'

interface Timestamp {
  start: number
  end: number
  text: string
  speaker?: string
}

interface TimestampDisplayProps {
  timestamps: Timestamp[]
  onTimestampClick?: (timestamp: Timestamp) => void
  currentTime?: number
}

export function TimestampDisplay({ timestamps, onTimestampClick, currentTime = 0 }: TimestampDisplayProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const isCurrentTimestamp = (timestamp: Timestamp) => {
    return currentTime >= timestamp.start && currentTime <= timestamp.end
  }

  const handleTimestampClick = (timestamp: Timestamp) => {
    if (onTimestampClick) {
      onTimestampClick(timestamp)
    }
  }

  if (!timestamps || timestamps.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>Aucun timestamp disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {timestamps.length} segment{timestamps.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {timestamps.map((timestamp, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              isCurrentTimestamp(timestamp)
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleTimestampClick(timestamp)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {formatTime(timestamp.start)} - {formatTime(timestamp.end)}
                  </span>
                  {timestamp.speaker && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {timestamp.speaker}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {timestamp.text}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation()
                  handleTimestampClick(timestamp)
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
