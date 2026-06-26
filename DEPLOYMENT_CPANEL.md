# 🚀 Déploiement complet - CBP Community sur cPanel/VPS

Ce guide décrit le déploiement complet de l'application **CBP Community** (frontend Next.js + backend Laravel/API) sur un hébergement **cPanel avec support Node.js**.

---

## 📋 Table des matières

1. [Architecture et prérequis](#architecture-et-prérequis)
2. [Fichiers de déploiement](#fichiers-de-déploiement)
3. [Méthode 1 : déploiement automatique via GitHub Actions](#méthode-1--déploiement-automatique-via-github-actions)
4. [Méthode 2 : déploiement manuel via archive ZIP](#méthode-2--déploiement-manuel-via-archive-zip)
5. [Configuration cPanel après upload](#configuration-cpanel-après-upload)
6. [Configuration de l'API Laravel](#configuration-de-lapi-laravel)
7. [Vérification post-déploiement](#vérification-post-déploiement)
8. [Dépannage](#dépannage)
9. [Sécurité](#sécurité)
10. [Checklist finale](#checklist-finale)

---

## Architecture et prérequis

### Composants

- **Frontend** : Next.js 16 + React 19 + Prisma + NextAuth
- **Backend** : Laravel API (dossier `api/`)
- **Base de données** : MySQL (sur cPanel)
- **Serveur** : cPanel avec Node.js support

### Prérequis

- Accès cPanel avec **Setup Node.js App**
- Accès FTP (pour GitHub Actions ou upload manuel)
- Base de données MySQL créée sur cPanel
- Node.js local : 20.x (recommandé)
- Package manager : pnpm 10.x
- Git + compte GitHub

---

## Fichiers de déploiement

| Fichier | Description |
|---------|-------------|
| `server.js` | Serveur Node.js personnalisé pour cPanel |
| `deploy-cpanel.ps1` | Script PowerShell de build/package local |
| `.env.production.template` | Template des variables d'environnement |
| `.env.production` | **Fichier local** avec les vraies valeurs (non versionné) |
| `.htaccess.template` | Configuration Apache modèle |
| `next.config.ts` | Config Next.js avec `output: 'standalone'` |
| `.github/workflows/deploy.yml` | Workflow GitHub Actions de déploiement |
| `DEPLOY_GUIDE.md` | Guide rapide pour l'archive ZIP |
| `CHEATSHEET_CPANEL.md` | Aide-mémoire des commandes |

---

## Méthode 1 : déploiement automatique via GitHub Actions

### 1.1 Configurer les secrets GitHub

Rendez-vous sur : `https://github.com/Elikar-KM/CBPUPDATE/settings/secrets/actions`

Ajoutez les secrets suivants :

| Secret | Description | Exemple |
|--------|-------------|---------|
| `CPANEL_SERVER` | Serveur FTP cPanel | `ftp.app2.cbpcommunity.com` ou IP |
| `CPANEL_USERNAME` | Nom d'utilisateur cPanel/FTP | `cbpcommu` |
| `CPANEL_PASSWORD` | Mot de passe cPanel/FTP | `********` |
| `NEXT_PUBLIC_API_URL` | URL publique de l'API | `https://api2.cbpcommunity.com/api` |

### 1.2 Configurer l'environnement local

```powershell
# Copier le template
Copy-Item .env.production.template .env.production

# Éditer avec les vraies valeurs
notepad .env.production
```

Variables obligatoires dans `.env.production` :

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXTAUTH_URL="https://app2.cbpcommunity.com"
NEXTAUTH_SECRET="VOTRE_SECRET_32_CARACTERES"
NEXT_PUBLIC_API_URL="https://api2.cbpcommunity.com/api"
BASEPATH=""
NODE_ENV="production"
```

> **Important** : `.env.production` est dans `.gitignore` et ne doit **JAMAIS** être commité.

### 1.3 Pousser sur `main`

```powershell
git add .
git commit -m "Deploy update"
git push origin main
```

Le workflow `.github/workflows/deploy.yml` se déclenche automatiquement et :

1. Build le frontend Next.js avec pnpm 10 / Node 20
2. Génère Prisma
3. Déploie le frontend sur `/public_html/` via FTP
4. Déploie l'API Laravel sur `/api/` via FTP

Suivre le déploiement : https://github.com/Elikar-KM/CBPUPDATE/actions

### 1.4 Configuration du workflow

Le workflow actuel utilise :

- `pnpm/action-setup@v3` avec pnpm `10`
- `actions/setup-node@v4` avec Node `20` et cache `pnpm`
- `SamKirkland/FTP-Deploy-Action@v4.3.4` pour le sync FTP

Frontend exclu du sync FTP : `.git*`, `.env*`, `node_modules/*` (Next.js standalone inclut ses dépendances).
Backend exclu : `.git*`, `.env`, `vendor/*`, `storage/*.key`.

---

## Méthode 2 : déploiement manuel via archive ZIP

### 2.1 Build local

```powershell
pnpm run build:cpanel
```

Cette commande exécute `deploy-cpanel.ps1` et :

1. Nettoie `.next/` et `cpanel-deploy/`
2. Installe les dépendances
3. Génère Prisma
4. Compile Next.js en mode `standalone`
5. Copie les fichiers dans `cpanel-deploy/`
6. Crée une archive `cbp-production-YYYYMMDD-HHMMSS.zip`

### 2.2 Upload sur cPanel

1. Connectez-vous à cPanel
2. Ouvrez **File Manager**
3. Naviguez vers `public_html/` (ou le dossier de l'application)
4. Uploadez `cbp-production-*.zip`
5. Extrayez l'archive
6. Supprimez le fichier ZIP après extraction

### 2.3 Upload de l'API Laravel

Uploadez manuellement le dossier `api/` (sans `.env`, `vendor/`, `storage/*.key`) vers `/api/` sur le serveur.

---

## Configuration cPanel après upload

### 3.1 Créer l'application Node.js

1. Allez dans **Setup Node.js App**
2. Cliquez sur **Create Application**
3. Remplissez :

| Champ | Valeur |
|-------|--------|
| Node.js version | 20.x |
| Application mode | Production |
| Application root | `/home/username/public_html` (ou votre dossier) |
| Application URL | `https://app2.cbpcommunity.com` |
| Application startup file | `server.js` |

4. Cliquez sur **Save**

### 3.2 Configurer les variables d'environnement

Dans la page **Setup Node.js App**, ajoutez les variables suivantes :

```env
DATABASE_URL=mysql://username:password@localhost:3306/database_name
NEXTAUTH_URL=https://app2.cbpcommunity.com
NEXTAUTH_SECRET=VOTRE_SECRET_32_CARACTERES
NEXTPUBLIC_API_URL=https://api2.cbpcommunity.com/api
BASEPATH=
NODE_ENV=production
```

> Note : `NEXT_PUBLIC_` devient `NEXTPUBLIC_` dans l'interface cPanel (pas de underscore).

### 3.3 Créer le fichier `.htaccess`

Copiez `.htaccess.template` vers `.htaccess` à la racine de `public_html/`, puis remplacez `PORT` par le port attribué par cPanel.

Exemple si cPanel a attribué le port `3000` :

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

<IfModule mod_headers.c>
    Header set X-XSS-Protection "1; mode=block"
    Header always append X-Frame-Options SAMEORIGIN
    Header set X-Content-Type-Options nosniff
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

<FilesMatch "^(package\.json|package-lock\.json|pnpm-lock\.yaml|server\.js)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### 3.4 Démarrer l'application

1. Cliquez sur **Run NPM Install** dans cPanel
2. Attendez que l'installation soit terminée
3. Cliquez sur **Restart** si nécessaire
4. L'application devrait passer au statut **Running**

---

## Configuration de l'API Laravel

### 4.1 Prérequis sur le serveur

1. PHP 8.1+ activé sur le domaine/sous-domaine `api2.cbpcommunity.com`
2. Composer disponible (via SSH ou terminal cPanel)

### 4.2 Installation des dépendances

Via SSH ou terminal cPanel :

```bash
cd ~/public_html/api
composer install --no-dev --optimize-autoloader
```

### 4.3 Configuration de l'environnement

1. Copiez `api/.env.example` vers `api/.env`
2. Configurez la connexion MySQL
3. Générez la clé Laravel :

```bash
cd ~/public_html/api
php artisan key:generate
```

### 4.4 Migrations et storage

```bash
cd ~/public_html/api
php artisan migrate --force
php artisan storage:link
```

### 4.5 Permissions

```bash
chmod -R 755 ~/public_html/api
chmod -R 775 ~/public_html/api/storage
chmod -R 775 ~/public_html/api/bootstrap/cache
```

---

## Vérification post-déploiement

### Frontend

- Accédez à `https://app2.cbpcommunity.com`
- Vérifiez que la page de login s'affiche
- Testez la connexion

### Backend

- Accédez à `https://api2.cbpcommunity.com/api/health` ou un endpoint de test
- Vérifiez les logs Laravel dans `api/storage/logs/`

### Base de données

- Vérifiez que Prisma peut se connecter :

```bash
cd ~/public_html
npx prisma db pull
```

---

## Dépannage

### L'application ne démarre pas

1. Vérifiez les logs dans **Setup Node.js App** → `passenger.log`
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que le port dans `.htaccess` correspond au port cPanel
4. Redémarrez l'application

### Erreur 502 Bad Gateway

1. Vérifiez que l'application est **Running**
2. Vérifiez le port dans `.htaccess`
3. Vérifiez que le processus Node.js écoute bien sur `127.0.0.1:PORT`

### Erreur de base de données

1. Vérifiez `DATABASE_URL`
2. Exécutez `npx prisma migrate deploy`
3. Vérifiez que l'utilisateur MySQL a les droits sur la base

### Images et assets ne se chargent pas

```bash
chmod -R 755 ~/public_html/public
```

### Workflow GitHub Actions échoue

1. Vérifiez les secrets `CPANEL_SERVER`, `CPANEL_USERNAME`, `CPANEL_PASSWORD`
2. Vérifiez que le serveur FTP accepte les connexions
3. Vérifiez les logs sur https://github.com/Elikar-KM/CBPUPDATE/actions

---

## Sécurité

- Ne jamais commiter `.env.production`, `.env.local`, `.env`
- Ne jamais commiter d'archives de production (`*.zip`)
- Ne jamais exposer `NEXTAUTH_SECRET`
- Utiliser HTTPS en production (forcer la redirection dans `.htaccess`)
- Protéger les fichiers sensibles via `.htaccess`
- Limiter les permissions des fichiers (644 pour `.env`, 755 pour les dossiers)

### Fichiers ignorés par Git

```
.env
.env.local
.env.production
node_modules/
.next/
cpanel-deploy/
cbp-production*.zip
.htaccess
```

---

## Checklist finale

### Avant le build

- [ ] `.env.production` créé et configuré
- [ ] `DATABASE_URL` correcte
- [ ] `NEXTAUTH_SECRET` généré
- [ ] Base de données MySQL créée sur cPanel
- [ ] Secrets GitHub configurés (si déploiement auto)

### Pendant le build

- [ ] `pnpm run build:cpanel` exécuté sans erreur
- [ ] Archive ZIP créée
- [ ] Workflow GitHub Actions réussi (ou upload manuel)

### Sur cPanel

- [ ] Fichiers uploadés et extraits
- [ ] Application Node.js créée avec `server.js`
- [ ] Variables d'environnement ajoutées
- [ ] `npm install` exécuté
- [ ] `.htaccess` créé avec le bon port
- [ ] Application au statut **Running**

### API Laravel

- [ ] Fichiers API uploadés
- [ ] `composer install` exécuté
- [ ] `api/.env` configuré
- [ ] `php artisan migrate` exécuté
- [ ] Permissions correctes

### Vérification finale

- [ ] Site accessible via HTTPS
- [ ] Connexion fonctionne
- [ ] API répond correctement
- [ ] Base de données accessible
- [ ] SSL activé

---

## Liens utiles

- Workflow GitHub Actions : https://github.com/Elikar-KM/CBPUPDATE/actions
- CPanel File Manager : via votre hébergeur
- Guide rapide : `DEPLOY_GUIDE.md`
- Aide-mémoire : `CHEATSHEET_CPANEL.md`

---

**Prêt à déployer ! 🎉**
