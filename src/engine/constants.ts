import type { Board, PieceType } from './types';

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0
};

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black major pieces (Rank 8, row 0)
  board[0][0] = { type: 'rook', color: 'black', firstMove: true };
  board[0][1] = { type: 'knight', color: 'black', firstMove: true };
  board[0][2] = { type: 'bishop', color: 'black', firstMove: true };
  board[0][3] = { type: 'queen', color: 'black', firstMove: true };
  board[0][4] = { type: 'king', color: 'black', firstMove: true };
  board[0][5] = { type: 'bishop', color: 'black', firstMove: true };
  board[0][6] = { type: 'knight', color: 'black', firstMove: true };
  board[0][7] = { type: 'rook', color: 'black', firstMove: true };

  // Black pawns (Rank 7, row 1)
  for (let c = 0; c < 8; c++) {
    board[1][c] = { type: 'pawn', color: 'black', firstMove: true };
  }

  // White pawns (Rank 2, row 6)
  for (let c = 0; c < 8; c++) {
    board[6][c] = { type: 'pawn', color: 'white', firstMove: true };
  }

  // White major pieces (Rank 1, row 7)
  board[7][0] = { type: 'rook', color: 'white', firstMove: true };
  board[7][1] = { type: 'knight', color: 'white', firstMove: true };
  board[7][2] = { type: 'bishop', color: 'white', firstMove: true };
  board[7][3] = { type: 'queen', color: 'white', firstMove: true };
  board[7][4] = { type: 'king', color: 'white', firstMove: true };
  board[7][5] = { type: 'bishop', color: 'white', firstMove: true };
  board[7][6] = { type: 'knight', color: 'white', firstMove: true };
  board[7][7] = { type: 'rook', color: 'white', firstMove: true };

  return board;
}
