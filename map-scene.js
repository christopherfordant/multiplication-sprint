import * as THREE from "./node_modules/three/build/three.module.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";

const LEVELS = [
  { biome: "prairie", title: "Village des prairies", color: 0x75d96b, sky: 0x8edbff, accent: 0xffd76a, locked: 0x61708f },
  { biome: "prairie", title: "Moulin dore", color: 0x8de36d, sky: 0x8edbff, accent: 0xffc35c, locked: 0x61708f },
  { biome: "forest", title: "Pont des lanternes", color: 0x2f9e63, sky: 0x6fc8d8, accent: 0x9dffb8, locked: 0x445b65 },
  { biome: "forest", title: "Foret magique", color: 0x238557, sky: 0x5fb7cf, accent: 0x8fffd2, locked: 0x445b65 },
  { biome: "desert", title: "Ruines dorees", color: 0xe8b95a, sky: 0xffca7a, accent: 0xffe299, locked: 0x8e6d55 },
  { biome: "desert", title: "Camp du canyon", color: 0xd79b4e, sky: 0xffb76d, accent: 0xffd061, locked: 0x8e6d55 },
  { biome: "cliffs", title: "Falaises du veilleur", color: 0x7fb7a4, sky: 0xa9d7ff, accent: 0xc7e8ff, locked: 0x667982 },
  { biome: "cliffs", title: "Tour de braise", color: 0x6b8f88, sky: 0x93bfe4, accent: 0xff9874, locked: 0x667982 },
  { biome: "isles", title: "Iles du dragon", color: 0x429dd6, sky: 0x74c6ff, accent: 0xff8b5a, locked: 0x4d6d86 },
  { biome: "castle", title: "Chateau du boss", color: 0x5d5f83, sky: 0x5b6ca8, accent: 0xff6d4a, locked: 0x4b4f69 }
];

const GATE_SPACING = 4.8;
const PAINTERLY_TEXTURE_URL = "./assets/fourtout/textures/variation-a.png";
const HERO_CHARACTER_KEY = "character-oobi";
const HERO_CHARACTER_URL = new URL("./assets/fourtout/GLB%20format/character-oobi.glb", import.meta.url).href;
let sharedPainterlyTexture = null;
const gltfLoader = typeof window !== "undefined" ? new GLTFLoader() : null;
const loadedModelScenes = new Map();
const loadingModelPromises = new Map();
let cachedHeroDefinition = null;
let loadingHeroDefinition = null;

const WORLD_MODEL_URLS = {
  tree: new URL("./assets/fourtout/GLB%20format/tree.glb", import.meta.url).href,
  treePine: new URL("./assets/fourtout/GLB%20format/tree-pine.glb", import.meta.url).href,
  rocks: new URL("./assets/fourtout/GLB%20format/rocks.glb", import.meta.url).href,
  flowers: new URL("./assets/fourtout/GLB%20format/flowers.glb", import.meta.url).href,
  mushrooms: new URL("./assets/fourtout/GLB%20format/mushrooms.glb", import.meta.url).href,
  sign: new URL("./assets/fourtout/GLB%20format/sign.glb", import.meta.url).href,
  crate: new URL("./assets/fourtout/GLB%20format/crate.glb", import.meta.url).href,
  platformFortified: new URL("./assets/fourtout/GLB%20format/platform-fortified.glb", import.meta.url).href,
  fenceRope: new URL("./assets/fourtout/GLB%20format/fence-rope.glb", import.meta.url).href,
  flag: new URL("./assets/fourtout/GLB%20format/flag.glb", import.meta.url).href,
  chest: new URL("./assets/fourtout/GLB%20format/chest.glb", import.meta.url).href,
  doorLargeOpen: new URL("./assets/fourtout/GLB%20format/door-large-open.glb", import.meta.url).href
};

function buildRadialTexture(inner, outer, size = 256) {
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

function getPainterlyTexture() {
  if (sharedPainterlyTexture) {
    return sharedPainterlyTexture;
  }

  const loader = new THREE.TextureLoader();
  sharedPainterlyTexture = loader.load(PAINTERLY_TEXTURE_URL);
  sharedPainterlyTexture.wrapS = THREE.RepeatWrapping;
  sharedPainterlyTexture.wrapT = THREE.RepeatWrapping;
  sharedPainterlyTexture.colorSpace = THREE.SRGBColorSpace;
  return sharedPainterlyTexture;
}

function clonePainterlyTexture(repeatX = 1, repeatY = 1, rotation = 0) {
  const texture = getPainterlyTexture().clone();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(repeatX, repeatY);
  texture.rotation = rotation;
  texture.center.set(0.5, 0.5);
  texture.needsUpdate = true;
  return texture;
}

function prepareImportedScene(scene) {
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = true;
      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material.clone());
      } else if (child.material) {
        child.material = child.material.clone();
      }
    }
  });

  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  scene.position.x -= center.x;
  scene.position.z -= center.z;
  scene.position.y -= box.min.y;
}

function cloneSceneGraph(source) {
  const clone = source.clone(true);
  clone.traverse((child) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material.clone());
      } else {
        child.material = child.material.clone();
      }
    }
  });
  return clone;
}

function normalizeHeroCharacter(scene) {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const targetHeight = 1.9;
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  scene.scale.setScalar(scale);

  const scaledBox = new THREE.Box3().setFromObject(scene);
  const center = scaledBox.getCenter(new THREE.Vector3());
  scene.position.x -= center.x;
  scene.position.z -= center.z;
  scene.position.y -= scaledBox.min.y;
  scene.rotation.y = Math.PI;
  scene.userData.facingOffset = Math.PI;

  scene.traverse((child) => {
    if (child.isMesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.roughness = Math.min(1, (material.roughness ?? 0.8) + 0.08);
        material.metalness = Math.min(material.metalness ?? 0, 0.06);
      });
    }
  });
}

function loadHeroDefinition() {
  if (cachedHeroDefinition) {
    return Promise.resolve(cachedHeroDefinition);
  }

  if (loadingHeroDefinition) {
    return loadingHeroDefinition;
  }

  if (!gltfLoader) {
    return Promise.resolve(null);
  }

  loadingHeroDefinition = new Promise((resolve) => {
    gltfLoader.load(
      HERO_CHARACTER_URL,
      (gltf) => {
        const baseScene = gltf.scene || gltf.scenes?.[0] || null;
        if (!baseScene) {
          resolve(null);
          return;
        }

        prepareImportedScene(baseScene);
        cachedHeroDefinition = {
          key: HERO_CHARACTER_KEY,
          scene: baseScene,
          animations: gltf.animations || []
        };
        resolve(cachedHeroDefinition);
      },
      undefined,
      (error) => {
        console.warn(`Hero model failed to load: ${HERO_CHARACTER_KEY}`, error);
        resolve(null);
      }
    );
  });

  return loadingHeroDefinition;
}

function instantiateHeroCharacter() {
  if (!cachedHeroDefinition?.scene) {
    return null;
  }

  const scene = cloneSceneGraph(cachedHeroDefinition.scene);
  normalizeHeroCharacter(scene);
  return {
    scene,
    animations: cachedHeroDefinition.animations || []
  };
}

function loadWorldModel(key) {
  if (loadedModelScenes.has(key)) {
    return Promise.resolve(loadedModelScenes.get(key));
  }

  if (loadingModelPromises.has(key)) {
    return loadingModelPromises.get(key);
  }

  if (!gltfLoader || !WORLD_MODEL_URLS[key]) {
    return Promise.resolve(null);
  }

  const promise = new Promise((resolve) => {
    gltfLoader.load(
      WORLD_MODEL_URLS[key],
      (gltf) => {
        const scene = gltf.scene || gltf.scenes?.[0] || null;
        if (scene) {
          prepareImportedScene(scene);
          loadedModelScenes.set(key, scene);
        }
        resolve(scene);
      },
      undefined,
      (error) => {
        console.warn(`World model failed to load: ${key}`, error);
        resolve(null);
      }
    );
  });

  loadingModelPromises.set(key, promise);
  return promise;
}

function preloadWorldModels() {
  return Promise.all(Object.keys(WORLD_MODEL_URLS).map((key) => loadWorldModel(key)));
}

function preloadSceneAssets() {
  return Promise.all([preloadWorldModels(), loadHeroDefinition()]);
}

function createModelProp(key, { x = 0, y = 0, z = 0, scale = 1, rotationY = 0 } = {}) {
  const source = loadedModelScenes.get(key);
  if (!source) {
    return null;
  }

  const clone = source.clone(true);
  clone.position.set(x, y, z);
  clone.rotation.y = rotationY;
  clone.scale.setScalar(scale);
  return clone;
}

function makeMat(color, roughness = 0.75, metalness = 0.04) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        ["map", "alphaMap", "emissiveMap", "roughnessMap", "metalnessMap"].forEach((key) => {
          if (mat[key]?.isTexture && mat[key] !== sharedPainterlyTexture) {
            mat[key].dispose();
          }
        });
        mat.dispose();
      });
    }
  });
}

function createHero() {
  const hero = new THREE.Group();
  hero.name = "Nova";

  const skin = makeMat(0xffc994, 0.68);
  const hair = makeMat(0x3d2315, 0.8);
  const tunic = makeMat(0x2f75e8, 0.65);
  const cape = makeMat(0xd64263, 0.72);
  const boots = makeMat(0x2b214b, 0.7);
  const gold = makeMat(0xffd15c, 0.5, 0.12);
  const white = makeMat(0xffffff, 0.5);
  const eye = makeMat(0x182145, 0.45);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.72, 8, 18), tunic);
  body.position.set(0, 1.2, 0);
  body.scale.set(0.86, 1, 0.62);
  hero.add(body);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.025, 8, 32), gold);
  belt.position.set(0, 0.94, 0);
  belt.rotation.x = Math.PI / 2;
  belt.scale.set(1.1, 0.7, 1);
  hero.add(belt);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 18), skin);
  head.position.set(0, 1.88, 0.02);
  head.scale.set(0.94, 1.04, 0.86);
  hero.add(head);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), hair);
  hairCap.position.set(0, 2.03, 0.01);
  hairCap.scale.set(1.02, 0.72, 0.9);
  hero.add(hairCap);

  for (const x of [-0.13, 0.13]) {
    const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), eye);
    eyeMesh.position.set(x, 1.9, 0.34);
    hero.add(eyeMesh);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), white);
    glint.position.set(x + 0.012, 1.912, 0.366);
    hero.add(glint);
  }

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.008, 6, 18, Math.PI), eye);
  smile.position.set(0, 1.78, 0.365);
  smile.rotation.set(Math.PI, 0, 0);
  hero.add(smile);

  const crown = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 4), gold);
    spike.position.set((index - 1) * 0.13, 2.28, 0.02);
    crown.add(spike);
  }
  const crownBand = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.32), gold);
  crownBand.position.set(0, 2.16, 0.02);
  crown.add(crownBand);
  hero.add(crown);

  const capeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.05, 4), cape);
  capeMesh.position.set(0, 1.03, -0.26);
  capeMesh.rotation.set(Math.PI * 0.12, Math.PI / 4, 0);
  capeMesh.scale.set(1, 0.9, 0.34);
  hero.add(capeMesh);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.48, 6, 12), skin);
    arm.position.set(side * 0.48, 1.25, 0.04);
    arm.rotation.z = side * 0.36;
    hero.add(arm);

    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), gold);
    glove.position.set(side * 0.57, 0.9, 0.09);
    hero.add(glove);

    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.52, 6, 12), boots);
    leg.position.set(side * 0.16, 0.42, 0.02);
    leg.rotation.z = side * 0.05;
    hero.add(leg);
  }

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 32),
    new THREE.MeshBasicMaterial({ color: 0x111a38, transparent: true, opacity: 0.22 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  hero.add(shadow);

  hero.scale.setScalar(0.92);
  hero.position.set(0, 0, 0);
  hero.userData.facingOffset = 0;
  return hero;
}

function createTree(x, z, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.8 * scale, 8), makeMat(0x7a4d2a));
  trunk.position.set(x, 0.4 * scale, z);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.45 * scale, 1.1 * scale, 8), makeMat(0x2c9f55));
  crown.position.set(x, 1.15 * scale, z);
  group.add(trunk, crown);
  return group;
}

function createCrystal(x, z, color = 0x8fffd2, scale = 1) {
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.28 * scale, 0), makeMat(color, 0.42, 0.18));
  crystal.position.set(x, 0.42 * scale, z);
  crystal.rotation.y = Math.PI / 4;
  return crystal;
}

function createCastle() {
  const group = new THREE.Group();
  const stone = makeMat(0xbfc7e8);
  const roof = makeMat(0x6e3d82);
  const gate = makeMat(0x3b2031);

  const main = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.4, 0.9), stone);
  main.position.y = 0.85;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.62, 0.94), gate);
  door.position.set(0, 0.34, 0.03);
  group.add(main, door);

  for (const x of [-0.95, 0.95]) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 1.75, 12), stone);
    tower.position.set(x, 0.95, 0);
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.75, 12), roof);
    top.position.set(x, 2.0, 0);
    group.add(tower, top);
  }

  const orb = createCrystal(0, 0.1, 0xff7659, 1.3);
  orb.position.y = 2.35;
  group.add(orb);
  group.position.set(0, 0, -5.4);
  group.scale.setScalar(1.12);
  return group;
}

function createPortal(index, level, selectedLevel, unlockedLevel, glowTexture) {
  const group = new THREE.Group();
  const isUnlocked = index + 1 <= unlockedLevel;
  const isSelected = index + 1 === selectedLevel;
  const isNextOpen = index + 1 === selectedLevel + 1 && index + 1 <= unlockedLevel;
  const color = isUnlocked ? level.accent : level.locked;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(isNextOpen ? 0.68 : (isSelected ? 0.54 : 0.42), isNextOpen ? 0.075 : 0.055, 10, 32),
    makeMat(color, 0.42, 0.1)
  );
  ring.position.y = 1.05;
  ring.rotation.x = Math.PI / 2;

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.62, 0.18, 18),
    makeMat(isUnlocked ? 0x425287 : 0x34394c)
  );
  base.position.y = 0.09;

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    depthWrite: false,
    opacity: isUnlocked ? (isNextOpen ? 1 : (isSelected ? 0.9 : 0.45)) : 0.12,
    color
  }));
  glow.position.y = 1.05;
  glow.scale.set(isNextOpen ? 2.35 : (isSelected ? 1.8 : 1.2), isNextOpen ? 2.35 : (isSelected ? 1.8 : 1.2), 1);

  const label = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.16, 0.05),
    makeMat(isUnlocked ? 0xfff4c2 : 0x8890a8)
  );
  label.position.y = 0.42;

  group.add(base, ring, glow, label);

  if (isNextOpen) {
    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.52, 3),
      makeMat(0xfff2a8, 0.38, 0.16)
    );
    arrow.position.set(0, 1.86, 0);
    arrow.rotation.z = Math.PI;
    arrow.userData.pulse = true;
    group.add(arrow);
  }

  group.position.set((index - selectedLevel + 1) * GATE_SPACING, 0, -5.2 - Math.abs(index - selectedLevel + 1) * 0.45);
  group.userData = { level: index + 1, unlocked: isUnlocked, nextOpen: isNextOpen };
  return group;
}

function createBiomeSet(level, selectedLevel) {
  const group = new THREE.Group();
  const biome = level.biome;
  const addProp = (key, options) => {
    const prop = createModelProp(key, options);
    if (prop) {
      group.add(prop);
    }
  };

  if (biome === "prairie") {
    group.add(createTree(-3.8, -3.9, 0.95), createTree(3.5, -4.2, 1.08), createTree(-5.4, -1.7, 0.78));
    const windmill = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.25, 0.45), makeMat(0xf1dfbd));
    windmill.position.set(2.5, 0.65, -3.8);
    const blades = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 6, 18), makeMat(0xffefb0));
    blades.position.set(2.5, 1.48, -3.55);
    group.add(windmill, blades);
    addProp("tree", { x: -4.8, z: -4.8, scale: 0.78, rotationY: Math.PI * 0.15 });
    addProp("tree", { x: 4.6, z: -4.6, scale: 0.9, rotationY: -Math.PI * 0.08 });
    addProp("flowers", { x: 0.8, z: -3.2, scale: 0.75, rotationY: Math.PI * 0.2 });
    addProp("sign", { x: -1.8, z: -2.2, scale: 0.82, rotationY: Math.PI * 0.18 });
  } else if (biome === "forest") {
    for (let index = 0; index < 8; index += 1) {
      group.add(createTree(-5 + index * 1.4, -4.4 - (index % 2) * 0.5, 0.85 + (index % 3) * 0.12));
    }
    group.add(createCrystal(-1.7, -3.3, 0x7effd1, 0.9), createCrystal(2.1, -3.7, 0x9d9bff, 0.7));
    addProp("treePine", { x: -3.6, z: -4.8, scale: 0.88, rotationY: Math.PI * 0.1 });
    addProp("treePine", { x: 4.2, z: -4.6, scale: 0.78, rotationY: -Math.PI * 0.14 });
    addProp("mushrooms", { x: 1.4, z: -3.1, scale: 0.72, rotationY: Math.PI * 0.35 });
    addProp("sign", { x: -1.4, z: -2.5, scale: 0.76, rotationY: -Math.PI * 0.2 });
  } else if (biome === "desert") {
    for (let index = 0; index < 5; index += 1) {
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1 + index * 0.12, 10), makeMat(0xdca75d));
      column.position.set(-4 + index * 1.9, 0.55, -4.0 - (index % 2) * 0.35);
      group.add(column);
    }
    group.add(createCrystal(3.8, -3.2, 0xffde86, 1));
    addProp("rocks", { x: -3.9, z: -4.6, scale: 0.92, rotationY: Math.PI * 0.22 });
    addProp("crate", { x: 2.8, z: -3.3, scale: 0.88, rotationY: -Math.PI * 0.16 });
    addProp("flag", { x: 0.7, z: -4.3, scale: 0.76, rotationY: Math.PI * 0.08 });
  } else if (biome === "cliffs") {
    for (let index = 0; index < 6; index += 1) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 + index * 0.04, 0), makeMat(0x6e7f88));
      rock.position.set(-4.6 + index * 1.8, 0.34, -4.2 - (index % 2) * 0.45);
      rock.scale.y = 1.2 + (index % 2) * 0.55;
      group.add(rock);
    }
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 2.2, 12), makeMat(0xb9c5d4));
    tower.position.set(3.6, 1.1, -4.4);
    group.add(tower);
    addProp("platformFortified", { x: -2.2, z: -4.5, scale: 0.95, rotationY: Math.PI * 0.16 });
    addProp("fenceRope", { x: 2.1, z: -3.8, scale: 0.82, rotationY: -Math.PI * 0.1 });
    addProp("flag", { x: 3.8, z: -3.3, scale: 0.74, rotationY: Math.PI * 0.05 });
  } else {
    group.add(createCastle());
    group.add(createCrystal(-3.6, -3.6, 0xff785f, 1.1), createCrystal(3.5, -3.4, 0xffb36a, 0.9));
    addProp("doorLargeOpen", { x: 0, z: -4.45, scale: 1.08 });
    addProp("chest", { x: -2.4, z: -3.6, scale: 0.86, rotationY: Math.PI * 0.2 });
    addProp("star", { x: 2.4, y: 0.18, z: -3.6, scale: 0.82, rotationY: Math.PI * 0.35 });
  }

  const milestone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.75, 8), makeMat(0xfff1bd));
  milestone.position.set(-1.2, 0.38, -2.4);
  milestone.userData.spin = selectedLevel;
  group.add(milestone);

  return group;
}

function createGround(level) {
  const group = new THREE.Group();
  const painterlyGround = clonePainterlyTexture(2.3, 2.1, Math.PI * 0.08);
  const painterlyPath = clonePainterlyTexture(1.2, 2.8, -Math.PI * 0.04);
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(9.8, 64),
    new THREE.MeshStandardMaterial({
      color: level.color,
      map: painterlyGround,
      roughness: 0.86,
      metalness: 0.03
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.scale.z = 0.82;

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.1, 10.8),
    new THREE.MeshStandardMaterial({
      color: level.biome === "desert" ? 0xf9d084 : 0xe8d19d,
      map: painterlyPath,
      roughness: 0.72,
      metalness: 0.02
    })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.006, -2.7);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(7.8, 0.07, 8, 96),
    makeMat(0xfff0b7, 0.6, 0.08)
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.03;
  rim.scale.z = 0.72;

  group.add(ground, path, rim);

  const painterlyMist = new THREE.Mesh(
    new THREE.CircleGeometry(8.2, 48),
    new THREE.MeshBasicMaterial({
      map: clonePainterlyTexture(1.4, 1.4, Math.PI * 0.18),
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
      color: level.accent
    })
  );
  painterlyMist.rotation.x = -Math.PI / 2;
  painterlyMist.position.y = 0.03;
  painterlyMist.scale.set(1, 0.72, 1);
  group.add(painterlyMist);

  return group;
}

function createSky(level, glowTexture, reducedMotion) {
  const group = new THREE.Group();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(18, 32, 16),
    new THREE.MeshBasicMaterial({ color: level.sky, side: THREE.BackSide })
  );
  sky.position.y = 4;
  group.add(sky);

  const sun = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.55,
    color: level.accent
  }));
  sun.position.set(-5.2, 8.2, -8);
  sun.scale.set(5.4, 5.4, 1);
  group.add(sun);

  const haze = new THREE.Sprite(new THREE.SpriteMaterial({
    map: clonePainterlyTexture(1, 1, 0),
    transparent: true,
    depthWrite: false,
    opacity: 0.13,
    color: level.accent
  }));
  haze.position.set(0, 4.8, -6.8);
  haze.scale.set(16, 8.8, 1);
  group.add(haze);

  const cloudCount = reducedMotion ? 5 : 11;
  for (let index = 0; index < cloudCount; index += 1) {
    const cloud = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.12 + Math.random() * 0.09,
      color: 0xffffff
    }));
    cloud.position.set(-8 + Math.random() * 16, 4.2 + Math.random() * 3.2, -7 - Math.random() * 4);
    cloud.scale.set(2.2 + Math.random() * 2.3, 1.0 + Math.random(), 1);
    cloud.userData.speed = 0.004 + Math.random() * 0.008;
    group.add(cloud);
  }

  return group;
}

export function createMapScene(mount, reducedMotion = false) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  mount.innerHTML = "";
  mount.appendChild(renderer.domElement);

  const worldMap = mount.closest(".world-map");
  worldMap?.classList.add("journey-3d-ready");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
  camera.position.set(0, 2.15, 7.1);
  camera.lookAt(0, 1.15, -2.3);

  const ambient = new THREE.AmbientLight(0xffffff, 0.78);
  const key = new THREE.DirectionalLight(0xffefc8, 1.35);
  key.position.set(-4.5, 7.8, 5.6);
  const rim = new THREE.DirectionalLight(0x9edbff, 0.65);
  rim.position.set(5.2, 3.8, -4.2);
  scene.add(ambient, key, rim);

  const glowTexture = buildRadialTexture("rgba(255,246,196,1)", "rgba(255,246,196,0)");
  const sparkleTexture = buildRadialTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)");
  const heroAnchor = new THREE.Group();
  heroAnchor.position.set(0, 0.02, 1.2);
  const heroShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.72, 32),
    new THREE.MeshBasicMaterial({ color: 0x111a38, transparent: true, opacity: 0.18 })
  );
  heroShadow.rotation.x = -Math.PI / 2;
  heroShadow.position.y = 0.02;
  scene.add(heroAnchor, heroShadow);
  let hero = createHero();
  hero.userData.isProceduralHero = true;
  heroAnchor.add(hero);

  const portals = new THREE.Group();
  const particles = new THREE.Group();
  const confetti = new THREE.Group();
  scene.add(portals, particles, confetti);

  let selectedLevel = 1;
  let unlockedLevel = 1;
  let currentWorld = new THREE.Group();
  let rafId = 0;
  let pointerX = 0;
  let pointerY = 0;
  let heroState = "idle";
  let walkUntil = 0;
  let travel = null;
  let heroMixer = null;
  let heroActions = new Map();
  let currentHeroAction = "";
  let previousTick = performance.now();

  function playHeroAction(actionName, fadeDuration = 0.22) {
    if (!heroMixer || !heroActions.size) {
      currentHeroAction = actionName;
      return;
    }

    const nextAction = heroActions.get(actionName) || heroActions.get("idle") || heroActions.values().next().value;
    if (!nextAction || currentHeroAction === actionName) {
      return;
    }

    heroActions.forEach((action, key) => {
      if (action === nextAction) {
        action.reset();
        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(1);
        action.fadeIn(fadeDuration).play();
      } else if (key === currentHeroAction) {
        action.fadeOut(fadeDuration);
      }
    });
    currentHeroAction = actionName;
  }

  function replaceHeroVisual(nextHero, animations = []) {
    if (hero) {
      heroAnchor.remove(hero);
    }

    hero = nextHero;
    heroAnchor.add(hero);

    heroMixer = null;
    heroActions = new Map();
    currentHeroAction = "";

    if (animations.length) {
      heroMixer = new THREE.AnimationMixer(hero);
      animations.forEach((clip) => {
        heroActions.set(clip.name, heroMixer.clipAction(clip));
      });
    }

    const targetState = heroState === "walk" ? "walk" : (heroState === "victory" ? "victory" : "idle");
    playHeroAction(targetState === "victory" ? "emote-yes" : targetState);
  }

  function rebuildWorld() {
    disposeObject(currentWorld);
    scene.remove(currentWorld);
    currentWorld = new THREE.Group();
    const level = LEVELS[selectedLevel - 1];
    currentWorld.add(createSky(level, glowTexture, reducedMotion));
    currentWorld.add(createGround(level));
    currentWorld.add(createBiomeSet(level, selectedLevel));
    scene.add(currentWorld);

    while (portals.children.length) {
      const portal = portals.children.pop();
      disposeObject(portal);
    }
    LEVELS.forEach((item, index) => portals.add(createPortal(index, item, selectedLevel, unlockedLevel, glowTexture)));
  }

  function spawnAmbientParticles() {
    while (particles.children.length) {
      const particle = particles.children.pop();
      particle.material.dispose();
    }
    const level = LEVELS[selectedLevel - 1];
    const count = reducedMotion ? 14 : 34;
    for (let index = 0; index < count; index += 1) {
      const particle = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sparkleTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.18 + Math.random() * 0.22,
        color: level.accent
      }));
      particle.position.set((Math.random() - 0.5) * 12, 0.8 + Math.random() * 3.8, -1.5 - Math.random() * 8);
      const scale = 0.08 + Math.random() * 0.12;
      particle.scale.set(scale, scale, 1);
      particle.userData.float = Math.random() * Math.PI * 2;
      particles.add(particle);
    }
  }

  function updateSelection() {
    selectedLevel = Math.max(1, Math.min(LEVELS.length, selectedLevel));
    unlockedLevel = Math.max(1, Math.min(LEVELS.length, unlockedLevel));
    rebuildWorld();
    spawnAmbientParticles();
  }

  function resize() {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function spawnVictoryConfetti() {
    while (confetti.children.length) {
      const child = confetti.children.pop();
      child.material.dispose();
    }
    for (let index = 0; index < 38; index += 1) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sparkleTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.95,
        color: [0xffd75e, 0xff7a62, 0x82e6ff, 0xa5ff9d][index % 4]
      }));
      sprite.position.set((Math.random() - 0.5) * 1.5, 2.3 + Math.random() * 1.2, 0.1);
      sprite.scale.set(0.16, 0.16, 1);
      sprite.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.08, 0.05 + Math.random() * 0.05, (Math.random() - 0.5) * 0.06);
      sprite.userData.life = 1;
      confetti.add(sprite);
    }
  }

  function playUnlockAnimation(levelIndex) {
    unlockedLevel = Math.max(unlockedLevel, levelIndex);
    walkUntil = performance.now() + 1200;
    heroState = "walk";
    playHeroAction("walk");
    updateSelection();
  }

  function playTravelToLevel(levelIndex) {
    const target = Math.max(1, Math.min(LEVELS.length, levelIndex));
    if (target > unlockedLevel) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      travel = {
        from: selectedLevel,
        to: target,
        start: performance.now(),
        duration: reducedMotion ? 80 : 1250,
        resolve
      };
      heroState = "walk";
      playHeroAction("walk");
      walkUntil = performance.now() + travel.duration + 240;
    });
  }

  function playWaveAnimation() {
    walkUntil = performance.now() + 900;
    heroState = "victory";
    playHeroAction("emote-yes");
  }

  function onPointerMove(event) {
    const rect = mount.getBoundingClientRect();
    pointerX = (((event.clientX - rect.left) / Math.max(1, rect.width)) - 0.5) * 0.35;
    pointerY = (((event.clientY - rect.top) / Math.max(1, rect.height)) - 0.5) * 0.2;
  }

  function onPointerLeave() {
    pointerX = 0;
    pointerY = 0;
  }

  function onClick(event) {
    const rect = mount.getBoundingClientRect();
    const third = rect.width / 3;
    if (event.clientX - rect.left > third && selectedLevel < unlockedLevel) {
      window.advanceJourneyLevel?.();
      return;
    }
    if (event.clientX - rect.left < third && selectedLevel > 1) {
      window.selectMapLevel?.(selectedLevel - 1, false);
    }
  }

  function animate() {
    const now = performance.now();
    const time = now * 0.001;
    const delta = Math.min(0.05, (now - previousTick) / 1000);
    previousTick = now;
    const walking = heroState === "walk" && now < walkUntil;
    const celebrating = heroState === "victory" && now < walkUntil;
    if (!walking && !celebrating) {
      heroState = "idle";
      playHeroAction("idle");
    } else if (walking) {
      playHeroAction("walk");
    } else if (celebrating) {
      playHeroAction("emote-yes");
    }

    if (travel) {
      const progress = Math.min(1, (now - travel.start) / travel.duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      heroAnchor.position.z = 1.2 - eased * 3.95;
      heroAnchor.position.x = Math.sin(eased * Math.PI) * 0.28;
      camera.position.z = 7.1 - eased * 1.25;
      camera.position.y = 2.15 + Math.sin(eased * Math.PI) * 0.32;
      if (progress >= 1) {
        const done = travel;
        travel = null;
        selectedLevel = done.to;
        heroAnchor.position.set(0, 0.02, 1.2);
        camera.position.set(0, 2.15, 7.1);
        updateSelection();
        done.resolve(true);
      }
    }

    heroAnchor.position.y = 0.02 + Math.sin(time * (walking ? 8 : 2.1)) * (walking ? 0.055 : 0.018);
    heroShadow.position.x = heroAnchor.position.x;
    heroShadow.position.z = heroAnchor.position.z;
    heroShadow.material.opacity = 0.14 + Math.abs(Math.sin(time * 2.1)) * 0.06;
    const facingOffset = hero.userData?.facingOffset ?? 0;
    heroAnchor.rotation.y += ((((travel ? 0 : pointerX) * 0.45) + facingOffset) - heroAnchor.rotation.y) * 0.06;
    if (hero.userData?.isProceduralHero) {
      hero.children.forEach((child, index) => {
        if (child.geometry?.type === "CapsuleGeometry" && index > 8) {
          child.rotation.x = walking ? Math.sin(time * 9 + index) * 0.16 : 0;
        }
      });
    }
    if (celebrating) heroAnchor.rotation.z = Math.sin(time * 8) * 0.06;
    else heroAnchor.rotation.z *= 0.92;

    heroMixer?.update(delta);

    currentWorld.children.forEach((child) => {
      child.children?.forEach((item) => {
        if (item.userData?.speed) item.position.x += item.userData.speed;
        if (item.position?.x > 9) item.position.x = -9;
        if (item.userData?.spin) item.rotation.y += 0.01;
      });
    });

    particles.children.forEach((particle, index) => {
      particle.position.y += Math.sin(time + particle.userData.float) * 0.0025;
      particle.material.opacity = 0.16 + ((Math.sin(time * 1.8 + index) + 1) * 0.1);
    });

    portals.children.forEach((portal, index) => {
      const isNextOpen = portal.userData?.nextOpen;
      portal.rotation.y = Math.sin(time * (isNextOpen ? 1.35 : 0.8) + index) * (isNextOpen ? 0.14 : 0.08);
      portal.position.y = Math.sin(time * (isNextOpen ? 2.4 : 1.4) + index) * (isNextOpen ? 0.075 : 0.035);
      portal.children.forEach((child) => {
        if (child.userData?.pulse) {
          const scale = 1 + Math.sin(time * 4.4) * 0.14;
          child.scale.setScalar(scale);
        }
      });
    });

    confetti.children.forEach((sprite) => {
      sprite.userData.life -= 0.018;
      sprite.position.add(sprite.userData.velocity);
      sprite.userData.velocity.y -= 0.003;
      sprite.material.opacity = Math.max(0, sprite.userData.life);
    });
    for (let index = confetti.children.length - 1; index >= 0; index -= 1) {
      if (confetti.children[index].userData.life <= 0) {
        const sprite = confetti.children[index];
        sprite.material.dispose();
        confetti.remove(sprite);
      }
    }

    if (!travel) {
      camera.position.x += (pointerX - camera.position.x) * 0.035;
      camera.position.y += ((2.15 - pointerY) - camera.position.y) * 0.035;
      camera.position.z += (7.1 - camera.position.z) * 0.035;
    }
    camera.lookAt(0, 1.12, -2.6);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  updateSelection();
  resize();
  animate();
  loadHeroDefinition().then((definition) => {
    const heroInstance = definition ? instantiateHeroCharacter() : null;
    if (heroInstance?.scene) {
      replaceHeroVisual(heroInstance.scene, heroInstance.animations);
    }
  });
  preloadSceneAssets().then(() => {
    updateSelection();
  });
  window.addEventListener("resize", resize);
  mount.addEventListener("pointermove", onPointerMove);
  mount.addEventListener("pointerleave", onPointerLeave);
  mount.addEventListener("click", onClick);

  return {
    setSelectedLevel(level) {
      if (level === selectedLevel) return;
      selectedLevel = Math.max(1, Math.min(LEVELS.length, level));
      walkUntil = performance.now() + 720;
      heroState = "walk";
      updateSelection();
    },
    setUnlockedLevel(level) {
      unlockedLevel = Math.max(1, Math.min(LEVELS.length, level));
      updateSelection();
    },
    spawnVictoryConfetti,
    playUnlockAnimation,
    playTravelToLevel,
    playWaveAnimation,
    resize,
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      mount.removeEventListener("click", onClick);
      heroMixer?.stopAllAction();
      worldMap?.classList.remove("journey-3d-ready");
      disposeObject(scene);
      renderer.dispose();
      mount.innerHTML = "";
    }
  };
}

if (typeof window !== "undefined") {
  window.MultiplicationSprintMapScene = { createMapScene };
}
