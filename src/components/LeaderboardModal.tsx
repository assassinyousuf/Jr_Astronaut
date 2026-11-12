// ============================================================
// Jr. AstroCamp — Dual-Segment Leaderboard Modal
// 🎮 Segment 1: Flight Simulation & 76-Mission Progress
// 🎓 Segment 2: Academic STEM Knowledge & Flight Readiness Quizzes
// ============================================================

import React, { useState, useMemo } from 'react';
import { authService } from '../utils/authService';
import type { User } from '../types/auth';
import { Trophy, Star, Rocket, Medal, X, Zap, Target, ChevronUp, GraduationCap, Gamepad2, BookOpen } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  initialSegment?: 'flight' | 'academic';
}

type LeaderboardSegment = 'flight' | 'academic';
type SortKey = 'missions' | 'coins' | 'rank' | 'points' | 'quizzes';

// Rank ladder based on missions completed
const RANK_LADDER = [
  { label: 'Junior Stargazer',       minMissions: 0,  color: '#94a3b8', icon: '⭐' },
  { label: 'Cadet Trainee',          minMissions: 3,  color: '#60a5fa', icon: '🚀' },
  { label: 'Rover Pilot',            minMissions: 8,  color: '#34d399', icon: '🛸' },
  { label: 'Flight Engineer',        minMissions: 15, color: '#fbbf24', icon: '🛰️' },
  { label: 'Mission Specialist',     minMissions: 25, color: '#f97316', icon: '🌙' },
  { label: 'Flight Commander',       minMissions: 40, color: '#a78bfa', icon: '🪐' },
  { label: 'Flight Candidate',       minMissions: 55, color: '#f43f5e', icon: '🌟' },
  { label: 'Sr. Astronaut',          minMissions: 68, color: '#ff6b35', icon: '🏆' },
  { label: 'Mission Commander',      minMissions: 76, color: '#ffd700', icon: '👨‍🚀' },
];

function getRankForMissions(count: number) {
  let rank = RANK_LADDER[0];
  for (const r of RANK_LADDER) {
    if (count >= r.minMissions) rank = r;
  }
  return rank;
}

function getMedalIcon(position: number) {
  if (position === 1) return { emoji: '🥇', color: '#FFD700' };
  if (position === 2) return { emoji: '🥈', color: '#C0C0C0' };
  if (position === 3) return { emoji: '🥉', color: '#CD7F32' };
  return { emoji: `#${position}`, color: '#64748b' };
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialSegment = 'flight',
}) => {
  const [segment, setSegment] = useState<LeaderboardSegment>(initialSegment);
  const [sortKey, setSortKey] = useState<SortKey>('missions');

  const leaderboardData = useMemo(() => {
    const allUsers = authService.getUsers();
    // Only show cadets on leaderboard
    const cadets = allUsers.filter((u) => u.role === 'cadet');

    const withStats = cadets.map((u) => {
      const missionsCount = (u.completedMissions || []).length;
      const quizzesCount = (u.passedQuizzes || []).length;
      const academicPts = u.academicPoints || 0;
      const milestonesCount = (u.completedMilestones || []).length;

      return {
        ...u,
        missionsCount,
        quizzesCount,
        academicPts,
        milestonesCount,
        rankInfo: getRankForMissions(missionsCount),
      };
    });

    if (segment === 'flight') {
      return withStats.sort((a, b) => {
        if (sortKey === 'coins') {
          if (b.coins !== a.coins) return b.coins - a.coins;
          return b.missionsCount - a.missionsCount;
        }
        // default missions
        if (b.missionsCount !== a.missionsCount) return b.missionsCount - a.missionsCount;
        return b.coins - a.coins;
      });
    } else {
      // Academic segment
      return withStats.sort((a, b) => {
        if (sortKey === 'quizzes') {
          if (b.quizzesCount !== a.quizzesCount) return b.quizzesCount - a.quizzesCount;
          return b.academicPts - a.academicPts;
        }
        // default points
        if (b.academicPts !== a.academicPts) return b.academicPts - a.academicPts;
        return b.quizzesCount - a.quizzesCount;
      });
    }
  }, [segment, sortKey]);

  const currentUserPosition = currentUser
    ? leaderboardData.findIndex((u) => u.username.toLowerCase() === currentUser.username.toLowerCase()) + 1
    : -1;

  if (!isOpen) return null;

  return (
    <div className="lb-backdrop" onClick={onClose}>
      <div className="lb-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="lb-header">
          <div className="lb-title-row">
            <Trophy size={28} color="#FFD700" />
            <div>
              <h2 className="lb-title">
                {segment === 'flight' ? 'Flight & Simulation Leaderboard' : 'Academic & STEM Knowledge Leaderboard'}
              </h2>
              <p className="lb-subtitle">
                {segment === 'flight'
                  ? '76 Historical NASA Missions & Flight Simulator Ranks'
                  : 'Flight Readiness Quizzes, Lesson Stacks & Academic Points'}
              </p>
            </div>
          </div>
          <button className="lb-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Dual-Segment Switcher */}
        <div style={{ display: 'flex', gap: '10px', padding: '14px 20px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.5)' }}>
          <button
            onClick={() => {
              setSegment('flight');
              setSortKey('missions');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              borderBottom: segment === 'flight' ? '2.5px solid #f97316' : '2.5px solid transparent',
              background: 'transparent',
              color: segment === 'flight' ? '#f97316' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Gamepad2 size={16} />
            <span>🎮 Flight Simulation Leaderboard</span>
          </button>

          <button
            onClick={() => {
              setSegment('academic');
              setSortKey('points');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              border: 'none',
              borderBottom: segment === 'academic' ? '2.5px solid #38bdf8' : '2.5px solid transparent',
              background: 'transparent',
              color: segment === 'academic' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={16} />
            <span>🎓 Academic & Quiz Leaderboard</span>
          </button>
        </div>

        {/* Current user snapshot */}
        {currentUser && currentUserPosition > 0 && (
          <div className="lb-you-card">
            <div className="lb-you-left">
              <span className="lb-you-label">YOUR RANK</span>
              <span className="lb-you-position">#{currentUserPosition}</span>
            </div>
            <span className="lb-you-avatar">{currentUser.avatar}</span>
            <div className="lb-you-info">
              <span className="lb-you-name">{currentUser.username}</span>
              <span className="lb-you-rank" style={{ color: getRankForMissions((currentUser.completedMissions || []).length).color }}>
                {getRankForMissions((currentUser.completedMissions || []).length).icon}{' '}
                {getRankForMissions((currentUser.completedMissions || []).length).label}
              </span>
            </div>
            <div className="lb-you-stats">
              {segment === 'flight' ? (
                <>
                  <div className="lb-you-stat">
                    <Rocket size={14} />
                    <span>{(currentUser.completedMissions || []).length} / 76 missions</span>
                  </div>
                  <div className="lb-you-stat">
                    <Zap size={14} color="#fbbf24" />
                    <span>{(currentUser.coins || 0).toLocaleString()} coins</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="lb-you-stat">
                    <GraduationCap size={14} color="#38bdf8" />
                    <span>{currentUser.academicPoints || 0} Academic Pts</span>
                  </div>
                  <div className="lb-you-stat">
                    <BookOpen size={14} color="#4ade80" />
                    <span>{(currentUser.passedQuizzes || []).length} Quizzes Passed</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Sort tabs */}
        <div className="lb-sort-tabs">
          {segment === 'flight' ? (
            <>
              <button
                className={`lb-sort-tab ${sortKey === 'missions' ? 'active' : ''}`}
                onClick={() => setSortKey('missions')}
              >
                <Target size={14} /> Missions (76)
              </button>
              <button
                className={`lb-sort-tab ${sortKey === 'coins' ? 'active' : ''}`}
                onClick={() => setSortKey('coins')}
              >
                <Zap size={14} /> Coins
              </button>
            </>
          ) : (
            <>
              <button
                className={`lb-sort-tab ${sortKey === 'points' ? 'active' : ''}`}
                onClick={() => setSortKey('points')}
              >
                <Zap size={14} /> Academic Points
              </button>
              <button
                className={`lb-sort-tab ${sortKey === 'quizzes' ? 'active' : ''}`}
                onClick={() => setSortKey('quizzes')}
              >
                <GraduationCap size={14} /> Quizzes Passed
              </button>
            </>
          )}
        </div>

        {/* Table */}
        <div className="lb-table-wrapper">
          <div className="lb-table-header">
            <span className="lb-col-pos">#</span>
            <span className="lb-col-cadet">Cadet</span>
            <span className="lb-col-rank">Rank</span>
            <span className="lb-col-missions">
              {segment === 'flight' ? 'Missions' : 'Quizzes'}
            </span>
            <span className="lb-col-coins">
              {segment === 'flight' ? 'Coins' : 'Acad Pts'}
            </span>
            <span className="lb-col-progress">Progress</span>
          </div>

          <div className="lb-rows">
            {leaderboardData.length === 0 && (
              <div className="lb-empty">
                <Rocket size={40} color="#334155" />
                <p>No cadets registered yet. Be the first!</p>
              </div>
            )}
            {leaderboardData.map((cadet, idx) => {
              const pos = idx + 1;
              const medal = getMedalIcon(pos);
              const isMe = currentUser?.username.toLowerCase() === cadet.username.toLowerCase();
              const progressPct =
                segment === 'flight'
                  ? Math.min(100, Math.round((cadet.missionsCount / 76) * 100))
                  : Math.min(100, Math.round((cadet.quizzesCount / 4) * 100));

              return (
                <div
                  key={cadet.id}
                  className={`lb-row ${pos <= 3 ? 'lb-row-top' : ''} ${isMe ? 'lb-row-me' : ''}`}
                >
                  {/* Position */}
                  <div className="lb-col-pos">
                    <span
                      className="lb-medal"
                      style={{ color: medal.color, fontWeight: pos <= 3 ? 700 : 400 }}
                    >
                      {medal.emoji}
                    </span>
                  </div>

                  {/* Cadet info */}
                  <div className="lb-col-cadet">
                    <span className="lb-avatar">{cadet.avatar}</span>
                    <span className="lb-username">
                      {cadet.username}
                      {isMe && <span className="lb-you-badge">YOU</span>}
                    </span>
                  </div>

                  {/* Rank label */}
                  <div className="lb-col-rank">
                    <span className="lb-rank-pill" style={{ color: cadet.rankInfo.color, borderColor: cadet.rankInfo.color + '44' }}>
                      {cadet.rankInfo.icon} {cadet.rankInfo.label}
                    </span>
                  </div>

                  {/* Metric 1 */}
                  <div className="lb-col-missions">
                    <span className="lb-missions-num">
                      {segment === 'flight' ? cadet.missionsCount : cadet.quizzesCount}
                    </span>
                    <span className="lb-missions-denom">
                      {segment === 'flight' ? '/76' : '/4'}
                    </span>
                  </div>

                  {/* Metric 2 */}
                  <div className="lb-col-coins">
                    <Zap size={12} color={segment === 'flight' ? '#fbbf24' : '#38bdf8'} />
                    <span>
                      {segment === 'flight'
                        ? cadet.coins.toLocaleString()
                        : cadet.academicPts.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="lb-col-progress">
                    <div className="lb-progress-track">
                      <div
                        className="lb-progress-fill"
                        style={{
                          width: `${progressPct}%`,
                          background: segment === 'flight' ? cadet.rankInfo.color : '#38bdf8',
                        }}
                      />
                    </div>
                    <span className="lb-progress-pct">{progressPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="lb-footer">
          <Medal size={14} color="#64748b" />
          <span>
            {segment === 'flight'
              ? 'Flight leaderboard updates as missions are beaten'
              : 'Academic leaderboard updates as quizzes & lessons are passed'}
          </span>
          {currentUserPosition > 3 && (
            <span className="lb-climb-tip">
              <ChevronUp size={12} /> Complete more modules to climb the rankings!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
