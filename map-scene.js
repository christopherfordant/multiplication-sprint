import * as THREE from "./node_modules/three/build/three.module.js";

const MAP_IMAGE_PATH = "./assets/world/world-map-premium-v1.png";
const MAP_WIDTH = 18;
const MAP_HEIGHT = 12;

const LEVEL_POSITIONS = [
  { x: 15, y: 71, boss: false },
  { x: 28, y: 64, boss: false },
  { x: 21, y: 45, boss: false },
  { x: 36, y: 37, boss: false },
  { x: 45, y: 55, boss: false },
  { x: 60, y: 43, boss: false },
  { x: 49, y: 25, boss: false },
  { x: 77, y: 66, boss: false },
  { x: 84, y: 48, boss: false },
  { x: 85, y: 28, boss: true }
];

function percentToWorld({ x, y }) {
  return new THREE.Vector3(
    ((x / 100) - 0.5) * MAP_WIDTH,
    (0.5 - (y / 100)) * MAP_HEIGHT,
    0
  );
}

function buildRadialTexture({ inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)", size = 256 }) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function buildCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  const blobs = [
    [74, 104, 42],
    [126, 84, 58],
    [184, 100, 44],
    [236, 90, 34]
  ];
  blobs.forEach(([x, y, radius]) => {
    const gradient = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    gradient.addColorStop(0, "rgba(255,255,255,0.92)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function buildSelectionRingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255, 234, 156, 0.95)";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(128, 128, 84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 153, 103, 0.8)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 104, 0, Math.PI * 2);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createAmbientClouds(texture) {
  const group = new THREE.Group();
  for (let index = 0; index < 12; index += 1) {
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.18 + Math.random() * 0.12,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3 + Math.random() * 2.8, 1.8 + Math.random() * 1.2, 1);
    sprite.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 13, -0.4 - Math.random() * 0.6);
    sprite.userData = {
      speed: 0.06 + Math.random() * 0.03,
      drift: Math.random() * Math.PI * 2
    };
    group.add(sprite);
  }
  return group;
}

function createSparkles(texture) {
  const group = new THREE.Group();
  for (let index = 0; index < 32; index += 1) {
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.35 + Math.random() * 0.3,
      depthWrite: false,
      color: index % 3 === 0 ? 0xfff3bd : index % 3 === 1 ? 0xffa16d : 0xb9f8ff
    });
    const sprite = new THREE.Sprite(material);
    const scale = 0.16 + Math.random() * 0.18;
    sprite.scale.set(scale, scale, 1);
    sprite.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 11, 0.25 + Math.random() * 0.8);
    sprite.userData = {
      baseScale: scale,
      speed: 0.8 + Math.random() * 1.2,
      offset: Math.random() * Math.PI * 2
    };
    group.add(sprite);
  }
  return group;
}

function createLevelLanterns(texture) {
  return LEVEL_POSITIONS.map((level, index) => {
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      color: level.boss ? 0xff7d60 : 0xffefb5
    });
    const sprite = new THREE.Sprite(material);
    const point = percentToWorld(level);
    sprite.position.set(point.x, point.y, 0.35);
    const scale = level.boss ? 0.95 : 0.42;
    sprite.scale.set(scale, scale, 1);
    sprite.userData = {
      index: index + 1,
      selected: false,
      boss: level.boss,
      baseScale: scale
    };
    return sprite;
  });
}

function setSelectedLanterns(lanterns, selectedLevel, unlockedLevel) {
  lanterns.forEach((lantern) => {
    const isSelected = lantern.userData.index === selectedLevel;
    const isUnlocked = lantern.userData.index <= unlockedLevel;
    lantern.userData.selected = isSelected;
    lantern.material.opacity = isUnlocked ? (isSelected ? 1 : 0.62) : 0.16;
    lantern.material.color.set(isSelected ? 0xfffff3 : lantern.userData.boss ? 0xff8d72 : 0xffefb5);
    const scale = lantern.userData.baseScale * (isSelected ? 1.55 : isUnlocked ? 1 : 0.78);
    lantern.scale.set(scale, scale, 1);
  });
}

function createMapScene(mount) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  mount.innerHTML = "";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-MAP_WIDTH / 2, MAP_WIDTH / 2, MAP_HEIGHT / 2, -MAP_HEIGHT / 2, 0.1, 40);
  camera.position.set(0, 0, 10);

  const textureLoader = new THREE.TextureLoader();
  const root = new THREE.Group();
  scene.add(root);

  const artPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 })
  );
  artPlane.position.z = 0;
  root.add(artPlane);

  textureLoader.load(MAP_IMAGE_PATH, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    artPlane.material.map = texture;
    artPlane.material.needsUpdate = true;
  });

  const glowTexture = buildRadialTexture({ inner: "rgba(255,244,191,1)", outer: "rgba(255,244,191,0)" });
  const warmGlowTexture = buildRadialTexture({ inner: "rgba(255,142,94,1)", outer: "rgba(255,142,94,0)" });
  const coolGlowTexture = buildRadialTexture({ inner: "rgba(157,242,255,1)", outer: "rgba(157,242,255,0)" });
  const cloudTexture = buildCloudTexture();
  const ringTexture = buildSelectionRingTexture();

  const topLight = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.32,
    depthWrite: false
  }));
  topLight.scale.set(9.8, 5.4, 1);
  topLight.position.set(-0.2, 5.2, 0.22);
  root.add(topLight);

  const bossGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: warmGlowTexture,
    transparent: true,
    opacity: 0.44,
    depthWrite: false
  }));
  bossGlow.scale.set(5.8, 5.8, 1);
  bossGlow.position.copy(percentToWorld(LEVEL_POSITIONS[9]));
  bossGlow.position.z = 0.16;
  root.add(bossGlow);

  const waterfallMist = new THREE.Sprite(new THREE.SpriteMaterial({
    map: coolGlowTexture,
    transparent: true,
    opacity: 0.26,
    depthWrite: false
  }));
  waterfallMist.scale.set(4.4, 2.8, 1);
  waterfallMist.position.set(-0.4, 2.85, 0.15);
  root.add(waterfallMist);

  const desertHeat = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    color: 0xffcc7a
  }));
  desertHeat.scale.set(5.6, 3.8, 1);
  desertHeat.position.set(0.8, -0.15, 0.14);
  root.add(desertHeat);

  const clouds = createAmbientClouds(cloudTexture);
  root.add(clouds);

  const sparkles = createSparkles(glowTexture);
  root.add(sparkles);

  const lanterns = createLevelLanterns(glowTexture);
  lanterns.forEach((lantern) => root.add(lantern));

  const selectionRing = new THREE.Sprite(new THREE.SpriteMaterial({
    map: ringTexture,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  }));
  selectionRing.scale.set(1.1, 1.1, 1);
  selectionRing.position.copy(percentToWorld(LEVEL_POSITIONS[0]));
  selectionRing.position.z = 0.46;
  root.add(selectionRing);

  let selectedLevel = 1;
  let unlockedLevel = 1;
  let pointerX = 0;
  let pointerY = 0;
  let raf = 0;

  function resize() {
    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const worldWidth = MAP_WIDTH;
    const worldHeight = MAP_HEIGHT;
    if (aspect > worldWidth / worldHeight) {
      const scaledWidth = worldHeight * aspect;
      camera.left = -scaledWidth / 2;
      camera.right = scaledWidth / 2;
      camera.top = worldHeight / 2;
      camera.bottom = -worldHeight / 2;
    } else {
      const scaledHeight = worldWidth / aspect;
      camera.left = -worldWidth / 2;
      camera.right = worldWidth / 2;
      camera.top = scaledHeight / 2;
      camera.bottom = -scaledHeight / 2;
    }
    camera.updateProjectionMatrix();
  }

  function updateSelection() {
    const point = percentToWorld(LEVEL_POSITIONS[selectedLevel - 1]);
    selectionRing.position.set(point.x, point.y, 0.46);
    setSelectedLanterns(lanterns, selectedLevel, unlockedLevel);
  }

  function onPointerMove(event) {
    const rect = mount.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function animate(now) {
    const t = now * 0.001;
    artPlane.position.x += ((pointerX * 0.2) - artPlane.position.x) * 0.04;
    artPlane.position.y += ((-pointerY * 0.16) - artPlane.position.y) * 0.04;

    root.position.x += ((pointerX * 0.08) - root.position.x) * 0.035;
    root.position.y += ((-pointerY * 0.06) - root.position.y) * 0.035;

    topLight.material.opacity = 0.24 + Math.sin(t * 0.6) * 0.06;
    bossGlow.material.opacity = 0.34 + Math.sin(t * 2.1) * 0.1;
    waterfallMist.material.opacity = 0.16 + Math.sin(t * 1.4) * 0.06;
    desertHeat.material.opacity = 0.16 + Math.cos(t * 1.1) * 0.05;

    selectionRing.material.opacity = 0.72 + Math.sin(t * 2.6) * 0.12;
    const ringScale = 1.02 + Math.sin(t * 2.6) * 0.08;
    selectionRing.scale.set(ringScale, ringScale, 1);

    clouds.children.forEach((cloud, index) => {
      cloud.position.x += Math.sin(t * cloud.userData.speed + cloud.userData.drift + index) * 0.004;
      cloud.position.y += Math.cos(t * cloud.userData.speed * 0.7 + cloud.userData.drift) * 0.0025;
    });

    sparkles.children.forEach((sparkle) => {
      const pulse = 0.8 + Math.sin(t * sparkle.userData.speed + sparkle.userData.offset) * 0.35;
      sparkle.material.opacity = 0.18 + pulse * 0.2;
      const scale = sparkle.userData.baseScale * (0.75 + pulse * 0.35);
      sparkle.scale.set(scale, scale, 1);
    });

    lanterns.forEach((lantern, index) => {
      const pulse = lantern.userData.selected ? 0.94 + Math.sin(t * 4.2 + index) * 0.18 : 1;
      const scale = lantern.userData.baseScale * (lantern.userData.selected ? 1.38 : 1) * pulse;
      lantern.scale.set(scale, scale, 1);
    });

    renderer.render(scene, camera);
    raf = window.requestAnimationFrame(animate);
  }

  resize();
  updateSelection();
  mount.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", resize);
  raf = window.requestAnimationFrame(animate);

  return {
    setSelectedLevel(level) {
      selectedLevel = level;
      updateSelection();
    },
    setUnlockedLevel(level) {
      unlockedLevel = level;
      updateSelection();
    },
    resize,
    destroy() {
      mount.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
      renderer.dispose();
      mount.innerHTML = "";
    }
  };
}

if (typeof window !== "undefined") {
  window.MultiplicationSprintMapScene = { createMapScene };
}
