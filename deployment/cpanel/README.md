# 📦 Package de Déploiement cPanel - cbpcommunity.com

## 📁 Fichiers créés

Tous les fichiers de déploiement sont dans `e:\DEVPROJECTS\CBPUPDATE\deployment\cpanel\`

### Scripts Shell

| Fichier               | Description                      | Usage                                     |
| --------------------- | -------------------------------- | ----------------------------------------- |
| **setup-nodejs.sh**   | Installation Node.js 20.x et PM2 | `bash setup-nodejs.sh` (en tant que root) |
| **deploy-nextjs.sh**  | Guide de déploiement Next.js     | Contient les instructions détaillées      |
| **deploy-laravel.sh** | Guide de déploiement Laravel     | Contient les instructions détaillées      |

### Configurations

| Fichier                   | Description                | Destination                                              |
| ------------------------- | -------------------------- | -------------------------------------------------------- |
| **ecosystem.config.json** | Configuration PM2          | `/home/cbpcommunity/nodejs/cbp-frontend/`                |
| **htaccess-nextjs.conf**  | Apache config pour Next.js | `/home/cbpcommunity/public_html/.htaccess`               |
| **htaccess-laravel.conf** | Apache config pour Laravel | `/home/cbpcommunity/public_html/api/public/.htaccess`    |
| **env-nextjs.template**   | Variables d'env Next.js    | `/home/cbpcommunity/nodejs/cbp-frontend/.env.production` |
| **env-laravel.template**  | Variables d'env Laravel    | `/home/cbpcommunity/public_html/api/.env`                |

### Documentation

| Fichier                        | Description                    |
| ------------------------------ | ------------------------------ |
| **cpanel_deployment_guide.md** | Guide complet de déploiement   |
| **quick_deploy_cpanel.md**     | Guide de démarrage rapide (1h) |
| **README.md**                  | Ce fichier                     |

---

## 🚀 Démarrage Rapide

### 1. Préparation (5 min)

```powershell
# Sur votre machine Windows
cd e:\DEVPROJECTS\CBPUPDATE

# Configurer les variables d'environnement
Copy-Item .env.production.template .env.production
notepad .env.production
```

### 2. Compiler le frontend (5 min)

```powershell
pnpm run build:cpanel
```

### 3. Installer Node.js sur le serveur (5 min)

```powershell
# Transférer le script
scp deployment\cpanel\setup-nodejs.sh root@votre-serveur.com:~/
```

```bash
# Sur le serveur
chmod +x ~/setup-nodejs.sh
bash ~/setup-nodejs.sh
```

### 4. Suivre le guide

Consultez le [Guide de Démarrage Rapide](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/quick_deploy_cpanel.md) pour les étapes complètes.

---

## 🌐 Architecture

```
cbpcommunity.com (VPS cPanel/CloudLinux)
│
├── Apache (reverse proxy)
│   ├── :80/:443 → cbpcommunity.com
│   └── :80/:443 → api.cbpcommunity.com
│
├── PM2
│   └── Next.js SSR :3000
│
├── PHP-FPM
│   └── Laravel API
│
└── MySQL
    └── cbpcommunity_db
```

---

## 📋 Checklist de Déploiement

### Avant de commencer

- [ ] Accès root SSH au VPS
- [ ] cPanel installé et accessible
- [ ] Domaine `cbpcommunity.com` pointant vers le serveur
- [ ] Fichiers de déploiement prêts

### Phase 1 : Serveur

- [ ] Domaines créés dans cPanel
- [ ] Base de données MySQL créée
- [ ] Node.js et PM2 installés

### Phase 2 : Frontend

- [ ] `.env.production` configuré
- [ ] Build compilé (`pnpm run build:cpanel`)
- [ ] Archive transférée sur le serveur
- [ ] Dépendances installées
- [ ] Migrations Prisma exécutées
- [ ] PM2 démarré
- [ ] `.htaccess` configuré

### Phase 3 : Backend

- [ ] Archive Laravel transférée
- [ ] Dépendances Composer installées
- [ ] `.env` configuré
- [ ] Migrations exécutées
- [ ] Cache optimisé
- [ ] `.htaccess` configuré

### Phase 4 : SSL

- [ ] SSL activé pour `cbpcommunity.com`
- [ ] SSL activé pour `api.cbpcommunity.com`

### Phase 5 : Tests

- [ ] Frontend accessible
- [ ] Backend API répond
- [ ] Authentification fonctionne
- [ ] Pas d'erreurs dans les logs

---

## 🔧 Commandes Utiles

### PM2

```bash
pm2 list                    # Liste des applications
pm2 logs cbp-nextjs         # Voir les logs
pm2 restart cbp-nextjs      # Redémarrer
pm2 monit                   # Monitoring
```

### Laravel

```bash
php artisan cache:clear     # Nettoyer le cache
php artisan config:cache    # Cache la config
tail -f storage/logs/laravel.log  # Logs
```

### Apache

```bash
systemctl restart httpd     # Redémarrer Apache
tail -f /var/log/httpd/error_log  # Logs d'erreur
```

---

## 📞 Support

### Problèmes courants

**Next.js ne démarre pas**

```bash
pm2 logs cbp-nextjs
pm2 restart cbp-nextjs
```

**Erreur 502**

- Vérifier que PM2 tourne : `pm2 list`
- Vérifier le port : `curl http://localhost:3000`
- Vérifier `.htaccess`

**Erreur CORS**

- Vérifier `config/cors.php` dans Laravel
- Vérifier les headers dans `.htaccess`

---

## 📚 Documentation

- [Guide Complet](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/cpanel_deployment_guide.md) - Toutes les étapes détaillées
- [Guide Rapide](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/quick_deploy_cpanel.md) - Déploiement en 1 heure

---

## ✅ Prêt à Déployer !

Vous avez maintenant tous les fichiers et scripts nécessaires pour déployer **cbpcommunity.com** sur votre VPS cPanel.

**Prochaine étape** : Consultez le [Guide de Démarrage Rapide](file:///C:/Users/Arambee/.gemini/antigravity/brain/3760d8e2-7508-451f-8f71-104c79dc9ae0/quick_deploy_cpanel.md) ! 🚀
