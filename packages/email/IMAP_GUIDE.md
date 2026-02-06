# 📥 Guide IMAP - Recevoir des Emails

Guide pour lire les emails reçus dans votre boîte OVH.

---

## 🎯 Cas d'Usage

### Quand utiliser IMAP ?

✅ **Cas d'usage valides** :
- Auto-répondeur (lire email → envoyer réponse)
- Monitoring emails (alertes si email reçu)
- Traitement automatique (parser réservations par email)
- Synchronisation avec CRM
- Statistiques emails reçus

❌ **PAS nécessaire pour** :
- Consulter emails manuellement → Utiliser **Webmail OVH**
- Répondre aux clients → Utiliser **Webmail OVH**
- Formulaire de contact → Les emails arrivent déjà dans la boîte

---

## 🌐 Option 1 : Webmail OVH (Recommandé) ⭐

**Pour consulter/répondre manuellement**

### Accès
```
URL: https://mail.ovh.net/
Email: noreply@coworkingcafe.fr
Mot de passe: [ton mot de passe OVH]
```

### Fonctionnalités
- ✅ Lire tous les emails reçus
- ✅ Répondre aux clients
- ✅ Organiser en dossiers
- ✅ Rechercher
- ✅ Calendrier intégré
- ✅ Contacts

**C'est suffisant pour 90% des cas !**

---

## 💻 Option 2 : IMAP dans le Code (Automatisation)

**Pour traiter automatiquement les emails reçus**

### Configuration IMAP OVH

```bash
# .env.local
# SMTP (envoi)
SMTP_PROVIDER=ovh
SMTP_USER=noreply@coworkingcafe.fr
SMTP_PASSWORD=your-password

# IMAP (réception) - Souvent les mêmes credentials
IMAP_HOST=ssl0.ovh.net
IMAP_PORT=993
IMAP_USER=noreply@coworkingcafe.fr
IMAP_PASSWORD=your-password
```

### Installation

```bash
cd packages/email
pnpm install
```

Les dépendances IMAP sont déjà ajoutées :
- `imap` : Client IMAP
- `mailparser` : Parser les emails

---

## 📖 Exemples d'Utilisation

### 1. Lire les emails non lus

```typescript
import { fetchUnreadEmails } from '@coworking-cafe/email/providers/imap';

const unreadEmails = await fetchUnreadEmails();

console.log(`${unreadEmails.length} nouveaux emails`);

unreadEmails.forEach(email => {
  console.log('De:', email.from?.text);
  console.log('Sujet:', email.subject);
  console.log('Message:', email.text);
});
```

### 2. Statistiques boîte de réception

```typescript
import { getInboxStats } from '@coworking-cafe/email/providers/imap';

const stats = await getInboxStats();
console.log(`Total: ${stats.total} emails`);
console.log(`Non lus: ${stats.unread} emails`);
```

### 3. Auto-répondeur

```typescript
import { fetchUnreadEmails, markAsRead } from '@coworking-cafe/email/providers/imap';
import { sendEmail } from '@coworking-cafe/email';

// Lire emails non lus
const emails = await fetchUnreadEmails();

for (const email of emails) {
  // Envoyer réponse automatique
  await sendEmail({
    to: email.from?.value[0].address || '',
    subject: `Re: ${email.subject}`,
    html: `
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre message. Nous vous répondrons dans les 24h.</p>
      <p>L'équipe CoworKing Café</p>
    `,
  });

  // Marquer comme lu
  if (email.uid) {
    await markAsRead(email.uid);
  }
}
```

### 4. API Route pour consulter emails

```typescript
// apps/site/src/app/api/admin/emails/route.ts
import { NextResponse } from 'next/server';
import { getInboxStats, fetchUnreadEmails } from '@coworking-cafe/email/providers/imap';

export async function GET() {
  try {
    const stats = await getInboxStats();
    const unread = await fetchUnreadEmails();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        unread: unread.map(email => ({
          from: email.from?.text,
          subject: email.subject,
          date: email.date,
          text: email.text?.substring(0, 200), // Preview
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Tester IMAP

### Test simple

```typescript
// packages/email/src/test-imap.ts
import { getInboxStats, fetchUnreadEmails } from './providers/imap';

async function testImap() {
  console.log('📥 Testing IMAP connection...\n');

  // 1. Test connexion
  const stats = await getInboxStats();
  console.log(`✅ Connected!`);
  console.log(`Total emails: ${stats.total}`);
  console.log(`Unread: ${stats.unread}\n`);

  // 2. Lire emails non lus
  if (stats.unread > 0) {
    console.log('Reading unread emails...\n');
    const emails = await fetchUnreadEmails();

    emails.forEach((email, i) => {
      console.log(`Email ${i + 1}:`);
      console.log(`From: ${email.from?.text}`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Date: ${email.date}`);
      console.log(`---`);
    });
  }
}

testImap().catch(console.error);
```

```bash
# Exécuter test
pnpm --filter @coworking-cafe/email tsx src/test-imap.ts
```

---

## 📊 SMTP vs IMAP vs Webmail

| Besoin | Solution | Outil |
|--------|----------|-------|
| **Envoyer emails** | SMTP | Code |
| **Lire manuellement** | Webmail | Navigateur |
| **Auto-traitement** | IMAP | Code |
| **Répondre clients** | Webmail | Navigateur |
| **Monitoring** | IMAP | Code + Cron |

---

## ⚠️ Important

### Pour le Formulaire de Contact

**Tu N'AS PAS besoin d'IMAP** !

Le formulaire de contact **envoie directement** l'email à l'admin :

```typescript
// Formulaire contact → Email admin
await sendContactFormEmail('admin@coworkingcafe.fr', {
  name: 'Client',
  subject: 'Question',
  message: '...',
  replyTo: 'client@example.com'
});
```

**L'email arrive dans** : `admin@coworkingcafe.fr`
**Tu le consultes via** : Webmail OVH

**IMAP serait utile seulement si** :
- Auto-répondeur (réponse automatique)
- Intégration CRM (synchro emails)
- Dashboard admin (afficher emails reçus)

---

## 🎯 Recommandation

### Pour un Coworking Café Standard

**✅ Utilise Webmail OVH** (https://mail.ovh.net/)
- Simple
- Complet
- Aucun code nécessaire
- Tu reçois déjà les emails du formulaire contact

**⚠️ IMAP uniquement si** :
- Auto-répondeur nécessaire
- Traitement automatique emails
- Dashboard admin avec emails

**Dans 90% des cas, Webmail suffit !**

---

## 🔧 Configuration Emails OVH

### Créer plusieurs adresses

Pour séparer les usages :

```
noreply@coworkingcafe.fr    → Envoi (SMTP)
contact@coworkingcafe.fr    → Formulaire contact
reservations@coworkingcafe.fr → Réservations
admin@coworkingcafe.fr      → Admin général
```

**Manager OVH** → Emails → Créer adresse

### Redirection

Rediriger tous les emails vers une seule boîte :

```
contact@ → admin@
reservations@ → admin@
```

Tu consultes tout dans `admin@coworkingcafe.fr` via Webmail.

---

## 📚 Ressources

- [Webmail OVH](https://mail.ovh.net/)
- [Configuration IMAP OVH](https://docs.ovh.com/fr/emails/generalites-sur-les-emails-mutualises/)
- [Manager OVH](https://www.ovh.com/manager/web/)
