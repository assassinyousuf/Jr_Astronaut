// ============================================================
// NASA Jr_AstroCamp — All 76 NASA Missions Roster & Selector
// Complete catalog of 76 operational NASA flight missions (1961–Present)
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Rocket,
  Compass,
  Trophy,
  CheckCircle2,
  Filter,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { MISSION_GAME_DATA, type MissionGameConfig, type GameType } from '../game/missionGameData';
import { soundFx } from '../utils/audioEffects';

export interface All76MissionsRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMission: (missionId: string) => void;
  currentMissionId?: string;
  completedMissions?: string[];
}

type EraFilter = 'ALL' | 'MERCURY' | 'GEMINI' | 'APOLLO' | 'SKYLAB' | 'SHUTTLE' | 'DEEP_SPACE' | 'ARTEMIS';

const ERA_RANGES: { id: EraFilter; label: string; count: number; filterFn: (m: MissionGameConfig) => boolean }[] = [
  { id: 'ALL', label: 'All 76 Flights', count: 76, filterFn: () => true },
  { id: 'MERCURY', label: 'Mercury (6)', count: 6, filterFn: (m) => m.programName.includes('Mercury') },
  { id: 'GEMINI', label: 'Gemini (10)', count: 10, filterFn: (m) => m.programName.includes('Gemini') },
  { id: 'APOLLO', label: 'Apollo (17)', count: 17, filterFn: (m) => m.programName.includes('Apollo') },
  { id: 'SKYLAB', label: 'Skylab & ASTP (4)', count: 4, filterFn: (m) => m.programName.includes('Skylab') || m.programName.includes('Apollo-Soyuz') },
  { id: 'SHUTTLE', label: 'Shuttle (18)', count: 18, filterFn: (m) => m.programName.includes('Shuttle') || m.programName.includes('Space Transportation') },
  { id: 'DEEP_SPACE', label: 'Deep Space & Mars (14)', count: 14, filterFn: (m) => m.programName.includes('Mars') || m.programName.includes('Planetary') || m.programName.includes('Deep Space') || m.programName.includes('Voyager') },
  { id: 'ARTEMIS', label: 'Artemis & Modern (7)', count: 7, filterFn: (m) => m.programName.includes('Artemis') || m.programName.includes('Commercial') || m.programName.includes('Earth Science') || m.programName.includes('Great Observatories') },
];

export const All76MissionsRosterModal: React.FC<All76MissionsRosterModalProps> = ({
  isOpen,
  onClose,
  onSelectMission,
  currentMissionId,
  completedMissions = [],
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEra, setSelectedEra] = useState<EraFilter>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredMissions = useMemo(() => {
    const eraConfig = ERA_RANGES.find((e) => e.id === selectedEra) || ERA_RANGES[0];
    const q = searchQuery.toLowerCase().trim();

    return MISSION_GAME_DATA.filter((m) => {
      // Era check
      if (!eraConfig.filterFn(m)) return false;

      // Type check
      if (selectedType !== 'ALL' && m.gameType !== selectedType) return false;

      // Query check
      if (q) {
        const matchesName = m.missionName.toLowerCase().includes(q);
        const matchesProg = m.programName.toLowerCase().includes(q);
        const matchesYear = m.year.toLowerCase().includes(q);
        const matchesBrief = (m.briefing || '').toLowerCase().includes(q);
        const matchesObj = (m.objective || '').toLowerCase().includes(q);
        const matchesId = m.id.toLowerCase().includes(q);
        return matchesName || matchesProg || matchesYear || matchesBrief || matchesObj || matchesId;
      }

      return true;
    });
  }, [searchQuery, selectedEra, selectedType]);

  if (!isOpen) return null;

  const getTypeLabel = (type: GameType) => {
    switch (type) {
      case 'launch': return '🚀 Rocket Ascent';
      case 'lunar_landing': return '🌕 Lunar Descent';
      case 'rover': return '🪑 Surface Rover';
      case 'docking': return '🎯 Orbital Docking';
      case 'deep_space': return '📡 Planetary Slingshot';
      case 'telescope': return '🔭 Space Telescope';
      default: return '🚀 Flight Mission';
    }
  };

  const getTypeBadgeColor = (type: GameType) => {
    switch (type) {
      case 'launch': return { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', text: '#38bdf8' };
      case 'lunar_landing': return { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', text: '#fde047' };
      case 'rover': return { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', text: '#fdba74' };
      case 'docking': return { bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399', text: '#6ee7b7' };
      case 'deep_space': return { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#d8b4fe' };
      case 'telescope': return { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', text: '#f472b6' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', border: '#94a3b8', text: '#cbd5e1' };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(16px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(165deg, #090e1c 0%, #040711 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(56, 189, 248, 0.15)',
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
            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 60%)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
              }}
            >
              <Rocket size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#38bdf8',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  NASA Historical Flight Roster
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 700 }}>
                  All {MISSION_GAME_DATA.length} Missions Unlocked &amp; Flyable
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                  fontSize: '22px',
                  fontWeight: 800,
                  margin: '2px 0 0',
                  color: '#ffffff',
                }}
              >
                {MISSION_GAME_DATA.length} Playable NASA Missions (1961 — Present)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Roster"
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

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div
          style={{
            padding: '14px 24px',
            background: 'rgba(15, 23, 42, 0.65)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          {/* Search bar & Type filter */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div
              style={{
                flex: 1,
                minWidth: '260px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', color: '#64748b' }}
              />
              <input
                type="text"
                placeholder="Search all 76 missions by name, year, astronaut, target, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  background: 'rgba(2, 6, 23, 0.75)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Game Type Filter Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                background: 'rgba(2, 6, 23, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '12.5px',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Flight Types (76)</option>
              <option value="launch">🚀 Rocket Ascent (Launch)</option>
              <option value="lunar_landing">🌕 Lunar Descent (Landing)</option>
              <option value="rover">🪑 Surface Rover (Traverse)</option>
              <option value="docking">🎯 Orbital Docking (Gemini/Apollo/ISS)</option>
              <option value="deep_space">📡 Planetary Gravity Assist (Deep Space)</option>
              <option value="telescope">🔭 Space Telescope Optics (Hubble/JWST)</option>
            </select>
          </div>

          {/* Era Pills Strip */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {ERA_RANGES.map((era) => {
              const isSelected = selectedEra === era.id;
              return (
                <button
                  key={era.id}
                  onClick={() => {
                    soundFx.playClick(750);
                    setSelectedEra(era.id);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {era.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MISSIONS GRID (SCROLLABLE) ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '14px',
            alignContent: 'start',
          }}
        >
          {filteredMissions.map((m) => {
            const globalIndex = MISSION_GAME_DATA.findIndex((item) => item.id === m.id);
            const isCurrent = currentMissionId === m.id;
            const isCompleted = completedMissions.includes(m.id);
            const badgeStyle = getTypeBadgeColor(m.gameType);

            return (
              <div
                key={m.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: isCurrent
                    ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(15, 23, 42, 0.95) 100%)'
                    : 'rgba(15, 23, 42, 0.7)',
                  border: isCurrent
                    ? '2px solid #38bdf8'
                    : isCompleted
                    ? '1.5px solid rgba(34, 197, 94, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isCurrent ? '0 0 25px rgba(56, 189, 248, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  {/* Top card metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono, monospace)',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                        }}
                      >
                        #{globalIndex + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: badgeStyle.bg,
                          border: `1px solid ${badgeStyle.border}`,
                          color: badgeStyle.text,
                        }}
                      >
                        {getTypeLabel(m.gameType)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{m.year}</span>
                      {isCompleted && (
                        <span title="Completed Mission" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <CheckCircle2 size={14} color="#4ade80" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Program */}
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 4px',
                      lineHeight: '1.3',
                      fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    }}
                  >
                    {m.missionName}
                  </h3>

                  <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, marginBottom: '8px' }}>
                    {m.programName}
                  </div>

                  {/* Briefing Teaser */}
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      lineHeight: '1.45',
                      margin: '0 0 10px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {m.briefing || m.objective}
                  </p>
                </div>

                {/* Card Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span>Diff:</span>
                    <span>{'★'.repeat(m.difficulty)}{'☆'.repeat(Math.max(0, 5 - m.difficulty))}</span>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playReactorStart();
                      onSelectMission(m.id);
                      onClose();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: isCurrent
                        ? 'rgba(56, 189, 248, 0.25)'
                        : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: '1px solid #38bdf8',
                      color: '#ffffff',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    <Play size={12} fill="#ffffff" />
                    <span>{isCurrent ? 'FLYING NOW' : 'FLY MISSION ➔'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FOOTER BAR ── */}
        <div
          style={{
            padding: '12px 24px',
            background: 'rgba(2, 6, 23, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#94a3b8',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Showing <strong>{filteredMissions.length}</strong> of <strong>{MISSION_GAME_DATA.length}</strong> NASA Historical Flight Missions</span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10.5px', color: '#64748b' }}>
            TEAM MYSTERIO · NASA SPACE APPS CHALLENGE 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default All76MissionsRosterModal;
