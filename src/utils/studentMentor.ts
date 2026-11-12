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
      `Great scientific inquiry, Cadet! Our mission simulations are derived from verified NASA open data portals, including:\n\n` +
      `1. NASA DONKI (Space Weather Database of Notifications, Knowledge, Information) for solar flares, coronal mass ejections, and geomagnetic storms.\n` +
      `2. NASA BVAD (Baseline Values and Assumptions Document TP-2015-218570) for life-support stoichiometry (oxygen, water, and food rates).\n` +
      `3. Reference: ${citationTitle} (${docNumber}).\n\n` +
      `Always remember: while based on authentic NASA space telemetry, each gameplay effect is not itself a NASA measurement, but an educational model to teach critical decision-making.`
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

