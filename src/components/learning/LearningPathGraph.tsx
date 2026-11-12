// ============================================================
// NASA Jr_AstroCamp — Learning Path OR-Graph & Stack Hub
// Demonstrates multi-modal learning equivalence:
// Student can complete a milestone via: Video OR Audio OR Comic OR Game!
// ============================================================

import React, { useState } from 'react';
import type { User } from '../../types/auth';
import { soundFx } from '../../utils/audioEffects';
import {
  Video,
  Radio,
  BookOpen,
  Gamepad2,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Globe,
  Trophy,
  Zap,
} from 'lucide-react';

export interface MilestoneNode {
  id: string;
  number: number;
  title: string;
  moduleId: string;
  quizId: string;
  requiredForCert: string;
  description: string;
  videoLessonId: string;
  audioLessonId: string;
  comicIssueId: string;
  gameMissionId: string;
}

export const MILESTONES: MilestoneNode[] = [
  {
    id: 'milestone-01',
    number: 1,
    title: 'Earth Systems & Low Earth Orbit (LEO)',
    moduleId: 'earth-systems',
    quizId: 'quiz-earth-01',
    requiredForCert: 'Cadet Orientation Certificate',
    description: 'Master orbital velocities (7.8 km/s), atmospheric Max-Q drag, and closed-loop ECLSS life support.',
    videoLessonId: 'video-earth-systems',
    audioLessonId: 'audio-earth-orbit',
    comicIssueId: 'issue-01-friendship-7',
    gameMissionId: 'NASA-M001',
  },
  {
    id: 'milestone-02',
    number: 2,
    title: 'Artemis Lunar Base & South Pole Cryo-Ice',
    moduleId: 'lunar-gateway',
    quizId: 'quiz-moon-01',
    requiredForCert: 'Lunar Pioneer Certification',
    description: 'Extract water ice in Shackleton Crater, endure the 14-day lunar night, and deploy Kilopower nuclear Stirling power.',
    videoLessonId: 'video-moon-ice',
    audioLessonId: 'audio-lunar-base',
    comicIssueId: 'issue-02-gemini-8',
    gameMissionId: 'NASA-M011',
  },
  {
    id: 'milestone-03',
    number: 3,
    title: 'Martian Entry (EDL) & Jezero Crater Expedition',
    moduleId: 'mars-frontier',
    quizId: 'quiz-mars-01',
    requiredForCert: 'Mars Expeditionary Diploma',
    description: 'Survive the 7 Minutes of Terror Sky Crane landing, search for ancient microbial biosignatures, and make oxygen with MOXIE.',
    videoLessonId: 'video-mars-edl',
    audioLessonId: 'audio-mars-rems',
    comicIssueId: 'issue-03-apollo-11',
    gameMissionId: 'NASA-M014',
  },
  {
    id: 'milestone-04',
    number: 4,
    title: 'Cosmic Frontier: Ocean Worlds & Deep Space Slingshots',
    moduleId: 'deep-space-frontier',
    quizId: 'quiz-deep-space-01',
    requiredForCert: 'Grand Aerospace Scholar Certification',
    description: 'Calculate planetary gravity-assist swingbys, inspect Europa’s subsurface saltwater ocean, and peer back 13.5 billion years with JWST.',
    videoLessonId: 'video-deep-space',
    audioLessonId: 'audio-voyager-dsn',
    comicIssueId: 'issue-04-curiosity',
    gameMissionId: 'NASA-M018',
  },
];

interface LearningPathGraphProps {
  currentUser: User | null;
  onOpenSpaceDossier: (moduleId: string) => void;
  onSelectStack: (stackType: 'video' | 'audio' | 'comic' | 'game', milestone: MilestoneNode) => void;
  onOpenQuiz: (quizId: string) => void;
  onOpenCertificate: (milestoneTitle: string) => void;
}

export const LearningPathGraph: React.FC<LearningPathGraphProps> = ({
  currentUser,
  onOpenSpaceDossier,
  onSelectStack,
  onOpenQuiz,
  onOpenCertificate,
}) => {
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>('milestone-01');

  const activeMilestone =
    MILESTONES.find((m) => m.id === activeMilestoneId) || MILESTONES[0];

  const passedQuizzes = currentUser?.passedQuizzes || [];
  const completedLessons = currentUser?.completedLessonIds || [];
  const completedMilestones = currentUser?.completedMilestones || [];

  const isMilestoneQuizPassed = passedQuizzes.includes(activeMilestone.quizId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      {/* ── TOP HEADER / PREREQUISITE BRIEFING NOTICE ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Globe size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', letterSpacing: '0.1em' }}>
              STEP 1: PREREQUISITE SPACE BRIEFING
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
              Read the Outer Space Knowledge Dossier before choosing your stack
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick(850);
            onOpenSpaceDossier(activeMilestone.moduleId);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            border: '1px solid #38bdf8',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
          }}
        >
          <BookOpen size={15} />
          <span>Read Space Place Dossier ➔</span>
        </button>
      </div>

      {/* ── MILESTONE SELECTOR STRIP ── */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {MILESTONES.map((m) => {
          const isSelected = m.id === activeMilestoneId;
          const isPassed = passedQuizzes.includes(m.quizId);

          return (
            <button
              key={m.id}
              onClick={() => {
                soundFx.playClick(750);
                setActiveMilestoneId(m.id);
              }}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'rgba(15, 23, 42, 0.6)',
                border: isSelected
                  ? '1.5px solid #38bdf8'
                  : isPassed
                  ? '1.5px solid rgba(34, 197, 94, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: isSelected ? '#38bdf8' : '#94a3b8',
                    fontWeight: 700,
                  }}
                >
                  MILESTONE #{m.number}
                </span>
                {isPassed && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#4ade80', fontSize: '11px', fontWeight: 700 }}>
                    <CheckCircle2 size={13} /> CERTIFIED
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#ffffff' : '#cbd5e1', lineHeight: '1.3' }}>
                {m.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── THE INTERACTIVE OR-GRAPH VISUALIZER ── */}
      <div
        style={{
          padding: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(165deg, #090e1c 0%, #030611 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', letterSpacing: '0.12em', fontWeight: 800 }}>
              STEP 2: MULTI-MODAL LEARNING OR-GRAPH
            </span>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
            Choose Any 1 of the 4 Stacks to Complete Milestone #{activeMilestone.number}
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            {activeMilestone.description}
          </p>
        </div>

        {/* ── 4 STACKS GRID ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          {/* 🎬 Stack 1: Video */}
          <div
            onClick={() => onSelectStack('video', activeMilestone)}
            style={{
              padding: '18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                  <Video size={18} />
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#f87171', fontWeight: 800 }}>
                  STACK A (OR)
                </span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                Video Stack
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 14px' }}>
                Interactive cinematic video masterclass with aerospace graphics & lecture transcript.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f87171', fontWeight: 700 }}>
              <span>Launch Video Player</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 🎧 Stack 2: Audio */}
          <div
            onClick={() => onSelectStack('audio', activeMilestone)}
            style={{
              padding: '18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <Radio size={18} />
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', fontWeight: 800 }}>
                  STACK B (OR)
                </span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                Audio Stack
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 14px' }}>
                Authentic NASA Quindar radio communications, CapCom briefings & telemetry audio.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', fontWeight: 700 }}>
              <span>Launch Audio Player</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 📖 Stack 3: Comic */}
          <div
            onClick={() => onSelectStack('comic', activeMilestone)}
            style={{
              padding: '18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1.5px solid rgba(168, 85, 247, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <BookOpen size={18} />
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#c084fc', fontWeight: 800 }}>
                  STACK C (OR)
                </span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                Comic Stack
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 14px' }}>
                Full-color illustrated NASA graphic novel exploring real astronaut dilemmas & engineering pivots.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#c084fc', fontWeight: 700 }}>
              <span>Open Graphic Novel</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 🎮 Stack 4: Games */}
          <div
            onClick={() => onSelectStack('game', activeMilestone)}
            style={{
              padding: '18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                  <Gamepad2 size={18} />
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#fbbf24', fontWeight: 800 }}>
                  STACK D (OR)
                </span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                Flight Sim Game
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: '0 0 14px' }}>
                Hands-on 60 FPS flight dynamics simulation: Ascent, RCS Docking, or Surface Rover sortie.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fbbf24', fontWeight: 700 }}>
              <span>Launch Simulator</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* ── STEP 3: POST-LESSON QUIZ & CERTIFICATION GATE ── */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isMilestoneQuizPassed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 215, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMilestoneQuizPassed ? '#22c55e' : '#ffd700',
              }}
            >
              {isMilestoneQuizPassed ? <CheckCircle2 size={22} /> : <HelpCircle size={22} />}
            </div>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
                STEP 3: COMPREHENSION QUIZ & CERTIFICATE
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                {isMilestoneQuizPassed
                  ? `Quiz Passed! You unlocked the ${activeMilestone.requiredForCert}`
                  : `Attempt the Flight Readiness Quiz for Milestone #${activeMilestone.number}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onOpenQuiz(activeMilestone.quizId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: isMilestoneQuizPassed
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: isMilestoneQuizPassed ? '1.5px solid #22c55e' : '1.5px solid rgba(254, 215, 170, 0.6)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              <Zap size={14} />
              <span>{isMilestoneQuizPassed ? 'Re-take Quiz (+Score)' : 'Start Milestone Quiz'}</span>
            </button>

            {isMilestoneQuizPassed && (
              <button
                onClick={() => onOpenCertificate(activeMilestone.requiredForCert)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                  border: '1.5px solid #ffd700',
                  color: '#ffd700',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)',
                }}
              >
                <Award size={15} />
                <span>Claim & Share Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

