// ============================================================
// NASA Jr_AstroCamp — Learning Stacks Flight Readiness Quizzes
// Quizzes testing comprehension after Video, Audio, Comic, or Game
// ============================================================

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  nasaRef: string;
}

export interface LearningQuiz {
  id: string;
  moduleId: string;
  title: string;
  subtitle: string;
  badgeEmoji: string;
  passingScore: number; // e.g. 2 out of 3
  rewardCoins: number;
  rewardAcademicPoints: number;
  questions: QuizQuestion[];
}

export const LEARNING_QUIZZES: Record<string, LearningQuiz> = {
  'quiz-earth-01': {
    id: 'quiz-earth-01',
    moduleId: 'earth-systems',
    title: 'Earth Systems & Spaceflight Physics Quiz',
    subtitle: 'Verify your mastery of orbital speed, atmospheric shielding, and ECLSS stoichiometry',
    badgeEmoji: '🌍',
    passingScore: 2,
    rewardCoins: 100,
    rewardAcademicPoints: 50,
    questions: [
      {
        id: 'earth-q1',
        question: 'What is the required orbital velocity for a spacecraft to maintain Low Earth Orbit (LEO)?',
        options: [
          'Approx. 1.2 km/s (4,320 km/h)',
          'Approx. 7.8 km/s (28,000 km/h)',
          'Approx. 11.2 km/s (40,320 km/h)',
          'Approx. 25.0 km/s (90,000 km/h)',
        ],
        correctIndex: 1,
        explanation: 'At LEO (~400 km altitude), gravity balances centripetal acceleration at roughly 7.8 km/s (Mach 23). Escape velocity to leave Earth entirely is 11.2 km/s.',
        nasaRef: 'NASA Human Spaceflight Orbital Mechanics Manual',
      },
      {
        id: 'earth-q2',
        question: 'Which atmospheric property protects life on Earth from lethal solar proton radiation and cosmic rays?',
        options: [
          'Convection clouds in the Troposphere',
          'Earth’s geodynamo Magnetosphere and Ozone layer',
          'The vacuum of the Exosphere',
          'Nitrogen gas in the Stratosphere',
        ],
        correctIndex: 1,
        explanation: 'Earth’s molten iron core creates a protective magnetic bubble (Magnetosphere) that deflects solar wind particles, while the Ozone layer absorbs ultraviolet (UV) radiation.',
        nasaRef: 'NASA Heliophysics Directorate',
      },
      {
        id: 'earth-q3',
        question: 'Under NASA BVAD stoichiometry, how much water does an astronaut consume daily, and how much is recovered on the ISS?',
        options: [
          'Consumes 10 L/day, recovers 20%',
          'Consumes 2.5 kg/day, recovers up to 98% via ECLSS',
          'Consumes 50 kg/day, zero recovery is possible in space',
          'Consumes 1.0 kg/day, recovers 50%',
        ],
        correctIndex: 1,
        explanation: 'Astronauts need ~2.5 kg of water daily. The ISS Environmental Control and Life Support System (ECLSS) purifies sweat, breath, and urine to recover over 98% of clean drinking water.',
        nasaRef: 'NASA BVAD TP-2015-218570',
      },
    ],
  },

  'quiz-moon-01': {
    id: 'quiz-moon-01',
    moduleId: 'lunar-gateway',
    title: 'Artemis Lunar Base & South Pole Engineering Quiz',
    subtitle: 'Demonstrate flight readiness in cryogenic ice harvesting and lunar night survival',
    badgeEmoji: '🌕',
    passingScore: 2,
    rewardCoins: 100,
    rewardAcademicPoints: 50,
    questions: [
      {
        id: 'moon-q1',
        question: 'Why has NASA selected the lunar South Pole (e.g. Shackleton Crater) for Artemis Base Camp?',
        options: [
          'It has the warmest surface temperatures on the Moon',
          'Permanently shadowed craters hold water ice, while rim peaks receive near-continuous sunlight',
          'It is the closest point to Mars orbital transit paths',
          'It has an atmosphere thick enough to support open-air breathing',
        ],
        correctIndex: 1,
        explanation: 'The South Pole offers water ice in frigid crater floors (-246°C) for fuel/oxygen and "Peaks of Eternal Light" for consistent solar electricity generation.',
        nasaRef: 'NASA Artemis Exploration Architecture',
      },
      {
        id: 'moon-q2',
        question: 'How long does a single lunar night last, and what technology solves the darkness power blackout?',
        options: [
          '12 hours; standard AA battery packs',
          '14 Earth days (354 hours); Kilopower nuclear fission Stirling reactor',
          '24 hours; diesel combustion generators',
          '48 hours; high-altitude wind windmills',
        ],
        correctIndex: 1,
        explanation: 'The lunar day-night cycle is 29.5 Earth days, meaning night lasts ~14 Earth days. With no sunlight for two weeks, NASA developed Kilopower fission reactors providing 10 kW continuous power.',
        nasaRef: 'NASA Glenn Kilopower Project',
      },
      {
        id: 'moon-q3',
        question: 'What is the surface gravity on the Moon compared to Earth?',
        options: [
          'Identical to Earth (9.8 m/s²)',
          'Zero gravity (0 m/s²)',
          'Approximately 1/6th of Earth gravity (1.62 m/s²)',
          'Twice as heavy as Earth (19.6 m/s²)',
        ],
        correctIndex: 2,
        explanation: 'Lunar gravity is 1.62 m/s² (~16.6% of Earth). A 60 kg astronaut weighs only 10 kg on the Moon, but their mass and inertia remain exactly 60 kg.',
        nasaRef: 'Apollo Lunar Surface Journal',
      },
    ],
  },

  'quiz-mars-01': {
    id: 'quiz-mars-01',
    moduleId: 'mars-frontier',
    title: 'Mars 2020 & Jezero Crater Expedition Quiz',
    subtitle: 'Verify knowledge of Martian atmospheric entry (EDL), biosignatures, and MOXIE oxygen',
    badgeEmoji: '🔴',
    passingScore: 2,
    rewardCoins: 100,
    rewardAcademicPoints: 50,
    questions: [
      {
        id: 'mars-q1',
        question: 'Why is the atmospheric landing sequence on Mars called the "7 Minutes of Terror"?',
        options: [
          'Because the rover must dodge volcanic lava from Olympus Mons',
          'Radio signals take 5–20 minutes to reach Earth, so the lander must autonomously brake from 20,000 km/h to zero without human aid',
          'Because Mars has a super-dense atmosphere with hurricane winds',
          'Because the parachutes catch fire from solar radiation',
        ],
        correctIndex: 1,
        explanation: 'Due to the speed of light delay across millions of kilometers, mission control cannot steer the lander live. Onboard flight computers autonomously pilot the heatshield, parachute, and Sky Crane.',
        nasaRef: 'NASA JPL EDL Flight Operations',
      },
      {
        id: 'mars-q2',
        question: 'What was the scientific objective of NASA testing MOXIE on the Perseverance rover?',
        options: [
          'Drilling for underground lava tunnels',
          'Generating pure breathable oxygen from atmospheric carbon dioxide (CO2)',
          'Testing liquid nitrogen rocket fuel',
          'Listening for subterranean seismic marsquakes',
        ],
        correctIndex: 1,
        explanation: 'MOXIE uses solid oxide electrolysis at 800°C to strip oxygen atoms from CO2 molecules in Mars air, proving future astronauts can generate their own breathing air and rocket oxidizer in-situ.',
        nasaRef: 'NASA STMD / MIT MOXIE Mission Debrief',
      },
      {
        id: 'mars-q3',
        question: 'What is a "Sol" on Mars, and how long is it compared to an Earth day?',
        options: [
          'A Mars year lasting 687 days',
          'A Martian solar day, lasting 24 hours, 39 minutes, and 35 seconds',
          'A short day lasting only 10 hours',
          'A unit measuring rover battery voltage',
        ],
        correctIndex: 1,
        explanation: 'One Martian solar rotation is called a Sol. It is approximately 39 minutes and 35 seconds longer than an Earth 24-hour day.',
        nasaRef: 'NASA Mars Science Laboratory Telemetry',
      },
    ],
  },

  'quiz-deep-space-01': {
    id: 'quiz-deep-space-01',
    moduleId: 'deep-space-frontier',
    title: 'Cosmic Frontier & Astrophysics Mastery Quiz',
    subtitle: 'Demonstrate expertise in gravitational slingshots, James Webb infrared optics, and ocean moons',
    badgeEmoji: '🪐',
    passingScore: 2,
    rewardCoins: 100,
    rewardAcademicPoints: 50,
    questions: [
      {
        id: 'deep-q1',
        question: 'How do space probes like Voyager and New Horizons travel billions of kilometers without giant fuel tanks?',
        options: [
          'Using nuclear warp drives',
          'Using planetary gravity assist (slingshots) to steal orbital momentum from moving giant planets',
          'They only float with solar wind sails',
          'Refueling at orbital gas stations on the Moon',
        ],
        correctIndex: 1,
        explanation: 'In a gravity assist, a probe swings behind a planet like Jupiter. The planet’s gravitational pull accelerates the spacecraft relative to the Sun, saving decades of flight time.',
        nasaRef: 'NASA Voyager Interstellar Mission & Orbital Mechanics',
      },
      {
        id: 'deep-q2',
        question: 'Why does the James Webb Space Telescope (JWST) observe primarily in the Infrared spectrum rather than optical light?',
        options: [
          'Infrared cameras are lighter to launch than regular cameras',
          'Cosmic expansion stretches (redshifts) light from the earliest distant stars into infrared wavelengths, which also penetrate cosmic dust clouds',
          'The Sun does not emit any infrared radiation',
          'To detect radio signals from neighboring civilizations',
        ],
        correctIndex: 1,
        explanation: 'Cosmological redshift stretches the light of the universe’s earliest galaxies into the infrared. Infrared also cuts through dense interstellar gas and dust shrouding baby star systems.',
        nasaRef: 'NASA Space Telescope Science Institute (STScI)',
      },
      {
        id: 'deep-q3',
        question: 'Why is Jupiter’s icy moon Europa a primary target in NASA’s search for extraterrestrial life?',
        options: [
          'It has breathable oxygen forests on its surface',
          'A subsurface liquid saltwater ocean lies beneath its ice crust, warmed by tidal flex heating',
          'It is composed entirely of solid gold and diamonds',
          'It was previously inhabited by an ancient rover',
        ],
        correctIndex: 1,
        explanation: 'Europa hides a deep global saltwater ocean containing more water than all of Earth’s oceans combined. NASA’s Europa Clipper is investigating if conditions could support microbial life.',
        nasaRef: 'NASA JPL Europa Clipper Mission',
      },
    ],
  },
};

