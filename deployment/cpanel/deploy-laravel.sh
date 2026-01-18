#!/bin/bash
# Script de déploiement Laravel pour cPanel
# Domaine: api.cbpcommunity.com

set -e

# Configuration
DOMAIN="apiv2.cbpcommunity.com"
APP_DIR="/home/cbpcommunity/public_html/api"
DB_NAME="cbpcommunity_db"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Déploiement de Laravel pour $DOMAIN${NC}"
echo "=============================================="

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
echo "1️⃣  Créez une base de données MySQL dans cPanel:"
echo "   - Nom: $DB_NAME"
echo "   - Utilisateur: cbpcommunity_user"
echo "   - Notez le mot de passe"
echo ""
echo "2️⃣  Créez un sous-domaine dans cPanel:"
echo "   - Sous-domaine: api"
echo "   - Document Root: $APP_DIR/public"
echo ""
echo "3️⃣  Sur votre machine locale, compressez le backend:"
echo -e "${YELLOW}   cd e:\\DEVPROJECTS\\CBPUPDATE\\api${NC}"
echo -e "${YELLOW}   tar -czf laravel-backend.tar.gz --exclude=node_modules --exclude=vendor --exclude=.git .${NC}"
echo ""
echo "4️⃣  Transférez l'archive vers le serveur:"
echo -e "${YELLOW}   scp laravel-backend.tar.gz root@votre-serveur:$APP_DIR/${NC}"
echo ""
echo "5️⃣  Connectez-vous en SSH et extrayez:"
echo -e "${YELLOW}   cd $APP_DIR${NC}"
echo -e "${YELLOW}   tar -xzf laravel-backend.tar.gz${NC}"
echo -e "${YELLOW}   rm laravel-backend.tar.gz${NC}"
echo ""
echo "6️⃣  Configurez les permissions:"
echo -e "${YELLOW}   chmod -R 755 $APP_DIR${NC}"
echo -e "${YELLOW}   chmod -R 775 $APP_DIR/storage${NC}"
echo -e "${YELLOW}   chmod -R 775 $APP_DIR/bootstrap/cache${NC}"
echo ""
echo "7️⃣  Installez les dépendances Composer:"
echo -e "${YELLOW}   cd $APP_DIR${NC}"
echo -e "${YELLOW}   composer install --optimize-autoloader --no-dev${NC}"
echo ""
echo "8️⃣  Configurez le fichier .env:"
echo -e "${YELLOW}   cp .env.example .env${NC}"
echo -e "${YELLOW}   nano .env${NC}"
echo ""
echo "   Variables à configurer:"
echo "   APP_NAME=\"CBP Community\""
echo "   APP_ENV=production"
echo "   APP_DEBUG=false"
echo "   APP_URL=https://$DOMAIN"
echo ""
echo "   DB_CONNECTION=mysql"
echo "   DB_HOST=localhost"
echo "   DB_PORT=3306"
echo "   DB_DATABASE=$DB_NAME"
echo "   DB_USERNAME=cbpcommunity_user"
echo "   DB_PASSWORD=votre_mot_de_passe"
echo ""
echo "   JWT_SECRET=votre_jwt_secret"
echo ""
echo "9️⃣  Générez la clé d'application:"
echo -e "${YELLOW}   php artisan key:generate${NC}"
echo ""
echo "🔟 Exécutez les migrations:"
echo -e "${YELLOW}   php artisan migrate --force${NC}"
echo ""
echo "1️⃣1️⃣  Optimisez Laravel pour la production:"
echo -e "${YELLOW}   php artisan config:cache${NC}"
echo -e "${YELLOW}   php artisan route:cache${NC}"
echo -e "${YELLOW}   php artisan view:cache${NC}"
echo ""
echo "1️⃣2️⃣  Créez le fichier .htaccess dans $APP_DIR/public:"
echo ""
cat << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF
echo ""
echo ""
echo -e "${BLUE}🔐 CONFIGURATION SSL${NC}"
echo "=============================================="
echo ""
echo "Dans cPanel:"
echo "1. Allez dans 'SSL/TLS Status'"
echo "2. Activez AutoSSL pour $DOMAIN"
echo ""
echo ""
echo -e "${BLUE}🔧 CONFIGURATION CORS (Important!)${NC}"
echo "=============================================="
echo ""
echo "Ajoutez dans config/cors.php:"
echo ""
cat << 'EOF'
'allowed_origins' => [
    'https://cbpcommunity.com',
    'http://localhost:3000',
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
EOF
echo ""
echo ""
echo -e "${BLUE}📊 VÉRIFICATION${NC}"
echo "=============================================="
echo ""
echo "Testez l'API:"
echo -e "${YELLOW}   curl https://$DOMAIN/api/health${NC}"
echo ""
echo ""
echo -e "${GREEN}✅ Instructions de déploiement affichées !${NC}"
echo ""
echo "📁 Dossier de l'application: $APP_DIR"
echo "🌐 Domaine: https://$DOMAIN"
echo "🗄️  Base de données: $DB_NAME"
echo ""
