# 🚀 Déploiement PostgreSQL sur Render

## Étapes rapides pour ajouter PostgreSQL

### 1. Créer la base de données PostgreSQL
1. **Render Dashboard** → **New** → **PostgreSQL**
2. **Nom** : `multiplication-sprint-db`
3. **Région** : EU-West (ou la plus proche)
4. **Créer**

### 2. Connecter à votre app
1. **Votre service web** → **Environment**
2. **Ajouter** :
   ```
   DATABASE_URL=[Connection String depuis PostgreSQL]
   ```
3. **Redéployer**

### 3. Vérifier
- **Logs** : Devrait afficher `✅ Connexion à PostgreSQL réussie`
- **API** : `/api/health` devrait fonctionner
- **Profils/Scores** : Devraient persister

## 📋 Checklist déploiement

- [ ] Base PostgreSQL créée sur Render
- [ ] `DATABASE_URL` configurée dans l'app
- [ ] Redéploiement terminé
- [ ] Test des endpoints API
- [ ] Vérification des logs

## 🔧 Variables d'environnement

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Fourni par Render
NODE_ENV=production
ADMIN_KEY=votre-cle-admin
BASE_URL=https://votre-app.render.com
```

## 📖 Documentation complète

Voir `DATABASE_SETUP.md` pour les détails complets de configuration.