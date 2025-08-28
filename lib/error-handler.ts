/**
 * Utilitaire pour gérer les erreurs de manière cohérente
 * Évite les objets vides dans console.error et fournit des messages d'erreur lisibles
 */

export function formatErrorMessage(error: unknown, defaultMessage: string = 'Une erreur est survenue'): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  if (error && typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
}

export function logError(context: string, error: unknown, defaultMessage?: string): void {
  const errorMessage = formatErrorMessage(error, defaultMessage);
  console.error(`${context}:`, errorMessage);
}

export function handleSupabaseError(error: unknown, context: string): string {
  const errorMessage = formatErrorMessage(error, `Erreur lors de ${context}`);
  logError(`Supabase ${context}`, error);
  return errorMessage;
}
