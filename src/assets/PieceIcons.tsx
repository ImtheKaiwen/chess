import React from 'react';
import type { Color, PieceType } from '../engine/types';

interface PieceProps {
  color: Color;
  type: PieceType;
  className?: string;
}

export const PieceIcon: React.FC<PieceProps> = ({ color, type, className = '' }) => {
  const isWhite = color === 'white';

  switch (type) {
    case 'pawn':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <path
            fill="#ffffff"
            stroke="#1c1917"
            strokeWidth="1.5"
            strokeLinecap="round"
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <path
            fill="#1c1917"
            stroke="#e7e5e4"
            strokeWidth="1.5"
            strokeLinecap="round"
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          />
        </svg>
      );

    case 'knight':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="none" fillRule="evenodd" stroke="#1c1917" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path
              fill="#ffffff"
              d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
            />
            <path
              fill="#ffffff"
              d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3"
            />
            <path fill="#1c1917" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="none" fillRule="evenodd" stroke="#e7e5e4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path
              fill="#1c1917"
              d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
            />
            <path
              fill="#1c1917"
              d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3"
            />
            <path fill="#e7e5e4" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5" />
            <path fill="#e7e5e4" stroke="none" d="m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z" />
          </g>
        </svg>
      );

    case 'bishop':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="none" fillRule="evenodd" stroke="#1c1917" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <g fill="#ffffff" strokeLinecap="butt">
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="none" fillRule="evenodd" stroke="#e7e5e4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <g fill="#1c1917" strokeLinecap="butt">
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path stroke="#e7e5e4" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" />
          </g>
        </svg>
      );

    case 'rook':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="#ffffff" fillRule="evenodd" stroke="#1c1917" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" />
            <path d="m34 14-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter" />
            <path d="m31 29.5 1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="#1c1917" fillRule="evenodd" stroke="#e7e5e4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" />
            <path d="m34 14-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter" />
            <path d="m31 29.5 1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" fill="none" stroke="#e7e5e4" strokeLinejoin="miter" />
          </g>
        </svg>
      );

    case 'queen':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="#ffffff" fillRule="evenodd" stroke="#1c1917" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
            <path d="m9 26 8.5-10.5 4 8 4-8L34 26l3.5-12.5-7 3.5-6-9-6 9-7-3.5L9 26z" strokeLinecap="butt" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-20 3c3-1 17-1 20 0" fill="none" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="#1c1917" fillRule="evenodd" stroke="#e7e5e4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
            <path d="m9 26 8.5-10.5 4 8 4-8L34 26l3.5-12.5-7 3.5-6-9-6 9-7-3.5L9 26z" strokeLinecap="butt" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-20 3c3-1 17-1 20 0" fill="none" stroke="#e7e5e4" />
          </g>
        </svg>
      );

    case 'king':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="none" fillRule="evenodd" stroke="#1c1917" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path
              fill="#ffffff"
              d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
            <path
              fill="#ffffff"
              d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2.5-6 2.5s-3-7.5-10-7.5-10 7.5-10 7.5-2-3.5-6-2.5c-3 6 6 10.5 6 10.5v7z"
            />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className} width="100%" height="100%">
          <g fill="none" fillRule="evenodd" stroke="#e7e5e4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path
              fill="#1c1917"
              d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
              strokeLinecap="butt"
              strokeLinejoin="miter"
            />
            <path
              fill="#1c1917"
              d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2.5-6 2.5s-3-7.5-10-7.5-10 7.5-10 7.5-2-3.5-6-2.5c-3 6 6 10.5 6 10.5v7z"
            />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#e7e5e4" />
          </g>
        </svg>
      );
  }
};
