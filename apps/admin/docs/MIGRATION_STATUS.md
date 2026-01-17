# Status de Migration du Dashboard Site → Admin

> **Objectif** : Migrer progressivement tous les modules de `/apps/site/src/app/dashboard/` vers `/apps/admin/`
>
> **Stratégie** : Migration module par module avec suppression immédiate après validation

---

## 📊 Vue d'Ensemble

| Module | Status | Priorité | APIs Partagées | Date Migration |
|--------|--------|----------|----------------|----------------|
| HR | ✅ Migré | Haute | Aucune | 2026-01-10 |
| Promo | ✅ Migré | Moyenne | `/api/promo/current-token`, `/api/promo/marketing` | 2026-01-17 |
| Contact Mail | ✅ Migré | Moyenne | `/api/contact-mails` (POST) | 2026-01-17 |
| Booking | 📋 À faire | Haute 🔴 | `/api/booking/*` | - |
| Messages | 📋 À faire | Moyenne 🟡 | Aucune | - |
| Settings | 📋 À faire | Moyenne 🟡 | `/api/spaces/*` | - |
| Analytics | 📋 À faire | Basse 🟢 | Aucune | - |

---

## ✅ Modules Migrés

### 1. HR (Ressources Humaines)

**Date de migration** : 2026-01-10

**Fonctionnalités** :
- Gestion des employés (CRUD)
- Onboarding
- Disponibilités
- Planning
- Pointage (time tracking)

**Supprimé de apps/site** : ✅ Oui

Dashboard :
- `apps/site/src/app/dashboard/hr/` (clocking, employees, schedule, timesheets - 4 pages)

Composants :
- `apps/site/src/components/hr/` (17 composants : EmployeeMonthlyStats, TimeEntryRow, ContractTemplate, EmployeeScheduling, ClockingWidget, OnboardingWizard, etc.)

APIs :
- `apps/site/src/app/api/hr/employees/`
- `apps/site/src/app/api/hr/shifts/`
- `apps/site/src/app/api/hr/time-entries/`
- `apps/site/src/app/api/hr/shift-types/`

Models :
- `apps/site/src/models/employee/`
- `apps/site/src/models/shift/`
- `apps/site/src/models/timeEntry/`
- `apps/site/src/models/shiftType/`

**APIs conservées dans apps/site** : Aucune (aucune dépendance avec site public)

**Notes** :
- Module entièrement indépendant
- Aucune dépendance avec le site public
- Migration complète réussie
- Nettoyage complet effectué (dashboard, composants, APIs, models)

**Commits** :
- `e6bbd69` - Migration initiale (2026-01-10)
- `e9fc195` - Nettoyage complet du code HR dans apps/site (2026-01-17)
  - Supprimé 12 650 lignes de code (49 fichiers)

---

### 2. Promo (Promotions & Marketing)

**Date de migration** : 2026-01-17

**Fonctionnalités** :
- Gestion des codes promo
- QR codes
- Tracking des scans
- Statistiques d'utilisation
- Configuration marketing

**Supprimé de apps/site** : ✅ Oui
- `apps/site/src/app/dashboard/promo/`
- `apps/site/src/components/dashboard/promo/`
- APIs admin promo

**APIs conservées dans apps/site** : ✅ Oui (utilisées par site public)

Fichiers conservés :
```
apps/site/src/app/api/promo/
├── current-token/route.ts       # Utilisé par /scan page
├── marketing/route.ts           # Utilisé par /scan page
└── use/route.ts                 # Utilisé par /promo/[token] page

apps/site/src/types/promo.ts     # Types partagés
```

**Raison** : Ces APIs sont utilisées par les pages publiques du site :
- `/scan` - Page de scan QR code
- `/promo/[token]` - Page d'affichage de la promo

**Models** :
- `PromoConfig` (anciennement PromoToken) - Configuration des promos
- `PromoUsage` - Tracking des utilisations
- `MarketingContent` - Contenu marketing

**Notes** :
- Structure du model préservée pour import données MongoDB
- Types compatibles entre apps/site et apps/admin
- Renommage `PromoToken` → `PromoConfig` appliqué dans apps/site

**Vérifications post-suppression** :
- ✅ Aucune erreur TypeScript liée à promo
- ✅ APIs partagées toujours présentes dans apps/site
- ✅ Types promo conservés dans apps/site
- ✅ Pages publiques (/scan, /promo/[token]) toujours fonctionnelles

**Fichiers supprimés** :

Dashboard :
- `apps/site/src/app/dashboard/promo/page.tsx`

APIs :
- `apps/site/src/app/api/admin/promo/route.ts`

Models :
- `apps/site/src/models/promo/` (model local non utilisé)

**Note** : Le service `promo-service.ts` utilise le model depuis `@coworking-cafe/database`, pas le model local qui était obsolète.

**Assets vérifiés** :
```bash
# Vérifié : src/assets/site/scss/_components/_promo.scss
# ✅ CONSERVÉ - Utilisé par pages publiques /scan et /promo/[token]
# Classes utilisées : .card-promo, .btn-scan
```

**Commits** :
- `64e2566` - Migration complète module promo + suppression dashboard (2026-01-17)
- `e9fc195` - Nettoyage model promo local obsolète (2026-01-17)

---

### 3. Contact Mail (Messages de Contact)

**Date de migration** : 2026-01-17

**Fonctionnalités** :
- Affichage des messages de contact
- Réponse par email aux demandes
- Gestion des statuts (unread, read, replied, archived)
- Statistiques de messages
- DataTable avec filtres

**Supprimé de apps/site** : ✅ Oui
- `apps/site/src/app/dashboard/contact-mails/` (page dashboard admin)
- `apps/site/src/app/api/contact-mails/[id]/` (GET, PUT, DELETE admin)
- `apps/site/src/app/api/contact-mails/unread-count/` (GET admin)
- APIs admin GET dans `apps/site/src/app/api/contact-mails/route.ts`

**APIs conservées dans apps/site** : ✅ Oui (utilisée par site public)

Fichier conservé :
```
apps/site/src/app/api/contact-mails/route.ts
└── POST  # Utilisé par formulaire de contact public /contact
```

**Raison** : L'API POST est utilisée par la page publique :
- `/contact` - Formulaire de contact public

**Models** :
- `ContactMail` - Minimal dans apps/site (structure préservée)
- `ContactMail` - Complet dans apps/admin (avec repliedBy, userId, etc.)

**Interface apps/admin** :
- Route : `/support/contact`
- Sidebar : Section "Messages" > Contact
- Permissions : dev/admin uniquement
- UI : DataTable shadcn/ui avec modal de réponse

**Composants créés** :
- `/support/contact/columns.tsx` - Colonnes DataTable
- `/support/contact/data-table.tsx` - Wrapper DataTable
- `/support/contact/ContactMessageDialog.tsx` - Modal visualisation/réponse
- `/support/contact/ContactPageClient.tsx` - Client component page
- `/support/contact/page.tsx` - Server component avec auth

**Hooks créés** :
- `useContactMessages.ts` - Gestion fetch/state messages

**Notes** :
- Template email HTML intégré (prêt pour Resend)
- Envoi email commenté (TODO: `pnpm add resend`)
- Types compatibles entre apps/site et apps/admin
- Structure du model préservée pour import données MongoDB

**Vérifications post-suppression** :
- ✅ Formulaire contact public toujours fonctionnel
- ✅ API POST préservée pour soumissions publiques
- ✅ Model minimal présent dans apps/site
- ✅ Assets SCSS publics conservés (_contact.scss)

**Assets vérifiés** :
```bash
# Vérifié : src/assets/site/scss/_components/_contact.scss
# ✅ CONSERVÉ - Utilisé par page publique /contact
# Classes utilisées : .contact, .contact__form, .location, .map
```

**Commits** :
- `[à venir]` - Migration complète module contact-mails + suppression dashboard (2026-01-17)

---

## 📋 Modules à Migrer

### 3. Booking (Réservations)

**Priorité** : Haute 🔴

**Estimation** : 2 jours

**Fonctionnalités attendues** :
- Gestion des réservations
- Calendrier de disponibilité
- Validation des réservations
- Annulations
- Historique

**APIs partagées prévisibles** : Très probable
- `/api/booking/*` - Utilisé par site public ET dashboard
- Système de réservation accessible aux visiteurs

**Complexité** : Moyenne
- Dépendances : Space, Client, Stripe
- Models à créer : Booking, Space, TimeSlot
- Intégration calendrier (FullCalendar)

**Approche recommandée** :
1. Créer models Space + Booking + TimeSlot
2. APIs dans apps/admin
3. GARDER APIs partagées dans apps/site
4. Supprimer dashboard booking de apps/site

---

### 4. Messages (Messagerie Interne)

**Priorité** : Moyenne 🟡

**Estimation** : 3 jours

**Fonctionnalités attendues** :
- Chat en temps réel
- Conversations
- Notifications
- Historique des messages

**APIs partagées** : Aucune (dashboard uniquement)

**Complexité** : Élevée
- WebSockets pour temps réel
- Notifications push
- Models : Message, Conversation, Notification

**Approche recommandée** :
1. Créer models Message + Conversation
2. Setup WebSockets (Socket.io ou Pusher)
3. APIs complètes dans apps/admin
4. Supprimer totalement de apps/site (pas d'APIs partagées)

---

### 5. Settings (Espaces, Horaires, Configuration)

**Priorité** : Moyenne 🟡

**Estimation** : 1 jour

**Fonctionnalités attendues** :
- Gestion des espaces coworking
- Horaires d'ouverture
- Tarifs
- Configuration générale

**APIs partagées prévisibles** : Probable
- `/api/spaces/*` - Peut être utilisé par site public (affichage des espaces)

**Complexité** : Faible
- Models simples : Space, OpeningHours, Config
- Pas de logique complexe

**Approche recommandée** :
1. Créer models Space + OpeningHours + Config
2. Vérifier usage dans site public
3. Garder APIs partagées si nécessaire
4. Supprimer dashboard settings de apps/site

---

### 6. Analytics Avancées

**Priorité** : Basse 🟢

**Estimation** : 2 jours

**Fonctionnalités attendues** :
- Tableaux de bord analytiques
- Graphiques avancés (Recharts)
- Exports de données
- Statistiques d'utilisation

**APIs partagées** : Aucune (dashboard admin uniquement)

**Complexité** : Moyenne
- Utilise les models existants (Employee, Booking, etc.)
- Agrégations de données
- Visualisations complexes

**Approche recommandée** :
1. Créer composants de visualisation
2. APIs d'agrégation dans apps/admin
3. Supprimer totalement de apps/site
4. Faire en dernier (quand tous les autres models sont migrés)

---

## 🗑️ Dashboard Site - Plan de Suppression Finale

**Quand TOUS les modules seront migrés, supprimer** :

```bash
# Dossiers à supprimer
apps/site/src/app/dashboard/          # Tout le dashboard
apps/site/src/components/dashboard/   # Composants dashboard

# APIs à conserver (utilisées par site public)
apps/site/src/app/api/promo/          # APIs promo publiques
apps/site/src/app/api/booking/        # APIs booking publiques (si existe)
apps/site/src/app/api/spaces/         # APIs spaces publiques (si existe)
apps/site/src/app/api/contact/        # API contact
apps/site/src/app/api/blog/           # API blog
apps/site/src/app/api/auth/           # NextAuth

# Types à évaluer au cas par cas
apps/site/src/types/                  # Garder types utilisés par site public
```

**Checklist finale** :
- [ ] Tous les modules migrés vers apps/admin
- [ ] Toutes les APIs partagées identifiées et conservées
- [ ] Tests complets du site public
- [ ] Tests complets de l'admin
- [ ] Suppression du dossier dashboard
- [ ] Mise à jour apps/site/CLAUDE.md
- [ ] Build réussi (site + admin)
- [ ] Déploiement de la nouvelle version

---

## 📝 Notes de Migration

### Règles Importantes

1. **Structure des models** : Toujours préserver la structure d'origine pour permettre l'import des données MongoDB
2. **Renommage** : Si renommage de model, mettre à jour TOUTES les références dans apps/site
3. **APIs partagées** : Toujours vérifier avec `grep` avant de supprimer une API
4. **Tests** : Tester apps/admin ET apps/site après chaque migration
5. **Suppression immédiate** : Supprimer le code du dashboard site dès que la migration est validée

### Commandes Utiles

```bash
# Identifier les usages d'une API dans le site
grep -r "fetch('/api/[module]" apps/site/src/app/(site)/

# Type check après modification
cd apps/site && pnpm type-check
cd apps/admin && pnpm type-check

# Build pour vérification finale
pnpm build
```

---

**Dernière mise à jour** : 2026-01-17
**Responsable** : Thierry + Claude
