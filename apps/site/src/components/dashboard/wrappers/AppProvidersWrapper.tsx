'use client'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'
import dynamic from 'next/dynamic'
const LayoutProvider = dynamic(() => import('@/context/useLayoutContext').then((mod) => mod.LayoutProvider), {
  ssr: false,
})
import { NotificationProvider } from '@/context/useNotificationContext'
import { TopbarProvider } from '@/context/useTopbarContext'
import { ChildrenType } from '@/types/component-props'

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  const handleChangeTitle = () => {
    if (document.visibilityState == 'hidden') document.title = 'Please come back 🥺'
    else document.title = DEFAULT_PAGE_TITLE
  }

  useEffect(() => {
    // Remove splash screen after a short delay to ensure content is rendered
    const removeSplash = () => {
      const splashScreen = document.querySelector('#splash-screen')
      if (splashScreen) {
        splashScreen.classList.add('remove')
      }
    }

    // Remove splash immediately if content exists, otherwise wait a bit
    const timer = setTimeout(removeSplash, 100)

    document.addEventListener('visibilitychange', handleChangeTitle)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleChangeTitle)
    }
  }, [])

  return (
    <SessionProvider>
      <LayoutProvider>
        <TopbarProvider>
          <NotificationProvider>
            {children}
            <ToastContainer theme="colored" />
          </NotificationProvider>
        </TopbarProvider>
      </LayoutProvider>
    </SessionProvider>
  )
}
export default AppProvidersWrapper
