import React, { useEffect, useRef } from 'react';
import type { MoveRecord } from '../engine/types';
import {
  RotateCcw,
  RotateCw,
  ArrowUpDown,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Home,
  Copy,
  Flag,
  Handshake,
  ScrollText,
  Loader2,
  ChevronRight,
  Box,
  Sparkles
} from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface GameSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  lang?: Language;
  viewMode: '2d' | '3d';
  onToggleViewMode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFlipBoard: () => void;
  onReturnToMenu: () => void;
  moveHistory: MoveRecord[];
  evalScore: number;
  isAiThinking: boolean;
  aiDifficulty?: string;
  onCopyFEN: () => void;
  onCopyPGN: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  isGameOver: boolean;
  aiAssistEnabled?: boolean;
  onToggleAiAssist?: () => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  isOpen,
  onToggleOpen,
  themeMode,
  onToggleTheme,
  isMuted,
  onToggleSound,
  lang = 'tr',
  viewMode,
  onToggleViewMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFlipBoard,
  onReturnToMenu,
  moveHistory,
  evalScore,
  isAiThinking,
  aiDifficulty,
  onCopyFEN,
  onCopyPGN,
  onResign,
  onOfferDraw,
  isGameOver,
  aiAssistEnabled = false,
  onToggleAiAssist
}) => {
  const t = translations[lang] || translations.tr;
  const containerRef = useRef<HTMLDivElement>(null);
  const logoSrc = themeMode === 'light' ? './kaiwen-logo-dark.png' : './kaiwen-logo-white.png';

  // Auto scroll to bottom of move list
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  // Group moves into turn pairs
  const rows: { turn: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    rows.push({
      turn: Math.floor(i / 2) + 1,
      white: moveHistory[i].san,
      black: moveHistory[i + 1]?.san
    });
  }

  // Clamped eval bar width (-10 to +10 range)
  const clamped = Math.max(-10, Math.min(10, evalScore));
  const whitePercent = 50 + clamped * 4.5;
  const scoreFormatted = evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1);

  return (
    <>
      {/* ------------------------------------------------------
          FLOATING COMPACT VERTICAL DOCK (When drawer is closed)
          ------------------------------------------------------ */}
      {!isOpen && (
        <div className="floating-edge-dock">
          {/* Main open handle with clean move badge */}
          <button
            type="button"
            className="dock-item-btn dock-btn-expand"
            onClick={onToggleOpen}
            data-tooltip={lang === 'en' ? 'Open Move Log' : 'Hamle Listesini Aç'}
          >
            <ScrollText size={16} />
            {moveHistory.length > 0 && (
              <span className="dock-move-badge">{moveHistory.length}</span>
            )}
          </button>

          <div className="dock-divider" />

          {/* Quick Action Icons */}
          <button
            type="button"
            className="dock-item-btn"
            onClick={onUndo}
            disabled={!canUndo}
            data-tooltip={`${t.undo} (Ctrl+Z)`}
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            className="dock-item-btn"
            onClick={onRedo}
            disabled={!canRedo}
            data-tooltip={`${t.redo} (Ctrl+Y)`}
          >
            <RotateCw size={15} />
          </button>

          <button
            type="button"
            className="dock-item-btn"
            onClick={onFlipBoard}
            data-tooltip={`${t.flip} (F)`}
          >
            <ArrowUpDown size={15} />
          </button>

          <button
            type="button"
            className={`dock-item-btn ${viewMode === '3d' ? 'active' : ''}`}
            onClick={onToggleViewMode}
            data-tooltip={viewMode === '3d' ? (lang === 'en' ? 'Switch to 2D Board' : '2D Tahtaya Geç') : (lang === 'en' ? 'Switch to 3D Scene' : '3D Three.js Sahnesine Geç')}
          >
            <Box size={15} />
          </button>

          {onToggleAiAssist && (
            <button
              type="button"
              className={`dock-item-btn ${aiAssistEnabled ? 'active' : ''}`}
              onClick={onToggleAiAssist}
              data-tooltip={aiAssistEnabled ? (lang === 'en' ? 'Disable AI Move Assistance' : 'Yapay Zeka Hamle Desteğini Kapat') : (lang === 'en' ? 'Enable AI Move Assistance' : 'Yapay Zeka Hamle Desteğini Aç')}
            >
              <Sparkles size={15} />
            </button>
          )}

          <div className="dock-divider" />

          <button
            type="button"
            className="dock-item-btn"
            onClick={onToggleTheme}
            data-tooltip={themeMode === 'light' ? t.themeDark : t.themeLight}
          >
            {themeMode === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button
            type="button"
            className={`dock-item-btn ${isMuted ? '' : 'active'}`}
            onClick={onToggleSound}
            data-tooltip={isMuted ? t.soundOn : t.soundOff}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            type="button"
            className="dock-item-btn"
            onClick={onReturnToMenu}
            data-tooltip={t.returnToMenu}
          >
            <Home size={15} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------
          SLIDE-OUT FLOATING DRAWER PANEL (When open)
          ------------------------------------------------------ */}
      <aside className={`game-drawer ${isOpen ? 'drawer-open' : 'drawer-closed'}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <img
              src={logoSrc}
              alt="KAIWEN"
              className="drawer-logo"
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="drawer-title">KAIWEN</span>
          </div>

          <div className="drawer-header-actions">
            <button
              type="button"
              className="btn-drawer-header"
              onClick={onReturnToMenu}
              title={t.returnToMenu}
            >
              <Home size={14} />
              <span>{t.menu}</span>
            </button>

            <button
              type="button"
              className="btn-drawer-collapse"
              onClick={onToggleOpen}
              title={lang === 'en' ? 'Hide Panel' : 'Paneli Gizle'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="drawer-toolbar">
          <button
            type="button"
            className="btn-drawer-tool"
            onClick={onUndo}
            disabled={!canUndo}
            title={`${t.undo} (Ctrl+Z)`}
          >
            <RotateCcw size={13} />
            <span>{t.undo}</span>
          </button>

          <button
            type="button"
            className="btn-drawer-tool"
            onClick={onRedo}
            disabled={!canRedo}
            title={`${t.redo} (Ctrl+Y)`}
          >
            <RotateCw size={13} />
            <span>{t.redo}</span>
          </button>

          <button
            type="button"
            className="btn-drawer-tool"
            onClick={onFlipBoard}
            title={`${t.flip} (F)`}
          >
            <ArrowUpDown size={13} />
            <span>{t.flip}</span>
          </button>

          <button
            type="button"
            className={`btn-drawer-tool ${viewMode === '3d' ? 'active' : ''}`}
            onClick={onToggleViewMode}
            title={viewMode === '3d' ? (lang === 'en' ? 'Switch to 2D' : '2D Moduna Geç') : (lang === 'en' ? 'Switch to 3D' : '3D Three.js Sahnesine Geç')}
          >
            <Box size={13} />
            <span>{viewMode === '3d' ? '3D' : '2D'}</span>
          </button>

          {onToggleAiAssist && (
            <button
              type="button"
              className={`btn-drawer-tool ${aiAssistEnabled ? 'active' : ''}`}
              onClick={onToggleAiAssist}
              title={aiAssistEnabled ? (lang === 'en' ? 'Disable AI Assist' : 'AI Hamle Desteğini Kapat') : (lang === 'en' ? 'Enable AI Assist' : 'AI Hamle Desteğini Aç')}
            >
              <Sparkles size={13} />
              <span>AI</span>
            </button>
          )}

          <button
            type="button"
            className="btn-drawer-tool"
            onClick={onToggleTheme}
            title={themeMode === 'light' ? t.themeDark : t.themeLight}
          >
            {themeMode === 'light' ? <Moon size={13} /> : <Sun size={13} />}
          </button>

          <button
            type="button"
            className={`btn-drawer-tool ${isMuted ? '' : 'active'}`}
            onClick={onToggleSound}
            title={isMuted ? t.soundOn : t.soundOff}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>

        {/* Integrated Evaluation Box */}
        <div className="drawer-eval-card">
          <div className="eval-row-meta">
            <span className="eval-label">{lang === 'en' ? 'Position Evaluation' : 'Pozisyon Analizi'}</span>
            <div className="eval-meta-right">
              {aiDifficulty && (
                <span className="eval-ai-pill">Stockfish ({aiDifficulty})</span>
              )}
              {isAiThinking ? (
                <span className="eval-thinking-tag">
                  <Loader2 size={11} className="spin-icon" /> {t.calculating}
                </span>
              ) : (
                <span className="eval-score-num">{scoreFormatted}</span>
              )}
            </div>
          </div>

          <div className="eval-bar-track">
            <div className="eval-bar-fill" style={{ width: `${whitePercent}%` }} />
          </div>
        </div>

        {/* Move History Section */}
        <div className="drawer-history-section">
          <div className="history-sub-header">
            <span className="history-col-num">#</span>
            <span className="history-col-turn">{t.white}</span>
            <span className="history-col-turn">{t.black}</span>
          </div>

          <div ref={containerRef} className="drawer-moves-scroll">
            {rows.length === 0 ? (
              <div className="empty-moves-notice">
                <span>{lang === 'en' ? 'Game started. Make your first move.' : 'Oyun başladı. İlk hamlenizi yapın.'}</span>
              </div>
            ) : (
              rows.map(row => (
                <div key={row.turn} className="move-table-row">
                  <span className="move-col-index">{row.turn}.</span>
                  <span className="move-col-notation white-move">{row.white}</span>
                  <span className="move-col-notation black-move">{row.black || ''}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer">
          <div className="footer-export-row">
            <button
              type="button"
              className="btn-export-code"
              onClick={onCopyFEN}
              title={lang === 'en' ? 'Copy Current FEN' : 'Mevcut FEN Notasyonunu Kopyala'}
            >
              <Copy size={12} />
              <span>{t.copyFEN}</span>
            </button>
            <button
              type="button"
              className="btn-export-code"
              onClick={onCopyPGN}
              title={lang === 'en' ? 'Copy Complete PGN' : 'Tüm PGN Hamle Notasyonunu Kopyala'}
            >
              <Copy size={12} />
              <span>{t.copyPGN}</span>
            </button>
          </div>

          {!isGameOver && (
            <div className="footer-game-decisions">
              <button
                type="button"
                className="btn-game-decision draw"
                onClick={onOfferDraw}
                title={lang === 'en' ? 'Offer Draw' : 'Beraberlik Teklif Et'}
              >
                <Handshake size={13} />
                <span>{t.draw}</span>
              </button>

              <button
                type="button"
                className="btn-game-decision resign"
                onClick={onResign}
                title={lang === 'en' ? 'Resign Match' : 'Oyunu Terk Et'}
              >
                <Flag size={13} />
                <span>{t.resign}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
