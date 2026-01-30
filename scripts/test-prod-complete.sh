#!/bin/bash

# Script de test complet production
# Usage: ./scripts/test-prod-complete.sh

PROD_URL="https://coworking-cafe-admin.vercel.app"

echo "=========================================="
echo "🔍 Test Complet Production"
echo "=========================================="
echo ""

# Test 1: Vérifier que le dernier commit est déployé
echo "1️⃣  Vérification déploiement..."
echo ""
LATEST_COMMIT=$(git log -1 --oneline)
echo "   Dernier commit local:"
echo "   → $LATEST_COMMIT"
echo ""
echo "   ⚠️  Vérifie dans Vercel Dashboard que ce commit est déployé"
echo "   👉 https://vercel.com/dashboard"
echo ""

# Test 2: CSRF Token (indique si NextAuth fonctionne)
echo "2️⃣  Test NextAuth CSRF..."
CSRF_RESPONSE=$(curl -s "$PROD_URL/api/auth/csrf")

if echo "$CSRF_RESPONSE" | grep -q "csrfToken"; then
  echo "   ✅ NextAuth fonctionne"
  CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${CSRF_TOKEN:0:20}..."
else
  echo "   ❌ NextAuth ne répond pas"
  echo "   Réponse: $CSRF_RESPONSE"
fi
echo ""

# Test 3: Providers
echo "3️⃣  Test Providers..."
PROVIDERS_RESPONSE=$(curl -s "$PROD_URL/api/auth/providers")

if echo "$PROVIDERS_RESPONSE" | grep -q "credentials"; then
  echo "   ✅ Provider credentials configuré"
else
  echo "   ❌ Provider credentials non trouvé"
  echo "   Réponse: $PROVIDERS_RESPONSE"
fi
echo ""

# Test 4: Session (sans auth)
echo "4️⃣  Test Session endpoint..."
SESSION_RESPONSE=$(curl -s "$PROD_URL/api/auth/session")

if [ "$SESSION_RESPONSE" = "{}" ] || [ "$SESSION_RESPONSE" = "null" ]; then
  echo "   ✅ Session endpoint fonctionne (pas de session = normal)"
else
  echo "   ⚠️  Réponse inattendue: $SESSION_RESPONSE"
fi
echo ""

# Test 5: Page admin (doit rediriger vers login si non connecté)
echo "5️⃣  Test accès /admin..."
ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$PROD_URL/admin")

if [ "$ADMIN_RESPONSE" = "200" ]; then
  echo "   ✅ Page admin accessible"
  echo "   ⚠️  Si tu vois cette page mais ne peux pas naviguer:"
  echo "      → Les cookies sont peut-être corrompus"
  echo "      → Suis le guide: scripts/clear-session-cookies.md"
else
  echo "   Status: $ADMIN_RESPONSE"
fi
echo ""

# Instructions finales
echo "=========================================="
echo "📋 Prochaines Étapes"
echo "=========================================="
echo ""
echo "Si tu as changé NEXTAUTH_SECRET récemment:"
echo ""
echo "1️⃣  Vérifier que le dernier commit est déployé (Vercel Dashboard)"
echo "   Commit attendu: fix(admin): fix session role type mismatch..."
echo ""
echo "2️⃣  Supprimer les cookies NextAuth"
echo "   → DevTools (F12) → Application → Cookies"
echo "   → Supprimer: next-auth.session-token.admin"
echo "   → Ou suivre: scripts/clear-session-cookies.md"
echo ""
echo "3️⃣  Rafraîchir la page (Cmd+Shift+R)"
echo ""
echo "4️⃣  Se reconnecter avec ton PIN"
echo ""
echo "5️⃣  Tester navigation vers /admin/hr/employees"
echo ""
echo "Si problème persiste → Partager les logs Vercel"
echo ""
