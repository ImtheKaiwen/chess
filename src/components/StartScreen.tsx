import React, { useState } from 'react';
import {
  Bot,
  Users,
  Sparkles,
  Zap,
  Clock,
  Infinity as InfinityIcon,
  Play,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Plus,
  PanelLeftClose,
  PanelLeft,
  History,
  Trash2,
  Settings,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Globe
} from 'lucide-react';
import type { AIDifficulty } from '../services/aiService';
import { DIFFICULTY_CONFIG } from '../services/aiService';
import type { PlayerStats, MatchHistoryItem } from '../services/statsService';
import type { Color } from '../engine/types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

export type GameMode = 'ai' | 'pvp';

export interface GameSettings {
  mode: GameMode;
  difficulty: AIDifficulty;
  playerColor: Color | 'random';
  timeLimit: number; // in seconds (0 = unlimited)
}

interface StartScreenProps {
  initialSettings: GameSettings;
  stats: PlayerStats;
  matchHistory: MatchHistoryItem[];
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onSelectMatch?: (match: MatchHistoryItem) => void;
  onStartGame: (settings: GameSettings) => void;
  onRefreshHistory: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  initialSettings,
  stats,
  matchHistory,
  themeMode,
  onToggleTheme,
  isMuted,
  onToggleSound,
  lang,
  onToggleLang,
  onOpenSettings,
  onOpenHistory,
  onSelectMatch,
  onStartGame,
  onRefreshHistory
}) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [step, setStep] = useState<number>(1);

  // Wizard Selections
  const [mode, setMode] = useState<GameMode>(initialSettings.mode);
  const [difficulty, setDifficulty] = useState<AIDifficulty>(initialSettings.difficulty);
  const [playerColor, setPlayerColor] = useState<Color | 'random'>(initialSettings.playerColor);
  const [timeLimit, setTimeLimit] = useState<number>(initialSettings.timeLimit);

  const t = translations[lang];
  const logoSrc = themeMode === 'light' ? './kaiwen-logo-dark.png' : './kaiwen-logo-white.png';
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  // Max steps: 4 if AI mode, 3 if PvP mode
  const totalSteps = mode === 'ai' ? 4 : 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      handleLaunch();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const handleLaunch = () => {
    onStartGame({
      mode,
      difficulty,
      playerColor,
      timeLimit
    });
  };

  return (
    <div className="lobby-layout">
      {/* ------------------------------------------------------
          SIDEBAR: OPENAI STYLE COLLAPSIBLE WITH TOOLTIPS
          ------------------------------------------------------ */}
      <aside className={`lobby-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        {/* Sidebar Header */}
        <div className="lobby-sidebar-header">
          {sidebarOpen && (
            <div className="lobby-brand-mini">
              <img
                src={logoSrc}
                alt="KAIWEN"
                className="lobby-mini-logo"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="lobby-brand-name">KAIWEN</span>
            </div>
          )}

          <button
            type="button"
            className="btn-icon sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-tooltip={sidebarOpen ? 'Paneli Daralt' : 'Paneli Genişlet'}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
        </div>

        {/* EXPANDED SIDEBAR CONTENT */}
        {sidebarOpen ? (
          <>
            {/* New Match Quick Button */}
            <div className="sidebar-action-pad">
              <button
                type="button"
                className="btn-new-match"
                onClick={() => setStep(1)}
                data-tooltip="Yeni Karşılaşma Kur"
              >
                <Plus size={16} />
                <span>{t.newMatch}</span>
              </button>
            </div>

            {/* Match History List */}
            <div className="sidebar-history-section">
              <div className="history-section-header">
                <div className="section-title-wrap">
                  <History size={14} />
                  <span>{t.matchHistory}</span>
                </div>
                {matchHistory.length > 0 && (
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={onRefreshHistory}
                    data-tooltip="Geçmişi Temizle"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className="history-items-scroll">
                {matchHistory.length === 0 ? (
                  <div className="empty-history-text">
                    <span>{t.emptyHistory}</span>
                  </div>
                ) : (
                  matchHistory.map(m => (
                    <div
                      key={m.id}
                      className="history-item-row cursor-pointer"
                      onClick={() => onSelectMatch?.(m)}
                      data-tooltip="Maçı İncele"
                    >
                      <div className="item-main-info">
                        <span className="item-title">{m.opponent}</span>
                        <span className="item-meta">
                          {m.date} · {m.totalMoves} hamle
                        </span>
                      </div>
                      <span className={`result-tag ${m.result}`}>
                        {m.result === 'win' ? 'Zafer' : m.result === 'loss' ? 'Yenilgi' : 'Berabere'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar Bottom: Stats & Utility Row */}
            <div className="sidebar-bottom-panel">
              <div className="mini-stats-grid">
                <div className="mini-stat-cell">
                  <span className="mini-stat-label">{t.totalGames}</span>
                  <span className="mini-stat-val">{stats.totalGames}</span>
                </div>
                <div className="mini-stat-cell">
                  <span className="mini-stat-label">{t.winRate}</span>
                  <span className="mini-stat-val">%{winRate}</span>
                </div>
                <div className="mini-stat-cell">
                  <span className="mini-stat-label">{t.bestStreak}</span>
                  <span className="mini-stat-val">{stats.bestStreak}</span>
                </div>
              </div>

              <div className="sidebar-utility-row">
                <button
                  type="button"
                  className="btn-utility"
                  onClick={onToggleTheme}
                  data-tooltip={themeMode === 'light' ? 'Koyu Temaya Geç' : 'Açık Temaya Geç'}
                >
                  {themeMode === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  <span>{themeMode === 'light' ? 'Koyu' : 'Açık'}</span>
                </button>

                <button
                  type="button"
                  className={`btn-utility ${isMuted ? '' : 'active'}`}
                  onClick={onToggleSound}
                  data-tooltip={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isMuted ? 'Sessiz' : 'Ses'}</span>
                </button>

                <button
                  type="button"
                  className="btn-utility"
                  onClick={onOpenSettings}
                  data-tooltip="Ayarlar"
                >
                  <Settings size={14} />
                  <span>Ayar</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* COLLAPSED SIDEBAR ICON STACK (With Modern OpenAI Tooltips) */
          <div className="sidebar-collapsed-stack">
            <div className="collapsed-top-actions">
              <button
                type="button"
                className="btn-icon-collapsed"
                onClick={() => setStep(1)}
                data-tooltip="Yeni Karşılaşma Kur"
              >
                <Plus size={18} />
              </button>

              <button
                type="button"
                className="btn-icon-collapsed"
                onClick={onOpenHistory}
                data-tooltip="Maç Geçmişi"
              >
                <History size={18} />
              </button>

              <button
                type="button"
                className="btn-icon-collapsed"
                onClick={onOpenSettings}
                data-tooltip="Ayarlar ve 3D Modu"
              >
                <Settings size={18} />
              </button>
            </div>

            <div className="collapsed-bottom-actions">
              <button
                type="button"
                className="btn-icon-collapsed"
                onClick={() => onToggleLang(lang === 'tr' ? 'en' : 'tr')}
                data-tooltip={`Dil: ${lang === 'tr' ? 'English' : 'Türkçe'}`}
              >
                <Globe size={18} />
              </button>

              <button
                type="button"
                className="btn-icon-collapsed"
                onClick={onToggleTheme}
                data-tooltip={themeMode === 'light' ? 'Koyu Temaya Geç' : 'Açık Temaya Geç'}
              >
                {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <button
                type="button"
                className="btn-icon-collapsed"
                onClick={onToggleSound}
                data-tooltip={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ------------------------------------------------------
          MAIN CENTER: SPACIOUS STEP-BY-STEP GAME SETUP WIZARD
          ------------------------------------------------------ */}
      <main className="lobby-main-content">
        <div className="wizard-center-container">
          {/* Header Title & Clean Branding */}
          <div className="wizard-brand-header">
            <img
              src={logoSrc}
              alt="KAIWEN"
              className="wizard-hero-logo"
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="wizard-title">{t.siteTitle}</h1>
            <p className="wizard-subtitle">{t.heroDesc}</p>
          </div>

          {/* Wizard Step Indicator Pills */}
          <div className="wizard-progress-bar">
            <div className="wizard-steps-track">
              <div
                className={`step-bubble ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}
                onClick={() => setStep(1)}
              >
                <span className="step-num">1</span>
                <span className="step-text">Mod</span>
              </div>
              <div className={`step-connector ${step > 1 ? 'filled' : ''}`} />

              {mode === 'ai' && (
                <>
                  <div
                    className={`step-bubble ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}
                    onClick={() => setStep(2)}
                  >
                    <span className="step-num">2</span>
                    <span className="step-text">Zorluk</span>
                  </div>
                  <div className={`step-connector ${step > 2 ? 'filled' : ''}`} />
                </>
              )}

              <div
                className={`step-bubble ${
                  (mode === 'ai' ? step >= 3 : step >= 2) ? 'active' : ''
                } ${(mode === 'ai' ? step > 3 : step > 2) ? 'done' : ''}`}
                onClick={() => setStep(mode === 'ai' ? 3 : 2)}
              >
                <span className="step-num">{mode === 'ai' ? '3' : '2'}</span>
                <span className="step-text">Renk</span>
              </div>
              <div
                className={`step-connector ${
                  (mode === 'ai' ? step > 3 : step > 2) ? 'filled' : ''
                }`}
              />

              <div
                className={`step-bubble ${
                  (mode === 'ai' ? step >= 4 : step >= 3) ? 'active' : ''
                }`}
                onClick={() => setStep(mode === 'ai' ? 4 : 3)}
              >
                <span className="step-num">{mode === 'ai' ? '4' : '3'}</span>
                <span className="step-text">Süre</span>
              </div>
            </div>
          </div>

          {/* Wizard Card Body */}
          <div className="wizard-card-body">
            {/* STEP 1: GAME MODE */}
            {step === 1 && (
              <div className="wizard-step-pane">
                <div className="pane-heading">
                  <h2 className="pane-title">{t.stepMode}</h2>
                  <p className="pane-desc">Kiminle oynamak istediğinizi seçin</p>
                </div>

                <div className="wizard-options-grid cols-2">
                  <div
                    className={`wizard-card-option ${mode === 'ai' ? 'selected' : ''}`}
                    onClick={() => setMode('ai')}
                  >
                    <div className="card-option-icon ai-glow">
                      <Bot size={28} />
                    </div>
                    <div className="card-option-body">
                      <span className="card-option-title">{t.modeAI}</span>
                      <p className="card-option-desc">{t.modeAIDesc}</p>
                    </div>
                    {mode === 'ai' && <CheckCircle2 size={20} className="check-badge" />}
                  </div>

                  <div
                    className={`wizard-card-option ${mode === 'pvp' ? 'selected' : ''}`}
                    onClick={() => setMode('pvp')}
                  >
                    <div className="card-option-icon pvp-glow">
                      <Users size={28} />
                    </div>
                    <div className="card-option-body">
                      <span className="card-option-title">{t.modePvP}</span>
                      <p className="card-option-desc">{t.modePvPDesc}</p>
                    </div>
                    {mode === 'pvp' && <CheckCircle2 size={20} className="check-badge" />}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 (AI): DIFFICULTY */}
            {mode === 'ai' && step === 2 && (
              <div className="wizard-step-pane">
                <div className="pane-heading">
                  <h2 className="pane-title">{t.stepDifficulty}</h2>
                  <p className="pane-desc">Stockfish yapay zeka seviyesini belirleyin</p>
                </div>

                <div className="wizard-options-grid cols-2">
                  {(['easy', 'medium', 'hard', 'master'] as AIDifficulty[]).map(lvl => {
                    const cfg = DIFFICULTY_CONFIG[lvl];
                    const isSelected = difficulty === lvl;
                    return (
                      <div
                        key={lvl}
                        className={`wizard-card-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => setDifficulty(lvl)}
                      >
                        <div className="card-option-icon">
                          {lvl === 'easy' ? (
                            <Sparkles size={24} />
                          ) : lvl === 'master' ? (
                            <Zap size={24} />
                          ) : (
                            <Bot size={24} />
                          )}
                        </div>
                        <div className="card-option-body">
                          <span className="card-option-title">{cfg.label}</span>
                          <p className="card-option-desc">{cfg.desc}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={20} className="check-badge" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3 (or 2 for PvP): PLAYER COLOR */}
            {((mode === 'ai' && step === 3) || (mode === 'pvp' && step === 2)) && (
              <div className="wizard-step-pane">
                <div className="pane-heading">
                  <h2 className="pane-title">{t.stepColor}</h2>
                  <p className="pane-desc">Oyuna hangi taşlarla başlamak istersiniz?</p>
                </div>

                <div className="wizard-options-grid cols-3">
                  <div
                    className={`wizard-card-option ${playerColor === 'white' ? 'selected' : ''}`}
                    onClick={() => setPlayerColor('white')}
                  >
                    <div className="color-preview-circle white-piece-preview" />
                    <span className="card-option-title">{t.white}</span>
                    <span className="card-option-desc">İlk hamleyi siz yaparsınız</span>
                    {playerColor === 'white' && (
                      <CheckCircle2 size={20} className="check-badge" />
                    )}
                  </div>

                  <div
                    className={`wizard-card-option ${playerColor === 'random' ? 'selected' : ''}`}
                    onClick={() => setPlayerColor('random')}
                  >
                    <div className="color-preview-circle random-piece-preview" />
                    <span className="card-option-title">{t.random}</span>
                    <span className="card-option-desc">Otomatik kura çekilir</span>
                    {playerColor === 'random' && (
                      <CheckCircle2 size={20} className="check-badge" />
                    )}
                  </div>

                  <div
                    className={`wizard-card-option ${playerColor === 'black' ? 'selected' : ''}`}
                    onClick={() => setPlayerColor('black')}
                  >
                    <div className="color-preview-circle black-piece-preview" />
                    <span className="card-option-title">{t.black}</span>
                    <span className="card-option-desc">Siyah taşlarla oynarsınız</span>
                    {playerColor === 'black' && (
                      <CheckCircle2 size={20} className="check-badge" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 (or 3 for PvP): TIME CONTROL */}
            {((mode === 'ai' && step === 4) || (mode === 'pvp' && step === 3)) && (
              <div className="wizard-step-pane">
                <div className="pane-heading">
                  <h2 className="pane-title">{t.stepTime}</h2>
                  <p className="pane-desc">Karşılaşma için süre kısıtlamasını seçin</p>
                </div>

                <div className="wizard-options-grid cols-4">
                  {[
                    { label: '3 Dk', sec: 180, icon: Clock, desc: 'Yıldırım (Blitz)' },
                    { label: '5 Dk', sec: 300, icon: Clock, desc: 'Hızlı (Rapid)' },
                    { label: '10 Dk', sec: 600, icon: Clock, desc: 'Standart' },
                    { label: t.unlimited, sec: 0, icon: InfinityIcon, desc: 'Rahat oyun' }
                  ].map(tc => {
                    const isSelected = timeLimit === tc.sec;
                    const IconComp = tc.icon;
                    return (
                      <div
                        key={tc.sec}
                        className={`wizard-card-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => setTimeLimit(tc.sec)}
                      >
                        <div className="card-option-icon">
                          <IconComp size={22} />
                        </div>
                        <span className="card-option-title">{tc.label}</span>
                        <span className="card-option-desc">{tc.desc}</span>
                        {isSelected && <CheckCircle2 size={20} className="check-badge" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Navigation Controls */}
          <div className="wizard-footer-nav">
            {step > 1 ? (
              <button type="button" className="btn-wizard-back" onClick={handleBack}>
                <ChevronLeft size={16} />
                <span>{t.back}</span>
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button type="button" className="btn-wizard-next" onClick={handleNext}>
                <span>{t.next}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="btn-wizard-launch" onClick={handleLaunch}>
                <Play size={16} />
                <span>{t.start}</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
