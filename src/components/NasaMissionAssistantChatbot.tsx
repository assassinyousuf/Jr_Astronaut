// ============================================================
// NASA Jr_AstroCamp — AI Mission Assistant Copilot (Chatbot)
// Forked and enhanced from NASA Space Apps 2026 Extended Version
// Grounded in NASA Flight Transcripts, BVAD Stoichiometry, and Orbital Physics
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Radio,
  Send,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Zap,
  RotateCcw,
  Minimize2,
  Maximize2,
  Compass,
  Layers,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { soundFx } from '../utils/audioEffects';
import { speechEngine } from '../utils/speechEngine';
import type { User } from '../types/auth';
import { getStudentMentorReply, type StudentMentorContext } from '../utils/studentMentor';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  senderName: string;
  text: string;
  timestamp: string;
  citations?: string[];
}

interface NasaMissionAssistantChatbotProps {
  currentUser?: User | null;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  floatingMode?: boolean;
  initialMode?: 'mentor' | 'copilot';
  mentorContext?: StudentMentorContext;
  floatingOffsetBottom?: number;
}

// Preset Quick Inquiry Prompts for middle school cadets (Student Mentor Persona)
const SUGGESTED_MENTOR_PROMPTS = [
  'Can you help me with this mission?',
  'Why do astronauts need power?',
  'What if I make a mistake?',
  'Where does this data come from?',
  'What about radiation?',
  'Surviving the 14-day lunar night',
];

// Preset Quick Inquiry Prompts for technical aerospace inquiries (CapCom Copilot Persona)
const SUGGESTED_COPILOT_PROMPTS = [
  '🚀 What is the 7 Minutes of Terror in EDL?',
  '💧 Explain ECLSS closed-loop water & air math',
  '🛰️ What are Quindar tones and orbital velocity?',
  '🪐 Tell me about Europa Clipper & ocean worlds',
  '🛸 How to perform orbital docking?',
  '⚛️ Explain Kilopower KRUSTY nuclear reactor',
];

// Knowledge base rules & response generator grounded in authentic NASA open science
function generateCopilotResponse(query: string): { reply: string; citations: string[] } {
  const q = query.toLowerCase();

  if (q.includes('lunar night') || q.includes('moon night') || q.includes('night') && q.includes('moon')) {
    return {
      reply: `Commander, on the Moon, a single night lasts ~14 Earth days (354 hours) with temperatures dropping to -208°C (-342°F). During this cryogenic blackout, solar panels generate 0 kW. To survive:
1. Deploy a **Kilopower KRUSTY 10 kWe nuclear Stirling fission reactor** to maintain continuous baseload power without sunlight.
2. Store thermal heat in sintered regolith thermal mass vaults.
3. Conserve ECLSS battery reserves by lowering habitability loads to critical life-support heaters.`,
      citations: ['NASA STMD Kilopower KRUSTY Report', 'NASA LRO Diviner Thermal Telemetry']
    };
  }

  if (q.includes('moxie') || (q.includes('oxygen') && q.includes('mars'))) {
    return {
      reply: `Affirmative, Cadet! MOXIE (Mars Oxygen ISRU Experiment) aboard the Perseverance rover generates breathable O2 directly from the thin Martian atmosphere (95% CO2).
Using Solid Oxide Electrolysis at ~800°C:
$$2\\text{CO}_2 \\rightarrow 2\\text{CO} + \\text{O}_2$$
MOXIE produces up to 10–12 grams of pure oxygen per hour. A human astronaut consumes ~0.84 kg O2 per day (~35 grams/hour), proving that future human crews can produce their breathing air and rocket oxidizer locally on Mars!`,
      citations: ['NASA JPL Mars 2020 MOXIE Technical Briefing', 'NASA BVAD TP-2015-218570']
    };
  }

  if (q.includes('7 minutes') || q.includes('terror') || q.includes('edl') || (q.includes('landing') && q.includes('mars'))) {
    return {
      reply: `The **"7 Minutes of Terror"** refers to the Entry, Descent, and Landing (EDL) sequence of landing a rover on Mars. 
Because Martian radio transmissions take 7 to 14 minutes to reach Earth, Mission Control cannot pilot it live—the spacecraft must land 100% autonomously!
1. **Hypersonic Entry**: Enters atmosphere at ~20,000 km/h (12,500 mph). Heat shield withstands 1,300°C.
2. **Supersonic Parachute**: Deploys at Mach 1.7 to bleed off 90% of kinetic energy.
3. **Terrain Relative Navigation (TRN)**: Rover scans ground topography to avoid boulder fields.
4. **Sky Crane Maneuver**: Rocket thrusters brake the descent stage, lowering the rover on nylon tethers to touch down safely.`,
      citations: ['NASA JPL EDL Autonomous Flight Log', 'Curiosity & Perseverance EDL Architecture']
    };
  }

  if (q.includes('eclss') || q.includes('water') || q.includes('stoichiometry') || q.includes('life support')) {
    return {
      reply: `Under NASA Baseline Values and Assumptions Document (BVAD TP-2015-218570), human metabolic life support requirements are calculated per astronaut per day:
- **Oxygen**: $0.84\\text{ kg } \\text{O}_2$ consumed / day.
- **Hydration & Food Prep**: $2.50\\text{ kg } \\text{H}_2\\text{O}$ / day.
- **Dry Calorie Biomass**: $0.62\\text{ kg food}$ (~2,500 kcal).

ECLSS recycles moisture via:
1. **Urine Processor Assembly (UPA)**: Vacuum rotary distillation recovering 98% of moisture.
2. **Sabatier Catalytic Reactor**:
$$\\text{CO}_2 + 4\\text{H}_2 \\rightarrow \\text{CH}_4 + 2\\text{H}_2\\text{O}$$
The water produced is electrolyzed into fresh breathing oxygen!`,
      citations: ['NASA BVAD (TP-2015-218570)', 'ISS ECLSS Environmental Control Logs']
    };
  }

  if (q.includes('quindar') || q.includes('beep') || q.includes('frequency')) {
    return {
      reply: `CapCom here! **Quindar tones** are the iconic dual-frequency beeps heard during Apollo and early shuttle transmissions.
- **Intro Beep**: 2,525 Hz (duration ~250 ms) triggered the ground transmitter station when CapCom pressed Push-To-Talk (PTT).
- **Outro Beep**: 2,475 Hz signaled the remote antenna transmitter to shut down when CapCom released PTT.
This automated the remote line keying between Houston Mission Control and the Deep Space Network (DSN) stations in Goldstone, Madrid, and Canberra.`,
      citations: ['NASA Apollo Telecommunications Manual', 'NASA History Technical Monograph']
    };
  }

  if (q.includes('europa') || q.includes('ocean') || q.includes('clipper') || q.includes('deep space')) {
    return {
      reply: `Cadet, Jupiter's icy moon **Europa** harbors a subsurface saltwater ocean beneath a 15–25 km ice shell that holds more than twice the liquid water of all Earth's oceans combined!
The **Europa Clipper** mission (launched October 2024) will perform 49 low-altitude flybys as close as 25 km above the ice.
Equipped with ice-penetrating radar (REASON), an infrared spectrometer, and an ice-dust analyzer, it is determining whether subsurface geothermal vents provide conditions for extraterrestrial life!`,
      citations: ['NASA Europa Clipper Mission Science Plan', 'NASA Planetary Science Decadal Survey']
    };
  }

  if (q.includes('orbit') || q.includes('speed') || q.includes('velocity') || q.includes('iss')) {
    return {
      reply: `To stay in Low Earth Orbit (LEO) at ~400 km altitude, a spacecraft must travel at orbital velocity:
$$v = \\sqrt{\\frac{GM}{r}} \\approx 7.8\\text{ km/s} \\quad (28,000\\text{ km/h or } 17,500\\text{ mph})$$
At this velocity, the Earth's curvature falls away beneath the vehicle at the exact same rate gravity pulls it downward, putting astronauts in perpetual continuous freefall (microgravity). The ISS orbits Earth once every 92 minutes—experiencing 16 sunrises and sunsets every 24 hours!`,
      citations: ['NASA Orbital Mechanics Course Handbook', 'JPL Horizon Ephemeris Calculations']
    };
  }

  if (q.includes('radiation') || q.includes('shielding') || q.includes('gcr') || q.includes('spe')) {
    return {
      reply: `Beyond Earth's protective magnetosphere and thick atmosphere, astronauts face two deadly radiation hazards:
1. **Galactic Cosmic Rays (GCR)**: High-energy relativistic protons and iron nuclei originating outside our solar system.
2. **Solar Particle Events (SPE)**: Giant coronal mass ejections blasting millions of tons of ionized plasma.

**NASA Countermeasures**:
- **Sintered Regolith Storm Vault**: Piling 1.5–2 meters of molten lunar soil over habitat modules absorbs ionizing cosmic rays.
- **Hydrogen-Rich Shielding**: Water walls and polyethylene food storage blocks secondary neutron radiation far better than heavy lead.`,
      citations: ['NASA CRaTER Instrument on LRO', 'NASA Space Radiation Health Project (SRHP)']
    };
  }

  if (q.includes('docking') || q.includes('dock') || q.includes('simulator') || q.includes('rcs')) {
    return {
      reply: `Pilot Tip: During orbital docking:
1. Never burn main engines close to the target! Use short, pulsed Reaction Control System (RCS) translation thrusters.
2. Keep your relative closing rate below $0.1\\text{ m/s}$ ($0.36\\text{ km/h}$) at contact.
3. Align crosshairs on the docking target reticle to zero out angular pitch and yaw before latching contact!`,
      citations: ['NASA International Docking System Standard (IDSS)', 'Gemini VIII & Apollo Rendezvous Logs']
    };
  }

  // Fallback intelligent aerospace copilot answer
  return {
    reply: `Commander, telemetry is clear. Regarding "${query}":
In NASA mission operations, every choice is governed by strict trade-offs between mass, power, safety margins, and scientific yield. Whether budgeting cargo limits on the Space Launch System (SLS) or managing life-support stoichiometry on the Moon or Mars, redundancy and safety (ALARA principles) ensure our crew returns safely.
Feel free to ask about orbital maneuvers, Kilopower reactors, Mars MOXIE oxygen generation, ECLSS life support math, or guidance on any of our 76 missions!`,
    citations: ['NASA International Space Apps Challenge 2026', 'Team Mysterio Operational Guide']
  };
}

export const NasaMissionAssistantChatbot: React.FC<NasaMissionAssistantChatbotProps> = ({
  currentUser,
  isOpen: externalIsOpen,
  onOpen: externalOnOpen,
  onClose: externalOnClose,
  floatingMode = true,
  initialMode = 'mentor',
  mentorContext,
  floatingOffsetBottom = 24,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [mentorMode, setMentorMode] = useState<'mentor' | 'copilot'>(initialMode);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init-1',
      sender: 'assistant',
      senderName: 'Mission Mentor',
      text: "Hi, Cadet! I’m your Mission Mentor. You don’t have to figure everything out alone—we can take one question at a time. What would you like help with?",
      timestamp: '00:00:01',
      citations: ['NASA Space Apps Student Mentor Framework', 'NASA DONKI Space Weather Database', 'NASA BVAD TP-2015-218570']
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    if (soundEnabled) {
      soundFx.playRadioChirp();
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      senderName: currentUser?.username || 'Commander',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    // Realistic radio response delay (400ms)
    setTimeout(() => {
      let reply: string;
      let citations: string[];

      const q = query.toLowerCase();
      // If in mentor mode OR the query matches key mentor scenarios (choices, worry, radiation, data origin)
      if (
        mentorMode === 'mentor' ||
        q.includes('choose') ||
        q.includes('decide') ||
        q.includes('which option') ||
        q.includes('help me') ||
        q.includes('worried') ||
        q.includes('stuck') ||
        q.includes('scared') ||
        q.includes('radiation') ||
        q.includes('where does this data come from') ||
        q.includes('attribution')
      ) {
        reply = getStudentMentorReply(query, mentorContext);
        citations = ['NASA DONKI Space Weather Database', 'NASA BVAD TP-2015-218570'];
        if (mentorContext?.activeEvent?.dataAttribution?.sourceUrl) {
          citations.push(mentorContext.activeEvent.dataAttribution.sourceUrl);
        }
      } else {
        const copilotRes = generateCopilotResponse(query);
        reply = copilotRes.reply;
        citations = copilotRes.citations;
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        senderName: mentorMode === 'mentor' ? 'NASA Cadet Mentor' : 'CapCom AI Copilot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        citations
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);

      if (soundEnabled) {
        soundFx.playDsnChirp();
      }
    }, 400);
  };

  const handleSpeakMessage = (text: string) => {
    speechEngine.stop();
    // Strip markdown formatting for cleaner TTS
    const plainText = text.replace(/[*#$]/g, '').replace(/\\text\{([^}]+)\}/g, '$1');
    speechEngine.speak(plainText, 'SYSTEM_AI');
  };

  const handleToggleOpen = () => {
    if (soundEnabled) {
      soundFx.playClick(850);
    }
    if (isOpen) {
      if (externalOnClose) externalOnClose();
      setInternalIsOpen(false);
    } else {
      if (externalOnOpen) externalOnOpen();
      setInternalIsOpen(true);
    }
  };

  const activePrompts = mentorMode === 'mentor' ? SUGGESTED_MENTOR_PROMPTS : SUGGESTED_COPILOT_PROMPTS;

  return (
    <>
      {/* Floating Launcher Widget (You're not on this mission alone. + Ask your mentor) */}
      {floatingMode && !isOpen && (
        <div
          className="copilot-floating-trigger-btn mentor-floating-widget"
          style={{
            position: 'fixed',
            bottom: `${floatingOffsetBottom}px`,
            right: '24px',
            zIndex: 9990,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
            pointerEvents: 'auto',
            transition: 'bottom 0.25s ease',
          }}
        >
          {/* Supportive Speech Bubble */}
          <div
            style={{
              padding: '7px 18px',
              borderRadius: '9999px',
              background: 'rgba(11, 20, 42, 0.94)',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              color: '#f8fafc',
              fontSize: '13.5px',
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(12px)',
              letterSpacing: '0.01em',
              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              whiteSpace: 'nowrap',
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            You’re not on this mission alone.
          </div>

          {/* Action Pill Button */}
          <button
            onClick={handleToggleOpen}
            aria-label="Ask your mentor"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 22px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
              border: '2px solid #38bdf8',
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.45), 0 8px 24px rgba(0,0,0,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.01em',
            }}
            title="Ask your NASA Student Mentor for guidance"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(56, 189, 248, 0.65), 0 10px 28px rgba(0,0,0,0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(56, 189, 248, 0.45), 0 8px 24px rgba(0,0,0,0.6)';
            }}
          >
            <MessageCircle size={20} style={{ strokeWidth: 2.2, color: '#ffffff' }} />
            <span>Ask your mentor</span>
          </button>
        </div>
      )}

      {/* Main Chatbot Panel Dialog (Mission Mentor Interface) */}
      {isOpen && (
        <div
          className="copilot-chatbot-window"
          role="dialog"
          aria-label="Mission Mentor"
          style={{
            position: 'fixed',
            bottom: floatingMode ? `${floatingOffsetBottom}px` : '50%',
            right: floatingMode ? '24px' : '50%',
            transform: floatingMode ? 'none' : 'translate(50%, 50%)',
            width: isExpanded ? 'min(780px, calc(100vw - 32px))' : 'min(460px, calc(100vw - 32px))',
            height: isExpanded ? 'min(780px, calc(100vh - 48px))' : 'min(640px, calc(100vh - 48px))',
            zIndex: 9995,
            background: 'linear-gradient(180deg, #091528 0%, #060e1c 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.22)',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(6, 182, 212, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 22px 14px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.14)',
                  border: '1.5px solid rgba(34, 211, 238, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22d3ee',
                  boxShadow: '0 0 16px rgba(34, 211, 238, 0.25)',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={20} style={{ strokeWidth: 2 }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Mission Mentor
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                  Your friendly in-app guide
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleOpen}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              title="Close Mission Mentor"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <X size={22} />
            </button>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              if (isUser) {
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '85%',
                      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.4) 0%, rgba(3, 105, 161, 0.5) 100%)',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      borderRadius: '16px 16px 4px 16px',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {msg.text}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  style={{
                    background: '#0b192e',
                    border: '1px solid rgba(30, 58, 95, 0.75)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      color: '#38bdf8',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    MISSION MENTOR
                  </div>
                  <div
                    style={{
                      color: '#e2e8f0',
                      fontSize: '14.5px',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Speech Narration Button */}
                  <button
                    onClick={() => handleSpeakMessage(msg.text)}
                    style={{
                      marginTop: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      padding: '2px 4px',
                    }}
                    title="Listen to Mentor Audio"
                  >
                    <Volume2 size={13} className="text-cyan-400" />
                    <span>Read aloud</span>
                  </button>
                </div>
              );
            })}

            {/* Quick Prompt Pills matching the screenshot layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <div>
                <button
                  onClick={() => handleSendMessage('Can you help me with this mission?')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: 'rgba(11, 25, 45, 0.85)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#e2e8f0',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.background = 'rgba(14, 38, 70, 0.95)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                    e.currentTarget.style.background = 'rgba(11, 25, 45, 0.85)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }}
                >
                  Can you help me with this mission?
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleSendMessage('Why do astronauts need power?')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: 'rgba(11, 25, 45, 0.85)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#e2e8f0',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.background = 'rgba(14, 38, 70, 0.95)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                    e.currentTarget.style.background = 'rgba(11, 25, 45, 0.85)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }}
                >
                  Why do astronauts need power?
                </button>

                <button
                  onClick={() => handleSendMessage('What if I make a mistake?')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: 'rgba(11, 25, 45, 0.85)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#e2e8f0',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.background = 'rgba(14, 38, 70, 0.95)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                    e.currentTarget.style.background = 'rgba(11, 25, 45, 0.85)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }}
                >
                  What if I make a mistake?
                </button>
              </div>
            </div>

            {/* Thinking / Uplink indicator */}
            {isThinking && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#38bdf8',
                  fontSize: '12px',
                  padding: '8px 14px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '12px',
                  width: 'fit-content',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#38bdf8',
                    animation: 'pulse 1s infinite',
                  }}
                />
                <span>Consulting mission logs...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Form & Disclaimer */}
          <div
            style={{
              padding: '12px 20px 16px 20px',
              background: 'rgba(8, 16, 28, 0.95)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(7, 18, 34, 0.95)',
                  border: '2px solid rgba(251, 146, 60, 0.85)',
                  borderRadius: '16px',
                  padding: '10px 14px',
                  boxShadow: '0 0 14px rgba(251, 146, 60, 0.25)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="It's okay to ask for help..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    caretColor: '#fb923c',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isThinking}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: inputQuery.trim()
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                    : 'rgba(15, 26, 44, 0.65)',
                  border: inputQuery.trim()
                    ? '1px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: inputQuery.trim() ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputQuery.trim() ? 'pointer' : 'default',
                  transition: 'all 0.18s ease',
                  flexShrink: 0,
                }}
                title="Send question to Mission Mentor"
              >
                <Send size={18} />
              </button>
            </form>

            <div
              style={{
                fontSize: '11px',
                color: '#64748b',
                textAlign: 'center',
                marginTop: '10px',
                lineHeight: 1.4,
              }}
            >
              A learning guide, not a live person. Answers use prepared learning content.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NasaMissionAssistantChatbot;

