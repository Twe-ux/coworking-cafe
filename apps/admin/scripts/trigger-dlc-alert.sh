#!/bin/bash
# =============================================================================
# Script pour déclencher manuellement l'alerte DLC en production
# =============================================================================
#
# Usage:
#   ./scripts/trigger-dlc-alert.sh [test|prod]
#
# Examples:
#   ./scripts/trigger-dlc-alert.sh test        # Mode test (utilise heure actuelle)
#   ./scripts/trigger-dlc-alert.sh prod        # Mode production (nécessite CRON_SECRET)
#
# =============================================================================

# Configuration
PROD_URL="https://your-admin-domain.vercel.app"  # ← REMPLACER par l'URL de production
CRON_SECRET="${CRON_SECRET:-}"  # Lire depuis variable d'environnement

# Couleurs pour affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Mode par défaut
MODE="${1:-test}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Déclenchement Alerte DLC - Mode: ${MODE^^}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Récupérer heure et jour actuel (timezone FR)
CURRENT_TIME=$(TZ=Europe/Paris date +"%H:%M")
CURRENT_DAY=$(TZ=Europe/Paris date +"%u")  # 1=Lundi, 7=Dimanche
# Convertir pour format API (0=Dimanche, 1=Lundi)
if [ "$CURRENT_DAY" -eq 7 ]; then
  API_DAY=0
else
  API_DAY=$CURRENT_DAY
fi

echo -e "⏰ Heure actuelle (FR): ${GREEN}${CURRENT_TIME}${NC}"
echo -e "📅 Jour actuel (FR): ${GREEN}${API_DAY}${NC} (0=Dimanche, 1=Lundi, ..., 6=Samedi)"
echo ""

if [ "$MODE" = "test" ]; then
  # =============================================================================
  # MODE TEST - Utilise /api/cron/dlc-alerts/test
  # =============================================================================
  echo -e "${YELLOW}📊 MODE TEST${NC}"
  echo -e "   → Crée une tâche avec '(TEST)' dans le titre"
  echo -e "   → Pas de sécurité CRON_SECRET requise"
  echo ""

  ENDPOINT="${PROD_URL}/api/cron/dlc-alerts/test?time=${CURRENT_TIME}&day=${API_DAY}"

  echo -e "🌐 Endpoint: ${BLUE}${ENDPOINT}${NC}"
  echo ""
  echo -e "${YELLOW}Envoi de la requête...${NC}"
  echo ""

  RESPONSE=$(curl -s -w "\n%{http_code}" "${ENDPOINT}")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Succès (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo -e "${GREEN}Réponse:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  else
    echo -e "${RED}❌ Erreur (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "$BODY"
  fi

elif [ "$MODE" = "prod" ]; then
  # =============================================================================
  # MODE PRODUCTION - Utilise /api/cron/dlc-alerts
  # =============================================================================
  echo -e "${GREEN}🚀 MODE PRODUCTION${NC}"
  echo -e "   → Crée une VRAIE tâche (sans '(TEST)')"
  echo -e "   → Nécessite CRON_SECRET"
  echo ""

  if [ -z "$CRON_SECRET" ]; then
    echo -e "${RED}❌ ERREUR: Variable CRON_SECRET non définie${NC}"
    echo ""
    echo "Pour définir CRON_SECRET:"
    echo "  export CRON_SECRET=\"votre-secret-ici\""
    echo ""
    echo "Ou récupérer depuis Vercel:"
    echo "  vercel env pull"
    echo "  source .env.local"
    echo ""
    exit 1
  fi

  ENDPOINT="${PROD_URL}/api/cron/dlc-alerts"

  echo -e "🌐 Endpoint: ${BLUE}${ENDPOINT}${NC}"
  echo -e "🔐 Auth: ${GREEN}Bearer ${CRON_SECRET:0:8}...${NC}"
  echo ""
  echo -e "${YELLOW}Envoi de la requête...${NC}"
  echo ""

  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    "${ENDPOINT}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Succès (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo -e "${GREEN}Réponse:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  else
    echo -e "${RED}❌ Erreur (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "$BODY"
  fi

else
  echo -e "${RED}❌ Mode invalide: ${MODE}${NC}"
  echo ""
  echo "Usage: $0 [test|prod]"
  exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
