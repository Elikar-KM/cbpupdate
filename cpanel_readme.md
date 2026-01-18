# Déploiement sur cPanel

## Fichiers à uploader

Uploadez tout le contenu de ce dossier dans votre répertoire d'application sur cPanel.

## Étapes suivantes sur cPanel:

1. **Créer l'application Node.js**
   - Allez dans "Setup Node.js App"
   - Node.js version: 18.x ou supérieur
   - Application mode: Production
   - Application startup file: server.js

2. **Configurer les variables d'environnement**
   - Copiez les variables de .env.production dans l'interface cPanel

3. **Installer les dépendances**

   ```bash
   npm install --production
   ```

4. **Exécuter les migrations Prisma**

   ```bash
   npx prisma migrate deploy
   ```

5. **Démarrer l'application**
   L'application démarrera automatiquement via cPanel

## Structure des fichiers:

- server.js - Serveur Node.js personnalisé
- .next/ - Application Next.js compilée
- public/ - Ressources statiques
- package.json - Dépendances
- .env.production - Variables d'environnement

Pour plus d'informations, consultez deployment_guide_cpanel.md
