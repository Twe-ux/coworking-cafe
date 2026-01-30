#!/bin/bash

# Script de diagnostic rapide de l'authentification en production
# Usage: ./scripts/test-prod-auth.sh

set -e

PROD_URL="https://coworking-cafe-admin.vercel.app"

echo "=========================================="
echo "🔍 Diagnostic Authentification Production"
echo "=========================================="
echo ""

# Test 1: API /providers
echo "1️⃣  Test /api/auth/providers..."
PROVIDERS_RESPONSE=$(curl -s "$PROD_URL/api/auth/providers")

if echo "$PROVIDERS_RESPONSE" | grep -q "<!DOCTYPE"; then
  echo "❌ ERREUR: /api/auth/providers retourne HTML au lieu de JSON"
  echo "   → Problème de configuration des variables d'environnement"
  echo "   → Voir scripts/check-vercel-env.md pour la solution"
  echo ""
  echo "Réponse reçue (premiers caractères):"
  echo "$PROVIDERS_RESPONSE" | head -c 200
  echo ""
  exit 1
elif echo "$PROVIDERS_RESPONSE" | grep -q "credentials"; then
  echo "✅ /api/auth/providers retourne JSON correctement"
  echo ""
else
  echo "⚠️  Réponse inattendue:"
  echo "$PROVIDERS_RESPONSE"
  echo ""
fi

# Test 2: API /session (sans auth)
echo "2️⃣  Test /api/auth/session (sans auth)..."
SESSION_RESPONSE=$(curl -s "$PROD_URL/api/auth/session")

if echo "$SESSION_RESPONSE" | grep -q "<!DOCTYPE"; then
  echo "❌ ERREUR: /api/auth/session retourne HTML au lieu de JSON"
  echo "   → Problème de configuration des variables d'environnement"
  echo "   → Voir scripts/check-vercel-env.md pour la solution"
  echo ""
  exit 1
else
  echo "✅ /api/auth/session retourne une réponse (attendu: vide ou null)"
  echo ""
fi

# Test 3: Page de login
echo "3️⃣  Test page /login..."
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/login")

if [ "$LOGIN_RESPONSE" = "200" ]; then
  echo "✅ Page /login accessible (HTTP 200)"
  echo ""
elif [ "$LOGIN_RESPONSE" = "500" ]; then
  echo "❌ ERREUR: Page /login retourne 500"
  echo "   → Problème de configuration ou de connexion MongoDB"
  echo "   → Voir scripts/check-vercel-env.md pour la solution"
  echo ""
  exit 1
else
  echo "⚠️  Page /login retourne HTTP $LOGIN_RESPONSE"
  echo ""
fi

# Résumé
echo "=========================================="
echo "📊 Résumé du diagnostic"
echo "=========================================="
echo ""

if [ "$PROVIDERS_RESPONSE" != "" ] && ! echo "$PROVIDERS_RESPONSE" | grep -q "<!DOCTYPE"; then
  echo "✅ Authentification NextAuth : OK"
  echo "✅ Configuration variables : Probablement correcte"
  echo ""
  echo "Le problème a peut-être été résolu !"
  echo "Testez maintenant le login avec PIN sur :"
  echo "  $PROD_URL/login"
else
  echo "❌ Authentification NextAuth : ERREUR"
  echo "❌ Variables d'environnement : À vérifier"
  echo ""
  echo "Actions recommandées :"
  echo "  1. Lire : scripts/check-vercel-env.md"
  echo "  2. Vérifier Vercel Dashboard → Environment Variables"
  echo "  3. S'assurer que MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL sont définis"
  echo "  4. Redéployer après modification"
fi

echo ""
echo "=========================================="
echo "📚 Documentation"
echo "=========================================="
echo ""
echo "Guide complet : scripts/check-vercel-env.md"
echo "Variables requises :"
echo "  - MONGODB_URI (pointe vers coworking_cafe database)"
echo "  - NEXTAUTH_SECRET (32+ caractères)"
echo "  - NEXTAUTH_URL (https://...)"
echo ""
