// ============================================================
// NASA Jr_AstroCamp — Outer Space Discovery Modal
// Inspired by NASA Space Place (spaceplace.nasa.gov) — Enhanced for Jr Astronauts
// ============================================================

import React, { useState } from 'react';
import {
  SPACE_DISCOVERY_MODULES,
  type ScienceModule,
} from '../../data/spacePlaceKnowledge';
import {
  Globe,
  Compass,
  Thermometer,
  Layers,
  Sparkles,
  Rocket,
  ArrowRight,
  X,
  ExternalLink,
  BookOpen,
  Award,
  ChevronRight,
  Radio,
  Zap,
} from 'lucide-react';
import { soundFx } from '../../utils/audioEffects';

interface OuterSpaceDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToStacks: (selectedModuleId: string) => void;
  initialModuleId?: string;
}

export const OuterSpaceDiscoveryModal: React.FC<OuterSpaceDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onProceedToStacks,
  initialModuleId = 'earth-systems',
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId);
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);

  if (!isOpen) return null;

  const currentModule =
    SPACE_DISCOVERY_MODULES.find((m) => m.id === selectedModuleId) ||
    SPACE_DISCOVERY_MODULES[0];

  const handleSelectModule = (id: string) => {
    soundFx.playClick(850);
    setSelectedModuleId(id);
    setActiveTabIdx(0);
  };

  const handleProceed = () => {
    soundFx.playReactorStart();
    onProceedToStacks(currentModule.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(14px)',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(165deg, #090e1c 0%, #040711 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        {/* ── TOP HEADER ── */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, transparent 60%)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Globe size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#38bdf8',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  NASA Space Place Science Explorer
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700 }}>
                  Prerequisite Aerospace Briefing
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                  fontSize: '20px',
                  fontWeight: 800,
                  margin: '2px 0 0',
                  color: '#ffffff',
                }}
              >
                Outer Space Science & Telemetry Dossier
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Discovery Hub"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── CELESTIAL TARGET SELECTOR TABS ── */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 24px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {SPACE_DISCOVERY_MODULES.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            let icon = '🌍';
            if (mod.id === 'lunar-gateway') icon = '🌕';
            if (mod.id === 'mars-frontier') icon = '🔴';
            if (mod.id === 'deep-space-frontier') icon = '🪐';

            return (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(14, 165, 233, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <span>{mod.title.split(':')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Hero Banner & Overview */}
          <div
            style={{
              padding: '20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.5) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {currentModule.category} DOSSIER
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#f8fafc',
                    margin: '0 0 6px',
                  }}
                >
                  {currentModule.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 12px', fontWeight: 600 }}>
                  {currentModule.subtitle}
                </p>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', margin: 0, maxWidth: '820px' }}>
                  {currentModule.overview}
                </p>
              </div>

              {/* Fast Action CTA */}
              <button
                onClick={handleProceed}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  border: '1.5px solid rgba(254, 215, 170, 0.6)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(249, 115, 22, 0.5)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  alignSelf: 'center',
                }}
              >
                <Rocket size={17} />
                <span>CHOOSE LEARNING STACK ➔</span>
              </button>
            </div>
          </div>

          {/* ── LIVE TELEMETRY STRIP ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', marginBottom: '4px' }}>DISTANCE FROM SUN</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>{currentModule.telemetry.distanceFromSun}</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', marginBottom: '4px' }}>SURFACE GRAVITY</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80' }}>{currentModule.telemetry.surfaceGravity}</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', marginBottom: '4px' }}>THERMAL RANGE</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>{currentModule.telemetry.surfaceTempRange}</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', marginBottom: '4px' }}>SOL / DAY LENGTH</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>{currentModule.telemetry.dayLength}</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', marginBottom: '4px' }}>NATURAL MOONS</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#a78bfa' }}>{currentModule.telemetry.moonsCount} Moons</div>
            </div>
          </div>

          {/* ── CORE SCIENCE SECTIONS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {currentModule.sections.map((sec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#38bdf8',
                    margin: '0 0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Sparkles size={16} />
                  <span>{sec.heading}</span>
                </h4>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 12px' }}>
                  {sec.body}
                </p>

                {/* Did you know callout */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderLeft: '3px solid #f59e0b',
                    fontSize: '12.5px',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <Zap size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>NASA Aerospace Fact: </strong>
                    <span>{sec.didYouKnow}</span>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                  Source: {sec.nasaSource}
                </div>
              </div>
            ))}
          </div>

          {/* ── INTERACTIVE DEEP DIVE TABS ── */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '14px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={16} color="#c084fc" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono, monospace)' }}>
                DEEP DIVE AEROSPACE CONCEPTS
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {currentModule.interactiveTabs.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTabIdx(idx)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: activeTabIdx === idx ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: activeTabIdx === idx ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: activeTabIdx === idx ? '#f8fafc' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '13.5px', color: '#e2e8f0', lineHeight: '1.6' }}>
              {currentModule.interactiveTabs[activeTabIdx]?.content}
            </div>
          </div>

          {/* ── NASA MISSIONS LIST ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#64748b', fontWeight: 700 }}>
              VERIFIED NASA MISSIONS:
            </span>
            {currentModule.nasaMissionsList.map((m, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11.5px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontWeight: 600,
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* ── BOTTOM ACTIONS FOOTER ── */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.95)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <BookOpen size={15} />
            <span>Reading completed. You are authorized to select any of the 4 learning stacks.</span>
          </div>

          <button
            onClick={handleProceed}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '1.5px solid #38bdf8',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Proceed to 4 Learning Stacks (OR-Graph)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

