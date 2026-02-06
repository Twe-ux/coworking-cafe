# 📧 Récapitulatif des Emails - CoworKing Café

> **Date de création** : 2026-02-06
> **Système d'envoi** : SMTP OVH via noreply@coworkingcafe.fr
> **Configuration** : apps/site/src/lib/email/emailService.ts

---

## 📋 Table des matières

1. [Configuration Emails](#configuration-emails)
2. [Liste complète des emails](#liste-complète-des-emails)
3. [Emails de réservation (11)](#emails-de-réservation)
4. [Autres emails (2)](#autres-emails)
5. [Adresses email recommandées](#adresses-email-recommandées)
6. [Variables d'environnement](#variables-denvironnement)

---

## 🔧 Configuration Emails

### Adresses utilisées

| Adresse | Usage | Configuration |
|---------|-------|---------------|
| **noreply@coworkingcafe.fr** | Envoi de tous les emails | `SMTP_FROM_EMAIL` |
| **strasbourg@coworkingcafe.fr** | Adresse de contact affichée dans les emails | `CONTACT_EMAIL` |
| **impression@coworkingcafe.fr** | Réception emails pour impression | `IMAP_USER` (admin) |

### Serveur SMTP

- **Provider** : OVH
- **Host** : ssl0.ovh.net (implicite dans package)
- **Port** : 587 (TLS) ou 465 (SSL)
- **User** : noreply@coworkingcafe.fr
- **Password** : Configuré dans .env.local

---

## 📧 Liste complète des emails

### Vue d'ensemble

| # | Nom | Trigger | Destinataire | Template | Fonction |
|---|-----|---------|--------------|----------|----------|
| 1️⃣ | Confirmation réservation | Paiement initial réussi | Client | `confirmation.ts` | `sendBookingConfirmation()` |
| 2️⃣ | Réservation validée | Validation admin | Client | `adminValidation.ts` | `sendReservationConfirmed()` |
| 3️⃣ | Rappel 24h | Cron job (24h avant) | Client | `reminder.ts` | `sendBookingReminder()` |
| 4️⃣ | Annulation admin | Admin annule | Client | `adminCancellation.ts` | `sendReservationCancelled()` |
| 5️⃣ | Empreinte bancaire | Hold Stripe autorisé | Client | `depositHold.ts` | `sendDepositHoldConfirmation()` |
| 6️⃣ | Pénalité no-show | Capture empreinte (absent) | Client | `noShowPenalty.ts` | `sendDepositCaptured()` |
| 7️⃣ | Empreinte libérée | Client présent | Client | `depositReleased.ts` | `sendDepositReleased()` |
| 8️⃣ | Carte enregistrée | Enregistrement carte | Client | `cardSaved.ts` | `sendCardSavedConfirmation()` |
| 9️⃣ | Annulation client | Client annule | Client | `clientCancellation.ts` | `sendCancellationConfirmation()` |
| 🔟 | Réservation refusée | Admin refuse | Client | `adminRejection.ts` | `sendReservationRejected()` |
| 1️⃣1️⃣ | Demande reçue | Soumission formulaire | Client | `clientBookingConfirmation.ts` | `sendClientBookingConfirmation()` |
| 📨 | Contact | Formulaire contact | Client + Admin | Inline HTML | `sendContactFormEmail()` |

**Total : 12 types d'emails**

---

## 🎫 Emails de Réservation (11)

### 1️⃣ Confirmation de réservation initiale

**Fichier** : `templates/confirmation.ts`
**Fonction** : `sendBookingConfirmation()`

**Envoyé quand** : Immédiatement après création de la réservation (paiement initial réussi)

**À qui** : Client (email utilisateur)

**Contenu** :
- ✅ Récapitulatif de la réservation (espace, date, horaires, nombre de personnes)
- 💰 Prix total
- 💳 Info empreinte bancaire si applicable (70% du montant)
- 📞 Coordonnées de contact (téléphone, email)

**Données requises** :
```typescript
{
  name: string;              // Nom du client
  spaceName: string;         // Nom de l'espace réservé
  date: string;              // Date de réservation (YYYY-MM-DD)
  startTime: string;         // Heure début (HH:mm)
  endTime: string;           // Heure fin (HH:mm)
  numberOfPeople: number;    // Nombre de personnes
  totalPrice: number;        // Prix total
  depositAmount?: number;    // Montant empreinte (en centimes)
  contactEmail: string;      // Email de contact (strasbourg@)
}
```

**Subject** : `✅ Réservation confirmée - CoworKing Café`

**Couleur** : Vert (#10B981)

---

### 2️⃣ Réservation validée par l'admin

**Fichier** : `templates/adminValidation.ts`
**Fonction** : `sendReservationConfirmed()`

**Envoyé quand** : Après validation manuelle de la réservation par un administrateur

**À qui** : Client

**Contenu** :
- 🎉 Badge "Réservation validée"
- ✅ Récapitulatif complet
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  contactEmail: string;
}
```

**Subject** : `🎉 Réservation validée - CoworKing Café`

**Couleur** : Vert foncé (#059669)

---

### 3️⃣ Rappel 24h avant la réservation

**Fichier** : `templates/reminder.ts`
**Fonction** : `sendBookingReminder()`

**Envoyé quand** : 24 heures avant la date de réservation (cron job automatique)

**À qui** : Client

**Contenu** :
- 🔔 Rappel de la réservation à venir
- 📅 Détails de la réservation
- 📞 Coordonnées si besoin de modifier

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  contactEmail: string;
}
```

**Subject** : `🔔 Rappel : Votre réservation demain - CoworKing Café`

**Couleur** : Orange (#F59E0B)

**Note** : Cet email est envoyé par un cron job via N8N. Voir `/docs/n8n/README.md`

---

### 4️⃣ Réservation annulée par l'admin

**Fichier** : `templates/adminCancellation.ts`
**Fonction** : `sendReservationCancelled()`

**Envoyé quand** : Après annulation de la réservation par un administrateur

**À qui** : Client

**Contenu** :
- ❌ Notification d'annulation
- 📋 Détails de la réservation annulée
- 💰 Info remboursement intégral (5-10 jours ouvrés)
- 📝 Raison de l'annulation (optionnel)
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  reason?: string;           // Raison de l'annulation (optionnel)
  contactEmail: string;
}
```

**Subject** : `❌ Réservation annulée - CoworKing Café`

**Couleur** : Rouge (#EF4444)

---

### 5️⃣ Confirmation d'empreinte bancaire

**Fichier** : `templates/depositHold.ts`
**Fonction** : `sendDepositHoldConfirmation()`

**Envoyé quand** : Après autorisation de l'empreinte bancaire Stripe (hold)

**À qui** : Client

**Contenu** :
- 💳 Confirmation que l'empreinte a été effectuée
- 💰 Montant de l'empreinte (70% du total)
- ℹ️ Info : sera automatiquement annulée lors de la venue
- 📋 Détails de la réservation
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  depositAmount: number;     // Montant empreinte (en centimes)
  contactEmail: string;
}
```

**Subject** : `💳 Empreinte bancaire effectuée - CoworKing Café`

**Couleur** : Bleu (#3B82F6)

---

### 6️⃣ Pénalité no-show (empreinte capturée)

**Fichier** : `templates/noShowPenalty.ts`
**Fonction** : `sendDepositCaptured()`

**Envoyé quand** : Après capture de l'empreinte bancaire (client ne s'est pas présenté)

**À qui** : Client

**Contenu** :
- ⚠️ Notification absence constatée
- 💰 Montant débité (empreinte capturée)
- 📋 Détails de la réservation concernée
- 📝 Référence aux CGV
- 📞 Coordonnées de contact pour réclamation

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  depositAmount: number;     // Montant capturé
  contactEmail: string;
}
```

**Subject** : `⚠️ Absence non signalée - Frais appliqués - CoworKing Café`

**Couleur** : Rouge (#EF4444)

---

### 7️⃣ Empreinte bancaire libérée

**Fichier** : `templates/depositReleased.ts`
**Fonction** : `sendDepositReleased()`

**Envoyé quand** : Après libération de l'empreinte bancaire (client s'est présenté)

**À qui** : Client

**Contenu** :
- ✅ Confirmation annulation de l'empreinte
- 💳 Aucun montant débité
- 📋 Détails de la réservation
- 🙏 Remerciements pour la venue
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  depositAmount: number;     // Montant qui était bloqué
  contactEmail: string;
}
```

**Subject** : `✅ Empreinte bancaire annulée - CoworKing Café`

**Couleur** : Vert (#10B981)

---

### 8️⃣ Confirmation d'enregistrement de carte

**Fichier** : `templates/cardSaved.ts`
**Fonction** : `sendCardSavedConfirmation()`

**Envoyé quand** : Après enregistrement d'une carte bancaire pour paiement ultérieur

**À qui** : Client

**Contenu** :
- 💳 Confirmation enregistrement carte
- 🔢 4 derniers chiffres de la carte
- 📋 Détails de la réservation
- ℹ️ Paiement automatique le jour de la venue
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  last4: string;             // 4 derniers chiffres de la carte
  contactEmail: string;
}
```

**Subject** : `💳 Carte bancaire enregistrée - CoworKing Café`

**Couleur** : Bleu (#3B82F6)

---

### 9️⃣ Annulation par le client (avec frais)

**Fichier** : `templates/clientCancellation.ts`
**Fonction** : `sendCancellationConfirmation()`

**Envoyé quand** : Après annulation de la réservation par le client lui-même

**À qui** : Client

**Contenu** :
- ❌ Confirmation d'annulation
- 📋 Détails de la réservation annulée
- 💰 Prix initial
- 📉 Frais d'annulation appliqués
- 💵 Montant remboursé
- ⏳ Délai de remboursement (5-10 jours ouvrés)
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  cancellationFees: number;  // Frais d'annulation
  refundAmount: number;      // Montant remboursé
  contactEmail: string;
}
```

**Subject** : `❌ Annulation confirmée - CoworKing Café`

**Couleur** : Rouge (#EF4444)

---

### 🔟 Réservation refusée par l'admin

**Fichier** : `templates/adminRejection.ts`
**Fonction** : `sendReservationRejected()`

**Envoyé quand** : Après refus de la demande de réservation par un administrateur

**À qui** : Client

**Contenu** :
- ❌ Notification de refus
- 📋 Détails de la demande
- 📝 Raison du refus (optionnel)
- 💰 Info remboursement intégral si paiement effectué
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  reason?: string;           // Raison du refus (optionnel)
  contactEmail: string;
}
```

**Subject** : `❌ Réservation refusée - CoworKing Café`

**Couleur** : Rouge (#EF4444)

---

### 1️⃣1️⃣ Confirmation initiale de booking

**Fichier** : `templates/clientBookingConfirmation.ts`
**Fonction** : `sendClientBookingConfirmation()`

**Envoyé quand** : Immédiatement après soumission du formulaire de réservation (avant validation)

**À qui** : Client

**Contenu** :
- 📝 Accusé de réception de la demande
- 📋 Récapitulatif de la demande
- ⏳ En attente de validation
- ℹ️ Confirmation par email une fois validée
- 📞 Coordonnées de contact

**Données requises** :
```typescript
{
  name: string;
  spaceName: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  contactEmail: string;
}
```

**Subject** : `📝 Demande de réservation reçue - CoworKing Café`

**Couleur** : Orange (#F59E0B)

---

## 📨 Autres Emails (1)

### 📧 Formulaire de contact

**Fichier** : Inline HTML dans `emailService.ts`
**Fonction** : `sendContactFormEmail()`

**Envoyé quand** : Après soumission du formulaire de contact sur le site

**À qui** :
- Client (confirmation)
- Admin (notification - à implémenter)

**Contenu** :
- ✅ Accusé de réception du message
- 📨 Sujet du message
- 📝 Contenu du message (citation)
- ⏳ Réponse dans les plus brefs délais
- 📞 Coordonnées pour questions urgentes

**Données requises** :
```typescript
{
  name: string;              // Nom de l'expéditeur
  email: string;             // Email de l'expéditeur
  subject: string;           // Sujet du message
  message: string;           // Contenu du message
}
```

**Subject** : `📨 Message reçu - [sujet]`

**Note** : Email simple sans template HTML complexe

---

## 📬 Adresses Email Recommandées

### Adresses actuelles (OK ✅)

| Adresse | Usage | Statut |
|---------|-------|--------|
| noreply@coworkingcafe.fr | Envoi automatique emails | ✅ Configuré |
| strasbourg@coworkingcafe.fr | Contact affiché dans emails | ✅ Configuré |
| impression@coworkingcafe.fr | Réception docs à imprimer | ✅ Configuré (admin) |

### Adresses recommandées (à créer) 💡

| Adresse | Usage | Priorité | Pourquoi |
|---------|-------|----------|----------|
| **reservations@coworkingcafe.fr** | Gestion réservations | 🔴 Haute | Séparer du contact général |
| **contact@coworkingcafe.fr** | Contact général | 🟠 Moyenne | Alternative à strasbourg@ |
| **admin@coworkingcafe.fr** | Notifications admin | 🟡 Basse | Actuellement inline |
| **support@coworkingcafe.fr** | Support client | 🟡 Basse | Si volume augmente |

### Actions recommandées

#### 1. Créer reservations@coworkingcafe.fr (Priorité Haute)

**Pourquoi** :
- Séparer les demandes de réservation des autres contacts
- Permettre une gestion dédiée par l'équipe
- Rediriger vers cette adresse depuis les emails

**Actions** :
```bash
# 1. Créer la boîte sur OVH
# 2. Ajouter dans .env.local
RESERVATIONS_EMAIL=reservations@coworkingcafe.fr

# 3. Utiliser dans les emails
"Pour toute question sur votre réservation : reservations@coworkingcafe.fr"
```

#### 2. Migrer vers contact@coworkingcafe.fr (Priorité Moyenne)

**Pourquoi** :
- Plus générique que strasbourg@ (si expansion multi-villes)
- Nom plus explicite
- Facilite redirection interne

**Migration** :
```bash
# 1. Créer contact@coworkingcafe.fr
# 2. Mettre à jour .env.local
CONTACT_EMAIL=contact@coworkingcafe.fr

# 3. Garder strasbourg@ comme alias pendant 6 mois
```

#### 3. Notifications admin (Priorité Basse)

**Actuellement** : Notifications admin pas implémentées

**Recommandation** : Créer admin@coworkingcafe.fr pour :
- Nouvelles réservations
- Annulations
- Formulaires de contact
- Alertes système

**Implémentation** :
```typescript
// Dans emailService.ts
export async function sendAdminNotification(
  type: 'new-booking' | 'cancellation' | 'contact',
  data: NotificationData
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@coworkingcafe.fr';

  // Envoyer email à l'admin
  await smtpSendEmail({
    to: adminEmail,
    subject: `[Admin] ${type}: ${data.title}`,
    html: generateAdminNotificationHTML(type, data),
  });
}
```

---

## 🔐 Variables d'Environnement

### Fichiers concernés

- **packages/email/.env.local** - Package email partagé
- **apps/admin/.env.local** - Dashboard admin
- **apps/site/.env.local** - Site public + Dashboard client

### Variables requises

```bash
# SMTP Configuration (OVH)
SMTP_PROVIDER=ovh
SMTP_USER=noreply@coworkingcafe.fr
SMTP_PASSWORD=YOUR_SMTP_PASSWORD_HERE
SMTP_FROM_NAME=CoworKing Café by Anticafé
SMTP_FROM_EMAIL=noreply@coworkingcafe.fr

# Contact Email (affiché dans les emails)
CONTACT_EMAIL=strasbourg@coworkingcafe.fr
CONTACT_PHONE=09 87 33 45 19

# IMAP (réception emails - uniquement admin)
IMAP_HOST=ssl0.ovh.net
IMAP_PORT=993
IMAP_USER=impression@coworkingcafe.fr
IMAP_PASSWORD=YOUR_IMAP_PASSWORD_HERE
```

### Variables optionnelles (recommandées)

```bash
# Adresses supplémentaires
RESERVATIONS_EMAIL=reservations@coworkingcafe.fr
ADMIN_EMAIL=admin@coworkingcafe.fr
SUPPORT_EMAIL=support@coworkingcafe.fr
```

---

## 📊 Statistiques & Métriques

### Fréquence d'envoi estimée

| Email | Fréquence | Volume/mois (estimé) |
|-------|-----------|---------------------|
| Confirmation réservation | À chaque booking | ~100-200 |
| Réservation validée | Après validation | ~100-200 |
| Rappel 24h | Cron quotidien | ~3-5/jour = ~100/mois |
| Annulation admin | Rare | ~5-10 |
| Empreinte bancaire | À chaque booking avec dépôt | ~50-100 |
| Pénalité no-show | Rare | ~2-5 |
| Empreinte libérée | À chaque venue | ~100-200 |
| Carte enregistrée | Occasionnel | ~20-30 |
| Annulation client | Occasionnel | ~10-20 |
| Réservation refusée | Rare | ~2-5 |
| Demande reçue | À chaque soumission | ~100-200 |
| Contact | Variable | ~20-50 |

**Total emails/mois** : ~700-1000 emails

**Coût SMTP OVH** : Inclus dans hébergement (pas de coût additionnel)

---

## 🧪 Tests

### Tester l'envoi SMTP

```bash
# Dans packages/email
pnpm test-smtp

# Avec email destinataire (dans .env.local)
TEST_EMAIL=your-email@example.com pnpm test-smtp
```

### Tester tous les templates

```typescript
// Créer un script de test
// apps/site/src/scripts/test-email-templates.ts

import {
  sendBookingConfirmation,
  sendReservationConfirmed,
  // ... autres fonctions
} from '@/lib/email/emailService';

const testData = {
  name: 'Jean Dupont',
  spaceName: 'Open Space',
  date: '2026-02-15',
  startTime: '09:00',
  endTime: '17:00',
  numberOfPeople: 5,
  totalPrice: 125.00,
  depositAmount: 8750, // 70% en centimes
};

async function testAllEmails() {
  const testEmail = 'test@example.com';

  console.log('📧 Test 1: Confirmation réservation');
  await sendBookingConfirmation(testEmail, testData);

  console.log('📧 Test 2: Réservation validée');
  await sendReservationConfirmed(testEmail, testData);

  // ... tester tous les emails
}

testAllEmails();
```

---

## 📝 Notes de Migration

### Changements effectués (2026-02-06)

1. ✅ Remplacement de Resend par SMTP OVH
2. ✅ Mise à jour de tous les templates avec `contactEmail` paramètre
3. ✅ Sécurisation de strasbourg@coworkingcafe.fr via variable d'environnement
4. ✅ Configuration de noreply@coworkingcafe.fr comme expéditeur
5. ✅ Mise à jour de tous les .env.local (packages/email, apps/admin, apps/site)

### Ancien système (Resend)

```typescript
// ❌ ANCIEN CODE - NE PLUS UTILISER
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'CoworKing Café <onboarding@resend.dev>',
  to: userEmail,
  subject: '...',
  html: '...',
});
```

### Nouveau système (SMTP OVH)

```typescript
// ✅ NOUVEAU CODE
import { sendEmail } from '@coworking-cafe/email';

await sendEmail({
  to: userEmail,
  subject: '...',
  html: '...',
  text: '...',  // Optionnel mais recommandé
});
```

---

## 🚀 Prochaines Étapes

### Court terme (1-2 semaines)

- [ ] Tester tous les emails en environnement de développement
- [ ] Créer reservations@coworkingcafe.fr sur OVH
- [ ] Mettre à jour les templates avec la nouvelle adresse
- [ ] Implémenter les notifications admin (email admin@)

### Moyen terme (1 mois)

- [ ] Migrer vers contact@coworkingcafe.fr (remplace strasbourg@)
- [ ] Ajouter logs des emails envoyés (base de données)
- [ ] Créer dashboard admin pour visualiser les emails envoyés
- [ ] Implémenter retry mechanism pour les emails échoués

### Long terme (3 mois)

- [ ] Ajouter templates d'emails pour newsletter
- [ ] Système de templates personnalisables (admin)
- [ ] A/B testing des emails
- [ ] Analytics d'ouverture des emails

---

**Fin du document**

_Dernière mise à jour : 2026-02-06_
_Auteur : Claude (Assistant)_
_Version : 1.0 - Migration SMTP OVH complète_
