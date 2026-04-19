const STORAGE_KEY = "multiplication-sprint-best-score";
const TOTAL_LEVELS = 10;
const QUESTIONS_PER_LEVEL = 10;
const BASE_TIME = 10;
const BONUS_STREAK = 3;
const BONUS_POINTS = 10;
const BONUS_TIME = 2;
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE_PARTICLE_COUNT = window.innerWidth < 768 ? 10 : 18;

const levelConfigs = [
  { a: [1, 3], b: [1, 5] },
  { a: [2, 5], b: [2, 5] },
  { a: [3, 6], b: [2, 6] },
  { a: [4, 7], b: [3, 7] },
  { a: [5, 8], b: [4, 8] },
  { a: [6, 9], b: [4, 9] },
  { a: [7, 10], b: [6, 10] },
  { a: [8, 12], b: [7, 12] },
  { a: [10, 15], b: [8, 12] },
  { a: [12, 20], b: [9, 15] }
];

const elements = {
  startScreen: document.getElementById("startScreen"),
  gameScreen: document.getElementById("gameScreen"),
  endScreen: document.getElementById("endScreen"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  installButton: document.getElementById("installButton"),
  bestScoreStart: document.getElementById("bestScoreStart"),
  bestScoreGame: document.getElementById("bestScoreGame"),
  bestScoreEnd: document.getElementById("bestScoreEnd"),
  levelDisplay: document.getElementById("levelDisplay"),
  questionCountDisplay: document.getElementById("questionCountDisplay"),
  timerText: document.getElementById("timerText"),
  timerBar: document.getElementById("timerBar"),
  questionText: document.getElementById("questionText"),
  answerForm: document.getElementById("answerForm"),
  answerInput: document.getElementById("answerInput"),
  feedbackText: document.getElementById("feedbackText"),
  bonusBanner: document.getElementById("bonusBanner"),
  particleLayer: document.getElementById("particleLayer"),
  scoreDisplay: document.getElementById("scoreDisplay"),
  streakDisplay: document.getElementById("streakDisplay"),
  accuracyDisplay: document.getElementById("accuracyDisplay"),
  finalScore: document.getElementById("finalScore"),
  finalLevel: document.getElementById("finalLevel"),
  finalAccuracy: document.getElementById("finalAccuracy"),
  endEyebrow: document.getElementById("endEyebrow"),
  endTitle: document.getElementById("endTitle"),
  endMessage: document.getElementById("endMessage"),
  questionCard: document.getElementById("questionCard")
};

const state = {
  level: 1,
  questionIndex: 0,
  score: 0,
  correctAnswers: 0,
  totalAttempts: 0,
  streak: 0,
  bestScore: readBestScore(),
  currentQuestion: null,
  timeLimit: BASE_TIME,
  timeRemaining: BASE_TIME,
  timerStartedAt: 0,
  timerRaf: 0,
  gameOver: false,
  audioEnabled: true,
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animateFloatingDecor() {
  if (!window.gsap || REDUCED_MOTION) {
    return;
  }

  gsap.to(".floating-star", { y: 18, rotation: 9, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".floating-sun", { y: -10, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".floating-cloud", { x: 18, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
}

function showScreen(screen) {
  Object.values({
    start: elements.startScreen,
    game: elements.gameScreen,
    end: elements.endScreen
  }).forEach((node) => node.classList.remove("screen-active"));
  screen.classList.add("screen-active");
}

function updateBestScoreDisplays() {
  elements.bestScoreStart.textContent = state.bestScore;
  elements.bestScoreGame.textContent = state.bestScore;
  elements.bestScoreEnd.textContent = state.bestScore;
}

function updateScoreboard() {
  const accuracy = state.totalAttempts ? Math.round((state.correctAnswers / state.totalAttempts) * 100) : 100;
  elements.scoreDisplay.textContent = state.score;
  elements.streakDisplay.textContent = state.streak;
  elements.accuracyDisplay.textContent = `${accuracy}%`;
  elements.levelDisplay.textContent = state.level;
  elements.questionCountDisplay.textContent = Math.min(state.questionIndex + 1, QUESTIONS_PER_LEVEL);
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

function generateQuestion() {
  const config = levelConfigs[state.level - 1];
  const first = randomBetween(config.a[0], config.a[1]);
  const second = randomBetween(config.b[0], config.b[1]);
  return { first, second, answer: first * second };
}

function animateQuestionIn() {
  if (!window.gsap || REDUCED_MOTION) {
    return;
  }

  gsap.fromTo(
    elements.questionCard,
    { opacity: 0, scale: 0.88, y: 30 },
    { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" }
  );
}

function animateLevelTransition() {
  if (!window.gsap || REDUCED_MOTION) {
    return;
  }

  gsap.fromTo(
    ".pill",
    { x: 70, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" }
  );
}

function updateQuestionUI() {
  const { first, second } = state.currentQuestion;
  elements.questionText.textContent = `${first} × ${second}`;
  elements.answerInput.value = "";
  elements.answerInput.focus();
  setFeedback("Trouve la bonne réponse avant la fin du chrono.");
  elements.bonusBanner.textContent = "";
  updateScoreboard();
  animateQuestionIn();
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
    handleFailure("Temps écoulé ! La partie s'arrête ici.");
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

function playTone(type) {
  if (!state.audioEnabled) {
    return;
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  const context = playTone.ctx || new AudioContextCtor();
  playTone.ctx = context;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type === "success" ? "triangle" : "square";
  oscillator.frequency.value = type === "success" ? 660 : 180;
  gain.gain.value = 0.0001;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();

  const current = context.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.1, current + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, current + 0.18);
  oscillator.stop(current + 0.2);
}

function createParticles(kind) {
  if (!window.gsap || REDUCED_MOTION) {
    return;
  }

  const colors = kind === "success"
    ? ["#21c06b", "#ffd54a", "#1f6fff", "#ff5f6d"]
    : ["#ff5f6d", "#ff9966", "#ffd54a"];

  for (let index = 0; index < MOBILE_PARTICLE_COUNT; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.background = colors[index % colors.length];
    elements.particleLayer.appendChild(particle);

    const angle = (Math.PI * 2 * index) / MOBILE_PARTICLE_COUNT;
    const distance = randomBetween(70, window.innerWidth < 768 ? 120 : 180);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    gsap.fromTo(
      particle,
      { x: 0, y: 0, scale: 0.3, opacity: 1, rotation: 0 },
      {
        x,
        y,
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
    gsap.fromTo(elements.feedbackText, { scale: 0.8 }, { scale: 1.1, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut" });
  }
  createParticles("success");
  playTone("success");
}

function animateWrongAnswer() {
  document.body.classList.add("screen-shake");
  window.setTimeout(() => document.body.classList.remove("screen-shake"), 420);
  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(elements.feedbackText, { x: -8 }, { x: 8, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut" });
  }
  playTone("error");
}

function showBonus() {
  const bonusMessage = `Bonus ! +${BONUS_POINTS} points et +${BONUS_TIME} s`;
  elements.bonusBanner.textContent = bonusMessage;
  state.score += BONUS_POINTS;
  state.timeLimit = BASE_TIME + BONUS_TIME;
  updateScoreboard();
  createParticles("success");

  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(
      elements.bonusBanner,
      { opacity: 0, y: 18, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.7)" }
    );
  }
}

function prepareNextQuestion() {
  if (state.questionIndex >= QUESTIONS_PER_LEVEL) {
    if (state.level >= TOTAL_LEVELS) {
      handleVictory();
      return;
    }

    state.level += 1;
    state.questionIndex = 0;
    state.timeLimit = BASE_TIME;
    animateLevelTransition();
    setFeedback(`Niveau ${state.level} ! Les multiplications deviennent plus costaudes.`);
  } else {
    state.timeLimit = Math.max(BASE_TIME, state.timeLimit);
  }

  state.currentQuestion = generateQuestion();
  updateQuestionUI();
  startTimer();
}

function handleCorrectAnswer() {
  stopTimer();

  state.totalAttempts += 1;
  state.correctAnswers += 1;
  state.streak += 1;

  const timePoints = Math.max(1, Math.round(state.timeRemaining * 9));
  const levelPoints = state.level * 5;
  state.score += timePoints + levelPoints;

  setFeedback(`Parfait ! +${timePoints + levelPoints} points`, "success");
  animateCorrectAnswer();

  if (state.streak > 0 && state.streak % BONUS_STREAK === 0) {
    showBonus();
  } else {
    elements.bonusBanner.textContent = "";
    state.timeLimit = BASE_TIME;
  }

  state.questionIndex += 1;
  updateScoreboard();

  window.setTimeout(() => {
    if (!state.gameOver) {
      prepareNextQuestion();
    }
  }, REDUCED_MOTION ? 160 : 700);
}

function endGame({ title, eyebrow, message }) {
  state.gameOver = true;
  stopTimer();
  saveBestScore(state.score);
  updateBestScoreDisplays();

  const accuracy = state.totalAttempts ? Math.round((state.correctAnswers / state.totalAttempts) * 100) : 0;
  elements.finalScore.textContent = state.score;
  elements.finalLevel.textContent = state.level;
  elements.finalAccuracy.textContent = `${accuracy}%`;
  elements.endEyebrow.textContent = eyebrow;
  elements.endTitle.textContent = title;
  elements.endMessage.textContent = message;
  showScreen(elements.endScreen);

  if (window.gsap && !REDUCED_MOTION) {
    gsap.fromTo(".end-card", { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)" });
    gsap.fromTo(
      elements.finalScore,
      { textContent: 0 },
      { textContent: state.score, duration: 1.1, snap: { textContent: 1 }, ease: "power2.out" }
    );
  }
}

function handleFailure(reason) {
  state.totalAttempts += 1;
  animateWrongAnswer();
  endGame({
    eyebrow: "Fin de partie",
    title: "On retente ?",
    message: `${reason} Tu étais au niveau ${state.level}. Repars pour battre ton score !`
  });
}

function handleVictory() {
  endGame({
    eyebrow: "Victoire totale",
    title: "Tu as terminé les 10 niveaux !",
    message: "Incroyable ! Tu as traversé tout le parcours sans perdre. Essaie de refaire un meilleur score encore plus vite."
  });
}

function startGame() {
  state.level = 1;
  state.questionIndex = 0;
  state.score = 0;
  state.correctAnswers = 0;
  state.totalAttempts = 0;
  state.streak = 0;
  state.timeLimit = BASE_TIME;
  state.gameOver = false;
  state.currentQuestion = generateQuestion();
  updateBestScoreDisplays();
  showScreen(elements.gameScreen);
  updateQuestionUI();
  startTimer();
}

function submitAnswer(event) {
  event.preventDefault();
  if (state.gameOver) {
    return;
  }

  const rawValue = elements.answerInput.value.trim();
  const numericValue = Number(rawValue);
  if (rawValue === "" || Number.isNaN(numericValue)) {
    setFeedback("Entre un nombre pour valider ta réponse.", "error");
    return;
  }

  if (numericValue === state.currentQuestion.answer) {
    handleCorrectAnswer();
  } else {
    setFeedback(`Aïe ! La bonne réponse était ${state.currentQuestion.answer}.`, "error");
    handleFailure("Mauvaise réponse");
  }
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

function bindEvents() {
  elements.startButton.addEventListener("click", startGame);
  elements.restartButton.addEventListener("click", startGame);
  elements.answerForm.addEventListener("submit", submitAnswer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && elements.startScreen.classList.contains("screen-active")) {
      startGame();
    }
  });
}

function init() {
  updateBestScoreDisplays();
  updateScoreboard();
  renderTimer();
  bindEvents();
  animateFloatingDecor();
  setupInstallPrompt();
  registerServiceWorker();
}

init();
