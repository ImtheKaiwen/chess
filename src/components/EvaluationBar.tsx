import React from 'react';
import { Loader2 } from 'lucide-react';

interface EvaluationBarProps {
  score: number; // in centipawns or pawns (e.g. +0.5 = white advantage)
  isThinking: boolean;
  aiDifficulty?: string;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ score, isThinking, aiDifficulty }) => {
  // Clamp score between -10 and +10 for visual representation
  const clamped = Math.max(-10, Math.min(10, score));
  // Convert -10..+10 to 0%..100% (where 50% is even, >50% white advantage)
  const whitePercent = 50 + clamped * 4.5;

  const displayScore = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);

  return (
    <div className="eval-container">
      <div className="eval-bar-wrapper">
        <div className="eval-bar-fill" style={{ height: `${whitePercent}%` }} />
        <span className="eval-score-label">{displayScore}</span>
      </div>

      <div className="eval-status-info">
        {isThinking ? (
          <div className="eval-thinking-pill">
            <Loader2 size={13} className="spin-icon" />
            <span>AI hesaplıyor...</span>
          </div>
        ) : (
          <span className="eval-engine-label">Stockfish {aiDifficulty || ''}</span>
        )}
      </div>
    </div>
  );
};
