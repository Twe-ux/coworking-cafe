"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Composant qui écoute les messages du Service Worker
 * pour naviguer vers la page ciblée par la notification
 */
export function NotificationNavigator() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Attendre que l'app soit complètement chargée
    const markAsReady = () => {
      console.log('[NotificationNavigator] App ready for navigation')
      setIsReady(true)
    }

    // Si déjà chargé, marquer immédiatement comme prêt
    if (document.readyState === 'complete') {
      markAsReady()
    } else {
      // Sinon, attendre l'événement load
      window.addEventListener('load', markAsReady)
    }

    const handleMessage = (event: MessageEvent) => {
      console.log('[NotificationNavigator] Message received from SW:', event.data)

      if (event.data.type === 'NAVIGATE' && event.data.url) {
        console.log('[NotificationNavigator] Navigation requested to:', event.data.url)

        // Attendre que l'app soit prête avant de naviguer
        if (!isReady) {
          console.log('[NotificationNavigator] App not ready yet, waiting...')
          setTimeout(() => {
            console.log('[NotificationNavigator] Navigating (delayed):', event.data.url)
            router.push(event.data.url)
          }, 500)
        } else {
          console.log('[NotificationNavigator] Navigating immediately:', event.data.url)
          router.push(event.data.url)
        }
      }
    }

    // Écouter les messages du Service Worker
    navigator.serviceWorker.addEventListener('message', handleMessage)

    console.log('[NotificationNavigator] Listening for navigation messages from Service Worker')

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
      window.removeEventListener('load', markAsReady)
    }
  }, [router, isReady])

  // Ce composant ne rend rien visuellement
  return null
}
