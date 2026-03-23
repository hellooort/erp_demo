import { CheckCircle2, Clock, ArrowDownRight } from 'lucide-react';
import { statusLabel } from '@/types';

const COMPLETED = ['confirmed', 'received'];
const PENDING = ['draft', 'ordered', 'pending'];

export function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status);
  let c = 'bg-slate-100 text-slate-700';
  let I = Clock;

  if (status === 'completed') {
    c = 'bg-sky-100 text-sky-700';
    I = CheckCircle2;
  } else if (COMPLETED.includes(status)) {
    c = 'bg-emerald-100 text-emerald-700';
    I = CheckCircle2;
  } else if (PENDING.includes(status)) {
    c = 'bg-amber-100 text-amber-700';
    I = Clock;
  } else if (status === 'partial_received') {
    c = 'bg-blue-100 text-blue-700';
    I = ArrowDownRight;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c}`}>
      <I className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
