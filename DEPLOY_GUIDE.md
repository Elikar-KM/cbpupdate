# Déploiement cPanel - Guide Complet

L'archive de déploiement a été générée avec succès.

## 📂 Fichiers Générés

- **Archive de déploiement** : [`cbp-production.zip`](file:///e:/DEVPROJECTS/CBPUPDATE/cbp-production.zip)
- **Dossier source** : [`cpanel-deploy/`](file:///e:/DEVPROJECTS/CBPUPDATE/cpanel-deploy/)

## 🚀 Instructions de Mise en Ligne

1.  **Connectez-vous à votre cPanel**.
2.  Allez dans le **Gestionnaire de fichiers** (File Manager).
3.  Naviguez vers le dossier racine de votre application (ex: `public_html` ou un sous-domaine).
4.  **Uploadez** le fichier `cbp-production.zip`.
5.  **Extrayez** l'archive (clic droit -> Extract).

## ⚙️ Configuration Node.js (cPanel)

1.  Allez dans **Setup Node.js App**.
2.  Créez ou modifiez votre application :
    - **Version Node.js** : 18.x ou 20.x
    - **Application Mode** : Production
    - **Application Startup File** : `server.js`
3.  Cliquez sur **Save**.

## 🔧 Installation des Dépendances

1.  Dans la page de configuration Node.js, faites défiler vers le bas.
2.  Cliquez sur le bouton **Run NPM Install**.
3.  Attendez que l'installation soit terminée (vert).

## 🗄️ Base de Données

1.  Assurez-vous que votre base de données MySQL est créée.
2.  Si ce n'est pas fait, lancez la migration via le terminal cPanel (ou via SSH) :

    ```bash
    # Entrez dans l'environnement virtuel (commande donnée en haut de la page Node.js)
    source /home/user/nodevenv/.../bin/activate

    # Lancez la migration
    npx prisma migrate deploy
    ```

## ✅ Vérification

Accédez à votre URL (https://app2.cbpcommunity.com). L'application devrait être en ligne.

> [!NOTE]
> Si vous rencontrez une erreur 502, attendez quelques secondes que le serveur redémarre, ou vérifiez les logs dans l'interface cPanel.
