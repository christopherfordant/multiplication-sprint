import * as THREE from "./node_modules/three/build/three.module.js";

const LEVEL_POSITIONS = [
  { x: 15, y: 71, biome: "prairie", boss: false },
  { x: 28, y: 64, biome: "prairie", boss: false },
  { x: 21, y: 45, biome: "forest", boss: false },
  { x: 36, y: 37, biome: "forest", boss: false },
  { x: 45, y: 55, biome: "desert", boss: false },
  { x: 60, y: 43, biome: "desert", boss: false },
  { x: 49, y: 25, biome: "cliffs", boss: false },
  { x: 77, y: 66, biome: "cliffs", boss: false },
  { x: 84, y: 48, biome: "isles", boss: false },
  { x: 85, y: 28, biome: "isles", boss: true }
];

const MAP_WIDTH = 20;
const MAP_HEIGHT = 12;

function percentToWorld(point) {
  return new THREE.Vector3(
    ((point.x / 100) - 0.5) * MAP_WIDTH,
    (0.5 - (point.y / 100)) * MAP_HEIGHT,
    0
  );
}

function buildGlowTexture(inner, outer) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 18, 128, 128, 128);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function buildSparkleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.translate(64, 64);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  for (let index = 0; index < 8; index += 1) {
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3, -46, 6, 92);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createDriftSprites(texture, count, areaWidth, areaHeight, zBase, opacityRange) {
  const group = new THREE.Group();
  for (let index = 0; index < count; index += 1) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      opacity: opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0])
    }));
    const scale = 0.4 + Math.random() * 1.4;
    sprite.scale.set(scale * 1.6, scale, 1);
    sprite.position.set(
      (Math.random() - 0.5) * areaWidth,
      (Math.random() - 0.5) * areaHeight,
      zBase + Math.random() * 1.8
    );
    sprite.userData = {
      driftX: 0.02 + Math.random() * 0.04,
      driftY: 0.01 + Math.random() * 0.03,
      bob: Math.random() * Math.PI * 2
    };
    group.add(sprite);
  }
  return group;
}

function createLevelMarkers(texture) {
  return LEVEL_POSITIONS.map((level, index) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      color: level.boss ? 0xff7f62 : 0xffefae,
      opacity: 0.8
    }));
    sprite.position.copy(percentToWorld(level));
    sprite.position.z = 0.5;
    const scale = level.boss ? 0.72 : 0.48;
    sprite.scale.set(scale, scale, 1);
    sprite.userData = {
      index: index + 1,
      baseScale: scale,
      boss: level.boss
    };
    return sprite;
  });
}

export function createMapScene(mount, reducedMotion = false) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  mount.innerHTML = "";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, -2.8, 16);
  camera.lookAt(0, 0, 0);

  const root = new THREE.Group();
  root.rotation.x = -Math.PI / 7.5;
  scene.add(root);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
  const keyLight = new THREE.DirectionalLight(0xfff0c7, 1.2);
  keyLight.position.set(-5, -8, 12);
  const rimLight = new THREE.DirectionalLight(0x8fd7ff, 0.5);
  rimLight.position.set(5, 6, 8);
  scene.add(ambientLight, keyLight, rimLight);

  const mapGlowTexture = buildGlowTexture("rgba(255,245,184,1)", "rgba(255,245,184,0)");
  const coolGlowTexture = buildGlowTexture("rgba(170,240,255,1)", "rgba(170,240,255,0)");
  const sparkleTexture = buildSparkleTexture();

  const haloTop = new THREE.Sprite(new THREE.SpriteMaterial({
    map: mapGlowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.34
  }));
  haloTop.position.set(-0.4, 4.7, 1.2);
  haloTop.scale.set(8.8, 4.4, 1);
  root.add(haloTop);

  const horizonMist = new THREE.Sprite(new THREE.SpriteMaterial({
    map: coolGlowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.26
  }));
  horizonMist.position.set(0, -0.4, 0.4);
  horizonMist.scale.set(13.5, 4.8, 1);
  root.add(horizonMist);

  const clouds = createDriftSprites(mapGlowTexture, reducedMotion ? 6 : 12, 20, 10, -0.2, [0.1, 0.22]);
  const sparkles = createDriftSprites(sparkleTexture, reducedMotion ? 10 : 24, 18, 10, 0.8, [0.12, 0.3]);
  root.add(clouds, sparkles);

  const markers = createLevelMarkers(mapGlowTexture);
  markers.forEach((marker) => root.add(marker));

  const selectedRing = new THREE.Sprite(new THREE.SpriteMaterial({
    map: coolGlowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.85,
    color: 0xfff4b9
  }));
  selectedRing.scale.set(1.15, 1.15, 1);
  root.add(selectedRing);

  const confetti = new THREE.Group();
  root.add(confetti);

  let selectedLevel = 1;
  let unlockedLevel = 1;
  let rafId = 0;
  let waveUntil = 0;

  function resize() {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updateMarkerStyles() {
    markers.forEach((marker) => {
      const isUnlocked = marker.userData.index <= unlockedLevel;
      const isSelected = marker.userData.index === selectedLevel;
      const baseScale = marker.userData.baseScale;
      marker.material.opacity = isUnlocked ? (isSelected ? 0.95 : 0.55) : 0.18;
      marker.material.color.set(
        isSelected ? 0xffffff : marker.userData.boss ? 0xff8b73 : 0xffefae
      );
      const scale = isSelected ? baseScale * 1.45 : isUnlocked ? baseScale : baseScale * 0.8;
      marker.scale.set(scale, scale, 1);
    });

    const selectedPoint = percentToWorld(LEVEL_POSITIONS[selectedLevel - 1]);
    selectedRing.position.set(selectedPoint.x, selectedPoint.y, 0.38);
  }

  function spawnVictoryConfetti() {
    while (confetti.children.length) {
      const child = confetti.children.pop();
      child.material.dispose();
    }

    const origin = percentToWorld(LEVEL_POSITIONS[selectedLevel - 1]);
    for (let index = 0; index < 28; index += 1) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sparkleTexture,
        transparent: true,
        depthWrite: false,
        color: [0xffdd6a, 0xff8a6a, 0x95e8ff][index % 3],
        opacity: 0.95
      }));
      const scale = 0.16 + Math.random() * 0.16;
      sprite.scale.set(scale, scale, 1);
      sprite.position.copy(origin);
      sprite.position.z = 0.8;
      sprite.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08,
          0.04 + Math.random() * 0.05
        ),
        life: 1
      };
      confetti.add(sprite);
    }
  }

  function playUnlockAnimation(levelIndex) {
    unlockedLevel = Math.max(unlockedLevel, levelIndex);
    waveUntil = performance.now() + 1300;
    updateMarkerStyles();
  }

  function playWaveAnimation() {
    waveUntil = performance.now() + 1000;
  }

  function animate() {
    const now = performance.now();
    const time = now * 0.001;

    clouds.children.forEach((sprite, index) => {
      sprite.position.x += Math.sin(time * sprite.userData.driftX + index) * 0.0025;
      sprite.position.y += Math.cos(time * sprite.userData.driftY + sprite.userData.bob) * 0.002;
    });

    sparkles.children.forEach((sprite, index) => {
      sprite.material.opacity = 0.12 + ((Math.sin(time * 1.7 + index) + 1) * 0.08);
      const base = 0.16 + (index % 3) * 0.04;
      sprite.scale.set(base, base, 1);
    });

    markers.forEach((marker, index) => {
      const pulse = marker.userData.index === selectedLevel ? 1 + Math.sin(time * 3.2) * 0.08 : 1;
      const wave = now < waveUntil && marker.userData.index <= unlockedLevel
        ? 1 + Math.sin(time * 7 + index) * 0.05
        : 1;
      const scale = marker.scale.x * 0 + marker.userData.baseScale * pulse * wave * (marker.userData.index === selectedLevel ? 1.45 : marker.userData.index <= unlockedLevel ? 1 : 0.8);
      marker.scale.set(scale, scale, 1);
    });

    confetti.children.forEach((sprite) => {
      sprite.userData.life -= 0.018;
      sprite.position.add(sprite.userData.velocity);
      sprite.userData.velocity.z -= 0.0025;
      sprite.material.opacity = Math.max(0, sprite.userData.life);
      sprite.scale.multiplyScalar(0.988);
    });

    for (let index = confetti.children.length - 1; index >= 0; index -= 1) {
      const sprite = confetti.children[index];
      if (sprite.userData.life <= 0) {
        sprite.material.dispose();
        confetti.remove(sprite);
      }
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  resize();
  updateMarkerStyles();
  animate();
  window.addEventListener("resize", resize);

  return {
    setSelectedLevel(level) {
      selectedLevel = Math.max(1, Math.min(LEVEL_POSITIONS.length, level));
      updateMarkerStyles();
    },
    setUnlockedLevel(level) {
      unlockedLevel = Math.max(1, Math.min(LEVEL_POSITIONS.length, level));
      updateMarkerStyles();
    },
    spawnVictoryConfetti,
    playUnlockAnimation,
    playWaveAnimation,
    resize,
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      mount.innerHTML = "";
    }
  };
}

if (typeof window !== "undefined") {
  window.MultiplicationSprintMapScene = { createMapScene };
}
