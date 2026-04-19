const STORAGE_KEY = "multiplication-sprint-best-score";
const TOTAL_LEVELS = 10;
const QUESTIONS_PER_LEVEL = 10;
const BONUS_STREAK = 3;
const BONUS_POINTS = 12;
const BONUS_TIME = 2;
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE_PARTICLE_COUNT = window.innerWidth < 768 ? 10 : 18;

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
      { a: [8, 12], b: [7, 11] },
      { a: [9, 14], b: [8, 12] }
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
      { a: [7, 11], b: [6, 11] },
      { a: [8, 12], b: [7, 12] },
      { a: [9, 14], b: [8, 12] },
      { a: [10, 16], b: [9, 14] },
      { a: [12, 20], b: [10, 15] }
    ]
  }
};

const elements = {
  loadingScreen: document.getElementById("loadingScreen"),
  loadingBar: document.getElementById("loadingBar"),
  startScreen: document.getElementById("startScreen"),
  gameScreen: document.getElementById("gameScreen"),
  checkpointScreen: document.getElementById("checkpointScreen"),
  endScreen: document.getElementById("endScreen"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  installButton: document.getElementById("installButton"),
  kidsModeButton: document.getElementById("kidsModeButton"),
  expertModeButton: document.getElementById("expertModeButton"),
  soloModeButton: document.getElementById("soloModeButton"),
  duoModeButton: document.getElementById("duoModeButton"),
  voiceToggleButton: document.getElementById("voiceToggleButton"),
  speakButton: document.getElementById("speakButton"),
  checkpointPrimaryButton: document.getElementById("checkpointPrimaryButton"),
  checkpointRetryButton: document.getElementById("checkpointRetryButton"),
  bestScoreStart: document.getElementById("bestScoreStart"),
  bestScoreGame: document.getElementById("bestScoreGame"),
  bestScoreEnd: document.getElementById("bestScoreEnd"),
  levelDisplay: document.getElementById("levelDisplay"),
  questionCountDisplay: document.getElementById("questionCountDisplay"),
  modeDisplay: document.getElementById("modeDisplay"),
  timerText: document.getElementById("timerText"),
  timerBar: document.getElementById("timerBar"),
  questionText: document.getElementById("questionText"),
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
  deferredInstallPrompt: null
};

function readBestScore() {
  return Number.parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0;
}

function saveBestScore(score) {
  if (score > state.bestScore) {
    state.bestScore = score;
    localStorage.setItem(STORAGE_KEY, String(score));
  }
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
    gsap.fromTo(elements.mascotSpeech, { opacity: 0.5 }, { opacity: 1, duration: 0.2 });
  }
}

function animateFloatingDecor() {
  if (!window.gsap || REDUCED_MOTION) {
    return;
  }
  gsap.to(".floating-star", { y: 18, rotation: 9, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".floating-sun", { y: -10, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".floating-cloud", { x: 18, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".floating-ribbon", { x: -20, rotation: -10, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
}

function showScreen(screen) {
  [elements.startScreen, elements.gameScreen, elements.checkpointScreen, elements.endScreen]
    .forEach((node) => node.classList.remove("screen-active"));
  screen.classList.add("screen-active");
}

function updateBestScoreDisplays() {
  elements.bestScoreStart.textContent = state.bestScore;
  elements.bestScoreGame.textContent = state.bestScore;
  elements.bestScoreEnd.textContent = state.bestScore;
}

function updatePlayerPanel() {
  elements.activePlayerLabel.textContent = state.sessionMode === "duo" ? `Joueur ${state.currentPlayer + 1}` : "Joueur 1";
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

function setFeedback(message, type = "") {
  elements.feedbackText.textContent = message;
  elements.feedbackText.classList.remove("feedback-success", "feedback-error");
  if (type === "success") {
    elements.feedbackText.classList.add("feedback-success");
  }
  if (type === "error") {
    elements.feedbackText.classList.add("feedback-error");
  }
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

function captureLevelSnapshot() {
  state.levelStartSnapshot = {
    score: state.score,
    correctAnswers: state.correctAnswers,
    totalAttempts: state.totalAttempts,
    playerScores: [...state.playerScores],
    starsEarned: state.starsEarned
  };
}

function restoreLevelSnapshot() {
  if (!state.levelStartSnapshot) {
    return;
  }
  state.score = state.levelStartSnapshot.score;
  state.correctAnswers = state.levelStartSnapshot.correctAnswers;
  state.totalAttempts = state.levelStartSnapshot.totalAttempts;
  state.playerScores = [...state.levelStartSnapshot.playerScores];
  state.starsEarned = state.levelStartSnapshot.starsEarned;
}

function requiredScoreForLevel(level) {
  const config = getModeConfig();
  const theoreticalBest = (config.baseTime * config.scorePerSecond + level * config.levelPointMultiplier) * QUESTIONS_PER_LEVEL + Math.floor(QUESTIONS_PER_LEVEL / BONUS_STREAK) * BONUS_POINTS;
  const dynamicBase = config.levelScoreBase + (level - 1) * 28;
  return Math.min(theoreticalBest - 20, Math.max(120, Math.round(Math.max(dynamicBase, theoreticalBest * config.passRatio))));
}

function calculateStars(levelScore, required) {
  if (levelScore < required) {
    return 0;
  }
  if (levelScore >= required * 1.45) {
    return 3;
  }
  if (levelScore >= required * 1.18) {
    return 2;
  }
  return 1;
}

function renderStars(container, count) {
  [...container.children].forEach((star, index) => {
    star.classList.toggle("star-on", index < count);
  });
}

function generateQuestion() {
  const config = getModeConfig().ranges[state.level - 1];
  const first = randomBetween(config.a[0], config.a[1]);
  const second = randomBetween(config.b[0], config.b[1]);
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

function animateQuestionIn() {
  if (!window.gsap || REDUCED_MOTION) {
    return;
  }
  gsap.fromTo(elements.questionCard, { opacity: 0, scale: 0.88, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" });
  gsap.fromTo(".answer-option", { y: 18, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.28, stagger: 0.05, ease: "power2.out" });
}

function stopTimer() {
  if (state.timerRaf) {
    cancelAnimationFrame(state.timerRaf);
    state.timerRaf = 0;
  }
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
  if (!AudioContextCtor) {
    return null;
  }
  const context = ensureAudioContext.ctx || new AudioContextCtor();
  ensureAudioContext.ctx = context;
  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }
  return context;
}

function playSound(type) {
  const context = ensureAudioContext();
  if (!context) {
    return;
  }
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
  if (!state.voiceEnabled || !("speechSynthesis" in window) || !state.currentQuestion) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${state.currentQuestion.first} fois ${state.currentQuestion.second}`);
  utterance.lang = "fr-FR";
  utterance.rate = state.mode === "kids" ? 0.92 : 1;
  window.speechSynthesis.speak(utterance);
}

function createParticles(kind) {
  if (!window.gsap || REDUCED_MOTION) {
    return;
  }
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

function animateCorrectAnswer() {
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(elements.feedbackText, { scale: 0.85 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut" });
  }
  createParticles("success");
  playSound("success");
}

function animateWrongAnswer() {
  document.body.classList.add("screen-shake");
  window.setTimeout(() => document.body.classList.remove("screen-shake"), 420);
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(elements.feedbackText, { x: -8 }, { x: 8, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut" });
  }
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
    if (selectedButton && !isCorrect && button === selectedButton) {
      button.classList.add("answer-option-wrong");
    }
  });
}

function showBonus() {
  const bonusMessage = `Bonus ! +${BONUS_POINTS} points et +${BONUS_TIME} s pour la prochaine question`;
  elements.bonusBanner.textContent = bonusMessage;
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
    if (!state.gameOver) {
      advanceGameFlow();
    }
  }, REDUCED_MOTION ? 180 : 780);
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
  setMascotSpeech(`Bravo ${state.sessionMode === "duo" ? `Joueur ${state.currentPlayer + 1}` : "champion"} !`);
  animateCorrectAnswer();

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
  if (!state.acceptingAnswer || state.gameOver) {
    return;
  }
  if (value === state.currentQuestion.answer) {
    handleCorrectAnswer(button);
  } else {
    button.classList.add("answer-option-wrong");
    revealCorrectOption(button);
    handleWrongAnswer(`Aie ! La bonne reponse etait ${state.currentQuestion.answer}.`);
  }
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

function updateQuestionUI() {
  const { first, second } = state.currentQuestion;
  elements.questionText.textContent = `${first} x ${second}`;
  renderAnswerOptions();
  setFeedback("Choisis la bonne reponse avant la fin du chrono.");
  elements.bonusBanner.textContent = "";
  state.acceptingAnswer = true;
  setMascotSpeech(state.sessionMode === "duo" ? `A toi Joueur ${state.currentPlayer + 1} !` : "Je te lis la question si tu veux.");
  updateScoreboard();
  animateQuestionIn();
  if (state.voiceEnabled) {
    window.setTimeout(speakQuestion, 180);
  }
}

function beginQuestion() {
  if (state.sessionMode === "duo") {
    state.currentPlayer = state.questionIndex % 2;
  } else {
    state.currentPlayer = 0;
  }
  state.currentQuestion = generateQuestion();
  state.answerOptions = generateAnswerOptions(state.currentQuestion.answer);
  updateQuestionUI();
  startTimer();
}

function showCheckpoint() {
  const required = requiredScoreForLevel(state.level);
  const levelAccuracy = getAccuracy(state.levelCorrectAnswers, state.levelAttempts);
  state.levelPassed = state.levelScore >= required;
  state.levelStars = calculateStars(state.levelScore, required);
  state.starsEarned += state.levelStars;

  elements.checkpointLevelScore.textContent = state.levelScore;
  elements.checkpointRequiredScore.textContent = required;
  elements.checkpointTotalScore.textContent = state.score;
  elements.checkpointAccuracy.textContent = `${levelAccuracy}%`;
  renderStars(elements.checkpointStars, state.levelStars);

  if (state.levelPassed) {
    elements.checkpointEyebrow.textContent = "Niveau valide";
    elements.checkpointTitle.textContent = state.level === TOTAL_LEVELS ? "Bravo, tout est complete !" : "Bien joue !";
    elements.checkpointMessage.textContent = state.level === TOTAL_LEVELS
      ? "Tu as reussi le dernier niveau. Tu peux terminer la partie en beaute ou refaire le niveau pour encore plus de points."
      : "Ton score est suffisant pour passer au niveau suivant. Tu peux continuer ou rejouer ce niveau pour t'ameliorer.";
    elements.checkpointPrimaryButton.textContent = state.level === TOTAL_LEVELS ? "Voir mon resultat final" : "Passer au niveau suivant";
    playSound("pass");
    createParticles("success");
    setMascotSpeech(`Excellent ! ${state.levelStars} etoile${state.levelStars > 1 ? "s" : ""} pour ce niveau.`);
  } else {
    elements.checkpointEyebrow.textContent = "Niveau a retenter";
    elements.checkpointTitle.textContent = "Tu peux faire mieux !";
    elements.checkpointMessage.textContent = "Le score du niveau n'est pas suffisant. Rejoue ce niveau pour tenter de debloquer la suite.";
    elements.checkpointPrimaryButton.textContent = "Retenter le niveau";
    setMascotSpeech("On retente ce niveau, tu y es presque.");
  }

  if (state.sessionMode === "duo") {
    if (state.playerScores[0] === state.playerScores[1]) {
      elements.checkpointWinner.textContent = "Les deux joueurs sont a egalite pour le moment.";
    } else {
      const leader = state.playerScores[0] > state.playerScores[1] ? 1 : 2;
      elements.checkpointWinner.textContent = `Avantage temporaire: Joueur ${leader}.`;
    }
  } else {
    elements.checkpointWinner.textContent = `Tu cumules ${state.starsEarned} etoiles au total.`;
  }

  showScreen(elements.checkpointScreen);
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(".checkpoint-card", { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" });
  }
}

function resetLevelProgress() {
  state.questionIndex = 0;
  state.levelScore = 0;
  state.levelCorrectAnswers = 0;
  state.levelAttempts = 0;
  state.streak = 0;
  state.levelStars = 0;
  state.timeLimit = getModeConfig().baseTime;
}

function advanceToNextLevel() {
  if (state.level >= TOTAL_LEVELS) {
    endGame({
      eyebrow: "Victoire totale",
      title: "Tu as termine les 10 niveaux !",
      message: "Super travail. Tu peux relancer une partie en mode expert pour viser un score encore plus grand."
    });
    return;
  }
  state.level += 1;
  resetLevelProgress();
  captureLevelSnapshot();
  showScreen(elements.gameScreen);
  beginQuestion();
}

function retryLevel() {
  restoreLevelSnapshot();
  resetLevelProgress();
  showScreen(elements.gameScreen);
  updateScoreboard();
  beginQuestion();
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
  updateBestScoreDisplays();

  const accuracy = getAccuracy(state.correctAnswers, state.totalAttempts);
  elements.finalScore.textContent = state.score;
  elements.finalLevel.textContent = state.level;
  elements.finalAccuracy.textContent = `${accuracy}%`;
  elements.endEyebrow.textContent = eyebrow;
  elements.endTitle.textContent = title;
  elements.endMessage.textContent = message;
  renderStars(elements.finalStars, Math.min(3, Math.ceil(state.starsEarned / 4)));

  if (state.sessionMode === "duo") {
    if (state.playerScores[0] === state.playerScores[1]) {
      elements.winnerMessage.textContent = "Match nul parfait entre Joueur 1 et Joueur 2.";
    } else {
      const winner = state.playerScores[0] > state.playerScores[1] ? 1 : 2;
      elements.winnerMessage.textContent = `Victoire locale pour Joueur ${winner} !`;
    }
  } else {
    elements.winnerMessage.textContent = `Tu termines avec ${state.starsEarned} etoiles cumulees.`;
  }

  showScreen(elements.endScreen);
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(".end-card", { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)" });
    gsap.fromTo(elements.finalScore, { textContent: 0 }, { textContent: state.score, duration: 1.1, snap: { textContent: 1 }, ease: "power2.out" });
  }
}

function startGame() {
  state.level = 1;
  state.score = 0;
  state.correctAnswers = 0;
  state.totalAttempts = 0;
  state.playerScores = [0, 0];
  state.starsEarned = 0;
  state.currentPlayer = 0;
  state.gameOver = false;
  resetLevelProgress();
  captureLevelSnapshot();
  updateBestScoreDisplays();
  showScreen(elements.gameScreen);
  beginQuestion();
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    elements.installButton.classList.remove("hidden");
  });
  elements.installButton.addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) {
      return;
    }
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    elements.installButton.classList.add("hidden");
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function runLoadingIntro() {
  if (!window.gsap || REDUCED_MOTION) {
    elements.loadingBar.style.width = "100%";
    window.setTimeout(() => elements.loadingScreen.classList.add("loading-hidden"), 500);
    return;
  }
  gsap.timeline({
    onComplete: () => {
      elements.loadingScreen.classList.add("loading-hidden");
    }
  })
    .to(elements.loadingBar, { width: "100%", duration: 1.2, ease: "power2.inOut" })
    .to(".loading-stars span", { y: -12, duration: 0.18, stagger: 0.08, repeat: 3, yoyo: true }, "<")
    .to(elements.loadingScreen, { opacity: 0, duration: 0.4, ease: "power2.out" });
}

function bindEvents() {
  elements.startButton.addEventListener("click", startGame);
  elements.restartButton.addEventListener("click", startGame);
  elements.kidsModeButton.addEventListener("click", () => setMode("kids"));
  elements.expertModeButton.addEventListener("click", () => setMode("expert"));
  elements.soloModeButton.addEventListener("click", () => setSessionMode("solo"));
  elements.duoModeButton.addEventListener("click", () => setSessionMode("duo"));
  elements.voiceToggleButton.addEventListener("click", () => setVoiceEnabled(!state.voiceEnabled));
  elements.speakButton.addEventListener("click", speakQuestion);
  elements.checkpointPrimaryButton.addEventListener("click", () => {
    if (!state.levelPassed) {
      retryLevel();
      return;
    }
    if (state.level >= TOTAL_LEVELS) {
      endGame({
        eyebrow: "Champion confirme",
        title: "Partie terminee !",
        message: "Tu as boucle la campagne complete. Relance une partie pour battre ton record."
      });
      return;
    }
    advanceToNextLevel();
  });
  elements.checkpointRetryButton.addEventListener("click", retryLevel);
}

function init() {
  setMode("kids");
  setSessionMode("solo");
  setVoiceEnabled(true);
  updateBestScoreDisplays();
  updateScoreboard();
  renderTimer();
  bindEvents();
  animateFloatingDecor();
  setupInstallPrompt();
  registerServiceWorker();
  runLoadingIntro();
}

init();
