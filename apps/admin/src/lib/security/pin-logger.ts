/**
 * Logger pour les tentatives de PIN
 *
 * Enregistre toutes les tentatives de vérification de PIN pour détecter
 * les comportements suspects et auditer les accès.
 */

export interface PINAttemptLog {
  timestamp: Date
  ip: string
  employeeId: string
  employeeName?: string
  success: boolean
  action: 'verify' | 'clock-in' | 'clock-out'
  failureReason?: string
  userAgent?: string
}

// Stockage en mémoire (pour prod, sauvegarder en BD)
const pinLogs: PINAttemptLog[] = []

// Limite de logs en mémoire (garder les 1000 derniers)
const MAX_LOGS = 1000

/**
 * Enregistre une tentative de PIN
 */
export function logPINAttempt(log: Omit<PINAttemptLog, 'timestamp'>): void {
  const fullLog: PINAttemptLog = {
    ...log,
    timestamp: new Date(),
  }

  pinLogs.unshift(fullLog) // Ajouter au début

  // Limiter la taille
  if (pinLogs.length > MAX_LOGS) {
    pinLogs.pop()
  }

  // Log console pour monitoring
  const emoji = log.success ? '✅' : '❌'
  const actionText = log.action.toUpperCase()
  const employeeInfo = log.employeeName || log.employeeId

  if (log.success) {
    console.log(
      `${emoji} [PIN ${actionText}] ${employeeInfo} | IP: ${log.ip}`
    )
  } else {
    console.warn(
      `${emoji} [PIN ${actionText} FAILED] ${employeeInfo} | IP: ${log.ip} | Reason: ${log.failureReason || 'Unknown'}`
    )
  }

  // Alerte si > 5 échecs consécutifs pour un employé
  checkSuspiciousActivity(log.employeeId, log.ip)
}

/**
 * Détecte les activités suspectes (tentatives de bruteforce)
 */
function checkSuspiciousActivity(employeeId: string, ip: string): void {
  // Vérifier les 10 dernières tentatives pour cet employé
  const recentAttempts = pinLogs
    .filter((log) => log.employeeId === employeeId)
    .slice(0, 10)

  // Si 5+ échecs consécutifs
  const consecutiveFailures = recentAttempts.filter((log) => !log.success)
  if (consecutiveFailures.length >= 5) {
    console.error(
      `🚨 [ALERTE SÉCURITÉ] 5+ tentatives PIN échouées pour employé ${employeeId} depuis IP ${ip}`
    )
    // TODO: Envoyer notification (email, Slack, etc.)
  }

  // Vérifier si une IP fait beaucoup de tentatives sur plusieurs employés
  const ipAttempts = pinLogs.filter((log) => log.ip === ip).slice(0, 20)
  const uniqueEmployees = new Set(ipAttempts.map((log) => log.employeeId))

  if (uniqueEmployees.size >= 5) {
    console.error(
      `🚨 [ALERTE SÉCURITÉ] IP ${ip} a tenté d'accéder à ${uniqueEmployees.size} employés différents`
    )
    // TODO: Bloquer l'IP automatiquement ?
  }
}

/**
 * Récupère les logs récents (pour interface admin)
 */
export function getRecentPINLogs(limit = 100): PINAttemptLog[] {
  return pinLogs.slice(0, limit)
}

/**
 * Récupère les logs pour un employé spécifique
 */
export function getPINLogsForEmployee(
  employeeId: string,
  limit = 50
): PINAttemptLog[] {
  return pinLogs.filter((log) => log.employeeId === employeeId).slice(0, limit)
}

/**
 * Récupère les logs pour une IP spécifique
 */
export function getPINLogsForIP(ip: string, limit = 50): PINAttemptLog[] {
  return pinLogs.filter((log) => log.ip === ip).slice(0, limit)
}

/**
 * Récupère les statistiques des tentatives
 */
export function getPINStats(): {
  total: number
  successful: number
  failed: number
  last24h: number
  topIPs: Array<{ ip: string; count: number }>
} {
  const now = Date.now()
  const last24h = 24 * 60 * 60 * 1000

  const recent = pinLogs.filter((log) => now - log.timestamp.getTime() < last24h)

  // Top IPs
  const ipCounts = new Map<string, number>()
  pinLogs.forEach((log) => {
    ipCounts.set(log.ip, (ipCounts.get(log.ip) || 0) + 1)
  })
  const topIPs = Array.from(ipCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }))

  return {
    total: pinLogs.length,
    successful: pinLogs.filter((log) => log.success).length,
    failed: pinLogs.filter((log) => !log.success).length,
    last24h: recent.length,
    topIPs,
  }
}

/**
 * Nettoie les logs plus vieux que X jours (à appeler périodiquement)
 */
export function cleanupOldLogs(daysToKeep = 7): number {
  const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000
  const initialLength = pinLogs.length

  // Filtrer les logs récents
  const recentLogs = pinLogs.filter(
    (log) => log.timestamp.getTime() > cutoffTime
  )

  // Remplacer le tableau
  pinLogs.length = 0
  pinLogs.push(...recentLogs)

  const removed = initialLength - pinLogs.length
  console.log(`🧹 Nettoyage logs PIN: ${removed} entrées supprimées`)

  return removed
}

// Nettoyage automatique quotidien
setInterval(() => cleanupOldLogs(7), 24 * 60 * 60 * 1000)
