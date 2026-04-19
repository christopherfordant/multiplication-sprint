# 🗄️ Configuration PostgreSQL pour Multiplication Sprint

## 🚀 Configuration sur Render

### 1. Créer une base de données PostgreSQL

1. **Aller sur Render.com** → Dashboard → New → PostgreSQL
2. **Nommer** : `multiplication-sprint-db`
3. **Région** : Choisir la plus proche (EU-West pour l'Europe)
4. **Version** : Latest (15+ recommandé)
5. **Créer** la base de données

### 2. Connecter à votre application

1. **Aller dans votre service web** (multiplication-sprint)
2. **Environment** → Add Environment Variable :
   ```
   DATABASE_URL=postgresql://[votre-connection-string-de-Render]
   ```
3. **Redéployer** automatiquement

### 3. Variables d'environnement importantes

```bash
# Généré automatiquement par Render
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Autres variables
NODE_ENV=production
ADMIN_KEY=votre-cle-secrete-admin
BASE_URL=https://votre-app.render.com
```

## 🛠️ Développement local

### Installation PostgreSQL

**Windows :**
```bash
# Via Chocolatey
choco install postgresql

# Ou télécharger depuis https://www.postgresql.org/download/windows/
```

**macOS :**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Configuration locale

1. **Créer la base de données :**
```bash
createdb multiplication_sprint
```

2. **Fichier .env :**
```bash
cp .env.example .env
# Modifier DATABASE_URL avec vos credentials locaux
DATABASE_URL=postgresql://username:password@localhost:5432/multiplication_sprint
```

3. **Tester la connexion :**
```bash
npm run dev
# Devrait afficher "✅ Connexion à PostgreSQL réussie"
```

## 📊 Structure des tables

### Profiles
- `id` (String, Primary Key)
- `name` (String)
- `badges` (JSON Array)
- `best_score` (Integer)
- `highest_unlocked_level` (Integer)
- `level_stars` (JSON Array)
- `stats` (JSON Object)
- `created_at`, `updated_at` (Timestamps)

### Scores
- `id` (String, Primary Key)
- `profile_id` (Foreign Key → Profiles)
- `level` (Integer)
- `level_score` (Integer)
- `total_score` (Integer)
- `stars` (Integer)
- `mode` (String)
- `accuracy` (Float)
- `created_at`, `updated_at` (Timestamps)

## 🔧 Migration des données

Si vous aviez des données en localStorage, elles seront automatiquement synchronisées lors de la première connexion API.

## 🚨 Dépannage

### Erreur de connexion
```
❌ Erreur de connexion à PostgreSQL: connect ECONNREFUSED
```
**Solutions :**
- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans DATABASE_URL
- Vérifier le firewall/port 5432

### Erreur SSL
```
❌ self signed certificate
```
**Solution :** Ajouter `?sslmode=require` à DATABASE_URL pour Render

### Tables non créées
```
❌ Erreur de synchronisation: relation "profiles" does not exist
```
**Solution :** Le code crée automatiquement les tables avec `sync()`. Vérifier les logs.

## 📈 Performance

- **Pool de connexions** : 5 connexions max
- **Indexes** : Automatiques sur clés primaires et étrangères
- **Cache** : Requêtes fréquentes (leaderboard) optimisées

## 🔒 Sécurité

- **SSL** : Toujours activé en production
- **Prepared statements** : Via Sequelize ORM
- **Validation** : Données validées avant insertion
- **Rate limiting** : À implémenter si nécessaire