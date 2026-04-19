#!/usr/bin/env node

/**
 * 🚀 Script d'initialisation de Multiplication Sprint
 * Usage: node setup.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function createEnvFile() {
  log('⚙️  Création du fichier .env...', 'blue');
  
  if (checkFileExists('.env')) {
    log('⚠️  .env existe déjà - skipped', 'yellow');
    return;
  }

  const adminKey = generateSecureKey(32);
  const jwtSecret = generateSecureKey(32);
  
  const envContent = `# Environnement
NODE_ENV=development
PORT=3000

# Sécurité
ADMIN_KEY=${adminKey}
JWT_SECRET=${jwtSecret}

# Base de données
DATABASE_URL=mongodb://localhost:27017/multiplication-sprint

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Logs
LOG_LEVEL=info

# (En production, changez ces valeurs!)
`;

  fs.writeFileSync('.env', envContent);
  log('✅ Fichier .env créé', 'green');
  log(`   ADMIN_KEY: ${adminKey}`, 'yellow');
  log(`   JWT_SECRET: ${jwtSecret}`, 'yellow');
}

function checkNodeModules() {
  log('📦 Vérification des dépendances...', 'blue');
  
  if (checkFileExists('node_modules')) {
    log('✅ node_modules existe', 'green');
    return true;
  }
  
  log('❌ node_modules non trouvé', 'red');
  log('Exécutez: npm install', 'yellow');
  return false;
}

function displayQuickStart() {
  log('\n🎮 === MULTIPLICATION SPRINT ===', 'blue');
  log('✨ Configuration terminée!\\n', 'green');
  
  log('📋 Prochaines étapes:', 'blue');
  log('1. Installer les dépendances (si pas déjà fait):', 'yellow');
  log('   npm install\\n', 'white');
  
  log('2. Démarrer en développement:', 'yellow');
  log('   npm run dev\\n', 'white');
  
  log('3. Ouvrir le navigateur:', 'yellow');
  log('   http://localhost:3000\\n', 'white');
  
  log('📚 Documentation disponible:', 'blue');
  log('   • QUICK_START.md - Démarrage rapide', 'yellow');
  log('   • DEPLOYMENT_GUIDE.md - Guide complet', 'yellow');
  log('   • IMPLEMENTATION_SUMMARY.md - Résumé tech\\n', 'yellow');
  
  log('🐳 Ou avec Docker:', 'blue');
  log('   docker-compose up -d\\n', 'white');
  
  log('🎯 Configuration complète! Bon développement! 🚀\\n', 'green');
}

function main() {
  log('\\n🚀 Initialisation de Multiplication Sprint...\\n', 'blue');
  
  // Créer .env
  createEnvFile();
  
  log('');
  
  // Vérifier les modules
  const hasDeps = checkNodeModules();
  
  log('');
  
  // Afficher le guide rapide
  displayQuickStart();
  
  if (!hasDeps) {
    log('⚠️  IMPORTANT: Installez d\'abord les dépendances avec npm install', 'red');
  }
}

// Exécuter
main();
