import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Clock,
  Mic,
  Cpu
} from 'lucide-react'

interface EpisodeStatusProps {
  status: 'uploading' | 'transcribing' | 'processing' | 'completed' | 'error'
  errorMessage?: string | null
}

const statusConfig = {
  uploading: { 
    label: 'Upload en cours', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: Loader2,
    description: 'Votre fichier audio est en cours d\'upload...'
  },
  transcribing: { 
    label: 'Transcription', 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200',
    icon: Mic,
    description: 'Votre audio est en cours de transcription...'
  },
  processing: { 
    label: 'Traitement IA', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200',
    icon: Cpu,
    description: 'Analyse et amélioration de la transcription...'
  },
  completed: { 
    label: 'Terminé', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: CheckCircle,
    description: 'Traitement terminé avec succès'
  },
  error: { 
    label: 'Erreur', 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: AlertCircle,
    description: 'Une erreur est survenue lors du traitement'
  }
}

export function EpisodeStatus({ status, errorMessage }: EpisodeStatusProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
          {status === 'uploading' || status === 'transcribing' || status === 'processing' ? (
            <StatusIcon className="h-5 w-5 animate-spin" />
          ) : (
            <StatusIcon className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${config.color}`}>
              {config.label}
            </h3>
            {status === 'uploading' || status === 'transcribing' || status === 'processing' && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
          
          <p className={`text-sm ${config.color} opacity-80`}>
            {config.description}
          </p>
          
          {status === 'error' && errorMessage && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
              <strong>Détails de l'erreur :</strong> {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
