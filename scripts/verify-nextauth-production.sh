#!/bin/bash

# Script pour vérifier NEXTAUTH_SECRET en production
# Usage: ./scripts/verify-nextauth-production.sh

echo "=========================================="
echo "🔍 Vérification NEXTAUTH_SECRET Production"
echo "=========================================="
echo ""

# Vérifier si Vercel CLI est connecté
if ! vercel whoami &> /dev/null 2>&1; then
    echo "❌ Vercel CLI non connecté"
    echo ""
    echo "Pour se connecter:"
    echo "  vercel login"
    echo ""
    echo "Ou vérifier manuellement:"
    echo "  👉 https://vercel.com/dashboard → Project → Settings → Environment Variables"
    echo ""
    exit 1
fi

VERCEL_USER=$(vercel whoami 2>/dev/null)
echo "✅ Connecté en tant que: $VERCEL_USER"
echo ""

# Aller dans le dossier admin
cd "$(dirname "$0")/../apps/admin" || exit 1

echo "📋 Vérification NEXTAUTH_SECRET..."
echo ""

# Vérifier si NEXTAUTH_SECRET existe en production
SECRET_CHECK=$(vercel env ls production 2>/dev/null | grep "NEXTAUTH_SECRET" || echo "")

if [ -z "$SECRET_CHECK" ]; then
    echo "❌ NEXTAUTH_SECRET n'existe PAS en Production"
    echo ""
    echo "🔧 SOLUTION:"
    echo ""
    echo "1. Générer un nouveau secret:"
    echo "   openssl rand -base64 32"
    echo ""
    echo "2. L'ajouter dans Vercel:"
    echo "   vercel env add NEXTAUTH_SECRET production"
    echo "   (Coller le secret généré)"
    echo ""
    echo "3. Redéployer:"
    echo "   vercel --prod"
    echo ""
    exit 1
else
    echo "✅ NEXTAUTH_SECRET existe en Production"
    echo ""
    echo "⚠️  Si tu as changé NEXTAUTH_SECRET récemment:"
    echo ""
    echo "1. Vérifie que le redéploiement est terminé:"
    echo "   👉 https://vercel.com/dashboard → Deployments → Status: ✅ Ready"
    echo ""
    echo "2. Supprime les cookies NextAuth dans ton navigateur:"
    echo "   - F12 → Application → Cookies → coworking-cafe-admin.vercel.app"
    echo "   - Supprimer: next-auth.session-token.admin"
    echo "   - Ou suivre: scripts/clear-session-cookies.md"
    echo ""
    echo "3. Rafraîchis: Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)"
    echo ""
    echo "4. Reconnecte-toi avec ton PIN"
    echo ""
fi

echo "📋 Vérification NEXTAUTH_URL..."
echo ""

URL_CHECK=$(vercel env ls production 2>/dev/null | grep "NEXTAUTH_URL" || echo "")

if [ -z "$URL_CHECK" ]; then
    echo "❌ NEXTAUTH_URL n'existe PAS en Production"
    echo ""
    echo "🔧 SOLUTION:"
    echo "   vercel env add NEXTAUTH_URL production"
    echo "   Valeur: https://coworking-cafe-admin.vercel.app"
    echo ""
else
    echo "✅ NEXTAUTH_URL existe en Production"
    echo ""
    echo "⚠️  Vérifie que la valeur est exactement:"
    echo "   https://coworking-cafe-admin.vercel.app"
    echo "   (sans trailing slash)"
    echo ""
fi

echo "=========================================="
echo "📊 Résumé"
echo "=========================================="
echo ""
echo "Variables trouvées:"
echo "$SECRET_CHECK"
echo "$URL_CHECK"
echo ""
echo "Pour voir les valeurs complètes:"
echo "  vercel env pull .env.production"
echo "  cat .env.production"
echo ""
