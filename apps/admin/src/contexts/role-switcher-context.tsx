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
  const { data: session } = useSession()
  const userRole = session?.user?.role as 'dev' | 'admin' | 'staff' | undefined

  // Find the role matching the user's actual role
  // Default to 'staff' if no role (user not logged in)
  const initialRole = availableRoles.find(r => r.value === userRole)
    || availableRoles.find(r => r.value === 'staff')
    || availableRoles[0]
  const [selectedRole, setSelectedRole] = React.useState<Role>(initialRole)
  const [hasManuallyChanged, setHasManuallyChanged] = React.useState(false)

  // Update selected role when session changes (but not if user manually changed it)
  React.useEffect(() => {
    if (userRole && !hasManuallyChanged) {
      const matchingRole = availableRoles.find(r => r.value === userRole)
      if (matchingRole) {
        setSelectedRole(matchingRole)
      }
    }
  }, [userRole, availableRoles, hasManuallyChanged])

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
