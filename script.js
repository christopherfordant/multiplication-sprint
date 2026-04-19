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
  { x: 11, y: 68, title: "Prairie des 2", description: "Les premiers pas du sentier enchante." },
  { x: 19, y: 48, title: "Pont des etoiles", description: "Des multiplications simples sur le vieux pont." },
  { x: 33, y: 24, title: "Colline des nuages", description: "Le chemin grimpe avec quelques revisions." },
  { x: 43, y: 20, title: "Foret sucree", description: "Les tables se melangent dans la foret." },
  { x: 47, y: 50, title: "Lac des lucioles", description: "Un niveau plus rythme au coeur du desert." },
  { x: 56, y: 56, title: "Falaises d'or", description: "Le vent souffle, les calculs s'accelerent." },
  { x: 72, y: 34, title: "Passage lunaire", description: "Le sentier devient plus technique." },
  { x: 84, y: 23, title: "Tour du veilleur", description: "Les meilleures tables reviennent t'entrainer." },
  { x: 79, y: 80, title: "Cour du boss", description: "Dernier camp avant le chateau." },
  { x: 90, y: 17, title: "Chateau du boss", description: "Le boss final garde le chateau des multiplications.", boss: true }
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
  levelStarsMap: Array(TOTAL_LEVELS).fill(0)
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
  const rawName = elements.profileNameInput.value.trim();
  const nextName = rawName || "Champion";
  const nextId = normalizeProfileId(nextName);
  switchToProfile(nextId, nextName);
  updateBestScoreDisplays();
  updateProfileUI();
  renderMap();
  setMascotSpeech(`Salut ${state.profileName} ! La carte est prete pour toi.`);
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
  elements.mascotSpeech.textContent = message;
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(elements.mascotAvatar, { rotate: -3, y: 0 }, { rotate: 3, y: -4, duration: 0.14, yoyo: true, repeat: 1, ease: "power1.inOut" });
  }
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

function showScreen(screen) {
  [elements.startScreen, elements.mapScreen, elements.gameScreen, elements.checkpointScreen, elements.endScreen]
    .forEach((node) => node.classList.remove("screen-active"));
  screen.classList.add("screen-active");
}

function updateBestScoreDisplays() {
  elements.bestScoreStart.textContent = state.bestScore;
  elements.bestScoreGame.textContent = state.bestScore;
  elements.bestScoreEnd.textContent = state.bestScore;
  elements.mapBestScoreDisplay.textContent = state.bestScore;
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
    star.classList.toggle("star-on", index < count);
  });
}

function updateSelectedLevelCard() {
  const levelData = MAP_LEVELS[state.selectedLevel - 1];
  elements.selectedLevelLabel.textContent = levelData.title;
  elements.selectedLevelDescription.textContent = levelData.description;
  elements.enterLevelButton.textContent = levelData.boss ? "Entrer dans le boss" : "Entrer dans le niveau";
  elements.enterLevelButton.disabled = state.selectedLevel > state.highestUnlockedLevel;
}

function positionMascotOnMap(instant = false) {
  const levelData = MAP_LEVELS[state.selectedLevel - 1];
  const targetX = `calc(${levelData.x}% - 33px)`;
  const targetY = `calc(${levelData.y}% - 33px)`;
  if (!window.gsap || REDUCED_MOTION || instant) {
    elements.mapMascot.style.left = targetX;
    elements.mapMascot.style.top = targetY;
    return;
  }
  gsap.to(elements.mapMascot, { left: targetX, top: targetY, duration: 0.5, ease: "power2.out" });
}

function selectMapLevel(level, instant = false) {
  state.selectedLevel = level;
  renderMap();
  positionMascotOnMap(instant);
}

function renderMap() {
  elements.mapNodes.innerHTML = "";
  MAP_LEVELS.forEach((node, index) => {
    const level = index + 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-node";
    if (level > state.highestUnlockedLevel) button.classList.add("locked");
    if (level === state.selectedLevel) button.classList.add("selected");
    if (node.boss) button.classList.add("boss-node");
    button.style.left = `calc(${node.x}% - 37px)`;
    button.style.top = `calc(${node.y}% - 37px)`;
    button.innerHTML = `${node.boss ? "👑" : level}<span class="node-stars">${"★".repeat(state.levelStarsMap[index] || 0)}</span>`;
    button.addEventListener("click", () => {
      if (level <= state.highestUnlockedLevel) {
        selectMapLevel(level);
      }
    });
    elements.mapNodes.appendChild(button);
  });
  elements.mapProgressDisplay.textContent = `${state.highestUnlockedLevel}/10`;
  elements.mapStarsDisplay.textContent = state.levelStarsMap.reduce((sum, value) => sum + value, 0);
  updateSelectedLevelCard();
}

function generateQuestion() {
  const currentLevelIndex = state.level - 1;
  const shouldReviewPreviousLevel = state.level > 1 && Math.random() < 0.35;
  const selectedLevelIndex = shouldReviewPreviousLevel ? randomBetween(0, currentLevelIndex - 1) : currentLevelIndex;
  const config = getModeConfig().ranges[selectedLevelIndex];
  const first = randomBetween(config.a[0], config.a[1]);
  const second = randomBetween(config.b[0], config.b[1]);
  state.currentQuestionSourceLevel = selectedLevelIndex + 1;
  return { first, second, answer: first * second };
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
  });
}

function setFeedback(message, type = "") {
  elements.feedbackText.textContent = message;
  elements.feedbackText.classList.remove("feedback-success", "feedback-error");
  if (type === "success") elements.feedbackText.classList.add("feedback-success");
  if (type === "error") elements.feedbackText.classList.add("feedback-error");
}

function updateQuestionUI() {
  const { first, second } = state.currentQuestion;
  elements.questionText.textContent = `${first} x ${second}`;
  elements.questionBadge.textContent = state.currentQuestionSourceLevel < state.level ? `Revision du niveau ${state.currentQuestionSourceLevel}` : state.level === TOTAL_LEVELS ? "Boss du chateau" : `Niveau ${state.level}`;
  renderAnswerOptions();
  setFeedback("Choisis la bonne reponse avant la fin du chrono.");
  elements.bonusBanner.textContent = "";
  state.acceptingAnswer = true;
  setMascotSpeech(state.sessionMode === "duo" ? `A toi Joueur ${state.currentPlayer + 1} !` : `En route ${state.profileName}, le niveau ${state.level} t'attend.`);
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
  const utterance = new SpeechSynthesisUtterance(`${state.currentQuestion.first} fois ${state.currentQuestion.second}`);
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
  captureLevelSnapshot();
  showScreen(elements.gameScreen);
  beginQuestion();
}

function updateProgressAfterWin() {
  const profile = getProfileRecord(state.activeProfileId, state.profileName);
  profile.stats.levelsCleared += 1;
  profile.stats.bestLevel = Math.max(profile.stats.bestLevel, state.level);
  state.highestUnlockedLevel = Math.min(TOTAL_LEVELS, Math.max(state.highestUnlockedLevel, state.level + 1));
  state.levelStarsMap[state.level - 1] = Math.max(state.levelStarsMap[state.level - 1], state.levelStars);
  state.selectedLevel = state.level === TOTAL_LEVELS ? TOTAL_LEVELS : Math.min(state.highestUnlockedLevel, state.level + 1);
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
    playSound("pass");
    createParticles("success");
  } else {
    elements.checkpointEyebrow.textContent = "Niveau a retenter";
    elements.checkpointTitle.textContent = "Tu peux faire mieux !";
    elements.checkpointMessage.textContent = "Le score du niveau n'est pas suffisant. Tu peux revenir sur la carte ou retenter ce niveau.";
    elements.checkpointPrimaryButton.textContent = "Retour a la carte";
    setMascotSpeech("On peut retenter ce niveau quand tu veux.");
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
  state.selectedLevel = Math.min(state.selectedLevel, state.highestUnlockedLevel);
  updateBestScoreDisplays();
  updateProfileUI();
  renderMap();
  positionMascotOnMap(true);
  showScreen(elements.mapScreen);
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
    checkpointRetryButton: beginLevelFromMap
  };
  const action = actions[actionId];
  if (action) {
    action();
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
    elements.installButton.classList.remove("hidden");
  });
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

function runLoadingIntro() {
  const hideLoading = () => {
    elements.loadingScreen.classList.add("loading-hidden");
  };

  window.setTimeout(hideLoading, 1800);

  if (!window.gsap || REDUCED_MOTION) {
    elements.loadingBar.style.width = "100%";
    window.setTimeout(hideLoading, 500);
    return;
  }

  gsap.timeline({
    onComplete: hideLoading
  })
    .to(elements.loadingBar, { width: "100%", duration: 0.9, ease: "power2.inOut" })
    .to(".loading-stars span", { y: -12, duration: 0.16, stagger: 0.06, repeat: 2, yoyo: true }, "<")
    .to(elements.loadingScreen, { opacity: 0, duration: 0.25, ease: "power2.out" });
}

function bindEvents() {
  [
    "mapNavHubButton",
    "mapNavStatsButton",
    "mapNavRewardsButton",
    "openMapButton",
    "backToHubButton",
    "enterLevelButton",
    "returnToMapButton",
    "restartButton",
    "kidsModeButton",
    "expertModeButton",
    "soloModeButton",
    "duoModeButton",
    "voiceToggleButton",
    "speakButton",
    "saveProfileButton",
    "checkpointPrimaryButton",
    "checkpointRetryButton"
  ].forEach((id) => bindClick(elements[id], id));

  elements.profileNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveProfileFromInput();
    }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[id]");
    if (!button) {
      return;
    }
    const knownIds = [
      "mapNavHubButton",
      "mapNavStatsButton",
      "mapNavRewardsButton",
      "openMapButton",
      "backToHubButton",
      "enterLevelButton",
      "returnToMapButton",
      "restartButton",
      "kidsModeButton",
      "expertModeButton",
      "soloModeButton",
      "duoModeButton",
      "voiceToggleButton",
      "speakButton",
      "saveProfileButton",
      "checkpointPrimaryButton",
      "checkpointRetryButton"
    ];
    if (knownIds.includes(button.id) && !button.dataset.codexHandled) {
      button.dataset.codexHandled = "true";
      window.setTimeout(() => {
        delete button.dataset.codexHandled;
      }, 0);
      runButtonAction(button.id);
    }
  });
}

function init() {
  if (window.__appBooted) {
    return;
  }
  window.__appBooted = true;
  window.__appInitialized = true;
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
  positionMascotOnMap(true);
  updateScoreboard();
  renderTimer();
  bindEvents();
  animateMapAmbient();
  setupInstallPrompt();
  registerServiceWorker();
  runLoadingIntro();
  showScreen(elements.mapScreen);
}

init();
