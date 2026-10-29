import React from 'react';
import type { Board, Color, Position } from '../engine/types';
import { PieceIcon } from '../assets/PieceIcons';
import { FILES, RANKS } from '../engine/constants';

interface ChessBoardProps {
  board: Board;
  currentTurn: Color;
  selectedSquare: Position | null;
  legalMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  isKingInCheck: boolean;
  isFlipped: boolean;
  theme: string;
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
  onSquareClick
}) => {
  // Rendering rows & cols based on board flip
  const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

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

            const showRank = visualColIdx === 0;
            const showFile = visualRowIdx === 7;
            const rankLabel = RANKS[r];
            const fileLabel = FILES[c];

            let squareClasses = `square ${isLight ? 'light-square' : 'dark-square'}`;
            if (isSelected) squareClasses += ' is-selected';
            if (isLastMoveSquare) squareClasses += ' is-last-move';
            if (isCheckedKing) squareClasses += ' is-in-check';

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
    </div>
  );
};
