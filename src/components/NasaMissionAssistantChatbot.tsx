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
}

// Preset Quick Inquiry Prompts for middle school cadets (Student Mentor Persona)
const SUGGESTED_MENTOR_PROMPTS = [
  '🤝 Can you help me choose?',
  '❤️ I feel worried and stuck',
  '☢️ What about radiation?',
  '🔬 Where does this data come from?',
  '🌙 Surviving the 14-day lunar night',
  '🔴 How does MOXIE create oxygen on Mars?',
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
      senderName: 'NASA Cadet Mentor',
      text: `Greetings, Cadet ${currentUser?.username || 'Commander'}! I am your NASA Student Mentor. Space exploration is a thrilling journey of learning through experimentation. Whenever you feel stuck, need help deciding on tricky trade-offs, or wonder where our NASA data comes from, I'm right here beside you!`,
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
            bottom: '24px',
            right: '24px',
            zIndex: 9990,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
            pointerEvents: 'auto',
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

      {/* Main Chatbot Panel Dialog */}
      {isOpen && (
        <div
          className="copilot-chatbot-window"
          role="dialog"
          aria-label="NASA Mission Assistant Copilot & Mentor"
          style={{
            position: 'fixed',
            bottom: floatingMode ? '84px' : '50%',
            right: floatingMode ? '24px' : '50%',
            transform: floatingMode ? 'none' : 'translate(50%, 50%)',
            width: isExpanded ? 'min(820px, calc(100vw - 32px))' : 'min(470px, calc(100vw - 32px))',
            height: isExpanded ? 'min(780px, calc(100vh - 100px))' : 'min(600px, calc(100vh - 100px))',
            zIndex: 9995,
            background: 'linear-gradient(180deg, #090e1a 0%, #04070f 100%)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(15, 23, 42, 0.92)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Radio size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
                    {mentorMode === 'mentor' ? 'NASA CADET MENTOR' : 'NASA CAPCOM COPILOT'}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      color: '#4ade80',
                      fontWeight: 700,
                    }}
                  >
                    {mentorMode === 'mentor' ? 'MENTOR READY' : 'DSN LIVE'}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {mentorMode === 'mentor'
                    ? 'Empathetic Decision Support · Grounded in NASA DONKI & BVAD'
                    : 'Artemis Core Flight Assistant · Grounded in NASA Open Data'}
                </div>
              </div>
            </div>

            {/* Persona Switcher Toggle + Header Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(2, 6, 23, 0.75)', padding: '2px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                <button
                  onClick={() => { setMentorMode('mentor'); soundFx.playClick(850); }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '14px',
                    border: 'none',
                    background: mentorMode === 'mentor' ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
                    color: mentorMode === 'mentor' ? '#38bdf8' : '#94a3b8',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  title="Switch to Student Mentor mode"
                >
                  🎓 Mentor
                </button>
                <button
                  onClick={() => { setMentorMode('copilot'); soundFx.playClick(850); }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '14px',
                    border: 'none',
                    background: mentorMode === 'copilot' ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
                    color: mentorMode === 'copilot' ? '#38bdf8' : '#94a3b8',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  title="Switch to CapCom Copilot mode"
                >
                  🚀 Copilot
                </button>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: soundEnabled ? '#38bdf8' : '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                }}
                title={soundEnabled ? 'Mute Radio Audio' : 'Unmute Radio Audio'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                }}
                title={isExpanded ? 'Collapse Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <button
                onClick={handleToggleOpen}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                }}
                title="Close Chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Preset Prompts Carousel */}
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(2, 6, 23, 0.7)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {activePrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#cbd5e1',
                  fontSize: '10.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.color = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'rgba(3, 7, 18, 0.6)',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    className="copilot-msg-bubble"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                      fontSize: '10px',
                      color: isUser ? '#38bdf8' : '#34d399',
                      fontWeight: 700,
                    }}
                  >
                    <span>{isUser ? `🧑‍🚀 ${msg.senderName}` : `🤖 ${msg.senderName}`}</span>
                    <span style={{ color: '#64748b' }}>{msg.timestamp}</span>
                  </div>

                  <div
                    className="copilot-msg-bubble"
                    style={{
                      padding: '12px 14px',
                      borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: isUser
                        ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.3) 0%, rgba(3, 105, 161, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.6) 100%)',
                      border: isUser
                        ? '1px solid rgba(56, 189, 248, 0.4)'
                        : '1px solid rgba(52, 211, 153, 0.3)',
                      color: '#f1f5f9',
                      fontSize: '12px',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {msg.text}

                    {/* Citations Tag Strip */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div
                        style={{
                          marginTop: '10px',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 700 }}>
                          NASA GROUNDING:
                        </span>
                        {msg.citations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              fontSize: '9.5px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(56, 189, 248, 0.1)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                            }}
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Speech Narration Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleSpeakMessage(msg.text)}
                      style={{
                        marginTop: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        padding: '2px 4px',
                      }}
                      title="Listen to CapCom voice synthesis"
                    >
                      <Volume2 size={12} className="text-cyan-400" />
                      <span>Transmit Audio</span>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Thinking / Uplink indicator */}
            {isThinking && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#38bdf8',
                  fontSize: '11px',
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '8px',
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
                <span>QUERYING NASA FLIGHT TELEMETRY ARCHIVE...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 14px',
              background: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask NASA Copilot (e.g. MOXIE, lunar night, orbital speed)..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'rgba(2, 6, 23, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#ffffff',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                outline: 'none',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)')}
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                background: inputQuery.trim()
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'rgba(30, 41, 59, 0.5)',
                border: 'none',
                color: '#ffffff',
                cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.04em',
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={14} />
              <span>TRANSMIT</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default NasaMissionAssistantChatbot;

