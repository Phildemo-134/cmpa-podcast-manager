import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Clock,
  Mic,
  Cpu,
  Upload,
  FileText,
  Sparkles
} from 'lucide-react'

interface EpisodeStatusProps {
  status: 'draft' | 'uploaded' | 'transcribing' | 'transcribed' | 'optimizing' | 'optimized' | 'generating_content' | 'completed' | 'published' | 'failed' | 'error'
  errorMessage?: string | null
}

const statusConfig = {
  draft: { 
    label: 'Brouillon', 
    color: 'text-gray-600', 
    bg: 'bg-gray-50', 
    border: 'border-gray-200',
    icon: Clock,
    description: 'Épisode en mode brouillon'
  },
  uploaded: { 
    label: 'Uploadé', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: Upload,
    description: 'Fichier audio uploadé avec succès'
  },
  transcribing: { 
    label: 'Transcription', 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200',
    icon: Mic,
    description: 'Transcription en cours...'
  },
  transcribed: { 
    label: 'Transcrit', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: FileText,
    description: 'Transcription terminée'
  },
  optimizing: { 
    label: 'Optimisation', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200',
    icon: Cpu,
    description: 'Optimisation de la transcription...'
  },
  optimized: { 
    label: 'Optimisé', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: CheckCircle,
    description: 'Transcription optimisée'
  },
  generating_content: { 
    label: 'Génération contenu', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200',
    icon: Sparkles,
    description: 'Génération de contenu IA...'
  },
  completed: { 
    label: 'Terminé', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: CheckCircle,
    description: 'Traitement terminé'
  },
  published: { 
    label: 'Publié', 
    color: 'text-green-600', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: CheckCircle,
    description: 'Épisode publié et disponible'
  },
  failed: { 
    label: 'Échec', 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: AlertCircle,
    description: 'Une erreur est survenue lors du traitement'
  },
  error: { 
    label: 'Erreur', 
    color: 'text-red-600', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: AlertCircle,
    description: 'Une erreur est survenue'
  }
}

export function EpisodeStatus({ status, errorMessage }: EpisodeStatusProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
          {status === 'transcribing' || status === 'optimizing' || status === 'generating_content' ? (
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
            {(status === 'transcribing' || status === 'optimizing' || status === 'generating_content') && (
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
          
          {(status === 'failed' || status === 'error') && errorMessage && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
              <strong>Détails de l'erreur :</strong> {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
