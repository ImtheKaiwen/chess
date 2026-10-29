import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Color, GameStatus } from '../engine/types';
import { Trophy, RefreshCw, Eye, Scale, Handshake, Flag, Clock, ShieldAlert } from 'lucide-react';
import { formatTime } from '../utils/helpers';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface GameOverModalProps {
  status: GameStatus;
  winner: Color | 'draw' | null;
  reason?: string;
  totalMoves: number;
  gameDuration: number;
  whiteCapturedCount: number;
  blackCapturedCount: number;
  lang?: Language;
  onNewGame: () => void;
  onClose: () => void;
  onInspect?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  winner,
  reason,
  totalMoves,
  gameDuration,
  whiteCapturedCount,
  blackCapturedCount,
  lang = 'tr',
  onNewGame,
  onClose,
  onInspect
}) => {
  const t = translations[lang] || translations.tr;

  useEffect(() => {
    if (status === 'checkmate') {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 }
      });
    }
  }, [status]);

  const winnerName =
    winner === 'white'
      ? lang === 'en'
        ? 'White'
        : 'Beyaz'
      : winner === 'black'
      ? lang === 'en'
        ? 'Black'
        : 'Siyah'
      : '';

  // Determine modal theme, icon, badge, title and detailed description
  let icon = <Trophy size={32} />;
  let badgeText = lang === 'en' ? 'Game Over' : 'Oyun Bitti';
  let badgeClass = 'badge-neutral';
  let title = lang === 'en' ? 'Game Over' : 'Oyun Bitti';
  let desc = lang === 'en' ? 'Match concluded.' : 'Müsabaka tamamlandı.';

  if (status === 'checkmate') {
    icon = <Trophy size={32} className="icon-gold" />;
    badgeText = lang === 'en' ? 'Checkmate' : 'Şah Mat';
    badgeClass = 'badge-win';
    title = lang === 'en' ? `Checkmate! ${winnerName} Won! 👑` : `Şah Mat! ${winnerName} Kazandı! 👑`;
    desc =
      lang === 'en'
        ? `The king was cornered through brilliant tactics and checkmated in ${totalMoves} moves.`
        : `Rakip şah mükemmel bir taktikle sıkıştırıldı ve ${totalMoves} hamlede şah mat edildi.`;
  } else if (status === 'stalemate' || reason?.toLowerCase().includes('pat') || reason?.toLowerCase().includes('stalemate')) {
    icon = <ShieldAlert size={32} className="icon-stalemate" />;
    badgeText = lang === 'en' ? 'Stalemate · No Legal Moves' : 'PAT · Hamle Kalmadı';
    badgeClass = 'badge-draw';
    title = lang === 'en' ? 'Stalemate! Game is a Draw ⚖️' : 'Pat Oldu! Oyun Berabere ⚖️';
    desc =
      lang === 'en'
        ? 'The king is NOT in check, but the player has no legal moves remaining. Under chess rules, this is a Stalemate (Draw).'
        : 'Şah doğrudan tehdit altında değil; ancak kaçacak ya da oynanabilecek hiçbir yasal hamle kalmadığı için oyun kurallar gereği PAT (Beraberlik) ilan edildi.';
  } else if (reason?.toLowerCase().includes('yetersiz') || reason?.toLowerCase().includes('insufficient')) {
    icon = <Scale size={32} className="icon-draw" />;
    badgeText = lang === 'en' ? 'Insufficient Material' : 'Yetersiz Taş';
    badgeClass = 'badge-draw';
    title = lang === 'en' ? 'Draw by Insufficient Material 🤝' : 'Yetersiz Taş! Oyun Berabere 🤝';
    desc =
      lang === 'en'
        ? 'Neither player has sufficient pieces remaining to deliver checkmate (e.g. King vs King). The game is drawn.'
        : 'Tahtadaki mevcut taşlar mat yapmaya yetersizdir (örneğin sadece şahlar kaldı). Oyun kural gereği berabere tamamlandı.';
  } else if (status === 'resigned' || reason?.toLowerCase().includes('terk') || reason?.toLowerCase().includes('resign')) {
    icon = <Flag size={32} className="icon-resign" />;
    badgeText = lang === 'en' ? 'Resignation' : 'Terk Edildi';
    badgeClass = 'badge-resign';
    title = lang === 'en' ? `${winnerName} Won by Resignation` : `Terk Nedeniyle ${winnerName} Kazandı`;
    desc =
      lang === 'en'
        ? 'The game ended because the opponent resigned.'
        : 'Rakip oyuncu oyunu terk ettiği için karşılaşma sona erdi.';
  } else if (status === 'timeout' || reason?.toLowerCase().includes('süre') || reason?.toLowerCase().includes('time')) {
    icon = <Clock size={32} className="icon-timeout" />;
    badgeText = lang === 'en' ? 'Time Out' : 'Süre Bitti';
    badgeClass = 'badge-timeout';
    title = lang === 'en' ? `${winnerName} Won on Time ⏱️` : `${winnerName} Süreden Kazandı ⏱️`;
    desc =
      lang === 'en'
        ? 'Match ended because time ran out.'
        : 'Rakip oyuncunun süresi tükendiği için oyun tamamlandı.';
  } else {
    // Mutual draw
    icon = <Handshake size={32} className="icon-draw" />;
    badgeText = lang === 'en' ? 'Mutual Draw' : 'Karşılıklı Beraberlik';
    badgeClass = 'badge-draw';
    title = lang === 'en' ? 'Game Drawn by Agreement 🤝' : 'Karşılıklı Anlaşma ile Berabere 🤝';
    desc =
      lang === 'en'
        ? 'Both players agreed to a mutual draw.'
        : 'Her iki taraf da beraberlik teklifini kabul etti.';
  }

  return (
    <div className="modal-backdrop gameover-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card gameover-modal-card">
        <div className={`modal-header-icon ${badgeClass}`}>
          {icon}
        </div>

        <div className="gameover-badge-pill">
          <span className={`gameover-badge ${badgeClass}`}>{badgeText}</span>
        </div>

        <h2 className="modal-title gameover-title">{title}</h2>
        <p className="modal-desc gameover-desc">{desc}</p>

        <div className="stats-grid gameover-stats-grid">
          <div className="stat-item">
            <span className="stat-label">{t.totalMovesStat}</span>
            <span className="stat-val">{totalMoves}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">{t.gameDurationStat}</span>
            <span className="stat-val">{formatTime(gameDuration)}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">{t.whiteCapturedStat}</span>
            <span className="stat-val">{whiteCapturedCount}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">{t.blackCapturedStat}</span>
            <span className="stat-val">{blackCapturedCount}</span>
          </div>
        </div>

        <div className="modal-actions gameover-actions">
          <button type="button" className="btn-primary" onClick={onNewGame}>
            <RefreshCw size={16} />
            <span>{t.playAgain}</span>
          </button>

          <button type="button" className="btn-secondary" onClick={onInspect || onClose}>
            <Eye size={16} />
            <span>{t.reviewBoard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
