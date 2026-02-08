# AUDIT DES MODELS - Coworking Café

**Date:** 2026-01-21  
**Contexte:** Analyse de l'utilisation de tous les models dans le code actif (excluant src-old/)

---

## RÉSUMÉ EXÉCUTIF

✅ **Tous les models sont utilisés** - Aucun code mort détecté  
📊 **1833 références totales** aux models dans le code actif  
🏢 **Admin domine** avec 63% des références (1149 vs 684)

---

## STATISTIQUES GLOBALES

### Répartition par App

| App | Références | % |
|-----|------------|---|
| **Admin** | 1149 | 63% |
| **Site** | 684 | 37% |
| **Total** | 1833 | 100% |

### Répartition par Source

| Source | Nombre de models |
|--------|------------------|
| `packages/database` | 26 models |
| `apps/site/src/models` | 6 models spécifiques |
| `apps/admin/src/models` | 14 models spécifiques |

---

## TOP 10 - MODELS LES PLUS UTILISÉS

| Model | Total | Site | Admin | Type |
|-------|-------|------|-------|------|
| **Employee** | 287 | 2 | 285 | database |
| **Shift** | 161 | 0 | 161 | database |
| **Article** | 138 | 86 | 52 | database |
| **User** | 126 | 61 | 65 | database |
| **Booking** | 120 | 76 | 44 | database |
| **Availability** | 99 | 0 | 99 | database |
| **Comment** | 80 | 55 | 25 | database |
| **TimeEntry** | 76 | 0 | 76 | database |
| **Category** | 72 | 35 | 37 | database |
| **Payment** | 67 | 61 | 6 | database |

**Insights:**
- **Employee** est de loin le plus utilisé (287 refs), presque exclusivement dans Admin
- Les 3 models RH (Employee, Shift, TimeEntry) totalisent **524 références** dans Admin
- User, Booking, Article sont les models les plus "équilibrés" entre Site et Admin

---

## TOP 10 - MODELS LES MOINS UTILISÉS

| Model | Total | Site | Admin | Type |
|-------|-------|------|-------|------|
| **PasswordResetToken** | 4 | 4 | 0 | database |
| **Session** | 6 | 2 | 4 | database |
| **Permission** | 7 | 1 | 6 | database |
| **GlobalHoursConfiguration** | 11 | 2 | 9 | database |
| **EmailLog** | 14 | 14 | 0 | site |
| **BookingSettings** | 17 | 17 | 0 | site |
| **AdditionalService** | 21 | 21 | 0 | database |
| **CommentLike** | 21 | 21 | 0 | site |
| **ArticleLike** | 22 | 22 | 0 | site |
| **ArticleRevision** | 24 | 24 | 0 | site |

**Insights:**
- Tous sont utilisés, mais **PasswordResetToken** (4 refs) et **Session** (6 refs) sont très peu référencés
- Ces models "légers" sont normaux pour des fonctionnalités ciblées (auth, config)

---

## MODELS SPÉCIFIQUES (NON PARTAGÉS)

### Utilisés UNIQUEMENT dans Site (8 models)

| Model | Imports | Remarque |
|-------|---------|----------|
| **Media** | 48 | Gestion médias (images, etc.) |
| **ArticleRevision** | 24 | Versioning articles blog |
| **ArticleLike** | 22 | Likes sur articles |
| **AdditionalService** | 21 | Services additionnels booking |
| **CommentLike** | 21 | Likes sur commentaires |
| **BookingSettings** | 17 | Config booking côté front |
| **EmailLog** | 14 | Log emails envoyés |
| **PasswordResetToken** | 4 | Reset password |

**Justification:** Models liés à l'expérience utilisateur front (likes, médias, etc.)

### Utilisés UNIQUEMENT dans Admin (4 models)

| Model | Imports | Remarque |
|-------|---------|----------|
| **Shift** | 161 | Gestion planning employés |
| **Availability** | 99 | Disponibilités employés |
| **TimeEntry** | 76 | Pointage heures travaillées |
| **Conversation** | 34 | Messagerie interne admin |

**Justification:** Models exclusifs à la gestion RH et back-office

---

## MODELS PARTAGÉS (20 models)

Models utilisés à la fois dans Site ET Admin:

| Model | Site | Admin | Ratio Site/Admin |
|-------|------|-------|------------------|
| **Article** | 86 | 52 | 62% / 38% |
| **Booking** | 76 | 44 | 63% / 37% |
| **User** | 61 | 65 | 48% / 52% |
| **Payment** | 61 | 6 | 91% / 9% |
| **Comment** | 55 | 25 | 69% / 31% |
| **Category** | 35 | 37 | 49% / 51% |
| **Space** | 31 | 11 | 74% / 26% |
| **SpaceConfiguration** | 25 | 31 | 45% / 55% |
| **Tag** | 22 | 14 | 61% / 39% |
| **Newsletter** | 16 | 8 | 67% / 33% |
| **PromoConfig** | 11 | 25 | 31% / 69% |
| **Role** | 8 | 17 | 32% / 68% |
| **MenuItem** | 6 | 23 | 21% / 79% |
| **Message** | 5 | 52 | 9% / 91% |
| **ContactMail** | 4 | 43 | 9% / 91% |
| **MenuCategory** | 4 | 22 | 15% / 85% |
| **Employee** | 2 | 285 | 1% / 99% |
| **GlobalHoursConfiguration** | 2 | 9 | 18% / 82% |
| **Session** | 2 | 4 | 33% / 67% |
| **Permission** | 1 | 6 | 14% / 86% |

**Insights:**
- **Payment, Article, Booking, Comment** sont les models les plus "équilibrés" et critiques
- **Employee** est partagé mais utilisé à 99% dans Admin (normal)
- **ContactMail, Message** sont partagés mais dominés par Admin (gestion)

---

## ANALYSE PAR DOMAINE

### 📝 Domaine Blog/Content (5 models)

| Model | Total | Type |
|-------|-------|------|
| Article | 138 | database |
| Comment | 80 | database |
| Category | 72 | database |
| Tag | 36 | database |
| ArticleRevision | 24 | site |
| ArticleLike | 22 | site |
| CommentLike | 21 | site |

**Total:** 393 références

### 🏢 Domaine RH/Staff (4 models)

| Model | Total | Type |
|-------|-------|------|
| Employee | 287 | database |
| Shift | 161 | database |
| TimeEntry | 76 | database |
| Availability | 99 | database |

**Total:** 623 références (34% de TOUTES les références!)

### 🎫 Domaine Booking/Réservations (6 models)

| Model | Total | Type |
|-------|-------|------|
| Booking | 120 | database |
| Payment | 67 | database |
| Space | 42 | database |
| SpaceConfiguration | 56 | database |
| AdditionalService | 21 | database |
| BookingSettings | 17 | site |

**Total:** 323 références

### 👤 Domaine User/Auth (5 models)

| Model | Total | Type |
|-------|-------|------|
| User | 126 | database |
| Role | 25 | database |
| Permission | 7 | database |
| Session | 6 | database |
| PasswordResetToken | 4 | database |

**Total:** 168 références

### 💬 Domaine Messaging (3 models)

| Model | Total | Type |
|-------|-------|------|
| Message | 57 | database |
| Conversation | 34 | database |
| ContactMail | 47 | database |

**Total:** 138 références

---

## RECOMMENDATIONS

### ✅ Points Positifs

1. **Aucun code mort** - Tous les models sont utilisés dans le code actif
2. **Bonne séparation** - Les models spécifiques (site vs admin) sont bien identifiés
3. **Models partagés cohérents** - 20 models partagés de manière justifiée (User, Booking, etc.)

### ⚠️ Points d'Attention

1. **Domaine RH très lourd** 
   - 623 références (34% du total) pour 4 models seulement
   - Risque de complexité élevée dans Admin
   - Recommandation: Vérifier la complexité des composants liés à Employee/Shift

2. **Models peu utilisés mais critiques**
   - `PasswordResetToken` (4 refs) - Garder, fonctionnalité essentielle
   - `Session` (6 refs) - Garder, auth
   - `Permission` (7 refs) - Garder, sécurité

3. **Déséquilibre Admin/Site**
   - Admin représente 63% des références
   - Normal pour un back-office, mais vérifier la maintenabilité

### 📊 Prochaines Actions Suggérées

1. **Audit de complexité des composants RH** (Employee, Shift, TimeEntry)
   - Vérifier si les fichiers respectent la limite de 200 lignes
   - Extraire la logique complexe dans des hooks/services

2. **Revue des models partagés déséquilibrés**
   - ContactMail (9% site / 91% admin) - Peut-être à migrer dans admin uniquement?
   - Message (9% site / 91% admin) - Idem

3. **Documentation des models spécifiques**
   - Documenter pourquoi certains models sont site-only ou admin-only

---

## CONCLUSION

✅ **Santé du code: EXCELLENTE**
- Aucun model inutilisé (0% de code mort)
- Architecture claire avec séparation site/admin cohérente
- Répartition des models logique par domaine métier

🎯 **Focus recommandé:**
- Surveiller la complexité du domaine RH (34% des références)
- Considérer une extraction de certains models admin-heavy vers des packages dédiés

---

*Rapport généré le 2026-01-21 par Claude Code (Sonnet 4.5)*
*Méthodologie: Analyse grep des imports dans le code TypeScript actif (excluant src-old/)*
