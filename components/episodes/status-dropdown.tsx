'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

interface StatusDropdownProps {
  currentStatus: 'draft' | 'processing' | 'published' | 'failed'
  onStatusChange: (newStatus: 'draft' | 'processing' | 'published' | 'failed') => Promise<void>
  isUpdating?: boolean
}

const statusOptions = [
  { value: 'draft', label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-50' },
  { value: 'processing', label: 'Traitement IA', color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'published', label: 'Publié', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'failed', label: 'Échec', color: 'text-red-600', bg: 'bg-red-50' }
] as const

export function StatusDropdown({ currentStatus, onStatusChange, isUpdating = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)

  const currentStatusConfig = statusOptions.find(option => option.value === currentStatus)

  const handleStatusSelect = async (newStatus: 'draft' | 'processing' | 'published' | 'failed') => {
    setSelectedStatus(newStatus)
    setIsOpen(false)
    
    try {
      await onStatusChange(newStatus)
    } catch (error) {
      // En cas d'erreur, remettre l'ancien status
      setSelectedStatus(currentStatus)
      console.error('Erreur lors de la mise à jour du status:', error)
    }
  }

  return (
    <div className="relative">
      <Card className="border-2 hover:border-gray-300 transition-colors">
        <CardContent className="p-0">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isUpdating}
            className="w-full justify-between h-auto p-3 hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${currentStatusConfig?.bg}`}></div>
              <span className="font-medium">{currentStatusConfig?.label}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CardContent>
      </Card>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusSelect(option.value)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                selectedStatus === option.value ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${option.bg}`}></div>
                <span className={option.color}>{option.label}</span>
              </div>
              {selectedStatus === option.value && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
