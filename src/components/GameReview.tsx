import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Board, MoveRecord, Position } from '../engine/types';
import { createInitialBoard } from '../engine/constants';
import { executeMove } from '../engine/chessEngine';
import { boardToFEN } from '../utils/helpers';
import { fetchStockfishMove } from '../services/aiService';
import type { MatchHistoryItem } from '../services/statsService';
import { ChessBoard } from './ChessBoard';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bot,
  Calendar,
  Trophy,
  Compass
} from 'lucide-react';

interface GameReviewProps {
  match: MatchHistoryItem;
  onBack: () => void;
  themeMode: 'light' | 'dark';
}

interface MoveEvalData {
  bestMoveSan?: string;
  bestFrom?: Position;
  bestTo?: Position;
  evalScore?: number;
  badge: 'best' | 'good' | 'inaccuracy' | 'blunder';
  badgeLabel: string;
}

export const GameReview: React.FC<GameReviewProps> = ({ match, onBack, themeMode: _themeMode }) => {
  const moves: MoveRecord[] = match.moves || [];
  const [currentStep, setCurrentStep] = useState<number>(moves.length); // Start at final position
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [analysisCache, setAnalysisCache] = useState<{ [step: number]: MoveEvalData }>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Compute boards at every step
  const boardHistory = useMemo(() => {
    const list: {
      board: Board;
      enPassantTarget: Position | null;
      lastMove: { from: Position; to: Position } | null;
    }[] = [];

    let curBoard = createInitialBoard();
    let curTarget: Position | null = null;
    list.push({ board: curBoard, enPassantTarget: null, lastMove: null });

    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      const res = executeMove(
        curBoard,
        m.from,
        m.to,
        curTarget,
        m.san.includes('=') ? 'queen' : 'queen'
      );
      curBoard = res.newBoard;
      curTarget = res.newEnPassantTarget;
      list.push({
        board: curBoard,
        enPassantTarget: curTarget,
        lastMove: { from: m.from, to: m.to }
      });
    }

    return list;
  }, [moves]);

  const currentBoardState = boardHistory[currentStep] || boardHistory[0];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= moves.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, moves.length]);

  // Request Stockfish Evaluation for the current move
  const analysisRef = useRef<number>(0);
  useEffect(() => {
    if (currentStep === 0 || moves.length === 0) return;
    if (analysisCache[currentStep]) return; // Already analyzed

    const playedMove = moves[currentStep - 1];
    const prevBoardState = boardHistory[currentStep - 1];
    if (!prevBoardState) return;

    const movingColor = (currentStep - 1) % 2 === 0 ? 'white' : 'black';
    const fen = boardToFEN(
      prevBoardState.board,
      movingColor,
      prevBoardState.enPassantTarget,
      moves.slice(0, currentStep - 1)
    );

    const reqId = ++analysisRef.current;
    setIsAnalyzing(true);

    fetchStockfishMove(
      fen,
      'master',
      prevBoardState.board,
      movingColor,
      prevBoardState.enPassantTarget
    )
      .then(res => {
        if (analysisRef.current !== reqId) return;

        let badge: MoveEvalData['badge'] = 'good';
        let badgeLabel = 'İyi Hamle';

        const isExactBest =
          res.from &&
          res.to &&
          res.from.row === playedMove.from.row &&
          res.from.col === playedMove.from.col &&
          res.to.row === playedMove.to.row &&
          res.to.col === playedMove.to.col;

        if (isExactBest) {
          badge = 'best';
          badgeLabel = 'En İyi Hamle (Mükemmel)';
        } else {
          // Eval heuristic comparison
          const score = res.eval ?? 0;
          if (Math.abs(score) > 3.0) {
            badge = 'blunder';
            badgeLabel = 'Büyük Hata';
          } else if (Math.abs(score) > 1.2) {
            badge = 'inaccuracy';
            badgeLabel = 'Hata / Fırsat Kaçtı';
          } else {
            badge = 'good';
            badgeLabel = 'İyi Hamle';
          }
        }

        setAnalysisCache(prev => ({
          ...prev,
          [currentStep]: {
            bestMoveSan: res.san,
            bestFrom: res.from,
            bestTo: res.to,
            evalScore: res.eval,
            badge,
            badgeLabel
          }
        }));
      })
      .catch(() => {
        // Fallback default
        setAnalysisCache(prev => ({
          ...prev,
          [currentStep]: {
            badge: 'good',
            badgeLabel: 'İyi Hamle'
          }
        }));
      })
      .finally(() => {
        if (analysisRef.current === reqId) {
          setIsAnalyzing(false);
        }
      });
  }, [currentStep, moves, boardHistory, analysisCache]);

  const currentEval = analysisCache[currentStep];
  const playedMove = currentStep > 0 ? moves[currentStep - 1] : null;

  const isBestMove = currentEval?.badge === 'best';
  const showArrow = !isBestMove && !!(currentEval?.bestFrom && currentEval?.bestTo);
  const arrow = showArrow
    ? {
        from: currentEval.bestFrom!,
        to: currentEval.bestTo!,
        color: '#16a34a'
      }
    : null;
  const bestMoveBadgePos = isBestMove && playedMove ? playedMove.to : null;

  return (
    <div className="review-layout">
      {/* Review Header Bar */}
      <header className="review-header">
        <button type="button" className="btn-review-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Menüye Dön</span>
        </button>

        <div className="review-match-title">
          <div className="review-title-main">
            <Trophy size={16} className="trophy-gold" />
            <span className="review-opp-name">{match.opponent}</span>
            <span className={`result-tag ${match.result}`}>
              {match.result === 'win' ? 'Zafer' : match.result === 'loss' ? 'Yenilgi' : 'Berabere'}
            </span>
          </div>
          <div className="review-meta-row">
            <span className="meta-sub-item">
              <Calendar size={12} />
              {match.date}
            </span>
            <span className="meta-separator">•</span>
            <span>{match.totalMoves} Hamle</span>
            <span className="meta-separator">•</span>
            <span>{match.playerColor === 'white' ? 'Beyaz' : 'Siyah'} Taşlar</span>
          </div>
        </div>

        <div className="review-header-badge">
          <Bot size={15} />
          <span>Stockfish Usta Analizi</span>
        </div>
      </header>

      {/* Main Review Area */}
      <div className="review-body">
        {/* Left Column: Board + Timeline Navigation */}
        <div className="review-board-col">
          <div className="review-board-wrap">
            <div className="board-container">
              <ChessBoard
                board={currentBoardState.board}
                currentTurn={currentStep % 2 === 0 ? 'white' : 'black'}
                selectedSquare={null}
                legalMoves={[]}
                lastMove={currentBoardState.lastMove}
                isKingInCheck={false}
                isFlipped={match.playerColor === 'black'}
                theme="theme-default"
                arrow={arrow}
                bestMoveBadgePosition={bestMoveBadgePos}
                onSquareClick={() => {}}
              />
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="review-nav-bar">
            <button
              type="button"
              className="btn-review-nav"
              onClick={() => setCurrentStep(0)}
              disabled={currentStep === 0}
              title="İlk Konum"
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              type="button"
              className="btn-review-nav"
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              title="Önceki Hamle"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              className={`btn-review-nav btn-play-pause ${isPlaying ? 'active' : ''}`}
              onClick={() => setIsPlaying(p => !p)}
              title={isPlaying ? 'Durdur' : 'Otomatik Oynat'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              className="btn-review-nav"
              onClick={() => setCurrentStep(s => Math.min(moves.length, s + 1))}
              disabled={currentStep >= moves.length}
              title="Sonraki Hamle"
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="btn-review-nav"
              onClick={() => setCurrentStep(moves.length)}
              disabled={currentStep >= moves.length}
              title="Son Konum"
            >
              <ChevronsRight size={18} />
            </button>

            <span className="review-step-counter">
              {currentStep} / {moves.length}
            </span>
          </div>
        </div>

        {/* Right Column: AI Analysis Card & Move History List */}
        <div className="review-sidebar-col">
          {/* Move Evaluation Card */}
          <div className="review-eval-card">
            <div className="eval-card-header">
              <Sparkles size={16} className="sparkle-accent" />
              <span className="eval-card-title">Hamle Analizi</span>
            </div>

            {currentStep === 0 ? (
              <div className="eval-card-empty">
                <span>Başlangıç konumu. İncelemek için sonraki hamleye geçin.</span>
              </div>
            ) : isAnalyzing ? (
              <div className="eval-card-loading">
                <Bot size={20} className="spin-icon" />
                <span>Stockfish en iyi hamleyi hesaplıyor...</span>
              </div>
            ) : (
              <div className="eval-card-content">
                {/* Accuracy Badge */}
                {currentEval && (
                  <div className={`eval-badge-pill ${currentEval.badge}`}>
                    {currentEval.badge === 'best' && <CheckCircle size={15} />}
                    {currentEval.badge === 'good' && <CheckCircle size={15} />}
                    {currentEval.badge === 'inaccuracy' && <AlertTriangle size={15} />}
                    {currentEval.badge === 'blunder' && <XCircle size={15} />}
                    <span>{currentEval.badgeLabel}</span>
                  </div>
                )}

                <div className="eval-comparison-grid">
                  <div className="eval-comp-cell">
                    <span className="comp-cell-label">Oynanan Hamle</span>
                    <span className="comp-cell-val played">{playedMove?.san || '-'}</span>
                  </div>

                  <div className="eval-comp-cell">
                    <span className="comp-cell-label">Önerilen Hamle</span>
                    <span className="comp-cell-val recommended">
                      {currentEval?.bestMoveSan || playedMove?.san || '-'}
                    </span>
                  </div>
                </div>

                {currentEval?.evalScore !== undefined && (
                  <div className="eval-score-bar-wrap">
                    <span className="eval-score-label">Motor Skoru:</span>
                    <span className="eval-score-val">
                      {currentEval.evalScore > 0
                        ? `+${currentEval.evalScore.toFixed(1)}`
                        : currentEval.evalScore.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Visual Guidance Box */}
                {isBestMove ? (
                  <div className="eval-guidance-box best">
                    <Sparkles size={14} className="guidance-icon" />
                    <span>Mükemmel hamle! Taşın üzerinde yeşil yıldız ile gösteriliyor.</span>
                  </div>
                ) : showArrow && currentEval?.bestMoveSan ? (
                  <div className="eval-guidance-box arrow">
                    <Compass size={14} className="guidance-icon" />
                    <span>Önerilen hamle (<b>{currentEval.bestMoveSan}</b>) tahtada yeşil ok ile işaretlendi.</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Move List */}
          <div className="review-moves-container">
            <div className="review-moves-header">
              <span>#</span>
              <span>Beyaz</span>
              <span>Siyah</span>
            </div>

            <div className="review-moves-scroll">
              {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, turnIdx) => {
                const whiteIdx = turnIdx * 2;
                const blackIdx = turnIdx * 2 + 1;
                const whiteMove = moves[whiteIdx];
                const blackMove = moves[blackIdx];

                const isWhiteActive = currentStep === whiteIdx + 1;
                const isBlackActive = currentStep === blackIdx + 1;

                return (
                  <div key={turnIdx} className="review-move-row">
                    <span className="review-move-turn">{turnIdx + 1}.</span>
                    <button
                      type="button"
                      className={`review-move-btn ${isWhiteActive ? 'active' : ''}`}
                      onClick={() => setCurrentStep(whiteIdx + 1)}
                    >
                      {whiteMove ? whiteMove.san : ''}
                    </button>
                    <button
                      type="button"
                      className={`review-move-btn ${isBlackActive ? 'active' : ''}`}
                      onClick={() => blackMove && setCurrentStep(blackIdx + 1)}
                    >
                      {blackMove ? blackMove.san : ''}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
