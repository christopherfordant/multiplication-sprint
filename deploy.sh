#!/bin/bash

# 🚀 Script de déploiement pour Multiplication Sprint
# Usage: ./deploy.sh [dev|staging|production]

set -e

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Déploiement Multiplication Sprint${NC}"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"

# Vérifier les prérequis
check_requirements() {
  echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
  fi
  
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
  fi
  
  if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Tous les prérequis sont présents${NC}"
}

# Nettoyer les anciens fichiers
cleanup() {
  echo -e "${YELLOW}🧹 Nettoyage...${NC}"
  rm -rf node_modules/
  echo -e "${GREEN}✅ Nettoyage terminé${NC}"
}

# Installer les dépendances
install_dependencies() {
  echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
  npm ci --only=production
  echo -e "${GREEN}✅ Dépendances installées${NC}"
}

# Tester l'application
test_app() {
  echo -e "${YELLOW}🧪 Tests...${NC}"
  
  # Vérifier que le serveur démarre
  timeout 5 node server.js &
  sleep 2
  
  if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Serveur répond${NC}"
  else
    echo -e "${RED}❌ Serveur ne répond pas${NC}"
    exit 1
  fi
  
  pkill -f "node server.js" || true
}

# Déployer sur Docker
deploy_docker() {
  echo -e "${YELLOW}🐳 Construction Docker...${NC}"
  
  case $ENVIRONMENT in
    dev)
      docker-compose build
      docker-compose up -d --profiles dev
      ;;
    staging|production)
      docker-compose build
      docker-compose up -d
      ;;
  esac
  
  echo -e "${GREEN}✅ Déploiement Docker terminé${NC}"
}

# Déployer sur Render
deploy_render() {
  echo -e "${YELLOW}☁️  Déploiement Render...${NC}"
  
  if ! command -v render &> /dev/null; then
    echo -e "${YELLOW}⚠️  CLI Render non trouvée${NC}"
    echo "Installation: npm install -g @render/cli"
    return
  fi
  
  git push origin main
  echo -e "${GREEN}✅ Déploiement Render déclenché${NC}"
}

# Créer une sauvegarde
backup() {
  echo -e "${YELLOW}💾 Création d'une sauvegarde...${NC}"
  
  mkdir -p backups
  tar -czf backups/multiplication-sprint_${TIMESTAMP}.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.env \
    --exclude=backups \
    .
  
  echo -e "${GREEN}✅ Sauvegarde créée: backups/multiplication-sprint_${TIMESTAMP}.tar.gz${NC}"
}

# Déployer avec PM2
deploy_pm2() {
  echo -e "${YELLOW}⚙️  Déploiement PM2...${NC}"
  
  if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 n'est pas installé${NC}"
    echo "Installation: npm install -g pm2"
    exit 1
  fi
  
  pm2 stop multiplication-sprint || true
  pm2 start server.js --name "multiplication-sprint" --env production
  pm2 save
  
  echo -e "${GREEN}✅ Déploiement PM2 terminé${NC}"
}

# Script principal
main() {
  check_requirements
  backup
  cleanup
  install_dependencies
  test_app
  
  case $ENVIRONMENT in
    dev)
      echo -e "${YELLOW}🔧 Environnement de développement${NC}"
      npm run dev
      ;;
    staging)
      echo -e "${YELLOW}📊 Environnement de staging${NC}"
      deploy_docker
      ;;
    production)
      echo -e "${YELLOW}🚀 Environnement de production${NC}"
      deploy_docker
      deploy_pm2
      ;;
    *)
      echo -e "${RED}❌ Environnement inconnu: $ENVIRONMENT${NC}"
      echo "Usage: ./deploy.sh [dev|staging|production]"
      exit 1
      ;;
  esac
  
  echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
}

# Exécuter le script
main
