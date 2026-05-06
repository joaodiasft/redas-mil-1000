import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

const styles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error:   'bg-red-100 text-red-700',
  info:    'bg-sky-100 text-sky-700',
  default: 'bg-slate-100 text-slate-600',
  brand:   'bg-pink-100 text-pink-700',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
  info:    'bg-sky-500',
  default: 'bg-slate-400',
  brand:   'bg-pink-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  dot = false,
}) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
      styles[variant],
    ].join(' ')}
  >
    {dot && (
      <span className={['w-1.5 h-1.5 rounded-full', dotStyles[variant]].join(' ')} />
    )}
    {children}
  </span>
);
