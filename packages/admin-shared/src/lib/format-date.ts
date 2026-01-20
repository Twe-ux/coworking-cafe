export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(time: string): string {
  return time // HH:mm format
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeSince(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' ans'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' mois'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' jours'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' heures'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes'

  return Math.floor(seconds) + ' secondes'
}
