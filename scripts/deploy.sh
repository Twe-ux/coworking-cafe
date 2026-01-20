#!/bin/bash

echo "🚀 Déploiement Northflank Helper"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Vérification des fichiers de configuration...${NC}"

# Check northflank.json files
if [ ! -f "apps/site/northflank.json" ]; then
  echo "❌ apps/site/northflank.json manquant"
  exit 1
fi

if [ ! -f "apps/admin/northflank.json" ]; then
  echo "❌ apps/admin/northflank.json manquant"
  exit 1
fi

if [ ! -f "apps/socket-server/northflank.json" ]; then
  echo "❌ apps/socket-server/northflank.json manquant"
  exit 1
fi

echo -e "${GREEN}✅ Tous les fichiers de config sont présents${NC}"
echo ""

echo -e "${BLUE}Test de build local...${NC}"
pnpm install --frozen-lockfile
pnpm build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build local réussi${NC}"
  echo ""
  echo "Prêt pour le déploiement Northflank !"
  echo ""
  echo "Prochaines étapes :"
  echo "1. Commit & push les changements"
  echo "2. Aller sur Northflank Dashboard"
  echo "3. Créer les 3 services"
  echo "4. Configurer les variables d'environnement"
  echo "5. Déployer !"
else
  echo "❌ Build échoué - corriger les erreurs avant de déployer"
  exit 1
fi
