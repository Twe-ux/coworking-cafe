# Stripe Webhook Handler

## Vue d'ensemble

Ce endpoint gère les événements webhook de Stripe pour le système de réservation.

## Configuration

### Variables d'environnement requises

```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Configuration Stripe Dashboard

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer sur "Add endpoint"
3. URL de l'endpoint: `https://votre-domaine.com/api/stripe/webhook`
4. Sélectionner les événements:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copier le "Signing secret" et l'ajouter dans `.env` comme `STRIPE_WEBHOOK_SECRET`

## Événements gérés

### payment_intent.succeeded

Déclenché quand un paiement réussit.

**Action:**
- Met à jour le booking avec `status = "confirmed"`
- TODO: Envoie un email de confirmation au client

**Metadata requis:**
- `reservationId`: ID du booking dans MongoDB

### payment_intent.payment_failed

Déclenché quand un paiement échoue.

**Action:**
- Met à jour le booking avec `status = "cancelled"`
- Enregistre la date d'annulation (`cancelledAt`)
- Ajoute la raison: "Payment failed"
- TODO: Envoie un email d'échec de paiement

**Metadata requis:**
- `reservationId`: ID du booking dans MongoDB

### charge.refunded

Déclenché quand un paiement est remboursé.

**Action:**
- Met à jour le booking avec `status = "cancelled"`
- Enregistre la date d'annulation (`cancelledAt`)
- Ajoute la raison: "Payment refunded"
- TODO: Envoie un email de confirmation de remboursement

**Note:** Cet événement nécessite de récupérer le payment_intent associé pour obtenir les metadata.

## Test en local

### Avec Stripe CLI

1. Installer Stripe CLI: https://stripe.com/docs/stripe-cli
2. Se connecter:
   ```bash
   stripe login
   ```
3. Forwarder les webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copier le webhook secret affiché et l'ajouter dans `.env.local`
5. Déclencher un événement de test:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### Tester manuellement

```bash
# Simuler un payment_intent.succeeded
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: whsec_test" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "metadata": {
          "reservationId": "60d5ec49f1a2c8b1f8e4e123"
        }
      }
    }
  }'
```

## Sécurité

- ✅ Vérification de la signature Stripe obligatoire
- ✅ Validation du webhook secret
- ✅ Try/catch pour chaque type d'événement
- ✅ Logs détaillés pour le debugging
- ✅ Retourne toujours `{ received: true }` pour éviter les retry Stripe

## Logs

Les logs sont préfixés avec `[Stripe Webhook]` pour faciliter le debugging:

```
[Stripe Webhook] Received event: payment_intent.succeeded
[Stripe Webhook] Payment succeeded: pi_xxxxx
[Stripe Webhook] Booking confirmed: 60d5ec49f1a2c8b1f8e4e123
```

## Prochaines étapes (TODO)

- [ ] Implémenter l'envoi d'emails de confirmation
- [ ] Implémenter l'envoi d'emails d'échec de paiement
- [ ] Implémenter l'envoi d'emails de remboursement
- [ ] Ajouter un système de retry en cas d'erreur DB
- [ ] Ajouter des tests unitaires
- [ ] Logger les événements dans une table de logs

## Références

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
