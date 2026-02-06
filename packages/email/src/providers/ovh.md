# Configuration SMTP OVH

## 📋 Informations SMTP OVH

### Serveur SMTP
```
Host: ssl0.ovh.net
Port: 587 (TLS recommandé)
Ou: 465 (SSL)
Authentification: Oui (obligatoire)
```

## 🔑 Obtenir vos Credentials

### Option 1: Utiliser une adresse email existante

Si vous avez déjà une adresse email OVH (ex: `noreply@coworkingcafe.fr`) :

1. **Aller sur Manager OVH**
   - https://www.ovh.com/manager/web/
   - Section "Emails"

2. **Récupérer les informations**
   ```
   SMTP_USER: noreply@coworkingcafe.fr
   SMTP_PASSWORD: mot-de-passe-email
   ```

### Option 2: Créer une nouvelle adresse dédiée

**Recommandé : Créer `noreply@coworkingcafe.fr`**

1. **Manager OVH** → **Emails** → **Votre domaine**
2. Cliquer **"Créer une adresse e-mail"**
3. Paramètres :
   ```
   Adresse: noreply@coworkingcafe.fr
   Mot de passe: [choisir un mot de passe fort]
   ```
4. Valider

## 📧 Configuration .env.local

```bash
# OVH SMTP Configuration
SMTP_PROVIDER=ovh
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@coworkingcafe.fr
SMTP_PASSWORD=votre-mot-de-passe-email
SMTP_FROM_NAME=CoworKing Café by Anticafé
SMTP_FROM_EMAIL=noreply@coworkingcafe.fr
```

## 🧪 Tester la configuration

```bash
# Test de connexion
pnpm --filter @coworking-cafe/email test-smtp

# Test avec envoi (remplacer par votre email)
TEST_EMAIL=votre-email@example.com pnpm --filter @coworking-cafe/email test-smtp
```

## ⚡ Limites OVH

### Hébergement Web Standard
- **200 emails/heure**
- **4,800 emails/jour** (théorique)
- Limite anti-spam : ne pas envoyer trop vite

### Recommandations
- Ne pas envoyer plus de **50 emails d'un coup**
- Attendre **30 secondes** entre chaque lot
- Utiliser rate limiting dans votre code

## 🔒 Sécurité

### SPF Record (Déjà configuré par OVH)
```
v=spf1 include:mx.ovh.com ~all
```

### DKIM (À vérifier)
1. Manager OVH → Emails → Configuration
2. Activer DKIM si disponible

## 🐛 Troubleshooting

### Erreur "Authentication failed"
- Vérifier SMTP_USER = email complet (`noreply@coworkingcafe.fr`)
- Vérifier mot de passe correct
- Tester connexion email via webmail : https://mail.ovh.net/

### Erreur "Connection timeout"
- Vérifier SMTP_PORT=587
- Vérifier SMTP_SECURE=false (avec port 587)
- Si port 465 : SMTP_SECURE=true

### Emails en spam
- Vérifier SPF/DKIM configurés
- Éviter mots spam dans sujet
- Ajouter lien désinscription
- Envoyer depuis domaine principal

## 📚 Documentation OVH
- [Guide SMTP OVH](https://docs.ovh.com/fr/emails/generalites-sur-les-emails-mutualises/)
- [Webmail OVH](https://mail.ovh.net/)
- [Support OVH](https://www.ovh.com/fr/support/)
