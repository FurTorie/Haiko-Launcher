<p align="center"><img src="../src/assets/images/icon.png" alt="icon-launcher" width="128"></p>

<h1 align="center">Haiko-Launcher</h1>

<p align="center">
  <strong>Lanceur Minecraft officiel pour le serveur Haiko</strong><br>
  Basé sur Electron avec authentification Microsoft et support multi-versions
</p>

<p align="center">
  <img src="https://img.shields.io/github/release/FurTorie/Haiko-Launcher.svg" alt="Release">
  <img src="https://img.shields.io/github/downloads/FurTorie/Haiko-Launcher/total.svg" alt="Downloads">
  <img src="https://img.shields.io/github/license/FurTorie/Haiko-Launcher.svg" alt="License">
</p>

## ✨ Nouveautés v1.10.7

### 🎨 Système de Background URL Configurable
- **Configuration centralisée** - URL de background par défaut maintenant dans `package.json`
- **Mode défaut intelligent** - Les administrateurs peuvent changer l'URL et elle se met à jour automatiquement
- **Interface repensée** - Mode défaut avec champ vide, transition automatique vers mode personnalisé
- **Persistance améliorée** - Le mode défaut reste vraiment "défaut" même après redémarrage

### 🔧 Système d'Instance Configurable (v1.10.4-1.10.6)
- **Instance d'accueil toggleable** - Activable/désactivable via configuration
- **Instance par défaut personnalisable** - Fallback configurable quand l'accueil est désactivé
- **Gestion intelligente des whitelists** - Sécurité maintenue dans tous les scénarios
- **News filtrées par instance** - Affichage automatique des actualités selon l'instance sélectionnée
- **Synchronisation parfaite** - Bouton, statut serveur et news toujours cohérents

## 🚀 Fonctionnalités

### 🔐 Authentification
- **Authentification Microsoft** - Connexion sécurisée avec votre compte Microsoft/Mojang
- **Gestion multi-comptes** - Basculez facilement entre plusieurs comptes
- **Sauvegarde locale** - Vos comptes sont stockés localement en sécurité

### 🎮 Support Multi-Versions
- **Minecraft Vanilla** - Toutes les versions officielles
- **Forge** - Support complet des mods Forge
- **NeoForge** - Dernière version du loader NeoForge
- **Fabric** - Mods légers et performants
- **Quilt** - Alternative moderne à Fabric

### 🚀 Fonctionnalités Avancées
- **Installation automatique de Java** - Le launcher installe automatiquement la bonne version de Java
- **Mises à jour automatiques** - Restez toujours à jour sans intervention
- **Interface moderne** - Design épuré avec thèmes clair/sombre
- **Optimisé pour Haiko** - Configuration pré-établie pour le serveur Haiko

### 🎨 Interface
- **Thèmes dynamiques** - Mode clair et sombre avec fonds personnalisés
- **Background personnalisable** - Support des images (JPG, PNG, GIF, WEBP) et vidéos (MP4)
  - **Mode Défaut** - Utilise l'URL du `package.json`, se met à jour automatiquement
  - **Mode Personnalisé** - URL saisie par l'utilisateur, sauvegardée localement
- **Rendu des skins** - Visualisation 3D de votre skin Minecraft
- **Panneau de news intelligent** - Affichage automatique des actualités filtrées selon l'instance sélectionnée
- **Configuration avancée** - Paramètres détaillés pour optimiser votre expérience

## 📥 Installation

1. Téléchargez la dernière version depuis [Releases](https://github.com/FurTorie/Haiko-Launcher/releases)
2. Exécutez l'installateur pour votre plateforme :
   - **Windows** : `Haiko-Launcher-win-x64.exe`
   - **macOS** : `Haiko-Launcher-mac-universal.dmg`
   - **Linux** : `Haiko-Launcher-linux-x64.AppImage`
3. Connectez-vous avec votre compte Microsoft
4. Sélectionnez votre instance Minecraft et jouez !

## 🛠️ Développement

### Prérequis
- Node.js 16+
- npm ou yarn

### Installation
```bash
git clone https://github.com/FurTorie/Haiko-Launcher.git
cd Haiko-Launcher
npm install
```

### Commandes
```bash
# Démarrer en mode développement
npm start

# Mode développement avec rechargement automatique
npm run dev

# Construire pour la production
npm run build

# Générer les icônes
npm run icon
```

## 🏗️ Architecture

- **Frontend** : HTML/CSS/JavaScript avec interface moderne
- **Backend** : Electron avec Node.js
- **Base de données** : SQLite pour le stockage local
- **Authentification** : minecraft-java-core pour Microsoft Auth
- **Build** : Système de build personnalisé avec obfuscation JavaScript

### ⚙️ Configuration (`package.json`)

```json
{
  "launcherConfig": {
    "enableWelcomeInstance": true,
    "defaultInstance": null,
    "defaultBackgroundUrl": "https://example.com/background.mp4"
  }
}
```

**Options disponibles :**
- `enableWelcomeInstance` (boolean) - Activer/désactiver l'instance d'accueil "Accueil"
- `defaultInstance` (string|null) - Instance par défaut quand l'instance d'accueil est désactivée
- `defaultBackgroundUrl` (string) - URL du fond d'écran par défaut

> **Note** : Les modifications de `defaultBackgroundUrl` sont automatiquement visibles pour tous les utilisateurs en mode défaut au prochain démarrage.

> ⚠️ **Avertissement VS Code** : Pour une raison inconnue, VS Code ajoute automatiquement une dépendance avec le nom du launcher dans le `package.json` lors de l'édition, ce qui peut faire planter le build. Il est fortement recommandé d'utiliser **WindSurf, Sublime Text, éditeur de texte windows** ou un autre éditeur de code pour modifier ce fichier.

### 📰 Configuration des News (côté serveur)
Pour configurer le système de news filtrées par instance côté serveur web, consultez le [**Tutoriel News**](https://github.com/FurTorie/Haiko-Launcher/blob/master/docs/TUTO-NEWS.md).

## 📝 Crédits

Ce projet est un fork de [Selvania-Launcher](https://github.com/luuxis/Selvania-Launcher) par luuxis.

## 📄 Licence

Ce projet est sous licence Luuxis License v1.0. Voir le fichier [LICENSE](https://github.com/FurTorie/Haiko-Launcher/blob/master/LICENSE.md) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request

## 📋 Historique des versions

### v1.10.7 (Actuelle)
- 🎨 Système de Background URL configurable et centralisé
- 🔧 Mode défaut intelligent avec mise à jour automatique
- 🛠️ Interface repensée pour les backgrounds personnalisés

### v1.10.4 - v1.10.6
- 🎯 Système d'instances configurable et intelligent
- ⚙️ Instance d'accueil toggleable via configuration
- 📰 News filtrées automatiquement par instance sélectionnée
- 🔄 Gestion intelligente des whitelists et fallbacks
- 🔄 Synchronisation complète bouton/statut/news

### Versions antérieures
Consultez les [Releases](https://github.com/FurTorie/Haiko-Launcher/releases) pour l'historique complet.

## 📞 Support

Besoin d'aide ? Rejoignez notre communauté :
- [Issues GitHub](https://github.com/FurTorie/Haiko-Launcher/issues)
- [Releases](https://github.com/FurTorie/Haiko-Launcher/releases) pour les notes de version détaillées
- [Discord](https://discord.gg/WmCjbPw8sr) Haiko

---

<p align="center">Made with ❤️ for Haiko Community</p>
