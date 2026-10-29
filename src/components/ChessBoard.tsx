import React from 'react';
import type { Board, Color, Position } from '../engine/types';
import { PieceIcon } from '../assets/PieceIcons';
import { FILES, RANKS } from '../engine/constants';
import { Star } from 'lucide-react';

export interface BoardArrow {
  from: Position;
  to: Position;
  color?: string;
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

            const showRank = visualColIdx === 0;
            const showFile = visualRowIdx === 7;
            const rankLabel = RANKS[r];
            const fileLabel = FILES[c];

            let squareClasses = `square ${isLight ? 'light-square' : 'dark-square'}`;
            if (isSelected) squareClasses += ' is-selected';
            if (isLastMoveSquare) squareClasses += ' is-last-move';
            if (isCheckedKing) squareClasses += ' is-in-check';
            if (isBestMoveSquare) squareClasses += ' is-best-move-target';

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

                {/* Best Move Glowing Star Badge */}
                {isBestMoveSquare && (
                  <div className="best-move-badge-wrap" title="En İyi Hamle (Mükemmel)">
                    <div className="best-move-star-circle">
                      <Star size={13} fill="#ffffff" color="#ffffff" />
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

      {/* Recommended Move SVG Arrow Overlay */}
      {arrow && (
        <svg
          className="board-arrow-svg-overlay"
          viewBox="0 0 800 800"
          pointerEvents="none"
        >
          <defs>
            <marker
              id="arrowhead-best"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill={arrow.color || '#16a34a'} />
            </marker>
          </defs>
          {(() => {
            const start = getSquareCenter(arrow.from);
            const end = getSquareCenter(arrow.to);

            // Slightly shorten arrow so head fits nicely on square
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const shorten = 20;
            const targetX = end.x - (dx / dist) * shorten;
            const targetY = end.y - (dy / dist) * shorten;

            return (
              <line
                x1={start.x}
                y1={start.y}
                x2={targetX}
                y2={targetY}
                stroke={arrow.color || '#16a34a'}
                strokeWidth="14"
                strokeLinecap="round"
                strokeOpacity="0.88"
                markerEnd="url(#arrowhead-best)"
              />
            );
          })()}
        </svg>
      )}
    </div>
  );
};
