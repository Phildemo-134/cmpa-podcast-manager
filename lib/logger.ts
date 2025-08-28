/**
 * Système de logging centralisé et sécurisé
 * Tous les logs sont conditionnels selon l'environnement
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log de debug - visible uniquement en développement
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 [DEBUG] ${message}`, context || '');
      }
      }
    }
  }

  /**
   * Log d'information - visible en développement et production
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment || this.isProduction) {
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`ℹ️  [INFO] ${message}`, context || '');
      }
      }
    }
  }

  /**
   * Log d'avertissement - toujours visible
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`⚠️  [WARN] ${message}`, context || '');
  }

  /**
   * Log d'erreur - toujours visible
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    console.error(`❌ [ERROR] ${message}`, error || '', context || '');
  }

  /**
   * Log sécurisé pour les informations sensibles
   * En production, masque automatiquement les données sensibles
   */
  secure(message: string, sensitiveData?: any, context?: LogContext): void {
    if (this.isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 [SECURE] ${message}`, sensitiveData || '', context || '');
      }
      }
    } else {
      // En production, on log seulement le message sans les données sensibles
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 [SECURE] ${message}`, context || '');
      }
      }
    }
  }

  /**
   * Log pour les opérations critiques (toujours visible)
   */
  critical(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`🚨 [CRITICAL] ${message}`, context || '');
      }
      }
  }

  /**
   * Log pour les opérations de paiement (avec masquage automatique)
   */
  payment(message: string, paymentData?: any, context?: LogContext): void {
    if (this.isDevelopment) {
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`💳 [PAYMENT] ${message}`, paymentData || '', context || '');
      }
      }
    } else {
      // En production, masquer les données de paiement sensibles
      const maskedData = paymentData ? this.maskSensitiveData(paymentData) : null;
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`💳 [PAYMENT] ${message}`, maskedData || '', context || '');
      }
      }
    }
  }

  /**
   * Masque les données sensibles pour la production
   */
  private maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Masquer les tokens, clés API, etc.
      if (data.includes('sk_') || data.includes('pk_') || data.includes('whsec_')) {
        return data.substring(0, 10) + '***';
      }
      if (data.length > 20) {
        return data.substring(0, 10) + '...' + data.substring(data.length - 5);
      }
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      // Masquer les champs sensibles
      ['token', 'key', 'secret', 'password', 'access_token'].forEach(field => {
        if (masked[field]) {
          masked[field] = this.maskSensitiveData(masked[field]);
        }
      });
      return masked;
    }
    
    return data;
  }
}

// Instance singleton du logger
export const logger = new Logger();

// Fonctions d'export pour faciliter l'utilisation
export const { debug, info, warn, error, secure, critical, payment } = logger;

// Export par défaut
export default logger;
