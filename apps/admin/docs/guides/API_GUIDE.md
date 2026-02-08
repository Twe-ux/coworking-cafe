# Guide des API Routes

Guide complet pour créer et maintenir les API routes Next.js.

## 📋 Structure d'une Route API

```typescript
// /app/api/hr/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'
import { connectMongoose } from '@/lib/mongodb'
import { Employee } from '@/models/employee'
import type { ApiResponse } from '@/types/timeEntry'

// GET /api/hr/employees
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Employee[]>>> {
  // 1. Auth
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) {
    return authResult.response
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Query params
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  // 4. Logic
  try {
    const filter = status ? { isActive: status === 'active' } : {}
    const employees = await Employee.find(filter).sort({ lastName: 1 })

    return successResponse(employees, 'Employés récupérés avec succès')
  } catch (error) {
    console.error('GET /api/hr/employees error:', error)
    return errorResponse('Erreur lors de la récupération des employés', error.message)
  }
}

// POST /api/hr/employees
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Employee>>> {
  // 1. Auth (écriture = admin/dev seulement)
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) {
    return authResult.response
  }

  // 2. DB Connection
  await connectMongoose()

  // 3. Parse body
  try {
    const body = await request.json()

    // 4. Validation
    if (!body.firstName || !body.lastName || !body.email) {
      return errorResponse('Données manquantes', 'firstName, lastName, email sont requis', 400)
    }

    // 5. Business logic
    const employee = await Employee.create(body)

    return successResponse(employee, 'Employé créé avec succès', 201)
  } catch (error) {
    console.error('POST /api/hr/employees error:', error)
    return errorResponse('Erreur lors de la création de l\'employé', error.message)
  }
}
```

---

## 🔧 Helpers Disponibles

### 1. Authentication

```typescript
import { requireAuth } from '@/lib/api/auth'

// Usage
const authResult = await requireAuth(['dev', 'admin'])
if (!authResult.authorized) {
  return authResult.response // 401 ou 403 automatique
}

// authResult contient :
// - authorized: boolean
// - user: { id, name, email, role } | null
// - response: NextResponse (si non autorisé)
```

### 2. Responses Standardisées

```typescript
import { successResponse, errorResponse } from '@/lib/api/response'

// Success (200 par défaut)
return successResponse(data, 'Message optionnel')
return successResponse(data, 'Créé avec succès', 201)

// Error
return errorResponse('Message utilisateur', 'Détails techniques', 400)
return errorResponse('Erreur serveur', error.message, 500)
```

---

## 📊 Status Codes Appropriés

| Code | Usage | Exemple |
|------|-------|---------|
| **200** | GET réussi | Liste d'employés récupérée |
| **201** | POST réussi (création) | Nouvel employé créé |
| **204** | DELETE réussi | Employé supprimé (pas de contenu) |
| **400** | Erreur validation | Champs manquants ou invalides |
| **401** | Non authentifié | Pas de session active |
| **403** | Permission refusée | Role insuffisant pour l'action |
| **404** | Ressource introuvable | Employé avec cet ID inexistant |
| **500** | Erreur serveur | Erreur DB, crash inattendu |

---

## 🎯 Gestion d'Erreurs

### Pattern Try/Catch Systématique

```typescript
// ✅ BON - Try/catch avec logging
try {
  const data = await riskyOperation()
  return successResponse(data)
} catch (error) {
  // Log pour debug
  console.error('[Route] Error:', error)

  // Réponse utilisateur friendly
  return errorResponse(
    'Message utilisateur clair',
    error.message, // Détails techniques
    500
  )
}
```

### Erreurs Spécifiques

```typescript
// Validation
if (!body.email) {
  return errorResponse('Email requis', 'Le champ email est manquant', 400)
}

// Ressource introuvable
const employee = await Employee.findById(id)
if (!employee) {
  return errorResponse('Employé introuvable', `Aucun employé avec l'ID ${id}`, 404)
}

// Conflit
const existing = await Employee.findOne({ email: body.email })
if (existing) {
  return errorResponse('Email déjà utilisé', 'Cet email existe déjà', 409)
}
```

---

## 🔍 Query Parameters

### Lecture

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const status = searchParams.get('status') // ?status=active
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  // Validation
  if (page < 1 || limit < 1 || limit > 100) {
    return errorResponse('Paramètres invalides', 'page et limit doivent être positifs', 400)
  }

  // Usage
  const employees = await Employee
    .find({ isActive: status === 'active' })
    .skip((page - 1) * limit)
    .limit(limit)

  return successResponse(employees)
}
```

---

## 📝 Body Parsing

### JSON

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.firstName || !body.lastName) {
      return errorResponse('Données manquantes', 'firstName et lastName requis', 400)
    }

    // ...
  } catch (error) {
    return errorResponse('JSON invalide', 'Le body doit être du JSON valide', 400)
  }
}
```

### FormData (Upload fichiers)

```typescript
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string

    if (!file) {
      return errorResponse('Fichier manquant', 'Le champ file est requis', 400)
    }

    // ...
  } catch (error) {
    return errorResponse('Erreur parsing', error.message, 400)
  }
}
```

---

## 🗂️ Routes Dynamiques

### [id]/route.ts

```typescript
// /app/api/hr/employees/[id]/route.ts

interface RouteParams {
  params: { id: string }
}

// GET /api/hr/employees/:id
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) return authResult.response

  await connectMongoose()

  try {
    const employee = await Employee.findById(params.id)

    if (!employee) {
      return errorResponse('Employé introuvable', `ID: ${params.id}`, 404)
    }

    return successResponse(employee)
  } catch (error) {
    console.error(`GET /api/hr/employees/${params.id} error:`, error)
    return errorResponse('Erreur serveur', error.message)
  }
}

// PUT /api/hr/employees/:id
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) return authResult.response

  await connectMongoose()

  try {
    const body = await request.json()

    const employee = await Employee.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )

    if (!employee) {
      return errorResponse('Employé introuvable', `ID: ${params.id}`, 404)
    }

    return successResponse(employee, 'Employé mis à jour avec succès')
  } catch (error) {
    console.error(`PUT /api/hr/employees/${params.id} error:`, error)
    return errorResponse('Erreur mise à jour', error.message)
  }
}

// DELETE /api/hr/employees/:id
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) return authResult.response

  await connectMongoose()

  try {
    const employee = await Employee.findByIdAndDelete(params.id)

    if (!employee) {
      return errorResponse('Employé introuvable', `ID: ${params.id}`, 404)
    }

    return successResponse(null, 'Employé supprimé avec succès', 204)
  } catch (error) {
    console.error(`DELETE /api/hr/employees/${params.id} error:`, error)
    return errorResponse('Erreur suppression', error.message)
  }
}
```

---

## ✅ Checklist Nouvelle Route API

Avant de créer une nouvelle route API :

- [ ] Fichier dans le bon dossier (`/app/api/[module]/`)
- [ ] Import des helpers (`requireAuth`, `successResponse`, `errorResponse`)
- [ ] Auth en première ligne (`requireAuth()`)
- [ ] Connexion DB si nécessaire (`connectMongoose()`)
- [ ] Try/catch autour de la logique
- [ ] Validation des inputs (query params, body)
- [ ] Status codes appropriés
- [ ] Logging des erreurs (`console.error`)
- [ ] Types de retour (`Promise<NextResponse<ApiResponse<T>>>`)
- [ ] Tests manuels (Postman ou équivalent)

---

**Voir aussi** :
- [SECURITY.md](./SECURITY.md) - Authentification et sécurité
- [TYPES_GUIDE.md](./TYPES_GUIDE.md) - Types ApiResponse
