'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'

export interface Role {
  name: string
  logo: React.ElementType
  label: string
  value: 'dev' | 'admin' | 'staff'
  description: string
}

interface RoleSwitcherContextType {
  selectedRole: Role | null
  setSelectedRole: (role: Role) => void
  availableRoles: Role[]
  canSwitchRole: boolean
}

const RoleSwitcherContext = React.createContext<RoleSwitcherContextType | undefined>(undefined)

export function RoleSwitcherProvider({
  children,
  availableRoles,
}: {
  children: React.ReactNode
  availableRoles: Role[]
}) {
  const { data: session, status } = useSession()
  const userRole = session?.user?.role as 'dev' | 'admin' | 'staff' | undefined

  // Attendre que la session soit chargée avant d'initialiser le rôle
  // Cela évite le "flash" staff → admin au chargement
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [hasManuallyChanged, setHasManuallyChanged] = React.useState(false)

  // Initialiser le rôle une seule fois quand la session est chargée
  React.useEffect(() => {
    // Ne rien faire si :
    // - Le rôle a déjà été initialisé
    // - La session est encore en chargement
    // - L'utilisateur a changé le rôle manuellement
    if (selectedRole !== null || status === 'loading' || hasManuallyChanged) {
      return
    }

    // Session chargée : initialiser avec le vrai rôle de l'utilisateur
    const initialRole = availableRoles.find(r => r.value === userRole)
      || availableRoles.find(r => r.value === 'staff')
      || availableRoles[0]

    setSelectedRole(initialRole)
  }, [session, status, userRole, availableRoles, selectedRole, hasManuallyChanged])

  // Mettre à jour le rôle si la session change (login/logout)
  // mais seulement si l'utilisateur n'a pas changé manuellement
  React.useEffect(() => {
    if (userRole && !hasManuallyChanged && selectedRole !== null) {
      const matchingRole = availableRoles.find(r => r.value === userRole)
      if (matchingRole && matchingRole.value !== selectedRole.value) {
        setSelectedRole(matchingRole)
      }
    }
  }, [userRole, availableRoles, hasManuallyChanged, selectedRole])

  // Only dev can switch roles
  const canSwitchRole = userRole === 'dev'

  // Wrapper pour setSelectedRole qui marque le changement comme manuel
  const handleSetSelectedRole = React.useCallback((role: Role) => {
    setSelectedRole(role)
    setHasManuallyChanged(true)
  }, [])

  return (
    <RoleSwitcherContext.Provider
      value={{
        selectedRole,
        setSelectedRole: handleSetSelectedRole,
        availableRoles,
        canSwitchRole,
      }}
    >
      {children}
    </RoleSwitcherContext.Provider>
  )
}

export function useRoleSwitcher() {
  const context = React.useContext(RoleSwitcherContext)
  if (context === undefined) {
    throw new Error('useRoleSwitcher must be used within a RoleSwitcherProvider')
  }
  return context
}
