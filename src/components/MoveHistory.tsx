import React, { useEffect, useRef } from 'react';
import type { MoveRecord } from '../engine/types';
import { Copy, Flag, Handshake, ScrollText } from 'lucide-react';

interface MoveHistoryProps {
  moveHistory: MoveRecord[];
  onCopyFEN: () => void;
  onCopyPGN: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  disabled: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moveHistory,
  onCopyFEN,
  onCopyPGN,
  onResign,
  onOfferDraw,
  disabled
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new move is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  // Group moves into pairs (White & Black)
  const rows: { turn: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    rows.push({
      turn: Math.floor(i / 2) + 1,
      white: moveHistory[i].san,
      black: moveHistory[i + 1]?.san
    });
  }

  return (
    <div className="sidebar-panel">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <ScrollText size={16} color="#10a37f" />
          <span>Hamle Geçmişi</span>
        </div>
        <span className="move-count-badge">
          {moveHistory.length} hamle
        </span>
      </div>

      <div className="move-list-container" ref={containerRef}>
        {rows.length === 0 ? (
          <div className="empty-history-hint">
            <span>Henüz bir hamle yapılmadı.</span>
            <span style={{ fontSize: '0.78rem' }}>Beyaz taşlarla ilk hamleyi yapın.</span>
          </div>
        ) : (
          rows.map((row, idx) => {
            const isLastRow = idx === rows.length - 1;
            return (
              <div key={row.turn} className="move-row">
                <span className="move-index">{row.turn}.</span>
                <span className={`move-cell ${isLastRow && !row.black ? 'latest' : ''}`}>
                  {row.white}
                </span>
                <span className={`move-cell ${isLastRow && row.black ? 'latest' : ''}`}>
                  {row.black || ''}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <div className="action-row">
          <button className="btn-secondary" onClick={onCopyFEN} title="FEN Pozisyonunu Kopyala">
            <Copy size={14} />
            <span>FEN</span>
          </button>
          <button className="btn-secondary" onClick={onCopyPGN} title="PGN Oyun Kaydını Kopyala">
            <Copy size={14} />
            <span>PGN</span>
          </button>
        </div>

        <div className="action-row">
          <button
            className="btn-secondary"
            onClick={onOfferDraw}
            disabled={disabled || moveHistory.length < 2}
            title="Beraberlik Teklif Et"
          >
            <Handshake size={14} />
            <span>Berabere</span>
          </button>
          <button
            className="btn-secondary"
            onClick={onResign}
            disabled={disabled || moveHistory.length === 0}
            title="Oyunu Terk Et"
          >
            <Flag size={14} />
            <span>Terk Et</span>
          </button>
        </div>
      </div>
    </div>
  );
};
