# 🔄 Workflow Quotidien - apps/site

> Guide rapide pour travailler efficacement et tenir les docs à jour

---

## ☀️ DÉBUT DE JOURNÉE

1. **Lire TODO.md**
   ```bash
   cat apps/site/TODO.md
   ```
   - Identifier la phase actuelle
   - Choisir 2-3 tâches à faire aujourd'hui

2. **Vérifier PROGRESS.md**
   ```bash
   cat PROGRESS.md
   ```
   - Voir l'état global
   - Confirmer les priorités

---

## 💻 PENDANT LE TRAVAIL

### Quand tu commences une tâche

```bash
# 1. Marquer comme "en cours" dans TODO.md
# Remplacer: ⏳ par 🚧

# 2. Exemple: Créer types/booking.ts
# → Éditer TODO.md
#   - ⏳ Créer types/booking.ts
#   + 🚧 Créer types/booking.ts
```

### Quand tu termines une tâche

```bash
# 1. Marquer comme "terminé" dans TODO.md
# Remplacer: 🚧 par ✅

# 2. Commit immédiat
git add .
git commit -m "feat(site): créer types/booking.ts (Phase 1.2)

- BookingFormData interface
- PriceCalculation type
- ReservationDetails interface

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🌙 FIN DE JOURNÉE

### Checklist rapide

- [ ] Toutes les tâches terminées marquées ✅ dans TODO.md
- [ ] Commits faits pour chaque tâche
- [ ] TODO.md committé et pushé
- [ ] Notes personnelles sur les blocages éventuels

```bash
# Commit final de la journée
git add apps/site/TODO.md
git commit -m "docs(site): mise à jour TODO.md - fin journée $(date +%Y-%m-%d)"
git push
```

---

## 🎯 FIN DE PHASE

**Quand toute une phase est terminée (ex: Phase 1 = 100%)**

### 1. Mettre à jour TODO.md

```markdown
**Status Phase 1** : ✅ **100% TERMINÉ**
```

### 2. Mettre à jour PROGRESS.md

```bash
# Éditer /PROGRESS.md
# 1. Changer date "Dernière mise à jour"
# 2. Mettre à jour pourcentages
# 3. Ajouter la phase dans "CE QUI EST TERMINÉ"

## ✅ CE QUI EST TERMINÉ

### apps/site
- ✅ Phase 0: Préparation (100%)
- ✅ Phase 1: Fondations (100%) <- AJOUT
  - Types TypeScript complets
  - Utilitaires (format-date, validation)
  - SCSS base migrés
```

### 3. Commit global de phase

```bash
git add .
git commit -m "feat(site): Phase 1 terminée - Fondations (100%)

Phase 1 (3 jours) - TERMINÉ:
- ✅ Structure src/ créée
- ✅ Types TypeScript (booking, user, blog, common)
- ✅ Utilitaires (format-date, validation, api-client)
- ✅ SCSS base (variables, mixins, BEM)

Prochaine étape: Phase 2 - APIs Backend

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push
```

---

## 📊 SUIVI HEBDOMADAIRE

**Chaque vendredi** :

1. **Bilan de la semaine**
   - Phases complétées
   - Tâches restantes
   - Blocages rencontrés

2. **Mettre à jour PROGRESS.md**
   ```bash
   # Section "Session"
   > **Session** : Phase 1 et 2 terminées (Fondations + APIs)
   
   # Statistiques
   | apps/site | 🚧 En cours | 35% | ~2500 |
   ```

3. **Planifier semaine suivante**
   - Objectifs clairs
   - Priorités définies

---

## 🚨 RAPPELS IMPORTANTS

### Ne JAMAIS oublier

- ✅ **Commit après chaque tâche** (pas de gros commits groupés)
- ✅ **Mettre à jour TODO.md** (⏳ → 🚧 → ✅)
- ✅ **Messages de commit descriptifs** (feat, fix, docs, refactor)
- ✅ **Co-Authored-By Claude** dans tous les commits

### Messages de commit

```bash
# Format standard
<type>(scope): <description courte>

<description détaillée>
- Point 1
- Point 2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

# Types:
feat     - Nouvelle fonctionnalité
fix      - Correction de bug
docs     - Documentation
refactor - Refactoring
test     - Tests
chore    - Tâches de maintenance
```

---

## 📁 Fichiers à Surveiller

| Fichier | Fréquence | Quand |
|---------|-----------|-------|
| `apps/site/TODO.md` | 🔴 Quotidien | Après chaque tâche |
| `/PROGRESS.md` | 🟡 Hebdomadaire | Fin de phase ou vendredi |
| `apps/site/CLAUDE.md` | 🟢 Rare | Si nouvelles conventions |

---

**Bon courage! 🚀**

