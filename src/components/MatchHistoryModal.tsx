import React from 'react';
import { X, History, Trash2, Calendar, Trophy, ChevronRight, Eye } from 'lucide-react';
import type { MatchHistoryItem } from '../services/statsService';
import { clearMatchHistory } from '../services/statsService';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MatchHistoryItem[];
  onRefresh: () => void;
  onClear?: () => void;
  onSelectMatch?: (match: MatchHistoryItem) => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRefresh,
  onClear,
  onSelectMatch
}) => {
  if (!isOpen) return null;

  const handleClear = () => {
    clearMatchHistory();
    if (onClear) {
      onClear();
    } else {
      onRefresh();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card history-modal-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-row">
            <History size={18} className="modal-title-icon" />
            <h2 className="modal-title">Maç Geçmişi</h2>
            <span className="history-count-badge">{history.length} Maç</span>
          </div>
          <div className="modal-header-actions">
            {history.length > 0 && (
              <button
                type="button"
                className="btn-icon-text btn-clear-modal"
                onClick={handleClear}
                data-tooltip="Geçmişi Temizle"
              >
                <Trash2 size={14} />
                <span>Temizle</span>
              </button>
            )}
            <button
              type="button"
              className="btn-icon modal-close-btn"
              onClick={onClose}
              aria-label="Kapat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="history-modal-body">
          {history.length === 0 ? (
            <div className="empty-history-state">
              <Trophy size={36} className="empty-icon" />
              <p className="empty-title">Henüz Kayıtlı Maç Yok</p>
              <p className="empty-desc">
                Stockfish yapay zekası veya bir arkadaşınızla maç tamamladığınızda sonuçlar burada listelenecektir.
              </p>
            </div>
          ) : (
            <div className="history-modal-list">
              {history.map(item => (
                <div
                  key={item.id}
                  className="history-card-item cursor-pointer"
                  onClick={() => {
                    if (onSelectMatch) {
                      onSelectMatch(item);
                      onClose();
                    }
                  }}
                  title="Maçı İncele"
                >
                  <div className="history-card-left">
                    <div className={`result-indicator-bar ${item.result}`} />
                    <div className="history-card-info">
                      <div className="history-opp-row">
                        <span className="history-opp-name">{item.opponent}</span>
                        <span className={`result-tag ${item.result}`}>
                          {item.result === 'win'
                            ? 'Zafer'
                            : item.result === 'loss'
                            ? 'Yenilgi'
                            : 'Berabere'}
                        </span>
                      </div>
                      <div className="history-meta-sub">
                        <span className="meta-sub-item">
                          <Calendar size={12} />
                          {item.date}
                        </span>
                        <span className="meta-separator">•</span>
                        <span>{item.totalMoves} Hamle</span>
                        <span className="meta-separator">•</span>
                        <span>{item.playerColor === 'white' ? 'Beyaz' : 'Siyah'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="history-card-right-action">
                    <span className="inspect-pill">
                      <Eye size={12} />
                      <span>İncele</span>
                    </span>
                    <ChevronRight size={16} className="history-card-arrow" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-primary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
