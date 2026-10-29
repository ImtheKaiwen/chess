import type { Board, Color, Piece, PieceType, Position, MoveRecord } from './types';
import { FILES } from './constants';

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function pathClear(board: Board, from: Position, to: Position): boolean {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;

  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

  let curRow = from.row + rowStep;
  let curCol = from.col + colStep;

  while (curRow !== to.row || curCol !== to.col) {
    if (board[curRow][curCol] !== null) return false;
    curRow += rowStep;
    curCol += colStep;
  }
  return true;
}

export function findKing(board: Board, color: Color): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function isKingInCheck(board: Board, color: Color): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color !== color) {
        if (isValidMove(board, piece, { row: r, col: c }, kingPos, null, false)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isValidMove(
  board: Board,
  piece: Piece,
  from: Position,
  to: Position,
  enPassantTarget: Position | null = null,
  considerKingSafety: boolean = true
): boolean {
  // Can't move to square with own piece
  const target = board[to.row][to.col];
  if (target && target.color === piece.color) return false;

  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  let valid = false;

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      // 1 square forward
      if (colDiff === 0 && rowDiff === direction && !target) {
        valid = true;
      }
      // 2 squares forward from start
      else if (
        colDiff === 0 &&
        rowDiff === 2 * direction &&
        from.row === startRow &&
        !target &&
        !board[from.row + direction][from.col]
      ) {
        valid = true;
      }
      // Diagonal capture
      else if (Math.abs(colDiff) === 1 && rowDiff === direction) {
        if (target && target.color !== piece.color) {
          valid = true;
        }
        // En passant capture
        else if (!target && enPassantTarget && enPassantTarget.row === to.row && enPassantTarget.col === to.col) {
          valid = true;
        }
      }
      break;
    }

    case 'rook':
      if (rowDiff === 0 || colDiff === 0) {
        valid = pathClear(board, from, to);
      }
      break;

    case 'bishop':
      if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        valid = pathClear(board, from, to);
      }
      break;

    case 'queen':
      if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        valid = pathClear(board, from, to);
      }
      break;

    case 'knight':
      if (
        (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
        (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
      ) {
        valid = true;
      }
      break;

    case 'king': {
      // Normal 1 step move
      if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
        valid = true;
      }
      // Castling
      else if (piece.firstMove && rowDiff === 0 && Math.abs(colDiff) === 2 && considerKingSafety) {
        // Can't castle out of check!
        if (!isKingInCheck(board, piece.color)) {
          const isKingSide = colDiff > 0;
          const rookCol = isKingSide ? 7 : 0;
          const rook = board[from.row][rookCol];

          if (rook && rook.type === 'rook' && rook.color === piece.color && rook.firstMove) {
            const step = isKingSide ? 1 : -1;
            let clear = true;

            // Check if squares between are clear
            for (let c = from.col + step; c !== rookCol; c += step) {
              if (board[from.row][c] !== null) {
                clear = false;
                break;
              }
            }

            if (clear) {
              // Ensure king does not pass through or land on attacked squares
              const midSquare = { row: from.row, col: from.col + step };
              const destSquare = { row: from.row, col: from.col + 2 * step };

              if (
                !simulateAndCheck(board, piece.color, from, midSquare) &&
                !simulateAndCheck(board, piece.color, from, destSquare)
              ) {
                valid = true;
              }
            }
          }
        }
      }
      break;
    }
  }

  // Check if move would leave or put own king in check
  if (valid && considerKingSafety) {
    if (simulateAndCheck(board, piece.color, from, to, piece, enPassantTarget)) {
      valid = false;
    }
  }

  return valid;
}

function simulateAndCheck(
  board: Board,
  color: Color,
  from: Position,
  to: Position,
  pieceMoved?: Piece,
  enPassantTarget: Position | null = null
): boolean {
  const p = pieceMoved || board[from.row][from.col];
  if (!p) return true;

  const tempBoard = cloneBoard(board);
  const isEnPassant =
    p.type === 'pawn' &&
    enPassantTarget &&
    to.row === enPassantTarget.row &&
    to.col === enPassantTarget.col &&
    Math.abs(to.col - from.col) === 1 &&
    !tempBoard[to.row][to.col];

  if (isEnPassant) {
    const capturedPawnRow = p.color === 'white' ? to.row + 1 : to.row - 1;
    tempBoard[capturedPawnRow][to.col] = null;
  }

  tempBoard[to.row][to.col] = { ...p };
  tempBoard[from.row][from.col] = null;

  return isKingInCheck(tempBoard, color);
}

export function getLegalMoves(
  board: Board,
  from: Position,
  enPassantTarget: Position | null
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Position[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isValidMove(board, piece, from, { row: r, col: c }, enPassantTarget, true)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

export function getAllLegalMoves(
  board: Board,
  color: Color,
  enPassantTarget: Position | null
): { from: Position; to: Position }[] {
  const allMoves: { from: Position; to: Position }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, { row: r, col: c }, enPassantTarget);
        moves.forEach(to => allMoves.push({ from: { row: r, col: c }, to }));
      }
    }
  }
  return allMoves;
}

export function isCheckmate(board: Board, color: Color, enPassantTarget: Position | null): boolean {
  return isKingInCheck(board, color) && getAllLegalMoves(board, color, enPassantTarget).length === 0;
}

export function isStalemate(board: Board, color: Color, enPassantTarget: Position | null): boolean {
  return !isKingInCheck(board, color) && getAllLegalMoves(board, color, enPassantTarget).length === 0;
}

export function isInsufficientMaterial(board: Board): boolean {
  const pieces: Piece[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) pieces.push(p);
    }
  }

  // Only Kings (King vs King)
  if (pieces.length === 2) return true;

  // King + Bishop vs King or King + Knight vs King
  if (pieces.length === 3) {
    return pieces.some(p => p.type === 'bishop' || p.type === 'knight');
  }

  // King + Bishop vs King + Bishop
  if (pieces.length === 4) {
    const nonKings = pieces.filter(p => p.type !== 'king');
    if (nonKings.length === 2 && nonKings[0].type === 'bishop' && nonKings[1].type === 'bishop') {
      return true;
    }
  }

  return false;
}

export function generateSAN(
  piece: Piece,
  from: Position,
  to: Position,
  captured: boolean,
  isCastling: 'kingside' | 'queenside' | null,
  isCheck: boolean,
  isMate: boolean,
  promotedTo?: PieceType
): string {
  if (isCastling === 'kingside') return isMate ? 'O-O#' : isCheck ? 'O-O+' : 'O-O';
  if (isCastling === 'queenside') return isMate ? 'O-O-O#' : isCheck ? 'O-O-O+' : 'O-O-O';

  let san = '';
  const toFile = FILES[to.col];
  const toRank = (8 - to.row).toString();
  const dest = `${toFile}${toRank}`;

  if (piece.type === 'pawn') {
    if (captured) {
      san = `${FILES[from.col]}x${dest}`;
    } else {
      san = dest;
    }
    if (promotedTo) {
      const promoMap: Record<PieceType, string> = {
        queen: 'Q',
        rook: 'R',
        bishop: 'B',
        knight: 'N',
        pawn: '',
        king: ''
      };
      san += `=${promoMap[promotedTo]}`;
    }
  } else {
    const pieceLetters: Record<PieceType, string> = {
      knight: 'N',
      bishop: 'B',
      rook: 'R',
      queen: 'Q',
      king: 'K',
      pawn: ''
    };
    san = pieceLetters[piece.type];
    if (captured) san += 'x';
    san += dest;
  }

  if (isMate) san += '#';
  else if (isCheck) san += '+';

  return san;
}

export function executeMove(
  board: Board,
  from: Position,
  to: Position,
  enPassantTarget: Position | null,
  promotionChoice: PieceType = 'queen'
): {
  newBoard: Board;
  newEnPassantTarget: Position | null;
  moveRecord: MoveRecord;
  capturedPiece: Piece | null;
} {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row][from.col]!;
  let target = newBoard[to.row][to.col];
  let rookMove: MoveRecord['rookMove'] = null;
  let isCastling: 'kingside' | 'queenside' | null = null;
  let promotedTo: PieceType | undefined;

  // Handle Castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const isKingSide = to.col > from.col;
    isCastling = isKingSide ? 'kingside' : 'queenside';
    const rookFromCol = isKingSide ? 7 : 0;
    const rookToCol = isKingSide ? from.col + 1 : from.col - 1;

    const rook = newBoard[from.row][rookFromCol]!;
    newBoard[from.row][rookFromCol] = null;
    newBoard[from.row][rookToCol] = { ...rook, firstMove: false };

    rookMove = {
      from: { row: from.row, col: rookFromCol },
      to: { row: from.row, col: rookToCol },
      piece: { ...rook }
    };
  }

  // Handle En Passant Capture
  if (
    piece.type === 'pawn' &&
    enPassantTarget &&
    to.row === enPassantTarget.row &&
    to.col === enPassantTarget.col &&
    Math.abs(to.col - from.col) === 1 &&
    !target
  ) {
    const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    target = newBoard[capturedPawnRow][to.col];
    newBoard[capturedPawnRow][to.col] = null;
  }

  // Move piece
  newBoard[to.row][to.col] = { ...piece, firstMove: false };
  newBoard[from.row][from.col] = null;

  // Handle Promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col]!.type = promotionChoice;
    promotedTo = promotionChoice;
  }

  // Calculate new en passant target
  let newEnPassantTarget: Position | null = null;
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newEnPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
  }

  const opponentColor: Color = piece.color === 'white' ? 'black' : 'white';
  const opponentInCheck = isKingInCheck(newBoard, opponentColor);
  const opponentInMate = opponentInCheck && getAllLegalMoves(newBoard, opponentColor, newEnPassantTarget).length === 0;

  const san = generateSAN(
    piece,
    from,
    to,
    target !== null,
    isCastling,
    opponentInCheck,
    opponentInMate,
    promotedTo
  );

  const moveRecord: MoveRecord = {
    from,
    to,
    piece: { ...piece },
    captured: target ? { ...target } : null,
    enPassantTarget: newEnPassantTarget,
    prevEnPassantTarget: enPassantTarget,
    rookMove,
    promotedTo,
    san
  };

  return {
    newBoard,
    newEnPassantTarget,
    moveRecord,
    capturedPiece: target
  };
}
