#!/bin/bash

# ============================================================================
# Installation Git Hooks - Coworking Café
# ============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Installation des Git hooks...${NC}"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ ERREUR: Ce script doit être exécuté depuis la racine du repo Git${NC}"
    echo "Répertoire actuel: $(pwd)"
    exit 1
fi

# Vérifier que le hook source existe
if [ ! -f "scripts/pre-commit" ]; then
    echo -e "${RED}❌ ERREUR: Le fichier scripts/pre-commit n'existe pas${NC}"
    exit 1
fi

# Créer le dossier .git/hooks s'il n'existe pas
mkdir -p .git/hooks

# Copier le hook
cp scripts/pre-commit .git/hooks/pre-commit

# Rendre exécutable
chmod +x .git/hooks/pre-commit

echo -e "${GREEN}✅ Git hook pre-commit installé avec succès!${NC}"
echo ""
echo -e "${YELLOW}Le hook vérifiera automatiquement:${NC}"
echo "  - Blocage des commits de fichiers .env.local"
echo "  - Détection de secrets hardcodés (Stripe, MongoDB, etc.)"
echo "  - Avertissement sur fichiers sensibles modifiés"
echo ""
echo -e "${GREEN}Pour tester:${NC}"
echo "  git add <fichier>"
echo "  git commit -m \"test\""
echo ""
echo -e "${YELLOW}Pour bypasser temporairement (⚠️  avec précaution):${NC}"
echo "  git commit --no-verify -m \"message\""
echo ""

exit 0
