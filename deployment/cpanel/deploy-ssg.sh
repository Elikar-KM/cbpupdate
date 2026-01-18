#!/bin/bash
# Script de déploiement SSG (Static Site Generation)
# Pour cPanel / Hébergement Statique

set -e

APP_DIR="/home/cbpcommunity/public_html/appv2"

# 1. Build
echo "Building Static Site..."
# pnpm run build # Exécuté localement

# 2. Upload
echo "Instructions:"
echo "1. Exécutez 'pnpm build' sur votre machine locale."
echo "2. Le dossier 'out' sera créé."
echo "3. Compressez le contenu du dossier 'out' (zip)."
echo "4. Uploadez le zip dans $APP_DIR sur cPanel."
echo "5. Extrayez les fichiers."
echo ""
echo "Note: Assurez-vous que le fichier .htaccess est présent pour gérer le routing (SPA)."
