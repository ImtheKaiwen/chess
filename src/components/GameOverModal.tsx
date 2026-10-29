import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Color, GameStatus } from '../engine/types';
import { Trophy, RefreshCw, Eye } from 'lucide-react';
import { formatTime } from '../utils/helpers';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface GameOverModalProps {
  status: GameStatus;
  winner: Color | 'draw' | null;
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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [status]);

  let title = lang === 'en' ? 'Game Over' : 'Oyun Bitti';
  let desc = lang === 'en' ? 'Match concluded.' : 'Müsabaka tamamlandı.';

  if (status === 'checkmate') {
    const winnerName =
      winner === 'white'
        ? lang === 'en'
          ? 'White'
          : 'Beyaz'
        : lang === 'en'
        ? 'Black'
        : 'Siyah';
    title =
      lang === 'en'
        ? `Checkmate! ${winnerName} Won! 👑`
        : `Şah Mat! ${winnerName} Kazandı! 👑`;
    desc =
      lang === 'en'
        ? `King cornered through brilliant tactics and checkmated in ${totalMoves} moves.`
        : `Mükemmel bir taktikle rakip şah sıkıştırıldı ve ${totalMoves} hamlede mat edildi.`;
  } else if (status === 'stalemate') {
    title = lang === 'en' ? 'Stalemate! Draw' : 'Pat! Oyun Berabere';
    desc =
      lang === 'en'
        ? 'The active player has no legal moves and king is not in check.'
        : 'Sırası gelen oyuncunun yasal bir hamlesi yok ve şah tehdit altında değil.';
  } else if (status === 'resigned') {
    const winnerName =
      winner === 'white'
        ? lang === 'en'
          ? 'White'
          : 'Beyaz'
        : lang === 'en'
        ? 'Black'
        : 'Siyah';
    title =
      lang === 'en'
        ? `${winnerName} Won by Resignation`
        : `Terk Nedeniyle ${winnerName} Kazandı`;
    desc = lang === 'en' ? 'Opponent resigned.' : 'Rakip oyuncu oyunu terk etti.';
  } else if (status === 'draw') {
    title = lang === 'en' ? 'Mutual Draw' : 'Karşılıklı Beraberlik';
    desc =
      lang === 'en'
        ? 'Players agreed to a mutual draw.'
        : 'Oyuncular karşılıklı olarak beraberlikte anlaştı.';
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card gameover-modal-card">
        <div className="modal-header-icon">
          <Trophy size={28} />
        </div>

        <h2 className="modal-title">{title}</h2>
        <p className="modal-desc">{desc}</p>

        <div className="stats-grid">
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

        <div className="modal-actions">
          <button className="btn-primary" onClick={onNewGame}>
            <RefreshCw size={16} />
            <span>{t.playAgain}</span>
          </button>

          <button className="btn-secondary" onClick={onInspect || onClose}>
            <Eye size={16} />
            <span>{t.reviewBoard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
