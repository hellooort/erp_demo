import { useState, useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Modal } from './Modal';
import { PARTNER_TYPE_LABELS } from '@/types';
import type { Partner } from '@/types';

interface Props {
  partners: Partner[];
  title: string;
  onSelect: (partner: Partner) => void;
  onClose: () => void;
}

export function PartnerSearchModal({ partners, title, onSelect, onClose }: Props) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q) return partners;
    const s = q.toLowerCase();
    return partners.filter(p => p.name.toLowerCase().includes(s));
  }, [partners, q]);

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder="거래처명 검색..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100 -mx-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">검색 결과가 없습니다</div>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-indigo-50 rounded-lg text-left transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 text-sm">{p.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      p.type === 'sales' || p.type === 'both'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {PARTNER_TYPE_LABELS[p.type]}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {p.biz_no} · {p.rep}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
