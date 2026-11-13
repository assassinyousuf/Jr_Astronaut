// ============================================================
// LandingPage.tsx — NASA Eyes on the Solar System (eyes.nasa.gov)
// Exact Fullscreen 3D Solar System Orrery, Real-time JPL Ephemeris,
// Spacecraft Fleet Tracker & Jr_AstroCamp Aerospace Command Hub
// Built for NASA Space Apps Challenge 2026
// ============================================================

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import '../nasa-eyes.css';
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  RotateCcw,
  Maximize2,
  Minimize2,
  Compass,
  Search,
  Volume2,
  VolumeX,
  Music,
  Globe,
  Satellite,
  Sun,
  Layers,
  Sparkles,
  Info,
  Clock,
  Zap,
  CheckCircle2,
  Rocket,
  Gamepad2,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Activity,
  Flame,
  X,
  ChevronRight,
  ExternalLink,
  Crosshair,
  Shield,
  Eye,
  Sliders,
  Menu,
  Radio,
  HelpCircle,
  Check,
} from 'lucide-react';
import { NasaLiveObservatoryModal } from './NasaLiveObservatoryModal';
import { NASA_EARTH_VITAL_SIGNS, type EarthVitalSign } from '../services/nasaApiService';
import { soundFx } from '../utils/audioEffects';
import { speechEngine } from '../utils/speechEngine';
import { spaceMusicEngine } from '../utils/spaceMusicEngine';
import { authService } from '../utils/authService';
import { studentActivityService } from '../utils/studentActivityService';
import { ASTRONAUT_CHARACTERS } from '../data/astronautCharacters';
import { ALL_76_NASA_MISSIONS, type PlayableNasaMission } from '../data/allNasaMissions';
import { getCadetProgression } from '../utils/simulationEngine';
import { getRankProgress } from '../data/astronautRanks';
import type { User } from '../types/auth';
import type { DifficultyMode } from '../types/game';
import { DestinationSelectionModal } from './DestinationSelectionModal';

type LearningHubTab = 'OR_GRAPH' | 'NOTEBOOK' | 'AUDIO' | 'VIDEO' | 'COMIC' | 'BRIEFINGS' | 'CATALOG';

export interface LandingPageProps {
  onEnter: () => void;
  onStartMission?: () => void;
  onContinueMission?: () => void;
  onBuildOutpost?: (dest: 'MOON' | 'MARS', difficulty?: DifficultyMode) => void;
  hasSavedGame?: boolean;
  savedGameSol?: number;
  savedGameDest?: string;
  onOpenAcademy?: () => void;
  onOpenRover?: () => void;
  onOpenHowToPlay?: () => void;
  onOpenSettings?: () => void;
  onOpenScienceHub?: () => void;
  onOpenCredits?: () => void;
  onOpenComics?: () => void;
  onOpenLearningHub?: (tab: LearningHubTab) => void;
  onOpenDepot?: () => void;
  onOpenClassroom?: () => void;
  currentUser?: User | null;
  onUserUpdate?: (updatedUser: User) => void;
  onOpenAuth?: () => void;
  onOpenJudgePreview?: () => void;
  onOpenTelemetry?: () => void;
  onOpenCertificate?: () => void;
  isJudgeMode?: boolean;
  onOpenOrrery?: () => void;
  onOpenMarsEDL?: () => void;
  onOpenTeacherGradebook?: () => void;
  onOpenCharacterLocker?: () => void;
  onOpenLiveActivity?: () => void;
  onOpenMultiplayerLobby?: () => void;
  onOpenMoonbaseAlpha?: () => void;
  onOpenBlackHole?: () => void;
  onOpenExpedition?: () => void;
  onOpenCampaign?: () => void;
  onOpenSpaceGamesHub?: () => void;
  mode?: 'background' | 'explore';
  initialTarget?: string;
}

// ── CELESTIAL DATA TYPES ──────────────────────────────────────────────────
export interface PlanetData {
  id: string;
  name: string;
  color: number;
  emissive: number;
  radius: number;
  orbitRadius: number;
  distanceAU: string;
  actualAU: number;
  diameterKm: string;
  gravityMs2: string;
  surfaceTemp: string;
  atmosphere: string;
  moons: number;
  funFact: string;
  hasRings?: boolean;
  zone: string;
  orbitalPeriod: string;
  dayLength: string;
  discoveredBy: string;
  emoji: string;
  massKg: string;
  axialTilt: string;
  orbitalVelocityKms: string;
  interiorLayers: { name: string; depth: string; desc: string }[];
  atmosphereGases: { name: string; pct: number; color: string }[];
  whatItDoesForEarth?: string;
  earthdataUrl?: string;
  spacePlaceUrl?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface SpaceStationData {
  id: string;
  name: string;
  agency: string;
  type: string;
  parentBody: 'earth' | 'moon';
  altitudeKm: number;
  velocityKms: number;
  crewCount: number;
  crewManifest: string;
  launchYear: number;
  status: 'Operational' | 'Active Transit' | 'Planned Construction' | 'Primary Mission' | 'Extended Mission';
  color: string;
  description: string;
  specs: { label: string; value: string }[];
  whatItDoesForEarth?: string;
  nasaInstruments?: { name: string; acronym: string; purpose: string }[];
  earthdataProducts?: string[];
  earthdataUrl?: string;
  spacePlaceUrl?: string;
  orbitCategory?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface SolarMissionData {
  id: string;
  name: string;
  agency: string;
  type: string;
  trajectoryType: 'eccentric-solar' | 'lagrange-l1' | 'lagrange-l2' | 'interstellar' | 'mars-surface' | 'lunar-orbit';
  distanceFromSunAU: number;
  currentSpeedKms: number;
  lightDelayStr: string;
  color: string;
  missionObjective: string;
  keyAchievement: string;
  instruments: string[];
  whatItDoesForEarth?: string;
  earthdataUrl?: string;
  spacePlaceUrl?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// ── PLANETARY DATA ROSTER (With Interior Structure & Atmosphere breakdown) ──
export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: 0xc4cbd4,
    emissive: 0x64748b,
    radius: 2.2,
    orbitRadius: 20,
    distanceAU: '0.387 AU (57.9M km)',
    actualAU: 0.387,
    diameterKm: '4,879 km',
    gravityMs2: '3.7 m/s²',
    surfaceTemp: '-180°C to 430°C',
    atmosphere: 'Ultra-thin exosphere (Oxygen, Sodium, Hydrogen, Helium)',
    moons: 0,
    funFact: 'A year on Mercury is just 88 Earth days, but one solar day takes 176 Earth days! Its metallic core occupies 85% of its radius.',
    zone: 'Inner Rocky Planets',
    orbitalPeriod: '87.97 Earth Days',
    dayLength: '58.65 Earth Days',
    discoveredBy: 'Known since antiquity (Telescope: Galileo, 1631)',
    emoji: '☿️',
    massKg: '3.30 × 10²³ kg (0.055 Earths)',
    axialTilt: '0.034° (Nearly vertical)',
    orbitalVelocityKms: '47.4 km/s',
    interiorLayers: [
      { name: 'Solid Silicate Crust', depth: '35 km', desc: 'Thick basaltic silicate crust scarred by impact craters and lobate scarps.' },
      { name: 'Silicate Mantle', depth: '600 km', desc: 'Relatively thin silicate mantle surrounding colossal iron core.' },
      { name: 'Molten / Solid Iron Core', depth: '1,800 km', desc: 'Huge iron-nickel core driving an unexpected global magnetic field.' },
    ],
    atmosphereGases: [
      { name: 'Oxygen', pct: 42, color: '#38bdf8' },
      { name: 'Sodium', pct: 29, color: '#f59e0b' },
      { name: 'Hydrogen', pct: 22, color: '#a855f7' },
      { name: 'Helium', pct: 6, color: '#10b981' },
      { name: 'Potassium', pct: 1, color: '#f43f5e' },
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    color: 0xf59e0b,
    emissive: 0xd97706,
    radius: 2.8,
    orbitRadius: 30,
    distanceAU: '0.723 AU (108.2M km)',
    actualAU: 0.723,
    diameterKm: '12,104 km',
    gravityMs2: '8.87 m/s²',
    surfaceTemp: '465°C (Hottest in Solar System)',
    atmosphere: '96.5% Carbon Dioxide, Sulfuric Acid clouds, 92 bar surface pressure',
    moons: 0,
    funFact: 'Venus rotates in retrograde (clockwise) and so slowly that a day is longer than its year! Surface pressure equals 900m underwater on Earth.',
    zone: 'Inner Rocky Planets',
    orbitalPeriod: '224.7 Earth Days',
    dayLength: '243 Earth Days (Retrograde)',
    discoveredBy: 'Known since antiquity (Phases observed by Galileo, 1610)',
    emoji: '♀️',
    massKg: '4.87 × 10²⁴ kg (0.815 Earths)',
    axialTilt: '177.3° (Upside-down)',
    orbitalVelocityKms: '35.0 km/s',
    interiorLayers: [
      { name: 'Silicate Crust', depth: '50 km', desc: 'Basaltic crust dominated by volcanic plains and tessera terrain.' },
      { name: 'Rock Mantle', depth: '3,000 km', desc: 'Convecting silicate mantle; undergoes periodic global resurfacing events.' },
      { name: 'Iron-Nickel Core', depth: '3,000 km', desc: 'Partially molten metallic core without an active dynamo magnetic shield.' },
    ],
    atmosphereGases: [
      { name: 'Carbon Dioxide (CO₂)', pct: 96.5, color: '#ef4444' },
      { name: 'Nitrogen (N₂)', pct: 3.5, color: '#3b82f6' },
      { name: 'Sulfuric Acid / SO₂', pct: 0.1, color: '#eab308' },
    ],
  },
  {
    id: 'earth',
    name: 'Earth',
    color: 0x38bdf8,
    emissive: 0x0284c7,
    radius: 3.0,
    orbitRadius: 42,
    distanceAU: '1.000 AU (149.6M km)',
    actualAU: 1.000,
    diameterKm: '12,742 km',
    gravityMs2: '9.81 m/s²',
    surfaceTemp: '15°C Average (-89°C to 56.7°C)',
    atmosphere: '78.08% N₂, 20.95% O₂, 0.93% Ar, 0.04% CO₂ (Water vapor clouds)',
    moons: 1,
    funFact: 'The Goldilocks sanctuary of life. Possesses active plate tectonics, strong geodynamo magnetic shield, and 71% surface liquid oceans.',
    zone: 'Inner Rocky Planets (Habitable Zone)',
    orbitalPeriod: '365.25 Days',
    dayLength: '23 Hours 56 Minutes 4.1 Seconds',
    discoveredBy: 'Home Planet — Humanity',
    emoji: '🌍',
    massKg: '5.97 × 10²⁴ kg',
    axialTilt: '23.44° (Drives Seasons)',
    orbitalVelocityKms: '29.78 km/s',
    interiorLayers: [
      { name: 'Continental & Oceanic Crust', depth: '5–70 km', desc: 'Tectonically active plates carrying life and liquid hydrosphere.' },
      { name: 'Silicate Mantle', depth: '2,900 km', desc: 'Solid rock that flows over millions of years driving continental drift.' },
      { name: 'Liquid Outer Core', depth: '2,200 km', desc: 'Churning liquid iron-nickel generating the geodynamo magnetosphere.' },
      { name: 'Solid Inner Core', depth: '1,220 km', desc: 'Crystalline iron-nickel sphere hotter than the surface of the Sun.' },
    ],
    atmosphereGases: [
      { name: 'Nitrogen (N₂)', pct: 78.08, color: '#3b82f6' },
      { name: 'Oxygen (O₂)', pct: 20.95, color: '#06b6d4' },
      { name: 'Argon (Ar)', pct: 0.93, color: '#8b5cf6' },
      { name: 'Carbon Dioxide & Vapor', pct: 0.04, color: '#10b981' },
    ],
    whatItDoesForEarth: 'The home cradle of all known life. Sustained by five interconnected spheres: biosphere, hydrosphere, cryosphere, atmosphere, and geosphere, continuously monitored by NASA’s Earth System Observatory fleet.',
    earthdataUrl: 'https://earthdata.nasa.gov/',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/menu/earth/',
    quiz: {
      question: 'Which atmospheric layer contains the ozone shield that protects Earth from harmful ultraviolet solar radiation?',
      options: ['Troposphere', 'Stratosphere', 'Thermosphere', 'Exosphere'],
      correctIndex: 1,
      explanation: 'The ozone layer is located in the Stratosphere (15 to 35 km altitude), absorbing 97–99% of the Sun’s medium-frequency ultraviolet light!',
    },
  },
  {
    id: 'moon',
    name: 'Moon',
    color: 0xc4cbd4,
    emissive: 0x475569,
    radius: 1.2,
    orbitRadius: 42,
    distanceAU: '1.000 AU (384,400 km from Earth)',
    actualAU: 1.000,
    diameterKm: '3,474 km',
    gravityMs2: '1.62 m/s² (0.166g)',
    surfaceTemp: '-130°C to 120°C (Polar traps <40 K)',
    atmosphere: 'Hard vacuum (<10⁻¹² Pa)',
    moons: 0,
    funFact: 'Target of the NASA Artemis Program! Shackleton Crater at the lunar South Pole features peaks of eternal light and cold traps containing water ice.',
    zone: 'Earth-Moon System (Artemis Base Camp Target)',
    orbitalPeriod: '27.3 Earth Days',
    dayLength: '29.5 Earth Days (708 Hours diurnal cycle)',
    discoveredBy: 'Humanity — Known since antiquity',
    emoji: '🌙',
    massKg: '7.34 × 10²² kg (0.0123 Earths)',
    axialTilt: '1.54°',
    orbitalVelocityKms: '1.02 km/s',
    interiorLayers: [
      { name: 'Regolith & Anorthosite Crust', depth: '50 km', desc: 'Thick highland anorthosite crust pulverized by billions of years of meteorite impacts.' },
      { name: 'Silicate Mantle', depth: '1,000 km', desc: 'Dense olivine-pyroxene mantle.' },
      { name: 'Metallic Iron Core', depth: '330 km', desc: 'Small partially molten iron-nickel core.' },
    ],
    atmosphereGases: [
      { name: 'Helium / Neon / Argon (Exosphere)', pct: 100, color: '#94a3b8' },
    ],
    whatItDoesForEarth: 'Earth’s celestial anchor. Gravitational pull stabilizes Earth’s 23.4° axial tilt, preventing catastrophic climate oscillations, and generates ocean tidal rhythms.',
    earthdataUrl: 'https://pds-geosciences.wustl.edu/missions/lro/',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/all-about-the-moon/en/',
    quiz: {
      question: 'Why are Permanently Shadowed Regions (PSRs) at the lunar South Pole vital for NASA Artemis missions?',
      options: ['They shield astronauts from all gravity', 'They trap volatile water ice that can be processed into oxygen and rocket propellant', 'They are warm year-round', 'They have thick breathable air'],
      correctIndex: 1,
      explanation: 'Deep crater floors at the lunar poles have not seen sunlight in billions of years and stay at -233°C (40 K), trapping precious water ice!',
    },
  },
  {
    id: 'mars',
    name: 'Mars',
    color: 0xf43f5e,
    emissive: 0xbe123c,
    radius: 2.4,
    orbitRadius: 56,
    distanceAU: '1.524 AU (227.9M km)',
    actualAU: 1.524,
    diameterKm: '6,779 km',
    gravityMs2: '3.72 m/s²',
    surfaceTemp: '-65°C Average (-140°C to 20°C)',
    atmosphere: '95.3% CO₂, 2.6% N₂, 1.9% Ar, 610 Pa surface pressure',
    moons: 2,
    funFact: 'Houses Olympus Mons (21 km tall, largest volcano) and Valles Marineris (4,000 km grand rift canyon). Target for NASA Artemis human exploration.',
    zone: 'Inner Rocky Planets',
    orbitalPeriod: '687 Earth Days (1.88 Earth Years)',
    dayLength: '24 Hours 37 Minutes 22 Seconds (1 Sol)',
    discoveredBy: 'Known since antiquity',
    emoji: '♂️',
    massKg: '6.42 × 10²³ kg (0.107 Earths)',
    axialTilt: '25.19°',
    orbitalVelocityKms: '24.07 km/s',
    interiorLayers: [
      { name: 'Basaltic Crust', depth: '50 km', desc: 'Rich in iron-oxide rust providing distinctive crimson hue.' },
      { name: 'Silicate Mantle', depth: '1,500 km', desc: 'Dormant mantle; ancient volcanic hotspots produced immense shield volcanoes.' },
      { name: 'Dense Iron-Sulfur Core', depth: '1,830 km', desc: 'Liquid iron core with sulfur; solidified dynamo shutdown allowed atmosphere loss.' },
    ],
    atmosphereGases: [
      { name: 'Carbon Dioxide (CO₂)', pct: 95.3, color: '#ef4444' },
      { name: 'Nitrogen (N₂)', pct: 2.6, color: '#3b82f6' },
      { name: 'Argon (Ar)', pct: 1.9, color: '#8b5cf6' },
      { name: 'Oxygen & Trace', pct: 0.2, color: '#06b6d4' },
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: 0xfbbf24,
    emissive: 0xb45309,
    radius: 4.8,
    orbitRadius: 82,
    distanceAU: '5.204 AU (778.5M km)',
    actualAU: 5.204,
    diameterKm: '139,820 km',
    gravityMs2: '24.79 m/s²',
    surfaceTemp: '-110°C (Cloud deck)',
    atmosphere: '89.8% H₂, 10.2% He, ammonia cloud belts & lightning storm vortices',
    moons: 95,
    funFact: 'Has more mass than all other solar system planets combined (318 Earth masses). Great Red Spot storm has raged for >350 years.',
    zone: 'Gas Giants',
    orbitalPeriod: '11.86 Earth Years',
    dayLength: '9 Hours 55 Minutes 30 Seconds (Fastest spin)',
    discoveredBy: 'Known since antiquity (Galilean moons discovered 1610)',
    emoji: '♃',
    massKg: '1.90 × 10²⁷ kg (317.8 Earths)',
    axialTilt: '3.13°',
    orbitalVelocityKms: '13.07 km/s',
    interiorLayers: [
      { name: 'Gaseous Hydrogen/Helium Atmosphere', depth: '1,000 km', desc: 'Ammonia cloud decks, violent jet streams and Great Red Spot anticyclone.' },
      { name: 'Liquid Hydrogen Envelope', depth: '20,000 km', desc: 'Supercritical fluid state under thousands of atmospheres of pressure.' },
      { name: 'Metallic Liquid Hydrogen', depth: '40,000 km', desc: 'Electrically conductive liquid metal generating colossal magnetosphere.' },
      { name: 'Diffuse Heavy Element Core', depth: '10,000 km', desc: 'Dilute core of rock, metal, and ice fragments blended into metallic hydrogen.' },
    ],
    atmosphereGases: [
      { name: 'Hydrogen (H₂)', pct: 89.8, color: '#38bdf8' },
      { name: 'Helium (He)', pct: 10.2, color: '#a855f7' },
      { name: 'Methane & Ammonia', pct: 0.1, color: '#f59e0b' },
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: 0xfde047,
    emissive: 0xa16207,
    radius: 4.2,
    orbitRadius: 110,
    distanceAU: '9.582 AU (1.433B km)',
    actualAU: 9.582,
    diameterKm: '116,460 km',
    gravityMs2: '10.44 m/s²',
    surfaceTemp: '-140°C',
    atmosphere: '96.3% H₂, 3.25% He, methane, ammonia ice haze',
    moons: 146,
    funFact: 'Crown jewel of rings extending 282,000 km across but only ~10 meters thin! Saturn is so light (density 0.687 g/cm³) it would float in water.',
    hasRings: true,
    zone: 'Gas Giants',
    orbitalPeriod: '29.46 Earth Years',
    dayLength: '10 Hours 33 Minutes 38 Seconds',
    discoveredBy: 'Known since antiquity (Galileo 1610, Rings by Huygens 1655)',
    emoji: '♄',
    massKg: '5.68 × 10²⁶ kg (95.2 Earths)',
    axialTilt: '26.73°',
    orbitalVelocityKms: '9.68 km/s',
    interiorLayers: [
      { name: 'Hydrogen Cloud Envelope', depth: '1,000 km', desc: 'Hazy yellow ammonia clouds with polar hexagonal jet stream.' },
      { name: 'Liquid Metallic Hydrogen', depth: '30,000 km', desc: 'Helium rain precipitates downward through metallic hydrogen toward the core.' },
      { name: 'Rock & Ice Dense Core', depth: '15,000 km', desc: 'Dense rocky core equivalent to 9–22 Earth masses.' },
    ],
    atmosphereGases: [
      { name: 'Hydrogen (H₂)', pct: 96.3, color: '#38bdf8' },
      { name: 'Helium (He)', pct: 3.25, color: '#a855f7' },
      { name: 'Methane & Trace', pct: 0.45, color: '#eab308' },
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: 0x67e8f9,
    emissive: 0x0e7490,
    radius: 3.2,
    orbitRadius: 136,
    distanceAU: '19.20 AU (2.872B km)',
    actualAU: 19.20,
    diameterKm: '50,724 km',
    gravityMs2: '8.69 m/s²',
    surfaceTemp: '-195°C to -224°C (Coldest atmosphere)',
    atmosphere: '82.5% H₂, 15.2% He, 2.3% Methane (gives brilliant cyan hue)',
    moons: 28,
    funFact: 'Extreme 97.77° axial tilt — effectively rolls on its side along its orbit! One pole gets 42 continuous years of sunlight followed by 42 years of dark.',
    zone: 'Ice Giants',
    orbitalPeriod: '84.01 Earth Years',
    dayLength: '17 Hours 14 Minutes 24 Seconds (Retrograde)',
    discoveredBy: 'William Herschel (March 13, 1781)',
    emoji: '⛢',
    massKg: '8.68 × 10²⁵ kg (14.5 Earths)',
    axialTilt: '97.77° (Horizontal)',
    orbitalVelocityKms: '6.80 km/s',
    interiorLayers: [
      { name: 'Upper Methane-Ammonia Atmosphere', depth: '600 km', desc: 'Cyan haze absorbing red sunlight.' },
      { name: 'Superheated Water-Ammonia Mantle', depth: '10,000 km', desc: 'Dense, hot, high-pressure fluid slush of water, ammonia, and methane.' },
      { name: 'Silicate/Iron-Nickel Rocky Core', depth: '4,000 km', desc: 'Small core with mass roughly 0.55 Earths.' },
    ],
    atmosphereGases: [
      { name: 'Hydrogen (H₂)', pct: 82.5, color: '#38bdf8' },
      { name: 'Helium (He)', pct: 15.2, color: '#a855f7' },
      { name: 'Methane (CH₄)', pct: 2.3, color: '#06b6d4' },
    ],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: 0x3b82f6,
    emissive: 0x1d4ed8,
    radius: 3.1,
    orbitRadius: 162,
    distanceAU: '30.05 AU (4.495B km)',
    actualAU: 30.05,
    diameterKm: '49,244 km',
    gravityMs2: '11.15 m/s²',
    surfaceTemp: '-201°C',
    atmosphere: '80% H₂, 19% He, 1.5% Methane, supersonic jet streams >2,100 km/h',
    moons: 16,
    funFact: 'Most distant major planet. Discovered by mathematical prediction before ever being observed visually! Triton moon orbits backwards and erupts nitrogen geysers.',
    zone: 'Ice Giants',
    orbitalPeriod: '164.79 Earth Years',
    dayLength: '16 Hours 6 Minutes 36 Seconds',
    discoveredBy: 'Urbain Le Verrier & Johann Galle (September 23, 1846)',
    emoji: '♆',
    massKg: '1.02 × 10²⁶ kg (17.1 Earths)',
    axialTilt: '28.32°',
    orbitalVelocityKms: '5.43 km/s',
    interiorLayers: [
      { name: 'Upper Atmosphere & Cloud Belts', depth: '800 km', desc: 'Supersonic winds surpassing 2,100 km/h with cirrus methane cloud streaks.' },
      { name: 'Ionic Water-Ammonia Slush Ocean', depth: '12,000 km', desc: 'Superionic water exhibiting electrical conductivity; may form diamond hail.' },
      { name: 'Dense Iron-Silicate Core', depth: '5,000 km', desc: 'Rocky core with mass ~1.2 Earths.' },
    ],
    atmosphereGases: [
      { name: 'Hydrogen (H₂)', pct: 80.0, color: '#38bdf8' },
      { name: 'Helium (He)', pct: 19.0, color: '#a855f7' },
      { name: 'Methane (CH₄)', pct: 1.5, color: '#2563eb' },
    ],
  },
];

// ── SPACE STATIONS & EARTH SATELLITE FLEET ──────────────────────────────
export const SPACE_STATIONS: SpaceStationData[] = [
  {
    id: 'iss',
    name: 'International Space Station (ISS)',
    agency: 'NASA / ESA / JAXA / CSA / Roscosmos',
    type: 'Modular Habitation Space Station',
    parentBody: 'earth',
    altitudeKm: 418.5,
    velocityKms: 7.66,
    crewCount: 7,
    crewManifest: 'Expedition 72 Crew',
    launchYear: 1998,
    status: 'Operational',
    color: '#38bdf8',
    orbitCategory: 'LEO',
    description: 'Largest human-made laboratory in space. Continuous human occupation since Nov 2, 2000. Features 16 pressurized modules, Canadarm2, and 8 massive photovoltaic solar arrays.',
    specs: [
      { label: 'Altitude', value: '418.5 km (LEO)' },
      { label: 'Orbital Speed', value: '27,580 km/h (7.66 km/s)' },
      { label: 'Period', value: '92.68 minutes (~15.5 orbits/day)' },
      { label: 'Mass', value: '444,615 kg (970,000 lbs)' },
      { label: 'Solar Span', value: '109 meters (Full Football Field)' },
    ],
    whatItDoesForEarth: 'Serves as an orbital platform for Earth monitoring (ECOSTRESS thermal sensor for agricultural water stress and GEDI laser lidar mapping global forest biomass).',
    nasaInstruments: [
      { name: 'ECOsystem Spaceborne Thermal Radiometer Experiment', acronym: 'ECOSTRESS', purpose: 'Thermal infrared sensor measuring evapotranspiration and drought.' },
      { name: 'Global Ecosystem Dynamics Investigation', acronym: 'GEDI', purpose: 'Lidar system mapping 3D forest canopy structure and stored carbon.' },
    ],
    earthdataProducts: ['ECOSTRESS Evapotranspiration', 'GEDI L4A Aboveground Biomass', 'Lightning Imaging Sensor'],
    earthdataUrl: 'https://earthdata.nasa.gov/learn/pathfinders/wildfires',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/space-station/en/',
    quiz: {
      question: 'How fast does the ISS travel in Low Earth Orbit?',
      options: ['About 1,000 km/h', 'About 10,000 km/h', 'About 27,600 km/h (7.66 km/s)', 'Speed of light'],
      correctIndex: 2,
      explanation: 'At 27,600 km/h, the station circles the Earth every 92 minutes, allowing the crew to witness 16 sunrises and sunsets every 24 hours!',
    },
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope (HST)',
    agency: 'NASA / ESA',
    type: 'Great Observatory Satellite',
    parentBody: 'earth',
    altitudeKm: 535.0,
    velocityKms: 7.58,
    crewCount: 0,
    crewManifest: 'Autonomous Robotic Observatory',
    launchYear: 1990,
    status: 'Operational',
    color: '#06b6d4',
    orbitCategory: 'LEO',
    description: 'The revolutionary space observatory operating in Low Earth Orbit since April 1990. Has made over 1.6 million astronomical observations, resolving distant nebulae, galaxies, and exoplanet atmospheres.',
    specs: [
      { label: 'Altitude', value: '535 km' },
      { label: 'Primary Mirror', value: '2.4 meter (7.9 ft)' },
      { label: 'Speed', value: '27,200 km/h (7.58 km/s)' },
      { label: 'Observations Made', value: '> 1,600,000 Targets' },
    ],
    whatItDoesForEarth: 'Operating above Earth’s atmospheric distortion, Hubble verified the cosmic acceleration of the universe and helped determine the exact age of the universe (13.8 billion years).',
    nasaInstruments: [
      { name: 'Wide Field Camera 3', acronym: 'WFC3', purpose: 'Panchromatic imager covering UV, visible, and near-IR wavelengths.' },
      { name: 'Cosmic Origins Spectrograph', acronym: 'COS', purpose: 'Ultraviolet spectrograph analyzing chemical composition of cosmic structures.' },
    ],
    earthdataProducts: ['Hubble Legacy Archive (HLA)', 'MAST High-Level Science Products'],
    earthdataUrl: 'https://mast.stsci.edu/',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/hubble-explorer/en/',
    quiz: {
      question: 'Why did NASA place Hubble into space rather than building it on a mountain?',
      options: ['To escape Earth gravity', 'Because Earth’s atmosphere bends, distorts, and blocks ultraviolet light', 'It was cheaper to launch', 'To get closer to the stars'],
      correctIndex: 1,
      explanation: 'Earth’s atmosphere blurs optical light (causing stars to twinkle) and absorbs UV wavelengths. Operating in vacuum gives Hubble crystal-clear vision!',
    },
  },
  {
    id: 'landsat-9',
    name: 'Landsat 9 Earth Imager',
    agency: 'NASA Goddard / USGS',
    type: 'Earth Observation Satellite',
    parentBody: 'earth',
    altitudeKm: 705.0,
    velocityKms: 7.50,
    crewCount: 0,
    crewManifest: 'Autonomous Earth Imager',
    launchYear: 2021,
    status: 'Operational',
    color: '#10b981',
    orbitCategory: 'SSO',
    description: 'The newest sentinel of the 50-year NASA/USGS Landsat program. Scans every continent every 8 days across 11 spectral bands, tracking agriculture, deforestation, freshwater, and wildfires.',
    specs: [
      { label: 'Orbit', value: '705 km Sun-Synchronous Polar' },
      { label: 'Inclination', value: '98.2°' },
      { label: 'Repeat Cycle', value: '8 Days (With Landsat 8)' },
      { label: 'Radiometric Res', value: '14-bit (16,384 shades of light)' },
    ],
    whatItDoesForEarth: 'Helps farmers monitor crop health, firefighters map wildfire perimeters, and scientists monitor glacier retreat and lake water volume across the globe.',
    nasaInstruments: [
      { name: 'Operational Land Imager 2', acronym: 'OLI-2', purpose: 'Measures visible, near-IR, and shortwave IR radiation reflected from land.' },
      { name: 'Thermal Infrared Sensor 2', acronym: 'TIRS-2', purpose: 'Measures land surface temperature in two thermal infrared bands.' },
    ],
    earthdataProducts: ['Landsat Surface Reflectance Tier 1', 'Landsat Surface Temperature (LST)'],
    earthdataUrl: 'https://earthdata.nasa.gov/learn/pathfinders/agriculture-and-water-resources',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/menu/earth/',
    quiz: {
      question: 'Why does Landsat 9 fly in a Sun-Synchronous Polar Orbit?',
      options: ['To stay over the equator', 'To cross every latitude at the same local solar time (10:00 AM) for consistent lighting', 'To avoid space debris', 'To stay in Earth’s shadow'],
      correctIndex: 1,
      explanation: 'A Sun-Synchronous orbit keeps the Sun at the same angle beneath the satellite, guaranteeing identical shadow angles for comparing land changes across decades!',
    },
  },
  {
    id: 'pace',
    name: 'PACE (Plankton, Aerosol, Cloud, ocean Ecosystem)',
    agency: 'NASA Goddard Space Flight Center',
    type: 'Ocean & Atmosphere Climate Satellite',
    parentBody: 'earth',
    altitudeKm: 676.5,
    velocityKms: 7.52,
    crewCount: 0,
    crewManifest: 'Autonomous Climate Sentinel',
    launchYear: 2024,
    status: 'Operational',
    color: '#0ea5e9',
    orbitCategory: 'SSO',
    description: 'NASA’s latest flagship climate satellite, launched February 2024. Revolutionizes ocean biology by dissecting ocean color into hundreds of hyper-spectral colors to identify microscopic phytoplankton.',
    specs: [
      { label: 'Orbit', value: '676.5 km Sun-Synchronous' },
      { label: 'Inclination', value: '98.0°' },
      { label: 'Spectral Range', value: '350 nm – 2,260 nm (UV to SWIR)' },
      { label: 'Primary Mission', value: 'Ocean Ecology & Aerosol Radiative Forcing' },
    ],
    whatItDoesForEarth: 'Identifies toxic algae blooms (red tides) before they reach coastlines and determines how airborne dust and smoke aerosols cool or warm Earth’s climate.',
    nasaInstruments: [
      { name: 'Ocean Color Instrument', acronym: 'OCI', purpose: 'Hyperspectral scanning radiometer measuring ocean color pigment signatures.' },
      { name: 'Spectro-polarimeter for Planetary Exploration', acronym: 'SPEXone', purpose: 'Measures polarization of sunlight scattered by atmospheric aerosols.' },
    ],
    earthdataProducts: ['PACE Hyperspectral Radiance', 'Phytoplankton Carbon Biomass'],
    earthdataUrl: 'https://earthdata.nasa.gov/learn/articles/pace-launch-data',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/menu/earth/',
    quiz: {
      question: 'What percentage of Earth’s oxygen is generated by the microscopic ocean phytoplankton that NASA PACE tracks?',
      options: ['Less than 5%', 'About 20%', 'More than 50%', 'Exactly 100%'],
      correctIndex: 2,
      explanation: 'Microscopic plants in the oceans produce over half the oxygen we breathe and absorb billions of tons of carbon dioxide every year!',
    },
  },
  {
    id: 'swot',
    name: 'SWOT (Surface Water and Ocean Topography)',
    agency: 'NASA JPL / CNES / CSA / UKSA',
    type: 'Global Hydrology Radar Satellite',
    parentBody: 'earth',
    altitudeKm: 890.5,
    velocityKms: 7.40,
    crewCount: 0,
    crewManifest: 'Autonomous Radar Altimeter',
    launchYear: 2022,
    status: 'Operational',
    color: '#3b82f6',
    orbitCategory: 'LEO',
    description: 'First satellite to survey nearly all surface water on Earth. Equipped with a 10-meter radar mast boom that measures the height of rivers, lakes, and oceans with centimeter precision.',
    specs: [
      { label: 'Altitude', value: '890.5 km' },
      { label: 'Inclination', value: '77.6°' },
      { label: 'Swath Width', value: '120 km (Dual Radar Swaths)' },
      { label: 'Target Count', value: '> 6 Million Lakes & Rivers Worldwide' },
    ],
    whatItDoesForEarth: 'Measures how much freshwater is stored in rivers and lakes worldwide to predict floods and droughts, and maps ocean eddies that absorb 90% of global excess heat.',
    nasaInstruments: [
      { name: 'Ka-band Radar Interferometer', acronym: 'KaRIn', purpose: 'Twin antennas bouncing radar pulses off water surfaces to map elevations.' },
      { name: 'Poseidon-3C Altimeter', acronym: 'Poseidon', purpose: 'Nadir altimeter calibrating absolute sea surface height.' },
    ],
    earthdataProducts: ['SWOT River Single-Pass Vector Elevation', 'SWOT Lake Storage Dynamics'],
    earthdataUrl: 'https://podaac.jpl.nasa.gov/SWOT',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/menu/earth/',
    quiz: {
      question: 'How does SWOT measure the water height of 6 million lakes and rivers from 890 km in space?',
      options: ['With a giant tape measure', 'By bouncing Ka-band radar waves between twin antennas on a 10-meter boom', 'Using laser thermometers', 'By asking local boaters'],
      correctIndex: 1,
      explanation: 'KaRIn radar interferometry uses two antennas 10 meters apart to bounce microwave pulses off the water, measuring elevation down to centimeters!',
    },
  },
  {
    id: 'grace-fo',
    name: 'GRACE-FO (Gravity Recovery & Climate Experiment)',
    agency: 'NASA JPL / GFZ',
    type: 'Twin Gravity Mapping Satellites',
    parentBody: 'earth',
    altitudeKm: 490.0,
    velocityKms: 7.62,
    crewCount: 0,
    crewManifest: 'Tandem Gravimetric Pair',
    launchYear: 2018,
    status: 'Operational',
    color: '#8b5cf6',
    orbitCategory: 'LEO',
    description: 'Twin tandem satellites flying 220 km apart. Laser and microwave ranging between the two satellites detect sub-microscopic distance shifts caused by gravitational variations on Earth.',
    specs: [
      { label: 'Altitude', value: '490 km' },
      { label: 'Pair Separation', value: '~220 km Tandem Chase' },
      { label: 'Interferometer Precision', value: 'Nanometers (Width of a bacterium)' },
      { label: 'Primary Goal', value: 'Subterranean Groundwater & Polar Ice Mass' },
    ],
    whatItDoesForEarth: 'Weighs Earth’s water from space! Discovers when underground aquifers are drying up and measures exactly how many gigatons of ice melt from Greenland and Antarctica each year.',
    nasaInstruments: [
      { name: 'Laser Ranging Interferometer', acronym: 'LRI', purpose: 'Laser link measuring distance between twin satellites to nanometer accuracy.' },
      { name: 'SuperSTAR Accelerometer', acronym: 'ACC', purpose: 'Measures non-gravitational forces like atmospheric drag.' },
    ],
    earthdataProducts: ['GRACE-FO Tellus Water Storage Grids', 'Antarctica & Greenland Mass Balance'],
    earthdataUrl: 'https://gracefo.jpl.nasa.gov/',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/menu/earth/',
    quiz: {
      question: 'How do twin GRACE-FO satellites know if deep underground aquifers are losing water?',
      options: ['They dig orbital holes', 'Water has mass, so losing water weakens regional gravity and changes the distance between the two satellites', 'They use colored smoke', 'They measure air moisture'],
      correctIndex: 1,
      explanation: 'Water has mass! As groundwater is pumped out, regional gravitational attraction decreases, causing tiny shifts in distance between the twin satellites!',
    },
  },
  {
    id: 'goes-16',
    name: 'GOES-16 (Geostationary Weather Satellite)',
    agency: 'NOAA / NASA Goddard',
    type: 'Geostationary Environmental Satellite',
    parentBody: 'earth',
    altitudeKm: 35786.0,
    velocityKms: 3.07,
    crewCount: 0,
    crewManifest: 'Autonomous Geostationary Sentinel',
    launchYear: 2016,
    status: 'Operational',
    color: '#f59e0b',
    orbitCategory: 'GEO',
    description: 'The premier weather satellite hovering 35,786 km above the equator. Orbit matches Earth’s rotation speed exactly, providing continuous real-time 30-second storm imaging.',
    specs: [
      { label: 'Orbit', value: '35,786 km Geostationary (GEO)' },
      { label: 'Period', value: '23h 56m 4s (Exact Earth Rotation)' },
      { label: 'Scan Speed', value: 'Full Western Hemisphere Every 10 Minutes' },
      { label: 'Rapid Scan', value: '30-second rapid refresh on severe storms' },
    ],
    whatItDoesForEarth: 'Detects hurricane intensification, maps lightning strikes to warn airliners, tracks wildfire smoke plumes, and monitors solar flares heading toward Earth’s electrical grid.',
    nasaInstruments: [
      { name: 'Advanced Baseline Imager', acronym: 'ABI', purpose: '16 spectral bands viewing weather from visible to infrared.' },
      { name: 'Geostationary Lightning Mapper', acronym: 'GLM', purpose: 'Detects in-cloud and ground lightning flashes 24/7.' },
    ],
    earthdataProducts: ['GOES-East ABI Radiances', 'GLM Flash Density Grids'],
    earthdataUrl: 'https://www.goes-r.gov/',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/geo-orbits/en/',
    quiz: {
      question: 'Why does GOES-16 appear to hover over the exact same spot on Earth forever?',
      options: ['It is anchored to the ground', 'At 35,786 km altitude, its orbital speed matches Earth’s 24-hour spin rate exactly', 'It uses jet engines to stay in place', 'It is pulled by the Moon'],
      correctIndex: 1,
      explanation: 'In Geostationary Orbit (GEO), the satellite circles Earth once every 23h 56m, perfectly synchronized with Earth’s rotation!',
    },
  },
  {
    id: 'tiangong',
    name: 'Tiangong Space Station (CSS)',
    agency: 'CMSA (China Manned Space Agency)',
    type: 'Permanent Multi-Module Orbital Lab',
    parentBody: 'earth',
    altitudeKm: 389.2,
    velocityKms: 7.67,
    crewCount: 3,
    crewManifest: 'Shenzhou Mission Crew (3 Taikonauts)',
    launchYear: 2021,
    status: 'Operational',
    color: '#f59e0b',
    orbitCategory: 'LEO',
    description: 'T-shaped permanent multi-module space station consisting of Tianhe core module, Wentian laboratory, Mengtian science module, and flexible gallium arsenide solar wings.',
    specs: [
      { label: 'Altitude', value: '389.2 km (LEO)' },
      { label: 'Orbital Speed', value: '27,620 km/h (7.67 km/s)' },
      { label: 'Architecture', value: 'T-Shaped 3-Module Cluster' },
      { label: 'Core Module', value: 'Tianhe (16.6m length, 22.5 tonnes)' },
    ],
  },
  {
    id: 'lunar-gateway',
    name: 'Lunar Gateway (Artemis Hub)',
    agency: 'NASA / ESA / JAXA / CSA / MBRSC',
    type: 'Deep Space Cislunar Outpost',
    parentBody: 'moon',
    altitudeKm: 3000,
    velocityKms: 1.50,
    crewCount: 4,
    crewManifest: 'Artemis Astronaut Crew',
    launchYear: 2027,
    status: 'Planned Construction',
    color: '#a855f7',
    orbitCategory: 'NRHO',
    description: 'The international deep-space gateway orbiting the Moon in a Near-Rectilinear Halo Orbit (NRHO). Serves as a staging base for astronaut landings at the Lunar South Pole.',
    specs: [
      { label: 'Orbit Type', value: 'Near-Rectilinear Halo Orbit (NRHO)' },
      { label: 'Propulsion', value: 'PPE (50 kW Solar Electric Xenon Thruster)' },
      { label: 'Habitation', value: 'HALO (Habitation & Logistics Outpost)' },
      { label: 'Robotic System', value: 'Canadarm3 AI Autonomous Arm' },
    ],
    whatItDoesForEarth: 'Serves as humanity’s stepping stone beyond Low Earth Orbit, testing long-duration deep-space life-support systems needed for future human journeys to Mars.',
    spacePlaceUrl: 'https://spaceplace.nasa.gov/all-about-the-moon/en/',
    quiz: {
      question: 'What special orbit will the Lunar Gateway use around the Moon?',
      options: ['Low Lunar Orbit', 'Near-Rectilinear Halo Orbit (NRHO)', 'Geostationary Orbit', 'Retrograde Orbit'],
      correctIndex: 1,
      explanation: 'NRHO is an egg-shaped orbit balanced between Earth and Moon gravity, providing uninterrupted line-of-sight communication with Earth!',
    },
  },
];

// ── SOLAR PROBES & DEEP SPACE FLEET ───────────────────────────────────────
export const SOLAR_MISSIONS: SolarMissionData[] = [
  {
    id: 'parker-solar-probe',
    name: 'Parker Solar Probe (PSP)',
    agency: 'NASA Goddard / JHU-APL',
    type: 'Extreme Heliophysics Probe',
    trajectoryType: 'eccentric-solar',
    distanceFromSunAU: 0.082,
    currentSpeedKms: 176.0,
    lightDelayStr: '41 Seconds',
    color: '#f97316',
    missionObjective: 'Plunge directly through the superheated solar corona to solve why the corona is 300x hotter than the solar surface and trace the supersonic solar wind.',
    keyAchievement: 'First human spacecraft to fly through the Sun’s upper atmosphere (Alfvén critical surface) at over 692,000 km/h.',
    instruments: ['FIELDS (EM Waves)', 'WISPR (Coronal Imager)', 'SWEAP (Solar Wind)', 'ISʘIS (Particles)'],
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope (JWST)',
    agency: 'NASA / ESA / CSA',
    type: 'Flagship Infrared Observatory',
    trajectoryType: 'lagrange-l2',
    distanceFromSunAU: 1.01,
    currentSpeedKms: 0.2,
    lightDelayStr: '5.0 Seconds',
    color: '#eab308',
    missionObjective: 'Unveil the cosmic dawn by observing the first galaxies formed after the Big Bang, study planetary formation, and analyze exoplanet atmospheres.',
    keyAchievement: 'Successfully unfolded 6.5m gold beryllium mirror and 5-layer tennis-court-sized sunshield at Sun-Earth L2 (1.5M km from Earth).',
    instruments: ['NIRCam', 'NIRSpec', 'MIRI', 'FGS/NIRISS'],
  },
  {
    id: 'perseverance',
    name: 'Perseverance Rover & Ingenuity',
    agency: 'NASA JPL',
    type: 'Mars Surface Astrobiology',
    trajectoryType: 'mars-surface',
    distanceFromSunAU: 1.524,
    currentSpeedKms: 24.1,
    lightDelayStr: '12 Minutes 35 Seconds',
    color: '#f43f5e',
    missionObjective: 'Seeking signs of ancient microbial life in Jezero Crater paleolake, caching sealed rock samples for Mars Sample Return, and generating O₂ via MOXIE.',
    keyAchievement: 'Cached 25 geological core samples; Ingenuity helicopter completed 72 powered flights in thin Martian air.',
    instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC', 'MOXIE', 'RIMFAX Radar'],
  },
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    agency: 'NASA JPL',
    type: 'Interstellar Cosmic Explorer',
    trajectoryType: 'interstellar',
    distanceFromSunAU: 163.4,
    currentSpeedKms: 17.0,
    lightDelayStr: '22 Hours 38 Minutes',
    color: '#34d399',
    missionObjective: 'First human-made machine to cross the Heliopause into true interstellar space. Currently sampling interstellar plasma and galactic cosmic rays.',
    keyAchievement: 'Farthest human object from Earth (>24.4 billion km). Launched in 1977, still communicating via NASA Deep Space Network.',
    instruments: ['CRS (Cosmic Ray)', 'MAG (Magnetometer)', 'PWS (Plasma Wave)'],
  },
];

// ── CELESTIAL EPHEMERIS ENGINE ────────────────────────────────────────────
function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function getPlanetHeliocentricAngle(planetId: string, jd: number): number {
  const d = jd - 2451545.0; // Days from J2000.0 epoch
  const rates: Record<string, { L0: number; n: number }> = {
    mercury: { L0: 252.25, n: 4.0923344 },
    venus: { L0: 181.98, n: 1.6021302 },
    earth: { L0: 100.46, n: 0.9856474 },
    mars: { L0: 355.45, n: 0.5240330 },
    jupiter: { L0: 34.40, n: 0.0830853 },
    saturn: { L0: 49.94, n: 0.0334442 },
    uranus: { L0: 313.23, n: 0.0117283 },
    neptune: { L0: 304.88, n: 0.0059810 },
  };
  const r = rates[planetId] || { L0: 0, n: 1 };
  const deg = (r.L0 + r.n * d) % 360;
  return (deg * Math.PI) / 180;
}

// ── 3D MODEL BUILDERS ─────────────────────────────────────────────────────
function createSaturnRingGeometry(innerRadius: number, outerRadius: number): THREE.BufferGeometry {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    const u = (r - innerRadius) / (outerRadius - innerRadius);
    uvs.setXY(i, u, 0.5);
  }
  uvs.needsUpdate = true;
  return geo;
}

function createTextSprite(
  text: string,
  _color?: string,
  isCompact: boolean = false
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.5);

  const baseW = 512;
  const baseH = 128;
  canvas.width = Math.round(baseW * dpr);
  canvas.height = Math.round(baseH * dpr);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, baseW, baseH);

  // Bold 30-32px white text with thick dark outline (crisp readable NASA typography)
  ctx.font = 'bold 32px "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Thick dark outline for readability against space, stars, and planetary discs
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 8;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(text, baseW / 2, baseH / 2);

  // Crisp pure white fill
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, baseW / 2, baseH / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);

  // Base world scale ensuring text appears at least 14px-20px tall on screen
  const baseScaleY = isCompact ? 1.4 : 5.4;
  const baseScaleX = isCompact ? 5.6 : baseScaleY * (baseW / baseH);
  sprite.scale.set(baseScaleX, baseScaleY, 1);
  sprite.userData = { baseScaleX, baseScaleY };
  return sprite;
}

function createRealisticISSMesh(): THREE.Group {
  const group = new THREE.Group();
  const trussGeo = new THREE.BoxGeometry(7.8, 0.22, 0.22);
  const trussMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
  group.add(new THREE.Mesh(trussGeo, trussMat));

  const moduleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.65, roughness: 0.3 });
  const centralModuleGeo = new THREE.CylinderGeometry(0.42, 0.42, 2.8, 18);
  const central = new THREE.Mesh(centralModuleGeo, moduleMat);
  central.rotation.x = Math.PI / 2;
  group.add(central);

  const wingGeo = new THREE.BoxGeometry(0.95, 2.1, 0.03);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x1e3a8a, emissiveIntensity: 0.55 });
  const offsets = [-3.3, -2.3, 2.3, 3.3];
  offsets.forEach((xOff) => {
    const w1 = new THREE.Mesh(wingGeo, wingMat);
    w1.position.set(xOff, 1.25, 0);
    group.add(w1);
    const w2 = new THREE.Mesh(wingGeo, wingMat);
    w2.position.set(xOff, -1.25, 0);
    group.add(w2);
  });

  group.scale.set(0.4, 0.4, 0.4);
  return group;
}

function createRealisticTiangongMesh(): THREE.Group {
  const group = new THREE.Group();
  const coreGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.6, 18);
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.28 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.rotation.x = Math.PI / 2;
  group.add(core);

  const labGeo = new THREE.CylinderGeometry(0.44, 0.44, 2.1, 16);
  const lab1 = new THREE.Mesh(labGeo, coreMat);
  lab1.rotation.z = Math.PI / 2;
  lab1.position.set(-1.25, 0, 0.35);
  const lab2 = new THREE.Mesh(labGeo, coreMat);
  lab2.rotation.z = Math.PI / 2;
  lab2.position.set(1.25, 0, 0.35);
  group.add(lab1);
  group.add(lab2);

  const solarGeo = new THREE.BoxGeometry(0.75, 2.4, 0.03);
  const solarMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0x92400e, emissiveIntensity: 0.45 });
  const sWing1 = new THREE.Mesh(solarGeo, solarMat);
  sWing1.position.set(-2.65, 0, 0.35);
  const sWing2 = new THREE.Mesh(solarGeo, solarMat);
  sWing2.position.set(2.65, 0, 0.35);
  group.add(sWing1);
  group.add(sWing2);

  group.scale.set(0.38, 0.38, 0.38);
  return group;
}

function createRealisticProbeMesh(colorHex: number): THREE.Group {
  const group = new THREE.Group();
  const bodyGeo = new THREE.BoxGeometry(1.2, 1.2, 1.6);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  const dishGeo = new THREE.ConeGeometry(1.4, 0.4, 24, 1, true);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.4, roughness: 0.3 });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.rotation.x = Math.PI;
  dish.position.z = 1.1;
  group.add(dish);

  const solarGeo = new THREE.BoxGeometry(3.2, 0.8, 0.04);
  const solarMat = new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.3 });
  const s1 = new THREE.Mesh(solarGeo, solarMat);
  s1.position.x = 2.4;
  const s2 = new THREE.Mesh(solarGeo, solarMat);
  s2.position.x = -2.4;
  group.add(s1);
  group.add(s2);

  group.scale.set(0.32, 0.32, 0.32);
  return group;
}

function createRealisticHubbleMesh(): THREE.Group {
  const group = new THREE.Group();
  const barrelGeo = new THREE.CylinderGeometry(0.48, 0.48, 2.4, 20);
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.15 });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.rotation.z = Math.PI / 2;
  group.add(barrel);

  // Aperture door
  const doorGeo = new THREE.CylinderGeometry(0.49, 0.49, 0.05, 20);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(1.22, 0.3, 0);
  door.rotation.z = Math.PI / 3;
  group.add(door);

  // Solar Arrays
  const wingGeo = new THREE.BoxGeometry(0.55, 2.2, 0.03);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.45 });
  const w1 = new THREE.Mesh(wingGeo, wingMat);
  w1.position.set(0, 0, 1.4);
  const w2 = new THREE.Mesh(wingGeo, wingMat);
  w2.position.set(0, 0, -1.4);
  group.add(w1);
  group.add(w2);

  group.scale.set(0.34, 0.34, 0.34);
  return group;
}

function createRealisticLandsatMesh(): THREE.Group {
  const group = new THREE.Group();
  // Main spacecraft bus (Gold kapton foil)
  const bodyGeo = new THREE.BoxGeometry(1.0, 1.0, 1.4);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Single side solar array paddle
  const arrayGeo = new THREE.BoxGeometry(2.4, 0.9, 0.03);
  const arrayMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x172554, emissiveIntensity: 0.6 });
  const array = new THREE.Mesh(arrayGeo, arrayMat);
  array.position.set(2.0, 0, 0);
  group.add(array);

  // OLI-2 & TIRS-2 Earth-facing optical sensor apertures
  const lensGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.4, 16);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.1 });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.position.set(0, -0.65, 0.2);
  group.add(lens);

  group.scale.set(0.32, 0.32, 0.32);
  return group;
}

function createRealisticPaceMesh(): THREE.Group {
  const group = new THREE.Group();
  const bodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.4, 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.6, roughness: 0.3 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Solar array
  const solarGeo = new THREE.BoxGeometry(2.0, 0.75, 0.03);
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.5 });
  const solar = new THREE.Mesh(solarGeo, solarMat);
  solar.position.set(-1.6, 0, 0);
  group.add(solar);

  // OCI hyperspectral rotating telescope head
  const ociGeo = new THREE.SphereGeometry(0.32, 16, 16);
  const ociMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
  const oci = new THREE.Mesh(ociGeo, ociMat);
  oci.position.set(0, -0.75, 0);
  group.add(oci);

  group.scale.set(0.3, 0.3, 0.3);
  return group;
}

function createRealisticSwotMesh(): THREE.Group {
  const group = new THREE.Group();
  // Central bus
  const busGeo = new THREE.BoxGeometry(0.9, 0.9, 1.3);
  const busMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
  group.add(new THREE.Mesh(busGeo, busMat));

  // 10-meter radar mast boom (spanning across X axis)
  const boomGeo = new THREE.BoxGeometry(4.8, 0.08, 0.08);
  const boomMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
  group.add(new THREE.Mesh(boomGeo, boomMat));

  // Dual KaRIn radar antennas at tips of boom
  const antGeo = new THREE.BoxGeometry(0.8, 0.32, 0.04);
  const antMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
  const ant1 = new THREE.Mesh(antGeo, antMat);
  ant1.position.set(2.4, -0.2, 0);
  ant1.rotation.z = -0.2;
  const ant2 = new THREE.Mesh(antGeo, antMat);
  ant2.position.set(-2.4, -0.2, 0);
  ant2.rotation.z = 0.2;
  group.add(ant1);
  group.add(ant2);

  // Solar array
  const sGeo = new THREE.BoxGeometry(0.7, 1.8, 0.03);
  const sMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x1e3a8a, emissiveIntensity: 0.5 });
  const s = new THREE.Mesh(sGeo, sMat);
  s.position.set(0, 0, 1.3);
  group.add(s);

  group.scale.set(0.32, 0.32, 0.32);
  return group;
}

function createRealisticGraceFoMesh(): THREE.Group {
  const group = new THREE.Group();
  // Aerodynamic wedge shape
  const wedgeGeo = new THREE.BoxGeometry(1.5, 0.45, 0.85);
  const wedgeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
  group.add(new THREE.Mesh(wedgeGeo, wedgeMat));

  // Solar roof panel
  const roofGeo = new THREE.BoxGeometry(1.4, 0.04, 0.8);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x6d28d9, emissiveIntensity: 0.4 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 0.24, 0);
  group.add(roof);

  // Laser ranging optical baffle
  const lriGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12);
  const lriMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95 });
  const lri = new THREE.Mesh(lriGeo, lriMat);
  lri.rotation.z = Math.PI / 2;
  lri.position.set(0.8, 0, 0);
  group.add(lri);

  group.scale.set(0.3, 0.3, 0.3);
  return group;
}

function createRealisticGoesMesh(): THREE.Group {
  const group = new THREE.Group();
  // Geostationary satellite body
  const bodyGeo = new THREE.BoxGeometry(1.1, 1.1, 1.2);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.7, roughness: 0.25 });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Solar array wing (single long articulated paddle)
  const solarGeo = new THREE.BoxGeometry(2.8, 0.9, 0.03);
  const solarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.4 });
  const solar = new THREE.Mesh(solarGeo, solarMat);
  solar.position.set(-2.2, 0, 0);
  group.add(solar);

  // Earth-pointing sensor deck
  const sensorGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
  const sensorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
  const sensor = new THREE.Mesh(sensorGeo, sensorMat);
  sensor.position.set(0, -0.65, 0);
  group.add(sensor);

  // Magnetometer boom
  const boomGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8);
  const boomMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
  const boom = new THREE.Mesh(boomGeo, boomMat);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(1.6, 0, 0);
  group.add(boom);

  group.scale.set(0.32, 0.32, 0.32);
  return group;
}

function createSatelliteOrbitRing(radius: number, colorHex: number, inclinationRad = 0): THREE.Line {
  const points: THREE.Vector3[] = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const rawZ = Math.sin(theta) * radius;
    const y = rawZ * Math.sin(inclinationRad);
    const z = rawZ * Math.cos(inclinationRad);
    points.push(new THREE.Vector3(x, y, z));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.45,
  });
  return new THREE.Line(geo, mat);
}

// ── COMPONENT IMPLEMENTATION ──────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({
  onEnter,
  onStartMission,
  onContinueMission,
  onBuildOutpost,
  hasSavedGame = false,
  savedGameSol = 1,
  savedGameDest = 'Moon',
  onOpenAcademy,
  onOpenRover,
  onOpenHowToPlay: _onOpenHowToPlay,
  onOpenSettings: _onOpenSettings,
  onOpenScienceHub: _onOpenScienceHub,
  onOpenCredits,
  onOpenComics,
  onOpenLearningHub,
  onOpenDepot,
  onOpenClassroom,
  currentUser,
  onUserUpdate,
  onOpenAuth,
  onOpenJudgePreview,
  onOpenTelemetry,
  onOpenCertificate,
  isJudgeMode: _isJudgeMode = false,
  onOpenOrrery: _onOpenOrrery,
  onOpenMarsEDL,
  onOpenTeacherGradebook: _onOpenTeacherGradebook,
  onOpenCharacterLocker,
  onOpenLiveActivity: _onOpenLiveActivity,
  onOpenMultiplayerLobby,
  onOpenMoonbaseAlpha,
  onOpenBlackHole,
  onOpenExpedition,
  onOpenCampaign,
  onOpenSpaceGamesHub,
  mode = 'explore',
  initialTarget,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Simulation Ephemeris & Time
  const [simDate, setSimDate] = useState<Date>(() => new Date());
  const [currentJD, setCurrentJD] = useState<number>(() => getJulianDate(new Date()));
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1 = Real-time, 10, 100, 1000, 10000
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(true);

  // Visual Display Toggles
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showAsteroids, setShowAsteroids] = useState<boolean>(true);
  const [showSpacecraft, setShowSpacecraft] = useState<boolean>(true);
  const [lightingMode, setLightingMode] = useState<'sun' | 'flood'>('sun');
  const [is2DMode, setIs2DMode] = useState<boolean>(false);
  const [isCommandDeckExpanded, setIsCommandDeckExpanded] = useState<boolean>(true);

  // Selection & Sidebar
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'planet' | 'station' | 'mission';
    data: PlanetData | SpaceStationData | SolarMissionData;
  } | null>({ type: 'planet', data: PLANETS[2] }); // Default to Earth
  const [drawerTab, setDrawerTab] = useState<'overview' | 'earthdata' | 'indepth' | 'numbers' | 'missions' | 'quiz' | 'compare'>('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<string>('sun');
  const [isTargetLocked, setIsTargetLocked] = useState<boolean>(false);
  const [isNasaLiveModalOpen, setIsNasaLiveModalOpen] = useState<boolean>(false);
  const [quizAnsweredState, setQuizAnsweredState] = useState<{ [entityId: string]: { selected: number; isCorrect: boolean } }>({});

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDestModalOpen, setIsDestModalOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'inner' | 'satellites' | 'outer' | 'fleet' | 'tours'>('all');
  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;
  const [isSimulatorsDropdownOpen, setIsSimulatorsDropdownOpen] = useState<boolean>(false);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState<boolean>(false);
  const [isHeroDismissed, setIsHeroDismissed] = useState<boolean>(() => mode === 'explore');

  // Hover Tooltip
  const [hoverEntity, setHoverEntity] = useState<{ name: string; subtitle: string; x: number; y: number } | null>(null);

  // Audio state
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => spaceMusicEngine.getIsMuted());

  // Size Comparison Slider
  const [compareScale, setCompareScale] = useState<number>(1);

  // Cadet Progression
  const [cadetProg] = useState(() => getCadetProgression());
  const rankInfo = getRankProgress(cadetProg.xp);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; label: THREE.Sprite; clouds?: THREE.Mesh; moons?: { mesh: THREE.Mesh; label?: THREE.Sprite; angle: number; speed: number; orbitRadius: number }[]; orbitRadius: number; angle: number }>>(new Map());
  const stationMeshesRef = useRef<Map<string, { group: THREE.Group; label: THREE.Sprite; parentId: string; orbitRadius: number; angle: number; orbitSpeed: number; inclination?: number }>>(new Map());
  const probeMeshesRef = useRef<Map<string, { group: THREE.Group; label: THREE.Sprite; distanceAU: number }>>(new Map());
  const orbitLinesRef = useRef<THREE.Line[]>([]);
  const satOrbitLinesRef = useRef<THREE.Line[]>([]);
  const asteroidPointsRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const sunLabelRef = useRef<THREE.Sprite | null>(null);

  // Refs for animation loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const simSpeedRef = useRef(simSpeed);
  simSpeedRef.current = simSpeed;
  const simDateRef = useRef(simDate);
  simDateRef.current = simDate;
  const lastUiUpdateRef = useRef<number>(Date.now());
  const cameraTargetRef = useRef(cameraTarget);
  cameraTargetRef.current = cameraTarget;
  const isTargetLockedRef = useRef(isTargetLocked);
  isTargetLockedRef.current = isTargetLocked;

  // Camera Orbit Interaction Variables
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const camThetaRef = useRef(0.45);
  const camPhiRef = useRef(1.12);
  const camDistanceRef = useRef(135);
  const camTargetPosRef = useRef(new THREE.Vector3(0, 0, 0));

  // ── SPEECH SYNTHESIS HELPER ───────────────────────────────────────────────
  const handleReadAloud = (text: string) => {
    soundFx.playTelemetryChirp();
    speechEngine.speak(text, 'HOUSTON_CAPCOM');
  };

  // ── FILTERED SEARCH SUGGESTIONS ──────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { id: string; name: string; type: string; category: 'planet' | 'station' | 'mission' | 'game' | 'simulator'; icon: string }[] = [];

    PLANETS.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q)) {
        results.push({ id: p.id, name: p.name, type: p.zone, category: 'planet', icon: '🪐' });
      }
    });

    SPACE_STATIONS.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.agency.toLowerCase().includes(q)) {
        results.push({ id: s.id, name: s.name, type: s.agency, category: 'station', icon: '🛰️' });
      }
    });

    SOLAR_MISSIONS.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.missionObjective.toLowerCase().includes(q)) {
        results.push({ id: m.id, name: m.name, type: m.type, category: 'mission', icon: '🚀' });
      }
    });

    ALL_76_NASA_MISSIONS.slice(0, 30).forEach((gm) => {
      if (gm.name.toLowerCase().includes(q) || gm.destinationName.toLowerCase().includes(q)) {
        results.push({ id: gm.id, name: gm.name, type: `${gm.destinationName} Flight`, category: 'game', icon: '🎮' });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  // ── TARGET FOCUS HANDLER ──────────────────────────────────────────────────
  const flyToTarget = useCallback((targetId: string) => {
    setCameraTarget(targetId);
    setIsTargetLocked(true);
    soundFx.playClick(850);

    const planet = PLANETS.find((p) => p.id === targetId);
    if (planet) {
      setSelectedEntity({ type: 'planet', data: planet });
      setIsDrawerOpen(true);
      camDistanceRef.current = Math.max(planet.radius * 6, 24);
      return;
    }

    const station = SPACE_STATIONS.find((s) => s.id === targetId);
    if (station) {
      setSelectedEntity({ type: 'station', data: station });
      setIsDrawerOpen(true);
      camDistanceRef.current = 14;
      return;
    }

    const mission = SOLAR_MISSIONS.find((m) => m.id === targetId);
    if (mission) {
      setSelectedEntity({ type: 'mission', data: mission });
      setIsDrawerOpen(true);
      camDistanceRef.current = 16;
      return;
    }

    if (targetId === 'sun') {
      camDistanceRef.current = 140;
    }
  }, []);

  // Auto-focus celestial target when navigated with initialTarget (e.g. from Prerequisite Dossier)
  useEffect(() => {
    if (initialTarget) {
      const timer = setTimeout(() => {
        flyToTarget(initialTarget.toLowerCase());
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [initialTarget, flyToTarget]);

  // ── RESET CAMERA VIEW ────────────────────────────────────────────────────
  const handleResetCamera = () => {
    setCameraTarget('sun');
    setIsTargetLocked(false);
    camThetaRef.current = 0.4;
    camPhiRef.current = 1.1;
    camDistanceRef.current = 180;
    camTargetPosRef.current.set(0, 0, 0);
    soundFx.playTelemetryChirp();
  };

  // ── LIVE EPHEMERIS SYNC ──────────────────────────────────────────────────
  const syncToNow = () => {
    const now = new Date();
    setSimDate(now);
    setCurrentJD(getJulianDate(now));
    setIsLiveSynced(true);
    soundFx.playClick(900);
  };

  // ── THREE.JS SCENE INITIALIZATION ────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 4000);
    camera.position.set(0, 110, 180);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. High-Fidelity Scientific Lighting
    const ambientLight = new THREE.AmbientLight(0x94a3b8, lightingMode === 'flood' ? 1.8 : 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfffbeb, 4.2, 1200, 0.35);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 3. Texture Loading
    const texLoader = new THREE.TextureLoader();
    const textures = {
      sun: texLoader.load('/assets/planets/2k_sun.jpg'),
      stars: texLoader.load('/assets/planets/2k_stars_milky_way.jpg'),
      mercury: texLoader.load('/assets/planets/2k_mercury.jpg'),
      venusAtm: texLoader.load('/assets/planets/2k_venus_atmosphere.jpg'),
      earthDay: texLoader.load('/assets/planets/2k_earth_daymap.jpg'),
      earthNight: texLoader.load('/assets/planets/2k_earth_nightmap.jpg'),
      earthClouds: texLoader.load('/assets/planets/2k_earth_clouds.jpg'),
      moon: texLoader.load('/assets/planets/2k_moon.jpg'),
      mars: texLoader.load('/assets/planets/2k_mars.jpg'),
      jupiter: texLoader.load('/assets/planets/2k_jupiter.jpg'),
      saturn: texLoader.load('/assets/planets/2k_saturn.jpg'),
      saturnRing: texLoader.load('/assets/planets/2k_saturn_ring_alpha.png'),
      uranus: texLoader.load('/assets/planets/2k_uranus.jpg'),
      neptune: texLoader.load('/assets/planets/2k_neptune.jpg'),
    };

    Object.values(textures).forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });

    // 4. Milky Way Celestial Sky Sphere & Starfield
    const skyGeo = new THREE.SphereGeometry(2200, 48, 48);
    const skyMat = new THREE.MeshBasicMaterial({ map: textures.stars, side: THREE.BackSide, depthWrite: false });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Twinkling Starfield Points
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 2000;
      starPos[i + 1] = (Math.random() - 0.5) * 2000;
      starPos[i + 2] = (Math.random() - 0.5) * 2000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.5, color: 0xffffff, transparent: true, opacity: 0.85 });
    scene.add(new THREE.Points(starGeo, starMat));

    // 5. Blazing Sun Mesh & Corona Layers
    const sunGeo = new THREE.SphereGeometry(7.2, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ map: textures.sun });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    const coronaGeo = new THREE.SphereGeometry(10.5, 48, 48);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // Sun Name Label (Visible by default)
    const sunLabel = createTextSprite('SUN', '#f59e0b', false);
    sunLabel.position.set(0, 11.4, 0);
    sunLabel.visible = showLabels;
    scene.add(sunLabel);
    sunLabelRef.current = sunLabel;

    // 6. Build Planets & Orbits
    const initialJD = getJulianDate(new Date());
    const orbitLines: THREE.Line[] = [];

    PLANETS.forEach((planet) => {
      // Orbit Line Ellipse
      const orbitCurve = new THREE.EllipseCurve(0, 0, planet.orbitRadius, planet.orbitRadius, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(140);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMat = new THREE.LineBasicMaterial({
        color: planet.color,
        transparent: true,
        opacity: 0.24,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.visible = showOrbits;
      scene.add(orbitLine);
      orbitLines.push(orbitLine);

      // Planet Mesh
      const pGeo = new THREE.SphereGeometry(planet.radius, 48, 48);
      let pMat: THREE.Material;

      if (planet.id === 'earth') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.earthDay, roughness: 0.45, metalness: 0.1 });
      } else if (planet.id === 'jupiter') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.jupiter, roughness: 0.6 });
      } else if (planet.id === 'saturn') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.saturn, roughness: 0.6 });
      } else if (planet.id === 'mars') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.mars, roughness: 0.7 });
      } else if (planet.id === 'venus') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.venusAtm, roughness: 0.5 });
      } else if (planet.id === 'mercury') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.mercury, roughness: 0.8 });
      } else if (planet.id === 'uranus') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.uranus, roughness: 0.5 });
      } else if (planet.id === 'neptune') {
        pMat = new THREE.MeshStandardMaterial({ map: textures.neptune, roughness: 0.5 });
      } else {
        pMat = new THREE.MeshStandardMaterial({ color: planet.color, roughness: 0.5 });
      }

      const pMesh = new THREE.Mesh(pGeo, pMat);
      const angle = getPlanetHeliocentricAngle(planet.id, initialJD);
      pMesh.position.set(Math.cos(angle) * planet.orbitRadius, 0, Math.sin(angle) * planet.orbitRadius);
      pMesh.name = planet.id;
      scene.add(pMesh);

      // Clouds for Earth
      let cloudsMesh: THREE.Mesh | undefined;
      if (planet.id === 'earth') {
        const cGeo = new THREE.SphereGeometry(planet.radius * 1.025, 48, 48);
        const cMat = new THREE.MeshStandardMaterial({
          map: textures.earthClouds,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
        });
        cloudsMesh = new THREE.Mesh(cGeo, cMat);
        pMesh.add(cloudsMesh);

      }

      // Rings for Saturn
      if (planet.hasRings) {
        const ringGeo = createSaturnRingGeometry(planet.radius * 1.35, planet.radius * 2.5);
        const ringMat = new THREE.MeshStandardMaterial({
          map: textures.saturnRing,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          roughness: 0.4,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.45;
        pMesh.add(ringMesh);
      }

      // Billboard Text Label (Clean bold white text with dark outline)
      const label = createTextSprite(planet.name.toUpperCase(), `#${planet.color.toString(16).padStart(6, '0')}`, false);
      label.position.copy(pMesh.position);
      label.position.y += planet.radius + 3.8;
      label.visible = showLabels;
      scene.add(label);

      // Moons (Earth Moon & Galilean Moons)
      const moonsList: { mesh: THREE.Mesh; label?: THREE.Sprite; angle: number; speed: number; orbitRadius: number }[] = [];
      if (planet.id === 'earth') {
        const mGeo = new THREE.SphereGeometry(0.82, 24, 24);
        const mMat = new THREE.MeshStandardMaterial({ map: textures.moon, roughness: 0.8 });
        const moonMesh = new THREE.Mesh(mGeo, mMat);
        moonMesh.name = 'moon';
        scene.add(moonMesh);

        // Dedicated Moon label
        const moonLabel = createTextSprite('MOON', '#cbd5e1', true);
        moonLabel.visible = showLabels;
        scene.add(moonLabel);

        moonsList.push({ mesh: moonMesh, label: moonLabel, angle: 0, speed: 2.2, orbitRadius: 6.2 });
      }

      planetMeshesRef.current.set(planet.id, {
        mesh: pMesh,
        label,
        clouds: cloudsMesh,
        moons: moonsList,
        orbitRadius: planet.orbitRadius,
        angle,
      });
    });
    orbitLinesRef.current = orbitLines;

    // 7. Space Stations & Earth Satellite Fleet
    const satOrbitLines: THREE.Line[] = [];
    SPACE_STATIONS.forEach((station) => {
      let stationGroup: THREE.Group;
      if (station.id === 'iss') {
        stationGroup = createRealisticISSMesh();
      } else if (station.id === 'tiangong') {
        stationGroup = createRealisticTiangongMesh();
      } else if (station.id === 'hubble') {
        stationGroup = createRealisticHubbleMesh();
      } else if (station.id === 'landsat-9') {
        stationGroup = createRealisticLandsatMesh();
      } else if (station.id === 'pace') {
        stationGroup = createRealisticPaceMesh();
      } else if (station.id === 'swot') {
        stationGroup = createRealisticSwotMesh();
      } else if (station.id === 'grace-fo') {
        stationGroup = createRealisticGraceFoMesh();
      } else if (station.id === 'goes-16') {
        stationGroup = createRealisticGoesMesh();
      } else {
        stationGroup = createRealisticProbeMesh(parseInt(station.color.replace('#', '0x')));
      }

      stationGroup.name = station.id;
      scene.add(stationGroup);

      const shortName = station.id === 'iss' ? 'ISS'
        : station.id === 'tiangong' ? 'Tiangong'
        : station.id === 'hubble' ? 'Hubble'
        : station.id === 'landsat-9' ? 'Landsat 9'
        : station.id === 'pace' ? 'PACE'
        : station.id === 'swot' ? 'SWOT'
        : station.id === 'grace-fo' ? 'GRACE-FO'
        : station.id === 'goes-16' ? 'GOES-16'
        : station.id === 'lunar-gateway' ? 'Gateway'
        : station.name.split(' (')[0];
      const label = createTextSprite(shortName, station.color, true);
      label.visible = false;
      scene.add(label);

      let orbitRadius = 4.5;
      let orbitSpeed = 3.5;
      let inclRad = 0;

      if (station.id === 'iss') { orbitRadius = 4.4; orbitSpeed = 3.5; inclRad = 0.90; }
      else if (station.id === 'tiangong') { orbitRadius = 4.2; orbitSpeed = 3.6; inclRad = 0.72; }
      else if (station.id === 'hubble') { orbitRadius = 4.8; orbitSpeed = 3.3; inclRad = 0.50; }
      else if (station.id === 'landsat-9') { orbitRadius = 5.3; orbitSpeed = 3.0; inclRad = 1.71; }
      else if (station.id === 'pace') { orbitRadius = 5.0; orbitSpeed = 3.1; inclRad = 1.71; }
      else if (station.id === 'swot') { orbitRadius = 5.6; orbitSpeed = 2.8; inclRad = 1.35; }
      else if (station.id === 'grace-fo') { orbitRadius = 4.6; orbitSpeed = 3.4; inclRad = 1.55; }
      else if (station.id === 'goes-16') { orbitRadius = 7.8; orbitSpeed = 0.7; inclRad = 0.00; }
      else if (station.parentBody === 'moon') { orbitRadius = 2.4; orbitSpeed = 2.0; inclRad = 0.35; }

      if (station.parentBody === 'earth') {
        const orbitLine = createSatelliteOrbitRing(orbitRadius, parseInt(station.color.replace('#', '0x')), inclRad);
        scene.add(orbitLine);
        satOrbitLines.push(orbitLine);
      }

      stationMeshesRef.current.set(station.id, {
        group: stationGroup,
        label,
        parentId: station.parentBody,
        orbitRadius,
        angle: Math.random() * Math.PI * 2,
        orbitSpeed,
        inclination: inclRad,
      });
    });
    satOrbitLinesRef.current = satOrbitLines;

    // 8. Solar Missions & Interstellar Probes
    SOLAR_MISSIONS.forEach((probe) => {
      const probeGroup = createRealisticProbeMesh(parseInt(probe.color.replace('#', '0x')));
      probeGroup.name = probe.id;
      scene.add(probeGroup);

      const label = createTextSprite(probe.name, probe.color, true);
      label.visible = false;
      scene.add(label);

      let rad = probe.distanceFromSunAU * 38;
      if (probe.id === 'parker-solar-probe') rad = 11.5;
      if (probe.id === 'jwst') rad = 46.5;
      if (probe.id === 'perseverance') rad = 56.2;
      if (probe.id === 'voyager-1') rad = 195.0;

      const angle = (probe.distanceFromSunAU * 1.5) % (Math.PI * 2);
      probeGroup.position.set(Math.cos(angle) * rad, 1.2, Math.sin(angle) * rad);
      label.position.set(probeGroup.position.x, probeGroup.position.y + 3.2, probeGroup.position.z);

      probeMeshesRef.current.set(probe.id, {
        group: probeGroup,
        label,
        distanceAU: probe.distanceFromSunAU,
      });
    });

    // 9. Asteroid Belt Particles
    const astCount = 450;
    const astGeo = new THREE.BufferGeometry();
    const astPos = new Float32Array(astCount * 3);
    for (let i = 0; i < astCount * 3; i += 3) {
      const r = 67 + Math.random() * 11;
      const th = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.5;
      astPos[i] = Math.cos(th) * r;
      astPos[i + 1] = y;
      astPos[i + 2] = Math.sin(th) * r;
    }
    astGeo.setAttribute('position', new THREE.BufferAttribute(astPos, 3));
    const astMat = new THREE.PointsMaterial({ size: 1.1, color: 0xc4cbd4, transparent: true, opacity: 0.55 });
    const astMesh = new THREE.Points(astGeo, astMat);
    scene.add(astMesh);
    asteroidPointsRef.current = astMesh;

    // 10. Pointer & Mouse Event Listeners for Free Orbit & Click
    const dom = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      // Raycaster for Hover Reticle
      const rect = dom.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const meshes: THREE.Object3D[] = [];
      planetMeshesRef.current.forEach((val) => meshes.push(val.mesh));
      stationMeshesRef.current.forEach((val) => meshes.push(val.group));
      probeMeshesRef.current.forEach((val) => meshes.push(val.group));

      const hits = raycasterRef.current.intersectObjects(meshes, true);
      if (hits.length > 0) {
        let hitObj: THREE.Object3D | null = hits[0].object;
        while (hitObj && !hitObj.name && hitObj.parent && hitObj.parent !== scene) {
          hitObj = hitObj.parent;
        }
        const nameId = hitObj?.name;
        const matchedPlanet = PLANETS.find((p) => p.id === nameId);
        const matchedStation = SPACE_STATIONS.find((s) => s.id === nameId);
        const matchedProbe = SOLAR_MISSIONS.find((m) => m.id === nameId);

        if (matchedPlanet) {
          setHoverEntity({ name: matchedPlanet.name, subtitle: `${matchedPlanet.distanceAU} · ${matchedPlanet.zone}`, x: e.clientX, y: e.clientY });
        } else if (matchedStation) {
          setHoverEntity({ name: matchedStation.name, subtitle: `${matchedStation.altitudeKm} km · ${matchedStation.agency}`, x: e.clientX, y: e.clientY });
        } else if (matchedProbe) {
          setHoverEntity({ name: matchedProbe.name, subtitle: `${matchedProbe.distanceFromSunAU} AU · ${matchedProbe.agency}`, x: e.clientX, y: e.clientY });
        }
      } else {
        setHoverEntity(null);
      }

      if (!isDraggingRef.current) return;
      const dx = e.clientX - previousMousePositionRef.current.x;
      const dy = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      camThetaRef.current -= dx * 0.005;
      camPhiRef.current = Math.max(0.12, Math.min(Math.PI - 0.12, camPhiRef.current - dy * 0.005));
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDistanceRef.current = Math.max(12, Math.min(800, camDistanceRef.current + e.deltaY * 0.15));
    };

    const onClick = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycasterRef.current.setFromCamera(clickMouse, camera);

      const checkList: THREE.Object3D[] = [];
      planetMeshesRef.current.forEach((val) => {
        checkList.push(val.mesh);
        if (val.moons) {
          val.moons.forEach((m) => checkList.push(m.mesh));
        }
      });
      stationMeshesRef.current.forEach((val) => checkList.push(val.group));
      probeMeshesRef.current.forEach((val) => checkList.push(val.group));

      const hits = raycasterRef.current.intersectObjects(checkList, true);
      if (hits.length > 0) {
        let hitObj: THREE.Object3D | null = hits[0].object;
        while (hitObj && !hitObj.name && hitObj.parent && hitObj.parent !== scene) {
          hitObj = hitObj.parent;
        }
        if (hitObj?.name) {
          flyToTarget(hitObj.name);
        }
      }
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // 11. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate Sun
      sunMesh.rotation.y += 0.002;
      coronaMesh.rotation.y -= 0.001;

      // Advance Simulation Ephemeris
      const isPlayingCur = isPlayingRef.current;
      const speedCur = simSpeedRef.current;

      if (isPlayingCur) {
        // At 1x speed, advance time in real-time seconds (delta * 1000 ms) so today's date remains accurate
        // Only scale to days/hours when user clicks 10x, 100x, or 1k speed buttons
        const msAdvance = speedCur === 1
          ? delta * 1000
          : speedCur === 10
            ? delta * 3600000 // 1 hour per sec
            : speedCur === 100
              ? delta * 86400000 // 1 day per sec
              : delta * 864000000; // 10 days per sec

        simDateRef.current = new Date(simDateRef.current.getTime() + msAdvance);
        const newJD = getJulianDate(simDateRef.current);
        setCurrentJD(newJD);

        const nowMs = Date.now();
        if (nowMs - lastUiUpdateRef.current >= 350) {
          lastUiUpdateRef.current = nowMs;
          setSimDate(new Date(simDateRef.current));
        }

        const targetIdCur = cameraTargetRef.current;
        const isZoomedIn = camDistanceRef.current <= 85;
        const innerPlanets = ['mercury', 'venus', 'earth', 'moon', 'mars'];
        const dist = camDistanceRef.current;
        const scaleFactor = Math.max(0.85, Math.min(2.5, dist / 80));

        // Update Sun Name Label (Hidden in background mode)
        if (sunLabelRef.current) {
          const sunBaseX = sunLabelRef.current.userData.baseScaleX || 21.6;
          const sunBaseY = sunLabelRef.current.userData.baseScaleY || 5.4;
          sunLabelRef.current.scale.set(sunBaseX * scaleFactor, sunBaseY * scaleFactor, 1);
          sunLabelRef.current.visible = mode === 'background' ? false : Boolean(showLabels && targetIdCur !== 'sun');
        }

        // Update Heliocentric Planet Positions
        planetMeshesRef.current.forEach((val, id) => {
          const angle = getPlanetHeliocentricAngle(id, newJD);
          val.angle = angle;
          val.mesh.position.x = Math.cos(angle) * val.orbitRadius;
          val.mesh.position.z = Math.sin(angle) * val.orbitRadius;
          val.mesh.rotation.y += 0.015;

          if (val.clouds) val.clouds.rotation.y += 0.003;

          // Moons orbit planet
          if (val.moons) {
            val.moons.forEach((m) => {
              m.angle += delta * m.speed;
              m.mesh.position.x = val.mesh.position.x + Math.cos(m.angle) * m.orbitRadius;
              m.mesh.position.y = val.mesh.position.y;
              m.mesh.position.z = val.mesh.position.z + Math.sin(m.angle) * m.orbitRadius;
              m.mesh.rotation.y += 0.02;

              if (m.label) {
                const mScale = Math.max(0.75, Math.min(2.2, dist / 85));
                m.label.scale.set(
                  (m.label.userData.baseScaleX || 16.8) * mScale,
                  (m.label.userData.baseScaleY || 4.2) * mScale,
                  1
                );
                // Staggered below Moon to prevent stacking collision with Earth label above
                m.label.position.set(m.mesh.position.x, m.mesh.position.y - 3.0, m.mesh.position.z);
                const isMoonSelectedOrHovered = targetIdCur === 'moon' || Boolean(hoverEntity && hoverEntity.name.toLowerCase().includes('moon'));
                m.label.visible = mode === 'background' ? false : Boolean(showLabels && (isZoomedIn || isMoonSelectedOrHovered));
              }
            });
          }

          // Scale sprite so text appears at least 14px-22px tall on screen
          const pBaseX = val.label.userData.baseScaleX || 21.6;
          const pBaseY = val.label.userData.baseScaleY || 5.4;
          val.label.scale.set(pBaseX * scaleFactor, pBaseY * scaleFactor, 1);

          // Sync label with staggered collision avoidance offsets
          val.label.position.copy(val.mesh.position);
          let yOffset = 3.6;
          if (id === 'mercury') yOffset = 2.4;
          else if (id === 'venus') yOffset = 4.2;
          else if (id === 'earth') yOffset = 3.4;
          else if (id === 'mars') yOffset = 3.8;
          else if (id === 'jupiter') yOffset = 5.5;
          else if (id === 'saturn') yOffset = 4.8;
          else if (id === 'uranus') yOffset = 4.0;
          else if (id === 'neptune') yOffset = 3.8;

          val.label.position.y += (val.mesh.geometry as THREE.SphereGeometry).parameters.radius + yOffset;
          const isInspectingThisPlanet = targetIdCur === id && camDistanceRef.current < 28;
          const isSelectedOrHovered = targetIdCur === id || Boolean(hoverEntity && hoverEntity.name.toLowerCase() === id);

          // In background mode, hide all 3D planet labels to avoid ghost text behind game menus
          if (mode === 'background') {
            val.label.visible = false;
          } else if (innerPlanets.includes(id)) {
            val.label.visible = Boolean(showLabels && !isInspectingThisPlanet && (isZoomedIn || isSelectedOrHovered));
          } else {
            val.label.visible = Boolean(showLabels && !isInspectingThisPlanet);
          }
        });

        // Space Stations & Earth Satellites Orbit Earth / Moon with Adaptive Label Visibility
        const earthData = planetMeshesRef.current.get('earth');
        const moonMeshObj = earthData?.moons?.[0];
        const isSatellitesView = activeCategoryRef.current === 'satellites';
        const isFocusingStation = targetIdCur === 'iss' || targetIdCur === 'tiangong' || targetIdCur === 'lunar-gateway' ||
          targetIdCur === 'hubble' || targetIdCur === 'landsat-9' || targetIdCur === 'pace' ||
          targetIdCur === 'swot' || targetIdCur === 'grace-fo' || targetIdCur === 'goes-16';
        const isCloseToEarth = (targetIdCur === 'earth' && camDistanceRef.current < 28) || isSatellitesView || isFocusingStation;

        if (earthData) {
          satOrbitLinesRef.current.forEach((line) => {
            line.position.copy(earthData.mesh.position);
            line.visible = showOrbits && (isCloseToEarth || isSatellitesView);
          });
        }

        stationMeshesRef.current.forEach((st, id) => {
          st.angle += delta * st.orbitSpeed;
          let centerPos = earthData ? earthData.mesh.position : new THREE.Vector3();
          if (st.parentId === 'moon' && moonMeshObj) {
            centerPos = moonMeshObj.mesh.position;
          }

          const cosA = Math.cos(st.angle) * st.orbitRadius;
          const sinA = Math.sin(st.angle) * st.orbitRadius;
          const inc = st.inclination || 0;
          const x = cosA;
          const y = sinA * Math.sin(inc);
          const z = sinA * Math.cos(inc);

          st.group.position.set(
            centerPos.x + x,
            centerPos.y + y,
            centerPos.z + z
          );
          st.group.rotation.y += 0.02;

          const satScale = Math.max(0.4, Math.min(1.2, dist / 35));
          st.label.scale.set(5.6 * satScale, 1.4 * satScale, 1);
          st.label.position.set(st.group.position.x, st.group.position.y + 0.9 * satScale, st.group.position.z);

          const isThisSatTargeted = targetIdCur === id;
          const isThisSatHovered = Boolean(hoverEntity && hoverEntity.name.toLowerCase().includes(id));
          const isInspectingThisSat = isThisSatTargeted && camDistanceRef.current < 18;

          st.label.visible = Boolean(
            showLabels && showSpacecraft && !isInspectingThisSat &&
            (isThisSatTargeted || isThisSatHovered || (isCloseToEarth && isSatellitesView))
          );
        });

        // Probe Labels: Show only when probe is targeted or zoomed near it, keeping overview clean
        probeMeshesRef.current.forEach((pr, id) => {
          const isProbeTargeted = targetIdCur === id;
          const isNearProbe = camDistanceRef.current < 50;
          pr.label.visible = showLabels && showSpacecraft && (isProbeTargeted || isNearProbe);
        });

        // Rotate Asteroid Belt
        if (asteroidPointsRef.current) {
          asteroidPointsRef.current.rotation.y += 0.0004;
        }
      }

      // Smooth Camera Positioning & Lerp
      const targetId = cameraTargetRef.current;
      let targetCenter = new THREE.Vector3(0, 0, 0);

      if (targetId !== 'sun') {
        const pObj = planetMeshesRef.current.get(targetId);
        const sObj = stationMeshesRef.current.get(targetId);
        const mObj = probeMeshesRef.current.get(targetId);

        if (pObj) {
          targetCenter = pObj.mesh.position.clone();
        } else if (sObj) {
          targetCenter = sObj.group.position.clone();
        } else if (mObj) {
          targetCenter = mObj.group.position.clone();
        }
      }

      camTargetPosRef.current.lerp(targetCenter, 0.08);

      const theta = camThetaRef.current;
      const phi = camPhiRef.current;
      const dist = camDistanceRef.current;

      const cx = camTargetPosRef.current.x + dist * Math.sin(phi) * Math.sin(theta);
      const cy = camTargetPosRef.current.y + dist * Math.cos(phi);
      const cz = camTargetPosRef.current.z + dist * Math.sin(phi) * Math.cos(theta);

      camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.08);
      camera.lookAt(camTargetPosRef.current);

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      if (dom.parentElement) dom.parentElement.removeChild(dom);
      renderer.dispose();
    };
  }, [lightingMode, flyToTarget]);

  // ── VISIBILITY SYNCHRONIZATION ──────────────────────────────────────────
  useEffect(() => {
    orbitLinesRef.current.forEach((l) => { l.visible = showOrbits; });
  }, [showOrbits]);

  useEffect(() => {
    planetMeshesRef.current.forEach((p) => {
      p.label.visible = showLabels;
      if (p.moons) {
        p.moons.forEach((m) => {
          if (m.label) m.label.visible = showLabels;
        });
      }
    });
    if (sunLabelRef.current) sunLabelRef.current.visible = showLabels;
    stationMeshesRef.current.forEach((s) => { s.label.visible = showLabels && showSpacecraft; });
    probeMeshesRef.current.forEach((m) => { m.label.visible = showLabels && showSpacecraft; });
  }, [showLabels, showSpacecraft]);

  useEffect(() => {
    stationMeshesRef.current.forEach((s) => { s.group.visible = showSpacecraft; });
    probeMeshesRef.current.forEach((m) => { m.group.visible = showSpacecraft; });
  }, [showSpacecraft]);

  useEffect(() => {
    if (asteroidPointsRef.current) asteroidPointsRef.current.visible = showAsteroids;
  }, [showAsteroids]);

  // Keyboard Shortcuts: / to search, Space for play/pause, Esc to close, H to reset camera
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
          setIsSearchFocused(false);
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
        soundFx.playClick(650);
      } else if (e.key === 'Escape') {
        setIsStoriesModalOpen(false);
        setIsSimulatorsDropdownOpen(false);
        setIsDrawerOpen(false);
      } else if (e.key === 'h' || e.key === 'H') {
        handleResetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── SPEED & SCRUBBER HANDLERS ───────────────────────────────────────────
  const handleSetSpeed = (multiplier: number) => {
    setSimSpeed(multiplier);
    setIsPlaying(true);
    setIsLiveSynced(false);
    soundFx.playClick(multiplier > 1 ? 900 : 700);
  };

  const handleStepDay = (days: number) => {
    const next = new Date(simDate.getTime() + days * 86400000);
    setSimDate(next);
    setCurrentJD(getJulianDate(next));
    setIsLiveSynced(false);
    soundFx.playClick(750);
  };

  const handleTimelineScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value); // Year float, e.g. 2026.8
    const baseYear = Math.floor(val);
    const dayOfYear = (val - baseYear) * 365.25;
    const date = new Date(Date.UTC(baseYear, 0, 1 + dayOfYear));
    setSimDate(date);
    setCurrentJD(getJulianDate(date));
    setIsLiveSynced(false);
  };

  const currentYearFloat = simDate.getUTCFullYear() + (simDate.getUTCMonth() * 30.5 + simDate.getUTCDate()) / 365.25;

  return (
    <div className={`nasa-eyes-root ${mode === 'background' ? 'nasa-eyes-background-mode' : ''}`}>
      {/* 1. Fullscreen 3D WebGL Canvas Layer */}
      <div
        ref={mountRef}
        className="nasa-eyes-canvas-container"
        role="img"
        aria-label="Interactive 3D Solar System Orrery with real-time JPL planetary ephemeris and NASA spacecraft trajectories"
      />

      {/* 2. Interactive Hover Reticle */}
      {mode !== 'background' && hoverEntity && (
        <div className="ne-hover-reticle" style={{ left: hoverEntity.x, top: hoverEntity.y }}>
          <div className="ne-reticle-box">
            <div className="ne-reticle-title">{hoverEntity.name}</div>
            <div className="ne-reticle-subtitle">{hoverEntity.subtitle}</div>
          </div>
          <div className="ne-reticle-arrow" />
        </div>
      )}

      {/* 3. HUD Overlay Layer */}
      {mode !== 'background' && (
        <div className="nasa-eyes-hud">
          {/* ═══ UNIFIED TOP HUD (Left: Telemetry, Center: Orrery Toolbar, Right: Flagship Action) ═══ */}
          <div className="nasa-eyes-top-hud">
            {/* Top-Left Telemetry Status Card (Non-blocking aerospace telemetry) */}
            <div className="ne-telemetry-hud-card nasa-eyes-interactive">
              <div className="ne-telemetry-hud-header">
                <span className="ne-live-pulse-dot" />
                <span className="ne-telemetry-label">JPL EPHEMERIS DE440</span>
                <span className="ne-telemetry-status">{isLiveSynced ? 'LIVE' : 'SIM'}</span>
              </div>
              <div className="ne-telemetry-body">
                <div style={{ color: '#94a3b8', fontSize: '9px', letterSpacing: '0.04em' }}>CURRENT TARGET</div>
                <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 900 }}>
                  {selectedEntity?.data.name.toUpperCase() || 'EARTH'}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '10px' }}>
                  DIST: {selectedEntity && 'distanceAU' in selectedEntity.data ? selectedEntity.data.distanceAU : '1.000 AU (149.6M km)'}
                </div>
              </div>
              <button
                className="ne-telemetry-drawer-btn"
                onClick={() => { setIsDrawerOpen(!isDrawerOpen); soundFx.playClick(850); }}
                title="Inspect Celestial Telemetry & Physics Dossier"
              >
                <Info size={12} />
                <span>{isDrawerOpen ? 'Close Telemetry Dossier' : 'Inspect Dossier'}</span>
              </button>

              {/* NASA Live APIs & Open Data Feeds Button */}
              <button
                className="ne-telemetry-drawer-btn"
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(249, 115, 22, 0.25))',
                  border: '1px solid rgba(56, 189, 248, 0.6)',
                  color: '#38bdf8',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
                onClick={() => {
                  setIsNasaLiveModalOpen(true);
                  soundFx.playSuccess();
                }}
                title="Open NASA Open Data & Satellite Observatory (api.nasa.gov, earthdata.nasa.gov)"
              >
                <Radio size={13} style={{ color: '#38bdf8' }} />
                <span>NASA Live Feeds &amp; APIs</span>
              </button>

              {/* Quick Outpost Build Action if Target is Moon or Mars */}
              {selectedEntity && (selectedEntity.data.name.toLowerCase().includes('moon') || selectedEntity.data.name.toLowerCase().includes('mars')) && (
                <button
                  onClick={() => {
                    const isM = selectedEntity.data.name.toLowerCase().includes('mars');
                    const dest = isM ? 'MARS' : 'MOON';
                    if (onBuildOutpost) onBuildOutpost(dest);
                    else if (onStartMission) onStartMission();
                    soundFx.playReactorStart();
                  }}
                  style={{
                    marginTop: '6px',
                    background: selectedEntity.data.name.toLowerCase().includes('mars')
                      ? 'linear-gradient(135deg, #ea580c, #c2410c)'
                      : 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '11px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                  title={`Launch Outpost Simulator directly on ${selectedEntity.data.name}`}
                >
                  <Rocket size={13} />
                  <span>Build Outpost Here ({selectedEntity.data.name.toLowerCase().includes('mars') ? 'Mars' : 'Moon'})</span>
                </button>
              )}
            </div>

            {/* ═══ FLOATING CELESTIAL CONTROLS TOOLBAR (Directly over 3D Canvas) ═══ */}
            <div className="ne-floating-celestial-toolbar nasa-eyes-interactive" role="toolbar" aria-label="Orrery Navigation Controls">
              {/* Row 1: Category Filter Chips + Search + Tools */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap', maxWidth: '100%' }}>
                <nav className="ne-category-bar" aria-label="Celestial Filters">
                  <button
                    className={`ne-category-tab ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => { setActiveCategory('all'); handleResetCamera(); }}
                    title="View Complete Solar System"
                  >
                    <Sun size={13} />
                    <span>Solar System</span>
                  </button>
                  <button
                    className={`ne-category-tab ${activeCategory === 'inner' ? 'active' : ''}`}
                    onClick={() => { setActiveCategory('inner'); flyToTarget('earth'); }}
                    title="Focus on Terrestrial Inner Worlds"
                  >
                    <Globe size={13} />
                    <span>Inner Worlds</span>
                  </button>
                  <button
                    className={`ne-category-tab ${activeCategory === 'satellites' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory('satellites');
                      flyToTarget('earth');
                      camDistanceRef.current = 15;
                      soundFx.playTelemetryChirp();
                    }}
                    title="Explore Earth's Orbital Satellite Fleet (ISS, Landsat, Hubble, PACE, SWOT, GOES)"
                  >
                    <Satellite size={13} />
                    <span>Earth &amp; Satellites</span>
                  </button>
                  <button
                    className={`ne-category-tab ${selectedEntity?.data.id === 'moon' ? 'active' : ''}`}
                    onClick={() => flyToTarget('moon')}
                    title="Focus on the Moon (Target for Artemis Base Camp)"
                  >
                    <span>🌙 Moon</span>
                  </button>
                  <button
                    className={`ne-category-tab ${selectedEntity?.data.id === 'mars' ? 'active' : ''}`}
                    onClick={() => flyToTarget('mars')}
                    title="Focus on Mars (Target for Jezero Crater Outpost)"
                  >
                    <span>🔴 Mars</span>
                  </button>
                  <button
                    className={`ne-category-tab ${activeCategory === 'outer' ? 'active' : ''}`}
                    onClick={() => { setActiveCategory('outer'); flyToTarget('jupiter'); }}
                    title="Focus on Outer Gas & Ice Giants"
                  >
                    <Sparkles size={13} />
                    <span>Gas Giants</span>
                  </button>
                  <button
                    className={`ne-category-tab ${activeCategory === 'fleet' ? 'active' : ''}`}
                    onClick={() => { setActiveCategory('fleet'); flyToTarget('iss'); }}
                    title="Track Active Spacecraft Fleet & Probes"
                  >
                    <Satellite size={13} />
                    <span>Fleet</span>
                  </button>
                  <button
                    className={`ne-category-tab ${isStoriesModalOpen ? 'active' : ''}`}
                    onClick={() => { setIsStoriesModalOpen(!isStoriesModalOpen); soundFx.playClick(800); }}
                    title="Curated NASA Guided Expeditions"
                  >
                    <Rocket size={13} />
                    <span>Tours</span>
                  </button>
                </nav>

                {/* Central Search Bar */}
                <div className="ne-search-wrapper" style={{ maxWidth: '240px' }}>
                  <div className="ne-search-input-box" style={{ borderRadius: '9999px', padding: '5px 12px' }}>
                    <Search size={13} style={{ color: '#38bdf8' }} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search... (/)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                      style={{ fontSize: '11.5px' }}
                    />
                    <span className="ne-search-key-badge" style={{ padding: '1px 5px', fontSize: '10px' }}>/</span>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isSearchFocused && searchResults.length > 0 && (
                    <div className="ne-search-dropdown">
                      {searchResults.map((res) => (
                        <div
                          key={res.id}
                          className="ne-search-result-item"
                          onClick={() => {
                            flyToTarget(res.id);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                        >
                          <div className="ne-search-item-left">
                            <span>{res.icon}</span>
                            <strong style={{ fontSize: '12px' }}>{res.name}</strong>
                          </div>
                          <span className="ne-search-item-badge">{res.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Camera Reset & Fullscreen Controls */}
                <div className="ne-toolbar-quick-tools">
                  <button
                    className="ne-btn-icon"
                    onClick={handleResetCamera}
                    title="Reset Camera to Solar System Overview"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    className="ne-btn-icon"
                    onClick={() => {
                      if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(() => { });
                      } else {
                        document.exitFullscreen().catch(() => { });
                      }
                    }}
                    title="Toggle Fullscreen Canvas"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              {/* Row 2: Sub-toolbar: Active Earth Satellite Fleet Selector */}
              {activeCategory === 'satellites' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 14px',
                    background: 'rgba(9, 16, 36, 0.96)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '9999px',
                    border: '1.5px solid rgba(56, 189, 248, 0.45)',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.65), 0 0 15px rgba(56, 189, 248, 0.25)',
                    animation: 'neFadeIn 0.25s ease-out',
                  }}
                >
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', padding: '0 4px', textTransform: 'uppercase', fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Satellite size={12} />
                    <span>Earth Fleet:</span>
                  </span>
                  {[
                    { id: 'iss', short: 'ISS' },
                    { id: 'hubble', short: 'Hubble' },
                    { id: 'landsat-9', short: 'Landsat 9' },
                    { id: 'pace', short: 'PACE' },
                    { id: 'swot', short: 'SWOT' },
                    { id: 'grace-fo', short: 'GRACE-FO' },
                    { id: 'goes-16', short: 'GOES-16' },
                    { id: 'tiangong', short: 'Tiangong' },
                  ].map((satMeta) => {
                    const sat = SPACE_STATIONS.find((s) => s.id === satMeta.id);
                    if (!sat) return null;
                    const isCur = selectedEntity?.data.id === sat.id;
                    return (
                      <button
                        key={sat.id}
                        onClick={() => {
                          flyToTarget(sat.id);
                          soundFx.playClick(900);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          border: isCur ? '1.5px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.2)',
                          background: isCur ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: isCur ? '#38bdf8' : '#e2e8f0',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                          boxShadow: isCur ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sat.color }} />
                        <span>{satMeta.short}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Flagship Quick Trigger Button (Shown on home/briefing, hidden on explore canvas to avoid toolbar overlap) */}
            {mode !== 'explore' && (
              <div className="ne-flagship-cta-bar nasa-eyes-interactive">
                <button
                  onClick={() => {
                    setIsDestModalOpen(true);
                    soundFx.playReactorStart();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#ffffff',
                    border: '1.5px solid rgba(255, 255, 255, 0.65)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 0 16px rgba(249, 115, 22, 0.6), 0 4px 12px rgba(0,0,0,0.5)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  title="Start Outpost Mission (No login required - 100% Guest Mode)"
                >
                  <Rocket size={15} />
                  <span>START LEARNING</span>
                </button>
              </div>
            )}
          </div>

          {/* ═══ FLAGSHIP HOME HERO OVERLAY (Visible on first load in home mode, dismissible) ═══ */}
          {mode !== 'explore' && !isHeroDismissed && (
            <div className="ne-home-hero-overlay nasa-eyes-interactive">
              <div className="ne-home-hero-card">
                <button
                  className="ne-home-hero-close"
                  onClick={() => {
                    setIsHeroDismissed(true);
                    soundFx.playClick(700);
                  }}
                  title="Dismiss hero banner and explore 3D Solar System"
                >
                  <X size={16} />
                </button>

                <div className="ne-home-hero-badge">
                  <Sparkles size={13} style={{ color: '#fbbf24' }} />
                  <span>NASA SPACE APPS 2026 • FLAGSHIP TRAINER</span>
                </div>

                <h1 className="ne-home-hero-title">
                  Junior Astronaut Mission Trainer
                </h1>

                <p className="ne-home-hero-tagline">
                  Keep your crew alive on the Moon or Mars!
                </p>

                <p className="ne-home-hero-desc">
                  Command Artemis Base Camp or Jezero Crater Outpost. Balance Power, Oxygen, Water, Food, Radiation Shielding, and Crew Morale against solar flares, dust storms, and lunar nights.
                </p>

                <div className="ne-home-hero-actions">
                  <button
                    className="ne-home-hero-primary-btn"
                    onClick={() => {
                      setIsDestModalOpen(true);
                      soundFx.playReactorStart();
                    }}
                    title="Start your Lunar or Martian outpost mission (Guest Mode enabled - zero login required)"
                  >
                    <Rocket size={18} />
                    <span>START LEARNING: BUILD YOUR OUTPOST</span>
                  </button>

                  <button
                    className="ne-home-hero-secondary-btn"
                    onClick={() => {
                      setIsHeroDismissed(true);
                      soundFx.playClick(800);
                    }}
                  >
                    Explore Solar System First
                  </button>
                </div>

                <div className="ne-home-hero-footer">
                  <span>⚡ 100% Free Guest Mode</span>
                  <span>•</span>
                  <span>🔬 NASA Bioastronautics Data</span>
                  <span>•</span>
                  <span>🏆 Ages 10–16</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ FLOATING OUTPOST PILL WHEN MOON OR MARS IS TARGETED ═══ */}
          {selectedEntity && (selectedEntity.data.name.toLowerCase().includes('moon') || selectedEntity.data.name.toLowerCase().includes('mars')) && (
            <div className="ne-selected-body-outpost-pill nasa-eyes-interactive">
              <button
                onClick={() => {
                  const isM = selectedEntity.data.name.toLowerCase().includes('mars');
                  const dest = isM ? 'MARS' : 'MOON';
                  if (onBuildOutpost) onBuildOutpost(dest);
                  else if (onStartMission) onStartMission();
                  soundFx.playReactorStart();
                }}
                className="ne-selected-body-outpost-btn"
                title={`Establish outpost on ${selectedEntity.data.name}`}
              >
                <Rocket size={15} />
                <span>{selectedEntity.data.name.toUpperCase()} DETECTED — BUILD OUTPOST HERE</span>
              </button>
            </div>
          )}

          {/* ═══ FEATURED STORIES & TOURS MODAL (NASA Eyes Scrollytelling) ═══ */}
          {isStoriesModalOpen && (
            <div className="ne-stories-modal nasa-eyes-interactive">
              <div className="ne-stories-header">
                <div className="ne-stories-title">
                  <Rocket size={16} style={{ color: '#38bdf8' }} />
                  <span>Featured NASA Tours</span>
                </div>
                <button
                  className="ne-drawer-close-btn"
                  onClick={() => setIsStoriesModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="ne-stories-list">
                <div
                  className="ne-story-item"
                  onClick={() => {
                    flyToTarget('earth');
                    setIsStoriesModalOpen(false);
                    handleReadAloud('Artemis program returns humanity to the Lunar South Pole to establish permanent Shackleton Base.');
                  }}
                >
                  <div className="ne-story-item-title">
                    <span>1. Artemis Lunar Return</span>
                    <span style={{ color: '#38bdf8', fontSize: '11px' }}>Moonbase</span>
                  </div>
                  <div className="ne-story-item-desc">
                    Track the human expedition from Earth orbit to Lunar Gateway and the Shackleton Crater south polar base.
                  </div>
                </div>

                <div
                  className="ne-story-item"
                  onClick={() => {
                    flyToTarget('mars');
                    setIsStoriesModalOpen(false);
                    handleReadAloud('Perseverance Rover explores ancient lakebeds in Jezero crater seeking signs of ancient microbial life.');
                  }}
                >
                  <div className="ne-story-item-title">
                    <span>2. Mars Jezero Astrobiology</span>
                    <span style={{ color: '#f43f5e', fontSize: '11px' }}>Perseverance</span>
                  </div>
                  <div className="ne-story-item-desc">
                    Inspect the Mars 2020 landing site, MOXIE oxygen generation, and rock sample caching.
                  </div>
                </div>

                <div
                  className="ne-story-item"
                  onClick={() => {
                    flyToTarget('parker-solar-probe');
                    setIsStoriesModalOpen(false);
                    handleReadAloud('Parker Solar Probe dives directly into the Sun’s fiery corona at 692,000 kilometers per hour.');
                  }}
                >
                  <div className="ne-story-item-title">
                    <span>3. Touching the Sun</span>
                    <span style={{ color: '#f97316', fontSize: '11px' }}>Parker Probe</span>
                  </div>
                  <div className="ne-story-item-desc">
                    Experience extreme heliophysics inside the solar corona protected by a carbon-composite heat shield.
                  </div>
                </div>

                <div
                  className="ne-story-item"
                  onClick={() => {
                    flyToTarget('voyager-1');
                    setIsStoriesModalOpen(false);
                    handleReadAloud('Voyager 1 has traversed over 24 billion kilometers into interstellar space beyond the solar bubble.');
                  }}
                >
                  <div className="ne-story-item-title">
                    <span>4. Interstellar Voyage</span>
                    <span style={{ color: '#34d399', fontSize: '11px' }}>Voyager 1</span>
                  </div>
                  <div className="ne-story-item-desc">
                    Travel 24.4 billion kilometers beyond the heliopause into the cosmic void carrying the Golden Record.
                  </div>
                </div>

                <div
                  className="ne-story-item"
                  onClick={() => {
                    flyToTarget('jwst');
                    setIsStoriesModalOpen(false);
                    handleReadAloud('James Webb Space Telescope observes the cosmic dawn from Lagrange Point 2.');
                  }}
                >
                  <div className="ne-story-item-title">
                    <span>5. Cosmic Dawn at L2</span>
                    <span style={{ color: '#eab308', fontSize: '11px' }}>JWST</span>
                  </div>
                  <div className="ne-story-item-desc">
                    Peer 13.5 billion years into the past with gold hexagonal mirrors observing first-light galaxies.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ CONTEXTUAL INSPECTION DRAWER (Authentic NASA Eyes Panel) ═══ */}
          {isDrawerOpen && selectedEntity && (
            <aside className="ne-side-drawer nasa-eyes-interactive" aria-label="Target Inspector">
              <div className="ne-sheet-handle" />
              {/* Drawer Header */}
              <div className="ne-drawer-header">
                <div className="ne-drawer-title-row">
                  <div className="ne-drawer-target-title">
                    <span>{'emoji' in selectedEntity.data ? selectedEntity.data.emoji : '🛰️'}</span>
                    <span>{selectedEntity.data.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className={`ne-btn-icon ${isTargetLocked ? 'active' : ''}`}
                      onClick={() => setIsTargetLocked(!isTargetLocked)}
                      title={isTargetLocked ? 'Target Camera Locked' : 'Lock Camera on Target'}
                    >
                      <Crosshair size={14} />
                    </button>
                    <button
                      className="ne-drawer-close-btn"
                      onClick={() => setIsDrawerOpen(false)}
                      title="Close Inspector"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Real-time Telemetry Strip */}
                <div className="ne-telemetry-strip">
                  <div className="ne-telemetry-cell">
                    <span className="ne-telemetry-label">Sun Distance</span>
                    <span className="ne-telemetry-value">
                      {'actualAU' in selectedEntity.data ? `${selectedEntity.data.actualAU} AU` : '1.00 AU'}
                    </span>
                  </div>
                  <div className="ne-telemetry-cell">
                    <span className="ne-telemetry-label">Orbital Velocity</span>
                    <span className="ne-telemetry-value">
                      {'orbitalVelocityKms' in selectedEntity.data
                        ? selectedEntity.data.orbitalVelocityKms
                        : 'velocityKms' in selectedEntity.data
                          ? `${selectedEntity.data.velocityKms} km/s`
                          : '30.0 km/s'}
                    </span>
                  </div>
                  <div className="ne-telemetry-cell">
                    <span className="ne-telemetry-label">Light Delay</span>
                    <span className="ne-telemetry-value">
                      {'actualAU' in selectedEntity.data
                        ? `${(selectedEntity.data.actualAU * 8.3).toFixed(1)} Min`
                        : '1.2 Sec'}
                    </span>
                  </div>
                </div>

                {/* Connected Step 1 Prerequisite Badge */}
                {'id' in selectedEntity.data && ['earth', 'moon', 'mars', 'jupiter'].includes(selectedEntity.data.id.toLowerCase()) && (
                  <div
                    style={{
                      margin: '10px 14px 4px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', fontWeight: 800 }}>
                        STEP 1: PREREQUISITE BRIEFING
                      </div>
                      <div style={{ fontSize: '11px', color: '#f8fafc', fontWeight: 600 }}>
                        {selectedEntity.data.id.toLowerCase() === 'earth' && 'Milestone #1: Earth Systems & LEO'}
                        {selectedEntity.data.id.toLowerCase() === 'moon' && 'Milestone #2: Artemis Lunar Base'}
                        {selectedEntity.data.id.toLowerCase() === 'mars' && 'Milestone #3: Martian Entry (EDL)'}
                        {selectedEntity.data.id.toLowerCase() === 'jupiter' && 'Milestone #4: Deep Space Cosmic Frontier'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundFx.playClick(850);
                        if (onOpenLearningHub) {
                          onOpenLearningHub('OR_GRAPH');
                        }
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        border: '1px solid #38bdf8',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Dossier Stacks ➔
                    </button>
                  </div>
                )}
              </div>

              {/* Tabs Navigation */}
              <div className="ne-drawer-tabs">
                <button
                  className={`ne-drawer-tab ${drawerTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`ne-drawer-tab ${drawerTab === 'earthdata' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('earthdata')}
                >
                  NASA Earthdata
                </button>
                <button
                  className={`ne-drawer-tab ${drawerTab === 'indepth' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('indepth')}
                >
                  In Depth
                </button>
                <button
                  className={`ne-drawer-tab ${drawerTab === 'numbers' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('numbers')}
                >
                  By Numbers
                </button>
                <button
                  className={`ne-drawer-tab ${drawerTab === 'missions' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('missions')}
                >
                  Missions
                </button>
                <button
                  className={`ne-drawer-tab ${drawerTab === 'quiz' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('quiz')}
                >
                  Cadet Quiz (+25 🪙)
                </button>
                <button
                  className={`ne-drawer-tab ${drawerTab === 'compare' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('compare')}
                >
                  Compare
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="ne-drawer-content">
                {/* TAB 1: OVERVIEW */}
                {drawerTab === 'overview' && (
                  <>
                    <div className="ne-drawer-hero-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                          {'zone' in selectedEntity.data ? selectedEntity.data.zone : 'Earth Orbital Laboratory'}
                        </span>
                        <button
                          className="ne-btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '10.5px' }}
                          onClick={() => handleReadAloud('funFact' in selectedEntity.data ? selectedEntity.data.funFact : ('description' in selectedEntity.data ? selectedEntity.data.description : selectedEntity.data.missionObjective))}
                          title="Read Aloud with Houston Capcom Voice"
                        >
                          <Volume2 size={12} />
                          <span>Listen</span>
                        </button>
                      </div>

                      <p className="ne-narrative-text">
                        {'funFact' in selectedEntity.data ? selectedEntity.data.funFact : ('description' in selectedEntity.data ? selectedEntity.data.description : selectedEntity.data.missionObjective)}
                      </p>

                      {/* What this does for Earth & Humanity */}
                      {'whatItDoesForEarth' in selectedEntity.data && selectedEntity.data.whatItDoesForEarth && (
                        <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '10.5px', color: '#34d399', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Globe size={12} />
                            <span>How This Helps People on Earth (NASA Space Place)</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#ecfdf5', lineHeight: 1.45 }}>
                            {selectedEntity.data.whatItDoesForEarth}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick STEM Navigation Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        className="ne-btn-secondary"
                        style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => setDrawerTab('earthdata')}
                      >
                        <Globe size={13} style={{ color: '#38bdf8' }} />
                        <span>NASA Earthdata</span>
                      </button>

                      <button
                        className="ne-btn-secondary"
                        style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
                        onClick={() => setDrawerTab('quiz')}
                      >
                        <Award size={13} />
                        <span>Cadet Quiz (+25 🪙)</span>
                      </button>
                    </div>

                    {/* Contextual Website Elements Actions */}
                    <div className="ne-website-actions-card">
                      <div className="ne-website-actions-title">
                        <Zap size={13} />
                        <span>Jr_AstroCamp Integrated Experiences</span>
                      </div>

                      {(selectedEntity.data.id === 'moon' || selectedEntity.data.id === 'mars') && (
                        <button
                          className="ne-action-link-btn"
                          style={{
                            background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(234,88,12,0.15))',
                            border: '1.5px solid rgba(249,115,22,0.6)',
                            color: '#fed7aa',
                            fontWeight: 700,
                            padding: '10px 14px',
                            marginBottom: '6px',
                          }}
                          onClick={() => {
                            if (onBuildOutpost) {
                              onBuildOutpost(selectedEntity.data.id === 'moon' ? 'MOON' : 'MARS');
                            } else if (onStartMission) {
                              onStartMission();
                            }
                          }}
                        >
                          <span>🏗️ Start Mission: Build Outpost on {selectedEntity.data.name} [FLAGSHIP]</span>
                          <ChevronRight size={14} />
                        </button>
                      )}

                      {selectedEntity.data.id === 'mars' && (
                        <>
                          {onOpenMarsEDL && (
                            <button className="ne-action-link-btn" onClick={onOpenMarsEDL}>
                              <span>🔴 Launch Mars Entry, Descent & Landing Simulator</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                          {onOpenRover && (
                            <button className="ne-action-link-btn" onClick={onOpenRover}>
                              <span>🚜 Deploy Surface Rover Sortie (Jezero Crater)</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </>
                      )}

                      {selectedEntity.data.id === 'earth' && (
                        <>
                          {onOpenExpedition && (
                            <button className="ne-action-link-btn" onClick={onOpenExpedition}>
                              <span>🚀 Launch Earth-to-Moon Apollo/Artemis Flight</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                          {onOpenMultiplayerLobby && (
                            <button className="ne-action-link-btn" onClick={onOpenMultiplayerLobby}>
                              <span>👥 Multiplayer Flight Crew Command Room</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </>
                      )}

                      {selectedEntity.data.id === 'iss' && onOpenTelemetry && (
                        <button className="ne-action-link-btn" onClick={onOpenTelemetry}>
                          <span>📊 Open Live NASA Deep Space Network Telemetry</span>
                          <ChevronRight size={14} />
                        </button>
                      )}

                      {onOpenLearningHub && (
                        <button className="ne-action-link-btn" onClick={() => onOpenLearningHub('NOTEBOOK')}>
                          <span>📖 Open Handwritten AstroCamp Field Notebook</span>
                          <ChevronRight size={14} />
                        </button>
                      )}

                      {onOpenCampaign && (
                        <button className="ne-action-link-btn" onClick={onOpenCampaign}>
                          <span>🎮 View 76 Real NASA Flight Missions</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* TAB: NASA EARTHDATA & SCIENCE SENSORS */}
                {drawerTab === 'earthdata' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Header info */}
                    <div className="ne-drawer-hero-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'monospace', fontWeight: 800 }}>
                          NASA EARTH SYSTEM OBSERVATORY
                        </span>
                        <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.8)', padding: '2px 6px', borderRadius: '4px' }}>
                          earthdata.nasa.gov
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {'whatItDoesForEarth' in selectedEntity.data && selectedEntity.data.whatItDoesForEarth
                          ? selectedEntity.data.whatItDoesForEarth
                          : 'NASA monitors Earth’s atmosphere, oceans, land, and ice to protect our home planet and ensure astronaut survivability in deep space.'}
                      </p>
                    </div>

                    {/* Scientific Instruments Payload */}
                    {'nasaInstruments' in selectedEntity.data && selectedEntity.data.nasaInstruments && selectedEntity.data.nasaInstruments.length > 0 && (
                      <div className="ne-drawer-hero-card">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                          🔬 Scientific Sensor Payload
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {selectedEntity.data.nasaInstruments.map((inst, idx) => (
                            <div key={idx} style={{ padding: '8px 10px', background: 'rgba(2, 6, 23, 0.6)', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: '12px', color: '#ffffff' }}>{inst.acronym}</strong>
                                <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{inst.name}</span>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.35 }}>{inst.purpose}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Earth Observation Data Products */}
                    {'earthdataProducts' in selectedEntity.data && selectedEntity.data.earthdataProducts && (
                      <div className="ne-drawer-hero-card">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase' }}>
                          📊 NASA Earthdata Science Products
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {selectedEntity.data.earthdataProducts.map((prod, idx) => (
                            <span key={idx} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86efac' }}>
                              {prod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* If Earth: Show Global Vital Signs */}
                    {selectedEntity.data.id === 'earth' && (
                      <div className="ne-drawer-hero-card">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                          🌍 Planetary Vital Signs (earthdata.nasa.gov)
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {NASA_EARTH_VITAL_SIGNS.slice(0, 4).map((sign) => (
                            <div key={sign.id} style={{ padding: '8px 10px', background: 'rgba(2, 6, 23, 0.6)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{sign.metric}</div>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>{sign.value}</div>
                              <div style={{ fontSize: '9.5px', color: sign.trend === 'up' ? '#f87171' : '#60a5fa' }}>{sign.changeRate}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Links to NASA Platforms */}
                    <div className="ne-drawer-hero-card">
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>
                        Official NASA Science Portals:
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <a
                          href={'earthdataUrl' in selectedEntity.data && selectedEntity.data.earthdataUrl ? selectedEntity.data.earthdataUrl : 'https://earthdata.nasa.gov/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#38bdf8', fontSize: '11.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(2, 6, 23, 0.5)', borderRadius: '6px' }}
                        >
                          <span>NASA Earthdata (earthdata.nasa.gov)</span>
                          <ExternalLink size={12} />
                        </a>
                        <a
                          href={'spacePlaceUrl' in selectedEntity.data && selectedEntity.data.spacePlaceUrl ? selectedEntity.data.spacePlaceUrl : 'https://spaceplace.nasa.gov/menu/earth/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#38bdf8', fontSize: '11.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(2, 6, 23, 0.5)', borderRadius: '6px' }}
                        >
                          <span>NASA Space Place Educational Portal</span>
                          <ExternalLink size={12} />
                        </a>
                        <a
                          href="https://data.nasa.gov/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#38bdf8', fontSize: '11.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(2, 6, 23, 0.5)', borderRadius: '6px' }}
                        >
                          <span>NASA Open Data Catalog (data.nasa.gov)</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                {drawerTab === 'indepth' && (
                  <>
                    {'interiorLayers' in selectedEntity.data && (
                      <div className="ne-drawer-hero-card">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#ffffff' }}>Internal Structure &amp; Core</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedEntity.data.interiorLayers.map((layer, idx) => (
                            <div key={idx} style={{ padding: '8px', background: 'rgba(2, 6, 23, 0.6)', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                                <span>{layer.name}</span>
                                <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{layer.depth}</span>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '3px' }}>{layer.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {'atmosphereGases' in selectedEntity.data && (
                      <div className="ne-drawer-hero-card">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#ffffff' }}>Atmosphere Composition</h4>
                        <div className="ne-atmosphere-bar-container">
                          <div className="ne-bar-track">
                            {selectedEntity.data.atmosphereGases.map((gas, idx) => (
                              <div key={idx} className="ne-bar-seg" style={{ width: `${gas.pct}%`, background: gas.color }} />
                            ))}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                            {selectedEntity.data.atmosphereGases.map((gas, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#cbd5e1' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: gas.color }} />
                                <span>{gas.name}: <strong>{gas.pct}%</strong></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {'specs' in selectedEntity.data && (
                      <div className="ne-drawer-hero-card">
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#ffffff' }}>Technical Specifications</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {selectedEntity.data.specs.map((s, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)', paddingBottom: '4px' }}>
                              <span style={{ color: '#94a3b8' }}>{s.label}</span>
                              <strong style={{ color: '#ffffff' }}>{s.value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* TAB 3: BY THE NUMBERS */}
                {drawerTab === 'numbers' && 'diameterKm' in selectedEntity.data && (
                  <div className="ne-drawer-hero-card">
                    <table className="ne-numbers-table">
                      <tbody>
                        <tr>
                          <td className="ne-numbers-label">Equatorial Diameter</td>
                          <td className="ne-numbers-value">{selectedEntity.data.diameterKm}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Surface Gravity</td>
                          <td className="ne-numbers-value">{selectedEntity.data.gravityMs2}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Orbital Period (Year)</td>
                          <td className="ne-numbers-value">{selectedEntity.data.orbitalPeriod}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Solar Day Length</td>
                          <td className="ne-numbers-value">{selectedEntity.data.dayLength}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Surface Temperature</td>
                          <td className="ne-numbers-value">{selectedEntity.data.surfaceTemp}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Known Moons</td>
                          <td className="ne-numbers-value">{selectedEntity.data.moons}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Total Mass</td>
                          <td className="ne-numbers-value">{selectedEntity.data.massKg}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Axial Tilt</td>
                          <td className="ne-numbers-value">{selectedEntity.data.axialTilt}</td>
                        </tr>
                        <tr>
                          <td className="ne-numbers-label">Orbital Velocity</td>
                          <td className="ne-numbers-value">{selectedEntity.data.orbitalVelocityKms}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 4: MISSIONS TO TARGET */}
                {drawerTab === 'missions' && (
                  <div className="ne-missions-grid">
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                      NASA Flight Missions to {selectedEntity.data.name}
                    </div>
                    {ALL_76_NASA_MISSIONS.filter((m) => {
                      const tid = selectedEntity.data.id.toLowerCase();
                      const tname = selectedEntity.data.name.toLowerCase();
                      if (tid === 'mars') return m.destination === 'MARS' || m.era === 'MARS_FLEET' || m.destinationName.toLowerCase().includes('martian');
                      if (tid === 'earth' || tid === 'iss' || tid === 'tiangong' || tid === 'hubble') return m.destination === 'EARTH_ORBIT' || m.era === 'SHUTTLE_ISS' || m.era === 'PIONEERS';
                      if (tid === 'moon' || tid === 'lunar-gateway') return m.destination === 'MOON' || m.era === 'LUNAR_APOLLO' || m.era === 'ARTEMIS_ERA';
                      if (tid === 'jupiter' || tid === 'saturn' || tid === 'uranus' || tid === 'neptune') return m.era === 'DEEP_WORLDS' || m.name.toLowerCase().includes(tid) || m.destinationName.toLowerCase().includes(tid);
                      if (tid === 'sun' || tid === 'parker-solar-probe') return m.era === 'COSMIC_SENTINELS' || m.name.toLowerCase().includes('solar') || m.name.toLowerCase().includes('parker');
                      return m.destinationName.toLowerCase().includes(tname) || m.name.toLowerCase().includes(tname);
                    }).slice(0, 8).map((mission) => (
                      <div key={mission.id} className="ne-mission-card">
                        <div className="ne-mission-info">
                          <span className="ne-mission-name">{mission.name} ({mission.launchYear})</span>
                          <span className="ne-mission-meta">{mission.tagline}</span>
                        </div>
                        {onOpenCampaign && (
                          <button
                            className="ne-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={onOpenCampaign}
                          >
                            Play
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB: CADET QUIZ (+25 ASTRO-COINS) */}
                {drawerTab === 'quiz' && (
                  <div className="ne-drawer-hero-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                          NASA Space Place Discovery Challenge
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80', background: 'rgba(34, 197, 94, 0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                        +25 Astro-Coins 🪙
                      </span>
                    </div>

                    {(() => {
                      const qData = ('quiz' in selectedEntity.data && selectedEntity.data.quiz)
                        ? selectedEntity.data.quiz
                        : {
                            question: `What is the primary scientific mission of ${selectedEntity.data.name}?`,
                            options: [
                              'Planetary exploration and scientific data gathering',
                              'Deep space mining',
                              'Space tourist cruises',
                              'Asteroid deflection test'
                            ],
                            correctIndex: 0,
                            explanation: `NASA explores ${selectedEntity.data.name} to expand human scientific knowledge of solar system astrophysics and geology!`,
                          };

                      const ansState = quizAnsweredState[selectedEntity.data.id];

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.45 }}>
                            {qData.question}
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {qData.options.map((option, idx) => {
                              const isSelected = ansState?.selected === idx;
                              const isCorrectOpt = qData.correctIndex === idx;
                              let bg = 'rgba(15, 23, 42, 0.8)';
                              let border = '1px solid rgba(148, 163, 184, 0.2)';
                              let color = '#e2e8f0';

                              if (ansState) {
                                if (isCorrectOpt) {
                                  bg = 'rgba(34, 197, 94, 0.25)';
                                  border = '1.5px solid #22c55e';
                                  color = '#86efac';
                                } else if (isSelected && !ansState.isCorrect) {
                                  bg = 'rgba(239, 68, 68, 0.25)';
                                  border = '1.5px solid #ef4444';
                                  color = '#fca5a5';
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={Boolean(ansState?.isCorrect)}
                                  onClick={() => {
                                    const isCorr = idx === qData.correctIndex;
                                    setQuizAnsweredState((prev) => ({
                                      ...prev,
                                      [selectedEntity.data.id]: { selected: idx, isCorrect: isCorr },
                                    }));
                                    if (isCorr) {
                                      soundFx.playSuccess();
                                      if (currentUser) {
                                        authService.awardCoins(currentUser.id, 25);
                                        const updated = authService.getCurrentUser();
                                        if (updated && onUserUpdate) onUserUpdate(updated);
                                        studentActivityService.logActivity({
                                          studentUsername: currentUser.username,
                                          studentFullName: currentUser.fullName || currentUser.username,
                                          studentAvatar: currentUser.avatar || '👨‍🚀',
                                          characterName: currentUser.selectedCharacterId || 'Cadet',
                                          actionType: 'EXAM_PASSED',
                                          missionTitle: `Discovery Quiz: ${selectedEntity.data.name}`,
                                          destination: 'EARTH',
                                          scoreXp: 50,
                                          coinsEarned: 25,
                                          outcomeStatus: 'EXCELLENT',
                                          notes: `Solved NASA Space Place quiz for ${selectedEntity.data.name}`,
                                        });
                                      }
                                    } else {
                                      soundFx.playClick(320);
                                    }
                                  }}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: bg,
                                    border,
                                    color,
                                    fontSize: '12px',
                                    textAlign: 'left',
                                    cursor: ansState?.isCorrect ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    lineHeight: 1.35,
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <span>{option}</span>
                                  {ansState && isCorrectOpt && <Check size={14} style={{ color: '#4ade80' }} />}
                                </button>
                              );
                            })}
                          </div>

                          {ansState && (
                            <div
                              style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: ansState.isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                border: ansState.isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                fontSize: '12px',
                                lineHeight: 1.4,
                                color: ansState.isCorrect ? '#86efac' : '#fca5a5',
                              }}
                            >
                              <strong>{ansState.isCorrect ? '🎉 Correct! NASA Space Place Insight:' : '⚠️ Try again or inspect the science dossier!'}</strong>
                              <div style={{ marginTop: '4px' }}>{qData.explanation}</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB 5: COMPARE SIZE */}
                {drawerTab === 'compare' && 'diameterKm' in selectedEntity.data && (
                  <div className="ne-drawer-hero-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', color: '#ffffff' }}>Scale Comparison vs Earth</h4>
                    <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 16px 0' }}>
                      Visual scale comparison against Earth (12,742 km).
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', minHeight: '160px' }}>
                      {/* Target Body */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: `${Math.max(28, Math.min(140, selectedEntity.data.radius * 16 * compareScale))}px`,
                            height: `${Math.max(28, Math.min(140, selectedEntity.data.radius * 16 * compareScale))}px`,
                            borderRadius: '50%',
                            background: `#${selectedEntity.data.color.toString(16).padStart(6, '0')}`,
                            boxShadow: `0 0 20px #${selectedEntity.data.color.toString(16).padStart(6, '0')}66`,
                            transition: 'all 0.2s ease',
                          }}
                        />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>{selectedEntity.data.name}</span>
                        <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>{selectedEntity.data.diameterKm}</span>
                      </div>

                      <span style={{ fontSize: '18px', color: '#64748b' }}>vs</span>

                      {/* Earth Reference */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            width: `${48 * compareScale}px`,
                            height: `${48 * compareScale}px`,
                            borderRadius: '50%',
                            background: '#38bdf8',
                            boxShadow: '0 0 20px #38bdf866',
                            transition: 'all 0.2s ease',
                          }}
                        />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>Earth</span>
                        <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>12,742 km</span>
                      </div>
                    </div>

                    {/* Zoom scale slider */}
                    <div style={{ width: '100%', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                        <span>Visual Scale</span>
                        <span>{compareScale.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={compareScale}
                        onChange={(e) => setCompareScale(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#38bdf8' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* ═══ BOTTOM PLAYBACK & TIMELINE DOCK (Exact NASA Eyes Controls) ═══ */}
          <footer className="nasa-eyes-bottombar nasa-eyes-interactive">
            {/* Left Time & Ephemeris Controls */}
            <div className="ne-time-cluster">
              <div className="ne-time-display-box">
                <span className="ne-clock-utc">{simDate.toUTCString()}</span>
                <span className="ne-clock-jd">JD {currentJD.toFixed(4)}</span>
              </div>

              <button
                className="ne-now-btn"
                onClick={syncToNow}
                title="Return to real-world present time"
              >
                Now
              </button>

              {/* Transport Speed Buttons */}
              <div className="ne-time-transport">
                <button
                  className="ne-transport-btn"
                  onClick={() => handleStepDay(-1)}
                  title="Step backward 1 Earth Day"
                >
                  -1D
                </button>
                <button
                  className={`ne-transport-btn ${!isPlaying ? 'active' : ''}`}
                  onClick={() => { setIsPlaying(!isPlaying); soundFx.playClick(600); }}
                  title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  className="ne-transport-btn"
                  onClick={() => handleStepDay(1)}
                  title="Step forward 1 Earth Day"
                >
                  +1D
                </button>
                <button
                  className={`ne-transport-btn ${simSpeed === 10 ? 'active' : ''}`}
                  onClick={() => handleSetSpeed(10)}
                  title="10x Speed"
                >
                  10x
                </button>
                <button
                  className={`ne-transport-btn ${simSpeed === 100 ? 'active' : ''}`}
                  onClick={() => handleSetSpeed(100)}
                  title="100x Speed"
                >
                  100x
                </button>
                <button
                  className={`ne-transport-btn ${simSpeed === 1000 ? 'active' : ''}`}
                  onClick={() => handleSetSpeed(1000)}
                  title="1,000x Speed"
                >
                  1k
                </button>
              </div>
            </div>

            {/* Center Space-Time Scrubber */}
            <div className="ne-scrubber-container">
              <div className="ne-scrubber-track-box">
                <input
                  type="range"
                  min="1975"
                  max="2045"
                  step="0.05"
                  value={currentYearFloat}
                  onChange={handleTimelineScrub}
                  className="ne-slider-range"
                />
              </div>
              <div className="ne-scrubber-labels">
                <span>1975 (Viking / Apollo)</span>
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>{simDate.getUTCFullYear()}</span>
                <span>2045 (Interstellar Era)</span>
              </div>
            </div>

            {/* Right Display Layer Toggles */}
            <div className="ne-toggles-cluster" title="Solar System View Options">
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, padding: '0 6px', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                View options:
              </span>
              <button
                className={`ne-toggle-btn ${showOrbits ? 'active' : ''}`}
                onClick={() => { setShowOrbits(!showOrbits); soundFx.playClick(750); }}
                title="Show or hide planetary orbital paths around the Sun"
              >
                <span className="ne-toggle-led" />
                <span>Orbits</span>
              </button>

              <button
                className={`ne-toggle-btn ${showLabels ? 'active' : ''}`}
                onClick={() => { setShowLabels(!showLabels); soundFx.playClick(750); }}
                title="Show or hide high-contrast readable planet names and distance tags"
              >
                <span className="ne-toggle-led" />
                <span>Labels</span>
              </button>

              <button
                className={`ne-toggle-btn ${showSpacecraft ? 'active' : ''}`}
                onClick={() => { setShowSpacecraft(!showSpacecraft); soundFx.playClick(750); }}
                title="Show or hide human spacecraft fleet (ISS, Tiangong, Voyager, Parker Solar Probe)"
              >
                <span className="ne-toggle-led" />
                <span>Fleet</span>
              </button>

              <button
                className={`ne-toggle-btn ${showAsteroids ? 'active' : ''}`}
                onClick={() => { setShowAsteroids(!showAsteroids); soundFx.playClick(750); }}
                title="Show or hide Main Asteroid Belt rocks between Mars and Jupiter"
              >
                <span className="ne-toggle-led" />
                <span>Asteroids</span>
              </button>

              <button
                className={`ne-toggle-btn ${lightingMode === 'flood' ? 'active' : ''}`}
                onClick={() => { setLightingMode(lightingMode === 'sun' ? 'flood' : 'sun'); soundFx.playClick(800); }}
                title="Switch between realistic Solar Shadow Lighting and full Studio Floodlight"
              >
                <Sun size={12} />
                <span>{lightingMode === 'sun' ? 'Sunlight' : 'Flood'}</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* Flagship Clean Moon vs Mars Destination Selection Modal */}
      {mode !== 'background' && (
        <DestinationSelectionModal
          isOpen={isDestModalOpen}
          onClose={() => setIsDestModalOpen(false)}
          onSelectDestination={(dest, diff) => {
            if (onBuildOutpost) {
              onBuildOutpost(dest, diff);
            } else if (onStartMission) {
              onStartMission();
            }
          }}
        />
      )}

      {/* Real-Time NASA Live Observatory Modal (Open Data, Earthdata, APOD, NeoWs, Mars Weather) */}
      <NasaLiveObservatoryModal
        isOpen={isNasaLiveModalOpen}
        onClose={() => setIsNasaLiveModalOpen(false)}
        onSelectSatellite={(satId) => {
          setActiveCategory('satellites');
          flyToTarget(satId);
        }}
      />
    </div>
  );
};

export default LandingPage;
