# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

## Installation du projet

### 1. Vérifier que Node.js est installés et installer le projet

1. **Vérifier l'installation de Node.js**:

- Assurez-vous que **Node.js** est installé sur votre système. Vous pouvez le télécharger depuis : [https://nodejs.org/].
- Après l'installation, vérifiez que Node.js est disponible en exécutant la commande suivante dans un terminal :
  ```bash
  node -v
  ```

2. **Installer le projet**:

- installer le dossier qui contient le projet via ce lien: [...].

### 2. Vérifier que IIS est installer

1. **Ouvrir le Gestionnaire de fonctionnalités Windows** :

   - Appuyez sur les touches **Windows + R** pour ouvrir la boîte de dialogue **Exécuter**.
   - Tapez `optionalfeatures` et appuyez sur **Entrée**.

2. **Rechercher IIS** :

   - Dans la fenêtre **Fonctionnalités Windows**, recherchez l'option **Internet Information Services**.
   - Assurez-vous que la case est cochée. Si ce n'est pas le cas, cochez-la et cliquez sur **OK**.

3. **Installer IIS (si nécessaire)** :

   - Si IIS n'est pas installé, Windows procédera à l'installation. Une fois terminé, redémarrez votre ordinateur si demandé.

4. **Vérifier que IIS est actif** :

   - Ouvrez un navigateur web et tapez `http://localhost`.
   - Si IIS est correctement installé, vous verrez une page par défaut indiquant qu'IIS fonctionne.

5. **Installer les modules IIS complémentaires** :

   - **IIS URL Rewrite** :  
     Téléchargez et installez le module [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) pour gérer le routage côté client (SPA React).
   - **IISNode** :  
     Téléchargez et installez [iisnode](https://github.com/Azure/iisnode) si vous souhaitez héberger une application Node.js sous IIS.

   > Ces modules sont nécessaires pour le bon fonctionnement du routage React (Rewrite) et pour exécuter le backend Node.js directement sous IIS (IISNode).

### 3. Préparation de l'environnement de développement

1. **Installer Visual Studio Code (VS Code)**

   - Téléchargez et installez VS Code depuis [https://code.visualstudio.com/](https://code.visualstudio.com/).
   - Pour ouvrir le dossier du projet dans VS Code :
     - Lancez VS Code.
     - Cliquez sur **Fichier > Ouvrir un dossier...** puis sélectionnez le dossier racine de votre projet (par exemple `TBD-app`).
     - Vous pouvez aussi faire un clic droit sur le dossier dans l’explorateur Windows et choisir **Ouvrir avec Code** si cette option est disponible.

2. **Créer un fichier `.env` à la racine du projet**

   Ce fichier permet de configurer les variables d'environnement utilisées par le front et le back.  
   Exemple de contenu pour `.env` :

   ```properties
   AUTHORIZED_ORIGINS=http://localhost:5173,http://10.102.2.24
   PORT=5000
   VITE_API_BASE_URL=http://10.102.2.24
   VITE_PORT=5000
   ```

   - `AUTHORIZED_ORIGINS` : liste des origines autorisées pour le backend (séparées par des virgules)
   - `PORT` : port utilisé par le backend Node.js
   - `VITE_API_BASE_URL` : URL utilisée par le backend Node.js, définie pour fonctionner avec Vite React (exemple : l'URL de l'API à laquelle le front va faire ses requêtes)
   - `VITE_PORT` : port utilisé par le backend Node.js, défini pour fonctionner avec Vite React (ce port doit correspondre à celui utilisé dans la configuration du backend)

3. **Installer les dépendances du projet**

   - Ouvrez un terminal dans le dossier du projet (clic droit > "Ouvrir dans le terminal" dans VS Code ou utilisez le terminal intégré).
   - Exécutez la commande suivante pour installer toutes les dépendances nécessaires :
     ```bash
     npm install
     ```

---

### 4. Build et déploiement de l'application

1. **Construire le projet pour la production**

   - Une fois les dépendances installées, lancez la commande suivante pour générer les fichiers de build dans le dossier `dist` :
     ```bash
     npm run build
     ```
   - Le dossier `dist` contiendra la version optimisée de votre application prête à être déployée sur IIS.

2. **Ajouter le fichier `web.config` dans le dossier `dist`**

   Après la création du dossier `dist`, ajoutez-y un fichier nommé `web.config` contenant :

   ```xml
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="React Routes" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/index.html" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

   Ce fichier permet à IIS de rediriger toutes les routes vers `index.html` pour le bon fonctionnement du routage côté client de React.

3. **Configurer les autorisations** :

   - Assurez-vous que le compte utilisateur IIS (par exemple, `IUSR`) a les autorisations de lecture sur le dossier du projet.
   - Faites un clic droit sur le dossier du projet, sélectionnez **Propriétés**, puis allez dans l'onglet **Sécurité** pour ajouter les autorisations.

4. **Redémarrer IIS** :

   - Après avoir configuré le site, redémarrez IIS pour appliquer les modifications :
     - Ouvrez un terminal en tant qu'administrateur et exécutez :
       ```bash
       iisreset
       ```

5. **Tester l'application** :
   - Ouvrez un navigateur web et accédez à l'URL configurée (par exemple : `http://0.0.0.0:PORT` ou `http://localhost:80`).
   - Votre application React devrait s'afficher.
