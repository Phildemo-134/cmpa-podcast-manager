import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface CollapsibleFieldProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function CollapsibleField({ 
  title, 
  children, 
  defaultExpanded = false,
  className = ''
}: CollapsibleFieldProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between p-3 h-auto hover:bg-gray-50 border-0 rounded-t-lg rounded-b-none"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}

