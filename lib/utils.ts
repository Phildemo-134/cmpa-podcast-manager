import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convertit une date et heure locale (française) en UTC pour le stockage en base
 * @param localDate - Date au format YYYY-MM-DD
 * @param localTime - Heure au format HH:MM
 * @returns Date UTC au format ISO string
 */
export function convertLocalToUTC(localDate: string, localTime: string): string {
  // Créer une date locale en spécifiant explicitement le fuseau UTC+2
  // Quand on spécifie +02:00, JavaScript traite cela comme une date UTC
  // et la convertit automatiquement en UTC en soustrayant 2 heures
  // Donc 19:09 +02:00 devient 17:09 UTC, ce qui est exactement ce que nous voulons !
  const localDateTime = new Date(`${localDate}T${localTime}:00+02:00`)
  
  // Retourner l'ISO string (JavaScript a déjà fait la conversion UTC)
  return localDateTime.toISOString()
}

/**
 * Convertit une date UTC de la base en date locale française pour l'affichage
 * @param utcDateTime - Date UTC au format ISO string
 * @returns Objet avec date et heure locales formatées
 */
export function convertUTCToLocal(utcDateTime: string): { date: string; time: string } {
  const utcDate = new Date(utcDateTime)
  
  // Pour afficher en heure locale française (UTC+2), nous devons ajouter 2 heures
  // à la date UTC stockée en base
  const localDate = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000))
  
  // Extraire la date et l'heure en format local
  // Utiliser toISOString() pour éviter les problèmes de fuseau horaire local
  const date = localDate.toISOString().split('T')[0]
  const time = `${localDate.getUTCHours().toString().padStart(2, '0')}:${localDate.getUTCMinutes().toString().padStart(2, '0')}`
  
  return { date, time }
}

/**
 * Formate une date pour l'affichage en français
 * @param date - Date au format ISO string
 * @returns Date formatée en français
 */
export function formatDateForDisplay(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formate une heure pour l'affichage
 * @param time - Heure au format HH:MM
 * @returns Heure formatée
 */
export function formatTimeForDisplay(time: string): string {
  return time
}
