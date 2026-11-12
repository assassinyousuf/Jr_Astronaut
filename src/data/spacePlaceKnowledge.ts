// ============================================================
// NASA Jr_AstroCamp — Outer Space Discovery Knowledge Base
// Inspired by NASA Space Place (spaceplace.nasa.gov)
// Engineered to exceed with rich astrophysics, telemetry & ECLSS context
// ============================================================

export interface SpaceBodyTelemetry {
  distanceFromSun: string;
  orbitalPeriod: string;
  surfaceGravity: string;
  surfaceTempRange: string;
  atmosphereComposition: string;
  dayLength: string;
  moonsCount: number;
}

export interface ScienceModule {
  id: string;
  title: string;
  subtitle: string;
  heroImage: string;
  category: 'PLANET' | 'MOON' | 'DEEP_SPACE';
  telemetry: SpaceBodyTelemetry;
  overview: string;
  sections: {
    heading: string;
    body: string;
    didYouKnow: string;
    nasaSource: string;
  }[];
  interactiveTabs: {
    label: string;
    content: string;
  }[];
  nasaMissionsList: string[];
}

export const SPACE_DISCOVERY_MODULES: ScienceModule[] = [
  {
    id: 'earth-systems',
    title: 'Planet Earth: The Dynamic Water World',
    subtitle: 'The Goldilocks Zone, Atmospheric Shields & Human Home',
    heroImage: '/assets/planets/earth.png',
    category: 'PLANET',
    telemetry: {
      distanceFromSun: '149.6 Million km (1.0 AU)',
      orbitalPeriod: '365.25 Days',
      surfaceGravity: '9.807 m/s² (1.00 G)',
      surfaceTempRange: '-89°C to +57°C',
      atmosphereComposition: '78% Nitrogen, 21% Oxygen, 1% Argon/Trace',
      dayLength: '24 Hours (23h 56m Sidereal)',
      moonsCount: 1,
    },
    overview:
      'Earth is the third planet from the Sun and the only astronomical object known to harbor life. It is situated in the circumstellar habitable zone ("Goldilocks Zone"), allowing liquid surface water to exist for billions of years.',
    sections: [
      {
        heading: 'Atmospheric Layers & The Ozone Shield',
        body: 'Earth is protected by five major atmospheric layers: Troposphere (where all weather occurs and astronauts breathe), Stratosphere (housing the UV-absorbing ozone layer), Mesosphere (burning up meteors), Thermosphere (where the ISS orbits), and Exosphere merging into the vacuum of space. Space missions must calculate dynamic atmospheric drag (Max-Q) during ascent.',
        didYouKnow: 'The International Space Station orbits at ~400 km in the Thermosphere, traveling at 27,600 km/h and witnessing 16 sunrises every day!',
        nasaSource: 'NASA Earth Observatory & NASA Goddard Space Flight Center',
      },
      {
        heading: 'The Global Magnetic Dynamo (Magnetosphere)',
        body: 'Convection in Earth’s liquid iron outer core generates a geodynamo magnetic field extending tens of thousands of kilometers into space. This magnetosphere deflects lethal solar wind protons and coronal mass ejections (CMEs), channeling charged particles toward the poles to ignite the Aurora Borealis and Australis.',
        didYouKnow: 'Without our magnetic field, solar radiation would have stripped away Earth’s oceans and atmosphere, leaving it dry and sterile like Mars.',
        nasaSource: 'NASA THEMIS & MMS Heliophysics Fleet',
      },
      {
        heading: 'The Hydrological Cycle & Closed-Loop Stoichiometry',
        body: 'Earth naturally recycles every molecule of water through evaporation, condensation, and precipitation. In human spaceflight, astronauts cannot carry 30 years of water, so NASA engineered the ECLSS (Environmental Control and Life Support System), recovering 98% of all water from sweat, exhaled breath, and urine.',
        didYouKnow: 'An astronaut on ISS consumes ~2.5 kg of water daily, identical to students on Earth, but every drop in orbit has been recycled dozens of times!',
        nasaSource: 'NASA Baseline Values and Assumptions Document (BVAD)',
      },
    ],
    interactiveTabs: [
      {
        label: 'Atmosphere vs Space',
        content: 'At sea level, air pressure is 101.3 kPa (14.7 psi). At 19 km altitude (the Armstrong Limit), water boils at human body temperature (37°C), meaning humans must wear pressurized spacesuits.',
      },
      {
        label: 'Orbit Mechanics',
        content: 'Low Earth Orbit (LEO) orbital speed is 7.8 km/s. To escape Earth’s gravity completely for the Moon or Mars, a spacecraft must reach 11.2 km/s (Escape Velocity).',
      },
      {
        label: 'Living on Earth',
        content: 'Earth’s 23.5-degree axial tilt provides stable seasons, shielding life from severe planetary temperature swings seen on airless bodies like Mercury or the Moon.',
      },
    ],
    nasaMissionsList: ['Landsat 9', 'Terra & Aqua', 'GRACE-FO', 'ISS National Lab', 'PACE Climate Satellite'],
  },
  {
    id: 'lunar-gateway',
    title: 'The Moon: Artemis Gateway to the Cosmos',
    subtitle: 'Peaks of Eternal Light, Shackleton Ice & Deep Space Hangar',
    heroImage: '/assets/planets/moon.png',
    category: 'MOON',
    telemetry: {
      distanceFromSun: '149.6 Million km (~384,400 km from Earth)',
      orbitalPeriod: '27.3 Days (Tidally Locked)',
      surfaceGravity: '1.62 m/s² (~1/6th Earth G)',
      surfaceTempRange: '-246°C (craters) to +121°C (noon)',
      atmosphereComposition: 'Virtually None (Ultra-thin Exosphere: He, Ne, H)',
      dayLength: '29.5 Earth Days (Day-Night Cycle)',
      moonsCount: 0,
    },
    overview:
      'The Moon is Earth’s only natural satellite. Under NASA’s Artemis campaign, humanity is returning to the lunar South Pole to establish the first permanent surface base, test ISRU technologies, and train the next generation of deep space commanders.',
    sections: [
      {
        heading: 'Shackleton Crater: The South Pole Water Ice Oasis',
        body: 'At the lunar South Pole, crater floors sit in permanent shadow and haven’t seen sunlight in over two billion years, reaching -246°C (among the coldest spots in the Solar System). NASA orbital radar confirmed billions of kilograms of water ice trapped in this regolith. Astronauts will mine this ice to produce drinking water, breathable oxygen, and liquid hydrogen rocket propellant.',
        didYouKnow: 'Splitting lunar water (H2O) using solar electricity creates cryogenic liquid hydrogen and liquid oxygen—the most efficient chemical rocket propellants known!',
        nasaSource: 'NASA Lunar Reconnaissance Orbiter (LRO) / LOLA Instrument',
      },
      {
        heading: 'Surviving the 14-Day Lunar Night',
        body: 'Because the Moon rotates slowly, a single lunar night lasts 14 Earth days (354 hours). Temperatures plunge to -130°C, and solar panels generate zero watts. To survive, Artemis Outposts will deploy Kilopower KRUSTY nuclear fission Stirling reactors and regenerative fuel cells buried under lunar soil.',
        didYouKnow: 'NASA’s Kilopower project tested a compact nuclear fission reactor that outputs a steady 10 kW of electrical power continuously for over 10 years without refueling.',
        nasaSource: 'NASA Glenn Research Center / Kilopower Project',
      },
      {
        heading: 'Moon Dust (Regolith) & Micro-Meteorite Hazards',
        body: 'Lunar regolith is composed of jagged, razor-sharp pulverized glass shards created by billions of micrometeorite impacts without wind or water erosion. Lunar spacesuits must use specialized mechanical seals, electro-static dust shields, and multi-layer Nomex/Kevlar fabrics to prevent abrasion.',
        didYouKnow: 'Apollo 17 astronauts reported that lunar dust smelled like spent gunpowder and quickly scratched their spacesuit helmet visors.',
        nasaSource: 'Apollo Field Geology Team / NASA Johnson Space Center',
      },
    ],
    interactiveTabs: [
      {
        label: 'Gravity Trajectory',
        content: 'With gravity only 16.6% of Earth’s, you can jump 6 times higher! However, your inertia remains identical, meaning stopping a fast-moving rover requires careful braking.',
      },
      {
        label: 'Radiation Defense',
        content: 'Without an atmosphere or magnetic field, lunar astronauts face Galactic Cosmic Rays (GCR). 2 meters of packed lunar regolith over base habitats blocks 99% of dangerous radiation.',
      },
      {
        label: 'Artemis Base Camp',
        content: 'The planned Artemis Base Camp includes a Foundation Habitat, a Mobile Habitat (pressurized rover), and a 100 kW power microgrid at the lunar South Pole.',
      },
    ],
    nasaMissionsList: ['Apollo 11–17', 'LRO (Lunar Reconnaissance Orbiter)', 'LCROSS', 'Artemis I (Orion)', 'Artemis III Crewed Landing'],
  },
  {
    id: 'mars-frontier',
    title: 'Mars: The Red Planet & Jezero Ancient River',
    subtitle: 'Search for Ancient Life, Thin Skies & MOXIE Oxygen',
    heroImage: '/assets/planets/mars.png',
    category: 'PLANET',
    telemetry: {
      distanceFromSun: '227.9 Million km (1.52 AU)',
      orbitalPeriod: '687 Earth Days (1.88 Earth Years)',
      surfaceGravity: '3.72 m/s² (~38% of Earth G)',
      surfaceTempRange: '-125°C to +20°C',
      atmosphereComposition: '95.3% Carbon Dioxide, 2.6% Nitrogen, 1.9% Argon',
      dayLength: '24 Hours 39 Minutes (1 Sol)',
      moonsCount: 2, // Phobos & Deimos
    },
    overview:
      'Mars is the fourth planet from the Sun and the most explored planetary frontier in human history. With evidence of ancient rivers, lakes, and organic compounds, Mars is the primary proving ground for humanity becoming a multi-planetary species.',
    sections: [
      {
        heading: 'Jezero Crater & Ancient Microbial Biosignatures',
        body: '3.8 billion years ago, Jezero Crater was filled with liquid water, hosting a deep lake and a prominent river delta. Today, NASA’s Perseverance rover drills cylindrical rock core samples from this sedimentary mudstone, searching for fossilized microscopic biosignatures to be returned to Earth.',
        didYouKnow: 'Perseverance is assisted by the Ingenuity Mars Helicopter, which proved powered atmospheric flight is possible in Mars’ ultra-thin air with over 72 successful sorties!',
        nasaSource: 'NASA Perseverance Mars 2020 & JPL Science Directorate',
      },
      {
        heading: 'The 7 Minutes of Terror: Atmospheric EDL',
        body: 'Entry, Descent, and Landing (EDL) on Mars is notoriously difficult. The atmosphere is thick enough to create 1,300°C friction heat, but too thin (less than 1% of Earth’s density) to slow a heavy lander with parachutes alone. Spacecraft use hypersonic heatshields, supersonic parachutes, and rocket-powered Sky Crane retro-thrusters.',
        didYouKnow: 'Because radio signals between Earth and Mars take 5 to 20 minutes to travel one way, the entire landing sequence must be executed 100% autonomously by onboard flight computers!',
        nasaSource: 'NASA JPL EDL Flight Dynamics & Simulation Group',
      },
      {
        heading: 'Breathing on Mars: The MOXIE Experiment',
        body: 'Mars has almost zero oxygen in its air, but abundant carbon dioxide (CO2). NASA tested MOXIE (Mars Oxygen ISRU Experiment) on Perseverance, which uses solid oxide electrolysis at 800°C to strip oxygen atoms from CO2 molecules, producing pure breathable oxygen.',
        didYouKnow: 'Over its operational campaign, MOXIE produced 122 grams of oxygen—enough to keep a small astronaut dog alive for 10 hours, proving humans can make their own air on Mars!',
        nasaSource: 'NASA STMD Game Changing Development / MIT MOXIE Team',
      },
    ],
    interactiveTabs: [
      {
        label: 'Olympus Mons',
        content: 'Mars houses Olympus Mons, a shield volcano 22 km high—almost 3 times taller than Mount Everest! Its base is as wide as the entire state of Arizona.',
      },
      {
        label: 'Martian Dust Storms',
        content: 'Global dust storms can envelop the entire planet for months, blocking 99% of sunlight and ending solar rover missions like Opportunity. Future outposts must combine solar with fission reactors.',
      },
      {
        label: 'Living on Mars',
        content: 'A Martian day (Sol) is only 39 minutes longer than an Earth day, making human circadian rhythms relatively easy to adapt compared to the Moon.',
      },
    ],
    nasaMissionsList: ['Viking 1 & 2', 'Pathfinder & Sojourner', 'Curiosity (MSL)', 'Perseverance & Ingenuity', 'Mars Sample Return (MSR)'],
  },
  {
    id: 'deep-space-frontier',
    title: 'The Cosmic Frontier: Outer Giants & Space Telescopes',
    subtitle: 'Gravitational Slingshots, Ocean Moons & Webb Infrared Eyes',
    heroImage: '/assets/planets/jupiter.png',
    category: 'DEEP_SPACE',
    telemetry: {
      distanceFromSun: '778.5 Million km to 5.9 Billion km (5.2 to 39.5 AU)',
      orbitalPeriod: '12 Years (Jupiter) to 248 Years (Pluto)',
      surfaceGravity: '24.79 m/s² (Jupiter Cloud Tops)',
      surfaceTempRange: '-145°C (Jupiter) to -230°C (Kuiper Belt)',
      atmosphereComposition: 'Hydrogen & Helium Gas Giants / Cryogenic Ices',
      dayLength: '9h 55m (Jupiter) to 16h 6m (Neptune)',
      moonsCount: 290, // Combined across outer planets
    },
    overview:
      'Beyond the asteroid belt lie the gas giants (Jupiter and Saturn) and ice giants (Uranus and Neptune), orbited by oceanic moons like Europa and Enceladus. Observing deep cosmic time, NASA space telescopes peer back over 13.5 billion years to the first stars.',
    sections: [
      {
        heading: 'James Webb Space Telescope (JWST): Looking Back in Time',
        body: 'Stationed 1.5 million kilometers away at the Sun-Earth L2 Lagrange point, the JWST uses a 6.5-meter gold-coated beryllium mirror and a five-layer tennis-court-sized sunshield chilled to -233°C to detect faint infrared photons emitted by the earliest galaxies after the Big Bang.',
        didYouKnow: 'Because light takes time to travel through space, when JWST photographs galaxies 13.4 billion light-years away, it is seeing them as they existed when the universe was only 300 million years old!',
        nasaSource: 'NASA Goddard / ESA / CSA James Webb Science Institute',
      },
      {
        heading: 'Gravity Assist: Cosmic Slingshots of Voyager & New Horizons',
        body: 'Chemical rockets lack the fuel mass to reach outer planets directly in reasonable time. Mission planners calculate gravitational slingshots: flying behind a moving planet like Jupiter allows a probe to steal a tiny fraction of the planet’s orbital momentum, accelerating the probe while barely decelerating the giant world.',
        didYouKnow: 'Voyager 1 used gravitational slingshots at Jupiter and Saturn to reach over 61,000 km/h, and is now over 24 billion kilometers away in interstellar space—still transmitting data!',
        nasaSource: 'NASA JPL Voyager Interstellar Mission & New Horizons',
      },
      {
        heading: 'Ocean Worlds: Europa Clipper & The Search for Life',
        body: 'Jupiter’s icy moon Europa hides a global liquid saltwater ocean containing more water than all of Earth’s oceans combined, kept liquid by gravitational tidal flexing from Jupiter. In 2024, NASA launched the Europa Clipper mission to fly through plumes and evaluate if this sub-ice ocean could support life.',
        didYouKnow: 'Europa Clipper carries nine scientific instruments, including ice-penetrating radar that can see through up to 30 kilometers of surface ice sheets!',
        nasaSource: 'NASA JPL / Europa Clipper Science Team',
      },
    ],
    interactiveTabs: [
      {
        label: 'Lagrange Points',
        content: 'Lagrange points (L1 to L5) are gravitational equilibrium positions where the gravitational pull of the Sun and Earth balance the orbital motion of a spacecraft, allowing telescopes like JWST to hover with minimal fuel.',
      },
      {
        label: 'Saturn’s Moon Titan',
        content: 'Titan is the only moon with a dense atmosphere and liquid lakes on its surface (made of liquid methane and ethane). NASA’s Dragonfly rotorcraft will fly through Titan’s skies in 2034!',
      },
      {
        label: 'Deep Space Network (DSN)',
        content: 'NASA maintains giant 70-meter parabolic radio dishes in Goldstone (California), Madrid (Spain), and Canberra (Australia) to stay in continuous 24/7 radio communication with spacecraft throughout the solar system.',
      },
    ],
    nasaMissionsList: ['Voyager 1 & 2', 'Hubble Space Telescope', 'Cassini-Huygens', 'New Horizons', 'James Webb (JWST)', 'Europa Clipper'],
  },
];

