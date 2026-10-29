import React, { useState, useRef } from 'react';
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
  arrows?: BoardArrow[];
  bestMoveBadgePosition?: Position | null;
  reviewBadge?: ReviewBadge | null;
  highlightedSquares?: HighlightedSquare[];
  userDrawingEnabled?: boolean;
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
  arrows = [],
  bestMoveBadgePosition,
  reviewBadge,
  highlightedSquares = [],
  userDrawingEnabled = true,
  onSquareClick
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  // User right-click drawing states (like Chess.com / Lichess)
  const [userArrows, setUserArrows] = useState<BoardArrow[]>([]);
  const [userHighlights, setUserHighlights] = useState<Position[]>([]);
  const [rightClickStart, setRightClickStart] = useState<Position | null>(null);
  const [dragPreview, setDragPreview] = useState<BoardArrow | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Position | null>(null);

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

  // Convert mouse event coordinates to board Position
  const getSquareFromMouseEvent = (e: React.MouseEvent): Position | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const colIdx = Math.floor((relX / rect.width) * 8);
    const rowIdx = Math.floor((relY / rect.height) * 8);
    if (rowIdx < 0 || rowIdx > 7 || colIdx < 0 || colIdx > 7) return null;
    const r = isFlipped ? 7 - rowIdx : rowIdx;
    const c = isFlipped ? 7 - colIdx : colIdx;
    return { row: r, col: c };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!userDrawingEnabled) return;
    if (e.button === 2) {
      // Right click: start drawing arrow / highlighting
      e.preventDefault();
      const sq = getSquareFromMouseEvent(e);
      if (sq) {
        setRightClickStart(sq);
      }
    } else if (e.button === 0) {
      // Left click: clear all user drawings (standard Chess.com / Lichess behavior)
      if (userArrows.length > 0) setUserArrows([]);
      if (userHighlights.length > 0) setUserHighlights([]);
      setRightClickStart(null);
      setDragPreview(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!userDrawingEnabled || !rightClickStart) return;
    const sq = getSquareFromMouseEvent(e);
    if (sq && (sq.row !== rightClickStart.row || sq.col !== rightClickStart.col)) {
      setDragPreview({ from: rightClickStart, to: sq, color: '#f59e0b' });
    } else {
      setDragPreview(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!userDrawingEnabled) return;
    if (e.button === 2 && rightClickStart) {
      e.preventDefault();
      const sq = getSquareFromMouseEvent(e);
      if (sq) {
        if (sq.row === rightClickStart.row && sq.col === rightClickStart.col) {
          // Toggle square highlight
          setUserHighlights(prev => {
            const exists = prev.some(p => p.row === sq.row && p.col === sq.col);
            if (exists) return prev.filter(p => !(p.row === sq.row && p.col === sq.col));
            return [...prev, sq];
          });
        } else {
          // Toggle arrow from rightClickStart to sq
          setUserArrows(prev => {
            const exists = prev.some(
              a =>
                a.from.row === rightClickStart.row &&
                a.from.col === rightClickStart.col &&
                a.to.row === sq.row &&
                a.to.col === sq.col
            );
            if (exists) {
              return prev.filter(
                a =>
                  !(
                    a.from.row === rightClickStart.row &&
                    a.from.col === rightClickStart.col &&
                    a.to.row === sq.row &&
                    a.to.col === sq.col
                  )
              );
            }
            return [...prev, { from: rightClickStart, to: sq, color: '#f59e0b' }];
          });
        }
      }
      setRightClickStart(null);
      setDragPreview(null);
    }
  };

  // Combine system arrows + user drawn arrows + active drag preview
  const allArrows: BoardArrow[] = [
    ...(arrows.length > 0 ? arrows : arrow ? [arrow] : []),
    ...userArrows,
    ...(dragPreview ? [dragPreview] : [])
  ];

  return (
    <div
      ref={boardRef}
      className={`board-container ${theme}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={e => e.preventDefault()}
    >
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

            // User right-click highlight
            const isUserHighlighted = userHighlights.some(p => p.row === r && p.col === c);

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
            } else if (isUserHighlighted) {
              customSquareStyle.backgroundColor = 'rgba(245, 158, 11, 0.42)';
              customSquareStyle.boxShadow = 'inset 0 0 0 2.5px #f59e0b';
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
                onClick={() => {
                  if (userArrows.length > 0) setUserArrows([]);
                  if (userHighlights.length > 0) setUserHighlights([]);
                  onSquareClick(r, c);
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={e => {
                  e.preventDefault();
                  if (draggedSquare) {
                    if (draggedSquare.row !== r || draggedSquare.col !== c) {
                      onSquareClick(r, c);
                    }
                    setDraggedSquare(null);
                  }
                }}
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

                {/* Chess piece with smooth sliding animation and drag-and-drop */}
                {piece && (
                  <div
                    key={`${piece.color}-${piece.type}-${r}-${c}`}
                    className={`piece-container ${isSliding ? 'is-sliding' : ''} ${
                      draggedSquare && draggedSquare.row === r && draggedSquare.col === c ? 'is-dragging' : ''
                    }`}
                    style={slideStyle}
                    draggable={piece.color === currentTurn}
                    onDragStart={e => {
                      setDraggedSquare({ row: r, col: c });
                      onSquareClick(r, c);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', JSON.stringify({ row: r, col: c }));
                    }}
                    onDragEnd={() => {
                      setDraggedSquare(null);
                    }}
                  >
                    <PieceIcon color={piece.color} type={piece.type} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Chess.com / Lichess Style SVG Arrow Overlay (18px wide shaft, bold 42px arrowhead, opacity 0.85) */}
      {allArrows.length > 0 && (
        <svg
          className="board-arrow-svg-overlay"
          viewBox="0 0 800 800"
          pointerEvents="none"
        >
          {allArrows.map((ar, idx) => {
            const start = getSquareCenter(ar.from);
            const end = getSquareCenter(ar.to);

            const dCol = ar.to.col - ar.from.col;
            const dRow = ar.to.row - ar.from.row;
            const isKnight =
              (Math.abs(dCol) === 1 && Math.abs(dRow) === 2) ||
              (Math.abs(dCol) === 2 && Math.abs(dRow) === 1);

            const color = ar.color || '#22c55e';
            const markerId = `arrowhead-${idx}-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

            if (isKnight) {
              // L-shape arrow for knight with perfectly rounded corner
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
              const shorten = 32;
              const targetX = end.x - (dx / len) * shorten;
              const targetY = end.y - (dy / len) * shorten;

              return (
                <g key={idx}>
                  <defs>
                    <marker
                      id={markerId}
                      markerUnits="userSpaceOnUse"
                      markerWidth="48"
                      markerHeight="48"
                      refX="36"
                      refY="24"
                      orient="auto"
                    >
                      <polygon points="4 6, 40 24, 4 42" fill={color} fillOpacity="0.88" />
                    </marker>
                  </defs>
                  <path
                    d={`M ${start.x} ${start.y} L ${cornerX} ${cornerY} L ${targetX} ${targetY}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.85"
                    markerEnd={`url(#${markerId})`}
                  />
                </g>
              );
            }

            // Diagonal or Straight move (Chess.com robust 18px line with bold arrowhead)
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;
            const shorten = 32;
            const targetX = end.x - (dx / dist) * shorten;
            const targetY = end.y - (dy / dist) * shorten;

            return (
              <g key={idx}>
                <defs>
                  <marker
                    id={markerId}
                    markerUnits="userSpaceOnUse"
                    markerWidth="48"
                    markerHeight="48"
                    refX="36"
                    refY="24"
                    orient="auto"
                  >
                    <polygon points="4 6, 40 24, 4 42" fill={color} fillOpacity="0.88" />
                  </marker>
                </defs>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={targetX}
                  y2={targetY}
                  stroke={color}
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeOpacity="0.85"
                  markerEnd={`url(#${markerId})`}
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
