import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          {t.type === 'success' ? (
            <Check size={16} color="#34d399" />
          ) : (
            <AlertCircle size={16} color="#10a37f" />
          )}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
};
