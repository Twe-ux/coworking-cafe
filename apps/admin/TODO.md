# TODO - Admin App

## 🔧 Refactorisation Nécessaire

### Inventory Module

**SupplierDialog.tsx** (358 lignes > 200 limite)
- [ ] Extraire validation formulaire → `useSupplierValidation.ts` hook
- [ ] Extraire champs form → `SupplierFormFields.tsx` composant
- [ ] Extraire submit logic → `submitSupplier.ts` helper
- **Objectif** : Réduire à < 200 lignes
- **Priorité** : P2 (après Phase 2 complète)
- **Créé le** : 2026-02-28

---

**ProductDialog.tsx** (à surveiller)
- [ ] Vérifier taille après Task #3
- [ ] Appliquer même pattern refacto si > 200 lignes
- **Priorité** : P2

---

_Dernière mise à jour : 2026-02-28_
