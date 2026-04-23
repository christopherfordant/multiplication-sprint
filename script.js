const STORAGE_KEY = "multiplication-sprint-best-score";
const PROFILE_STORAGE_KEY = "multiplication-sprint-profiles";
const ACTIVE_PROFILE_STORAGE_KEY = "multiplication-sprint-active-profile";
const TOTAL_LEVELS = 10;
const QUESTIONS_PER_LEVEL = 10;
const BONUS_STREAK = 3;
const BONUS_POINTS = 12;
const BONUS_TIME = 2;
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE_PARTICLE_COUNT = window.innerWidth < 768 ? 10 : 18;

console.log("🎮 Script chargé - Initialisation du jeu en cours...");

const BADGES = {
  first_win: { title: "Premier pas", description: "Valider un premier niveau" },
  star_hunter: { title: "Chasseur d'etoiles", description: "Gagner 3 etoiles sur un niveau" },
  perfect_level: { title: "Sans faute", description: "Finir un niveau a 100% de precision" },
  expert_brain: { title: "Cerveau expert", description: "Valider un niveau en mode expert" },
  duo_winner: { title: "Duel gagne", description: "Remporter une partie a 2 joueurs" },
  hundred_points: { title: "Mega score", description: "Depasser 1000 points" },
  castle_hero: { title: "Hero du chateau", description: "Battre le boss final du chateau" }
};

const MAP_LEVELS = [
  { x: 15, y: 71, title: "Prairie des 2", description: "Le premier sentier serpente entre les maisons, les ponts et les rivieres lumineuses.", biome: "prairie", landmark: "village" },
  { x: 28, y: 64, title: "Moulin des etoiles", description: "Le vent du moulin aide a memoriser les premieres tables.", biome: "prairie", landmark: "moulin" },
  { x: 21, y: 45, title: "Pont des lanternes", description: "Les ponts de pierre mènent vers une foret calme pleine de revisions utiles.", biome: "forest", landmark: "pont" },
  { x: 36, y: 37, title: "Bois des murmures", description: "Les arbres magiques melangent vitesse, attention et questions de transition.", biome: "forest", landmark: "foret" },
  { x: 45, y: 55, title: "Ruines dorees", description: "Le desert dore cache des passages anciens et des multiplications plus nerveuses.", biome: "desert", landmark: "ruines" },
  { x: 60, y: 43, title: "Camp du canyon", description: "Le soleil tape fort et le chemin se resserre avant les terres de pierre.", biome: "desert", landmark: "camp" },
  { x: 49, y: 25, title: "Falaises du veilleur", description: "Une citadelle claire domine les cascades et reveille les niveaux precedents.", biome: "cliffs", landmark: "falaises" },
  { x: 77, y: 66, title: "Tour de braise", description: "Les iles de lave demandent plus de sang-froid et une vraie precision.", biome: "cliffs", landmark: "tour" },
  { x: 84, y: 48, title: "Iles du dragon", description: "Le chemin se resserre entre les volcans avant la forteresse finale.", biome: "isles", landmark: "iles" },
  { x: 85, y: 28, title: "Chateau du boss", description: "La forteresse du boss garde les tables les plus coriaces du royaume.", biome: "isles", landmark: "chateau", boss: true }
];

const MODES = {
  kids: {
    label: "Enfant",
    baseTime: 12,
    passRatio: 0.55,
    levelScoreBase: 170,
    scorePerSecond: 8,
    levelPointMultiplier: 5,
    ranges: [
      { a: [1, 3], b: [1, 4] },
      { a: [1, 4], b: [2, 5] },
      { a: [2, 5], b: [2, 5] },
      { a: [3, 6], b: [2, 6] },
      { a: [4, 7], b: [3, 7] },
      { a: [5, 8], b: [4, 8] },
      { a: [6, 9], b: [5, 9] },
      { a: [7, 10], b: [6, 10] },
      { a: [8, 10], b: [7, 10] },
      { a: [9, 10], b: [8, 10] }
    ]
  },
  expert: {
    label: "Expert",
    baseTime: 9,
    passRatio: 0.7,
    levelScoreBase: 220,
    scorePerSecond: 11,
    levelPointMultiplier: 7,
    ranges: [
      { a: [2, 5], b: [2, 6] },
      { a: [3, 6], b: [3, 7] },
      { a: [4, 8], b: [4, 8] },
      { a: [5, 9], b: [4, 9] },
      { a: [6, 10], b: [5, 10] },
      { a: [7, 10], b: [6, 10] },
      { a: [8, 10], b: [7, 10] },
      { a: [9, 10], b: [8, 10] },
      { a: [9, 10], b: [9, 10] },
      { a: [10, 10], b: [9, 10] }
    ]
  }
};

const elements = {
  loadingScreen: document.getElementById("loadingScreen"),
  loadingBar: document.getElementById("loadingBar"),
  startScreen: document.getElementById("startScreen"),
  mapScreen: document.getElementById("mapScreen"),
  gameScreen: document.getElementById("gameScreen"),
  checkpointScreen: document.getElementById("checkpointScreen"),
  endScreen: document.getElementById("endScreen"),
  mapNavHubButton: document.getElementById("mapNavHubButton"),
  mapNavStatsButton: document.getElementById("mapNavStatsButton"),
  mapNavRewardsButton: document.getElementById("mapNavRewardsButton"),
  openMapButton: document.getElementById("openMapButton"),
  backToHubButton: document.getElementById("backToHubButton"),
  enterLevelButton: document.getElementById("enterLevelButton"),
  returnToMapButton: document.getElementById("returnToMapButton"),
  restartButton: document.getElementById("restartButton"),
  installButton: document.getElementById("installButton"),
  kidsModeButton: document.getElementById("kidsModeButton"),
  expertModeButton: document.getElementById("expertModeButton"),
  soloModeButton: document.getElementById("soloModeButton"),
  duoModeButton: document.getElementById("duoModeButton"),
  voiceToggleButton: document.getElementById("voiceToggleButton"),
  speakButton: document.getElementById("speakButton"),
  profileNameInput: document.getElementById("profileNameInput"),
  saveProfileButton: document.getElementById("saveProfileButton"),
  activeProfileName: document.getElementById("activeProfileName"),
  badgeCountStart: document.getElementById("badgeCountStart"),
  badgeShelfStart: document.getElementById("badgeShelfStart"),
  badgeShelfCheckpoint: document.getElementById("badgeShelfCheckpoint"),
  badgeShelfEnd: document.getElementById("badgeShelfEnd"),
  profileProgressText: document.getElementById("profileProgressText"),
  parentDashboard: document.getElementById("parentDashboard"),
  rewardCollection: document.getElementById("rewardCollection"),
  checkpointPrimaryButton: document.getElementById("checkpointPrimaryButton"),
  checkpointRetryButton: document.getElementById("checkpointRetryButton"),
  bestScoreStart: document.getElementById("bestScoreStart"),
  bestScoreGame: document.getElementById("bestScoreGame"),
  bestScoreEnd: document.getElementById("bestScoreEnd"),
  mapProfileName: document.getElementById("mapProfileName"),
  mapProgressDisplay: document.getElementById("mapProgressDisplay"),
  mapStarsDisplay: document.getElementById("mapStarsDisplay"),
  mapBestScoreDisplay: document.getElementById("mapBestScoreDisplay"),
  mapSceneMount: document.getElementById("mapSceneMount"),
  worldMap: document.getElementById("worldMap"),
  mapNodes: document.getElementById("mapNodes"),
  mapMascot: document.getElementById("mapMascot"),
  selectedLevelLabel: document.getElementById("selectedLevelLabel"),
  selectedLevelDescription: document.getElementById("selectedLevelDescription"),
  levelDisplay: document.getElementById("levelDisplay"),
  questionCountDisplay: document.getElementById("questionCountDisplay"),
  modeDisplay: document.getElementById("modeDisplay"),
  timerText: document.getElementById("timerText"),
  timerBar: document.getElementById("timerBar"),
  questionText: document.getElementById("questionText"),
  questionBadge: document.getElementById("questionBadge"),
  answerGrid: document.getElementById("answerGrid"),
  feedbackText: document.getElementById("feedbackText"),
  bonusBanner: document.getElementById("bonusBanner"),
  particleLayer: document.getElementById("particleLayer"),
  scoreDisplay: document.getElementById("scoreDisplay"),
  streakDisplay: document.getElementById("streakDisplay"),
  accuracyDisplay: document.getElementById("accuracyDisplay"),
  activePlayerLabel: document.getElementById("activePlayerLabel"),
  playerOneScore: document.getElementById("playerOneScore"),
  playerTwoScore: document.getElementById("playerTwoScore"),
  starsSummary: document.getElementById("starsSummary"),
  mascotName: document.getElementById("mascotName"),
  mascotSpeech: document.getElementById("mascotSpeech"),
  mascotAvatar: document.getElementById("mascotAvatar"),
  checkpointEyebrow: document.getElementById("checkpointEyebrow"),
  checkpointTitle: document.getElementById("checkpointTitle"),
  checkpointMessage: document.getElementById("checkpointMessage"),
  checkpointLevelScore: document.getElementById("checkpointLevelScore"),
  checkpointRequiredScore: document.getElementById("checkpointRequiredScore"),
  checkpointTotalScore: document.getElementById("checkpointTotalScore"),
  checkpointAccuracy: document.getElementById("checkpointAccuracy"),
  checkpointWinner: document.getElementById("checkpointWinner"),
  checkpointStars: document.getElementById("checkpointStars"),
  finalScore: document.getElementById("finalScore"),
  finalLevel: document.getElementById("finalLevel"),
  finalAccuracy: document.getElementById("finalAccuracy"),
  finalStars: document.getElementById("finalStars"),
  winnerMessage: document.getElementById("winnerMessage"),
  endEyebrow: document.getElementById("endEyebrow"),
  endTitle: document.getElementById("endTitle"),
  endMessage: document.getElementById("endMessage"),
  questionCard: document.getElementById("questionCard")
};

const state = {
  mode: "kids",
  sessionMode: "solo",
  voiceEnabled: true,
  level: 1,
  selectedLevel: 1,
  questionIndex: 0,
  score: 0,
  levelScore: 0,
  correctAnswers: 0,
  totalAttempts: 0,
  levelCorrectAnswers: 0,
  levelAttempts: 0,
  streak: 0,
  bestScore: readBestScore(),
  currentQuestion: null,
  currentQuestionSourceLevel: 1,
  answerOptions: [],
  levelStartSnapshot: null,
  timeLimit: MODES.kids.baseTime,
  timeRemaining: MODES.kids.baseTime,
  timerStartedAt: 0,
  timerRaf: 0,
  gameOver: false,
  acceptingAnswer: false,
  levelPassed: false,
  currentPlayer: 0,
  playerScores: [0, 0],
  starsEarned: 0,
  levelStars: 0,
  deferredInstallPrompt: null,
  profileName: "Champion",
  profiles: readProfiles(),
  activeProfileId: localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY) || "champion",
  unlockedBadges: [],
  lastUnlockedBadges: [],
  preferredVoice: null,
  highestUnlockedLevel: 1,
  levelStarsMap: Array(TOTAL_LEVELS).fill(0),
  mapScene3D: null,
  mapSceneLoader: null,
  dialogueQueue: [],
  isTyping: false,
  levelFailuresMap: {}
};

function readBestScore() {
  return Number.parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0;
}

function readProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function defaultProfile(name = "Champion") {
  return {
    name,
    badges: [],
    bestScore: 0,
    highestUnlockedLevel: 1,
    levelStars: Array(TOTAL_LEVELS).fill(0),
    stats: {
      gamesPlayed: 0,
      levelsCleared: 0,
      totalStars: 0,
      bestLevel: 1,
      correctAnswers: 0,
      totalAnswers: 0
    }
  };
}

function getProfileRecord(id, fallbackName = "Champion") {
  const existing = state.profiles[id];
  const base = defaultProfile(fallbackName);
  if (!existing) {
    return base;
  }
  return {
    ...base,
    ...existing,
    badges: Array.isArray(existing.badges) ? existing.badges : [],
    levelStars: Array.isArray(existing.levelStars) ? [...existing.levelStars, ...Array(Math.max(0, TOTAL_LEVELS - existing.levelStars.length)).fill(0)].slice(0, TOTAL_LEVELS) : [...base.levelStars],
    stats: {
      ...base.stats,
      ...(existing.stats || {})
    }
  };
}

function persistProfiles() {
  const current = getProfileRecord(state.activeProfileId, state.profileName);
  current.name = state.profileName;
  current.badges = [...state.unlockedBadges];
  current.bestScore = Math.max(current.bestScore || 0, state.bestScore);
  current.highestUnlockedLevel = state.highestUnlockedLevel;
  current.levelStars = [...state.levelStarsMap];
  current.stats = {
    ...current.stats,
    totalStars: state.levelStarsMap.reduce((sum, value) => sum + value, 0)
  };
  state.profiles[state.activeProfileId] = current;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
  localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, state.activeProfileId);
}

function saveBestScore(score) {
  if (score > state.bestScore) {
    state.bestScore = score;
    localStorage.setItem(STORAGE_KEY, String(score));
  }
  persistProfiles();
}

function normalizeProfileId(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 18) || "champion";
}

function ensureActiveProfile() {
  const profile = getProfileRecord(state.activeProfileId, "Champion");
  state.profileName = profile.name;
  state.unlockedBadges = [...profile.badges];
  state.highestUnlockedLevel = profile.highestUnlockedLevel || 1;
  state.levelStarsMap = [...profile.levelStars];
  state.bestScore = Math.max(state.bestScore, profile.bestScore || 0);
  state.profiles[state.activeProfileId] = profile;
  persistProfiles();
}

function switchToProfile(profileId, name) {
  state.activeProfileId = profileId;
  const profile = getProfileRecord(profileId, name);
  state.profileName = profile.name;
  state.unlockedBadges = [...profile.badges];
  state.highestUnlockedLevel = profile.highestUnlockedLevel || 1;
  state.levelStarsMap = [...profile.levelStars];
  state.bestScore = Math.max(readBestScore(), profile.bestScore || 0);
  state.selectedLevel = Math.min(state.highestUnlockedLevel, TOTAL_LEVELS);
  persistProfiles();
}

function renderBadgeShelf(container, badgeIds, highlight = []) {
  container.innerHTML = "";
  if (!badgeIds.length) {
    container.innerHTML = "<div class=\"badge-chip\"><strong>Aucun badge</strong><span>Continue a jouer pour debloquer des recompenses.</span></div>";
    return;
  }
  badgeIds.forEach((badgeId) => {
    const meta = BADGES[badgeId];
    if (!meta) return;
    const badge = document.createElement("article");
    badge.className = "badge-chip";
    if (highlight.includes(badgeId)) badge.classList.add("badge-chip-new");
    badge.innerHTML = `<strong>${meta.title}</strong><span>${meta.description}</span>`;
    container.appendChild(badge);
  });
}

function renderRewardCollection() {
  elements.rewardCollection.innerHTML = "";
  const rewards = Object.entries(BADGES);
  rewards.forEach(([id, meta]) => {
    const unlocked = state.unlockedBadges.includes(id);
    const card = document.createElement("article");
    card.className = "reward-card";
    card.style.opacity = unlocked ? "1" : "0.55";
    card.innerHTML = `<strong>${meta.title}</strong><span>${unlocked ? meta.description : "Encore verrouille"}</span>`;
    elements.rewardCollection.appendChild(card);
  });
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bon matin !";
  if (hour < 18) return "Bon après-midi !";
  return "Bonsoir !";
}

function renderParentDashboard() {
  elements.parentDashboard.innerHTML = "";
  const ids = Object.keys(state.profiles);
  if (!ids.length) {
    elements.parentDashboard.innerHTML = "<article class=\"dashboard-card\"><strong>Aucun profil</strong><span>Cree un premier profil enfant.</span></article>";
    return;
  }
  ids.forEach((id) => {
    const profile = getProfileRecord(id, "Champion");
    const accuracy = profile.stats.totalAnswers ? Math.round((profile.stats.correctAnswers / profile.stats.totalAnswers) * 100) : 0;
    const card = document.createElement("article");
    card.className = "dashboard-card";
    if (id === state.activeProfileId) {
      card.style.borderColor = "rgba(31, 111, 255, 0.48)";
    }
    card.innerHTML = `
      <strong>${profile.name}</strong>
      <span>Parties: ${profile.stats.gamesPlayed}</span>
      <span>Niveaux valides: ${profile.stats.levelsCleared}</span>
      <span>Etoiles: ${profile.stats.totalStars}</span>
      <span>Precision: ${accuracy}%</span>
      <span>Plus haut niveau: ${profile.stats.bestLevel}</span>
    `;
    elements.parentDashboard.appendChild(card);
  });
}

function updateProfileUI() {
  elements.activeProfileName.textContent = state.profileName;
  elements.profileNameInput.value = state.profileName === "Champion" ? "" : state.profileName;
  elements.badgeCountStart.textContent = state.unlockedBadges.length;
  elements.profileProgressText.textContent = `Niveau debloque: ${state.highestUnlockedLevel}`;
  elements.mapProfileName.textContent = state.profileName;
  renderBadgeShelf(elements.badgeShelfStart, state.unlockedBadges);
  renderBadgeShelf(elements.badgeShelfEnd, state.unlockedBadges);
  renderRewardCollection();
  renderParentDashboard();
}

function saveProfileFromInput() {
  console.log("💾 saveProfileFromInput: Tentative de sauvegarde...");
  const rawName = elements.profileNameInput.value.trim();
  const nextName = rawName || "Champion";
  const nextId = normalizeProfileId(nextName);
  
  const isNewProfile = !state.profiles[nextId];
  
  // Mise à jour de l'état local avant le switch
  state.profileName = nextName;
  state.activeProfileId = nextId;

  switchToProfile(nextId, nextName);
  
  if (isNewProfile) {
    state.mapScene3D?.playWaveAnimation?.();
  }

  updateBestScoreDisplays();
  updateProfileUI();
  renderMap();
  selectMapLevel(state.selectedLevel, true);
  
  const greeting = getTimeGreeting();
  setMascotSpeech(`Salut ${state.profileName} ! ${greeting}`);
  console.log(`✅ Profil [${nextName}] validé et actif.`);
}

function unlockBadge(badgeId) {
  if (state.unlockedBadges.includes(badgeId)) return;
  state.unlockedBadges.push(badgeId);
  state.lastUnlockedBadges.push(badgeId);
  persistProfiles();
}

function getModeConfig() {
  return MODES[state.mode];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function getAccuracy(correct, attempts) {
  return attempts ? Math.round((correct / attempts) * 100) : 100;
}

function setMascotSpeech(message) {
  state.dialogueQueue.push(message);
  if (!state.isTyping) {
    processNextDialogue();
  }
}

function processNextDialogue() {
  if (state.dialogueQueue.length === 0) {
    state.isTyping = false;
    return;
  }

  state.isTyping = true;
  const message = state.dialogueQueue.shift();
  elements.mascotName.textContent = "Nova";
  
  // Animation de la mascotte pendant qu'elle parle
  if (window.gsap && !REDUCED_MOTION) {
    gsap.to(elements.mascotAvatar, { 
      scale: 1.05, 
      duration: 0.2, 
      yoyo: true, 
      repeat: 1 
    });
  }

  typeWriteText(message, elements.mascotSpeech, () => {
    // Pause entre les messages si la file n'est pas vide
    window.setTimeout(processNextDialogue, 1500);
  });
}

function typeWriteText(text, container, callback) {
  container.textContent = "";
  let index = 0;
  
  // Vitesse de frappe (plus rapide pour les longs messages)
  const speed = text.length > 50 ? 20 : 40;

  function type() {
    if (index < text.length) {
      container.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  type();
}

function getAdviceForLevel(level) {
  const advices = {
    1: "Astuce : Multiplier par 2, c'est juste calculer le double !",
    2: "Le vent du moulin dit : 3 x 3 font 9, ne l'oublie pas !",
    4: "Pour la table de 4, double le résultat de la table de 2 !",
    5: "La table de 5 finit toujours par 0 ou 5, facile non ?",
    10: "Concentration ! Pour le boss, regarde bien le résultat pour trouver le trou."
  };
  return advices[level] || "Respire un grand coup, tu vas y arriver !";
}

function selectPreferredVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const frenchVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("fr"));
  state.preferredVoice =
    frenchVoices.find((voice) => /google|microsoft|hortense|denise|paul/i.test(voice.name)) ||
    frenchVoices[0] ||
    voices[0] ||
    null;
}

function setHeroState(stateName, scope = document) {
  scope.querySelectorAll(".hero-sprite").forEach((sprite) => {
    sprite.dataset.state = stateName;
  });
}

function setMapHeroState(stateName) {
  if (elements.mapMascot) {
    elements.mapMascot.dataset.state = stateName;
  }
}

async function loadMapSceneFactory() {
  if (window.MultiplicationSprintMapScene?.createMapScene) {
    return window.MultiplicationSprintMapScene.createMapScene;
  }

  if (!state.mapSceneLoader) {
    state.mapSceneLoader = import("./map-scene.js?v=20260423c")
      .then(() => window.MultiplicationSprintMapScene?.createMapScene || null)
      .catch((error) => {
        console.error("Map scene module failed to load:", error);
        return null;
      });
  }

  return state.mapSceneLoader;
}

async function ensureMapScene3D() {
  if (!elements.mapSceneMount || !elements.worldMap) {
    return false;
  }

  const factory = await loadMapSceneFactory();
  if (!factory) {
    throw new Error("Le module de rendu 3D (map-scene.js) n'a pas pu être chargé");
  }

  if (!state.mapScene3D) {
    state.mapScene3D = factory(elements.mapSceneMount, REDUCED_MOTION);
  }

  state.mapScene3D.setUnlockedLevel(state.highestUnlockedLevel);
  state.mapScene3D.setSelectedLevel(state.selectedLevel);
  state.mapScene3D.resize?.();
}

async function hydrateMapScene3D() {
  console.log("hydrateMapScene3D: Début de l'hydratation 3D.");
  try {
    console.log(`hydrateMapScene3D: mapSceneMount dimensions avant reflow: ${elements.mapSceneMount.clientWidth}x${elements.mapSceneMount.clientHeight}`);
    elements.mapSceneMount.offsetHeight; // Force reflow to ensure correct dimensions
    console.log(`hydrateMapScene3D: mapSceneMount dimensions après reflow: ${elements.mapSceneMount.clientWidth}x${elements.mapSceneMount.clientHeight}`);

    // On force l'ajout de la classe WebGL pour masquer les éléments 2D redondants
    
    // (elements.worldMap) elements.worldMap.style.background = "transparent";

    console.log("hydrateMapScene3D: Appel de ensureMapScene3D...");
    await ensureMapScene3D();
    console.log("hydrateMapScene3D: ensureMapScene3D terminé. Tentative de redimensionnement.");
    
    setTimeout(() => state.mapScene3D?.resize?.(), 100); // On force un resize après un court délai pour s'assurer que le canvas occupe tout l'espace
  } catch (error) {
    console.error("Échec de l'hydratation 3D, repli sur la carte 2D :", error);
  }
}

function showScreen(screen) {
  const screens = [elements.startScreen, elements.mapScreen, elements.gameScreen, elements.checkpointScreen, elements.endScreen];
  
  // Hide other screens
  screens.forEach((node) => {
    if (node !== screen && node.classList.contains("screen-active")) {
      node.classList.remove("screen-active");
    }
  });

  // Retrait de la mascotte pendant le jeu pour plus de clarté et immersion
  const mascotRow = document.querySelector('.mascot-row');
  if (mascotRow) {
    const isGameScreen = screen === elements.gameScreen;
    mascotRow.style.display = isGameScreen ? "none" : "grid";
    mascotRow.style.opacity = isGameScreen ? "0" : "1";
  }

  // Show target screen - add class first so display: block is applied
  screen.classList.add("screen-active");
  
  // Then animate content with GSAP if available
  if (window.gsap && !REDUCED_MOTION) {
    // Animate the screen itself
    gsap.fromTo(screen, 
      { opacity: 0, filter: "blur(10px)" }, 
      { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", clearProps: "filter" }
    );
    
    // Animate content elements with stagger
    const cards = screen.querySelectorAll(".hero-card, .question-card, .map-screen-shell, .end-card, .checkpoint-card");
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out", stagger: 0.08 }
      );
    }
  }

  window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
}

function updateBestScoreDisplays() {
  if (elements.bestScoreStart) elements.bestScoreStart.textContent = state.bestScore;
  if (elements.bestScoreGame) elements.bestScoreGame.textContent = state.bestScore;
  if (elements.bestScoreEnd) elements.bestScoreEnd.textContent = state.bestScore;
  if (elements.mapBestScoreDisplay) elements.mapBestScoreDisplay.textContent = state.bestScore;
}

function setMode(mode) {
  state.mode = mode;
  state.timeLimit = getModeConfig().baseTime;
  elements.kidsModeButton.classList.toggle("mode-card-active", mode === "kids");
  elements.expertModeButton.classList.toggle("mode-card-active", mode === "expert");
  elements.kidsModeButton.setAttribute("aria-checked", String(mode === "kids"));
  elements.expertModeButton.setAttribute("aria-checked", String(mode === "expert"));
}

function setSessionMode(mode) {
  state.sessionMode = mode;
  elements.soloModeButton.classList.toggle("mode-card-active", mode === "solo");
  elements.duoModeButton.classList.toggle("mode-card-active", mode === "duo");
  elements.soloModeButton.setAttribute("aria-checked", String(mode === "solo"));
  elements.duoModeButton.setAttribute("aria-checked", String(mode === "duo"));
}

function setVoiceEnabled(enabled) {
  state.voiceEnabled = enabled;
  elements.voiceToggleButton.classList.toggle("chip-button-active", enabled);
  elements.voiceToggleButton.textContent = enabled ? "Activee" : "Coupee";
  elements.voiceToggleButton.setAttribute("aria-pressed", String(enabled));
}

function updatePlayerPanel() {
  elements.activePlayerLabel.textContent = state.sessionMode === "duo" ? `Joueur ${state.currentPlayer + 1}` : state.profileName;
  elements.playerOneScore.textContent = state.playerScores[0];
  elements.playerTwoScore.textContent = state.sessionMode === "duo" ? state.playerScores[1] : "-";
  elements.starsSummary.textContent = `${state.starsEarned}★`;
}

function updateScoreboard() {
  elements.scoreDisplay.textContent = state.score;
  elements.streakDisplay.textContent = state.streak;
  elements.accuracyDisplay.textContent = `${getAccuracy(state.correctAnswers, state.totalAttempts)}%`;
  elements.levelDisplay.textContent = state.level;
  elements.questionCountDisplay.textContent = Math.min(state.questionIndex + 1, QUESTIONS_PER_LEVEL);
  elements.modeDisplay.textContent = getModeConfig().label;
  updatePlayerPanel();
}

function captureLevelSnapshot() {
  state.levelStartSnapshot = {
    score: state.score,
    correctAnswers: state.correctAnswers,
    totalAttempts: state.totalAttempts,
    playerScores: [...state.playerScores],
    starsEarned: state.starsEarned,
    levelStarsMap: [...state.levelStarsMap]
  };
}

function restoreLevelSnapshot() {
  if (!state.levelStartSnapshot) return;
  state.score = state.levelStartSnapshot.score;
  state.correctAnswers = state.levelStartSnapshot.correctAnswers;
  state.totalAttempts = state.levelStartSnapshot.totalAttempts;
  state.playerScores = [...state.levelStartSnapshot.playerScores];
  state.starsEarned = state.levelStartSnapshot.starsEarned;
  state.levelStarsMap = [...state.levelStartSnapshot.levelStarsMap];
}

function requiredScoreForLevel(level) {
  const config = getModeConfig();
  const theoreticalBest = (config.baseTime * config.scorePerSecond + level * config.levelPointMultiplier) * QUESTIONS_PER_LEVEL + Math.floor(QUESTIONS_PER_LEVEL / BONUS_STREAK) * BONUS_POINTS;
  const dynamicBase = config.levelScoreBase + (level - 1) * 28;
  return Math.min(theoreticalBest - 20, Math.max(120, Math.round(Math.max(dynamicBase, theoreticalBest * config.passRatio))));
}

function calculateStars(levelScore, required) {
  if (levelScore < required) return 0;
  if (levelScore >= required * 1.45) return 3;
  if (levelScore >= required * 1.18) return 2;
  return 1;
}

function renderStars(container, count) {
  [...container.children].forEach((star, index) => {
    const shouldBeOn = index < count;
    star.classList.toggle("star-on", shouldBeOn);
    
    // Animate stars with GSAP
    if (shouldBeOn && window.gsap && !REDUCED_MOTION) {
      gsap.fromTo(star,
        { scale: 0.3, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.5, 
          delay: index * 0.15,
          ease: "elastic.out(1.2, 0.5)"
        }
      );
    }
  });
}

function updateSelectedLevelCard() {
  const levelData = MAP_LEVELS[state.selectedLevel - 1];
  const biomeNames = {
    prairie: "Prairies",
    forest: "Foret",
    desert: "Desert",
    cliffs: "Falaises",
    isles: "Iles"
  };
  elements.selectedLevelLabel.textContent = `Niveau ${state.selectedLevel} · ${levelData.title}`;
  elements.selectedLevelDescription.textContent = `${biomeNames[levelData.biome] || "Monde"} · ${levelData.description}`;
  elements.enterLevelButton.textContent = levelData.boss ? "Entrer dans le boss" : "Entrer dans le niveau";
  elements.enterLevelButton.disabled = state.selectedLevel > state.highestUnlockedLevel;
}

function positionMascotOnMap(instant = false) {
  // On masque la mascotte DOM car elle est maintenant gérée par Three.js
  if (elements.mapMascot) elements.mapMascot.style.display = "none";
  
  const levelData = MAP_LEVELS[state.selectedLevel - 1];
  const targetX = `calc(${levelData.x}% - 41px)`;
  const targetY = `calc(${levelData.y}% - 56px)`;

  if (!window.gsap || REDUCED_MOTION || instant) {
    elements.mapMascot.style.left = targetX;
    elements.mapMascot.style.top = targetY;
    setMapHeroState("idle");
    elements.mapMascot.dataset.lastX = String(levelData.x);
    return;
  }
  setMapHeroState("walk");
  const previousX = Number.parseFloat(elements.mapMascot.dataset.lastX || String(levelData.x));
  const facing = levelData.x >= previousX ? 1 : -1;
  elements.mapMascot.style.transform = `scaleX(${facing})`;
  gsap.killTweensOf(elements.mapMascot);
  gsap.timeline({
    onComplete: () => {
      setMapHeroState("idle");
      elements.mapMascot.dataset.lastX = String(levelData.x);
      state.mapScene3D?.setSelectedLevel(state.selectedLevel);
    }
  })
    .to(elements.mapMascot, { left: targetX, top: targetY, duration: 0.72, ease: "power1.inOut" }, 0)
    .to(elements.mapMascot, { y: -8, duration: 0.16, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0);
}

function selectMapLevel(level, instant = false) {
  state.selectedLevel = level;
  state.mapScene3D?.setSelectedLevel(level);
  renderMap();
  positionMascotOnMap(instant);
}

function renderMap() {
  // Le rendu des niveaux est désormais géré par les lanternes 3D dans map-scene.js.
  elements.mapProgressDisplay.textContent = `${state.highestUnlockedLevel}/10`;
  elements.mapStarsDisplay.textContent = state.levelStarsMap.reduce((sum, value) => sum + value, 0);
  state.mapScene3D?.setUnlockedLevel(state.highestUnlockedLevel);
  state.mapScene3D?.setSelectedLevel(state.selectedLevel);
  updateSelectedLevelCard();
}

function renderMapPath() {
  const pathHost = document.getElementById("mapPath");
  if (!pathHost) {
    return;
  }

  const points = MAP_LEVELS.map(({ x, y }) => ({ x, y }));
  const d = points.map((point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    const controlY = previous.y < point.y
      ? Math.max(previous.y, point.y) - 3
      : Math.min(previous.y, point.y) + 3;

    return `Q ${controlX} ${controlY} ${point.x} ${point.y}`;
  }).join(" ");

  pathHost.innerHTML = `
    <svg class="map-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="map-path-shadow" d="${d}" pathLength="100"></path>
      <path class="map-path-main" d="${d}" pathLength="100"></path>
      <path class="map-path-dash" d="${d}" pathLength="100"></path>
    </svg>
  `;
}

function generateQuestion() {
  const currentLevelIndex = state.level - 1;
  const config = getModeConfig().ranges[currentLevelIndex];
  
  if (state.level === TOTAL_LEVELS) { // Boss level
    const factor1 = randomBetween(config.a[0], config.a[1]);
    const factor2 = randomBetween(config.b[0], config.b[1]);
    const product = factor1 * factor2;
    
    let questionDisplay;
    let correctAnswer;
    
    if (Math.random() < 0.5) { // Hide factor1
      questionDisplay = `? x ${factor2} = ${product}`;
      correctAnswer = factor1;
    } else { // Hide factor2
      questionDisplay = `${factor1} x ? = ${product}`;
      correctAnswer = factor2;
    }
    
    state.currentQuestionSourceLevel = TOTAL_LEVELS; // Always boss level
    return { first: factor1, second: factor2, answer: correctAnswer, display: questionDisplay, isBoss: true };
  } else { // Normal level
    const shouldReviewPreviousLevel = state.level > 1 && Math.random() < 0.35;
    const selectedLevelIndex = shouldReviewPreviousLevel ? randomBetween(0, currentLevelIndex - 1) : currentLevelIndex;
    const normalConfig = getModeConfig().ranges[selectedLevelIndex];
    const first = randomBetween(normalConfig.a[0], normalConfig.a[1]);
    const second = randomBetween(normalConfig.b[0], normalConfig.b[1]);
    state.currentQuestionSourceLevel = selectedLevelIndex + 1;
    return { first, second, answer: first * second, display: `${first} x ${second}`, isBoss: false };
  }
}

function generateAnswerOptions(answer) {
  const options = new Set([answer]);
  while (options.size < 5) {
    const spread = randomBetween(1, Math.max(6, Math.round(answer * 0.25)));
    const direction = Math.random() > 0.5 ? 1 : -1;
    options.add(Math.max(0, answer + spread * direction));
  }
  return shuffle([...options]);
}

function renderAnswerOptions() {
  elements.answerGrid.innerHTML = "";
  state.answerOptions.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.textContent = option;
    button.setAttribute("aria-label", `Reponse ${index + 1}: ${option}`);
    button.dataset.value = String(option);
    button.addEventListener("click", () => selectAnswer(option, button));
    elements.answerGrid.appendChild(button);
    
    // Add animation for button appearance
    if (window.gsap && !REDUCED_MOTION) {
      gsap.fromTo(button, 
        { opacity: 0, scale: 0.8, y: 16 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.35, 
          delay: index * 0.08, 
          ease: "back.out(1.4)" 
        }
      );
    }
  });
}

function setFeedback(message, type = "") {
  elements.feedbackText.textContent = message;
  elements.feedbackText.classList.remove("feedback-success", "feedback-error");
  if (type === "success") elements.feedbackText.classList.add("feedback-success");
  if (type === "error") elements.feedbackText.classList.add("feedback-error");
  
  // Animate feedback message
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(elements.feedbackText,
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.3,
        ease: "back.out(1.5)"
      }
    );
  }
}

function updateQuestionUI() {
  elements.questionText.textContent = state.currentQuestion.display;
  elements.questionBadge.textContent = state.currentQuestionSourceLevel < state.level ? `Revision du niveau ${state.currentQuestionSourceLevel}` : state.level === TOTAL_LEVELS ? "Boss du chateau" : `Niveau ${state.level}`;
  renderAnswerOptions();
  setFeedback("Choisis la bonne reponse avant la fin du chrono.");
  elements.bonusBanner.textContent = "";
  state.acceptingAnswer = true;
  // On ne met à jour la voix que si nécessaire, mais on n'affiche plus la bulle si la mascotte est masquée
  if (state.sessionMode === "duo") {
    setMascotSpeech(`A toi Joueur ${state.currentPlayer + 1} !`);
  }
  updateScoreboard();
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(elements.questionCard, { opacity: 0, scale: 0.92, y: 26 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" });
  }
  if (state.voiceEnabled) {
    window.setTimeout(speakQuestion, 180);
  }
}

function stopTimer() {
  if (state.timerRaf) cancelAnimationFrame(state.timerRaf);
  state.timerRaf = 0;
}

function renderTimer() {
  const ratio = clamp(state.timeRemaining / state.timeLimit, 0, 1);
  elements.timerText.textContent = `${state.timeRemaining.toFixed(1)} s`;
  elements.timerBar.style.transform = `scaleX(${ratio})`;
  elements.timerBar.parentElement.setAttribute("aria-valuenow", String(state.timeRemaining.toFixed(1)));
}

function tickTimer(now) {
  const elapsed = (now - state.timerStartedAt) / 1000;
  state.timeRemaining = Math.max(0, state.timeLimit - elapsed);
  renderTimer();
  if (state.timeRemaining <= 0) {
    revealCorrectOption();
    handleWrongAnswer("Temps ecoule ! La bonne reponse s'est echappee.");
    return;
  }
  state.timerRaf = requestAnimationFrame(tickTimer);
}

function startTimer() {
  stopTimer();
  state.timeRemaining = state.timeLimit;
  state.timerStartedAt = performance.now();
  elements.timerBar.parentElement.setAttribute("aria-valuemax", String(state.timeLimit));
  renderTimer();
  state.timerRaf = requestAnimationFrame(tickTimer);
}

function ensureAudioContext() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  const context = ensureAudioContext.ctx || new AudioContextCtor();
  ensureAudioContext.ctx = context;
  if (context.state === "suspended") context.resume().catch(() => {});
  return context;
}

function playSound(type) {
  const context = ensureAudioContext();
  if (!context) return;
  const settings = {
    start: type === "success" ? 640 : type === "bonus" ? 720 : type === "pass" ? 520 : 180,
    end: type === "success" ? 880 : type === "bonus" ? 1120 : type === "pass" ? 920 : 120,
    duration: type === "bonus" ? 0.35 : type === "pass" ? 0.45 : 0.22,
    wave: type === "wrong" ? "square" : "triangle"
  };
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = settings.wave;
  oscillator.frequency.setValueAtTime(settings.start, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(settings.end, context.currentTime + settings.duration);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + settings.duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + settings.duration);
}

function speakQuestion() {
  if (!state.voiceEnabled || !("speechSynthesis" in window) || !state.currentQuestion) return;
  window.speechSynthesis.cancel();
  let speechText;
  if (state.currentQuestion.isBoss) {
    if (state.currentQuestion.display.startsWith('?')) {
      speechText = `Combien fois ${state.currentQuestion.second} égale ${state.currentQuestion.first * state.currentQuestion.second}`;
    } else {
      speechText = `${state.currentQuestion.first} fois combien égale ${state.currentQuestion.first * state.currentQuestion.second}`;
    }
  } else {
    speechText = `${state.currentQuestion.first} fois ${state.currentQuestion.second}`;
  }
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = "fr-FR";
  utterance.rate = state.mode === "kids" ? 0.92 : 1;
  if (state.preferredVoice) utterance.voice = state.preferredVoice;
  window.speechSynthesis.speak(utterance);
}

function createParticles(kind) {
  if (!window.gsap || REDUCED_MOTION) return;
  const colors = kind === "success" ? ["#21c06b", "#ffd54a", "#1f6fff", "#ff5f6d"] : ["#ff5f6d", "#ff9966", "#ffd54a"];
  for (let index = 0; index < MOBILE_PARTICLE_COUNT; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.background = colors[index % colors.length];
    elements.particleLayer.appendChild(particle);
    const angle = (Math.PI * 2 * index) / MOBILE_PARTICLE_COUNT;
    const distance = randomBetween(70, window.innerWidth < 768 ? 120 : 180);
    gsap.fromTo(
      particle,
      { x: 0, y: 0, scale: 0.3, opacity: 1, rotation: 0 },
      {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: randomBetween(8, 15) / 10,
        rotation: randomBetween(90, 280),
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        onComplete: () => particle.remove()
      }
    );
  }
}

function animateWrongAnswer() {
  document.body.classList.add("screen-shake");
  window.setTimeout(() => document.body.classList.remove("screen-shake"), 420);
  playSound("wrong");
}

function disableAnswerButtons() {
  elements.answerGrid.querySelectorAll(".answer-option").forEach((button) => {
    button.disabled = true;
  });
}

function revealCorrectOption(selectedButton = null) {
  elements.answerGrid.querySelectorAll(".answer-option").forEach((button) => {
    const isCorrect = Number(button.dataset.value) === state.currentQuestion.answer;
    button.classList.toggle("answer-option-correct", isCorrect);
    if (selectedButton && button === selectedButton && !isCorrect) {
      button.classList.add("answer-option-wrong");
    }
  });
}

function showBonus() {
  elements.bonusBanner.textContent = `Bonus ! +${BONUS_POINTS} points et +${BONUS_TIME} s pour la prochaine question`;
  state.score += BONUS_POINTS;
  state.levelScore += BONUS_POINTS;
  state.playerScores[state.currentPlayer] += BONUS_POINTS;
  state.timeLimit = getModeConfig().baseTime + BONUS_TIME;
  updateScoreboard();
  
  // Animate bonus banner
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(elements.bonusBanner,
      { opacity: 0, scale: 0.8, y: -20 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.5,
        ease: "back.out(1.2)"
      }
    );
  }
  
  createParticles("success");
  playSound("bonus");
  setMascotSpeech("Wouhou ! Bonus debloque.");
}

function scheduleNextQuestion() {
  window.setTimeout(() => {
    if (!state.gameOver) advanceGameFlow();
  }, REDUCED_MOTION ? 180 : 760);
}

function handleCorrectAnswer(selectedButton) {
  stopTimer();
  state.acceptingAnswer = false;
  disableAnswerButtons();
  revealCorrectOption(selectedButton);

  state.totalAttempts += 1;
  state.levelAttempts += 1;
  state.correctAnswers += 1;
  state.levelCorrectAnswers += 1;
  state.streak += 1;

  const config = getModeConfig();
  const timePoints = Math.max(3, Math.round(state.timeRemaining * config.scorePerSecond));
  const levelPoints = state.level * config.levelPointMultiplier;
  const gain = timePoints + levelPoints;
  state.score += gain;
  state.levelScore += gain;
  state.playerScores[state.currentPlayer] += gain;

  setFeedback(`Parfait ! +${gain} points`, "success");
  setMascotSpeech(state.level === TOTAL_LEVELS ? "Le boss tremble ! Continue." : "Bien joue, le chemin s'ouvre.");
  createParticles("success");
  playSound("success");

  if (state.streak % BONUS_STREAK === 0) {
    showBonus();
  } else {
    elements.bonusBanner.textContent = "";
    state.timeLimit = config.baseTime;
  }

  state.questionIndex += 1;
  updateScoreboard();
  scheduleNextQuestion();
}

function handleWrongAnswer(reason) {
  stopTimer();
  state.acceptingAnswer = false;
  disableAnswerButtons();
  state.totalAttempts += 1;
  state.levelAttempts += 1;
  state.streak = 0;
  state.timeLimit = getModeConfig().baseTime;
  setFeedback(reason, "error");
  setMascotSpeech("Pas grave, on repart plus fort !");
  animateWrongAnswer();
  state.questionIndex += 1;
  updateScoreboard();
  scheduleNextQuestion();
}

function selectAnswer(value, button) {
  if (!state.acceptingAnswer || state.gameOver) return;
  if (value === state.currentQuestion.answer) {
    handleCorrectAnswer(button);
  } else {
    button.classList.add("answer-option-wrong");
    revealCorrectOption(button);
    handleWrongAnswer(`Aie ! La bonne reponse etait ${state.currentQuestion.answer}.`);
  }
}

function beginQuestion() {
  state.currentPlayer = state.sessionMode === "duo" ? state.questionIndex % 2 : 0;
  state.currentQuestion = generateQuestion();
  state.answerOptions = generateAnswerOptions(state.currentQuestion.answer);
  updateQuestionUI();
  startTimer();
}

function beginLevelFromMap() {
  state.level = state.selectedLevel;
  state.questionIndex = 0;
  state.levelScore = 0;
  state.levelCorrectAnswers = 0;
  state.levelAttempts = 0;
  state.streak = 0;
  state.levelStars = 0;
  state.timeLimit = getModeConfig().baseTime;
  state.lastUnlockedBadges = [];
  
  // Apply boss level specific time reduction
  if (state.level === TOTAL_LEVELS) {
    state.timeLimit = state.timeLimit * 0.8; // 20% reduction
  }
  captureLevelSnapshot();
  
  // Mise à jour de l'arrière-plan immersif basé sur le biome
  const levelData = MAP_LEVELS[state.level - 1];
  elements.gameScreen.dataset.biome = levelData.biome;
  
  showScreen(elements.gameScreen);
  beginQuestion();
}

function updateProgressAfterWin() {
  const profile = getProfileRecord(state.activeProfileId, state.profileName);
  const previousUnlocked = state.highestUnlockedLevel;
  
  profile.stats.levelsCleared += 1;
  profile.stats.bestLevel = Math.max(profile.stats.bestLevel, state.level);
  state.highestUnlockedLevel = Math.min(TOTAL_LEVELS, Math.max(state.highestUnlockedLevel, state.level + 1));
  state.levelStarsMap[state.level - 1] = Math.max(state.levelStarsMap[state.level - 1], state.levelStars);
  state.selectedLevel = state.level === TOTAL_LEVELS ? TOTAL_LEVELS : Math.min(state.highestUnlockedLevel, state.level + 1);

  // Déclenchement de l'animation 3D si déblocage
  if (state.highestUnlockedLevel > previousUnlocked) {
    state.mapScene3D?.playUnlockAnimation(state.highestUnlockedLevel);
  }

  profile.highestUnlockedLevel = state.highestUnlockedLevel;
  profile.levelStars = [...state.levelStarsMap];
  profile.stats.totalStars = state.levelStarsMap.reduce((sum, value) => sum + value, 0);
  state.profiles[state.activeProfileId] = profile;
}

function showCheckpoint() {
  const required = requiredScoreForLevel(state.level);
  const levelAccuracy = getAccuracy(state.levelCorrectAnswers, state.levelAttempts);
  state.levelPassed = state.levelScore >= required;
  state.levelStars = calculateStars(state.levelScore, required);

  elements.checkpointLevelScore.textContent = state.levelScore;
  elements.checkpointRequiredScore.textContent = required;
  elements.checkpointTotalScore.textContent = state.score;
  elements.checkpointAccuracy.textContent = `${levelAccuracy}%`;
  renderStars(elements.checkpointStars, state.levelStars);

  if (state.levelPassed) {
    // On s'assure que les fonctions globales sont disponibles pour api-sync.js
    window.state = state;
    window.getAccuracy = getAccuracy;
    window.persistProfiles = persistProfiles;

    updateProgressAfterWin();
    state.starsEarned = state.levelStarsMap.reduce((sum, value) => sum + value, 0);
    unlockBadge("first_win");
    if (state.levelStars === 3) unlockBadge("star_hunter");
    if (levelAccuracy === 100) unlockBadge("perfect_level");
    if (state.mode === "expert") unlockBadge("expert_brain");
    if (state.level === TOTAL_LEVELS) unlockBadge("castle_hero");
    elements.checkpointEyebrow.textContent = state.level === TOTAL_LEVELS ? "Boss vaincu" : "Niveau valide";
    elements.checkpointTitle.textContent = state.level === TOTAL_LEVELS ? "Le chateau est libre !" : "Retour a la carte";
    elements.checkpointMessage.textContent = state.level === TOTAL_LEVELS
      ? "Tu as battu le boss du chateau. Le monde entier t'applaudit."
      : "Ton score est suffisant. La mascotte peut avancer sur la prochaine case.";
    elements.checkpointPrimaryButton.textContent = state.level === TOTAL_LEVELS ? "Voir la fin" : "Retour a la carte";
    setMascotSpeech(state.level === TOTAL_LEVELS ? "Le boss est battu !" : "Une nouvelle case vient de s'ouvrir.");

    // On déclenche les confettis 3D
    if (state.mapScene3D) {
      state.mapScene3D.spawnVictoryConfetti?.();
    }

    playSound("pass");
    createParticles("success");
  } else {
    elements.checkpointEyebrow.textContent = "Niveau a retenter";
    elements.checkpointTitle.textContent = "Tu peux faire mieux !";
    elements.checkpointMessage.textContent = "Le score du niveau n'est pas suffisant. Tu peux revenir sur la carte ou retenter ce niveau.";
    elements.checkpointPrimaryButton.textContent = "Retour a la carte";
    setMascotSpeech("On peut retenter ce niveau quand tu veux.");
    
    // Suivi des échecs pour conseils
    state.levelFailuresMap[state.level] = (state.levelFailuresMap[state.level] || 0) + 1;
    if (state.levelFailuresMap[state.level] >= 2) {
      setMascotSpeech(getAdviceForLevel(state.level));
    }
  }

  if (state.sessionMode === "duo") {
    if (state.playerScores[0] === state.playerScores[1]) {
      elements.checkpointWinner.textContent = "Les deux joueurs sont a egalite pour le moment.";
    } else {
      const leader = state.playerScores[0] > state.playerScores[1] ? 1 : 2;
      elements.checkpointWinner.textContent = `Avantage temporaire: Joueur ${leader}.`;
    }
  } else {
    elements.checkpointWinner.textContent = `${state.profileName} a maintenant acces jusqu'au niveau ${state.highestUnlockedLevel}.`;
  }

  renderBadgeShelf(elements.badgeShelfCheckpoint, state.lastUnlockedBadges, state.lastUnlockedBadges);
  persistProfiles();
  updateBestScoreDisplays();
  updateProfileUI();
  renderMap();
  showScreen(elements.checkpointScreen);
}

function advanceGameFlow() {
  if (state.questionIndex >= QUESTIONS_PER_LEVEL) {
    showCheckpoint();
    return;
  }
  state.timeLimit = Math.max(getModeConfig().baseTime, state.timeLimit);
  beginQuestion();
}

function endGame({ title, eyebrow, message }) {
  state.gameOver = true;
  stopTimer();
  saveBestScore(state.score);
  const profile = getProfileRecord(state.activeProfileId, state.profileName);
  profile.stats.gamesPlayed += 1;
  profile.stats.correctAnswers += state.correctAnswers;
  profile.stats.totalAnswers += state.totalAttempts;
  profile.stats.bestLevel = Math.max(profile.stats.bestLevel, state.level);
  profile.levelStars = [...state.levelStarsMap];
  profile.highestUnlockedLevel = state.highestUnlockedLevel;
  state.profiles[state.activeProfileId] = profile;

  const accuracy = getAccuracy(state.correctAnswers, state.totalAttempts);
  elements.finalScore.textContent = state.score;
  elements.finalLevel.textContent = state.level;
  elements.finalAccuracy.textContent = `${accuracy}%`;
  elements.endEyebrow.textContent = eyebrow;
  elements.endTitle.textContent = title;
  elements.endMessage.textContent = message;
  renderStars(elements.finalStars, Math.min(3, Math.ceil(state.levelStarsMap.reduce((sum, value) => sum + value, 0) / 8)));

  if (state.sessionMode === "duo") {
    if (state.playerScores[0] === state.playerScores[1]) {
      elements.winnerMessage.textContent = "Match nul parfait entre Joueur 1 et Joueur 2.";
    } else {
      const winner = state.playerScores[0] > state.playerScores[1] ? 1 : 2;
      elements.winnerMessage.textContent = `Victoire locale pour Joueur ${winner} !`;
      unlockBadge("duo_winner");
    }
  } else {
    elements.winnerMessage.textContent = `${state.profileName}, tu termines avec ${state.levelStarsMap.reduce((sum, value) => sum + value, 0)} etoiles cumulees.`;
  }

  if (state.score >= 1000) unlockBadge("hundred_points");
  persistProfiles();
  renderBadgeShelf(elements.badgeShelfEnd, state.unlockedBadges, state.lastUnlockedBadges);
  updateProfileUI();
  renderMap();
  showScreen(elements.endScreen);
}

function openMap() {
  console.log("openMap: Transition instantanée vers l'écran de la carte.");
  try {
    state.selectedLevel = Math.min(state.selectedLevel, state.highestUnlockedLevel);
    updateBestScoreDisplays();
    updateProfileUI();
    renderMap();
    showScreen(elements.mapScreen);
    
    // Hydratation 3D asynchrone pour ne pas bloquer l'UI
    hydrateMapScene3D().catch(error => {
      console.error("Échec du chargement 3D en arrière-plan:", error);
    });
  } catch (error) {
    console.error("Erreur lors de l'ouverture de la carte:", error);
    showScreen(elements.mapScreen);
  }
}

function returnToMapFromCheckpoint() {
  if (state.levelPassed && state.level === TOTAL_LEVELS) {
    endGame({
      eyebrow: "Victoire finale",
      title: "Le boss du chateau est vaincu !",
      message: "Tu as termine la grande carte du monde des multiplications."
    });
    return;
  }
  openMap();
}

function retryCurrentLevelFromCheckpoint() {
  restoreLevelSnapshot();
  state.gameOver = false;
  state.questionIndex = 0;
  state.levelScore = 0;
  state.levelCorrectAnswers = 0;
  state.levelAttempts = 0;
  state.streak = 0;
  state.levelStars = 0;
  state.timeLimit = getModeConfig().baseTime;
  state.lastUnlockedBadges = [];
  state.playerScores = [...(state.levelStartSnapshot?.playerScores || state.playerScores)];
  updateScoreboard();
  beginLevelFromMap();
}

function restartAdventure() {
  state.level = 1;
  state.selectedLevel = 1;
  state.score = 0;
  state.correctAnswers = 0;
  state.totalAttempts = 0;
  state.playerScores = [0, 0];
  state.gameOver = false;
  state.starsEarned = state.levelStarsMap.reduce((sum, value) => sum + value, 0);
  state.lastUnlockedBadges = [];
  openMap();
}

function jumpToParentStats() {
  showScreen(elements.startScreen);
  window.scrollTo({ top: document.body.scrollHeight, behavior: REDUCED_MOTION ? "auto" : "smooth" });
}

function runButtonAction(actionId) {
  console.log("runButtonAction: Exécution de l'action demandée ->", actionId);
  const actions = {
    mapNavHubButton: () => showScreen(elements.startScreen),
    mapNavStatsButton: jumpToParentStats,
    mapNavRewardsButton: jumpToParentStats,
    openMapButton: openMap,
    backToHubButton: () => showScreen(elements.startScreen),
    enterLevelButton: beginLevelFromMap,
    returnToMapButton: openMap,
    restartButton: restartAdventure,
    kidsModeButton: () => setMode("kids"),
    expertModeButton: () => setMode("expert"),
    soloModeButton: () => setSessionMode("solo"),
    duoModeButton: () => setSessionMode("duo"),
    voiceToggleButton: () => setVoiceEnabled(!state.voiceEnabled),
    speakButton: speakQuestion,
    saveProfileButton: saveProfileFromInput,
    checkpointPrimaryButton: returnToMapFromCheckpoint,
    checkpointRetryButton: retryCurrentLevelFromCheckpoint
  };
  const action = actions[actionId];
  if (typeof action === 'function') {
    action();
  } else {
    console.warn(`Action non définie pour l'ID: ${actionId}`);
  }
}

function bindClick(element, actionId) {
  if (!element) {
    return;
  }
  element.addEventListener("click", (event) => {
    event.preventDefault();
    element.dataset.codexHandled = "true";
    window.setTimeout(() => {
      delete element.dataset.codexHandled;
    }, 0);
    runButtonAction(actionId);
  });
}

function animateMapAmbient() {
  if (!window.gsap || REDUCED_MOTION) return;
  gsap.to(".boss-orb", { scale: 1.08, y: -8, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".castle-silhouette", { y: -4, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    if (elements.installButton) {
      elements.installButton.classList.remove("hidden");
    }
  });
  if (!elements.installButton) {
    return;
  }
  elements.installButton.addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    elements.installButton.classList.add("hidden");
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then((registration) => {
      registration.update().catch(() => {});
    }).catch(() => {});
  }
}

window.updateLoadingBar = (progress) => {
  if (elements.loadingBar) {
    const safeProgress = Math.max(0, Math.min(100, progress));
    if (window.gsap && !REDUCED_MOTION) {
      gsap.to(elements.loadingBar, { width: `${safeProgress}%`, duration: 0.3 });
    } else {
      elements.loadingBar.style.width = `${safeProgress}%`;
    }
  }
};

window.completeLoadingIntro = () => {
  if (!elements.loadingScreen) return;
  if (window.gsap && !REDUCED_MOTION) {
    gsap.to(elements.loadingScreen, { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => elements.loadingScreen.classList.add("loading-hidden") });
  } else {
    elements.loadingScreen.classList.add("loading-hidden");
  }
};

function runLoadingIntro() {
  console.log("runLoadingIntro: En attente du chargement des assets 3D...");
  // On laisse désormais le LoadingManager de Three.js appeler completeLoadingIntro
}

function bindEvents() {
  console.log("🔗 bindEvents: Configuration des écouteurs globaux.");

  if (elements.profileNameInput) {
    elements.profileNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        elements.profileNameInput.blur(); // Feedback visuel de validation
        saveProfileFromInput();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!elements.gameScreen.classList.contains("screen-active")) {
      return;
    }

    const optionIndex = Number(event.key) - 1;
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 4) {
      return;
    }

    const button = elements.answerGrid.querySelectorAll(".answer-option")[optionIndex];
    if (button && !button.disabled) {
      button.click();
    }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action], button[id], .mode-card");
    if (!button) {
      return;
    }

    const actionId = button.dataset.action || button.id;
    if (!actionId) return;

    if (button.hasAttribute('data-busy')) return;

    button.setAttribute('data-busy', 'true');
    window.setTimeout(() => {
      button.removeAttribute('data-busy');
    }, 100);

    runButtonAction(actionId);
  });
}

// Stabilisation de la carte : la couche DOM reste la source de vérité,
// la scène 3D enrichit l'arrière-plan sans bloquer la progression.
async function loadMapSceneFactory() {
  if (window.MultiplicationSprintMapScene?.createMapScene) {
    return window.MultiplicationSprintMapScene.createMapScene;
  }

  if (!state.mapSceneLoader) {
    state.mapSceneLoader = import("./map-scene.js?v=20260423c")
      .then((module) => module?.createMapScene || window.MultiplicationSprintMapScene?.createMapScene || null)
      .catch((error) => {
        console.error("Map scene module failed to load:", error);
        return null;
      });
  }

  return state.mapSceneLoader;
}

async function ensureMapScene3D() {
  if (!elements.mapSceneMount || !elements.worldMap) {
    return false;
  }

  const factory = await loadMapSceneFactory();
  if (!factory) {
    return false;
  }

  if (!state.mapScene3D) {
    state.mapScene3D = factory(elements.mapSceneMount, REDUCED_MOTION);
  }

  state.mapScene3D?.setUnlockedLevel?.(state.highestUnlockedLevel);
  state.mapScene3D?.setSelectedLevel?.(state.selectedLevel);
  state.mapScene3D?.resize?.();
  return true;
}

async function hydrateMapScene3D() {
  try {
    if (!elements.mapSceneMount || !elements.worldMap) {
      return false;
    }
    elements.mapSceneMount.offsetHeight;
    const ready = await ensureMapScene3D();
    if (!ready) {
      return false;
    }
    window.setTimeout(() => state.mapScene3D?.resize?.(), 100);
    return true;
  } catch (error) {
    console.error("Echec de l'hydratation 3D, repli sur la carte DOM :", error);
    return false;
  }
}

function positionMascotOnMap(instant = false) {
  if (!elements.mapMascot) {
    return;
  }

  const levelData = MAP_LEVELS[state.selectedLevel - 1];
  if (!levelData) {
    return;
  }

  const targetX = `calc(${levelData.x}% - 41px)`;
  const targetY = `calc(${levelData.y}% - 56px)`;
  elements.mapMascot.style.display = "grid";
  elements.mapMascot.style.zIndex = "5";

  if (!window.gsap || REDUCED_MOTION || instant) {
    elements.mapMascot.style.left = targetX;
    elements.mapMascot.style.top = targetY;
    elements.mapMascot.style.transform = "scaleX(1)";
    setMapHeroState("idle");
    elements.mapMascot.dataset.lastX = String(levelData.x);
    return;
  }

  setMapHeroState("walk");
  const previousX = Number.parseFloat(elements.mapMascot.dataset.lastX || String(levelData.x));
  const facing = levelData.x >= previousX ? 1 : -1;
  gsap.killTweensOf(elements.mapMascot);
  elements.mapMascot.style.transform = `scaleX(${facing})`;
  gsap.timeline({
    onComplete: () => {
      setMapHeroState("idle");
      elements.mapMascot.dataset.lastX = String(levelData.x);
      state.mapScene3D?.setSelectedLevel?.(state.selectedLevel);
    }
  })
    .to(elements.mapMascot, { left: targetX, top: targetY, duration: 0.72, ease: "power1.inOut" }, 0)
    .to(elements.mapMascot, { y: -8, duration: 0.16, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0)
    .set(elements.mapMascot, { y: 0 }, ">-0.01");
}

function renderMap() {
  const nodeThemes = {
    prairie: "village",
    forest: "lanternes",
    desert: "ruines",
    cliffs: "tours",
    isles: "boss"
  };

  if (elements.mapNodes) {
    elements.mapNodes.innerHTML = MAP_LEVELS.map((levelData, index) => {
      const level = index + 1;
      const isUnlocked = level <= state.highestUnlockedLevel;
      const isSelected = level === state.selectedLevel;
      const starCount = state.levelStarsMap[index] || 0;
      const starsText = `${"\u2605".repeat(starCount)}${"\u2606".repeat(Math.max(0, 3 - starCount))}`;
      return `
        <button
          class="map-node node-${levelData.biome} ${isUnlocked ? "" : "locked"} ${isSelected ? "selected" : ""} ${levelData.boss ? "boss-node" : ""}"
          type="button"
          data-level="${level}"
          style="left: calc(${levelData.x}% - 44px); top: calc(${levelData.y}% - 44px);"
          aria-label="Niveau ${level}${isUnlocked ? "" : " verrouille"}"
          ${isUnlocked ? "" : "disabled"}
        >
          <span class="node-biome">${nodeThemes[levelData.biome] || "zone"}</span>
          <span class="node-core">${level}</span>
          <span class="node-label">${levelData.landmark}</span>
          <span class="node-stars">${starsText}</span>
        </button>
      `;
    }).join("");

    elements.mapNodes.querySelectorAll(".map-node").forEach((node) => {
      node.addEventListener("click", () => {
        const level = Number.parseInt(node.dataset.level || "1", 10);
        selectMapLevel(level, false);
      });
    });
  }

  renderMapPath();
  elements.mapProgressDisplay.textContent = `${state.highestUnlockedLevel}/10`;
  elements.mapStarsDisplay.textContent = state.levelStarsMap.reduce((sum, value) => sum + value, 0);
  state.mapScene3D?.setUnlockedLevel?.(state.highestUnlockedLevel);
  state.mapScene3D?.setSelectedLevel?.(state.selectedLevel);
  updateSelectedLevelCard();
}

function openMap() {
  try {
    state.selectedLevel = Math.min(state.selectedLevel, state.highestUnlockedLevel);
    updateBestScoreDisplays();
    updateProfileUI();
    renderMap();
    showScreen(elements.mapScreen);
    positionMascotOnMap(true);
    hydrateMapScene3D().then((ready) => {
      if (!ready) {
        positionMascotOnMap(true);
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'ouverture de la carte:", error);
    showScreen(elements.mapScreen);
  }
}

function bootApp() {
  if (window.__appBooted) {
    return;
  }

  window.__appBooted = true;

  try {
    ensureActiveProfile();
    selectPreferredVoice();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = selectPreferredVoice;
    }

    setMode("kids");
    setSessionMode("solo");
    setVoiceEnabled(true);

    updateBestScoreDisplays();
    updateProfileUI();
    renderMap();
    selectMapLevel(Math.min(state.selectedLevel, state.highestUnlockedLevel), true);
    positionMascotOnMap(true);
    updateScoreboard();
    renderTimer();

    window.msButton = runButtonAction;
    bindEvents();
    animateMapAmbient();
    setupInstallPrompt();
    registerServiceWorker();
    runLoadingIntro();
    showScreen(elements.startScreen);
    window.__appInitialized = true;
  } catch (error) {
    console.error("Multiplication Sprint init failed:", error);
    if (elements.loadingScreen) {
      elements.loadingScreen.classList.add("loading-hidden");
    }
    showScreen(elements.startScreen);
  }
}

// Exportation des fonctions pour le module de synchronisation API
window.persistProfiles = persistProfiles;
window.showCheckpoint = showCheckpoint;
window.selectMapLevel = selectMapLevel;
window.state = state;

bootApp();
