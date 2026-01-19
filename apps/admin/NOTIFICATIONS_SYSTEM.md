# Système de Notifications Push - Guide Complet

## 🎯 Vue d'ensemble

Le système de notifications push est **générique** et extensible. Il supporte actuellement :
- ✅ **Contact** : Messages du formulaire de contact
- 🔜 **Messenger** : Messages de la messagerie interne
- 🔜 **Support** : Tickets de support client
- 🔜 **System** : Notifications système

---

## 📦 Architecture

### 1. Types de Notifications

```typescript
// src/lib/push-notifications.ts
export type NotificationType = 'contact' | 'messenger' | 'support' | 'system';
```

### 2. Configuration par Type

Chaque type a sa propre configuration :

```typescript
export const NOTIFICATION_CONFIGS = {
  contact: {
    icon: '/web-app-manifest-512x512.png',
    badge: '/web-app-manifest-192x192.png',
    tag: 'contact-message',
    url: '/admin/messages/contact',  // URL de redirection
  },
  messenger: {
    icon: '/web-app-manifest-512x512.png',
    badge: '/web-app-manifest-192x192.png',
    tag: 'messenger-message',
    url: '/admin/messages/messenger',
  },
  // ... autres types
};
```

### 3. Fonctions Disponibles

#### Messages de Contact ✅
```typescript
import { sendNewContactNotification } from '@/lib/push-notifications';

await sendNewContactNotification({
  id: message._id.toString(),
  name: message.name,
  subject: message.subject,
  message: message.message,
  unreadCount: 5,
});
```

#### Messages Messenger (À venir)
```typescript
import { sendNewMessengerNotification } from '@/lib/push-notifications';

await sendNewMessengerNotification({
  id: message._id.toString(),
  senderName: 'Jean Dupont',
  message: 'Salut, comment ça va ?',
  unreadCount: 3,
});
```

#### Demandes de Support (À venir)
```typescript
import { sendNewSupportNotification } from '@/lib/push-notifications';

await sendNewSupportNotification({
  id: ticket._id.toString(),
  userName: 'Marie Martin',
  subject: 'Problème de connexion',
  message: 'Je n\'arrive pas à me connecter...',
  unreadCount: 2,
});
```

#### Notifications Système (À venir)
```typescript
import { sendSystemNotification } from '@/lib/push-notifications';

await sendSystemNotification({
  id: 'system-123',
  title: 'Maintenance programmée',
  message: 'Le système sera en maintenance ce soir de 22h à 23h',
});
```

---

## 🚀 Ajouter un Nouveau Type de Notification

### Étape 1 : Ajouter le Type

```typescript
// src/lib/push-notifications.ts
export type NotificationType = 'contact' | 'messenger' | 'support' | 'system' | 'booking'; // ← Nouveau type
```

### Étape 2 : Ajouter la Configuration

```typescript
export const NOTIFICATION_CONFIGS = {
  // ... types existants
  booking: {
    icon: '/web-app-manifest-512x512.png',
    badge: '/web-app-manifest-192x192.png',
    tag: 'booking-notification',
    url: '/admin/bookings',
  },
};
```

### Étape 3 : Créer la Fonction Dédiée

```typescript
/**
 * Envoie une notification pour une nouvelle réservation
 */
export async function sendNewBookingNotification(bookingData: {
  id: string;
  clientName: string;
  spaceName: string;
  date: string;
  unreadCount: number;
}): Promise<void> {
  const result = await sendTypedNotification('booking', {
    title: `Nouvelle réservation - ${bookingData.clientName}`,
    body: `${bookingData.spaceName} le ${bookingData.date}`,
    messageId: bookingData.id,
    unreadCount: bookingData.unreadCount,
  });

  console.log('[Push] Booking notification result:', result);
}
```

### Étape 4 : Créer l'API Route (si nécessaire)

```typescript
// src/app/api/notifications/send-booking/route.ts
import { sendNewBookingNotification } from '@/lib/push-notifications';

export async function POST(request: NextRequest) {
  const { bookingId } = await request.json();

  // Récupérer les données de la réservation
  const booking = await Booking.findById(bookingId);

  await sendNewBookingNotification({
    id: booking._id.toString(),
    clientName: booking.clientName,
    spaceName: booking.spaceName,
    date: booking.date,
    unreadCount: await Booking.countDocuments({ status: 'pending' }),
  });

  return NextResponse.json({ success: true });
}
```

### Étape 5 : Appeler depuis l'App qui Crée les Données

```typescript
// Dans l'app qui crée une réservation
const booking = await Booking.create(bookingData);

// Envoyer notification push
try {
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';
  await fetch(`${adminApiUrl}/api/notifications/send-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: booking._id.toString() }),
  });
} catch (error) {
  console.error('Failed to send booking notification:', error);
}
```

---

## 🔧 Redirection au Clic

Le Service Worker gère automatiquement la redirection au clic sur la notification :

1. **Fenêtre déjà ouverte** → Focus sur la fenêtre existante et navigation vers l'URL
2. **Pas de fenêtre ouverte** → Ouvre une nouvelle fenêtre à l'URL configurée

Les URLs sont configurées dans `NOTIFICATION_CONFIGS[type].url`.

---

## 🧪 Tester les Notifications

### 1. Vérifier la Configuration

Va sur : http://localhost:3001/admin/debug/notifications

Vérifie que :
- ✅ Service Worker enregistré
- ✅ Abonné aux push notifications
- ✅ Permission accordée

### 2. Tester avec le Formulaire de Contact

1. Envoie un message depuis http://localhost:3000/contact
2. Une notification devrait apparaître avec :
   - **Titre** : `Nom - Sujet`
   - **Corps** : Message (max 100 caractères)
   - **Logo** : Logo de l'app
3. Clique sur "Voir" → Redirige vers `/admin/messages/contact`

### 3. Logs à Vérifier

**Terminal apps/site** :
```
[Contact] Push notification triggered for message: 676e...
```

**Terminal apps/admin** :
```
[Push] Sending contact notification: {...}
[Push] Sent: 1, Failed: 0
[Push] Contact notification result: {...}
```

**Console navigateur** (DevTools) :
```
[Service Worker] Push event received
[Service Worker] Notification clicked:
[Service Worker] Focusing existing window and navigating to: http://localhost:3001/admin/messages/contact
```

---

## 📝 Checklist pour Nouveau Type

Quand tu ajoutes un nouveau type de notification :

- [ ] Ajouter le type dans `NotificationType`
- [ ] Ajouter la config dans `NOTIFICATION_CONFIGS`
- [ ] Créer la fonction `sendNew[Type]Notification()`
- [ ] Créer l'API route `/api/notifications/send-[type]/`
- [ ] Créer la page de destination `/admin/messages/[type]/`
- [ ] Ajouter dans la sidebar si nécessaire
- [ ] Mettre à jour ce README
- [ ] Tester le flux complet

---

## 🔒 Sécurité

### Variables d'Environnement Requises

```bash
# apps/admin/.env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BDx..." # Clé publique VAPID
VAPID_PRIVATE_KEY="xyz..."            # Clé privée VAPID (secret!)
VAPID_SUBJECT="mailto:admin@coworkingcafe.com"
MONGODB_URI="mongodb://..."
```

### Générer les Clés VAPID

```bash
cd apps/admin
pnpm generate-vapid-keys
# Copier les clés dans .env.local
```

---

## 🚀 Production

### Configuration en Production

1. **Domaine** : Remplacer `http://localhost:3001` par `https://admin.coworkingcafe.com`
2. **HTTPS** : Obligatoire pour les Service Workers
3. **Clés VAPID** : Utiliser les mêmes clés en production
4. **Notifications macOS** : Safari affichera le nom du domaine au lieu de "localhost"

### Variables d'Environnement Production

```bash
# apps/site/.env.production
NEXT_PUBLIC_ADMIN_API_URL=https://admin.coworkingcafe.com

# apps/admin/.env.production
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BDx..." # Même clé qu'en dev
VAPID_PRIVATE_KEY="xyz..."            # Même clé qu'en dev
VAPID_SUBJECT="mailto:admin@coworkingcafe.com"
```

---

**Dernière mise à jour** : 2026-01-19
**Version** : 3.0 (Système générique + redirection)
