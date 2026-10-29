import type { Board, Color, MoveRecord, Piece, PieceType, Position } from '../engine/types';
import { FILES, PIECE_VALUES } from '../engine/constants';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export interface CapturedSummary {
  whiteCaptured: Piece[]; // pieces taken from black (owned by white now)
  blackCaptured: Piece[]; // pieces taken from white
  whiteScore: number;
  blackScore: number;
  advantage: { color: Color | null; diff: number };
}

export function calculateCaptured(board: Board): CapturedSummary {
  // Standard army: 8 pawns, 2 knights, 2 bishops, 2 rooks, 1 queen, 1 king
  const initialArmy: Record<PieceType, number> = {
    pawn: 8,
    knight: 2,
    bishop: 2,
    rook: 2,
    queen: 1,
    king: 1
  };

  const currentWhiteCounts: Record<PieceType, number> = { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0, king: 0 };
  const currentBlackCounts: Record<PieceType, number> = { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0, king: 0 };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.color === 'white') currentWhiteCounts[p.type]++;
        else currentBlackCounts[p.type]++;
      }
    }
  }

  // Black pieces captured by White:
  const whiteCaptured: Piece[] = [];
  // White pieces captured by Black:
  const blackCaptured: Piece[] = [];

  const types: PieceType[] = ['queen', 'rook', 'bishop', 'knight', 'pawn'];

  types.forEach(t => {
    const missingBlack = Math.max(0, initialArmy[t] - currentBlackCounts[t]);
    for (let i = 0; i < missingBlack; i++) {
      whiteCaptured.push({ type: t, color: 'black' });
    }

    const missingWhite = Math.max(0, initialArmy[t] - currentWhiteCounts[t]);
    for (let i = 0; i < missingWhite; i++) {
      blackCaptured.push({ type: t, color: 'white' });
    }
  });

  const whiteVal = whiteCaptured.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);
  const blackVal = blackCaptured.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);

  let advantageColor: Color | null = null;
  let diff = 0;
  if (whiteVal > blackVal) {
    advantageColor = 'white';
    diff = whiteVal - blackVal;
  } else if (blackVal > whiteVal) {
    advantageColor = 'black';
    diff = blackVal - whiteVal;
  }

  return {
    whiteCaptured,
    blackCaptured,
    whiteScore: whiteVal,
    blackScore: blackVal,
    advantage: { color: advantageColor, diff }
  };
}

export function boardToFEN(
  board: Board,
  currentTurn: Color,
  enPassantTarget: Position | null,
  moveHistory: MoveRecord[]
): string {
  const rows: string[] = [];
  const pieceChar: Record<PieceType, string> = {
    pawn: 'p',
    knight: 'n',
    bishop: 'b',
    rook: 'r',
    queen: 'q',
    king: 'k'
  };

  for (let r = 0; r < 8; r++) {
    let emptyCount = 0;
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        const ch = pieceChar[p.type];
        rowStr += p.color === 'white' ? ch.toUpperCase() : ch.toLowerCase();
      }
    }
    if (emptyCount > 0) {
      rowStr += emptyCount;
    }
    rows.push(rowStr);
  }

  const activeColor = currentTurn === 'white' ? 'w' : 'b';

  // Castling availability
  let castling = '';
  const whiteKing = board[7][4];
  if (whiteKing && whiteKing.type === 'king' && whiteKing.firstMove) {
    if (board[7][7]?.type === 'rook' && board[7][7]?.firstMove) castling += 'K';
    if (board[7][0]?.type === 'rook' && board[7][0]?.firstMove) castling += 'Q';
  }
  const blackKing = board[0][4];
  if (blackKing && blackKing.type === 'king' && blackKing.firstMove) {
    if (board[0][7]?.type === 'rook' && board[0][7]?.firstMove) castling += 'k';
    if (board[0][0]?.type === 'rook' && board[0][0]?.firstMove) castling += 'q';
  }
  if (!castling) castling = '-';

  const ep = enPassantTarget ? `${FILES[enPassantTarget.col]}${8 - enPassantTarget.row}` : '-';
  const halfmove = 0;
  const fullmove = Math.floor(moveHistory.length / 2) + 1;

  return `${rows.join('/')} ${activeColor} ${castling} ${ep} ${halfmove} ${fullmove}`;
}

export function movesToPGN(moveHistory: MoveRecord[]): string {
  const date = new Date().toISOString().split('T')[0];
  let pgn = `[Event "Casual Game"]\n[Site "KAIWEN CHESS"]\n[Date "${date}"]\n[White "White"]\n[Black "Black"]\n\n`;

  for (let i = 0; i < moveHistory.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const whiteMove = moveHistory[i]?.san || '';
    const blackMove = moveHistory[i + 1]?.san || '';
    pgn += `${moveNum}. ${whiteMove} ${blackMove ? blackMove + ' ' : ''}`;
  }

  return pgn.trim();
}
