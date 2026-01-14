# TODO - Admin App

## À faire après refactoring complet

### Nettoyer le script dev.sh

- [ ] **Supprimer `/Users/twe/Developer/Thierry/bt-coworkingcafe`** (ancien projet qui pollue l'environnement)
  - Ce projet définit `MONGODB_URI=coworking-cafe` dans son `.env.local`
  - Cette variable écrase le `.env.local` de l'app admin actuelle

- [ ] **Redémarrer le terminal/IDE** pour nettoyer l'environnement système

- [ ] **Tester que `pnpm dev` fonctionne** sans le script `dev.sh`
  - Vérifier que le serveur se connecte bien à `coworking-admin`
  - Vérifier que l'authentification fonctionne

- [ ] **Supprimer `dev.sh`** une fois confirmé que tout fonctionne

---

## Contexte

Le script `dev.sh` a été créé pour contourner un problème de variable d'environnement :
- L'ancien projet `bt-coworkingcafe` définit `MONGODB_URI` pointant vers la base `coworking-cafe`
- Cette variable système écrase le `.env.local` de l'app admin qui pointe vers `coworking-admin`
- Le script fait un `unset MONGODB_URI` avant de lancer `pnpm dev`

Une fois l'ancien projet supprimé et le terminal redémarré, ce workaround ne sera plus nécessaire.
