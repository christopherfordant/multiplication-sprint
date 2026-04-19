const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { Profile, Score, testConnection, syncDatabase } = require('./database');

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

// 🗄️ Initialisation de la base de données
(async () => {
  await testConnection();
  await syncDatabase();
})();

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
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      include: [{
        model: Score,
        as: 'scores',
        limit: 10,
        order: [['createdAt', 'DESC']]
      }]
    });
    res.json(profiles);
  } catch (error) {
    console.error('Erreur récupération profils:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/profiles - Créer/Mettre à jour un profil
app.post('/api/profiles', express.json(), async (req, res) => {
  try {
    const { id, name, badges, bestScore, highestUnlockedLevel, levelStars, stats } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'ID et nom requis' });
    }

    const [profile, created] = await Profile.upsert({
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
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Erreur sauvegarde profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/scores - Sauvegarder un score
app.post('/api/scores', express.json(), async (req, res) => {
  try {
    const { profileId, level, levelScore, totalScore, stars, mode, accuracy } = req.body;

    if (!profileId || !level) {
      return res.status(400).json({ error: 'ProfileID et niveau requis' });
    }

    const score = await Score.create({
      id: `${profileId}-${level}-${Date.now()}`,
      profileId,
      level,
      levelScore,
      totalScore,
      stars,
      mode,
      accuracy
    });

    res.json(score);
  } catch (error) {
    console.error('Erreur sauvegarde score:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/scores/:profileId - Récupérer les scores d'un profil
app.get('/api/scores/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const scores = await Score.findAll({
      where: { profileId },
      order: [['createdAt', 'DESC']]
    });
    res.json(scores);
  } catch (error) {
    console.error('Erreur récupération scores:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/leaderboard - Classement global
app.get('/api/leaderboard', async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      attributes: ['name', 'bestScore', 'highestUnlockedLevel', 'levelStars'],
      order: [['bestScore', 'DESC']],
      limit: 50
    });

    const leaderboard = profiles.map((p, index) => ({
      rank: index + 1,
      name: p.name,
      score: p.bestScore,
      level: p.highestUnlockedLevel,
      stars: (p.levelStars || []).reduce((a, b) => a + b, 0)
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Erreur récupération leaderboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🛠️ Admin routes (sécurisées)

// GET /api/admin/stats - Statistiques globales
app.get('/api/admin/stats', validateAuth, async (req, res) => {
  try {
    const [totalProfilesResult, totalScoresResult, avgScoreResult] = await Promise.all([
      Profile.count(),
      Score.count(),
      Score.findAll({
        attributes: [[Score.sequelize.fn('AVG', Score.sequelize.col('totalScore')), 'avgScore']]
      })
    ]);

    const avgScore = avgScoreResult[0]?.dataValues?.avgScore
      ? Math.round(parseFloat(avgScoreResult[0].dataValues.avgScore))
      : 0;

    res.json({
      totalProfiles: totalProfilesResult,
      totalScores: totalScoresResult,
      avgScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/profiles/:id - Supprimer un profil
app.delete('/api/admin/profiles/:id', validateAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Profile.destroy({ where: { id } });
    if (deleted) {
      // Supprimer aussi les scores associés
      await Score.destroy({ where: { profileId: id } });
      res.json({ success: true, message: `Profil ${id} supprimé` });
    } else {
      res.status(404).json({ error: 'Profil non trouvé' });
    }
  } catch (error) {
    console.error('Erreur suppression profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
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
