import type { Board, Color, Position } from '../engine/types';
import { getAllLegalMoves, getLegalMoves } from '../engine/chessEngine';
import { PIECE_VALUES } from '../engine/constants';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'master';

export interface AIResponse {
  from: Position;
  to: Position;
  san?: string;
  eval?: number;
  text?: string;
  winChance?: number;
}

export const DIFFICULTY_CONFIG: Record<
  AIDifficulty,
  { label: string; desc: string; depth: number; maxTime: number }
> = {
  easy: {
    label: 'Kolay',
    desc: 'Başlangıç düzeyi, eğlenceli ve rahat oyun',
    depth: 4,
    maxTime: 600
  },
  medium: {
    label: 'Orta',
    desc: 'Kulüp seviyesi dengeli strateji',
    depth: 8,
    maxTime: 1000
  },
  hard: {
    label: 'Zor',
    desc: 'Yüksek derinlikli taktiksel hamleler',
    depth: 12,
    maxTime: 1500
  },
  master: {
    label: 'Usta',
    desc: 'Stockfish tam güçte derin hesaplama',
    depth: 16,
    maxTime: 2200
  }
};

/**
 * Converts UCI square (e.g. "e2") to Position { row: 6, col: 4 }
 */
export function uciToPosition(sq: string): Position | null {
  if (!sq || sq.length < 2) return null;
  const colChar = sq[0].toLowerCase();
  const rankChar = sq[1];

  const col = colChar.charCodeAt(0) - 97; // 'a' -> 0
  const rank = parseInt(rankChar, 10);
  const row = 8 - rank;

  if (row < 0 || row > 7 || col < 0 || col > 7) return null;
  return { row, col };
}

/**
 * Fallback AI engine using material capture heuristic + positional scoring
 * guarantees AI always plays a legal, smart move even if offline or API drops
 */
export function getLocalFallbackMove(
  board: Board,
  color: Color,
  enPassantTarget: Position | null,
  difficulty: AIDifficulty
): AIResponse | null {
  const allMoves = getAllLegalMoves(board, color, enPassantTarget);
  if (allMoves.length === 0) return null;

  // Easy mode: random with slight bias to captures
  if (difficulty === 'easy') {
    const captureMoves = allMoves.filter(m => board[m.to.row][m.to.col] !== null);
    if (captureMoves.length > 0 && Math.random() < 0.6) {
      const chosen = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      return { from: chosen.from, to: chosen.to };
    }
    const chosen = allMoves[Math.floor(Math.random() * allMoves.length)];
    return { from: chosen.from, to: chosen.to };
  }

  // Medium / Hard / Master fallback: evaluate captures and center control
  let bestScore = -99999;
  let bestMoves: { from: Position; to: Position }[] = [];

  for (const move of allMoves) {
    let score = 0;
    const targetPiece = board[move.to.row][move.to.col];
    const movingPiece = board[move.from.row][move.from.col];

    if (targetPiece) {
      score += PIECE_VALUES[targetPiece.type] * 10 - (movingPiece ? PIECE_VALUES[movingPiece.type] : 0);
    }

    // Center control bonus
    const centerDist = Math.abs(3.5 - move.to.row) + Math.abs(3.5 - move.to.col);
    score += (7 - centerDist) * 0.5;

    // Small random jitter
    score += Math.random() * 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (Math.abs(score - bestScore) < 0.01) {
      bestMoves.push(move);
    }
  }

  const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  return { from: chosen.from, to: chosen.to };
}

/**
 * Fetch Stockfish best move from chess-api.com
 */
export async function fetchStockfishMove(
  fen: string,
  difficulty: AIDifficulty,
  board: Board,
  color: Color,
  enPassantTarget: Position | null
): Promise<AIResponse> {
  const config = DIFFICULTY_CONFIG[difficulty];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.maxTime + 3500);

    const response = await fetch('https://chess-api.com/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fen,
        depth: config.depth,
        variants: 1,
        maxThinkingTime: config.maxTime
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Chess API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.from && data.to) {
      const fromPos = uciToPosition(data.from);
      const toPos = uciToPosition(data.to);

      if (fromPos && toPos) {
        // Validate that this move is legal in our board state
        const legal = getLegalMoves(board, fromPos, enPassantTarget);
        const isLegal = legal.some(m => m.row === toPos.row && m.col === toPos.col);

        if (isLegal) {
          return {
            from: fromPos,
            to: toPos,
            san: data.san,
            eval: typeof data.eval === 'number' ? data.eval : 0,
            text: data.text,
            winChance: data.winChance
          };
        }
      }
    }

    // Fallback if returned move is not parsed
    const fallback = getLocalFallbackMove(board, color, enPassantTarget, difficulty);
    if (fallback) return fallback;
    throw new Error('No valid move found');
  } catch (error) {
    // Graceful offline/network fallback
    const fallback = getLocalFallbackMove(board, color, enPassantTarget, difficulty);
    if (fallback) {
      return {
        ...fallback,
        eval: 0,
        text: 'Yerel zeka ile hamle oynandı.'
      };
    }
    throw error;
  }
}
