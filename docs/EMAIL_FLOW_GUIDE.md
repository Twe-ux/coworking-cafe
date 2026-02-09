# Guide Complet : Flux des Emails de Réservation

> **Dernière mise à jour** : 2026-02-08
> **Contexte** : CoworKing Café utilise un système d'empreinte bancaire Stripe pour sécuriser les réservations

---

## 📊 Vue d'Ensemble du Système

### Deux Types de Réservations

| Type | Processus | Empreinte Bancaire |
|------|-----------|-------------------|
| **Réservation Client** | Client réserve → Admin valide → Présence vérifiée | ✅ OUI (Stripe Hold) |
| **Réservation Admin** | Admin crée → Pas de validation → Usage interne | ❌ NON |

---

## 🔄 Flux Complet : Réservation Client avec Empreinte

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1 : RÉSERVATION INITIALE                                  │
└─────────────────────────────────────────────────────────────────┘

1. Client remplit formulaire de réservation
   └─> POST /api/booking/create
       └─> Status: "pending"

2. Email envoyé : Confirmation initiale
   └─> Template: clientBookingConfirmation.ts (BLEU)
   └─> Fonction: generateClientBookingConfirmationEmail()
   └─> Message: "Votre réservation est en attente de validation"

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2 : VALIDATION ADMIN                                      │
└─────────────────────────────────────────────────────────────────┘

3a. Admin ACCEPTE la réservation
    └─> Status: "pending" → "confirmed"
    └─> Email: adminValidation.ts (VERT)
    └─> Fonction: generateValidatedEmail()
    └─> Message: "Votre réservation est confirmée ✅"

3b. Admin REFUSE la réservation
    └─> Status: "pending" → "rejected"
    └─> Email: adminRejection.ts (ROUGE)
    └─> Fonction: generateReservationRejectedEmail()
    └─> Message: "Votre réservation a été refusée ❌"
    └─> Raison du refus incluse

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3 : EMPREINTE BANCAIRE (7 jours avant)                   │
└─────────────────────────────────────────────────────────────────┘

4. Cron Job : /api/cron/create-holds (quotidien à 10h)
   └─> Recherche réservations dans 7 jours (status: "confirmed")
   └─> Crée Stripe Setup Intent (empreinte bancaire)
   └─> Met à jour booking.stripeSetupIntentId

5. Webhook Stripe : setup_intent.succeeded
   └─> POST /api/payments/webhook
   └─> Email: cardSaved.ts OU depositHold.ts (BLEU/PURPLE)
   └─> Fonction: generateCardSavedEmail() ou generateDepositHoldEmail()
   └─> Message: "Carte enregistrée, empreinte de X€ effectuée"
   └─> Précision: "Si présent → libérée, si absent → encaissée"

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4 : RAPPEL (1 jour avant)                                │
└─────────────────────────────────────────────────────────────────┘

6. Cron Job : /api/cron/send-reminders (quotidien à 10h)
   └─> Recherche réservations demain (status: "confirmed")
   └─> Email: reminder.ts (YELLOW)
   └─> Fonction: generateReminderEmail()
   └─> Message: "🔔 Rappel : votre réservation est demain"

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5A : CLIENT PRÉSENT ✅                                     │
└─────────────────────────────────────────────────────────────────┘

7a. Admin marque comme présent dans dashboard
    └─> Status: "confirmed" → "completed"
    └─> Stripe : Cancel Setup Intent (libère empreinte)
    └─> Email: depositReleased.ts (VERT)
    └─> Fonction: generateDepositReleasedEmail()
    └─> Message: "✅ Empreinte libérée, merci d'être venu"
    └─> Aucun prélèvement effectué

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5B : CLIENT ABSENT ❌ (No-Show)                           │
└─────────────────────────────────────────────────────────────────┘

7b. Cron Job : /api/cron/check-attendance (quotidien à 10h)
    └─> Recherche réservations passées non marquées présentes
    └─> Status: "confirmed" → "no-show"
    └─> Stripe : Capture Setup Intent (encaisse empreinte)
    └─> Email: noShowPenalty.ts (ROUGE)
    └─> Fonction: generateDepositCapturedEmail()
    └─> Message: "⚠️ Absence constatée, empreinte de X€ encaissée"

┌─────────────────────────────────────────────────────────────────┐
│ CAS PARTICULIERS : ANNULATIONS                                  │
└─────────────────────────────────────────────────────────────────┘

8a. Client annule SA réservation
    └─> Avant validation admin : Annulation gratuite
    └─> Après validation : Frais d'annulation possibles
    └─> Email: clientCancelBooking.ts (ROUGE)
    └─> Fonction: generateClientCancelBookingEmail()
    └─> Message: "Réservation annulée, frais: X€ (si applicable)"

8b. Admin annule réservation CLIENT
    └─> Status: → "cancelled"
    └─> Remboursement intégral si paiement effectué
    └─> Email: adminCancelClientBooking.ts (ROUGE)
    └─> Fonction: generateAdminCancelClientBookingEmail()
    └─> Message: "Annulation administrative, remboursement sous 5-10j"

8c. Admin annule réservation ADMIN (usage interne)
    └─> Status: → "cancelled"
    └─> Pas d'empreinte bancaire (résa interne)
    └─> Email: adminCancelAdminBooking.ts (ROUGE)
    └─> Fonction: generateAdminCancelAdminBookingEmail()
    └─> Message: "Réservation annulée par notre équipe"
```

---

## 📧 Catalogue des Templates Email

### Actions Client

| Template | Acteur | Déclencheur | Couleur | Usage |
|----------|--------|-------------|---------|-------|
| `clientBookingConfirmation.ts` | Client | Crée réservation | BLEU | Confirmation initiale |
| `clientCancelBooking.ts` | Client | Annule réservation | ROUGE | Annulation + frais éventuels |

### Actions Admin

| Template | Acteur | Déclencheur | Couleur | Usage |
|----------|--------|-------------|---------|-------|
| `adminValidation.ts` | Admin | Accepte résa client | VERT | Validation réservation |
| `adminRejection.ts` | Admin | Refuse résa client | ROUGE | Refus + raison |
| `adminCancelClientBooking.ts` | Admin | Annule résa client | ROUGE | Annulation admin + remboursement |
| `adminCancelAdminBooking.ts` | Admin | Annule résa admin | ROUGE | Annulation interne |

### Système de Paiement (Stripe)

| Template | Déclencheur | Couleur | Usage |
|----------|-------------|---------|-------|
| `cardSaved.ts` | Webhook Stripe | PURPLE | Carte enregistrée (paiement différé) |
| `depositHold.ts` | Cron create-holds | BLEU | Empreinte bancaire effectuée |
| `depositReleased.ts` | Admin marque présent | VERT | Empreinte libérée (client présent) |
| `noShowPenalty.ts` | Cron check-attendance | ROUGE | Empreinte encaissée (no-show) |

### Autres

| Template | Déclencheur | Couleur | Usage |
|----------|-------------|---------|-------|
| `reminder.ts` | Cron send-reminders | YELLOW | Rappel 1 jour avant |
| `confirmation.ts` | ? | VERT | ? (à vérifier) |

---

## 🤔 Templates à Clarifier

### ❓ confirmation.ts vs clientBookingConfirmation.ts

**Question** : Quelle est la différence ?
- `clientBookingConfirmation.ts` : Email initial "réservation en attente"
- `confirmation.ts` : Dupliqué ? Ou pour autre usage ?

**Action recommandée** : Vérifier l'utilisation et fusionner si dupliqué

### ❓ cardSaved.ts vs depositHold.ts

**Question** : Les deux semblent similaires (carte enregistrée)
- `cardSaved.ts` : "Paiement programmé 7 jours avant"
- `depositHold.ts` : "Empreinte bancaire effectuée"

**Différence possible** :
- `cardSaved` → Setup Intent (capture future)
- `depositHold` → Authorization Hold (empreinte immédiate)

**Action recommandée** : Clarifier dans le code lequel utiliser

---

## 🔧 Cron Jobs Stripe

### /api/cron/create-holds
**Fréquence** : Quotidien à 10:00 UTC
**Action** :
1. Trouve réservations dans 7 jours (status: "confirmed")
2. Crée Stripe Setup Intent (empreinte)
3. Envoie email `depositHold.ts` ou `cardSaved.ts`

### /api/cron/check-attendance
**Fréquence** : Quotidien à 10:00 UTC
**Action** :
1. Trouve réservations passées non marquées présentes
2. Marque comme "no-show"
3. Capture Setup Intent (encaisse empreinte)
4. Envoie email `noShowPenalty.ts`

### /api/cron/send-reminders
**Fréquence** : Quotidien à 10:00 UTC
**Action** :
1. Trouve réservations demain (status: "confirmed")
2. Envoie email `reminder.ts`

---

## 💡 Recommandations

### 1. Fusionner cardSaved.ts et depositHold.ts ?
Si les deux font la même chose, garder un seul template.

### 2. Vérifier confirmation.ts
Semble être un doublon de clientBookingConfirmation.ts

### 3. Ajouter envoi de depositReleased.ts
Actuellement, pas de code qui envoie cet email quand l'admin marque "présent"

### 4. Documenter différence cardSaved vs depositHold
Clarifier dans le code quand utiliser chacun

---

## 📝 Checklist Implémentation

- [x] clientBookingConfirmation.ts - Utilisé dans POST /api/booking/create
- [x] adminValidation.ts - Utilisé dans admin validation
- [x] adminRejection.ts - Utilisé dans admin rejection
- [x] clientCancelBooking.ts - Utilisé dans client cancellation
- [x] adminCancelClientBooking.ts - Utilisé dans admin cancellation
- [x] cardSaved.ts - Utilisé dans Stripe webhook
- [x] depositHold.ts - Utilisé dans Cron create-holds
- [x] noShowPenalty.ts - Utilisé dans Cron check-attendance
- [x] reminder.ts - Utilisé dans Cron send-reminders
- [ ] depositReleased.ts - **PAS UTILISÉ** (à implémenter)
- [ ] confirmation.ts - **À VÉRIFIER** (doublon ?)

---

**Prochaine étape** : Auditer `confirmation.ts` et implémenter envoi de `depositReleased.ts`
