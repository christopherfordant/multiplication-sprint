# Multiplication Sprint

Jeu web mobile-first de multiplication avec niveaux, chrono, bonus, score, meilleur score local et installation PWA.

## V2 incluse

- reponses a choix multiples avec 5 boutons
- ecran intermediaire a la fin de chaque niveau
- validation du passage selon le score du niveau
- mode `enfant` et mode `expert`
- ecran de chargement anime
- sons Web Audio plus dynamiques
- animations GSAP plus riches

## V3 incluse

- mascotte animee qui accompagne la partie
- etoiles gagnees a la fin de chaque niveau
- lecture vocale de la multiplication avec `speechSynthesis`
- bouton pour relire la question
- mode `2 joueurs local` avec alternance des tours et scores separes

## Fichiers

- `index.html` : structure des écrans et chargement de GSAP via CDN
- `style.css` : thème visuel, responsive design, animations CSS légères
- `script.js` : logique du jeu, timer, score, bonus, modes, checkpoints, stockage local, PWA
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

- 10 niveaux de difficulte
- 10 questions par niveau
- 5 reponses cliquables par question
- chrono anime par question
- bonus tous les 3 succes consecutifs
- score base sur vitesse et progression
- validation de niveau selon un seuil de score
- meilleur score via `localStorage`
- ecran de chargement, checkpoint, fin et victoire
- mode enfant et mode expert
- animations GSAP
- effets visuels alleges sur mobile et si `prefers-reduced-motion` est active

## Accessibilité

- champs et boutons utilisables au clavier
- labels et régions ARIA
- prise en compte de `prefers-reduced-motion`

## Remarque

Le bouton d'installation apparaît seulement si le navigateur déclenche l'événement PWA `beforeinstallprompt`.
