// ============================================================
// Jr. AstroCamp — Leaderboard Modal
// Ranks all cadets by: missions completed → coins → join date
// ============================================================

import React, { useState, useMemo } from 'react';
import { authService } from '../utils/authService';
import type { User } from '../types/auth';
import { Trophy, Star, Rocket, Medal, X, Zap, Target, ChevronUp } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

type SortKey = 'missions' | 'coins' | 'rank';

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
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('missions');

  const leaderboardData = useMemo(() => {
    const allUsers = authService.getUsers();
    // Only show cadets on leaderboard
    const cadets = allUsers.filter((u) => u.role === 'cadet');

    const withStats = cadets.map((u) => ({
      ...u,
      missionsCount: (u.completedMissions || []).length,
      rankInfo: getRankForMissions((u.completedMissions || []).length),
    }));

    // Sort
    return withStats.sort((a, b) => {
      if (sortKey === 'missions') {
        if (b.missionsCount !== a.missionsCount) return b.missionsCount - a.missionsCount;
        return b.coins - a.coins;
      }
      if (sortKey === 'coins') {
        if (b.coins !== a.coins) return b.coins - a.coins;
        return b.missionsCount - a.missionsCount;
      }
      // rank sort
      return b.missionsCount - a.missionsCount;
    });
  }, [sortKey]);

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
              <h2 className="lb-title">Mission Leaderboard</h2>
              <p className="lb-subtitle">Top Jr. AstroCamp Cadets — Ranked by Achievement</p>
            </div>
          </div>
          <button className="lb-close-btn" onClick={onClose}>
            <X size={20} />
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
              <div className="lb-you-stat">
                <Rocket size={14} />
                <span>{(currentUser.completedMissions || []).length} missions</span>
              </div>
              <div className="lb-you-stat">
                <Zap size={14} color="#fbbf24" />
                <span>{currentUser.coins.toLocaleString()} coins</span>
              </div>
            </div>
          </div>
        )}

        {/* Sort tabs */}
        <div className="lb-sort-tabs">
          <button
            className={`lb-sort-tab ${sortKey === 'missions' ? 'active' : ''}`}
            onClick={() => setSortKey('missions')}
          >
            <Target size={14} /> Missions
          </button>
          <button
            className={`lb-sort-tab ${sortKey === 'coins' ? 'active' : ''}`}
            onClick={() => setSortKey('coins')}
          >
            <Zap size={14} /> Coins
          </button>
          <button
            className={`lb-sort-tab ${sortKey === 'rank' ? 'active' : ''}`}
            onClick={() => setSortKey('rank')}
          >
            <Star size={14} /> Rank
          </button>
        </div>

        {/* Table */}
        <div className="lb-table-wrapper">
          <div className="lb-table-header">
            <span className="lb-col-pos">#</span>
            <span className="lb-col-cadet">Cadet</span>
            <span className="lb-col-rank">Rank</span>
            <span className="lb-col-missions">Missions</span>
            <span className="lb-col-coins">Coins</span>
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
              const progressPct = Math.min(100, Math.round((cadet.missionsCount / 76) * 100));

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
                      {pos <= 3 ? medal.emoji : medal.emoji}
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

                  {/* Missions */}
                  <div className="lb-col-missions">
                    <span className="lb-missions-num">{cadet.missionsCount}</span>
                    <span className="lb-missions-denom">/76</span>
                  </div>

                  {/* Coins */}
                  <div className="lb-col-coins">
                    <Zap size={12} color="#fbbf24" />
                    <span>{cadet.coins.toLocaleString()}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="lb-col-progress">
                    <div className="lb-progress-track">
                      <div
                        className="lb-progress-fill"
                        style={{
                          width: `${progressPct}%`,
                          background: cadet.rankInfo.color,
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
          <span>Leaderboard updates live as cadets complete missions</span>
          {currentUserPosition > 3 && (
            <span className="lb-climb-tip">
              <ChevronUp size={12} /> Complete more missions to climb the ranks!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;

