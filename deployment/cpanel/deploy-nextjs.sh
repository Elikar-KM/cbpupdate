#!/bin/bash
# Script de déploiement Next.js pour cPanel
# Domaine: cbpcommunity.com

set -e

# Configuration
DOMAIN="appv2.cbpcommunity.com"
APP_NAME="cbp-frontend"
APP_DIR="/home/cbpcommunity/nodejs/$APP_NAME"
PM2_APP_NAME="cbp-nextjs"
PORT=3000

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Déploiement de Next.js pour $DOMAIN${NC}"
echo "=============================================="

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 n'est pas installé${NC}"
    echo "Exécutez d'abord: sudo bash setup-nodejs.sh"
    exit 1
fi

# Créer le dossier de l'application
echo -e "${YELLOW}📁 Création du dossier d'application...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

echo -e "${GREEN}✓ Dossier créé: $APP_DIR${NC}"

# Instructions pour l'utilisateur
echo ""
echo -e "${BLUE}📋 INSTRUCTIONS DE DÉPLOIEMENT${NC}"
echo "=============================================="
echo ""
echo "1️⃣  Sur votre machine locale, exécutez:"
echo -e "${YELLOW}   pnpm run build:cpanel${NC}"
echo ""
echo "2️⃣  Transférez l'archive ZIP créée vers le serveur:"
echo -e "${YELLOW}   scp cbp-production-*.zip root@votre-serveur:$APP_DIR/${NC}"
echo ""
echo "3️⃣  Connectez-vous en SSH et extrayez l'archive:"
echo -e "${YELLOW}   cd $APP_DIR${NC}"
echo -e "${YELLOW}   unzip cbp-production-*.zip${NC}"
echo ""
echo "4️⃣  Installez les dépendances:"
echo -e "${YELLOW}   npm install --production${NC}"
echo ""
echo "5️⃣  Configurez les variables d'environnement:"
echo -e "${YELLOW}   nano .env.production${NC}"
echo ""
echo "   Variables à configurer:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_URL=https://$DOMAIN"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXT_PUBLIC_API_URL=https://api.$DOMAIN"
echo ""
echo "6️⃣  Exécutez les migrations Prisma:"
echo -e "${YELLOW}   npx prisma migrate deploy${NC}"
echo ""
echo "7️⃣  Démarrez l'application avec PM2:"
echo -e "${YELLOW}   pm2 start server.js --name $PM2_APP_NAME --env production${NC}"
echo -e "${YELLOW}   pm2 save${NC}"
echo ""
echo "8️⃣  Configurez Apache (voir instructions ci-dessous)"
echo ""
echo ""
echo -e "${BLUE}⚙️  CONFIGURATION APACHE${NC}"
echo "=============================================="
echo ""
echo "Créez le fichier .htaccess dans /home/cbpcommunity/public_html/"
echo ""
echo -e "${YELLOW}Contenu du .htaccess:${NC}"
echo ""
cat << 'EOF'
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy vers Next.js sur port 3000
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

# Headers pour le proxy
<IfModule mod_headers.c>
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
</IfModule>
EOF
echo ""
echo ""
echo -e "${BLUE}🔐 CONFIGURATION SSL${NC}"
echo "=============================================="
echo ""
echo "1. Dans cPanel, allez dans 'SSL/TLS Status'"
echo "2. Activez AutoSSL pour $DOMAIN"
echo "3. Ou installez Let's Encrypt manuellement"
echo ""
echo ""
echo -e "${BLUE}📊 COMMANDES PM2 UTILES${NC}"
echo "=============================================="
echo ""
echo "  pm2 list                      # Liste des applications"
echo "  pm2 logs $PM2_APP_NAME        # Voir les logs"
echo "  pm2 restart $PM2_APP_NAME     # Redémarrer"
echo "  pm2 stop $PM2_APP_NAME        # Arrêter"
echo "  pm2 delete $PM2_APP_NAME      # Supprimer"
echo "  pm2 monit                     # Monitoring en temps réel"
echo ""
echo ""
echo -e "${GREEN}✅ Préparation terminée !${NC}"
echo ""
echo "📁 Dossier de l'application: $APP_DIR"
echo "🌐 Domaine: https://$DOMAIN"
echo "🔌 Port PM2: $PORT"
echo ""
