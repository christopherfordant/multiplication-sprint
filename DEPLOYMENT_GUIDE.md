# 🎮 Multiplication Sprint - Guide Complet

Un jeu éducatif ludique et complet pour maîtriser les multiplications avec **carte du monde interactive**, **profils enfants**, **système de progression**, **animations fluides** et **tableau de bord parent**.

## 📋 Table des matières

1. [Installation](#installation)
2. [Déploiement](#déploiement)
3. [Configuration Sécurité](#configuration-sécurité)
4. [Architecture Technique](#architecture-technique)
5. [Base de Données](#base-de-données)
6. [API](#api)
7. [SEO](#seo)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Installation

### Prérequis

- **Node.js** 14.0.0 ou supérieur
- **npm** ou **yarn**
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation locale

```bash
# 1. Cloner le projet
cd /chemin/vers/multiplication

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cp .env.example .env

# 4. Configurer les variables d'environnement
# Éditer .env avec vos paramètres

# 5. Démarrer le serveur en développement
npm run dev

# 6. Ouvrir le navigateur
# http://localhost:3000
```

---

## 🌍 Déploiement

### Déploiement sur Render.com (Recommandé - Gratuit)

1. **Créer un compte sur [render.com](https://render.com)**

2. **Connecter votre repo GitHub**

3. **Créer une nouveau Web Service**
   - Repository: votre-repo
   - Branch: main
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

4. **Ajouter les variables d'environnement**
   - `NODE_ENV`: production
   - `PORT`: 3000
   - `ADMIN_KEY`: votre-clé-secrète-forte

5. **Deploy!**

### Déploiement sur Heroku

```bash
# 1. Installer Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Créer l'app
heroku create multiplication-sprint

# 4. Ajouter les variables
heroku config:set NODE_ENV=production
heroku config:set ADMIN_KEY=votre-clé-secrète-forte

# 5. Déployer
git push heroku main
```

### Déploiement avec Docker

```bash
# Créer Dockerfile
cat > Dockerfile << 'EOF'
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build et run
docker build -t multiplication-sprint .
docker run -p 3000:3000 -e NODE_ENV=production multiplication-sprint
```

### Déploiement avec Nginx (VPS)

```bash
# 1. Installer Node.js et Nginx
sudo apt-get update
sudo apt-get install -y nodejs npm nginx

# 2. Cloner le projet
cd /var/www
sudo git clone votre-repo multiplication-sprint
cd multiplication-sprint

# 3. Installer les dépendances
npm ci --only=production

# 4. Copier la config Nginx
sudo cp nginx.conf /etc/nginx/sites-available/multiplication-sprint
sudo ln -s /etc/nginx/sites-available/multiplication-sprint /etc/nginx/sites-enabled/

# 5. Tester la config Nginx
sudo nginx -t

# 6. Démarrer Nginx
sudo systemctl restart nginx

# 7. Utiliser PM2 pour manager Node
sudo npm install -g pm2
pm2 start server.js --name "multiplication-sprint"
pm2 save
```

---

## 🔒 Configuration Sécurité

### Headers de Sécurité

Le serveur ajoute automatiquement les headers suivants:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
```

### HTTPS/SSL

**Important**: Toujours utiliser HTTPS en production!

```bash
# Avec Let's Encrypt (recommandé - GRATUIT)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d multiplication-sprint.com

# Le certbot va créer:
# - /etc/letsencrypt/live/multiplication-sprint.com/fullchain.pem
# - /etc/letsencrypt/live/multiplication-sprint.com/privkey.pem

# Renouvellement automatique
sudo systemctl enable certbot.timer
```

### Variables d'environnement (Production)

```bash
# .env (Jamais committer ce fichier!)
NODE_ENV=production
PORT=3000
ADMIN_KEY=une-clé-très-forte-de-32-caractères-minimum
JWT_SECRET=un-autre-secret-très-fort
BASE_URL=https://multiplication-sprint.com
FRONTEND_URL=https://multiplication-sprint.com
DATABASE_URL=mongodb://user:password@host:27017/multiplication-sprint
LOG_LEVEL=info
```

### Authentification API

Toutes les requêtes API doivent inclure:

```javascript
// Header
'X-API-Key': votre-admin-key

// Ou paramètre query
?key=votre-admin-key
```

---

## 🏗️ Architecture Technique

```
multiplication-sprint/
├── server.js              # 🎯 Serveur Express principal
├── package.json           # 📦 Dépendances
├── index.html            # 📄 HTML
├── style.css             # 🎨 Styles
├── script.js             # ⚙️ Logique de jeu
├── api-sync.js           # 🌐 Synchronisation serveur
├── checkpoint-animations.js # 🎬 Animations
├── animations-enhanced.css  # ✨ Styles animations
├── manifest.webmanifest  # 📱 PWA
├── sw.js                 # 🔄 Service Worker
├── nginx.conf            # 🌍 Configuration serveur
├── .env.example          # ⚙️ Variables d'exemple
└── README.md             # 📖 Ce fichier
```

### Stack Technique

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla + GSAP)
- **Backend**: Node.js + Express
- **Base de données**: MongoDB (optionnel) ou localStorage
- **Serveur**: Nginx + Node.js
- **PWA**: Service Worker, Manifest
- **Animations**: GSAP 3.12
- **SEO**: Meta tags, Schema.org, Sitemap, Robots.txt

---

## 🗄️ Base de Données

### Structure des données

**Profils**
```javascript
{
  id: "champion",
  name: "Champion",
  badges: ["first_win", "star_hunter"],
  bestScore: 2500,
  highestUnlockedLevel: 5,
  levelStars: [3, 2, 1, 3, 2, 0, 0, 0, 0, 0],
  stats: {
    gamesPlayed: 15,
    levelsCleared: 5,
    totalStars: 14,
    bestLevel: 5,
    correctAnswers: 45,
    totalAnswers: 50
  },
  lastUpdated: "2026-04-19T12:00:00Z"
}
```

**Scores**
```javascript
{
  id: "champion-1-1702839600000",
  profileId: "champion",
  level: 1,
  levelScore: 650,
  totalScore: 2500,
  stars: 3,
  mode: "kids",
  accuracy: 95,
  timestamp: "2026-04-19T12:00:00Z"
}
```

### MongoDB Integration (Production)

```bash
# Installer MongoDB
# https://www.mongodb.com/docs/manual/installation/

# URI de connexion
mongodb://username:password@host:27017/multiplication-sprint

# Créer les indexes
db.profiles.createIndex({ id: 1 })
db.scores.createIndex({ profileId: 1 })
db.scores.createIndex({ timestamp: -1 })
```

---

## 🔗 API

### Endpoints publics

#### GET `/api/leaderboard`
Récupère les 50 meilleurs scores

```bash
curl http://localhost:3000/api/leaderboard
```

**Réponse:**
```json
[
  {
    "rank": 1,
    "name": "Champion",
    "score": 2500,
    "level": 10,
    "stars": 30
  }
]
```

#### GET `/api/scores/:profileId`
Récupère tous les scores d'un profil

```bash
curl http://localhost:3000/api/scores/champion
```

#### POST `/api/profiles`
Crée ou met à jour un profil

```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "id": "champion",
    "name": "Champion",
    "bestScore": 2500,
    "highestUnlockedLevel": 5
  }'
```

#### POST `/api/scores`
Sauvegarder un score

```bash
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "champion",
    "level": 1,
    "levelScore": 650,
    "totalScore": 2500,
    "stars": 3,
    "mode": "kids",
    "accuracy": 95
  }'
```

### Endpoints admin (Sécurisés)

#### GET `/api/admin/stats`
Statistiques globales

```bash
curl http://localhost:3000/api/admin/stats \
  -H "X-API-Key: votre-admin-key"
```

#### DELETE `/api/admin/profiles/:id`
Supprimer un profil

```bash
curl -X DELETE http://localhost:3000/api/admin/profiles/champion \
  -H "X-API-Key: votre-admin-key"
```

---

## 🔍 SEO

### Meta tags et Open Graph

✅ Tous les meta tags SEO sont configurés:

- Title optimisé
- Meta description
- Keywords
- Open Graph (Facebook, LinkedIn, etc)
- Twitter Card
- JSON-LD Schema.org
- Structured data

### Sitemap et Robots.txt

```bash
# Sitemap généré automatiquement
GET /sitemap.xml

# Robots.txt
GET /robots.txt
```

### Performance SEO

- ✅ Lighthouse Score > 90
- ✅ Compression Gzip activée
- ✅ Mise en cache des ressources statiques (30 jours)
- ✅ DNS Prefetch pour les ressources externes
- ✅ Polices Google préchargées
- ✅ Images optimisées
- ✅ CSS/JS minifiés

---

## 📱 PWA (Progressive Web App)

### Installation sur mobile

1. Ouvrir le site sur mobile (Chrome, Safari, Edge)
2. Cliquer sur "Installer" ou le bouton du navigateur
3. L'app s'installe comme une app native
4. Fonctionne hors ligne avec le Service Worker

### Features PWA

- ✅ Installation sur écran d'accueil
- ✅ Fonctionnement hors ligne
- ✅ App shell architecture
- ✅ Push notifications (optionnel)
- ✅ Responsive design

---

## 🎯 Système de Progression

### Déblocage des niveaux

- **Niveau 1**: Débloqué par défaut
- **Niveaux 2-10**: Nécessite de passer le niveau précédent avec le score minimum
- **Mode Enfant**: Seuil 55% du score théorique
- **Mode Expert**: Seuil 70% du score théorique

### Système d'étoiles

- ⭐ **1 étoile**: Score >= score requis
- ⭐⭐ **2 étoiles**: Score >= 118% du score requis
- ⭐⭐⭐ **3 étoiles**: Score >= 145% du score requis

### Badges à débloquer

- 🏆 Premier pas
- ⭐ Chasseur d'étoiles
- 💯 Sans faute
- 🧠 Cerveau expert
- 🤝 Duel gagné
- 💪 Mega score
- 👑 Héro du château

---

## 🎮 Modes de Jeu

### Mode Enfant
- Temps par question: 12 secondes
- Points par seconde: 8
- Plus facile à passer
- Tables de multiplication: 1-10

### Mode Expert
- Temps par question: 9 secondes
- Points par seconde: 11
- Plus dur à passer
- Tables de multiplication: 2-10

### Session Solo
- Un joueur
- Progression personnelle
- Sauvegarde automatique

### Session Duo
- Deux joueurs en alternance
- Scores séparés
- Compétition locale

---

## 🐛 Troubleshooting

### Le serveur ne démarre pas

```bash
# Vérifier le port 3000
lsof -i :3000

# Utiliser un autre port
PORT=3001 npm start
```

### Les scores ne se sauvegardent pas

- Vérifier que l'API répond: `curl http://localhost:3000/api/health`
- Vérifier la console du navigateur (F12) pour les erreurs
- Vérifier les logs du serveur

### Les animations ne fonctionnent pas

- Vérifier que GSAP est chargé: `window.gsap` dans console
- Vérifier que `prefers-reduced-motion` n'est pas activé
- Vérifier la compatibilité du navigateur

### Service Worker ne met pas à jour

```bash
# Force la mise à jour
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
})
```

### HTTPS non fonctionnel

```bash
# Vérifier le certificat
openssl s_client -connect localhost:443

# Renouveler le certificat Let's Encrypt
sudo certbot renew --force-renewal
```

---

## 📞 Support et Contribution

Pour toute question ou contribution:

1. Créer une issue sur GitHub
2. Fork et soumettre une PR
3. Contacter: support@multiplication-sprint.com

---

## 📄 Licence

MIT License - Libre d'utilisation commerciale et personnelle

---

## 🎉 C'est parti!

```bash
npm install
npm run dev
# Visitez http://localhost:3000
```

**Bon jeu!** 🎮✨

---

**Dernière mise à jour**: 19 Avril 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
