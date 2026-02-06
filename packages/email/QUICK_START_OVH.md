# 🚀 Démarrage Rapide - SMTP OVH

Guide ultra-rapide pour configurer l'envoi d'emails avec votre hébergement OVH.

---

## ✅ Prérequis

- [ ] Hébergement OVH actif
- [ ] Nom de domaine configuré (coworkingcafe.fr)
- [ ] Accès au Manager OVH

---

## 📧 Étape 1: Créer l'adresse email (5 min)

### 1. Aller sur Manager OVH
👉 https://www.ovh.com/manager/web/

### 2. Naviguer vers Emails
```
Menu → Emails → coworkingcafe.fr → Créer une adresse
```

### 3. Créer `noreply@coworkingcafe.fr`
```yaml
Adresse email: noreply@coworkingcafe.fr
Mot de passe: [Choisir un mot de passe fort]
Taille: 5 GB (par défaut OK)
```

### 4. Valider
✅ L'adresse est créée instantanément

### 5. (Optionnel) Tester l'email
- Aller sur https://mail.ovh.net/
- Se connecter avec `noreply@coworkingcafe.fr`
- Si connexion OK → credentials valides ✅

---

## ⚙️ Étape 2: Configurer le projet (2 min)

### 1. Copier le fichier d'exemple

```bash
cd /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe

# Pour apps/site
cp packages/email/.env.example apps/site/.env.local

# Pour apps/admin (si besoin)
cp packages/email/.env.example apps/admin/.env.local
```

### 2. Éditer `.env.local`

```bash
# apps/site/.env.local
SMTP_PROVIDER=ovh
SMTP_USER=noreply@coworkingcafe.fr
SMTP_PASSWORD=votre-mot-de-passe-ovh
SMTP_FROM_NAME=CoworKing Café by Anticafé
SMTP_FROM_EMAIL=noreply@coworkingcafe.fr
```

**⚠️ IMPORTANT** :
- `SMTP_USER` = **email complet** (`noreply@coworkingcafe.fr`)
- `SMTP_PASSWORD` = **mot de passe de l'email** (celui créé à l'étape 1)

---

## 🧪 Étape 3: Tester (1 min)

### 1. Installer les dépendances (si pas fait)

```bash
pnpm install
```

### 2. Tester la connexion SMTP

```bash
cd /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe
pnpm --filter @coworking-cafe/email test-smtp
```

**Résultat attendu** :
```
✅ SMTP connection successful!
```

### 3. Envoyer un email de test (optionnel)

```bash
TEST_EMAIL=votre-email@example.com pnpm --filter @coworking-cafe/email test-smtp
```

**Vérifier** : Email reçu dans votre boîte ✅

---

## 💻 Étape 4: Utiliser dans le code (1 min)

### Dans une API route

```typescript
// apps/site/src/app/api/booking/route.ts
import { sendBookingConfirmation } from '@coworking-cafe/email';

export async function POST(request: Request) {
  // ... votre logique de réservation

  // Envoyer confirmation
  await sendBookingConfirmation('client@example.com', {
    name: 'Jean Dupont',
    spaceName: 'Salle de Réunion A',
    date: '2026-02-10',
    time: '14:00 - 16:00',
    price: 50.00,
    bookingId: 'BK-123456'
  });

  return Response.json({ success: true });
}
```

### Email simple

```typescript
import { sendEmail } from '@coworking-cafe/email';

await sendEmail({
  to: 'client@example.com',
  subject: 'Bienvenue au CoworKing Café',
  html: '<h1>Bienvenue !</h1><p>Merci de votre inscription</p>',
  text: 'Bienvenue !\n\nMerci de votre inscription'
});
```

---

## 📊 Limites OVH

| Métrique | Limite | Note |
|----------|--------|------|
| **Emails/heure** | 200 | Anti-spam |
| **Emails/jour** | ~4,800 | Théorique |
| **Taille max** | 20 MB | Par email |
| **Destinataires** | Illimités | |

**Pour un coworking café** : Largement suffisant ! 🎉

---

## 🔧 Troubleshooting Rapide

### ❌ Erreur "Authentication failed"

**Cause** : Mauvais identifiants

**Solutions** :
1. Vérifier `SMTP_USER` = email complet (`noreply@coworkingcafe.fr`)
2. Vérifier mot de passe correct
3. Tester connexion sur https://mail.ovh.net/
4. Si OK webmail → SMTP devrait fonctionner

---

### ❌ Erreur "Connection timeout"

**Cause** : Port ou configuration réseau

**Solutions** :
1. Vérifier `.env.local` contient bien :
   ```bash
   SMTP_PROVIDER=ovh
   SMTP_USER=noreply@coworkingcafe.fr
   SMTP_PASSWORD=...
   ```
2. Ne PAS mettre `SMTP_HOST` ni `SMTP_PORT` (automatique avec `ovh`)
3. Vérifier firewall/proxy

---

### ❌ Emails en spam

**Solutions** :
1. **Vérifier SPF** : Normalement déjà configuré par OVH
   ```
   v=spf1 include:mx.ovh.com ~all
   ```

2. **Activer DKIM** (Manager OVH → Emails → Configuration)

3. **Bonnes pratiques** :
   - Toujours inclure version texte
   - Éviter mots spam ("gratuit", "cliquez ici")
   - Inclure lien désinscription
   - Ne pas envoyer trop vite (rate limit)

---

## 📈 Rate Limiting Recommandé

Pour éviter le blocage anti-spam OVH :

```typescript
// Envoyer max 50 emails à la fois, attendre 30s entre lots
import pLimit from 'p-limit';

const limit = pLimit(10); // 10 emails en parallèle max
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function sendBulkEmails(emails: string[]) {
  const chunks = [];
  for (let i = 0; i < emails.length; i += 50) {
    chunks.push(emails.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(email => limit(() => sendEmail({ to: email, ... })))
    );

    // Attendre 30s entre chaque lot
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await delay(30000);
    }
  }
}
```

---

## ✅ Checklist Finale

- [ ] Email `noreply@coworkingcafe.fr` créé sur OVH
- [ ] `.env.local` configuré avec credentials
- [ ] Test SMTP réussi (`pnpm test-smtp`)
- [ ] Email de test reçu
- [ ] Code mis à jour avec `import { sendEmail } from '@coworking-cafe/email'`

---

## 🎉 C'est prêt !

Vous pouvez maintenant envoyer jusqu'à **200 emails/heure** gratuitement avec votre hébergement OVH !

**Avantages** :
- ✅ Inclus dans votre hébergement (déjà payé)
- ✅ Emails professionnels @coworkingcafe.fr
- ✅ Bonne délivrabilité (SPF/DKIM OVH)
- ✅ Support OVH disponible

---

## 📚 Besoin d'aide ?

- **Documentation complète** : `/packages/email/README.md`
- **Config OVH détaillée** : `/packages/email/src/providers/ovh.md`
- **Support OVH** : https://www.ovh.com/fr/support/
