#!/bin/bash

# Script de test pour déclencher une alerte DLC
# Simule aujourd'hui à 12:00

echo "🔔 Test alerte DLC - Aujourd'hui à 12:00"
echo "========================================"
echo ""

# Déterminer le jour actuel (0=Dimanche, 1=Lundi, etc.)
CURRENT_DAY=$(date +%u)
# Convertir au format US (0=Dimanche)
if [ $CURRENT_DAY -eq 7 ]; then
  CURRENT_DAY=0
fi

echo "📅 Jour actuel : $CURRENT_DAY ($(date +%A))"
echo "⏰ Heure simulée : 12:00"
echo ""

# Appeler l'endpoint de test
echo "🚀 Appel de l'API de test..."
echo ""

curl -s "http://localhost:3000/api/cron/dlc-alerts/test?time=12:00&day=$CURRENT_DAY" | jq '.'

echo ""
echo "✅ Test terminé !"
echo ""
echo "💡 Pour voir la tâche créée, va sur http://localhost:3000"
