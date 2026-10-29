import React from 'react';
import type { Board, Color, Position } from '../engine/types';
import { PieceIcon } from '../assets/PieceIcons';
import { FILES, RANKS } from '../engine/constants';
import { Star, ThumbsUp, AlertTriangle, XCircle } from 'lucide-react';

export interface BoardArrow {
  from: Position;
  to: Position;
  color?: string;
}

export type ReviewBadgeType = 'best' | 'good' | 'inaccuracy' | 'blunder';

export interface ReviewBadge {
  position: Position;
  type: ReviewBadgeType;
}

export interface HighlightedSquare {
  position: Position;
  color?: string;
  borderColor?: string;
}

interface ChessBoardProps {
  board: Board;
  currentTurn: Color;
  selectedSquare: Position | null;
  legalMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  isKingInCheck: boolean;
  isFlipped: boolean;
  theme: string;
  arrow?: BoardArrow | null;
  bestMoveBadgePosition?: Position | null;
  reviewBadge?: ReviewBadge | null;
  highlightedSquares?: HighlightedSquare[];
  onSquareClick: (row: number, col: number) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  currentTurn,
  selectedSquare,
  legalMoves,
  lastMove,
  isKingInCheck,
  isFlipped,
  theme,
  arrow,
  bestMoveBadgePosition,
  reviewBadge,
  highlightedSquares = [],
  onSquareClick
}) => {
  // Rendering rows & cols based on board flip
  const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  // Helper to calculate visual pixel centers (in 0..800 viewBox) for arrows
  const getSquareCenter = (pos: Position) => {
    const visualCol = isFlipped ? 7 - pos.col : pos.col;
    const visualRow = isFlipped ? 7 - pos.row : pos.row;
    return {
      x: visualCol * 100 + 50,
      y: visualRow * 100 + 50
    };
  };

  return (
    <div className={`board-container ${theme}`}>
      <div className="chessboard-grid">
        {rows.map((r, visualRowIdx) =>
          cols.map((c, visualColIdx) => {
            const piece = board[r][c];
            const isLight = (r + c) % 2 === 0;

            const isSelected = selectedSquare?.row === r && selectedSquare?.col === c;
            const isLegal = legalMoves.some(m => m.row === r && m.col === c);
            const isCapture = isLegal && piece !== null && piece.color !== currentTurn;

            const isLastMoveSquare =
              (lastMove?.from.row === r && lastMove?.from.col === c) ||
              (lastMove?.to.row === r && lastMove?.to.col === c);

            const isLastMoveDestination =
              lastMove?.to.row === r && lastMove?.to.col === c;

            const isCheckedKing =
              isKingInCheck &&
              piece?.type === 'king' &&
              piece?.color === currentTurn;

            const isBestMoveSquare =
              bestMoveBadgePosition &&
              bestMoveBadgePosition.row === r &&
              bestMoveBadgePosition.col === c;

            // Determine active review badge (best, good, inaccuracy, blunder)
            const activeBadge =
              reviewBadge && reviewBadge.position.row === r && reviewBadge.position.col === c
                ? reviewBadge.type
                : isBestMoveSquare
                ? 'best'
                : null;

            // Check if square has highlight (e.g., blunder red or good blue)
            const squareHighlight = highlightedSquares.find(
              h => h.position.row === r && h.position.col === c
            );

            const showRank = visualColIdx === 0;
            const showFile = visualRowIdx === 7;
            const rankLabel = RANKS[r];
            const fileLabel = FILES[c];

            let squareClasses = `square ${isLight ? 'light-square' : 'dark-square'}`;
            if (isSelected) squareClasses += ' is-selected';
            if (isLastMoveSquare) squareClasses += ' is-last-move';
            if (isCheckedKing) squareClasses += ' is-in-check';
            if (activeBadge === 'best') squareClasses += ' is-best-move-target';

            const customSquareStyle: React.CSSProperties = {};
            if (squareHighlight) {
              if (squareHighlight.color) customSquareStyle.backgroundColor = squareHighlight.color;
              if (squareHighlight.borderColor) {
                customSquareStyle.boxShadow = `inset 0 0 0 2.5px ${squareHighlight.borderColor}`;
              }
            }

            // Calculate slide translation offsets for the piece on destination square
            let slideStyle: React.CSSProperties | undefined;
            let isSliding = false;

            if (isLastMoveDestination && piece) {
              const deltaCol = isFlipped
                ? lastMove.to.col - lastMove.from.col
                : lastMove.from.col - lastMove.to.col;
              const deltaRow = isFlipped
                ? lastMove.to.row - lastMove.from.row
                : lastMove.from.row - lastMove.to.row;

              slideStyle = {
                '--slide-x': `${deltaCol * 100}%`,
                '--slide-y': `${deltaRow * 100}%`
              } as React.CSSProperties;
              isSliding = true;
            }

            return (
              <div
                key={`${r}-${c}`}
                className={squareClasses}
                style={customSquareStyle}
                onClick={() => onSquareClick(r, c)}
                data-row={r}
                data-col={c}
              >
                {/* Coordinates */}
                {showRank && <span className="coord-label coord-rank">{rankLabel}</span>}
                {showFile && <span className="coord-label coord-file">{fileLabel}</span>}

                {/* Move hints */}
                {isLegal && !isCapture && <div className="move-hint-dot" />}
                {isLegal && isCapture && <div className="move-hint-capture-ring" />}

                {/* Review Badge (Best = Star, Good = ThumbsUp, Blunder = Red X) */}
                {activeBadge && (
                  <div
                    className={`best-move-badge-wrap badge-${activeBadge}`}
                    title={
                      activeBadge === 'best'
                        ? 'En İyi Hamle (Mükemmel)'
                        : activeBadge === 'good'
                        ? 'İyi Hamle'
                        : activeBadge === 'inaccuracy'
                        ? 'Hata'
                        : 'Büyük Hata'
                    }
                  >
                    <div className={`best-move-star-circle badge-${activeBadge}`}>
                      {activeBadge === 'best' && <Star size={12} fill="#16a34a" color="#16a34a" />}
                      {activeBadge === 'good' && <ThumbsUp size={11} fill="#0284c7" color="#0284c7" />}
                      {activeBadge === 'inaccuracy' && <AlertTriangle size={12} color="#d97706" />}
                      {activeBadge === 'blunder' && <XCircle size={12} color="#dc2626" />}
                    </div>
                  </div>
                )}

                {/* Chess piece with smooth sliding animation */}
                {piece && (
                  <div
                    key={`${piece.color}-${piece.type}-${r}-${c}`}
                    className={`piece-container ${isSliding ? 'is-sliding' : ''}`}
                    style={slideStyle}
                  >
                    <PieceIcon color={piece.color} type={piece.type} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Recommended Move SVG Arrow Overlay (Slender 7px arrow, L-shape for knight) */}
      {arrow && (
        <svg
          className="board-arrow-svg-overlay"
          viewBox="0 0 800 800"
          pointerEvents="none"
        >
          <defs>
            <marker
              id="arrowhead-board"
              markerUnits="userSpaceOnUse"
              markerWidth="32"
              markerHeight="32"
              refX="22"
              refY="12"
              orient="auto"
            >
              <polygon points="0 4, 22 12, 0 20" fill={arrow.color || '#16a34a'} />
            </marker>
          </defs>
          {(() => {
            const start = getSquareCenter(arrow.from);
            const end = getSquareCenter(arrow.to);

            const dCol = arrow.to.col - arrow.from.col;
            const dRow = arrow.to.row - arrow.from.row;
            const isKnight =
              (Math.abs(dCol) === 1 && Math.abs(dRow) === 2) ||
              (Math.abs(dCol) === 2 && Math.abs(dRow) === 1);

            if (isKnight) {
              // L-shape arrow for knight
              let cornerX = start.x;
              let cornerY = start.y;
              if (Math.abs(dRow) === 2) {
                cornerY = end.y;
              } else {
                cornerX = end.x;
              }

              const dx = end.x - cornerX;
              const dy = end.y - cornerY;
              const len = Math.sqrt(dx * dx + dy * dy);
              const shorten = 22;
              const targetX = end.x - (dx / len) * shorten;
              const targetY = end.y - (dy / len) * shorten;

              return (
                <path
                  d={`M ${start.x} ${start.y} L ${cornerX} ${cornerY} L ${targetX} ${targetY}`}
                  fill="none"
                  stroke={arrow.color || '#16a34a'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.9"
                  markerEnd="url(#arrowhead-board)"
                />
              );
            }

            // Diagonal or Straight move (clean, slender 7px line)
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const shorten = 22;
            const targetX = end.x - (dx / dist) * shorten;
            const targetY = end.y - (dy / dist) * shorten;

            return (
              <line
                x1={start.x}
                y1={start.y}
                x2={targetX}
                y2={targetY}
                stroke={arrow.color || '#16a34a'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeOpacity="0.9"
                markerEnd="url(#arrowhead-board)"
              />
            );
          })()}
        </svg>
      )}
    </div>
  );
};
