# 📝 Aide-mémoire - Déploiement cPanel

## 🚀 Commandes essentielles

### Sur votre machine locale (Windows)

```powershell
# 1. Créer le fichier de configuration de production
Copy-Item .env.production.template .env.production

# 2. Éditer le fichier (remplacer par vos vraies valeurs)
notepad .env.production

# 3. Compiler et préparer le déploiement (COMMANDE PRINCIPALE)
pnpm run build:cpanel

# Alternative : build standard Next.js
pnpm build

# Nettoyer les builds
pnpm clean

# Développement local
pnpm dev
```

### Sur le serveur cPanel (via SSH ou Terminal)

```bash
# Naviguer vers le dossier de l'application
cd ~/public_html/app

# Installer les dépendances de production uniquement
npm install --production

# Exécuter les migrations Prisma
npx prisma migrate deploy

# Vérifier le statut de Prisma
npx prisma db pull

# Générer le client Prisma (si nécessaire)
npx prisma generate

# Voir les logs de l'application
tail -f ~/nodevenv/public_html/app/18/logs/passenger.log

# Vérifier les permissions
chmod -R 755 ~/public_html/app
chmod -R 644 ~/public_html/app/.env.production
```

## 🔐 Générer un secret NextAuth

### En ligne (recommandé)

Visitez : https://generate-secret.vercel.app/32

### Via OpenSSL (si disponible)

```bash
openssl rand -base64 32
```

### Via Node.js

```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📋 Variables d'environnement essentielles

```env
# Base de données (MySQL sur cPanel)
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth (obligatoire)
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="VOTRE_SECRET_GENERE_ICI"

# API
NEXT_PUBLIC_API_URL="https://votre-domaine.com/api"

# Base path (vide si racine)
BASEPATH=""

# Environnement
NODE_ENV="production"
```

## 🌐 Configuration .htaccess

```apache
RewriteEngine On

# Remplacez PORT par le port assigné par cPanel (ex: 3000)
RewriteRule ^$ http://127.0.0.1:PORT/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:PORT/$1 [P,L]
```

## 🔧 Configuration cPanel - Setup Node.js App

| Paramètre                    | Valeur                           |
| ---------------------------- | -------------------------------- |
| **Node.js version**          | 18.x ou 20.x                     |
| **Application mode**         | Production                       |
| **Application root**         | `/home/username/public_html/app` |
| **Application URL**          | `votre-domaine.com`              |
| **Application startup file** | `server.js`                      |

## 🐛 Dépannage rapide

### L'application ne démarre pas

```bash
# Vérifier les logs
cat ~/nodevenv/public_html/app/18/logs/passenger.log

# Redémarrer via cPanel
# cPanel → Setup Node.js App → Restart

# Vérifier les variables d'environnement
printenv | grep -E 'DATABASE_URL|NEXTAUTH'
```

### Erreur 502 Bad Gateway

```bash
# 1. Vérifier que l'app est "Running" dans cPanel
# 2. Vérifier le PORT dans .htaccess
# 3. Redémarrer Apache (si accès root)
sudo systemctl restart httpd
```

### Erreur de base de données

```bash
# Tester la connexion
npx prisma db pull

# Réinitialiser et migrer
npx prisma migrate reset
npx prisma migrate deploy
```

### Images ne se chargent pas

```bash
# Vérifier les permissions
chmod -R 755 ~/public_html/app/public
```

## 📦 Structure après déploiement

```
~/public_html/app/
├── .next/
│   ├── static/              # Assets statiques
│   └── standalone/          # Application compilée
├── public/                  # Ressources publiques
├── node_modules/            # Dépendances
├── server.js                # Serveur Node.js
├── package.json             # Configuration npm
├── .env.production          # Variables d'environnement
└── .htaccess                # Configuration Apache
```

## ✅ Checklist de déploiement

### Avant le build

- [ ] `.env.production` créé et configuré
- [ ] `DATABASE_URL` correcte
- [ ] `NEXTAUTH_SECRET` généré
- [ ] Base de données créée sur cPanel

### Pendant le build

- [ ] `pnpm run build:cpanel` exécuté sans erreur
- [ ] Archive ZIP créée
- [ ] Taille de l'archive raisonnable (< 500MB)

### Sur cPanel

- [ ] Fichiers uploadés et extraits
- [ ] Application Node.js créée
- [ ] Variables d'environnement ajoutées
- [ ] `npm install --production` exécuté
- [ ] `npx prisma migrate deploy` exécuté
- [ ] Application démarrée (statut "Running")

### Configuration finale

- [ ] `.htaccess` créé avec le bon PORT
- [ ] SSL/HTTPS activé
- [ ] Application accessible via le domaine
- [ ] Connexion fonctionne
- [ ] API routes fonctionnent
- [ ] Images se chargent

## 🔄 Mise à jour de l'application

```powershell
# 1. Sur votre machine locale
pnpm run build:cpanel

# 2. Uploader la nouvelle archive sur cPanel

# 3. Sur le serveur (via SSH)
cd ~/public_html/app

# 4. Sauvegarder .env.production
cp .env.production .env.production.backup

# 5. Extraire la nouvelle archive (écrase les fichiers)

# 6. Restaurer .env.production si nécessaire
cp .env.production.backup .env.production

# 7. Exécuter les migrations si changements de schéma
npx prisma migrate deploy

# 8. Redémarrer l'application
# cPanel → Setup Node.js App → Restart
```

## 📞 Informations importantes

### Ports cPanel typiques

- Application 1 : 3000
- Application 2 : 3001
- Application 3 : 3002
- etc.

### Chemins cPanel typiques

- Home : `/home/username/`
- Public HTML : `/home/username/public_html/`
- Node.js env : `/home/username/nodevenv/`
- Logs : `~/nodevenv/public_html/app/18/logs/`

### Fichiers à ne JAMAIS commiter

- `.env.production`
- `.env.local`
- `node_modules/`
- `.next/`
- `cpanel-deploy/`
- `*.zip` (archives de production)

## 🎯 Commande unique pour tout faire

```powershell
# Cette commande fait TOUT automatiquement !
pnpm run build:cpanel
```

Résultat :

- ✅ Vérifie `.env.production`
- ✅ Nettoie les anciens builds
- ✅ Installe les dépendances
- ✅ Génère Prisma
- ✅ Compile Next.js
- ✅ Crée `cpanel-deploy/`
- ✅ Crée l'archive ZIP
- ✅ Affiche les prochaines étapes

## 📚 Documentation complète

- [Guide de démarrage rapide](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/quick_start_cpanel.md)
- [Guide de déploiement complet](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/deployment_guide_cpanel.md)
- [Workflow visuel](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/deployment_workflow.md)
- [Récapitulatif des fichiers](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/files_summary.md)

---

**Gardez ce fichier à portée de main pour vos déploiements ! 📌**
