# Multiplication Sprint

Jeu web mobile-first de multiplication avec niveaux, chrono, bonus, score, meilleur score local et installation PWA.

## Fichiers

- `index.html` : structure des écrans et chargement de GSAP via CDN
- `style.css` : thème visuel, responsive design, animations CSS légères
- `script.js` : logique du jeu, timer, score, bonus, stockage local, PWA
- `manifest.webmanifest` : configuration d'installation sur mobile
- `sw.js` : cache simple pour fonctionnement plus fluide

## Lancer en local

Comme le projet enregistre un service worker, il vaut mieux utiliser un petit serveur local au lieu d'ouvrir directement le fichier HTML.

### Option 1 : avec VS Code

Utilise l'extension Live Server puis ouvre `index.html`.

### Option 2 : avec Node.js

```bash
npx serve .
```

Puis ouvre l'URL affichée dans le navigateur.

## Déploiement sur GitHub + Render

### GitHub

1. Crée un nouveau dépôt GitHub.
2. Ajoute tous les fichiers du projet.
3. Push sur la branche principale.

### Render

1. Crée un service `Static Site`.
2. Connecte ton dépôt GitHub.
3. Configure :

```txt
Build Command:

Publish Directory: .
```

4. Déploie.

## Déploiement alternatif sur GitHub Pages

1. Push le projet sur GitHub.
2. Va dans `Settings > Pages`.
3. Choisis la branche principale et le dossier `/root`.
4. Sauvegarde.

## Installation sur mobile

- Ouvre l'URL Render ou GitHub Pages depuis Chrome ou Safari mobile.
- Utilise `Ajouter à l'écran d'accueil` ou le bouton `Installer` quand il apparaît.
- L'application s'installe comme une PWA.

## Fonctionnalités incluses

- 10 niveaux de difficulté
- 10 questions par niveau
- chrono animé par question
- bonus tous les 3 succès consécutifs
- score basé sur vitesse et progression
- meilleur score via `localStorage`
- écran de fin et écran de victoire
- animations GSAP
- effets visuels allégés sur mobile et si `prefers-reduced-motion` est activé

## Accessibilité

- champs et boutons utilisables au clavier
- labels et régions ARIA
- prise en compte de `prefers-reduced-motion`

## Remarque

Le bouton d'installation apparaît seulement si le navigateur déclenche l'événement PWA `beforeinstallprompt`.
