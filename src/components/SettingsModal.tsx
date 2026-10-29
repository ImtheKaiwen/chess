import React from 'react';
import { X, Box, Globe, Moon, Sun, Volume2, VolumeX, Keyboard, Sparkles } from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import type { AIDifficulty } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  viewMode: '2d' | '3d';
  onToggleViewMode: (mode: '2d' | '3d') => void;
  aiAssistEnabled?: boolean;
  onToggleAiAssist?: (enabled: boolean) => void;
  aiAssistLevel?: AIDifficulty;
  onChangeAiAssistLevel?: (level: AIDifficulty) => void;
  aiAssistCount?: 1 | 2;
  onChangeAiAssistCount?: (count: 1 | 2) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onToggleLang,
  themeMode,
  onToggleTheme,
  isMuted,
  onToggleSound,
  viewMode,
  onToggleViewMode,
  aiAssistEnabled = false,
  onToggleAiAssist,
  aiAssistLevel = 'master',
  onChangeAiAssistLevel,
  aiAssistCount = 1,
  onChangeAiAssistCount
}) => {
  if (!isOpen) return null;
  const t = translations[lang] || translations.tr;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card settings-modal-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <h2 className="modal-title">{t.settings}</h2>
          </div>
          <button
            type="button"
            className="btn-icon modal-close-btn"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="settings-content-scroll">
          {/* 3D Mode Toggle Section */}
          <div className="settings-section">
            <div className="settings-row">
              <div className="settings-label-group">
                <div className="settings-icon-pill">
                  <Box size={16} />
                </div>
                <div>
                  <span className="settings-label-title">{t.viewMode}</span>
                  <p className="settings-label-desc">
                    {viewMode === '3d' ? t.view3DNotice : '2D klasik tahta görünümü aktif.'}
                  </p>
                </div>
              </div>

              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`pill-btn ${viewMode === '2d' ? 'active' : ''}`}
                  onClick={() => onToggleViewMode('2d')}
                >
                  2D Klasik
                </button>
                <button
                  type="button"
                  className={`pill-btn ${viewMode === '3d' ? 'active' : ''}`}
                  onClick={() => onToggleViewMode('3d')}
                >
                  3D Three.js
                </button>
              </div>
            </div>
          </div>

          {/* AI Move Assistance Section */}
          <div className="settings-section">
            <div className="settings-row">
              <div className="settings-label-group">
                <div className="settings-icon-pill">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="settings-label-title">{t.aiAssist}</span>
                  <p className="settings-label-desc">{t.aiAssistDesc}</p>
                </div>
              </div>

              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`pill-btn ${aiAssistEnabled ? 'active' : ''}`}
                  onClick={() => onToggleAiAssist?.(true)}
                >
                  {t.on}
                </button>
                <button
                  type="button"
                  className={`pill-btn ${!aiAssistEnabled ? 'active' : ''}`}
                  onClick={() => onToggleAiAssist?.(false)}
                >
                  {t.off}
                </button>
              </div>
            </div>

            {aiAssistEnabled && (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="settings-row">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {t.aiAssistLevel}:
                  </span>
                  <div className="settings-pill-toggle">
                    {(['easy', 'medium', 'hard', 'master'] as AIDifficulty[]).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        className={`pill-btn ${aiAssistLevel === lvl ? 'active' : ''}`}
                        onClick={() => onChangeAiAssistLevel?.(lvl)}
                      >
                        {t[lvl]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-row">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {t.aiAssistMoves}:
                  </span>
                  <div className="settings-pill-toggle">
                    <button
                      type="button"
                      className={`pill-btn ${aiAssistCount === 1 ? 'active' : ''}`}
                      onClick={() => onChangeAiAssistCount?.(1)}
                    >
                      {t.bestMoveOnly}
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${aiAssistCount === 2 ? 'active' : ''}`}
                      onClick={() => onChangeAiAssistCount?.(2)}
                    >
                      {t.top2Moves}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <div className="settings-section">
            <div className="settings-row">
              <div className="settings-label-group">
                <div className="settings-icon-pill">
                  <Globe size={16} />
                </div>
                <div>
                  <span className="settings-label-title">{t.language}</span>
                  <p className="settings-label-desc">Arayüz dili / Interface language</p>
                </div>
              </div>

              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`pill-btn ${lang === 'tr' ? 'active' : ''}`}
                  onClick={() => onToggleLang('tr')}
                >
                  Türkçe
                </button>
                <button
                  type="button"
                  className={`pill-btn ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => onToggleLang('en')}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Theme Mode */}
          <div className="settings-section">
            <div className="settings-row">
              <div className="settings-label-group">
                <div className="settings-icon-pill">
                  {themeMode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                </div>
                <div>
                  <span className="settings-label-title">{t.theme}</span>
                  <p className="settings-label-desc">Açık veya koyu renk paleti</p>
                </div>
              </div>

              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`pill-btn ${themeMode === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    if (themeMode !== 'light') onToggleTheme();
                  }}
                >
                  <Sun size={13} style={{ marginRight: 4 }} /> {t.themeLight}
                </button>
                <button
                  type="button"
                  className={`pill-btn ${themeMode === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    if (themeMode !== 'dark') onToggleTheme();
                  }}
                >
                  <Moon size={13} style={{ marginRight: 4 }} /> {t.themeDark}
                </button>
              </div>
            </div>
          </div>

          {/* Sound Mode */}
          <div className="settings-section">
            <div className="settings-row">
              <div className="settings-label-group">
                <div className="settings-icon-pill">
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </div>
                <div>
                  <span className="settings-label-title">{t.sound}</span>
                  <p className="settings-label-desc">Hamle ve bildirim ses efektleri</p>
                </div>
              </div>

              <div className="settings-pill-toggle">
                <button
                  type="button"
                  className={`pill-btn ${!isMuted ? 'active' : ''}`}
                  onClick={() => {
                    if (isMuted) onToggleSound();
                  }}
                >
                  <Volume2 size={13} style={{ marginRight: 4 }} /> {t.soundOn}
                </button>
                <button
                  type="button"
                  className={`pill-btn ${isMuted ? 'active' : ''}`}
                  onClick={() => {
                    if (!isMuted) onToggleSound();
                  }}
                >
                  <VolumeX size={13} style={{ marginRight: 4 }} /> {t.soundOff}
                </button>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="settings-section shortcuts-section">
            <div className="shortcuts-title-wrap">
              <Keyboard size={15} />
              <span>{t.shortcuts}</span>
            </div>

            <div className="shortcuts-table">
              <div className="shortcut-item">
                <span className="shortcut-desc">Hamle Geri Al</span>
                <kbd className="kbd-tag">Ctrl + Z</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Hamle İleri Al</span>
                <kbd className="kbd-tag">Ctrl + Y</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Tahtayı Çevir</span>
                <kbd className="kbd-tag">F</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Sesi Aç / Kapat</span>
                <kbd className="kbd-tag">M</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">3D / 2D Görünüm Değiştir</span>
                <kbd className="kbd-tag">3</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-primary" onClick={onClose}>
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
