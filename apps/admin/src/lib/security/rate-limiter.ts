/**
 * Rate Limiter pour les tentatives de PIN
 *
 * Empêche le bruteforce des codes PIN en limitant le nombre de tentatives
 * par IP et par employé.
 */

interface RateLimitEntry {
  count: number
  firstAttempt: number
  lockedUntil?: number
}

// Stockage en mémoire (pour prod, utiliser Redis)
const ipAttempts = new Map<string, RateLimitEntry>()
const employeeAttempts = new Map<string, RateLimitEntry>()

// Configuration (à partir des env vars)
const MAX_ATTEMPTS_PER_MINUTE = parseInt(
  process.env.MAX_PIN_ATTEMPTS_PER_MINUTE || '5',
  10
)
const LOCKOUT_DURATION_MS = parseInt(
  process.env.PIN_LOCKOUT_DURATION_MINUTES || '15',
  10
) * 60 * 1000 // Convertir en ms

const WINDOW_MS = 60 * 1000 // 1 minute

/**
 * Vérifie si une IP ou un employé est rate-limité
 */
export function checkRateLimit(
  ip: string,
  employeeId?: string
): { allowed: boolean; reason?: string; retryAfter?: number } {
  const now = Date.now()

  // Vérifier IP
  const ipLimit = ipAttempts.get(ip)
  if (ipLimit) {
    // Vérifier si locked
    if (ipLimit.lockedUntil && now < ipLimit.lockedUntil) {
      return {
        allowed: false,
        reason: 'Trop de tentatives. Réessayez plus tard.',
        retryAfter: Math.ceil((ipLimit.lockedUntil - now) / 1000),
      }
    }

    // Reset si fenêtre expirée
    if (now - ipLimit.firstAttempt > WINDOW_MS) {
      ipAttempts.delete(ip)
    } else if (ipLimit.count >= MAX_ATTEMPTS_PER_MINUTE) {
      // Bloquer pour LOCKOUT_DURATION
      ipLimit.lockedUntil = now + LOCKOUT_DURATION_MS
      return {
        allowed: false,
        reason: 'Trop de tentatives. Veuillez patienter.',
        retryAfter: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      }
    }
  }

  // Vérifier employé (si fourni)
  if (employeeId) {
    const employeeLimit = employeeAttempts.get(employeeId)
    if (employeeLimit) {
      if (employeeLimit.lockedUntil && now < employeeLimit.lockedUntil) {
        return {
          allowed: false,
          reason: 'Employé temporairement bloqué.',
          retryAfter: Math.ceil((employeeLimit.lockedUntil - now) / 1000),
        }
      }

      if (now - employeeLimit.firstAttempt > WINDOW_MS) {
        employeeAttempts.delete(employeeId)
      } else if (employeeLimit.count >= MAX_ATTEMPTS_PER_MINUTE * 2) {
        // Limite plus haute pour employé (10 par minute)
        employeeLimit.lockedUntil = now + LOCKOUT_DURATION_MS
        return {
          allowed: false,
          reason: 'Trop de tentatives pour cet employé.',
          retryAfter: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        }
      }
    }
  }

  return { allowed: true }
}

/**
 * Enregistre une tentative de PIN
 */
export function recordAttempt(ip: string, employeeId?: string): void {
  const now = Date.now()

  // Enregistrer tentative IP
  const ipLimit = ipAttempts.get(ip)
  if (ipLimit && now - ipLimit.firstAttempt <= WINDOW_MS) {
    ipLimit.count++
  } else {
    ipAttempts.set(ip, { count: 1, firstAttempt: now })
  }

  // Enregistrer tentative employé
  if (employeeId) {
    const employeeLimit = employeeAttempts.get(employeeId)
    if (employeeLimit && now - employeeLimit.firstAttempt <= WINDOW_MS) {
      employeeLimit.count++
    } else {
      employeeAttempts.set(employeeId, { count: 1, firstAttempt: now })
    }
  }
}

/**
 * Réinitialise les tentatives pour une IP/employé (après succès)
 */
export function resetAttempts(ip: string, employeeId?: string): void {
  ipAttempts.delete(ip)
  if (employeeId) {
    employeeAttempts.delete(employeeId)
  }
}

/**
 * Nettoyage périodique des entrées expirées (à appeler via cron ou au démarrage)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  const expirationTime = 24 * 60 * 60 * 1000 // 24h

  for (const [ip, entry] of Array.from(ipAttempts.entries())) {
    if (now - entry.firstAttempt > expirationTime) {
      ipAttempts.delete(ip)
    }
  }

  for (const [employeeId, entry] of Array.from(employeeAttempts.entries())) {
    if (now - entry.firstAttempt > expirationTime) {
      employeeAttempts.delete(employeeId)
    }
  }
}

// Nettoyage automatique toutes les heures
setInterval(cleanupExpiredEntries, 60 * 60 * 1000)
