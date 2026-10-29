import React from 'react';
import type { Color, PieceType } from '../engine/types';
import { PieceIcon } from '../assets/PieceIcons';
import { Crown } from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface PromotionModalProps {
  color: Color;
  lang?: Language;
  onSelect: (pieceType: PieceType) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  lang = 'tr',
  onSelect
}) => {
  const t = translations[lang] || translations.tr;

  const choices: { type: PieceType; label: string; sub: string }[] = [
    {
      type: 'queen',
      label: lang === 'en' ? 'Queen' : 'Vezir',
      sub: lang === 'en' ? '9 Points (Strongest)' : '9 Puan (En Güçlü)'
    },
    {
      type: 'rook',
      label: lang === 'en' ? 'Rook' : 'Kale',
      sub: lang === 'en' ? '5 Points' : '5 Puan'
    },
    {
      type: 'bishop',
      label: lang === 'en' ? 'Bishop' : 'Fil',
      sub: lang === 'en' ? '3 Points' : '3 Puan'
    },
    {
      type: 'knight',
      label: lang === 'en' ? 'Knight' : 'At',
      sub: lang === 'en' ? '3 Points' : '3 Puan'
    }
  ];

  return (
    <div className="modal-backdrop promotion-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card promotion-modal-card">
        <div className="promotion-modal-header">
          <div className="promotion-header-icon">
            <Crown size={22} />
          </div>
          <div className="promotion-header-text">
            <h2 className="promotion-title">{t.promotionTitle}</h2>
            <p className="promotion-desc">{t.promotionDesc}</p>
          </div>
        </div>

        <div className="promotion-grid">
          {choices.map(c => (
            <button
              key={c.type}
              type="button"
              className="promotion-option-btn"
              onClick={() => onSelect(c.type)}
              autoFocus={c.type === 'queen'}
            >
              <div className="promotion-piece-wrapper">
                <PieceIcon color={color} type={c.type} />
              </div>
              <div className="promotion-option-info">
                <span className="promotion-option-name">{c.label}</span>
                <span className="promotion-option-sub">{c.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
