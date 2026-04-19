/**
 * 🌐 Module de synchronisation avec le serveur backend
 * Gère la sauvegarde et la récupération des données utilisateur
 */

const API_BASE_URL = window.location.origin;

// 🔄 Synchronisation des profils avec le serveur
async function syncProfileToServer(profile) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      console.warn('⚠️ Erreur lors de la sync du profil:', response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Profil synchronisé avec succès');
    return data;
  } catch (error) {
    console.warn('🚫 Erreur réseau lors de la sync du profil:', error);
    return null;
  }
}

// 📊 Sauvegarder un score sur le serveur
async function saveScoreToServer(scoreData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData)
    });

    if (!response.ok) {
      console.warn('⚠️ Erreur lors de la sauvegarde du score:', response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Score sauvegardé avec succès');
    return data;
  } catch (error) {
    console.warn('🚫 Erreur réseau lors de la sauvegarde du score:', error);
    return null;
  }
}

// 🏆 Récupérer le classement global
async function fetchLeaderboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
    
    if (!response.ok) {
      console.warn('⚠️ Erreur lors de la récupération du classement');
      return [];
    }

    const leaderboard = await response.json();
    return leaderboard;
  } catch (error) {
    console.warn('🚫 Erreur réseau lors du classement:', error);
    return [];
  }
}

// 🔍 Récupérer les scores d'un profil
async function fetchProfileScores(profileId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores/${profileId}`);
    
    if (!response.ok) {
      console.warn('⚠️ Erreur lors de la récupération des scores');
      return [];
    }

    const scores = await response.json();
    return scores;
  } catch (error) {
    console.warn('🚫 Erreur réseau lors des scores:', error);
    return [];
  }
}

// ❤️ Vérifier la santé du serveur
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.warn('🚫 Serveur indisponible');
    return false;
  }
}

// 📡 Intégration avec le système de sauvegarde existant
// Modifier la fonction persistProfiles pour aussi sauvegarder sur le serveur
const originalPersistProfiles = (typeof persistProfiles !== 'undefined') ? persistProfiles : null;

function enhancedPersistProfiles() {
  // Appeler la fonction originale (localStorage)
  if (originalPersistProfiles) {
    originalPersistProfiles();
  }
  
  // Ensuite synchroniser avec le serveur
  if (state && state.activeProfileId && state.profiles) {
    const currentProfile = state.profiles[state.activeProfileId];
    if (currentProfile) {
      syncProfileToServer({
        id: state.activeProfileId,
        name: currentProfile.name,
        badges: currentProfile.badges,
        bestScore: currentProfile.bestScore,
        highestUnlockedLevel: currentProfile.highestUnlockedLevel,
        levelStars: currentProfile.levelStars,
        stats: currentProfile.stats
      }).catch(err => console.warn('Sync non-critique échouée:', err));
    }
  }
}

// Remplacer la fonction persistProfiles si elle existe
if (typeof window !== 'undefined' && originalPersistProfiles) {
  window.persistProfiles = enhancedPersistProfiles;
}

// 💾 Sauvegarder aussi les scores à la fin d'un niveau
const originalShowCheckpoint = (typeof showCheckpoint !== 'undefined') ? showCheckpoint : null;

function enhancedShowCheckpoint() {
  // Appeler la fonction originale
  if (originalShowCheckpoint) {
    originalShowCheckpoint();
  }
  
  // Sauvegarder le score sur le serveur
  if (state && state.activeProfileId) {
    saveScoreToServer({
      profileId: state.activeProfileId,
      level: state.level,
      levelScore: state.levelScore,
      totalScore: state.score,
      stars: state.levelStars,
      mode: state.mode,
      accuracy: getAccuracy(state.levelCorrectAnswers, state.levelAttempts)
    }).catch(err => console.warn('Sync score non-critique échouée:', err));
  }
}

// Remplacer la fonction showCheckpoint si elle existe
if (typeof window !== 'undefined' && originalShowCheckpoint) {
  window.showCheckpoint = enhancedShowCheckpoint;
}

console.log('✅ Module API de synchronisation chargé');
