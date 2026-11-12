// ============================================================
// NASA Jr_AstroCamp — Learning Stacks Quiz Modal
// Interactive flight readiness quiz testing comprehension after Video, Audio, Comic, or Game
// ============================================================

import React, { useState } from 'react';
import { LEARNING_QUIZZES, type LearningQuiz, type QuizQuestion } from '../../data/learningQuizzes';
import { authService } from '../../utils/authService';
import type { User } from '../../types/auth';
import { soundFx } from '../../utils/audioEffects';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface LearningQuizModalProps {
  isOpen: boolean;
  quizId: string;
  onClose: () => void;
  currentUser: User | null;
  onQuizPassed?: (quizId: string, earnedScore: number, earnedCoins: number) => void;
  onOpenLeaderboard?: () => void;
}

export const LearningQuizModal: React.FC<LearningQuizModalProps> = ({
  isOpen,
  quizId,
  onClose,
  currentUser,
  onQuizPassed,
  onOpenLeaderboard,
}) => {
  const quiz = LEARNING_QUIZZES[quizId] || LEARNING_QUIZZES['quiz-earth-01'];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [passedQuiz, setPassedQuiz] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen) return null;

  const currentQ: QuizQuestion = quiz.questions[currentQIndex];
  const hasSelected = selectedAnswers[currentQIndex] !== undefined;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundFx.playClick(750);
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: idx }));
  };

  const handleSubmitCurrentAnswer = () => {
    if (!hasSelected || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedAnswers[currentQIndex] === currentQ.correctIndex;
    if (isCorrect) {
      soundFx.playSuccess();
      setScore((s) => s + 1);
    } else {
      soundFx.playWarningAlarm();
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick(800);
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex((i) => i + 1);
      setIsAnswerSubmitted(false);
    } else {
      // Completed all questions
      const finalScore = score + (selectedAnswers[currentQIndex] === currentQ.correctIndex ? 0 : 0);
      const passed = finalScore >= quiz.passingScore;
      setIsCompleted(true);
      setPassedQuiz(passed);

      if (passed) {
        soundFx.playVictory();
        if (currentUser) {
          authService.recordQuizCompletion(
            currentUser.id,
            quiz.id,
            quiz.rewardAcademicPoints,
            quiz.rewardCoins
          );
        }
        onQuizPassed?.(quiz.id, finalScore, quiz.rewardCoins);
      }
    }
  };

  const handleRetry = () => {
    soundFx.playClick(800);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsAnswerSubmitted(false);
    setIsCompleted(false);
    setPassedQuiz(false);
    setScore(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9600,
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
          maxWidth: '680px',
          background: 'linear-gradient(165deg, #090e1c 0%, #030611 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{quiz.badgeEmoji}</span>
            <div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', letterSpacing: '0.1em' }}>
                FLIGHT READINESS ASSESSMENT
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {quiz.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quiz Body */}
        <div style={{ padding: '24px' }}>
          {!isCompleted ? (
            <>
              {/* Progress counter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
                  QUESTION {currentQIndex + 1} OF {quiz.questions.length}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} /> +{quiz.rewardAcademicPoints} PTS / +{quiz.rewardCoins} COINS
                </span>
              </div>

              {/* Question prompt */}
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', lineHeight: '1.4', margin: '0 0 18px' }}>
                {currentQ.question}
              </h4>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQIndex] === oIdx;
                  const isCorrect = oIdx === currentQ.correctIndex;

                  let borderColor = 'rgba(255, 255, 255, 0.1)';
                  let bgColor = 'rgba(15, 23, 42, 0.6)';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      borderColor = '#22c55e';
                      bgColor = 'rgba(34, 197, 94, 0.15)';
                    } else if (isSelected && !isCorrect) {
                      borderColor = '#ef4444';
                      bgColor = 'rgba(239, 68, 68, 0.15)';
                    }
                  } else if (isSelected) {
                    borderColor = '#38bdf8';
                    bgColor = 'rgba(56, 189, 248, 0.15)';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswerSubmitted}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: bgColor,
                        border: `1.5px solid ${borderColor}`,
                        color: isSelected || (isAnswerSubmitted && isCorrect) ? '#ffffff' : '#cbd5e1',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        textAlign: 'left',
                        cursor: isAnswerSubmitted ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && isCorrect && <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <XCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>

              {/* Scientific Explanation when submitted */}
              {isAnswerSubmitted && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: selectedAnswers[currentQIndex] === currentQ.correctIndex
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    borderLeft: `3px solid ${selectedAnswers[currentQIndex] === currentQ.correctIndex ? '#22c55e' : '#ef4444'}`,
                    marginBottom: '18px',
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: selectedAnswers[currentQIndex] === currentQ.correctIndex ? '#4ade80' : '#f87171' }}>
                    {selectedAnswers[currentQIndex] === currentQ.correctIndex ? '✓ Correct Aerospace Telemetry!' : '✗ Trajectory Anomaly'}
                  </div>
                  <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>{currentQ.explanation}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                    Ref: {currentQ.nasaRef}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitCurrentAnswer}
                    disabled={!hasSelected}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '10px',
                      background: hasSelected ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255, 255, 255, 0.05)',
                      border: hasSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: hasSelected ? '#ffffff' : '#64748b',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: hasSelected ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      border: '1.5px solid rgba(254, 215, 170, 0.6)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
                    }}
                  >
                    <span>{currentQIndex < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {passedQuiz ? '🎖️' : '⚠️'}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: passedQuiz ? '#4ade80' : '#f87171', margin: '0 0 8px' }}>
                {passedQuiz ? 'Flight Readiness Certified!' : 'Flight Certification Deferred'}
              </h3>
              <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '0 0 16px' }}>
                You scored <strong>{score} / {quiz.questions.length}</strong> on this aerospace evaluation.
              </p>

              {passedQuiz ? (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    maxWidth: '420px',
                    margin: '0 auto 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fbbf24', fontWeight: 800 }}>
                    <Zap size={16} />
                    <span>+{quiz.rewardCoins} Astro-Coins Awarded</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#38bdf8', fontWeight: 800 }}>
                    <Sparkles size={16} />
                    <span>+{quiz.rewardAcademicPoints} Academic Points to Profile</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Synced to Academic Leaderboard & Milestone Progress
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 20px' }}>
                  You need at least {quiz.passingScore} correct answers to pass. Re-read the outer space dossier or review your chosen stack and try again!
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {!passedQuiz ? (
                  <button
                    onClick={handleRetry}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1.5px solid #38bdf8',
                      color: '#38bdf8',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Retry Assessment</span>
                  </button>
                ) : (
                  <>
                    {onOpenLeaderboard && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenLeaderboard();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          background: 'rgba(255, 215, 0, 0.12)',
                          border: '1.5px solid #ffd700',
                          color: '#ffd700',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Trophy size={15} />
                        <span>View Academic Leaderboard</span>
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: '1.5px solid #38bdf8',
                        color: '#ffffff',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Return to Learning Hub
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

