import * as THREE from "./node_modules/three/build/three.module.js";

const LEVEL_POSITIONS = [
  { x: 12, y: 70, biome: "prairie" },
  { x: 20, y: 52, biome: "prairie" },
  { x: 34, y: 26, biome: "forest" },
  { x: 44, y: 22, biome: "forest" },
  { x: 48, y: 52, biome: "desert" },
  { x: 58, y: 57, biome: "desert" },
  { x: 72, y: 35, biome: "cliffs" },
  { x: 84, y: 24, biome: "cliffs" },
  { x: 79, y: 80, biome: "isles" },
  { x: 90, y: 17, biome: "isles", boss: true }
];

const BIOME_COLORS = {
  prairie: { top: 0x8ff16a, side: 0x3d8d3a, accent: 0xf9f2c4 },
  forest: { top: 0x68d789, side: 0x226445, accent: 0xc5ffd6 },
  desert: { top: 0xf8d07a, side: 0xb8773f, accent: 0xfff0c6 },
  cliffs: { top: 0x9ed6ba, side: 0x61726d, accent: 0xf4f8ff },
  isles: { top: 0x6fd791, side: 0x5a432c, accent: 0xffd7b3 }
};

function mapPercentToScene(position) {
  return new THREE.Vector3(
    ((position.x / 100) - 0.5) * 22,
    (0.5 - (position.y / 100)) * 13,
    0
  );
}

function roundedIslandShape(width, height, wobble = 0.9) {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  shape.moveTo(-hw * 0.85, -hh * 0.2);
  shape.bezierCurveTo(-hw * 1.1, -hh * 0.95, -hw * 0.35, -hh * 1.15, 0, -hh);
  shape.bezierCurveTo(hw * 0.45, -hh * 1.12, hw * 1.12, -hh * 0.62, hw, -hh * 0.08);
  shape.bezierCurveTo(hw * 1.05, hh * 0.52, hw * 0.38, hh * 1.08, -hw * 0.06, hh * 0.94);
  shape.bezierCurveTo(-hw * 0.62, hh * 1.08, -hw * 1.02, hh * 0.35, -hw * 0.85, -hh * 0.2);
  return shape;
}

function createIsland({ colorKey, width, height, depth }) {
  const colors = BIOME_COLORS[colorKey];
  const shape = roundedIslandShape(width, height);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.22,
    bevelSegments: 2
  });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, depth * 0.5, 0);
  const materials = [
    new THREE.MeshStandardMaterial({ color: colors.side, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: colors.side, roughness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: colors.top, roughness: 0.88, flatShading: true })
  ];
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createTree(accent = 0x4f8f36) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.11, 0.55, 6),
    new THREE.MeshStandardMaterial({ color: 0x6e4423, roughness: 1 })
  );
  trunk.position.y = 0.28;
  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 0.8, 7),
    new THREE.MeshStandardMaterial({ color: accent, roughness: 0.95, flatShading: true })
  );
  crown.position.y = 0.9;
  group.add(trunk, crown);
  return group;
}

function createTower() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.4, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4dbf5, roughness: 0.92 })
  );
  base.position.y = 0.8;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.44, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a4769, roughness: 0.9 })
  );
  roof.position.y = 1.95;
  group.add(base, roof);
  return group;
}

function createWindmill() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.34, 1.1, 7),
    new THREE.MeshStandardMaterial({ color: 0xe5d0a3, roughness: 0.95 })
  );
  body.position.y = 0.55;
  const hub = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x70421f })
  );
  hub.position.set(0, 0.95, 0.2);
  const blades = [];
  for (let i = 0; i < 4; i += 1) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.75, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xf7f1d9, roughness: 0.95 })
    );
    blade.position.copy(hub.position);
    blade.rotation.z = (Math.PI / 2) * i;
    blades.push(blade);
  }
  group.add(body, hub, ...blades);
  group.userData.blades = blades;
  return group;
}

function createBridge(length = 2.4) {
  const bridge = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.12, length, 6, 10),
    new THREE.MeshStandardMaterial({ color: 0x643c1e, roughness: 0.98 })
  );
  bridge.rotation.z = Math.PI / 2.3;
  bridge.rotation.y = Math.PI / 2;
  return bridge;
}

function createCastle() {
  const group = new THREE.Group();
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xdfe5ff, roughness: 0.88 });
  const main = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.35), wallMaterial);
  main.position.y = 0.7;
  const leftTower = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.8, 8), wallMaterial);
  leftTower.position.set(-0.95, 0.9, 0);
  const rightTower = leftTower.clone();
  rightTower.position.x = 0.95;
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xff8d63, roughness: 0.86 });
  const roofL = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.7, 8), roofMaterial);
  roofL.position.set(-0.95, 2.05, 0);
  const roofR = roofL.clone();
  roofR.position.x = 0.95;
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.05), new THREE.MeshStandardMaterial({ color: 0xffd15b }));
  banner.position.set(0, 1.8, 0.55);
  const gate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.12), new THREE.MeshStandardMaterial({ color: 0x5b3017 }));
  gate.position.set(0, 0.36, 0.68);
  group.add(main, leftTower, rightTower, roofL, roofR, banner, gate);
  return group;
}

function createLevelMarker(position, accent, boss = false) {
  const group = new THREE.Group();
  group.position.copy(position);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(boss ? 0.3 : 0.2, 14, 14),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: boss ? 1.2 : 0.7,
      transparent: true,
      opacity: boss ? 0.95 : 0.86
    })
  );
  glow.position.y = boss ? 1.55 : 1.05;
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, boss ? 1.6 : 1.05, 6),
    new THREE.MeshStandardMaterial({ color: 0xf7edd2, roughness: 0.9 })
  );
  pillar.position.y = boss ? 0.8 : 0.52;
  group.add(pillar, glow);
  group.userData.glow = glow;
  return group;
}

function buildSceneObjects(scene) {
  const world = new THREE.Group();
  scene.add(world);

  const ocean = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 19, 1.2, 48, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x2a63d9,
      roughness: 0.88,
      metalness: 0.02,
      transparent: true,
      opacity: 0.92
    })
  );
  ocean.rotation.x = Math.PI / 2;
  ocean.position.set(0, -2.4, -0.8);
  world.add(ocean);

  const islandConfigs = [
    { pos: mapPercentToScene({ x: 18, y: 50 }), width: 4.8, height: 4.6, depth: 0.85, colorKey: "prairie", deco: "windmill" },
    { pos: mapPercentToScene({ x: 40, y: 25 }), width: 4.5, height: 3.6, depth: 0.82, colorKey: "forest", deco: "forest" },
    { pos: mapPercentToScene({ x: 52, y: 56 }), width: 5.1, height: 4.1, depth: 0.82, colorKey: "desert", deco: "desert" },
    { pos: mapPercentToScene({ x: 78, y: 35 }), width: 5.1, height: 4.2, depth: 0.92, colorKey: "cliffs", deco: "tower" },
    { pos: mapPercentToScene({ x: 78, y: 82 }), width: 4.6, height: 2.6, depth: 0.7, colorKey: "isles", deco: "castle" }
  ];

  const animatedObjects = [];

  islandConfigs.forEach((config) => {
    const island = createIsland(config);
    island.position.copy(config.pos);
    island.position.z = config.colorKey === "isles" ? 1.2 : 0;
    world.add(island);

    if (config.deco === "windmill") {
      const windmill = createWindmill();
      windmill.position.set(config.pos.x + 0.6, config.pos.y + 0.2, 0.5);
      world.add(windmill);
      animatedObjects.push(windmill);
      for (let i = 0; i < 4; i += 1) {
        const tree = createTree(0x6bb53a);
        tree.position.set(config.pos.x - 1.4 + i * 0.55, config.pos.y - 0.5 + (i % 2) * 0.2, 0.35);
        tree.scale.setScalar(0.9 - i * 0.08);
        world.add(tree);
      }
    }

    if (config.deco === "forest") {
      for (let i = 0; i < 6; i += 1) {
        const tree = createTree(i % 2 ? 0x2f8c4d : 0x4aa55a);
        tree.position.set(config.pos.x - 1.6 + i * 0.55, config.pos.y + (i % 2 ? 0.6 : -0.35), 0.4);
        tree.scale.setScalar(0.78 + (i % 3) * 0.1);
        world.add(tree);
      }
      const bridge = createBridge(2.1);
      bridge.position.set(config.pos.x - 2.3, config.pos.y + 0.1, 0.5);
      bridge.rotation.z = -0.15;
      world.add(bridge);
    }

    if (config.deco === "desert") {
      for (let i = 0; i < 5; i += 1) {
        const dune = new THREE.Mesh(
          new THREE.SphereGeometry(0.55 + i * 0.05, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xffe4ab, roughness: 1 })
        );
        dune.scale.set(1.3, 0.36, 0.9);
        dune.position.set(config.pos.x - 1.1 + i * 0.55, config.pos.y - 0.5 + (i % 2) * 0.2, 0.45);
        world.add(dune);
      }
    }

    if (config.deco === "tower") {
      const tower = createTower();
      tower.position.set(config.pos.x + 1.1, config.pos.y + 0.2, 0.6);
      world.add(tower);
      const bridge = createBridge(1.9);
      bridge.position.set(config.pos.x - 2.15, config.pos.y - 0.55, 0.5);
      bridge.rotation.z = 0.25;
      world.add(bridge);
    }

    if (config.deco === "castle") {
      const castle = createCastle();
      castle.position.set(config.pos.x + 1.55, config.pos.y + 1.55, 1.1);
      world.add(castle);
      animatedObjects.push(castle);
    }
  });

  const markers = LEVEL_POSITIONS.map((level, index) => {
    const marker = createLevelMarker(
      mapPercentToScene(level),
      level.boss ? 0xff6f63 : 0xffeb99,
      level.boss
    );
    world.add(marker);
    marker.userData.index = index + 1;
    return marker;
  });

  const stars = new THREE.Group();
  for (let i = 0; i < 80; i += 1) {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(Math.random() * 0.05 + 0.02, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: Math.random() * 0.8 + 0.2 })
    );
    star.position.set((Math.random() - 0.5) * 28, Math.random() * 12 - 2, -4 - Math.random() * 2);
    stars.add(star);
  }
  scene.add(stars);

  return { world, markers, stars, animatedObjects };
}

function createMapScene(mount) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x2f5dd0, 18, 34);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 9.5, 19);
  camera.lookAt(0, 0.5, 0);

  const ambient = new THREE.HemisphereLight(0xdff5ff, 0x1f3d8b, 1.55);
  const sun = new THREE.DirectionalLight(0xfff2bf, 1.45);
  sun.position.set(6, 16, 9);
  const rim = new THREE.DirectionalLight(0x6cc5ff, 0.7);
  rim.position.set(-8, 8, -6);
  scene.add(ambient, sun, rim);

  const objects = buildSceneObjects(scene);
  let selectedLevel = 1;
  let unlockedLevel = 1;
  let rafId = 0;
  let pointerX = 0;
  let pointerY = 0;

  function resize() {
    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updateLevelMarkers() {
    objects.markers.forEach((marker) => {
      const isSelected = marker.userData.index === selectedLevel;
      const isUnlocked = marker.userData.index <= unlockedLevel;
      marker.userData.glow.material.opacity = isUnlocked ? (isSelected ? 1 : 0.68) : 0.28;
      marker.userData.glow.material.emissiveIntensity = isSelected ? 1.6 : isUnlocked ? 0.7 : 0.16;
      const scale = isSelected ? 1.28 : 1;
      marker.scale.setScalar(scale);
    });
  }

  function animate(now) {
    const time = now * 0.001;
    objects.world.rotation.z = Math.sin(time * 0.08) * 0.015;
    objects.world.position.y = Math.sin(time * 0.4) * 0.18;
    objects.stars.children.forEach((star, index) => {
      star.material.opacity = 0.35 + Math.sin(time * 1.2 + index) * 0.22;
    });
    objects.animatedObjects.forEach((object, index) => {
      object.rotation.y += 0.004 + index * 0.0005;
      if (object.userData.blades) {
        object.userData.blades.forEach((blade, bladeIndex) => {
          blade.rotation.z += 0.08 + bladeIndex * 0.01;
        });
      }
    });

    camera.position.x += ((pointerX * 1.6) - camera.position.x) * 0.018;
    camera.position.y += ((9.5 + pointerY * 0.7) - camera.position.y) * 0.018;
    camera.lookAt(pointerX * 1.1, pointerY * 0.6, 0);

    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(animate);
  }

  function onPointerMove(event) {
    const rect = mount.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = (0.5 - (event.clientY - rect.top) / rect.height) * 2;
  }

  resize();
  updateLevelMarkers();
  mount.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", resize);
  rafId = window.requestAnimationFrame(animate);

  return {
    setSelectedLevel(level) {
      selectedLevel = level;
      updateLevelMarkers();
    },
    setUnlockedLevel(level) {
      unlockedLevel = level;
      updateLevelMarkers();
    },
    resize,
    destroy() {
      mount.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
      renderer.dispose();
      mount.innerHTML = "";
    }
  };
}

if (typeof window !== "undefined") {
  window.MultiplicationSprintMapScene = {
    createMapScene
  };
}
