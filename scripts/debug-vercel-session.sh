#!/bin/bash

# Script pour déboguer les problèmes de session/IP en production
# Usage: ./scripts/debug-vercel-session.sh

PROD_URL="https://coworking-cafe-admin.vercel.app"

echo "=========================================="
echo "🔍 Debug Session & IP - Production"
echo "=========================================="
echo ""

# Test 1: Session API (doit retourner {} si non connecté)
echo "1️⃣  Test session endpoint..."
SESSION_RESPONSE=$(curl -s -i "$PROD_URL/api/auth/session")

# Extraire status code
STATUS=$(echo "$SESSION_RESPONSE" | grep "HTTP/" | awk '{print $2}')
# Extraire body (dernière ligne)
BODY=$(echo "$SESSION_RESPONSE" | tail -n 1)

echo "   Status: $STATUS"
echo "   Body: $BODY"

if [ "$STATUS" = "200" ]; then
  if [ "$BODY" = "{}" ] || [ "$BODY" = "null" ]; then
    echo "   ✅ Session vide (non connecté - normal)"
  else
    echo "   ✅ Session active"
    echo "   Contenu: $BODY"
  fi
else
  echo "   ❌ Erreur: $STATUS"
fi
echo ""

# Test 2: Page admin (doit rediriger vers login si non connecté)
echo "2️⃣  Test page admin..."
ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$PROD_URL/admin")
echo "   Status: $ADMIN_RESPONSE"

if [ "$ADMIN_RESPONSE" = "200" ]; then
  echo "   ✅ Page accessible"
elif [ "$ADMIN_RESPONSE" = "401" ] || [ "$ADMIN_RESPONSE" = "403" ]; then
  echo "   ⚠️  Accès refusé (normal si non connecté)"
else
  echo "   ❌ Erreur inattendue"
fi
echo ""

# Test 3: Vérifier les variables d'environnement (via Vercel CLI)
echo "3️⃣  Variables d'environnement..."
if command -v vercel &> /dev/null; then
  echo "   Vercel CLI détecté"
  echo ""
  echo "   Pour vérifier NEXTAUTH_SECRET:"
  echo "   → vercel env ls production | grep NEXTAUTH_SECRET"
  echo ""
  echo "   Pour vérifier NEXTAUTH_URL:"
  echo "   → vercel env ls production | grep NEXTAUTH_URL"
  echo ""
  echo "   Pour vérifier ALLOWED_STAFF_IPS:"
  echo "   → vercel env ls production | grep ALLOWED_STAFF_IPS"
  echo ""
else
  echo "   ⚠️  Vercel CLI non installé"
  echo "   Installer avec: npm install -g vercel"
  echo ""
  echo "   Ou vérifier manuellement:"
  echo "   👉 https://vercel.com/dashboard → Settings → Environment Variables"
fi

echo "=========================================="
echo "📊 Résumé Problèmes Possibles"
echo "=========================================="
echo ""
echo "Si connexion réussie mais accès refusé aux routes /admin/..."
echo ""
echo "❌ Problème 1: token.role n'est pas une string"
echo "   → FIX DÉPLOYÉ dans dernier commit"
echo "   → Attendre redéploiement Vercel (2-3 min)"
echo ""
echo "❌ Problème 2: NEXTAUTH_SECRET manquant/incorrect"
echo "   → Vérifier dans Vercel Dashboard"
echo "   → Générer avec: openssl rand -base64 32"
echo "   → Redéployer après modification"
echo ""
echo "❌ Problème 3: NEXTAUTH_URL incorrect"
echo "   → Doit être: https://coworking-cafe-admin.vercel.app"
echo "   → Pas de trailing slash"
echo ""
echo "ℹ️  Note: Protection IP ne s'applique PAS aux routes /admin/"
echo "   Elle s'applique seulement à: /, /clocking, /my-schedule, /produits"
echo ""
