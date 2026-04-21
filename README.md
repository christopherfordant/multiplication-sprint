# 🎮 Multiplication Sprint - Jeu de Multiplication Ludique

Un jeu web interactif et engageant pour maîtriser les multiplications avec niveaux, chrono, bonus, animations fluides et une carte du monde immersive.

## ✨ Caractéristiques principales

### 🎯 Gameplay
- **10 niveaux progressifs** avec multiplications de difficulté croissante
- **Mode Enfant** et **Mode Expert** avec difficultés différentes
- **Système de tempo** : 10-12 secondes par question (configurable par mode)
- **Bonus** : 3 bonnes réponses consécutives = +10 points et +2 secondes bonus
- **Système d'étoiles** : 1-3 étoiles par niveau selon la performance
- **Meilleur score** : Sauvegardé localement automatiquement

### 🌍 Expérience immersive
- **Carte du monde** avec 10 niveaux et un boss final au château
- **Mascotte animée** qui t'accompagne et commente ta progression
- **Profils enfants** : Crée et gère plusieurs profils avec statistiques
- **Badges à débloquer** : Récompenses pour les exploit (premiers pas, sans faute, expert, etc.)
- **Tableau de bord parent** : Suivi statistique des performances par enfant

### 🎨 Design et Animations
- **Thème ludique** : Couleurs vives (bleu océan, corail, soleil, herbe)
- **Polices fun** : Comic Neue et Fredoka pour une ambiance joyeuse
- **Animations GSAP fluides** : Questions qui apparaissent, boutons qui se déploient, étoiles qui scintillent
- **Effets visuels** : Particules de confettis, shake d'erreur, glow sur les éléments
- **Responsive design** : Optimisé pour desktop, tablette et mobile

### 🎮 Modes de jeu
- **Solo** : Jouer seul avec progression personnelle
- **Duo local** : 2 joueurs en alternance avec scores séparés
- **Lecture vocale** : La question peut être lue à voix haute en français
- **PWA** : Installation sur mobile pour une expérience app-like

## 🚀 Comment jouer

### Lancer le jeu

#### Option 1 : Serveur local (recommandé)
```bash
# Navigue dans le dossier
cd c:\Users\cashe\Documents\multiplication

# Lance un serveur Python
python -m http.server 8000 --bind 127.0.0.1

# Ouvre dans le navigateur
http://127.0.0.1:8000
```

#### Option 2 : Avec Node.js
```bash
# Installe http-server globalement
npm install -g http-server

# Lance le serveur
http-server

# Ouvre dans le navigateur (généralement http://localhost:8080)
```

### Configuration du profil
1. Entre le prénom du joueur
2. Choisis le mode (Enfant ou Expert)
3. Sélectionne le type de session (Solo ou Duo)
4. Active/désactive la lecture vocale
5. Clique sur "Commencer" ou ouvre la carte

### Pendant le jeu
- **Clique** sur la bonne réponse avant la fin du chronomètre
- **Le temps restant** apparaît dans la barre du haut
- **Chaque réponse correcte** gagne des points (plus vite = plus de points)
- **3 bonnes réponses** = Bonus de points et de temps
- **Nouveau niveau** après 10 questions réussies

### Fin de niveau
- Affichage du score du niveau et des étoiles gagnées
- Déblocage du niveau suivant si score suffisant
- Option pour retenter ou retourner à la carte

## 📊 Système de scoring

```
Score = (Temps restant × Points par seconde) + (Niveau × Multiplicateur)

Mode Enfant:
- Temps de base: 12 secondes
- Points par seconde: 8
- Multiplicateur par niveau: 5

Mode Expert:
- Temps de base: 9 secondes
- Points par seconde: 11
- Multiplicateur par niveau: 7
```

## 🏆 Badges à débloquer

- **Premier pas** : Valider un premier niveau
- **Chasseur d'étoiles** : Gagner 3 étoiles sur un niveau
- **Sans faute** : Finir un niveau à 100% de précision
- **Cerveau expert** : Valider un niveau en mode expert
- **Duel gagné** : Remporter une partie à 2 joueurs
- **Mega score** : Dépasser 1000 points
- **Héro du château** : Battre le boss final

## 🛠️ Technologies utilisées

- **HTML5** : Structure sémantique et formulaires accessibles
- **CSS3** : Variables CSS, Flexbox/Grid, Animations, Media queries
- **JavaScript** : Logique du jeu, gestion d'état, stockage local
- **GSAP 3** : Animations web fluides et performantes (via CDN)
- **Web Audio API** : Sons générés procéduralement
- **Web Speech API** : Lecture vocale des questions
- **Service Worker** : Cache et fonctionnement offline (PWA)

## 📱 Optimisations

- **Mobile-first** : Conçu pour mobile dès le départ
- **Responsive** : Fonctionne sur tous les formats d'écran
- **Performance** : Animations réduites sur mobile avec peu de RAM
- **Accessibilité** : Support clavier, ARIA labels, contraste suffisant
- **Préférence mouvement** : Respecte `prefers-reduced-motion`
- **PWA** : Installation possible sur mobile et accès hors ligne

## 📁 Structure des fichiers

```
multiplication/
├── index.html          # Structure HTML
├── style.css           # Styles CSS et animations
├── script.js           # Logique du jeu (1100+ lignes)
├── sw.js               # Service Worker pour PWA
├── manifest.webmanifest # Configuration d'installation
├── icon-192.svg        # Icône pour mobile (192x192)
├── icon-512.svg        # Icône pour mobile (512x512)
├── render.yaml         # Configuration de déploiement
└── README.md           # Cette documentation
```

## 🔐 Stockage des données

Les données sont sauvegardées **localement** sur l'appareil via `localStorage` :
- **Meilleur score global** : `multiplication-sprint-best-score`
- **Profils enfants** : `multiplication-sprint-profiles` (JSON)
- **Profil actif** : `multiplication-sprint-active-profile`

Aucune donnée n'est envoyée à un serveur - tout reste privé!

## 🌟 Améliorations v5

- ✅ Carte du monde immersive avec mascotte qui se déplace
- ✅ Système de profils enfants avec badges persistants
- ✅ Tableau de bord parent avec statistiques détaillées
- ✅ Boss final au château avec challenge spécial
- ✅ Mode expert avec temps réduit et conditions strictes
- ✅ Animations GSAP fluides et personnalisées
- ✅ Support complet du responsive design
- ✅ Installation PWA sur mobile
- ✅ Lecture vocale des questions en français
- ✅ Sons Web Audio dynamiques

## 🎓 Utilisation éducative

Ce jeu est parfait pour :
- **Enfants 8-12 ans** : Apprentissage ludique des tables de multiplication
- **Révisions** : Questions des niveaux précédents réintégrées
- **Progression graduelle** : Tables de 1-5 jusqu'à 10
- **Motivation** : Système de récompenses avec badges et étoiles
- **Pratique autonome** : Les enfants peuvent jouer seuls

## 📈 Statistiques suivies

- Nombre de parties jouées
- Niveaux complétés
- Nombre total d'étoiles
- Meilleur niveau atteint
- Total de bonnes réponses
- Précision en pourcentage

## 🔊 Contrôles

- **Souris/Tactile** : Clique sur les boutons de réponse
- **Clavier** : Numéros 1-5 pour sélectionner une réponse
- **Voix** : Bouton de lecture pour entendre la question à voix haute
- **Navigation** : Boutons intuitifs pour naviguer dans les menus

## 🚀 Déploiement

Ce jeu peut être déployé gratuitement sur :
- **Render.com** (render.yaml inclus)
- **Vercel** / **Netlify**
- **GitHub Pages**
- **Heroku**
- Ton propre serveur

## 📝 Notes de développement

- GSAP 3 est chargé depuis CDN (https://cdnjs.cloudflare.com)
- Le jeu utilise les standards web modernes (ES6+)
- Aucune dépendance npm requise
- Le code est bien commenté et organisé
- Les animations respectent les préférences d'accessibilité

## ❓ FAQ

**Q: Comment réinitialiser mon meilleur score?**
A: Ouvre les outils développeur (F12) → Console et tape :
```javascript
localStorage.clear(); location.reload();
```

**Q: Les sons ne fonctionnent pas?**
A: Vérifie que :
- L'onglet n'est pas muet (Chrome)
- Le son du système est activé
- L'audio n'est pas bloqué par le navigateur

**Q: Comment jouer hors ligne?**
A: Installe l'app PWA depuis la barre d'outils (+ "Installer")

## 💡 Conseils pour jouer

1. **Mode Enfant d'abord** : Plus facile pour commencer
2. **Lecture vocale activée** : Aide à la concentration
3. **Rejouer les niveaux** : Les étoiles encouragent la perfection
4. **Défis en duo** : Plus amusant avec un ami!
5. **Objectif 3 étoiles** : Vise le score parfait par niveau

## 📞 Support

Pour tout problème ou suggestion :
- Vérifie la console (F12 → Console)
- Réinstalle le jeu (Ctrl+Maj+Suppr → Cache)
- Teste sur une autre navigateur

---

**Créé avec ❤️ pour rendre les maths amusantes!**

Version 5.1 - Avril 2026

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
## Carte premium v6

- carte du monde premium isometrique basee sur un asset illustre local
- couche d'ambiance Three.js pour nuages, lueurs, focus du niveau et profondeur
- assets locaux ajoutes dans `assets/world` et `assets/characters`
- service worker mis a jour pour invalider le cache et embarquer les nouveaux assets
