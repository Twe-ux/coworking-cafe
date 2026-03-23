#!/bin/bash

# Script de test simple pour alerte DLC - Aujourd'hui à 12:00
echo "🔔 Test alerte DLC - Aujourd'hui à 12:00"
echo ""

curl -s "http://localhost:3000/api/cron/dlc-alerts/test?time=12:00" | jq '.'
