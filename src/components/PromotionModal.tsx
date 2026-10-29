import React from 'react';
import type { Color, PieceType } from '../engine/types';
import { PieceIcon } from '../assets/PieceIcons';

interface PromotionModalProps {
  color: Color;
  onSelect: (pieceType: PieceType) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect }) => {
  const choices: { type: PieceType; label: string }[] = [
    { type: 'queen', label: 'Vezir' },
    { type: 'rook', label: 'Kale' },
    { type: 'bishop', label: 'Fil' },
    { type: 'knight', label: 'At' }
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '380px' }}>
        <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Piyon Terfisi</h2>
        <p className="modal-desc" style={{ fontSize: '0.85rem' }}>
          Piyonunuz tahtanın son karesine ulaştı. Dönüşeceği taşı seçin:
        </p>

        <div className="promotion-grid">
          {choices.map(c => (
            <div
              key={c.type}
              className="promotion-card"
              onClick={() => onSelect(c.type)}
            >
              <div style={{ width: '48px', height: '48px' }}>
                <PieceIcon color={color} type={c.type} />
              </div>
              <span className="promotion-label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
