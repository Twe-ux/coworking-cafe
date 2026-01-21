#!/bin/bash

# Script de vérification de l'utilisation des models
# Usage: ./verify_model_usage.sh [ModelName]

if [ -z "$1" ]; then
  echo "Usage: $0 <ModelName>"
  echo ""
  echo "Exemples:"
  echo "  $0 User"
  echo "  $0 Employee"
  echo "  $0 Article"
  exit 1
fi

MODEL_NAME="$1"

echo "========================================"
echo "=== VÉRIFICATION: $MODEL_NAME ==="
echo "========================================"
echo ""

echo "🔍 DANS SITE (apps/site/src/, excluant src-old):"
echo ""
grep -rn "$MODEL_NAME" apps/site/src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "src-old" | head -20

echo ""
echo "🔍 DANS ADMIN (apps/admin/src/):"
echo ""
grep -rn "$MODEL_NAME" apps/admin/src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -20

echo ""
echo "📊 COMPTAGE:"
site_count=$(grep -r "$MODEL_NAME" apps/site/src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "src-old" | wc -l | xargs)
admin_count=$(grep -r "$MODEL_NAME" apps/admin/src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | xargs)
total=$((site_count + admin_count))

echo "  Site:  $site_count occurrences"
echo "  Admin: $admin_count occurrences"
echo "  Total: $total occurrences"
echo ""
