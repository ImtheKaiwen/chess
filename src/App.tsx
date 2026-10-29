import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import type { Board, Color, MoveRecord, PieceType, Position, GameStatus } from './engine/types';
import { createInitialBoard } from './engine/constants';
import {
  executeMove,
  getLegalMoves,
  isCheckmate,
  isKingInCheck,
  isStalemate
} from './engine/chessEngine';
import { calculateCaptured, boardToFEN, movesToPGN, copyToClipboard } from './utils/helpers';
import { sound } from './utils/sound';
import {
  fetchStockfishMove,
  getLocalFallbackMove,
  getTopMovesSuggestions,
  DIFFICULTY_CONFIG
} from './services/aiService';
import type { AIDifficulty } from './services/aiService';
import {
  getPlayerStats,
  recordGameResult,
  getMatchHistory,
  saveMatchRecord,
  clearMatchHistory
} from './services/statsService';
import type { PlayerStats, MatchHistoryItem } from './services/statsService';
import { getStoredLanguage, setStoredLanguage } from './utils/i18n';
import type { Language } from './utils/i18n';

import { SplashScreen } from './components/SplashScreen';
import { StartScreen } from './components/StartScreen';
import type { GameSettings } from './components/StartScreen';
import { ChessBoard } from './components/ChessBoard';
import type { BoardArrow } from './components/ChessBoard';
import { ThreeChessBoard } from './components/ThreeChessBoard';
import { PlayerCard } from './components/PlayerCard';
import { GameSidebar } from './components/GameSidebar';
import { GameOverModal } from './components/GameOverModal';
import { PromotionModal } from './components/PromotionModal';
import { SettingsModal } from './components/SettingsModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { GameReview } from './components/GameReview';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import './styles/main.css';
import './styles/board.css';
import './styles/components.css';

export const App: React.FC = () => {
  const [, startTransition] = useTransition();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Screen: 'menu' (lobby), 'game' (gameplay), or 'review' (match analysis)
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'review'>('menu');
  const [selectedReviewMatch, setSelectedReviewMatch] = useState<MatchHistoryItem | null>(null);

  // Theme Mode: Light is DEFAULT
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kaiwen_theme_mode') as 'light' | 'dark') || 'light';
  });

  // View Mode: '2d' or '3d'
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(() => {
    return (localStorage.getItem('kaiwen_view_mode') as '2d' | '3d') || '2d';
  });

  // Language: 'tr' | 'en'
  const [lang, setLang] = useState<Language>(getStoredLanguage);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Game Settings
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    mode: 'ai',
    difficulty: 'medium',
    playerColor: 'white',
    timeLimit: 600
  });

  // Player Stats & Match History
  const [stats, setStats] = useState<PlayerStats>(getPlayerStats);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>(getMatchHistory);

  // Core Chess State
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentTurn, setCurrentTurn] = useState<Color>('white');
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [redoStack, setRedoStack] = useState<MoveRecord[]>([]);
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);

  // Player orientation
  const [humanColor, setHumanColor] = useState<Color>('white');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Selection & UI State
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Status & Modals
  const [status, setStatus] = useState<GameStatus>('active');
  const [winner, setWinner] = useState<Color | 'draw' | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null);

  // AI State & Concurrency Shield
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [evalScore, setEvalScore] = useState<number>(0);
  const aiRequestIdRef = useRef<number>(0);

  // Synchronized Game Reference to eliminate state-closure desync & double-moves
  const gameStateRef = useRef<{
    board: Board;
    currentTurn: Color;
    enPassantTarget: Position | null;
    moveHistory: MoveRecord[];
    redoStack: MoveRecord[];
    status: GameStatus;
    humanColor: Color;
    difficulty: GameSettings['difficulty'];
    mode: GameSettings['mode'];
  }>({
    board: createInitialBoard(),
    currentTurn: 'white',
    enPassantTarget: null,
    moveHistory: [],
    redoStack: [],
    status: 'active',
    humanColor: 'white',
    difficulty: 'medium',
    mode: 'ai'
  });

  // AI Move Assistance Settings
  const [aiAssistEnabled, setAiAssistEnabled] = useState<boolean>(() => {
    return localStorage.getItem('kaiwen_ai_assist_enabled') === 'true';
  });
  const [aiAssistLevel, setAiAssistLevel] = useState<AIDifficulty>(() => {
    return (localStorage.getItem('kaiwen_ai_assist_level') as AIDifficulty) || 'master';
  });
  const [aiAssistCount, setAiAssistCount] = useState<1 | 2>(() => {
    return (parseInt(localStorage.getItem('kaiwen_ai_assist_count') || '1', 10) as 1 | 2) || 1;
  });
  const [aiHintArrows, setAiHintArrows] = useState<BoardArrow[]>([]);

  // Sound & Toasts
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Timers
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.className = themeMode === 'light' ? 'theme-light' : 'theme-dark';
    localStorage.setItem('kaiwen_theme_mode', themeMode);
  }, [themeMode]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('kaiwen_view_mode', viewMode);
  }, [viewMode]);

  // Language update handler
  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    setStoredLanguage(newLang);
  };

  // Toast Helper
  const addToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  // AI Assist Handlers
  const handleToggleAiAssist = (val?: boolean) => {
    const nextVal = typeof val === 'boolean' ? val : !aiAssistEnabled;
    setAiAssistEnabled(nextVal);
    localStorage.setItem('kaiwen_ai_assist_enabled', String(nextVal));
    addToast(
      nextVal ? 'Yapay Zeka Hamle Desteği Aktif' : 'Yapay Zeka Hamle Desteği Kapatıldı',
      'info'
    );
  };

  const handleChangeAiAssistLevel = (lvl: AIDifficulty) => {
    setAiAssistLevel(lvl);
    localStorage.setItem('kaiwen_ai_assist_level', lvl);
  };

  const handleChangeAiAssistCount = (cnt: 1 | 2) => {
    setAiAssistCount(cnt);
    localStorage.setItem('kaiwen_ai_assist_count', String(cnt));
  };

  // Dynamic AI Move Assistance calculation
  useEffect(() => {
    if (!aiAssistEnabled || currentScreen !== 'game' || (status !== 'active' && status !== 'check')) {
      setAiHintArrows([]);
      return;
    }

    if (gameSettings.mode === 'ai' && currentTurn !== humanColor) {
      setAiHintArrows([]);
      return;
    }

    if (isAiThinking) {
      setAiHintArrows([]);
      return;
    }

    let isMounted = true;
    const computeHints = async () => {
      try {
        const fen = boardToFEN(board, currentTurn, enPassantTarget, moveHistory);
        const hints = await getTopMovesSuggestions(
          fen,
          aiAssistLevel,
          board,
          currentTurn,
          enPassantTarget,
          aiAssistCount
        );
        if (isMounted) {
          setAiHintArrows(hints);
        }
      } catch {
        if (isMounted) {
          setAiHintArrows([]);
        }
      }
    };

    computeHints();

    return () => {
      isMounted = false;
    };
  }, [
    aiAssistEnabled,
    currentScreen,
    board,
    currentTurn,
    status,
    enPassantTarget,
    moveHistory,
    humanColor,
    gameSettings.mode,
    isAiThinking,
    aiAssistLevel,
    aiAssistCount
  ]);

  // Timer Tick
  useEffect(() => {
    if (currentScreen !== 'game') return;
    if (status !== 'active' && status !== 'check') return;
    if (gameSettings.timeLimit === 0) return;

    const timer = setInterval(() => {
      if (currentTurn === 'white') {
        setWhiteTime(t => Math.max(0, t - 1));
      } else {
        setBlackTime(t => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentScreen, status, currentTurn, gameSettings.timeLimit]);

  // Handle Timeout
  useEffect(() => {
    if (currentScreen !== 'game') return;
    if (gameSettings.timeLimit === 0) return;
    if (status === 'checkmate' || status === 'stalemate' || status === 'draw') return;

    if (whiteTime === 0) {
      sound.playDefeat();
      setStatus('checkmate');
      setWinner('black');
      setShowGameOverModal(true);
      finishGame('black', 'Beyaz oyuncunun süresi bitti');
    } else if (blackTime === 0) {
      sound.playVictory();
      setStatus('checkmate');
      setWinner('white');
      setShowGameOverModal(true);
      finishGame('white', 'Siyah oyuncunun süresi bitti');
    }
  }, [whiteTime, blackTime, currentScreen, gameSettings.timeLimit, status]);

  // Finish Game Helper
  const finishGame = (finalWinner: Color | 'draw', _reason: string) => {
    const isPlayerWin = finalWinner === humanColor;
    const isDraw = finalWinner === 'draw';

    const newStats = recordGameResult(isDraw ? 'draw' : isPlayerWin ? 'win' : 'loss');
    setStats(newStats);

    const opponentName =
      gameSettings.mode === 'ai'
        ? `Stockfish (${DIFFICULTY_CONFIG[gameSettings.difficulty].label})`
        : 'İki Kişilik';

    saveMatchRecord({
      opponent: opponentName,
      result: isDraw ? 'draw' : isPlayerWin ? 'win' : 'loss',
      totalMoves: moveHistory.length,
      playerColor: humanColor,
      moves: moveHistory
    });

    setMatchHistory(getMatchHistory());
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Clear Match History
  const handleClearHistory = () => {
    clearMatchHistory();
    setMatchHistory([]);
    addToast('Maç geçmişi başarıyla temizlendi', 'success');
  };

  // Start a New Game
  const handleStartGame = (newSettings: GameSettings) => {
    setGameSettings(newSettings);

    let chosenColor: Color = 'white';
    if (newSettings.playerColor === 'random') {
      chosenColor = Math.random() < 0.5 ? 'white' : 'black';
    } else {
      chosenColor = newSettings.playerColor;
    }

    setHumanColor(chosenColor);
    setIsFlipped(chosenColor === 'black');

    const freshBoard = createInitialBoard();

    // Reset synchronous ref
    gameStateRef.current = {
      board: freshBoard,
      currentTurn: 'white',
      enPassantTarget: null,
      moveHistory: [],
      redoStack: [],
      status: 'active',
      humanColor: chosenColor,
      difficulty: newSettings.difficulty,
      mode: newSettings.mode
    };

    // Reset game board and state
    setBoard(freshBoard);
    setCurrentTurn('white');
    setMoveHistory([]);
    setRedoStack([]);
    setEnPassantTarget(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setStatus('active');
    setWinner(null);
    setShowGameOverModal(false);
    setPendingPromotion(null);
    setEvalScore(0);
    setIsAiThinking(false);

    const initTime = newSettings.timeLimit;
    setWhiteTime(initTime);
    setBlackTime(initTime);

    startTransition(() => {
      setCurrentScreen('game');
    });

    sound.playMove();

    // If human is black and playing vs AI, trigger AI first move
    if (newSettings.mode === 'ai' && chosenColor === 'black') {
      triggerStockfishMove(freshBoard, [], 'white', newSettings.difficulty, null);
    }
  };

  // Trigger Stockfish Move
  const triggerStockfishMove = async (
    currentBoard: Board,
    history: MoveRecord[],
    aiColor: Color,
    difficulty: GameSettings['difficulty'],
    epTarget: Position | null
  ) => {
    const requestId = ++aiRequestIdRef.current;
    setIsAiThinking(true);

    try {
      const fen = boardToFEN(currentBoard, aiColor, epTarget, history);
      const res = await fetchStockfishMove(fen, difficulty, currentBoard, aiColor, epTarget);

      if (aiRequestIdRef.current !== requestId) return;
      if (gameStateRef.current.currentTurn !== aiColor) return;

      if (res && res.from && res.to) {
        if (typeof res.eval === 'number') {
          setEvalScore(res.eval);
        }
        commitMove(res.from, res.to);
      } else {
        const fallback = getLocalFallbackMove(currentBoard, aiColor, epTarget, difficulty);
        if (fallback) {
          commitMove(fallback.from, fallback.to);
        }
      }
    } catch {
      const fallback = getLocalFallbackMove(currentBoard, aiColor, epTarget, difficulty);
      if (fallback) {
        commitMove(fallback.from, fallback.to);
      }
    } finally {
      if (aiRequestIdRef.current === requestId) {
        setIsAiThinking(false);
      }
    }
  };

  // Commit Move Function - Synchronized with gameStateRef to prevent double moves
  const commitMove = (
    from: Position,
    to: Position,
    promotionChoice?: PieceType
  ) => {
    const current = gameStateRef.current;
    if (current.status !== 'active' && current.status !== 'check') return;

    const piece = current.board[from.row][from.col];
    if (!piece || piece.color !== current.currentTurn) return;

    const targetPiece = current.board[to.row][to.col];
    const isEnPassant = Boolean(
      piece.type === 'pawn' &&
      current.enPassantTarget &&
      to.row === current.enPassantTarget.row &&
      to.col === current.enPassantTarget.col
    );
    const isCapture = Boolean(targetPiece || isEnPassant);
    const isCastle = piece.type === 'king' && Math.abs(to.col - from.col) === 2;

    const { newBoard, moveRecord, newEnPassantTarget } = executeMove(
      current.board,
      from,
      to,
      current.enPassantTarget,
      promotionChoice || 'queen'
    );

    const nextTurn: Color = current.currentTurn === 'white' ? 'black' : 'white';
    const inCheck = isKingInCheck(newBoard, nextTurn);
    const checkmated = isCheckmate(newBoard, nextTurn, newEnPassantTarget);
    const stalemated = isStalemate(newBoard, nextTurn, newEnPassantTarget);

    let newStatus: GameStatus = 'active';
    if (checkmated) newStatus = 'checkmate';
    else if (stalemated) newStatus = 'stalemate';
    else if (inCheck) newStatus = 'check';

    const newHistory = [...current.moveHistory, moveRecord];

    // Atomically update state ref
    gameStateRef.current = {
      ...current,
      board: newBoard,
      currentTurn: nextTurn,
      enPassantTarget: newEnPassantTarget,
      moveHistory: newHistory,
      redoStack: [],
      status: newStatus
    };

    // Update UI states
    sound.playMoveEvent(Boolean(inCheck || checkmated), isCapture, isCastle);
    setBoard(newBoard);
    setCurrentTurn(nextTurn);
    setEnPassantTarget(newEnPassantTarget);
    setMoveHistory(newHistory);
    setRedoStack([]);
    setLastMove({ from, to });
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
    setStatus(newStatus);

    if (checkmated) {
      setWinner(current.currentTurn);
      setShowGameOverModal(true);
      finishGame(current.currentTurn, 'Şah mat');
    } else if (stalemated) {
      setWinner('draw');
      setShowGameOverModal(true);
      finishGame('draw', 'Pat oldu');
    } else if (
      current.mode === 'ai' &&
      nextTurn !== current.humanColor
    ) {
      triggerStockfishMove(newBoard, newHistory, nextTurn, current.difficulty, newEnPassantTarget);
    }
  };

  // Handle Square Click
  const handleSquareClick = (row: number, col: number) => {
    if (status === 'checkmate' || status === 'stalemate' || status === 'draw') return;
    if (isAiThinking) return;
    if (gameSettings.mode === 'ai' && currentTurn !== humanColor) return;

    const current = gameStateRef.current;
    const clickedPiece = current.board[row][col];

    // If a square is already selected
    if (selectedSquare) {
      const isLegal = legalMoves.some(m => m.row === row && m.col === col);

      if (isLegal) {
        const piece = current.board[selectedSquare.row][selectedSquare.col];

        // Check if pawn promotion
        const isPromotion =
          piece &&
          piece.type === 'pawn' &&
          ((piece.color === 'white' && row === 0) || (piece.color === 'black' && row === 7));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: { row, col } });
          return;
        }

        commitMove(selectedSquare, { row, col });
        return;
      }

      // Re-select own piece
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare({ row, col });
        const moves = getLegalMoves(current.board, { row, col }, enPassantTarget);
        setLegalMoves(moves);
        return;
      }

      // Deselect
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Select piece
    if (clickedPiece && clickedPiece.color === currentTurn) {
      setSelectedSquare({ row, col });
      const moves = getLegalMoves(current.board, { row, col }, enPassantTarget);
      setLegalMoves(moves);
    }
  };

  // Handle Undo
  const handleUndo = () => {
    if (moveHistory.length === 0 || isAiThinking) return;

    aiRequestIdRef.current++;
    setIsAiThinking(false);

    const stepsToUndo = gameSettings.mode === 'ai' && moveHistory.length >= 2 ? 2 : 1;
    const newHistory = moveHistory.slice(0, -stepsToUndo);
    const popped = moveHistory.slice(-stepsToUndo);

    let tempBoard = createInitialBoard();
    let tempTarget: Position | null = null;
    let tempTurn: Color = 'white';

    for (let i = 0; i < newHistory.length; i++) {
      const m = newHistory[i];
      const res = executeMove(
        tempBoard,
        m.from,
        m.to,
        tempTarget,
        m.san.includes('=') ? 'queen' : 'queen'
      );
      tempBoard = res.newBoard;
      tempTarget = res.newEnPassantTarget;
      tempTurn = tempTurn === 'white' ? 'black' : 'white';
    }

    gameStateRef.current = {
      ...gameStateRef.current,
      board: tempBoard,
      currentTurn: tempTurn,
      enPassantTarget: tempTarget,
      moveHistory: newHistory,
      redoStack: [...popped.reverse(), ...gameStateRef.current.redoStack],
      status: 'active'
    };

    setBoard(tempBoard);
    setCurrentTurn(tempTurn);
    setEnPassantTarget(tempTarget);
    setMoveHistory(newHistory);
    setRedoStack(prev => [...popped.reverse(), ...prev]);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(
      newHistory.length > 0
        ? {
            from: newHistory[newHistory.length - 1].from,
            to: newHistory[newHistory.length - 1].to
          }
        : null
    );
    setStatus('active');
    sound.playMove();
    addToast('Hamle geri alındı', 'info');
  };

  // Handle Redo
  const handleRedo = () => {
    if (redoStack.length === 0 || isAiThinking) return;

    const stepsToRedo = gameSettings.mode === 'ai' && redoStack.length >= 2 ? 2 : 1;
    const movesToApply: MoveRecord[] = redoStack.slice(0, stepsToRedo);
    const remainingRedo = redoStack.slice(stepsToRedo);

    let tempBoard = board;
    let tempTarget = enPassantTarget;
    let tempTurn = currentTurn;
    const updatedHistory = [...moveHistory];

    for (const m of movesToApply) {
      const res = executeMove(
        tempBoard,
        m.from,
        m.to,
        tempTarget,
        m.san.includes('=') ? 'queen' : 'queen'
      );
      tempBoard = res.newBoard;
      tempTarget = res.newEnPassantTarget;
      tempTurn = tempTurn === 'white' ? 'black' : 'white';
      updatedHistory.push(m);
    }

    gameStateRef.current = {
      ...gameStateRef.current,
      board: tempBoard,
      currentTurn: tempTurn,
      enPassantTarget: tempTarget,
      moveHistory: updatedHistory,
      redoStack: remainingRedo,
      status: 'active'
    };

    setBoard(tempBoard);
    setCurrentTurn(tempTurn);
    setEnPassantTarget(tempTarget);
    setMoveHistory(updatedHistory);
    setRedoStack(remainingRedo);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove({
      from: movesToApply[movesToApply.length - 1].from,
      to: movesToApply[movesToApply.length - 1].to
    });
    sound.playMove();
    addToast('Hamle ileri alındı', 'info');
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl + Y: Redo
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
      // F: Flip Board
      else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFlipped(f => !f);
      }
      // M: Toggle Sound
      else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleSound();
      }
      // 3: Toggle 2D / 3D mode
      else if (e.key === '3') {
        e.preventDefault();
        setViewMode(vm => (vm === '2d' ? '3d' : '2d'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Resign & Draw
  const handleResign = () => {
    if (window.confirm('Oyunu terk etmek istediğinize emin misiniz?')) {
      const resignWinner: Color = humanColor === 'white' ? 'black' : 'white';
      setStatus('resigned');
      setWinner(resignWinner);
      setShowGameOverModal(true);
      finishGame(resignWinner, 'Terk edildi');
      sound.playDefeat();
    }
  };

  const handleOfferDraw = () => {
    if (gameSettings.mode === 'ai') {
      if (Math.abs(evalScore) <= 0.6) {
        setStatus('draw');
        setWinner('draw');
        setShowGameOverModal(true);
        finishGame('draw', 'Stockfish beraberlik teklifinizi kabul etti');
        sound.playMove();
      } else {
        addToast('Stockfish beraberlik teklifinizi reddetti.', 'warning');
      }
    } else {
      if (window.confirm('Rakibiniz beraberlik teklifini kabul ediyor mu?')) {
        setStatus('draw');
        setWinner('draw');
        setShowGameOverModal(true);
        finishGame('draw', 'Karşılıklı beraberlik');
        sound.playMove();
      }
    }
  };

  // Export FEN / PGN
  const handleCopyFEN = () => {
    const fen = boardToFEN(board, currentTurn, enPassantTarget, moveHistory);
    copyToClipboard(fen);
    addToast('FEN panoya kopyalandı', 'success');
  };

  const handleCopyPGN = () => {
    const pgn = movesToPGN(moveHistory);
    copyToClipboard(pgn);
    addToast('PGN panoya kopyalandı', 'success');
  };

  // Return to Lobby
  const handleReturnToMenu = () => {
    aiRequestIdRef.current++;
    setIsAiThinking(false);
    startTransition(() => {
      setCurrentScreen('menu');
    });
  };

  // Open Game Review Mode for a match
  const handleSelectReviewMatch = (match: MatchHistoryItem) => {
    setSelectedReviewMatch(match);
    setCurrentScreen('review');
  };

  // Captured pieces calculation
  const capturedSummary = calculateCaptured(board);
  const isChecked = status === 'check';

  // Determine top and bottom display colors
  const topColor: Color = isFlipped ? 'white' : 'black';
  const bottomColor: Color = isFlipped ? 'black' : 'white';

  return (
    <div className="app-viewport">
      {/* INITIAL SPLASH SCREEN */}
      {showSplash && (
        <SplashScreen
          themeMode={themeMode}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* SCREEN 1: DEDICATED FULL-BLEED LOBBY WITH STEP-BY-STEP WIZARD */}
      {currentScreen === 'menu' && (
        <StartScreen
          initialSettings={gameSettings}
          stats={stats}
          matchHistory={matchHistory}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          lang={lang}
          onToggleLang={handleToggleLang}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenHistory={() => setShowHistoryModal(true)}
          onSelectMatch={handleSelectReviewMatch}
          onStartGame={handleStartGame}
          onRefreshHistory={() => setMatchHistory(getMatchHistory())}
        />
      )}

      {/* SCREEN 2: GAMEPLAY (ZERO SCROLLING, SLIDE-OUT DRAWER, 2D/3D SUPPORT) */}
      {currentScreen === 'game' && (
        <div className={`game-viewport ${viewMode === '3d' ? 'mode-3d' : ''}`}>
          <div className="game-main-area">
            {/* Left Column: Board + Opponent Bar + Player Bar */}
            <div className={`board-column ${viewMode === '3d' ? 'board-column-3d' : ''}`}>
              {/* Opponent Card (Top) */}
              <div className="dock-card-wrap top-dock">
                <PlayerCard
                  color={topColor}
                  name={
                    gameSettings.mode === 'ai' && topColor !== humanColor
                      ? `Stockfish AI (${DIFFICULTY_CONFIG[gameSettings.difficulty].label})`
                      : topColor === 'white'
                      ? 'Beyaz Oyuncu'
                      : 'Siyah Oyuncu'
                  }
                  isTurn={currentTurn === topColor && status === 'active'}
                  isAI={gameSettings.mode === 'ai' && topColor !== humanColor}
                  capturedPieces={
                    topColor === 'white'
                      ? capturedSummary.whiteCaptured
                      : capturedSummary.blackCaptured
                  }
                  advantage={
                    capturedSummary.advantage.color === topColor
                      ? capturedSummary.advantage.diff
                      : 0
                  }
                  timeRemaining={topColor === 'white' ? whiteTime : blackTime}
                  hasTimeLimit={gameSettings.timeLimit > 0}
                />
              </div>

              {/* Dynamic Board: 2D or 3D Three.js Scene */}
              <div className="board-container">
                {viewMode === '3d' ? (
                  <ThreeChessBoard
                    board={board}
                    currentTurn={currentTurn}
                    selectedSquare={selectedSquare}
                    legalMoves={legalMoves}
                    lastMove={lastMove}
                    isKingInCheck={isChecked}
                    isFlipped={isFlipped}
                    themeMode={themeMode}
                    aiHints={aiHintArrows}
                    onSquareClick={handleSquareClick}
                  />
                ) : (
                  <ChessBoard
                    board={board}
                    currentTurn={currentTurn}
                    selectedSquare={selectedSquare}
                    legalMoves={legalMoves}
                    lastMove={lastMove}
                    isKingInCheck={isChecked}
                    isFlipped={isFlipped}
                    theme="theme-default"
                    arrows={aiHintArrows}
                    onSquareClick={handleSquareClick}
                  />
                )}
              </div>

              {/* Player Card (Bottom) */}
              <div className="dock-card-wrap bottom-dock">
                <PlayerCard
                  color={bottomColor}
                  name={
                    gameSettings.mode === 'ai' && bottomColor !== humanColor
                      ? `Stockfish AI (${DIFFICULTY_CONFIG[gameSettings.difficulty].label})`
                      : bottomColor === 'white'
                      ? 'Beyaz Oyuncu'
                      : 'Siyah Oyuncu'
                  }
                  isTurn={currentTurn === bottomColor && status === 'active'}
                  isAI={gameSettings.mode === 'ai' && bottomColor !== humanColor}
                  capturedPieces={
                    bottomColor === 'white'
                      ? capturedSummary.whiteCaptured
                      : capturedSummary.blackCaptured
                  }
                  advantage={
                    capturedSummary.advantage.color === bottomColor
                      ? capturedSummary.advantage.diff
                      : 0
                  }
                  timeRemaining={bottomColor === 'white' ? whiteTime : blackTime}
                  hasTimeLimit={gameSettings.timeLimit > 0}
                />
              </div>
            </div>

            {/* Right Column: Slide-Out Drawer with Floating Edge Dock */}
            <GameSidebar
              isOpen={isSidebarOpen}
              onToggleOpen={() => setIsSidebarOpen(open => !open)}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
              isMuted={isMuted}
              onToggleSound={handleToggleSound}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(vm => (vm === '2d' ? '3d' : '2d'))}
              canUndo={moveHistory.length > 0 && !isAiThinking}
              canRedo={redoStack.length > 0 && !isAiThinking}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onFlipBoard={() => setIsFlipped(f => !f)}
              onReturnToMenu={handleReturnToMenu}
              moveHistory={moveHistory}
              evalScore={evalScore}
              isAiThinking={isAiThinking}
              aiDifficulty={
                gameSettings.mode === 'ai'
                  ? DIFFICULTY_CONFIG[gameSettings.difficulty].label
                  : undefined
              }
              onCopyFEN={handleCopyFEN}
              onCopyPGN={handleCopyPGN}
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
              isGameOver={status !== 'active' && status !== 'check'}
              aiAssistEnabled={aiAssistEnabled}
              onToggleAiAssist={handleToggleAiAssist}
            />
          </div>
        </div>
      )}

      {/* SCREEN 3: GAME REVIEW & STOCKFISH EVALUATION MODE */}
      {currentScreen === 'review' && selectedReviewMatch && (
        <GameReview
          match={selectedReviewMatch}
          onBack={() => setCurrentScreen('menu')}
          themeMode={themeMode}
        />
      )}

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={currentTurn}
          onSelect={choice => {
            commitMove(pendingPromotion.from, pendingPromotion.to, choice);
          }}
        />
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <GameOverModal
          status={status}
          winner={winner}
          lang={lang}
          totalMoves={moveHistory.length}
          gameDuration={
            gameSettings.timeLimit > 0
              ? gameSettings.timeLimit * 2 - (whiteTime + blackTime)
              : 0
          }
          whiteCapturedCount={capturedSummary.whiteCaptured.length}
          blackCapturedCount={capturedSummary.blackCaptured.length}
          onNewGame={() => {
            setShowGameOverModal(false);
            setCurrentScreen('menu');
          }}
          onClose={() => setShowGameOverModal(false)}
          onInspect={() => {
            setShowGameOverModal(false);
            const latestHistory = getMatchHistory();
            const currentItem: MatchHistoryItem = latestHistory[0] || {
              id: Date.now().toString(),
              date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
              opponent: gameSettings.mode === 'ai'
                ? `Stockfish (${DIFFICULTY_CONFIG[gameSettings.difficulty].label})`
                : 'İki Kişilik',
              result: winner === 'draw' ? 'draw' : winner === humanColor ? 'win' : 'loss',
              totalMoves: moveHistory.length,
              playerColor: humanColor,
              moves: [...moveHistory]
            };
            setSelectedReviewMatch(currentItem);
            setCurrentScreen('review');
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        lang={lang}
        onToggleLang={handleToggleLang}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        aiAssistEnabled={aiAssistEnabled}
        onToggleAiAssist={handleToggleAiAssist}
        aiAssistLevel={aiAssistLevel}
        onChangeAiAssistLevel={handleChangeAiAssistLevel}
        aiAssistCount={aiAssistCount}
        onChangeAiAssistCount={handleChangeAiAssistCount}
      />

      {/* Match History Modal */}
      <MatchHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        lang={lang}
        history={matchHistory}
        onRefresh={() => setMatchHistory(getMatchHistory())}
        onClear={handleClearHistory}
        onSelectMatch={handleSelectReviewMatch}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default App;
