const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
    }
  }
}));

// 📦 Middleware de compression et parsing
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 📁 Fichiers statiques
app.use(express.static(path.join(__dirname, '.'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// 🗄️ Stockage en mémoire (remplacer par MongoDB en production)
const database = {
  profiles: {},
  scores: []
};

// 🔐 Clé secrète simple (à remplacer par JWT en production)
const ADMIN_KEY = process.env.ADMIN_KEY || 'dev-key-change-in-production';

// ✅ Middleware d'authentification simple
function validateAuth(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.key;
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

// 🎮 API Routes

// GET /api/profiles - Récupérer tous les profils
app.get('/api/profiles', (req, res) => {
  res.json(database.profiles);
});

// POST /api/profiles - Créer/Mettre à jour un profil
app.post('/api/profiles', express.json(), (req, res) => {
  const { id, name, badges, bestScore, highestUnlockedLevel, levelStars, stats } = req.body;
  
  if (!id || !name) {
    return res.status(400).json({ error: 'ID et nom requis' });
  }

  const profile = {
    id,
    name,
    badges: badges || [],
    bestScore: bestScore || 0,
    highestUnlockedLevel: highestUnlockedLevel || 1,
    levelStars: levelStars || Array(10).fill(0),
    stats: stats || {
      gamesPlayed: 0,
      levelsCleared: 0,
      totalStars: 0,
      bestLevel: 1,
      correctAnswers: 0,
      totalAnswers: 0
    },
    lastUpdated: new Date().toISOString()
  };

  database.profiles[id] = profile;
  res.json(profile);
});

// POST /api/scores - Sauvegarder un score
app.post('/api/scores', express.json(), (req, res) => {
  const { profileId, level, levelScore, totalScore, stars, mode, accuracy } = req.body;
  
  if (!profileId || !level) {
    return res.status(400).json({ error: 'ProfileID et niveau requis' });
  }

  const score = {
    id: `${profileId}-${level}-${Date.now()}`,
    profileId,
    level,
    levelScore,
    totalScore,
    stars,
    mode,
    accuracy,
    timestamp: new Date().toISOString()
  };

  database.scores.push(score);
  res.json(score);
});

// GET /api/scores/:profileId - Récupérer les scores d'un profil
app.get('/api/scores/:profileId', (req, res) => {
  const { profileId } = req.params;
  const scores = database.scores.filter(s => s.profileId === profileId);
  res.json(scores);
});

// GET /api/leaderboard - Classement global
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Object.values(database.profiles)
    .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
    .slice(0, 50)
    .map((p, index) => ({
      rank: index + 1,
      name: p.name,
      score: p.bestScore,
      level: p.highestUnlockedLevel,
      stars: (p.levelStars || []).reduce((a, b) => a + b, 0)
    }));
  
  res.json(leaderboard);
});

// 🛠️ Admin routes (sécurisées)

// GET /api/admin/stats - Statistiques globales
app.get('/api/admin/stats', validateAuth, (req, res) => {
  const totalProfiles = Object.keys(database.profiles).length;
  const totalScores = database.scores.length;
  const avgScore = database.scores.length > 0
    ? Math.round(database.scores.reduce((sum, s) => sum + (s.totalScore || 0), 0) / database.scores.length)
    : 0;

  res.json({
    totalProfiles,
    totalScores,
    avgScore,
    timestamp: new Date().toISOString()
  });
});

// DELETE /api/admin/profiles/:id - Supprimer un profil
app.delete('/api/admin/profiles/:id', validateAuth, (req, res) => {
  const { id } = req.params;
  delete database.profiles[id];
  res.json({ success: true, message: `Profil ${id} supprimé` });
});

// 📊 SEO Routes

// GET /robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /api/admin/
Crawl-delay: 1
`);
});

// GET /sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/index.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/api/leaderboard</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
  
  res.type('application/xml').send(sitemap);
});

// 🏠 Page d'accueil avec métadonnées
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🚀 Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// 📡 Démarrage du serveur
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎮 Multiplication Sprint Server      ║
║   http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
