#!/bin/bash

# Script pour vérifier la configuration Vercel en production
# Usage: ./scripts/verify-vercel-production.sh

set -e

echo "=========================================="
echo "🔍 Vérification Configuration Vercel"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo ""
    echo "Pour installer:"
    echo "  npm install -g vercel"
    echo ""
    echo "Ou vérifier manuellement dans le dashboard:"
    echo "  👉 https://vercel.com/[votre-equipe]/coworking-cafe-admin/settings/environment-variables"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI installé"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Non connecté à Vercel"
    echo ""
    echo "Pour se connecter:"
    echo "  vercel login"
    echo ""
    exit 1
fi

VERCEL_USER=$(vercel whoami)
echo "✅ Connecté en tant que: $VERCEL_USER"
echo ""

# Check environment variables for production
echo "📋 Variables d'environnement Production:"
echo "=========================================="
echo ""

cd "$(dirname "$0")/../apps/admin"

# Get production environment variables
echo "Récupération des variables..."
vercel env ls production

echo ""
echo "=========================================="
echo "🔑 Variables Critiques à Vérifier"
echo "=========================================="
echo ""
echo "1. NEXTAUTH_SECRET"
echo "   ✓ Doit exister en Production"
echo "   ✓ Doit faire 32+ caractères"
echo "   ✓ Généré avec: openssl rand -base64 32"
echo ""
echo "2. NEXTAUTH_URL"
echo "   ✓ Doit être: https://coworking-cafe-admin.vercel.app"
echo "   ✓ Pas de trailing slash"
echo ""
echo "3. MONGODB_URI"
echo "   ✓ Doit pointer vers le cluster production"
echo "   ✓ Format: mongodb+srv://user:pass@cluster.mongodb.net/db"
echo ""
echo "=========================================="
echo "📝 Commandes Utiles"
echo "=========================================="
echo ""
echo "Ajouter une variable:"
echo "  vercel env add NEXTAUTH_SECRET production"
echo ""
echo "Mettre à jour une variable:"
echo "  vercel env rm NEXTAUTH_SECRET production"
echo "  vercel env add NEXTAUTH_SECRET production"
echo ""
echo "Après modification des variables:"
echo "  vercel --prod"
echo ""
