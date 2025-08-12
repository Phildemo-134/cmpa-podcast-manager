// Constantes de l'application CMPA Podcast Manager

export const APP_CONFIG = {
  name: 'CMPA Podcast Manager',
  description: 'Gestion et traitement automatisé de podcasts avec IA',
  version: '0.1.0',
  url: 'https://cmpa-podcast-manager.com',
  supportEmail: 'support@cmpa-podcast-manager.com',
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
} as const;

export const EPISODE_STATUSES = {
  UPLOADING: 'uploading',
  TRANSCRIBING: 'transcribing',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  YOUTUBE: 'youtube',
  SPOTIFY: 'spotify',
} as const;

export const CONTENT_STATUSES = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

export const AUDIO_FORMATS = {
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  M4A: 'audio/mp4',
  FLAC: 'audio/flac',
  OGG: 'audio/ogg',
} as const;

export const MAX_FILE_SIZE = {
  AUDIO: 500 * 1024 * 1024, // 500 MB
  IMAGE: 10 * 1024 * 1024,  // 10 MB
  DOCUMENT: 50 * 1024 * 1024, // 50 MB
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  EPISODES: {
    LIST: '/api/episodes',
    CREATE: '/api/episodes',
    GET: (id: string) => `/api/episodes/${id}`,
    UPDATE: (id: string) => `/api/episodes/${id}`,
    DELETE: (id: string) => `/api/episodes/${id}`,
    UPLOAD: (id: string) => `/api/episodes/${id}/upload`,
  },
  TRANSCRIPTIONS: {
    CREATE: '/api/transcriptions',
    GET: (id: string) => `/api/transcriptions/${id}`,
    UPDATE: (id: string) => `/api/transcriptions/${id}`,
  },
  SUBSCRIPTIONS: {
    GET: '/api/subscriptions',
    CREATE: '/api/subscriptions',
    CANCEL: '/api/subscriptions/cancel',
    UPDATE: '/api/subscriptions/update',
  },
  SOCIAL: {
    PUBLISH: '/api/social/publish',
    SCHEDULE: '/api/social/schedule',
    DRAFTS: '/api/social/drafts',
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const ANIMATION_DELAYS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette ressource.',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'La ressource demandée n\'a pas été trouvée.',
  VALIDATION: 'Veuillez vérifier les informations saisies.',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux.',
  INVALID_FORMAT: 'Format de fichier non supporté.',
  UPLOAD_FAILED: 'Échec du téléchargement du fichier.',
  TRANSCRIPTION_FAILED: 'La transcription a échoué. Veuillez réessayer.',
  PROCESSING_FAILED: 'Le traitement a échoué. Veuillez réessayer.',
} as const;

export const SUCCESS_MESSAGES = {
  EPISODE_CREATED: 'Épisode créé avec succès.',
  EPISODE_UPDATED: 'Épisode mis à jour avec succès.',
  EPISODE_DELETED: 'Épisode supprimé avec succès.',
  UPLOAD_SUCCESS: 'Fichier téléchargé avec succès.',
  TRANSCRIPTION_STARTED: 'Transcription démarrée.',
  TRANSCRIPTION_COMPLETED: 'Transcription terminée avec succès.',
  CONTENT_GENERATED: 'Contenu généré avec succès.',
  PUBLICATION_SCHEDULED: 'Publication programmée avec succès.',
  SETTINGS_SAVED: 'Paramètres sauvegardés avec succès.',
} as const;

export const VALIDATION_RULES = {
  EMAIL: {
    required: 'L\'adresse email est requise',
    pattern: 'Format d\'email invalide',
  },
  PASSWORD: {
    required: 'Le mot de passe est requis',
    minLength: 'Le mot de passe doit contenir au moins 8 caractères',
    pattern: 'Le mot de passe doit contenir au moins une lettre et un chiffre',
  },
  NAME: {
    required: 'Le nom est requis',
    minLength: 'Le nom doit contenir au moins 2 caractères',
    maxLength: 'Le nom ne peut pas dépasser 50 caractères',
  },
  TITLE: {
    required: 'Le titre est requis',
    minLength: 'Le titre doit contenir au moins 3 caractères',
    maxLength: 'Le titre ne peut pas dépasser 200 caractères',
  },
  DESCRIPTION: {
    maxLength: 'La description ne peut pas dépasser 1000 caractères',
  },
} as const;
