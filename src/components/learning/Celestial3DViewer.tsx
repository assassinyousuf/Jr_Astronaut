// ============================================================
// NASA Jr_AstroCamp — Celestial 3D Interactive WebGL Viewer
// Real-time 3D planetary renderer for Prerequisite Space Dossier
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Play, Pause, Compass, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';

export interface Celestial3DViewerProps {
  moduleId: string; // 'earth-systems' | 'lunar-gateway' | 'mars-frontier' | 'deep-space-frontier'
  height?: number | string;
  onOpenFullscreenOrrery?: (targetPlanet: string) => void;
}

interface CelestialConfig {
  name: string;
  planetKey: string;
  texturePath: string;
  cloudsPath?: string;
  radius: number;
  tiltDeg: number;
  rotationSpeed: number;
  atmosphereColor?: number;
  atmosphereScale?: number;
  satelliteName: string;
  satelliteOrbitRadius: number;
  satelliteOrbitSpeed: number;
  satelliteColor: number;
  satelliteInclination: number;
  landmarks: { name: string; lat: number; lon: number; desc: string; color: string }[];
}

const CELESTIAL_CONFIGS: Record<string, CelestialConfig> = {
  'earth-systems': {
    name: 'PLANET EARTH (TERRA)',
    planetKey: 'earth',
    texturePath: '/assets/planets/2k_earth_daymap.jpg',
    cloudsPath: '/assets/planets/2k_earth_clouds.jpg',
    radius: 3.5,
    tiltDeg: 23.44,
    rotationSpeed: 0.0018,
    atmosphereColor: 0x38bdf8,
    atmosphereScale: 1.055,
    satelliteName: 'ISS (Low Earth Orbit · 408 km)',
    satelliteOrbitRadius: 4.8,
    satelliteOrbitSpeed: 0.015,
    satelliteColor: 0x38bdf8,
    satelliteInclination: 0.9,
    landmarks: [
      { name: 'Cape Canaveral (KSC LC-39A)', lat: 28.57, lon: -80.65, desc: 'NASA Artemis & Apollo Launch Center', color: '#22c55e' },
      { name: 'ISS Orbital Tracking Ground Track', lat: 0, lon: 0, desc: 'Thermosphere 7.8 km/s orbital trajectory', color: '#38bdf8' },
    ],
  },
  'lunar-gateway': {
    name: 'THE MOON (LUNA)',
    planetKey: 'moon',
    texturePath: '/assets/planets/2k_moon.jpg',
    radius: 3.5,
    tiltDeg: 1.54,
    rotationSpeed: 0.0008,
    satelliteName: 'Artemis Gateway (NRHO Halo Orbit)',
    satelliteOrbitRadius: 5.2,
    satelliteOrbitSpeed: 0.009,
    satelliteColor: 0xf59e0b,
    satelliteInclination: 1.4,
    landmarks: [
      { name: 'Apollo 11 Tranquility Base', lat: 0.67, lon: 23.47, desc: 'First human lunar landing (July 20, 1969)', color: '#fbbf24' },
      { name: 'Shackleton Crater (South Pole)', lat: -89.9, lon: 0.0, desc: 'Artemis Base Camp water-ice cryo-deposits', color: '#38bdf8' },
    ],
  },
  'mars-frontier': {
    name: 'PLANET MARS (ARES)',
    planetKey: 'mars',
    texturePath: '/assets/planets/2k_mars.jpg',
    radius: 3.5,
    tiltDeg: 25.19,
    rotationSpeed: 0.0017,
    atmosphereColor: 0xf97316,
    atmosphereScale: 1.035,
    satelliteName: 'Mars Reconnaissance Orbiter (MRO)',
    satelliteOrbitRadius: 4.9,
    satelliteOrbitSpeed: 0.012,
    satelliteColor: 0xef4444,
    satelliteInclination: 1.6,
    landmarks: [
      { name: 'Jezero Crater (Perseverance / MOXIE)', lat: 18.38, lon: 77.58, desc: 'Ancient river delta biosignature exploration', color: '#4ade80' },
      { name: 'Olympus Mons', lat: 18.65, lon: -133.8, desc: 'Largest volcano in the Solar System (22 km high)', color: '#fb923c' },
    ],
  },
  'deep-space-frontier': {
    name: 'JUPITER & DEEP SPACE GIANTS',
    planetKey: 'jupiter',
    texturePath: '/assets/planets/2k_jupiter.jpg',
    radius: 3.5,
    tiltDeg: 3.13,
    rotationSpeed: 0.0042, // Fast rotation
    satelliteName: 'Europa Clipper / Juno Trajectory',
    satelliteOrbitRadius: 5.6,
    satelliteOrbitSpeed: 0.008,
    satelliteColor: 0xa855f7,
    satelliteInclination: 0.4,
    landmarks: [
      { name: 'Great Red Spot', lat: -22.0, lon: -165.0, desc: 'Centuries-old anticyclonic storm larger than Earth', color: '#ef4444' },
      { name: 'Europa Subsurface Ocean Moon', lat: 0, lon: 90, desc: 'Global saltwater ocean beneath 20km ice crust', color: '#06b6d4' },
    ],
  },
};

export const Celestial3DViewer: React.FC<Celestial3DViewerProps> = ({
  moduleId,
  height = 360,
  onOpenFullscreenOrrery,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const config = CELESTIAL_CONFIGS[moduleId] || CELESTIAL_CONFIGS['earth-systems'];

  const [isRotating, setIsRotating] = useState<boolean>(true);
  const isRotatingRef = useRef<boolean>(true);
  isRotatingRef.current = isRotating;

  const [activeLandmark, setActiveLandmark] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || 400;
    const computedHeight = typeof height === 'number' ? height : (container.clientHeight || 360);

    // ── SCENE & CAMERA ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / computedHeight, 0.1, 100);
    camera.position.set(0, 2.5, 9.5);

    // ── RENDERER ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, computedHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    // ── CONTROLS ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5.2;
    controls.maxDistance = 15;
    controls.enablePan = false;

    // ── LIGHTING ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Directional Sun Light mimicking realistic solar illumination
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(12, 6, 10);
    scene.add(sunLight);

    const backRimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    backRimLight.position.set(-10, -4, -10);
    scene.add(backRimLight);

    // ── BACKGROUND STARFIELD ──
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 25 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPos[i] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.75 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // ── PLANET GROUP (WITH AXIAL TILT) ──
    const planetGroup = new THREE.Group();
    planetGroup.rotation.z = THREE.MathUtils.degToRad(-config.tiltDeg);
    scene.add(planetGroup);

    // Texture Loader
    const texLoader = new THREE.TextureLoader();

    // Planet Surface Mesh
    const sphereGeo = new THREE.SphereGeometry(config.radius, 64, 64);
    const planetTex = texLoader.load(config.texturePath);
    planetTex.colorSpace = THREE.SRGBColorSpace;
    planetTex.anisotropy = 4;

    const sphereMat = new THREE.MeshStandardMaterial({
      map: planetTex,
      roughness: config.planetKey === 'earth' ? 0.45 : 0.85,
      metalness: config.planetKey === 'earth' ? 0.15 : 0.05,
    });
    const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
    planetGroup.add(planetMesh);

    // Clouds Sphere (Earth Only)
    let cloudsMesh: THREE.Mesh | null = null;
    if (config.cloudsPath) {
      const cloudsTex = texLoader.load(config.cloudsPath);
      cloudsTex.colorSpace = THREE.SRGBColorSpace;
      const cloudsGeo = new THREE.SphereGeometry(config.radius * 1.015, 48, 48);
      const cloudsMat = new THREE.MeshStandardMaterial({
        map: cloudsTex,
        transparent: true,
        opacity: 0.52,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
      planetGroup.add(cloudsMesh);
    }

    // Atmosphere Fresnel Glow Shell
    if (config.atmosphereColor) {
      const atmoGeo = new THREE.SphereGeometry(config.radius * (config.atmosphereScale || 1.05), 36, 36);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: config.atmosphereColor,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      planetGroup.add(atmoMesh);
    }

    // ── LANDMARK SURFACE PINS ──
    const landmarkMeshes: THREE.Group[] = [];
    config.landmarks.forEach((lm) => {
      const pinGroup = new THREE.Group();
      const phi = (90 - lm.lat) * (Math.PI / 180);
      const theta = (lm.lon + 180) * (Math.PI / 180);
      const px = -(config.radius * 1.01) * Math.sin(phi) * Math.cos(theta);
      const py = (config.radius * 1.01) * Math.cos(phi);
      const pz = (config.radius * 1.01) * Math.sin(phi) * Math.sin(theta);
      pinGroup.position.set(px, py, pz);

      // Glowing dot
      const dotGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: lm.color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      pinGroup.add(dot);

      // Radar pulse ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.18, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: lm.color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(px * 2, py * 2, pz * 2);
      pinGroup.add(ring);

      planetMesh.add(pinGroup);
      landmarkMeshes.push(pinGroup);
    });

    // ── SATELLITE & ORBIT RING ──
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.x = config.satelliteInclination;
    scene.add(orbitGroup);

    // Glowing Elliptical Trajectory Line
    const orbitCurve = new THREE.EllipseCurve(0, 0, config.satelliteOrbitRadius, config.satelliteOrbitRadius * 0.96, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(64);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y)));
    const orbitMat = new THREE.LineBasicMaterial({ color: config.satelliteColor, transparent: true, opacity: 0.35 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitGroup.add(orbitLine);

    // Spacecraft Body
    const satGroup = new THREE.Group();
    const satBodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 10);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.2 });
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
    satGroup.add(satBody);

    // Solar array wings
    for (const side of [-1, 1]) {
      const panelGeo = new THREE.BoxGeometry(0.55, 0.02, 0.22);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.x = side * 0.42;
      satGroup.add(panel);
    }

    // High gain dish / beacon
    const dishGeo = new THREE.ConeGeometry(0.12, 0.15, 12);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = Math.PI / 2;
    dish.position.z = 0.2;
    satGroup.add(dish);

    orbitGroup.add(satGroup);

    // ── ANIMATION LOOP ──
    let satAngle = 0;
    let clockTime = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clockTime += 0.016;

      controls.update();

      if (isRotatingRef.current) {
        planetMesh.rotation.y += config.rotationSpeed;
        if (cloudsMesh) {
          cloudsMesh.rotation.y += config.rotationSpeed * 1.35;
        }
      }

      // Animate satellite orbit
      satAngle += config.satelliteOrbitSpeed;
      const sx = Math.cos(satAngle) * config.satelliteOrbitRadius;
      const sz = Math.sin(satAngle) * (config.satelliteOrbitRadius * 0.96);
      satGroup.position.set(sx, 0, sz);
      satGroup.rotation.y = -satAngle;

      // Pulse landmark radar rings
      landmarkMeshes.forEach((pin, i) => {
        const ring = pin.children[1] as THREE.Mesh | undefined;
        if (ring) {
          const s = 1.0 + Math.sin(clockTime * 4 + i) * 0.35;
          ring.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // ── RESIZE HANDLER ──
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 400;
      const newH = typeof height === 'number' ? height : (container.clientHeight || 360);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [moduleId, config, height]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #0a1128 0%, #030611 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.3)',
        boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.8), 0 10px 30px -10px rgba(56, 189, 248, 0.25)',
      }}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* ── TOP BADGES OVERLAY ── */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(2, 6, 23, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: '10.5px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            LIVE 3D SIMULATION · {config.name}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
          <button
            onClick={() => {
              soundFx.playClick(700);
              setIsRotating(!isRotating);
            }}
            title={isRotating ? 'Pause Planetary Rotation' : 'Resume Planetary Rotation'}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              background: isRotating ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#f8fafc',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backdropFilter: 'blur(8px)',
            }}
          >
            {isRotating ? <Pause size={13} /> : <Play size={13} />}
            <span>{isRotating ? 'Pause' : 'Spin'}</span>
          </button>

          {onOpenFullscreenOrrery && (
            <button
              onClick={() => {
                soundFx.playReactorStart();
                onOpenFullscreenOrrery(config.planetKey);
              }}
              title="Launch Full 3D Space Explorer with Orbit Camera"
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: '1px solid #38bdf8',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
              }}
            >
              <Maximize2 size={13} />
              <span>Full 3D Orrery ➔</span>
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM TELEMETRY BAR OVERLAY ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          right: '14px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(2, 6, 23, 0.82)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11px',
          color: '#cbd5e1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} color="#38bdf8" />
          <span>
            <strong>Active Satellite: </strong>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{config.satelliteName}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono, monospace)', fontSize: '10.5px' }}>
          <span>AXIAL TILT: <strong style={{ color: '#f59e0b' }}>{config.tiltDeg}°</strong></span>
          <span>ORBITAL SPEED: <strong style={{ color: '#4ade80' }}>27,600 km/h</strong></span>
          <span style={{ color: '#94a3b8' }}>Drag to rotate · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};

export default Celestial3DViewer;
