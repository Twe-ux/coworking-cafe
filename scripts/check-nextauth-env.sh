#!/bin/bash

# Script de vérification des variables NextAuth en production
# Usage: ./scripts/check-nextauth-env.sh

set -e

PROD_URL="https://coworking-cafe-admin.vercel.app"

echo "=========================================="
echo "🔍 Vérification NextAuth Configuration"
echo "=========================================="
echo ""

# Test 1: CSRF token (indique si NextAuth fonctionne)
echo "1️⃣  Test CSRF token..."
CSRF_RESPONSE=$(curl -s "$PROD_URL/api/auth/csrf")

if echo "$CSRF_RESPONSE" | grep -q "csrfToken"; then
  echo "✅ NextAuth endpoint accessible"
  echo ""
else
  echo "❌ ERREUR: NextAuth ne répond pas correctement"
  echo "   Réponse: $CSRF_RESPONSE"
  echo ""
  exit 1
fi

# Test 2: Providers
echo "2️⃣  Test providers..."
PROVIDERS_RESPONSE=$(curl -s "$PROD_URL/api/auth/providers")

if echo "$PROVIDERS_RESPONSE" | grep -q "credentials"; then
  echo "✅ Providers configurés correctement"
  echo ""
else
  echo "❌ ERREUR: Providers non configurés"
  echo "   Réponse: $PROVIDERS_RESPONSE"
  echo ""
  exit 1
fi

# Test 3: Session (sans auth)
echo "3️⃣  Test session endpoint..."
SESSION_RESPONSE=$(curl -s "$PROD_URL/api/auth/session")

if [ "$SESSION_RESPONSE" = "{}" ] || [ "$SESSION_RESPONSE" = "null" ]; then
  echo "✅ Session endpoint fonctionne (pas de session active = normal)"
  echo ""
else
  echo "⚠️  Réponse inattendue: $SESSION_RESPONSE"
  echo ""
fi

# Résumé
echo "=========================================="
echo "📊 Résumé"
echo "=========================================="
echo ""
echo "✅ NextAuth est configuré"
echo "✅ Les endpoints répondent"
echo ""
echo "Si la connexion ne fonctionne toujours pas après avoir entré le PIN :"
echo ""
echo "1. Vérifier NEXTAUTH_SECRET dans Vercel Environment Variables"
echo "   → Générer avec: openssl rand -base64 32"
echo ""
echo "2. Vérifier NEXTAUTH_URL dans Vercel Environment Variables"
echo "   → Doit être: https://coworking-cafe-admin.vercel.app"
echo ""
echo "3. Redéployer après modification des variables"
echo ""
echo "4. Vider le cache du navigateur (Cmd+Shift+R)"
echo ""
