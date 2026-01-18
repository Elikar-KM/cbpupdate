# 🚀 Déploiement cPanel - CBP Community

Ce projet est maintenant configuré pour être déployé sur un hébergement cPanel avec support Node.js.

## 📋 Fichiers de déploiement créés

- ✅ `server.js` - Serveur Node.js personnalisé
- ✅ `deploy-cpanel.ps1` - Script de déploiement automatisé
- ✅ `.env.production.template` - Template des variables d'environnement
- ✅ `.htaccess.template` - Configuration Apache
- ✅ `next.config.ts` - Modifié avec `output: 'standalone'`
- ✅ `package.json` - Ajout du script `build:cpanel`

## 🎯 Démarrage rapide

### 1. Configurer l'environnement de production

```powershell
# Copier le template
Copy-Item .env.production.template .env.production

# Éditer avec vos vraies valeurs
notepad .env.production
```

**Variables à configurer** :

- `DATABASE_URL` : Connexion MySQL de votre cPanel
- `NEXTAUTH_URL` : URL de votre domaine
- `NEXTAUTH_SECRET` : Générez avec https://generate-secret.vercel.app/32
- `NEXT_PUBLIC_API_URL` : URL de votre API

### 2. Compiler le projet

```powershell
pnpm run build:cpanel
```

Cette commande va :

- Nettoyer les anciens builds
- Installer les dépendances
- Générer Prisma
- Compiler le projet Next.js
- Créer le dossier `cpanel-deploy/`
- Créer une archive ZIP prête à uploader

### 3. Uploader sur cPanel

1. Connectez-vous à votre cPanel
2. Ouvrez File Manager
3. Uploadez l'archive ZIP créée (`cbp-production-*.zip`)
4. Extrayez dans le dossier de votre application

### 4. Configurer dans cPanel

1. **Setup Node.js App** → Create Application
   - Node.js version : 18.x ou supérieur
   - Application startup file : `server.js`
   - Application mode : Production

2. **Ajouter les variables d'environnement**
   - Copiez toutes les variables de `.env.production`

3. **Installer les dépendances**
   - Cliquez sur "Run NPM Install"

4. **Démarrer l'application**
   - L'application démarrera automatiquement

### 5. Configuration finale

1. Créez `.htaccess` (copiez `.htaccess.template`)
2. Remplacez `PORT` par le port assigné par cPanel
3. Exécutez les migrations : `npx prisma migrate deploy`
4. Activez SSL (Let's Encrypt dans cPanel)

## 📚 Documentation complète

Pour des instructions détaillées, consultez :

- **Guide de démarrage rapide** : Voir les artifacts
- **Guide de déploiement complet** : Voir les artifacts
- **Récapitulatif des fichiers** : Voir les artifacts

## 🔧 Commandes utiles

```powershell
# Développement local
pnpm dev

# Build standard
pnpm build

# Build pour cPanel (avec préparation complète)
pnpm run build:cpanel

# Nettoyer
pnpm clean
```

## ⚠️ Important

- Ne commitez JAMAIS `.env.production` dans Git
- Gardez votre `NEXTAUTH_SECRET` sécurisé
- Testez toujours en local avant de déployer
- Sauvegardez votre base de données régulièrement

## 🆘 Dépannage

### L'application ne démarre pas

- Vérifiez les logs dans cPanel → Setup Node.js App
- Vérifiez que toutes les variables d'environnement sont définies
- Redémarrez l'application

### Erreur 502

- Vérifiez que le PORT dans `.htaccess` correspond au port cPanel
- Vérifiez que l'application est "Running"

### Erreur de base de données

- Vérifiez `DATABASE_URL`
- Exécutez `npx prisma migrate deploy`

## 📞 Support

Consultez les guides de déploiement dans les artifacts pour plus d'aide.

---

**Prêt à déployer ! 🎉**
