import React from 'react';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const config: Record<AlertVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-50 backdrop-blur-sm',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: (
      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-amber-50 backdrop-blur-sm',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: (
      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-50 backdrop-blur-sm',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: (
      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-sky-50 backdrop-blur-sm',
    border: 'border-sky-200',
    text: 'text-sky-800',
    icon: (
      <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export const Alert: React.FC<AlertProps> = ({ variant, title, children, onClose }) => {
  const c = config[variant];
  return (
    <div
      className={[
        'flex gap-3 rounded-2xl border p-4',
        c.bg, c.border,
      ].join(' ')}
      role="alert"
    >
      <span className="mt-0.5 shrink-0">{c.icon}</span>
      <div className="flex-1">
        {title && <p className={['text-sm font-semibold mb-0.5', c.text].join(' ')}>{title}</p>}
        <p className={['text-sm', c.text].join(' ')}>{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={['shrink-0 opacity-60 hover:opacity-100 transition-opacity', c.text].join(' ')}
          aria-label="Fechar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
