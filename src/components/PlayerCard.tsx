import React from 'react';
import type { Color, Piece } from '../engine/types';
import { PieceIcon } from '../assets/PieceIcons';
import { formatTime } from '../utils/helpers';
import { Clock, User, Bot } from 'lucide-react';

interface PlayerCardProps {
  color: Color;
  name: string;
  isTurn: boolean;
  isAI?: boolean;
  capturedPieces: Piece[];
  advantage: number;
  timeRemaining: number;
  hasTimeLimit: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  color,
  name,
  isTurn,
  isAI = false,
  capturedPieces,
  advantage,
  timeRemaining,
  hasTimeLimit
}) => {
  const isWhite = color === 'white';
  const isLowTime = hasTimeLimit && timeRemaining <= 30;
  const isCriticalTime = hasTimeLimit && timeRemaining <= 10;

  // Group captured pieces by piece type to keep layout ultra-compact and avoid overflow
  const pieceCounts: { [type: string]: number } = {};
  capturedPieces.forEach(p => {
    pieceCounts[p.type] = (pieceCounts[p.type] || 0) + 1;
  });

  // Ordered by value: pawn, knight, bishop, rook, queen
  const pieceOrder: Piece['type'][] = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

  return (
    <div className={`player-card ${isTurn ? 'is-active-turn' : ''}`}>
      <div className="player-card-left">
        {/* Avatar with dynamic turn ring */}
        <div className={`player-avatar ${isAI ? 'avatar-ai' : isWhite ? 'avatar-white' : 'avatar-black'}`}>
          {isAI ? <Bot size={16} /> : <User size={16} />}
        </div>

        <div className="player-details">
          <div className="player-title-row">
            <span className="player-display-name">{name}</span>
            {isTurn && <span className="turn-indicator-pill">Sıra Sizde</span>}
          </div>

          {/* Captured pieces compact strip */}
          <div className="captured-pieces-strip">
            {capturedPieces.length > 0 && (
              <div className="captured-icons-group">
                {pieceOrder.map(type => {
                  const count = pieceCounts[type];
                  if (!count) return null;
                  return (
                    <div key={type} className="captured-chip">
                      <span className="captured-mini-svg">
                        {/* The captured piece color is opposite to the player's color */}
                        <PieceIcon color={isWhite ? 'black' : 'white'} type={type} />
                      </span>
                      {count > 1 && <span className="captured-multiplier">×{count}</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {advantage > 0 && (
              <span className="advantage-score-pill">+{advantage}</span>
            )}
          </div>
        </div>
      </div>

      {/* Modern Digital Clock Pill */}
      {hasTimeLimit && (
        <div
          className={`player-clock-pill ${isTurn ? 'clock-running' : ''} ${
            isCriticalTime ? 'clock-critical' : isLowTime ? 'clock-low' : ''
          }`}
        >
          <Clock size={13} className="clock-icon" />
          <span className="clock-digits">{formatTime(timeRemaining)}</span>
        </div>
      )}
    </div>
  );
};
