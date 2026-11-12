import React from 'react';
import type { AppRoute } from '../router/useAppRouter';
import { LearningHubModal, type HubTab } from '../components/LearningHubModal';
import type { MissionEvent } from '../types/game';
import type { TeachingFlashcard } from '../data/teachingFlashcards';

export interface LearningHubPageProps {
  initialTab?: HubTab;
  initialIssueId?: string;
  activeEvent: MissionEvent | null;
  collectedFlashcards?: TeachingFlashcard[];
  activeMissionId: string;
  onLaunchMission?: (missionId: string) => void;
  completedMissions?: string[];
  onOpenComicReader?: (issueId?: string) => void;
  onNavigate: (route: AppRoute, params?: Record<string, string>) => void;
  currentUser?: any;
  onOpenCertificate?: (milestoneTitle?: string) => void;
  onOpenLeaderboard?: () => void;
}

export const LearningHubPage: React.FC<LearningHubPageProps> = ({
  initialTab = 'OR_GRAPH',
  initialIssueId,
  activeEvent,
  collectedFlashcards,
  activeMissionId,
  onLaunchMission,
  completedMissions,
  onOpenComicReader,
  onNavigate,
  currentUser,
  onOpenCertificate,
  onOpenLeaderboard,
}) => {
  return (
    <LearningHubModal
      isOpen={true}
      isFullPage={true}
      onClose={() => onNavigate('home')}
      initialTab={initialTab}
      initialIssueId={initialIssueId}
      activeEvent={activeEvent}
      collectedFlashcards={collectedFlashcards}
      activeMissionId={activeMissionId}
      onLaunchMission={onLaunchMission}
      completedMissions={completedMissions}
      onOpenComicReader={onOpenComicReader}
      currentUser={currentUser}
      onOpenCertificate={onOpenCertificate}
      onOpenLeaderboard={onOpenLeaderboard}
    />
  );
};

export default LearningHubPage;
