# Guide des Composants React

> Documentation des composants et patterns de l'application admin.
> **Derniere mise a jour** : 2026-01-20

---

## Structure des Composants

```
/src/components/
├── ui/                    # shadcn/ui (ne pas modifier)
├── layout/                # Header, Sidebar, Navigation
├── hr/                    # Composants RH
│   ├── employees/
│   ├── onboarding/
│   └── availability/
├── clocking/              # Pointage
├── schedule/              # Planning
├── accounting/            # Comptabilite
├── pdf/                   # Generation PDF
└── shared/                # Composants partages
```

---

## Patterns Obligatoires

### 1. Skeleton Loading

Chaque page doit avoir un skeleton pendant le chargement.

```tsx
// MaPageSkeleton.tsx
export function MaPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-9 w-64" />
      <Card>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// MaPageClient.tsx
export function MaPageClient() {
  const { data, loading } = useData();

  if (loading) return <MaPageSkeleton />;

  return <div>...</div>;
}
```

### 2. Extraction de Hooks

Extraire la logique des que le composant depasse 100 lignes.

```tsx
// hooks/useEmployees.ts
export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  // ...logique
  return { employees, loading, refetch };
}

// components/EmployeeList.tsx
export function EmployeeList() {
  const { employees, loading } = useEmployees();
  return <div>{employees.map(...)}</div>;
}
```

### 3. Props Typees

Toujours typer les props avec interface.

```tsx
interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  // ...
}
```

---

## Composants UI (shadcn/ui)

Composants disponibles dans `/src/components/ui/` :

- `Button` - Boutons avec variantes
- `Card` - Conteneur avec header/content/footer
- `Dialog` - Modales
- `DataTable` - Tableaux avec tri/filtres
- `Form` - Formulaires avec validation
- `Input` / `Select` / `Checkbox` - Champs de formulaire
- `Skeleton` - Loading states
- `Toast` - Notifications

---

## Voir Aussi

- [shadcn/ui docs](https://ui.shadcn.com/)
- [CLAUDE.md](/apps/admin/CLAUDE.md) - Conventions detaillees

---

*TODO: Completer avec exemples specifiques du projet*
