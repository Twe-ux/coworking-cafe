#!/usr/bin/env tsx

/**
 * Script pour générer les clés VAPID pour les push notifications
 *
 * Usage: pnpm run generate-vapid-keys
 */

import webPush from 'web-push';
import fs from 'fs';
import path from 'path';

console.log('🔐 Génération des clés VAPID pour les push notifications...\n');

// Générer les clés VAPID
const vapidKeys = webPush.generateVAPIDKeys();

console.log('✅ Clés VAPID générées avec succès!\n');
console.log('📋 Ajoutez ces variables dans votre fichier .env.local:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:admin@coworkingcafe.com\n');

// Lire le fichier .env.local actuel
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (error) {
  console.log('⚠️  Fichier .env.local non trouvé, création...');
}

// Vérifier si les clés VAPID existent déjà
if (envContent.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY')) {
  console.log('⚠️  Les clés VAPID existent déjà dans .env.local');
  console.log('❓ Voulez-vous les remplacer? (Cela invalidera toutes les subscriptions existantes)');
  console.log('   Si oui, supprimez les lignes VAPID dans .env.local et relancez ce script.');
  process.exit(0);
}

// Ajouter les clés au fichier .env.local
const vapidEnv = `
# ========================================
# Push Notifications (VAPID Keys)
# ========================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=mailto:admin@coworkingcafe.com
`;

envContent += vapidEnv;

fs.writeFileSync(envPath, envContent);

console.log('✅ Clés VAPID ajoutées à .env.local');
console.log('\n🚀 Vous pouvez maintenant relancer votre serveur avec: pnpm dev');
