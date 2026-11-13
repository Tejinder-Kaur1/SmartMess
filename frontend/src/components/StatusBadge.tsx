import React from 'react';
import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'PENDING' | 'RESOLVED' | 'ATTENDED' | 'MISSED' | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  if (normalized === 'RESOLVED' || normalized === 'ATTENDED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{normalized === 'ATTENDED' ? 'Attended' : 'Resolved'}</span>
      </span>
    );
  }

  if (normalized === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/70 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
        <span>Pending Review</span>
      </span>
    );
  }

  if (normalized === 'MISSED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 shadow-2xs">
        <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
        <span>Missed</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 shadow-2xs capitalize">
      <AlertCircle className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
      <span>{status.toLowerCase()}</span>
    </span>
  );
};

export default StatusBadge;
