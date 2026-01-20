# 🧪 Checklist de Tests - Admin App

> **Date de création** : 2026-01-16
> **Version** : 1.0
> **Status** : Ready for testing

---

## 📖 Vue d'ensemble

Cette checklist couvre tous les tests manuels à effectuer pour valider le bon fonctionnement de l'application admin après le refactoring complet.

**Temps estimé** : 30-45 minutes pour tous les tests
**Temps minimum** : 5 minutes pour les tests critiques

---

## 🚀 Démarrage

```bash
# 1. Démarrer le serveur de développement
cd apps/admin
pnpm dev

# 2. Ouvrir le navigateur
open http://localhost:3001

# 3. Ouvrir les DevTools (F12)
# Garder l'onglet Console ouvert pour détecter les erreurs
```

---

## 🔐 1. Tests d'Authentification

### Objectif
Valider que le système d'authentification et de permissions fonctionne correctement.

### Tests à effectuer

- [ ] **Login avec compte admin**
  - Email : `admin@coworking.com`
  - Doit avoir accès à toutes les pages
  - Vérifier le badge "Admin" dans le header

- [ ] **Login avec compte dev**
  - Email : `dev@coworking.com`
  - Doit avoir accès à toutes les pages
  - Vérifier le badge "Dev" dans le header

- [ ] **Login avec compte manager**
  - Email : `manager@coworking.com`
  - Doit avoir accès en lecture à HR et Planning
  - Ne peut PAS modifier/supprimer

- [ ] **Login avec compte staff**
  - Email : `staff@coworking.com`
  - Accès limité à "Mon Planning"
  - Tentative d'accès à `/hr/employees` → Doit voir page **403 Forbidden**

- [ ] **Sans authentification**
  - Se déconnecter
  - Tenter d'accéder à `/hr/employees`
  - Doit rediriger vers `/login` ou afficher **401 Unauthorized**

- [ ] **Déconnexion**
  - Cliquer sur "Se déconnecter" dans le menu
  - Vérifier redirection vers `/login`
  - Impossible d'accéder aux pages protégées

### Critères de succès
✅ Chaque rôle a les permissions appropriées
✅ Les redirections fonctionnent
✅ Les pages d'erreur s'affichent correctement

---

## 👥 2. Tests CRUD Employés

**Page** : `/hr/employees`
**Rôle requis** : Admin ou Dev

### Tests à effectuer

- [ ] **Affichage de la liste**
  - La liste des employés s'affiche
  - Les colonnes sont : Nom, Email, Rôle, Statut, Actions
  - Le nombre total d'employés est affiché

- [ ] **Créer un nouvel employé**
  - Cliquer sur "Nouveau employé"
  - Remplir le formulaire :
    - Prénom : `Jean`
    - Nom : `Dupont`
    - Email : `jean.dupont@test.com`
    - Téléphone : `0612345678`
    - Date de naissance : `1990-01-01`
    - Adresse complète
    - Type de contrat : `CDI`
    - Heures contractuelles : `35`
    - Date d'embauche : `2026-02-01`
    - Taux horaire : `15.50`
    - Rôle : `Employé`
    - Code pointage : `1234`
    - Couleur : `bg-blue-500`
  - Soumettre le formulaire
  - Vérifier que l'employé apparaît dans la liste

- [ ] **Modifier un employé existant**
  - Cliquer sur l'icône "Modifier" (crayon)
  - Changer le prénom : `Jean` → `Pierre`
  - Sauvegarder
  - Vérifier que le changement est visible dans la liste

- [ ] **Rechercher un employé**
  - Utiliser la barre de recherche
  - Taper `Pierre`
  - Vérifier que seul l'employé correspondant s'affiche
  - Effacer la recherche → tous les employés réapparaissent

- [ ] **Filtrer par statut**
  - Filtrer par "Actifs"
  - Vérifier que seuls les employés actifs s'affichent
  - Filtrer par "Inactifs"
  - Revenir à "Tous"

- [ ] **Supprimer un employé (soft delete)**
  - Cliquer sur l'icône "Supprimer" (poubelle)
  - Confirmer la suppression
  - Vérifier que l'employé passe en statut "Inactif"
  - L'employé doit rester visible avec filtre "Inactifs"

- [ ] **Pagination (si > 10 employés)**
  - Vérifier que la pagination fonctionne
  - Naviguer entre les pages
  - Changer le nombre d'éléments par page

### Critères de succès
✅ Tous les CRUD fonctionnent sans erreur
✅ Les données sont bien sauvegardées en BD
✅ Aucune erreur dans la console

---

## ⏰ 3. Tests Pointage

**Page** : `/hr/clocking-admin`
**Rôle requis** : Admin ou Dev

### Tests à effectuer

- [ ] **Affichage de la liste des créneaux**
  - Les créneaux du jour s'affichent
  - Colonnes : Employé, Date, Heure début, Heure fin, Durée, Actions

- [ ] **Créer un créneau manuel**
  - Cliquer sur "Créer un créneau"
  - Sélectionner un employé : `Pierre Dupont`
  - Date : Date du jour
  - Heure début : `09:00`
  - Heure fin : `12:00`
  - Soumettre
  - Vérifier que le créneau apparaît dans la liste

- [ ] **Vérifier le format des données**
  - Ouvrir DevTools → Network
  - Créer un créneau
  - Vérifier dans la requête :
    - `date` : Format `"YYYY-MM-DD"` (ex: `"2026-01-16"`)
    - `clockIn` : Format `"HH:mm"` (ex: `"09:00"`)
    - `clockOut` : Format `"HH:mm"` ou `null`

- [ ] **Modifier l'heure de début**
  - Cliquer sur l'icône "Modifier" d'un créneau
  - Changer `09:00` → `08:30`
  - Sauvegarder
  - Vérifier la mise à jour dans la liste

- [ ] **Modifier l'heure de fin**
  - Modifier un créneau
  - Changer `12:00` → `13:00`
  - Sauvegarder
  - Vérifier que la durée se recalcule automatiquement

- [ ] **Supprimer un créneau**
  - Cliquer sur l'icône poubelle à droite du créneau
  - Confirmer la suppression
  - Vérifier que le créneau disparaît de la liste

- [ ] **Tester créneau non clôturé**
  - Créer un créneau avec seulement `clockIn` (pas de `clockOut`)
  - Vérifier que le statut est "En cours"
  - Vérifier qu'on peut le clôturer manuellement

- [ ] **Changement de date**
  - Utiliser le sélecteur de date
  - Changer pour voir les créneaux d'hier
  - Revenir à aujourd'hui

### Critères de succès
✅ Format date/heure : strings (pas de timestamps)
✅ Les créneaux se créent/modifient/suppriment correctement
✅ Les calculs de durée sont corrects
✅ Aucune erreur 400 dans la console

---

## 📅 4. Tests Planning

**Page** : `/hr/schedule`
**Rôle requis** : Admin, Dev, ou Manager (lecture)

### Tests à effectuer

- [ ] **Affichage du calendrier du mois**
  - Le calendrier du mois en cours s'affiche
  - Les créneaux apparaissent aux bonnes dates
  - Les couleurs par employé sont visibles

- [ ] **Navigation entre les mois**
  - Cliquer sur "Mois précédent" (←)
  - Vérifier que le calendrier change
  - Cliquer sur "Mois suivant" (→)
  - Revenir au mois courant

- [ ] **Créer un nouveau shift**
  - Cliquer sur une case du calendrier
  - Remplir le formulaire :
    - Employé : `Pierre Dupont`
    - Date : Date sélectionnée
    - Heure début : `14:00`
    - Heure fin : `18:00`
    - Type : `Journée`
  - Soumettre
  - Vérifier que le shift apparaît dans le calendrier

- [ ] **Affichage des détails d'un shift**
  - Cliquer sur un shift existant
  - Vérifier que les infos s'affichent :
    - Nom de l'employé
    - Horaires
    - Durée calculée
    - Statut

- [ ] **Vérifier les heures affichées**
  - Ouvrir DevTools → Network
  - Charger le planning
  - Vérifier dans la réponse API :
    - Les heures sont au format `"HH:mm"`
    - Pas de décalage horaire

- [ ] **Vue liste (si disponible)**
  - Basculer en vue "Liste"
  - Vérifier que tous les shifts s'affichent
  - Revenir en vue "Calendrier"

- [ ] **Légende des couleurs**
  - Vérifier que la légende affiche les employés avec leurs couleurs
  - Vérifier la correspondance couleur ↔ employé dans le calendrier

### Critères de succès
✅ Le calendrier affiche les bons jours/mois
✅ Les shifts apparaissent aux bonnes dates
✅ Les heures sont correctes (pas de +1h ou -1h)
✅ Les couleurs par employé sont cohérentes

---

## 💰 5. Tests Comptabilité

**Page** : `/accounting/cash-control`
**Rôle requis** : Admin ou Dev

### Tests à effectuer

- [ ] **Affichage de la liste des entrées**
  - Les entrées de caisse s'affichent
  - Colonnes : Date, Type, Montant, TVA, Détails, Actions
  - Les totaux sont calculés en bas

- [ ] **Créer une nouvelle entrée de caisse**
  - Cliquer sur "Nouvelle entrée"
  - Remplir le formulaire :
    - Date : Date du jour
    - Type : `Encaissement`
    - Montant HT : `100.00`
    - Taux TVA : `20%`
    - Moyen de paiement : `Carte bancaire`
    - Libellé : `Test entrée caisse`
  - Soumettre
  - Vérifier que l'entrée apparaît dans la liste
  - Vérifier que le montant TTC est calculé automatiquement : `120.00`

- [ ] **Modifier une entrée existante**
  - Cliquer sur "Modifier" (icône crayon)
  - Changer le montant HT : `100.00` → `150.00`
  - Sauvegarder
  - Vérifier que le TTC se recalcule : `180.00`
  - Vérifier que les totaux en bas sont mis à jour

- [ ] **Supprimer une entrée**
  - Cliquer sur "Supprimer" (icône poubelle)
  - Confirmer
  - Vérifier que l'entrée disparaît
  - Vérifier que les totaux se recalculent

- [ ] **Filtrer par date**
  - Utiliser le sélecteur de plage de dates
  - Sélectionner "Cette semaine"
  - Vérifier que seules les entrées de la semaine s'affichent
  - Revenir à "Toutes les dates"

- [ ] **Filtrer par type**
  - Filtrer par "Encaissements"
  - Vérifier que seuls les encaissements s'affichent
  - Filtrer par "Décaissements"
  - Revenir à "Tous"

- [ ] **Générer un PDF de contrôle de caisse**
  - Cliquer sur "Générer PDF"
  - Vérifier qu'un PDF se télécharge
  - Ouvrir le PDF
  - Vérifier que les données sont correctes :
    - Date du rapport
    - Liste des entrées
    - Totaux (HT, TVA, TTC)
    - Solde final

### Critères de succès
✅ Les calculs de TVA sont corrects
✅ Les totaux se mettent à jour automatiquement
✅ Le PDF se génère sans erreur
✅ Les données dans le PDF correspondent à l'affichage

---

## 📊 6. Tests Dashboard

**Page** : `/`
**Rôle requis** : Tous (Admin, Dev, Manager, Staff)

### Tests à effectuer

- [ ] **Affichage des statistiques**
  - Les cartes de statistiques s'affichent :
    - Nombre d'employés actifs
    - Créneaux du jour
    - Chiffre d'affaires du jour
    - Autres métriques
  - Les chiffres sont cohérents avec les données

- [ ] **Navigation dans le menu latéral**
  - Cliquer sur chaque élément du menu :
    - 🏠 Dashboard
    - 👥 Ressources Humaines
    - 📊 Planning
    - ⏱️ Pointage
    - 💰 Comptabilité
  - Vérifier que chaque page se charge sans erreur

- [ ] **Changement de rôle (si disponible)**
  - Utiliser le "Role Switcher" dans le header
  - Basculer entre Admin/Manager/Staff
  - Vérifier que les permissions changent
  - Vérifier que les menus s'adaptent

- [ ] **Cartes de raccourcis**
  - Cliquer sur "Voir les employés" → `/hr/employees`
  - Cliquer sur "Voir le planning" → `/hr/schedule`
  - Cliquer sur "Pointage admin" → `/hr/clocking-admin`
  - Vérifier que toutes les cartes redirigent correctement

- [ ] **Graphiques et charts (si présents)**
  - Vérifier que les graphiques se chargent
  - Vérifier que les données sont cohérentes
  - Tester les interactions (hover, click)

- [ ] **Responsive design**
  - Réduire la largeur de la fenêtre (< 768px)
  - Vérifier que le menu devient un hamburger menu
  - Vérifier que les cartes s'empilent verticalement
  - Revenir à la vue desktop

### Critères de succès
✅ Toutes les statistiques affichent des données
✅ La navigation fonctionne sans erreur
✅ Le responsive est fluide
✅ Pas d'erreurs dans la console

---

## 🐛 7. Tests Console Navigateur

**Objectif** : Détecter les erreurs JavaScript et les problèmes réseau

### Tests à effectuer

- [ ] **Ouvrir les DevTools**
  - Appuyer sur `F12` ou `Cmd+Option+I` (Mac)
  - Aller dans l'onglet "Console"

- [ ] **Vérifier la console sur chaque page**
  - `/` (Dashboard)
  - `/hr/employees`
  - `/hr/clocking-admin`
  - `/hr/schedule`
  - `/accounting/cash-control`
  - `/login`

- [ ] **Critères de validation**
  - ✅ Pas d'erreurs rouges (🔴)
  - ⚠️ Les warnings jaunes sont acceptables
  - ℹ️ Les messages info/debug sont OK

- [ ] **Vérifier l'onglet Network**
  - Filtrer par "XHR" (requêtes API)
  - Vérifier que les requêtes retournent :
    - `200` pour GET réussi
    - `201` pour POST/création réussi
    - `204` pour DELETE réussi
    - Pas de `404` (Not Found)
    - Pas de `500` (Server Error)

- [ ] **Vérifier les ressources**
  - Onglet "Network" → "All"
  - Vérifier qu'il n'y a pas de fichiers manquants (404)
  - Vérifier que les images/CSS/JS se chargent

- [ ] **Performance**
  - Onglet "Lighthouse" (optionnel)
  - Lancer un audit
  - Vérifier que les scores sont > 70/100

### Critères de succès
✅ Aucune erreur critique dans la console
✅ Toutes les requêtes API retournent 2xx
✅ Pas de ressources manquantes (404)

---

## 🎨 8. Tests Pages d'Erreur

**Objectif** : Valider que les pages d'erreur personnalisées s'affichent correctement avec le design fun

### Tests à effectuer

#### 404 - Not Found
- [ ] **Accéder à une page inexistante**
  - URL : `http://localhost:3001/cette-page-nexiste-pas`
  - Vérifier l'affichage :
    - ☕ Icône café qui rebondit
    - Titre : "404"
    - Message : "Oups ! Cette page n'existe pas"
    - Gradient orange/amber/yellow
    - Bouton "Retour à l'accueil"
    - Bouton "Voir les employés"

- [ ] **Tester les boutons**
  - Cliquer sur "Retour à l'accueil" → Doit aller à `/`
  - Cliquer sur "Voir les employés" → Doit aller à `/hr/employees`

- [ ] **Vérifier les animations**
  - L'icône café doit bouger (bounce)
  - Les points doivent pulser (ping)

#### 403 - Forbidden
- [ ] **Accéder à la page**
  - URL : `http://localhost:3001/forbidden`
  - Ou : Se connecter avec `staff` et tenter d'accéder à `/hr/employees`
  - Vérifier l'affichage :
    - 🚫 Icône bouclier + cadenas animés
    - Titre : "403"
    - Message : "Accès Refusé"
    - Gradient red/pink/orange
    - Badges des rôles requis : "admin" et "dev"
    - Bouton "Retour à l'accueil"
    - Encadré avec tips

- [ ] **Tester les animations**
  - Le bouclier doit pulser
  - Le cadenas doit rebondir

#### 401 - Unauthorized
- [ ] **Accéder à la page**
  - Se déconnecter
  - URL : `http://localhost:3001/unauthorized`
  - Ou : Tenter d'accéder à une page protégée sans login
  - Vérifier l'affichage :
    - 🔐 Icône utilisateur avec badge d'alerte
    - Titre : "401"
    - Message : "Connexion Requise"
    - Gradient blue/cyan/teal
    - Bouton "Se connecter"
    - Info box "Première visite ?"

- [ ] **Tester le bouton**
  - Cliquer sur "Se connecter" → Doit aller à `/login`

#### 500 - Error (General)
- [ ] **Forcer une erreur**
  - Méthode 1 : Modifier temporairement un composant pour throw une erreur
  - Méthode 2 : Créer une route qui lance `throw new Error('Test')`
  - Vérifier l'affichage :
    - 💥 Triangle d'alerte avec gouttes de café
    - Titre : "Oups !"
    - Message : "Une erreur s'est produite"
    - Gradient purple/indigo/blue
    - Bouton "Réessayer"
    - Bouton "Retour à l'accueil"
    - Citation de développeur humoristique

- [ ] **Tester le bouton Réessayer**
  - Cliquer sur "Réessayer"
  - Vérifier que la page se recharge (tente de résoudre l'erreur)

- [ ] **Mode développement**
  - En mode dev (`NODE_ENV=development`)
  - Vérifier qu'un encadré affiche le message d'erreur exact
  - Vérifier que le digest s'affiche

### Critères de succès
✅ Toutes les pages d'erreur s'affichent avec le bon design
✅ Les animations fonctionnent (bounce, pulse, ping)
✅ Les boutons de navigation redirigent correctement
✅ Les messages sont clairs et utiles
✅ Le thème coworking/café est cohérent

---

## ⚡ Test Rapide (5 minutes)

Si tu as peu de temps, voici le test minimal pour valider que l'essentiel fonctionne :

### Séquence de test rapide

1. **Démarrer** : `pnpm dev` → `http://localhost:3001`

2. **Login** : Se connecter avec `admin@coworking.com`

3. **Dashboard** : Vérifier que les stats s'affichent

4. **Employés** :
   - Aller à `/hr/employees`
   - Créer 1 employé rapide

5. **Pointage** :
   - Aller à `/hr/clocking-admin`
   - Créer 1 créneau pour l'employé créé

6. **Comptabilité** :
   - Aller à `/accounting/cash-control`
   - Créer 1 entrée de caisse

7. **Console** :
   - F12 → Vérifier qu'il n'y a pas d'erreurs rouges

8. **Bonus** :
   - Aller à `/page-inexistante`
   - Voir la page 404 avec le café qui rebondit ☕

### Si ces 8 étapes passent → ✅ L'app est opérationnelle !

---

## 📝 Rapport de Test

Une fois tous les tests effectués, remplir ce rapport :

### Résumé

- **Date du test** : _____________
- **Testeur** : _____________
- **Version** : 1.0
- **Environnement** : Development (localhost:3001)

### Résultats par catégorie

| Catégorie | Tests passés | Tests échoués | Commentaires |
|-----------|--------------|---------------|--------------|
| 1. Authentification | __ / 6 | __ | |
| 2. CRUD Employés | __ / 8 | __ | |
| 3. Pointage | __ / 8 | __ | |
| 4. Planning | __ / 7 | __ | |
| 5. Comptabilité | __ / 7 | __ | |
| 6. Dashboard | __ / 6 | __ | |
| 7. Console | __ / 6 | __ | |
| 8. Pages d'erreur | __ / 10 | __ | |
| **TOTAL** | __ / 58 | __ | |

### Bugs trouvés

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Status final

- [ ] ✅ **VALIDÉ** - Tous les tests critiques passent, prêt pour la production
- [ ] ⚠️ **VALIDÉ AVEC RÉSERVES** - Tests passent mais quelques améliorations nécessaires
- [ ] ❌ **NON VALIDÉ** - Bugs critiques bloquants trouvés

---

## 🎯 Prochaines Étapes

Selon les résultats :

### Si VALIDÉ ✅
1. Déployer sur environnement de staging
2. Tests de charge/performance
3. Tests de sécurité
4. Déploiement production

### Si VALIDÉ AVEC RÉSERVES ⚠️
1. Créer des tickets pour les améliorations
2. Prioriser les fixes
3. Re-tester après corrections
4. Déployer en staging

### Si NON VALIDÉ ❌
1. Créer des tickets de bugs critiques
2. Fixer les bugs bloquants
3. Re-run tous les tests
4. Ne pas déployer

---

## 📚 Ressources

- **Documentation technique** : `/apps/admin/docs/REFACTORING_SUMMARY.md`
- **Guide de développement** : `/CLAUDE.md`
- **Architecture** : `/docs/CONVENTIONS.md`

---

**Bonne chance pour les tests ! 🚀**

Si tu trouves des bugs, note-les précisément (page, action, erreur) pour faciliter le debugging.
