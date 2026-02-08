# Guide des Composants React

Guide pour créer des composants propres et maintenables.

## 🎨 Pattern Skeleton Loading (OBLIGATOIRE)

**RÈGLE** : Chaque page dashboard DOIT avoir un skeleton loader.

### Pourquoi ?

- ✅ Meilleure expérience utilisateur (UX)
- ✅ Évite les pages vides pendant le chargement
- ✅ Feedback visuel immédiat

### Structure Recommandée

```
/app/(dashboard)/(admin)/ma-page/
├── page.tsx                 # Server component avec auth
├── MaPageClient.tsx         # Client component principal
└── MaPageSkeleton.tsx       # Skeleton loader
```

### Exemple Complet

```typescript
// MaPageSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MaPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" /> {/* Titre */}
        <Skeleton className="h-10 w-[200px]" /> {/* Button */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

```typescript
// MaPageClient.tsx
"use client";

import { MaPageSkeleton } from "./MaPageSkeleton";
import { useMesData } from "@/hooks/useMesData";

export function MaPageClient() {
  const { data, loading, error } = useMesData();

  // ✅ Afficher skeleton pendant chargement
  if (loading) {
    return <MaPageSkeleton />;
  }

  // ✅ Gérer les erreurs
  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Contenu de la page */}
    </div>
  );
}
```

### Tailles Courantes

```typescript
// Texte
<Skeleton className="h-4 w-32" />   // Petit texte
<Skeleton className="h-6 w-48" />   // Texte moyen
<Skeleton className="h-9 w-64" />   // Titre (h1)

// Boutons
<Skeleton className="h-10 w-24" />  // Bouton standard

// Cards stats
<Skeleton className="h-8 w-12" />   // Chiffre stat

// Icônes
<Skeleton className="h-4 w-4 rounded-full" />
```

---

## 📋 Pattern Page d'Index (BONNE PRATIQUE)

**RÈGLE** : Créer une page d'index pour les sections avec sous-menus.

### Pourquoi ?

- ✅ Meilleure navigation
- ✅ Vue d'ensemble de la section
- ✅ Accès rapide aux sous-pages

### Choix de Présentation

| Type de contenu | Présentation | Exemple |
|-----------------|--------------|---------|
| **Outils/Actions** | Liste verticale | Dev Tools, Settings |
| **Modules métier** | Cards en grid | HR, Comptabilité |
| **Données** | Table ou liste | Utilisateurs, Messages |

### Exemple 1 : Liste Verticale

```typescript
// /app/admin/dev/page.tsx
import { Terminal, Bell, Database } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DevToolsPage() {
  const tools = [
    {
      title: "Notifications",
      description: "Tester le système de notifications push",
      icon: Bell,
      href: "/admin/debug/notifications",
    },
    {
      title: "Database",
      description: "Explorer et gérer la base de données",
      icon: Database,
      href: "/dev/database",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Terminal className="w-8 h-8" />
          Dev Tools
        </h1>
        <p className="text-muted-foreground mt-2">
          Outils de développement et de débogage
        </p>
      </div>

      <div className="space-y-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tool.icon className="w-5 h-5" />
                  {tool.title}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Exemple 2 : Cards en Grid

```typescript
// /app/admin/hr/page.tsx
import { Users, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HRPage() {
  const modules = [
    {
      title: "Employés",
      description: "Gérer les employés et leurs contrats",
      icon: Users,
      href: "/admin/hr/employees",
      stats: "12 employés actifs",
    },
    {
      title: "Planning",
      description: "Planifier les shifts et horaires",
      icon: Calendar,
      href: "/admin/hr/schedule",
      stats: "Semaine en cours",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Ressources Humaines</h1>
        <p className="text-muted-foreground mt-2">
          Gestion des employés, planning et pointage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <module.icon className="w-8 h-8 text-primary" />
                  <span className="text-xs text-muted-foreground">{module.stats}</span>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧩 Structure d'un Composant

```typescript
// components/hr/EmployeeCard.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone } from 'lucide-react'
import type { Employee } from '@/types/hr'

/**
 * Card affichant les infos d'un employé
 *
 * @param employee - Employé à afficher
 * @param onEdit - Callback pour éditer
 * @param onDelete - Callback pour supprimer
 */
interface EmployeeCardProps {
  employee: Employee
  onEdit?: (employee: Employee) => void
  onDelete?: (employeeId: string) => void
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {employee.firstName} {employee.lastName}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <Mail className="w-4 h-4" />
            <span>{employee.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{employee.phone}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(employee.id)}>
              Supprimer
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
```

---

## 🪝 Hooks Personnalisés

**Extraire la logique dans des hooks custom**

```typescript
// hooks/useEmployees.ts
import { useState, useEffect } from 'react'
import type { Employee } from '@/types/hr'

interface UseEmployeesOptions {
  status?: 'active' | 'inactive' | 'all'
}

interface UseEmployeesReturn {
  employees: Employee[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEmployees(options: UseEmployeesOptions = {}): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status && options.status !== 'all') {
        params.set('status', options.status)
      }

      const response = await fetch(`/api/hr/employees?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue')
      }

      setEmployees(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [options.status])

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
  }
}
```

---

## ✅ Checklist Composant

Avant de valider un composant :

- [ ] Props typées avec interface dédiée
- [ ] JSDoc si composant public/réutilisable
- [ ] Fichier < 200 lignes (extraire hooks si > 100 lignes)
- [ ] Imports shadcn/ui pour UI (Button, Card, etc.)
- [ ] Skeleton loader si applicable
- [ ] Responsive (Tailwind breakpoints)
- [ ] Pas de `any` dans les types
- [ ] Tests visuels (mobile + desktop)

---

**Voir aussi** :
- [CONVENTIONS.md](./CONVENTIONS.md) - Conventions de code
- [TYPES_GUIDE.md](./TYPES_GUIDE.md) - Typage des props
