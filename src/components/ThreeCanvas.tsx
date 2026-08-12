import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetId, ViewMode } from '../types';
import {
  createSaturnTexture,
  createSaturnRingTexture,
  createMercuryTexture,
  createMoonTexture,
  createJupiterTexture,
} from '../utils/textureGenerator';

interface ThreeCanvasProps {
  selectedPlanet: PlanetId | null;
  onSelectPlanet: (id: PlanetId) => void;
  viewMode: ViewMode;
  sculptMercuryPoints?: number; // extra clay/wireframe points added interactively
}

export const PLANET_POSITIONS: Record<PlanetId, [number, number, number]> = {
  saturn: [-14, 2, -2],
  mercury: [-5, -3, 6],
  moon: [5, 3, 5],
  jupiter: [15, -1, -6],
};

export const PLANET_RADII: Record<PlanetId, number> = {
  saturn: 2.8,
  mercury: 1.6,
  moon: 1.8,
  jupiter: 3.8,
};

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  selectedPlanet,
  onSelectPlanet,
  viewMode,
  sculptMercuryPoints = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetId | null>(null);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetsRef = useRef<Record<string, THREE.Mesh>>({});
  const ringsRef = useRef<THREE.Mesh | null>(null);
  const mercuryConstructionGroupRef = useRef<THREE.Group | null>(null);
  const mercuryExtraMeshRef = useRef<THREE.Mesh | null>(null);
  const orbitGroupRef = useRef<THREE.Group | null>(null);

  // Animation & Camera control state
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 24));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Pointer drag controls
  const isDragging = useRef<boolean>(false);
  const previousMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitRotation = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x010103, 0.015);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 25);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdde5ff, 0.45);
    scene.add(ambientLight);

    // Main Sunlight (realistic directional light)
    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.8);
    sunLight.position.set(20, 20, 25);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Soft rim backlight for space depth
    const backLight = new THREE.DirectionalLight(0x406090, 0.6);
    backLight.position.set(-20, -10, -20);
    scene.add(backLight);

    // 5. Deep Space Background Stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 350;
      starPositions[i + 1] = (Math.random() - 0.5) * 350;
      starPositions[i + 2] = (Math.random() - 0.5) * 350;

      // Realistic subtle star colors (white, soft blue, pale yellow)
      const colorType = Math.random();
      if (colorType > 0.8) {
        starColors[i] = 0.8; starColors[i + 1] = 0.9; starColors[i + 2] = 1.0;
      } else if (colorType > 0.6) {
        starColors[i] = 1.0; starColors[i + 1] = 0.95; starColors[i + 2] = 0.8;
      } else {
        starColors[i] = 0.95; starColors[i + 1] = 0.95; starColors[i + 2] = 0.95;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Orbit group for user rotation
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    orbitGroupRef.current = orbitGroup;

    // Generate Textures
    const saturnTex = createSaturnTexture();
    const saturnRingTex = createSaturnRingTexture();
    const mercuryTex = createMercuryTexture();
    const moonTex = createMoonTexture();
    const jupiterTex = createJupiterTexture();

    // --- 🪐 SATURN ---
    const saturnGeo = new THREE.SphereGeometry(PLANET_RADII.saturn, 64, 64);
    const saturnMat = new THREE.MeshStandardMaterial({
      map: saturnTex,
      roughness: 0.8,
      metalness: 0.1,
    });
    const saturnMesh = new THREE.Mesh(saturnGeo, saturnMat);
    saturnMesh.position.set(...PLANET_POSITIONS.saturn);
    saturnMesh.rotation.z = THREE.MathUtils.degToRad(26.7); // Saturn axial tilt
    saturnMesh.userData = { id: 'saturn' };
    orbitGroup.add(saturnMesh);
    planetsRef.current.saturn = saturnMesh;

    // Saturn Rings
    const ringGeo = new THREE.RingGeometry(3.6, 6.2, 128);
    // Align UV coordinates radially for ring texture
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const radius = Math.sqrt(x * x + y * y);
      const normalizedR = (radius - 3.6) / (6.2 - 3.6);
      uv.setXY(i, normalizedR, 0.5);
    }

    const ringMat = new THREE.MeshStandardMaterial({
      map: saturnRingTex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      roughness: 0.5,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    saturnMesh.add(ringMesh);
    ringsRef.current = ringMesh;

    // --- ☿ MERCURY (Unfinished / Under Construction) ---
    const mercuryGeo = new THREE.SphereGeometry(PLANET_RADII.mercury, 48, 48);
    const mercuryMat = new THREE.MeshStandardMaterial({
      map: mercuryTex,
      roughness: 0.9,
      metalness: 0.2,
    });
    const mercuryMesh = new THREE.Mesh(mercuryGeo, mercuryMat);
    mercuryMesh.position.set(...PLANET_POSITIONS.mercury);
    mercuryMesh.userData = { id: 'mercury' };
    orbitGroup.add(mercuryMesh);
    planetsRef.current.mercury = mercuryMesh;

    // Mercury Construction Details (Scaffoldings, Strap, Wireframe mesh attachments)
    const mercuryConstructionGroup = new THREE.Group();
    mercuryMesh.add(mercuryConstructionGroup);
    mercuryConstructionGroupRef.current = mercuryConstructionGroup;

    // 1) Construction strap around planet
    const strapGeo = new THREE.TorusGeometry(PLANET_RADII.mercury + 0.08, 0.04, 16, 64);
    const strapMat = new THREE.MeshStandardMaterial({
      color: 0xd9822b, // warm amber construction strap
      roughness: 0.4,
      metalness: 0.6,
    });
    const strapMesh = new THREE.Mesh(strapGeo, strapMat);
    strapMesh.rotation.x = Math.PI / 3;
    strapMesh.rotation.y = Math.PI / 6;
    mercuryConstructionGroup.add(strapMesh);

    // 2) Outer wireframe scaffolding arc
    const scaffoldGeo = new THREE.IcosahedronGeometry(PLANET_RADII.mercury + 0.25, 2);
    const scaffoldMat = new THREE.MeshBasicMaterial({
      color: 0xe0a855,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const scaffoldMesh = new THREE.Mesh(scaffoldGeo, scaffoldMat);
    mercuryConstructionGroup.add(scaffoldMesh);

    // 3) Unfinished sculptural support beams
    const beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 });
    for (let b = 0; b < 5; b++) {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      const angle = (b / 5) * Math.PI * 2;
      beam.position.set(
        Math.cos(angle) * (PLANET_RADII.mercury + 0.2),
        Math.sin(angle) * 0.4,
        Math.sin(angle) * (PLANET_RADII.mercury + 0.2)
      );
      beam.rotation.z = Math.PI / 4;
      mercuryConstructionGroup.add(beam);
    }

    // 4) Small floating sculpture wireframe polygons / clay chunks
    const chunkGeo = new THREE.DodecahedronGeometry(0.2, 0);
    const chunkMat = new THREE.MeshStandardMaterial({ color: 0x998b7c, roughness: 0.9 });
    for (let c = 0; c < 4; c++) {
      const chunk = new THREE.Mesh(chunkGeo, chunkMat);
      const ca = (c / 4) * Math.PI * 2 + 0.5;
      chunk.position.set(
        Math.cos(ca) * (PLANET_RADII.mercury + 0.6),
        (c - 2) * 0.3,
        Math.sin(ca) * (PLANET_RADII.mercury + 0.6)
      );
      mercuryConstructionGroup.add(chunk);
    }

    // --- 🌕 MOON ---
    const moonGeo = new THREE.SphereGeometry(PLANET_RADII.moon, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.95,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(...PLANET_POSITIONS.moon);
    moonMesh.userData = { id: 'moon' };
    orbitGroup.add(moonMesh);
    planetsRef.current.moon = moonMesh;

    // --- 🟠 JUPITER ---
    const jupiterGeo = new THREE.SphereGeometry(PLANET_RADII.jupiter, 64, 64);
    const jupiterMat = new THREE.MeshStandardMaterial({
      map: jupiterTex,
      roughness: 0.7,
      metalness: 0.1,
    });
    const jupiterMesh = new THREE.Mesh(jupiterGeo, jupiterMat);
    jupiterMesh.position.set(...PLANET_POSITIONS.jupiter);
    jupiterMesh.userData = { id: 'jupiter' };
    orbitGroup.add(jupiterMesh);
    planetsRef.current.jupiter = jupiterMesh;

    // 6. Raycaster & Pointer Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedPlanet = (event: MouseEvent): PlanetId | null => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        Object.values(planetsRef.current),
        false
      );

      if (intersects.length > 0) {
        return (intersects[0].object.userData.id as PlanetId) || null;
      }
      return null;
    };

    const handlePointerMove = (event: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = event.clientX - previousMouse.current.x;
        const deltaY = event.clientY - previousMouse.current.y;

        orbitRotation.current.y += deltaX * 0.003;
        orbitRotation.current.x += deltaY * 0.003;
        // Limit vertical pitch
        orbitRotation.current.x = Math.max(-0.6, Math.min(0.6, orbitRotation.current.x));

        previousMouse.current = { x: event.clientX, y: event.clientY };
      } else {
        const hit = getIntersectedPlanet(event);
        setHoveredPlanet(hit);
        container.style.cursor = hit ? 'pointer' : 'grab';
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      isDragging.current = true;
      previousMouse.current = { x: event.clientX, y: event.clientY };
      container.style.cursor = 'grabbing';
    };

    const handlePointerUp = (event: MouseEvent) => {
      const wasDragging =
        Math.abs(event.clientX - previousMouse.current.x) > 3 ||
        Math.abs(event.clientY - previousMouse.current.y) > 3;

      isDragging.current = false;
      container.style.cursor = 'grab';

      if (!wasDragging) {
        const hit = getIntersectedPlanet(event);
        if (hit) {
          onSelectPlanet(hit);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('mouseup', handlePointerUp);

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate Planets slowly around Y-axis
      if (planetsRef.current.saturn) planetsRef.current.saturn.rotation.y += 0.003;
      if (planetsRef.current.mercury) planetsRef.current.mercury.rotation.y += 0.005;
      if (planetsRef.current.moon) planetsRef.current.moon.rotation.y += 0.004;
      if (planetsRef.current.jupiter) planetsRef.current.jupiter.rotation.y += 0.002;

      // Animate Mercury construction group
      if (mercuryConstructionGroupRef.current) {
        mercuryConstructionGroupRef.current.rotation.y += 0.008;
        mercuryConstructionGroupRef.current.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;
      }

      // Smooth Orbit Group Rotation from dragging
      if (orbitGroupRef.current) {
        orbitGroupRef.current.rotation.y += (orbitRotation.current.y - orbitGroupRef.current.rotation.y) * 0.05;
        orbitGroupRef.current.rotation.x += (orbitRotation.current.x - orbitGroupRef.current.rotation.x) * 0.05;
      }

      // Camera Lerp interpolation based on selected planet
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.04);
        currentCamLook.current.lerp(targetCamLook.current, 0.04);
        cameraRef.current.lookAt(currentCamLook.current);
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update Camera Target based on selectedPlanet
  useEffect(() => {
    if (selectedPlanet) {
      const pos = PLANET_POSITIONS[selectedPlanet];
      const radius = PLANET_RADII[selectedPlanet];
      const distance = radius * 3.5 + 2.5;

      targetCamLook.current.set(pos[0], pos[1], pos[2]);
      targetCamPos.current.set(pos[0], pos[1] + radius * 0.4, pos[2] + distance);
    } else {
      // Overview mode
      targetCamLook.current.set(0, 0, 0);
      targetCamPos.current.set(0, 0, 24);
    }
  }, [selectedPlanet]);

  // Update View Mode Materials (Realistic, Sculpture / Clay, Wireframe)
  useEffect(() => {
    Object.entries(planetsRef.current).forEach(([id, obj]) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (viewMode === 'wireframe') {
        mat.wireframe = true;
      } else if (viewMode === 'sculpture') {
        mat.wireframe = false;
        // Clay render appearance
        mat.color = new THREE.Color(id === 'saturn' ? 0xd4a373 : id === 'mercury' ? 0xa8a29e : id === 'moon' ? 0xe5e5e5 : 0xca6702);
        mat.roughness = 0.95;
      } else {
        // Realistic mode
        mat.wireframe = false;
        mat.color = new THREE.Color(0xffffff);
        mat.roughness = id === 'jupiter' ? 0.7 : 0.85;
      }
    });
  }, [viewMode]);

  // Handle interactive sculpting extra points on Mercury
  useEffect(() => {
    if (sculptMercuryPoints > 0 && planetsRef.current.mercury && mercuryConstructionGroupRef.current) {
      // Add a new small wireframe clay patch on Mercury
      const patchGeo = new THREE.ConeGeometry(0.25, 0.4, 6);
      const patchMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
      const patch = new THREE.Mesh(patchGeo, patchMat);

      const angle = sculptMercuryPoints * 0.7;
      patch.position.set(
        Math.sin(angle) * (PLANET_RADII.mercury + 0.1),
        Math.cos(angle * 1.3) * 0.8,
        Math.cos(angle) * (PLANET_RADII.mercury + 0.1)
      );
      patch.rotation.z = Math.PI / 2;
      mercuryConstructionGroupRef.current.add(patch);
    }
  }, [sculptMercuryPoints]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#010103]">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Hover Planet Title Indicator in 3D viewport */}
      {hoveredPlanet && !selectedPlanet && (
        <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full text-[11px] tracking-[0.3em] text-white/80 font-mono shadow-2xl transition-all duration-300">
          CLICK TO EXPLORE • {hoveredPlanet.toUpperCase()}
        </div>
      )}
    </div>
  );
};
