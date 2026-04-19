# 🎯 Guide de Configuration Rapide

## ⚡ 5 minutes pour démarrer

### Option 1: Développement Local (Recommandé pour tester)

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur
npm run dev

# 3. Ouvrir le navigateur
# http://localhost:3000
```

---

## 🐳 Déploiement Docker (Production Ready)

### Avec Docker Compose (Complet)

```bash
# 1. Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos paramètres

# 2. Démarrer tous les services
docker-compose up -d

# 3. Services disponibles:
# - Application: http://localhost
# - API: http://localhost:3000/api
# - Mongo Express (dev): http://localhost:8081
```

### Arrêter les services

```bash
docker-compose down

# Avec suppression des volumes
docker-compose down -v
```

---

## ☁️ Déploiement sur Render.com (Gratuit)

### Via GitHub

1. **Push le repo sur GitHub**
```bash
git remote add origin https://github.com/votre-username/multiplication-sprint.git
git branch -M main
git push -u origin main
```

2. **Sur render.com**
   - Se connecter/S'inscrire
   - "New +" > "Web Service"
   - Connecter le repo GitHub
   - Configuration:
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Environment: Ajouter les variables du `.env`
   - Deploy

3. **URL**: https://multiplication-sprint.onrender.com

---

## 🖥️ Déploiement VPS (Recommandé pour la scalabilité)

### 1. Louer un VPS (DigitalOcean, Linode, etc)

Specs recommandées:
- 2GB RAM minimum
- 30GB SSD
- Ubuntu 20.04 LTS

### 2. Installation initiale

```bash
# SSH dans le serveur
ssh root@votre-ip

# Mettre à jour
apt-get update && apt-get upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get install -y nodejs

# Installer Nginx
apt-get install -y nginx

# Installer MongoDB (optionnel mais recommandé)
apt-get install -y mongodb

# Installer PM2 (gestionnaire de processus)
npm install -g pm2
```

### 3. Cloner l'application

```bash
cd /var/www
git clone https://github.com/votre-username/multiplication-sprint.git
cd multiplication-sprint

# Installer les dépendances
npm ci --only=production
```

### 4. Configurer Nginx

```bash
# Copier la config Nginx
cp nginx.conf /etc/nginx/sites-available/multiplication-sprint
ln -s /etc/nginx/sites-available/multiplication-sprint /etc/nginx/sites-enabled/

# Tester la config
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### 5. Configurer PM2

```bash
# Créer le fichier de config PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'multiplication-sprint',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      ADMIN_KEY: process.env.ADMIN_KEY,
      BASE_URL: 'https://multiplication-sprint.com'
    }
  }]
};
EOF

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configurer HTTPS (SSL/TLS)

```bash
# Installer Certbot
apt-get install -y certbot python3-certbot-nginx

# Créer le certificat
certbot certonly --nginx -d multiplication-sprint.com

# Configurer le renouvellement automatique
systemctl enable certbot.timer
```

### 7. Monitoring et Logs

```bash
# Voir les logs en temps réel
pm2 logs

# Dashboard PM2
pm2 monit

# Redémarrer l'app
pm2 restart all

# Vérifier le status
pm2 status
```

---

## 🔐 Checklist de Sécurité Production

- [ ] HTTPS activé et certificat valide
- [ ] Variables d'environnement configurées
- [ ] `ADMIN_KEY` changée (minimum 32 caractères)
- [ ] `JWT_SECRET` changé (minimum 32 caractères)
- [ ] Firewall configuré (port 80, 443 ouverts seulement)
- [ ] MongoDB password-protected
- [ ] Backups automatiques configurés
- [ ] Monitoring activé
- [ ] Logs collectés et sauvegardés
- [ ] Rate limiting activé (anti-DDoS)

---

## 📊 Monitoring

### Vérifier la santé de l'app

```bash
# Via API
curl https://multiplication-sprint.com/api/health

# Via PM2
pm2 status

# Via Docker
docker-compose ps
```

### Logs

```bash
# PM2 logs
pm2 logs multiplication-sprint

# Docker logs
docker-compose logs -f app

# Nginx logs
tail -f /var/log/nginx/multiplication-sprint.access.log
tail -f /var/log/nginx/multiplication-sprint.error.log
```

---

## 🔄 Mise à jour

### Mettre à jour l'application

```bash
# Pull les derniers changements
git pull origin main

# Réinstaller les dépendances (si changements)
npm ci --only=production

# Redémarrer l'application
pm2 restart multiplication-sprint
# ou
docker-compose restart app
```

---

## 🚨 Troubleshooting

### L'app ne démarre pas

```bash
# Vérifier les logs
pm2 logs multiplication-sprint

# Ou
docker-compose logs app

# Redémarrer
pm2 restart multiplication-sprint
docker-compose restart app
```

### Erreurs HTTPS

```bash
# Tester le certificat
curl -v https://multiplication-sprint.com

# Renouveler manuellement
certbot renew --force-renewal
```

### Base de données non accessible

```bash
# Vérifier MongoDB
systemctl status mongodb

# Redémarrer
systemctl restart mongodb

# Vérifier la connexion
mongosh "mongodb://user:pass@localhost:27017"
```

---

## 📞 Support

Issues? Questions? Créer une issue sur GitHub:
https://github.com/votre-username/multiplication-sprint/issues

---

**Bon déploiement!** 🚀
