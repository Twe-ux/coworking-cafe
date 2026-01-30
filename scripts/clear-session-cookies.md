# 🧹 Nettoyer les Cookies de Session

## 🎯 Problème

Après avoir changé `NEXTAUTH_SECRET` sur Vercel, les **anciens JWT tokens** sont toujours dans ton navigateur. Ces tokens ont été signés avec l'ancien secret → maintenant invalides.

## ✅ SOLUTION: Supprimer les Cookies Manuellement

### Option A: DevTools (Recommandé - Précis)

1. **Ouvrir le site en production**:
   👉 https://coworking-cafe-admin.vercel.app

2. **Ouvrir DevTools**:
   - Chrome/Edge: `F12` ou `Cmd+Option+I` (macOS)
   - Safari: `Cmd+Option+I` (activer "Développeur" dans Préférences)
   - Firefox: `F12` ou `Cmd+Shift+I`

3. **Aller dans l'onglet Application** (Chrome/Edge) ou **Storage** (Firefox/Safari)

4. **Cookies** → `https://coworking-cafe-admin.vercel.app`

5. **Supprimer ces cookies**:
   ```
   next-auth.session-token.admin
   next-auth.callback-url.admin
   next-auth.csrf-token.admin
   ```
   (Clic droit → Delete ou icône 🗑️)

6. **Fermer DevTools**

7. **Rafraîchir la page**: `Cmd+R` ou `F5`

8. **Se reconnecter** avec ton PIN

---

### Option B: Supprimer Tous les Cookies du Site (Plus Rapide)

**Chrome/Edge**:
1. Cliquer sur l'icône 🔒 (ou ℹ️) à gauche de l'URL
2. Cliquer sur "Cookies"
3. Chercher `coworking-cafe-admin.vercel.app`
4. Cliquer "Remove" ou "Supprimer"
5. Rafraîchir la page

**Safari**:
1. Safari → Préférences → Confidentialité
2. Gérer les données de sites web
3. Chercher `coworking-cafe-admin.vercel.app`
4. Supprimer
5. Fermer et rafraîchir

**Firefox**:
1. Cliquer sur l'icône 🔒 à gauche de l'URL
2. "Effacer les cookies et les données de site"
3. Confirmer
4. Rafraîchir la page

---

### Option C: Vider Cache & Cookies (Nuclear Option)

**Si les options A et B ne marchent pas**:

```
Chrome/Edge: Cmd+Shift+Delete (macOS) / Ctrl+Shift+Delete (Windows)
→ Sélectionner "Cookies et données de sites"
→ Période: "Dernière heure"
→ Effacer les données

Safari: Cmd+Option+E (vider les caches)
Puis Safari → Préférences → Confidentialité → Gérer les données de sites web → Tout supprimer

Firefox: Cmd+Shift+Delete / Ctrl+Shift+Delete
→ Cookies et données de sites
→ Effacer maintenant
```

**⚠️ Attention**: Cela va te déconnecter de tous les sites visités récemment.

---

## 🔍 Vérifier que le Fix est Déployé

Avant de tester, vérifie que mon dernier commit est bien déployé:

1. **Aller sur Vercel Dashboard**:
   👉 https://vercel.com/dashboard

2. **Cliquer sur ton projet** (coworking-cafe-admin)

3. **Onglet Deployments**

4. **Vérifier le dernier déploiement**:
   - Status: ✅ Ready (vert)
   - Commit: `fix(admin): fix session role type mismatch in JWT callback`
   - Date: Aujourd'hui (il y a ~15 min)

Si **pas encore déployé** (🟡 Building) → Attendre 2-3 min

Si **déployé avec erreur** (🔴 Error) → Partager l'erreur

---

## 🧪 Tester Après Nettoyage

1. **Page doit être déconnectée**:
   - Tu vois la page `/login`
   - Pas de sidebar

2. **Te reconnecter**:
   - Entrer ton PIN dev
   - Appuyer sur Entrée

3. **Vérifier session côté serveur**:
   - Tu dois être redirigé vers `/admin` (ou page demandée)
   - La sidebar dev apparaît

4. **Tester accès routes admin**:
   - Cliquer sur "Ressources Humaines" → "Employés"
   - URL doit être: `/admin/hr/employees`
   - Page doit charger (pas de redirect /login)

---

## 🔬 Si Problème Persiste

**Partager les logs Vercel**:

1. Vercel Dashboard → Logs

2. Se reconnecter sur le site

3. Chercher dans les logs:
   ```
   GET /admin/hr/employees
   [next-auth]
   middleware
   ```

4. Copier et partager les logs pertinents

---

## 💡 Pourquoi Nettoyer les Cookies?

Quand tu changes `NEXTAUTH_SECRET`:

**Ancien flux** (avant changement):
```
Login → JWT créé avec SECRET_V1 → Cookie stocké
Page /admin → Middleware vérifie JWT avec SECRET_V1 → ✅ OK
```

**Nouveau flux** (après changement):
```
Cookie ancien JWT (signé avec SECRET_V1) toujours présent
Page /admin → Middleware vérifie JWT avec SECRET_V2 → ❌ Signature invalide → Redirect /login
```

**Solution**:
```
Supprimer cookie → Forcer nouveau login → JWT créé avec SECRET_V2 → ✅ OK
```

---

## 📋 Checklist

Avant de tester:

- [ ] Dernier commit déployé sur Vercel (✅ Ready)
- [ ] Cookies NextAuth supprimés (Option A, B ou C)
- [ ] Cache navigateur vidé (Cmd+Shift+R)
- [ ] Déconnecté du site (page /login visible)

Après reconnexion:

- [ ] Redirect vers /admin (ou page demandée)
- [ ] Sidebar dev visible
- [ ] Clic sur route /admin/... charge la page (pas de redirect)
