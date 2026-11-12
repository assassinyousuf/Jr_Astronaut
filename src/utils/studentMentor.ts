// ============================================================
// NASA Jr_AstroCamp — Student Mentor AI Engine
// Supportive, empathetic guidance for young cadets (Ages 10-16)
// Grounded in NASA Space Apps, DONKI Space Weather, and BVAD Life Support
// ============================================================

import type { MissionEvent, ChoiceOption } from '../types/game';

export interface StudentMentorContext {
  activeEvent?: MissionEvent | null;
  destination?: 'MOON' | 'MARS' | 'EARTH' | 'DEEP_SPACE';
  currentSol?: number;
  isGameOver?: boolean;
  resources?: {
    power?: number;
    water?: number;
    oxygen?: number;
    food?: number;
    radiation?: number;
    science?: number;
    crewHealth?: number;
    crewMorale?: number;
  };
}

/**
 * Generates an empathetic, educational, and supportive reply from the Student Mentor.
 * Tailored for middle school and high school students tackling complex space trade-offs.
 */
export function getStudentMentorReply(query: string, context?: StudentMentorContext): string {
  const q = query.trim().toLowerCase();
  const event = context?.activeEvent;
  const sol = context?.currentSol ?? 1;
  const dest = context?.destination ?? 'MOON';

  // ── 0. CORE CADET ONBOARDING & FOUNDATIONAL QUESTIONS ──────────────
  if (q.includes('why do astronauts need power') || (q.includes('why') && q.includes('power'))) {
    return (
      `In space, electrical power is literally life!\n\n` +
      `Here is why power is so critical for astronauts on the Moon and Mars:\n` +
      `1. **Life Support (ECLSS)**: Powers air scrubbers to remove toxic CO2, water recycling distillation, and oxygen pumps.\n` +
      `2. **Thermal Control**: Space swings from boiling +120°C in sunlight down to -130°C during the lunar night. Continuous electrical heaters keep habitats and spacesuits from freezing solid.\n` +
      `3. **Communications & Telemetry**: High-gain antenna dishes need continuous electricity to transmit radio signals back to Earth.\n` +
      `4. **Science & Rovers**: Battery charging powers scientific drills, rovers, and experiments.\n\n` +
      `NASA uses high-efficiency solar arrays paired with Kilopower nuclear Stirling reactors to guarantee power day and night!`
    );
  }

  if (q.includes('what if i make a mistake') || q.includes('mistake') || q.includes('what if i fail') || q.includes('make mistake')) {
    return (
      `Mistakes are an essential part of becoming a great astronaut and aerospace engineer!\n\n` +
      `At NASA, flight teams run hundreds of simulation tests before any real launch. In these simulations, engines intentionally glitch, dust storms hit, and solar panels get covered in dust. ` +
      `Every single error gives engineers valuable telemetry to improve their design.\n\n` +
      `In this mission simulator, you can never truly fail—each choice teaches you how real life-support stoichiometry and orbital mechanics work. ` +
      `If a resource runs low, just pause, adjust your plan, and try again. You've got this, Cadet!`
    );
  }

  if (q.includes('can you help me with this mission') || q.includes('help me with this mission') || q.includes('how do i play') || q.includes('help with mission')) {
    return (
      `You bet! You don't have to tackle this alone—we can break it down step-by-step:\n\n` +
      `1. **Monitor the Big Three**: Always watch your Oxygen, Power, and Water gauges. As long as those are in the green, your outpost is secure.\n` +
      `2. **Review the Trade-Offs**: When an event occurs on Sol ${sol}, read each option carefully. Look at what resources it costs versus the science points it yields.\n` +
      `3. **Safety First**: Prioritizing your crew's life support over risky experiments is the hallmark of a great flight commander.\n\n` +
      `What specific system or event on Sol ${sol} would you like to review together?`
    );
  }

  // ── 1. SCIENCE / DATA ORIGIN INQUIRIES ─────────────────────────────
  if (
    q.includes('where does this data come from') ||
    q.includes('data source') ||
    q.includes('nasa data') ||
    q.includes('data come from') ||
    q.includes('is this real') ||
    q.includes('attribution')
  ) {
    if (event?.dataAttribution) {
      const { label, recordId, sourceUrl } = event.dataAttribution;
      return (
        `Greetings, Cadet! This mission challenge is directly linked to authentic NASA heliophysics records from NASA DONKI ` +
        `(Space Weather Database of Notifications, Knowledge, Information).\n\n` +
        `• Dataset Status: ${label}\n` +
        `• NASA Record Identifier: ${recordId}\n` +
        `• Primary Scientific Source: ${sourceUrl}\n\n` +
        `Important scientific note: While this cosmic phenomenon is recorded in real NASA telemetry, remember that the gameplay effect is not itself a NASA measurement. ` +
        `Our simulation models how such events could affect outpost power and life support to help you learn real engineering trade-offs!`
      );
    }

    const citationTitle = event?.nasaCitation?.title || 'NASA Space Science & Bioastronautics';
    const docNumber = event?.nasaCitation?.docNumber || 'DONKI / BVAD';
    return (
      `Great scientific inquiry, Cadet! Our mission simulations are derived from verified NASA open data portals across four platforms:\n\n` +
      `1. **NASA Open Data** (data.nasa.gov) — Apollo Passive Seismic Experiment (PSE) shallow moonquake catalogs (Nakamura 1979).\n` +
      `2. **NASA API Portal** (api.nasa.gov) — NASA DONKI space weather API for solar flares, Coronal Mass Ejections (CMEs), and proton flux alerts.\n` +
      `3. **NASA Earthdata** (earthdata.nasa.gov) — Planetary altimetry grids (MOLA) and atmospheric density models.\n` +
      `4. **NASA JPL Planetary Data System** (jpl.nasa.gov) — Mars Curiosity & Perseverance REMS/MEDA atmospheric and dust opacity telemetry.\n\n` +
      `• Reference: ${citationTitle} (${docNumber}).\n\n` +
      `Always remember: while based on authentic NASA space telemetry, each gameplay effect is not itself a NASA measurement, but an educational physical model to teach critical decision-making!`
    );
  }

  // ── 1B. 4 REAL NASA SURVIVAL MISSIONS (2 MOON + 2 MARS) ─────────────
  if (q.includes('moonquake') || q.includes('seismic') || q.includes('nakamura') || q.includes('resonance') || (q.includes('shake') && q.includes('moon'))) {
    return (
      `🌕 **Moon Survival Mission 1: Shallow Moonquake & Regolith Resonance**\n\n` +
      `• **Target Site**: Mare Tranquillitatis (Apollo 11 PSE Station S11, -1,850m elevation)\n` +
      `• **NASA Source**: NASA Open Data (data.nasa.gov) & Nakamura et al. (1979) Apollo PSE catalog\n` +
      `• **The Physical Hazard**: Unlike Earth rocks that attenuate seismic waves in 1–2 minutes due to moisture, the Moon is bone dry. Lunar regolith has an exceptionally high seismic quality factor (Q > 3,500). When a tectonic moonquake strikes, the ground rings like a bronze bell for **60 to 120 minutes**!\n` +
      `• **Commander Survival Protocol**:\n` +
      `  1. Deploy hydraulic dampening outriggers to decouple habitat living quarters from high-frequency shear waves.\n` +
      `  2. Depressurize residual hypergolic propellant lines to prevent slosh resonance ruptures.\n` +
      `  3. Drive titanium micro-spike anchors into basalt bedrocks to resist sliding.\n\n` +
      `Would you like to simulate this mission in the 3D Hangar?`
    );
  }

  if (q.includes('malapert') || q.includes('solar storm') || q.includes('cme') || q.includes('proton') || q.includes('x7.2') || (q.includes('solar') && q.includes('flare'))) {
    return (
      `🌕 **Moon Survival Mission 2: Malapert Mountain Class X7.2 Solar Storm**\n\n` +
      `• **Target Site**: Malapert Mountain Plateau (Lunar South Pole, +5,000m elevation)\n` +
      `• **NASA Source**: NASA API Portal (api.nasa.gov/DONKI) & LRO CRaTER instrument\n` +
      `• **The Physical Hazard**: An extreme Class X7.2 solar flare launches relativistic Solar Energetic Particle (SEP) protons (>100 MeV) directly along Parker Spiral magnetic lines at 2,200 km/s. They strike the unshielded lunar surface in just **18 minutes** with biological doses reaching 1.85 Gray (lethal without shielding)!\n` +
      `• **Commander Survival Protocol**:\n` +
      `  1. Issue an immediate 18-minute emergency EVA recall into subterranean storm shelters.\n` +
      `  2. Ingress the 2.0-meter compacted regolith bunker with surrounding potable water wall jackets (hydrogen stops protons with zero Bremsstrahlung gamma rays).\n` +
      `  3. Switch sensitive avionics and volatile RAM to rad-hard sleep mode to avoid single-event latchups.\n\n` +
      `You can test this in the Hardcore Survival Simulator!`
    );
  }

  if (q.includes('dust storm') || q.includes('rems') || q.includes('dust') && q.includes('mars') || q.includes('tau') || q.includes('mmrtg')) {
    return (
      `🔴 **Mars Survival Mission 1: REMS Extreme Planet-Encircling Dust Storm**\n\n` +
      `• **Target Site**: Gale Crater (Curiosity) & Jezero Crater (Perseverance)\n` +
      `• **NASA Source**: NASA JPL PDS (jpl.nasa.gov) Curiosity REMS & Perseverance MEDA sensors\n` +
      `• **The Physical Hazard**: Massive southern summer convection cells loft micron-sized ferric oxide dust into the stratosphere, spiking atmospheric optical depth (Tau) past 3.5–4.5 and blocking 99% of sunlight! Solar power collapses from 590 W/m² to <15 W/m², surface nights drop to -85°C, and dust generates 20 kV/m electrostatic friction.\n` +
      `• **Commander Survival Protocol**:\n` +
      `  1. Switch base electrical power from compromised solar arrays to the nuclear MMRTG Stirling thermal bus.\n` +
      `  2. Direct waste radioactive decay heat through thermal fluid loops to prevent battery electrolytes from freezing solid at -40°C.\n` +
      `  3. Deploy electrostatic grounding drag cables to safely dissipate triboelectric charge.\n\n` +
      `Check out the Mars Survival Simulator to command this scenario!`
    );
  }

  if (q.includes('coprates') || q.includes('canyon') || q.includes('chasma') || q.includes('katabatic') || q.includes('permafrost') || q.includes('valles marineris')) {
    return (
      `🔴 **Mars Survival Mission 2: Coprates Chasma Hypersonic Canyon Entry & Permafrost**\n\n` +
      `• **Target Site**: Coprates Chasma, Valles Marineris (-6,800m below datum, 7 km cliff walls)\n` +
      `• **NASA Source**: NASA Earthdata (earthdata.nasa.gov) MOLA MEGDR laser altimetry & MRO SHARAD\n` +
      `• **The Physical Hazard**: At -6.8 km depth, atmospheric pressure is 50% denser (1,150 Pa), but extreme nocturnal radiative cooling causes catastrophic **45 m/s (160 km/h) katabatic down-draft winds** cascading down the sheer 7-kilometer cliffs into boulder-strewn 30° scree slopes!\n` +
      `• **Commander Survival Protocol**:\n` +
      `  1. Engage LIDAR Terrain-Relative Navigation (TRN) to paint canyon wall contours and counter optical shadows.\n` +
      `  2. Execute a pulsed high-thrust retro-burn at 500m to cancel turbulent katabatic wind shear vectors.\n` +
      `  3. Deploy high-torque cryogenic diamond core drills to extract pure sub-surface permafrost ice lenses at 0.8m depth.\n\n` +
      `Launch this high-speed descent in the Mars EDL & Survival Simulator!`
    );
  }

  // ── 2. RADIATION AND HEALTH CAVEATS ─────────────────────────────────
  if (q.includes('radiation') || q.includes('cosmic ray') || q.includes('solar storm') || q.includes('sievert') || q.includes('msv')) {
    return (
      `Radiation is one of the most critical challenges for human spaceflight outside Earth's protective magnetosphere!\n\n` +
      `In deep space, astronauts face Galactic Cosmic Rays (GCRs) and Solar Particle Events (SPEs). Real NASA missions monitor space weather using NASA DONKI ` +
      `(Space Weather Database of Notifications, Knowledge, Information) and deploy regolith berms, polyethylene water walls, and underground storm shelters.\n\n` +
      `Important Cadet Notice: The radiation counter shown in this outpost trainer is an educational indicator designed to teach shielding strategies; it is not a medical measurement of clinical human health. ` +
      `If a storm warning sounds, seal the storm vault and shelter your crew until the solar particle event subsides!`
    );
  }

  // ── 3. ANXIETY, OVERWHELM, OR BEING STUCK ───────────────────────────
  if (
    q.includes('worried') ||
    q.includes('stuck') ||
    q.includes('scared') ||
    q.includes('overwhelmed') ||
    q.includes('stressed') ||
    q.includes('confused') ||
    q.includes('lost') ||
    q.includes('too hard') ||
    q.includes('give up') ||
    q.includes('fail')
  ) {
    return (
      `Take a steady breath, Cadet. You’re not alone, and you don’t have to solve everything at once.\n\n` +
      `Every Apollo astronaut, shuttle commander, and ISS flight director has faced unexpected emergencies where systems flashed warning lights. ` +
      `In aerospace engineering, failure is simply information: each choice teaches us how to calibrate our life-support balance for the next Sol.\n\n` +
      `Let’s pause and focus on the single most urgent priority right now: is your Oxygen and Water stable? If they are above critical levels, your crew has time to think. ` +
      `Take it one step at a time—you have what it takes to command this outpost!`
    );
  }

  // ── 4. DECISION SUPPORT & CHOICE TRADE-OFFS ─────────────────────────
  if (
    q.includes('choose') ||
    q.includes('help me decide') ||
    q.includes('what should i do') ||
    q.includes('which option') ||
    q.includes('which choice') ||
    q.includes('help me choose') ||
    q.includes('recommend') ||
    q.includes('advice')
  ) {
    if (event && event.options && event.options.length > 0) {
      const optionsBreakdown = event.options
        .map((opt: ChoiceOption, index: number) => {
          const deltaStrings: string[] = [];
          if (opt.resourceDelta) {
            Object.entries(opt.resourceDelta).forEach(([res, val]) => {
              if (val !== undefined && val !== 0) {
                deltaStrings.push(`${res}: ${val > 0 ? '+' : ''}${val}`);
              }
            });
          }
          const deltaSummary = deltaStrings.length > 0 ? ` (${deltaStrings.join(', ')})` : '';
          return (
            `Option ${index + 1}: **${opt.title}**\n` +
            `• Action: ${opt.description}\n` +
            `• Trade-off: ${opt.tradeOffText}${deltaSummary}\n` +
            `• Engineering insight: ${opt.educationalInsight}`
          );
        })
        .join('\n\n');

      return (
        `You’re not alone, Commander! Making tough decisions under pressure is what aerospace leadership is all about.\n\n` +
        `Let’s examine the situation on Sol ${sol} for "${event.title}":\n\n` +
        `${optionsBreakdown}\n\n` +
        `There may not be a perfect choice in spaceflight—every option involves managing scarce resources against unknown risks. ` +
        `Look at your current resource reserves: if one vital system is dangerously low, choose the path that protects your crew’s survival first. I believe in your judgment!`
      );
    }

    return (
      `You’re not alone, Commander! When facing decisions in the cosmos, always evaluate your three vital pillars: Oxygen, Power, and Water. ` +
      `There may not be a perfect choice in spaceflight, but prioritizing your crew's life support over short-term science gains is the hallmark of a great flight commander. ` +
      `Check your current Sol telemetry, identify your weakest resource buffer, and make the safest choice!`
    );
  }

  // ── 5. DESTINATION SPECIFIC GUIDANCE ────────────────────────────────
  if (q.includes('moon') || q.includes('lunar') || (dest === 'MOON' && q.includes('base'))) {
    return (
      `Commanding an Artemis Base Camp at the Lunar South Pole (Shackleton Crater) requires unique tactics:\n\n` +
      `1. **The 14-Day Lunar Night**: Nights last ~354 continuous hours. Make sure your Kilopower reactor and energy storage can keep habitat thermal heaters alive.\n` +
      `2. **Water Ice Mining**: Cold permanently shadowed regions trap volatile water-ice. Extracting it reduces reliance on Earth resupply.\n` +
      `3. **Electrostatic Regolith Dust**: Lunar dust is abrasive and glass-like. Keep airlocks cycled and check seal integrity often.`
    );
  }

  if (q.includes('mars') || q.includes('martian') || (dest === 'MARS' && q.includes('base'))) {
    return (
      `Commanding a Martian Outpost in Jezero Crater comes with high rewards and great challenges:\n\n` +
      `1. **Dust Storm Seasons**: Planet-encircling dust storms can obscure the Sun for weeks, cutting solar power by 80%+.\n` +
      `2. **Atmospheric ISRU**: The atmosphere is 95% CO2. Use MOXIE solid-oxide electrolysis to produce O2 for breathing and methane ascent fuel.\n` +
      `3. **Communication Delay**: Radio signals take 7 to 14 minutes each way to Earth. You are autonomous—trust your mission logs!`
    );
  }

  // ── 6. GENERAL ENCOURAGEMENT & DEFAULT MENTOR RESPONSE ───────────────
  return (
    `Hello Cadet! As your Student Mentor and Flight Guide, I'm here to support your journey through the Junior Astronaut Mission Trainer.\n\n` +
    `Whether you're calculating life-support balance, navigating solar particle events, or choosing between risky science expeditions, remember:\n` +
    `• You’re not alone—space exploration is a team endeavor.\n` +
    `• You don’t have to solve everything at once; break challenges down into life support, power, and shielding.\n` +
    `• Every decision teaches real NASA engineering principles.\n\n` +
    `What aspect of your mission on Sol ${sol} would you like to review together?`
  );
}

