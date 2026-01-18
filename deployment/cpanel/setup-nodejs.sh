#!/bin/bash
# Script d'installation de Node.js et PM2 sur cPanel/CloudLinux
# Pour cbpcommunity.com

set -e

echo "🚀 Installation de Node.js et PM2 pour cPanel"
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Ce script doit être exécuté en tant que root${NC}"
    echo "Utilisez: sudo bash setup-nodejs.sh"
    exit 1
fi

# Détecter la version de CloudLinux
echo -e "${YELLOW}📋 Détection du système...${NC}"
if [ -f /etc/redhat-release ]; then
    OS_VERSION=$(cat /etc/redhat-release)
    echo -e "${GREEN}✓ Système détecté: $OS_VERSION${NC}"
else
    echo -e "${RED}❌ Impossible de détecter la version du système${NC}"
    exit 1
fi

# Installation de Node.js 20.x LTS
echo -e "${YELLOW}📦 Installation de Node.js 20.x LTS...${NC}"

# Ajouter le repository NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -

# Installer Node.js
yum install -y nodejs

# Vérifier l'installation
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo -e "${GREEN}✓ Node.js installé: $NODE_VERSION${NC}"
echo -e "${GREEN}✓ npm installé: $NPM_VERSION${NC}"

# Installation de PM2 globalement
echo -e "${YELLOW}📦 Installation de PM2...${NC}"
npm install -g pm2

# Vérifier l'installation de PM2
PM2_VERSION=$(pm2 -v)
echo -e "${GREEN}✓ PM2 installé: $PM2_VERSION${NC}"

# Configuration de PM2 pour démarrer au boot
echo -e "${YELLOW}⚙️  Configuration de PM2 pour démarrage automatique...${NC}"
pm2 startup systemd -u root --hp /root

# Créer le dossier pour les applications
echo -e "${YELLOW}📁 Création des dossiers d'application...${NC}"
mkdir -p /home/cbpcommunity/nodejs
mkdir -p /home/cbpcommunity/nodejs/logs

echo -e "${GREEN}✓ Dossiers créés${NC}"

# Installation de pnpm (optionnel mais recommandé)
echo -e "${YELLOW}📦 Installation de pnpm...${NC}"
npm install -g pnpm

PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}✓ pnpm installé: $PNPM_VERSION${NC}"

# Afficher le résumé
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Installation terminée avec succès !${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Versions installées:"
echo "  - Node.js: $NODE_VERSION"
echo "  - npm: $NPM_VERSION"
echo "  - PM2: $PM2_VERSION"
echo "  - pnpm: $PNPM_VERSION"
echo ""
echo "📁 Dossiers créés:"
echo "  - /home/cbpcommunity/nodejs"
echo "  - /home/cbpcommunity/nodejs/logs"
echo ""
echo "🎯 Prochaines étapes:"
echo "  1. Déployez votre application Next.js"
echo "  2. Configurez PM2 pour votre application"
echo "  3. Configurez Apache comme reverse proxy"
echo ""
echo "📚 Commandes utiles:"
echo "  - pm2 list                    # Liste des applications"
echo "  - pm2 logs                    # Voir les logs"
echo "  - pm2 restart all             # Redémarrer toutes les apps"
echo "  - pm2 save                    # Sauvegarder la configuration"
echo ""
