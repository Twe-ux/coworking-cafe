/**
 * IP Whitelist pour Interface Staff
 *
 * Permet de restreindre l'accès à l'interface staff (pointage) aux IPs autorisées.
 * Si STAFF_ALLOWED_IPS n'est pas défini, l'accès est ouvert à tous (avec rate limiting).
 */

import { NextRequest } from 'next/server'

/**
 * Extrait l'IP réelle du client depuis les headers
 * Gère les proxies (Northflank, Vercel, etc.)
 */
export function getClientIP(request: NextRequest): string {
  // Headers à vérifier (ordre de priorité)
  const headers = [
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip', // Cloudflare
    'fastly-client-ip', // Fastly
    'x-client-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for peut contenir plusieurs IPs
      const ips = value.split(',').map((ip) => ip.trim())
      if (ips[0]) {
        return ips[0]
      }
    }
  }

  // Fallback : IP de la connexion directe
  return request.ip || 'unknown'
}

/**
 * Vérifie si l'IP est dans la whitelist
 * Retourne true si :
 * - Pas de whitelist configurée (accès ouvert)
 * - IP est dans la whitelist
 */
export function isIPAllowed(ip: string): boolean {
  const allowedIPs = process.env.STAFF_ALLOWED_IPS

  // Si pas de whitelist définie, accès ouvert
  if (!allowedIPs || allowedIPs.trim() === '') {
    return true
  }

  // Parse la liste d'IPs autorisées
  const whitelist = allowedIPs
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)

  // Vérifier si l'IP est dans la whitelist
  return whitelist.includes(ip)
}

/**
 * Vérifie si l'IP est autorisée ET retourne un message d'erreur si non
 */
export function checkIPWhitelist(request: NextRequest): {
  allowed: boolean
  ip: string
  reason?: string
} {
  const ip = getClientIP(request)
  const allowed = isIPAllowed(ip)

  if (!allowed) {
    return {
      allowed: false,
      ip,
      reason: `Accès refusé depuis cette IP (${ip}). Cette fonctionnalité est réservée aux appareils autorisés du café.`,
    }
  }

  return { allowed: true, ip }
}

/**
 * Helper pour formatter les messages de log IP
 */
export function formatIPLog(
  ip: string,
  action: string,
  success: boolean
): string {
  const status = success ? '✅' : '❌'
  return `${status} [IP: ${ip}] ${action}`
}
