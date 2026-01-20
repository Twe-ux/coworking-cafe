# Guide de Demarrage Rapide

> Comment demarrer avec l'application admin du Coworking Cafe.
> **Derniere mise a jour** : 2026-01-20

---

## Prerequis

- **Node.js** >= 18.x
- **pnpm** >= 8.x
- **MongoDB** (local ou Atlas)

---

## Installation

```bash
# Cloner le repo (si pas deja fait)
git clone <repo-url>
cd coworking-cafe

# Installer les dependances
pnpm install

# Configuration
cp apps/admin/.env.example apps/admin/.env.local
# Editer .env.local avec les bonnes valeurs
```

---

## Demarrage

```bash
# Demarrer l'application admin
pnpm --filter @coworking-cafe/admin dev

# Ou depuis la racine (site + admin)
pnpm dev
```

L'application est disponible sur `http://localhost:3001`

---

## Structure du Projet

```
/apps/admin/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Composants React
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitaires
│   ├── models/           # Modeles Mongoose
│   └── types/            # Types TypeScript
├── docs/                 # Cette documentation
├── public/               # Assets statiques
└── CLAUDE.md             # Instructions Claude Code
```

---

## Comptes de Test

| Email | Role | Acces |
|-------|------|-------|
| admin@coworking.com | Admin | Complet |
| dev@coworking.com | Dev | Complet + Debug |
| staff@coworking.com | Staff | Lecture seule |

---

## Prochaines Etapes

1. Lire le [Guide de Developpement](./DEVELOPMENT.md)
2. Consulter l'[Architecture API](../architecture/API_ROUTES.md)
3. Executer la [Checklist de Tests](../testing/TESTING_CHECKLIST.md)

---

*Pour toute question, consulter le CLAUDE.md ou contacter l'equipe.*
