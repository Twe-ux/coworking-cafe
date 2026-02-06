# @coworking-cafe/email

Service d'envoi d'emails via SMTP pour le monorepo CoworKing Café.

## 📋 Options SMTP Disponibles

| Provider | Emails/jour | Gratuit | Configuration |
|----------|-------------|---------|---------------|
| **Gmail** | 500 | ✅ Oui | App Password requis |
| **Brevo SMTP** | 300 | ✅ Oui | Compte Brevo |
| **SendGrid SMTP** | 100 | ✅ Oui | API Key |
| **Custom** | Variable | Dépend hébergeur | SMTP credentials |

## 🚀 Installation

```bash
pnpm add @coworking-cafe/email
```

## ⚙️ Configuration

### 1. Copier le fichier d'exemple

```bash
cp packages/email/.env.example apps/site/.env.local
# ou
cp packages/email/.env.example apps/admin/.env.local
```

### 2. Configurer selon votre provider

#### Option A: Gmail SMTP (Recommandé pour débuter)

```bash
# .env.local
SMTP_PROVIDER=gmail
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password (16 chars)
SMTP_FROM_NAME=CoworKing Café
SMTP_FROM_EMAIL=noreply@coworkingcafe.fr
```

**Obtenir un App Password Gmail** :
1. Aller sur https://myaccount.google.com/apppasswords
2. Sélectionner "Mail" et "Other device"
3. Copier le mot de passe généré (16 caractères)

**Limites** : 500 emails/jour

---

#### Option B: Brevo SMTP (Meilleur gratuit)

```bash
# .env.local
SMTP_PROVIDER=brevo
BREVO_SMTP_USER=your-brevo-login
BREVO_SMTP_PASSWORD=your-brevo-smtp-key
SMTP_FROM_NAME=CoworKing Café
SMTP_FROM_EMAIL=noreply@coworkingcafe.fr
```

**Obtenir les credentials Brevo** :
1. Créer un compte sur https://www.brevo.com/
2. Aller dans "SMTP & API" → "SMTP"
3. Copier login et SMTP key

**Limites** : 300 emails/jour gratuit

---

#### Option C: Custom SMTP (Votre hébergeur)

```bash
# .env.local
SMTP_PROVIDER=custom
SMTP_HOST=smtp.your-host.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@coworkingcafe.fr
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_NAME=CoworKing Café
SMTP_FROM_EMAIL=noreply@coworkingcafe.fr
```

---

## 📧 Utilisation

### Import dans votre app

```typescript
import {
  sendEmail,
  sendBookingConfirmation,
  sendContactFormEmail
} from '@coworking-cafe/email';
```

### Envoyer un email simple

```typescript
await sendEmail({
  to: 'client@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1><p>This is a test</p>',
  text: 'Hello\nThis is a test'
});
```

### Envoyer une confirmation de réservation

```typescript
await sendBookingConfirmation('client@example.com', {
  name: 'Jean Dupont',
  spaceName: 'Salle de Réunion A',
  date: '2026-02-10',
  time: '14:00 - 16:00',
  price: 50.00,
  bookingId: 'BK-123456'
});
```

### Envoyer un email de contact

```typescript
await sendContactFormEmail('admin@coworkingcafe.fr', {
  name: 'Jean Dupont',
  subject: 'Demande de renseignements',
  message: 'Bonjour, je souhaite...',
  replyTo: 'jean@example.com'
});
```

---

## 🧪 Tester la connexion SMTP

```typescript
import { verifySMTPConnection } from '@coworking-cafe/email';

// Tester la connexion
const isConnected = await verifySMTPConnection();

if (isConnected) {
  console.log('✅ SMTP configuré correctement');
} else {
  console.error('❌ Erreur de configuration SMTP');
}
```

---

## 📊 Comparaison des Providers

### Gmail SMTP
- ✅ Gratuit
- ✅ Simple à configurer
- ✅ Bonne délivrabilité
- ❌ 500 emails/jour max
- ❌ "via Gmail" visible

### Brevo SMTP
- ✅ 300 emails/jour gratuit
- ✅ Analytics inclus
- ✅ Domaine personnalisé
- ✅ Support gratuit
- ⚠️ Nécessite compte

### Custom SMTP
- ✅ Souvent inclus avec hébergement
- ✅ Domaine personnalisé
- ✅ Pas de limite stricte
- ⚠️ Configuration variable
- ⚠️ Délivrabilité dépend de l'hébergeur

---

## 🔧 API Reference

### `sendEmail(options, senderType?)`

Envoie un email via SMTP.

**Paramètres** :
- `options.to` (string | string[]) - Destinataire(s)
- `options.subject` (string) - Sujet
- `options.html` (string) - Contenu HTML
- `options.text?` (string) - Contenu texte brut
- `options.from?` (string) - Expéditeur personnalisé
- `options.replyTo?` (string) - Email de réponse
- `options.attachments?` (Array) - Pièces jointes
- `senderType?` ('booking' | 'contact' | 'default') - Type d'expéditeur

**Retour** : `Promise<boolean>`

---

### `sendBookingConfirmation(email, bookingDetails)`

Envoie une confirmation de réservation.

**Paramètres** :
- `email` (string) - Email du client
- `bookingDetails` (object) :
  - `name` (string) - Nom du client
  - `spaceName` (string) - Nom de l'espace
  - `date` (string) - Date (YYYY-MM-DD)
  - `time` (string) - Horaire
  - `price` (number) - Prix
  - `bookingId` (string) - ID de réservation

**Retour** : `Promise<boolean>`

---

### `sendContactFormEmail(email, details)`

Envoie un email depuis le formulaire de contact.

**Paramètres** :
- `email` (string) - Email destinataire (admin)
- `details` (object) :
  - `name` (string) - Nom de l'expéditeur
  - `subject` (string) - Sujet
  - `message` (string) - Message
  - `replyTo?` (string) - Email de réponse

**Retour** : `Promise<boolean>`

---

## ⚠️ Limitations et Bonnes Pratiques

### Limitations Gmail SMTP
- **500 emails/jour** maximum
- Ne pas envoyer en masse (risque de blocage)
- Utiliser App Passwords (pas votre mot de passe Gmail)

### Bonnes Pratiques
1. **Toujours inclure une version text** (pas seulement HTML)
2. **Gérer les erreurs** (catch les rejets)
3. **Ne pas envoyer trop vite** (rate limiting)
4. **Tester en dev** avant production

### Rate Limiting Recommandé
```typescript
// Ne pas envoyer plus de 10 emails/seconde
import pLimit from 'p-limit';

const limit = pLimit(10);

const promises = emails.map(email =>
  limit(() => sendEmail(email))
);

await Promise.all(promises);
```

---

## 🐛 Troubleshooting

### Erreur "Invalid login"
- Vérifier SMTP_USER et SMTP_PASSWORD
- Gmail : Utiliser App Password (pas mot de passe normal)
- Vérifier que 2FA est activé (Gmail)

### Erreur "Connection timeout"
- Vérifier SMTP_HOST et SMTP_PORT
- Vérifier firewall/proxy
- Tester avec `verifySMTPConnection()`

### Emails en spam
- Configurer SPF/DKIM/DMARC pour votre domaine
- Éviter mots spam dans sujet
- Inclure lien de désinscription
- Utiliser domaine professionnel (pas Gmail)

---

## 📚 Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Brevo SMTP Guide](https://help.brevo.com/hc/en-us/articles/209467485)
- [Email Best Practices](https://www.emailvendorselection.com/email-best-practices/)

---

## 🔐 Sécurité

**⚠️ JAMAIS commiter les credentials SMTP**

```bash
# .gitignore doit contenir:
.env
.env.local
.env*.local
```

**Vérifier avant commit** :
```bash
# Vérifier qu'aucun secret n'est présent
git diff | grep -i "password\|smtp_password"
```
