import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Color, GameStatus } from '../engine/types';
import { Trophy, RefreshCw, Eye } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface GameOverModalProps {
  status: GameStatus;
  winner: Color | 'draw' | null;
  totalMoves: number;
  gameDuration: number;
  whiteCapturedCount: number;
  blackCapturedCount: number;
  onNewGame: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  winner,
  totalMoves,
  gameDuration,
  whiteCapturedCount,
  blackCapturedCount,
  onNewGame,
  onClose
}) => {
  useEffect(() => {
    if (status === 'checkmate') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [status]);

  let title = 'Oyun Bitti';
  let desc = 'Müsabaka tamamlandı.';

  if (status === 'checkmate') {
    const winnerName = winner === 'white' ? 'Beyaz' : 'Siyah';
    title = `Şah Mat! ${winnerName} Kazandı! 👑`;
    desc = `Mükemmel bir taktikle rakip şah sıkıştırıldı ve ${totalMoves} hamlede mat edildi.`;
  } else if (status === 'stalemate') {
    title = 'Pat! Oyun Berabere';
    desc = 'Sırası gelen oyuncunun yasal bir hamlesi yok ve şah tehdit altında değil.';
  } else if (status === 'resigned') {
    const winnerName = winner === 'white' ? 'Beyaz' : 'Siyah';
    title = `Terk Nedeniyle ${winnerName} Kazandı`;
    desc = 'Rakip oyuncu oyunu terk etti.';
  } else if (status === 'draw') {
    title = 'Karşılıklı Beraberlik';
    desc = 'Oyuncular karşılıklı olarak beraberlikte anlaştı.';
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header-icon">
          <Trophy size={28} />
        </div>

        <h2 className="modal-title">{title}</h2>
        <p className="modal-desc">{desc}</p>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Toplam Hamle</span>
            <span className="stat-val">{totalMoves}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Oyun Süresi</span>
            <span className="stat-val">{formatTime(gameDuration)}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Beyazın Aldığı</span>
            <span className="stat-val">{whiteCapturedCount} Taş</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Siyahın Aldığı</span>
            <span className="stat-val">{blackCapturedCount} Taş</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onNewGame}>
            <RefreshCw size={16} />
            <span>Yeni Oyun Başlat</span>
          </button>

          <button className="btn-secondary" onClick={onClose}>
            <Eye size={16} />
            <span>Tahtayı İncele</span>
          </button>
        </div>
      </div>
    </div>
  );
};
