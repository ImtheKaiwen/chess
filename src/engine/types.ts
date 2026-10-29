export type Color = 'white' | 'black';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export interface Piece {
  type: PieceType;
  color: Color;
  firstMove?: boolean;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface MoveRecord {
  from: Position;
  to: Position;
  piece: Piece;
  captured: Piece | null;
  enPassantTarget: Position | null;
  prevEnPassantTarget: Position | null;
  rookMove?: {
    from: Position;
    to: Position;
    piece: Piece;
  } | null;
  promotedTo?: PieceType;
  san: string; // Standard Algebraic Notation (e.g. "e4", "Nf3+", "O-O")
}

export type GameStatus = 'active' | 'check' | 'checkmate' | 'stalemate' | 'resigned' | 'draw';

export interface GameState {
  board: Board;
  currentTurn: Color;
  moveHistory: MoveRecord[];
  redoStack: MoveRecord[];
  enPassantTarget: Position | null;
  selectedSquare: Position | null;
  legalMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  status: GameStatus;
  winner: Color | 'draw' | null;
  isFlipped: boolean;
  whiteTime: number; // in seconds
  blackTime: number;
  isTimerRunning: boolean;
}
