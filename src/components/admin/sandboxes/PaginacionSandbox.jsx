import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

export default function PaginacionSandbox() {
  const [page, setPage] = useState(3);
  const [total, setTotal] = useState(10);
  const [showEllipsis, setShowEllipsis] = useState(true);

  const getPages = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        if (showEllipsis) pages.push('...');
      }
    }
    return pages;
  };

  return (
    <SandboxLayout
      title="Paginación Fluida"
      description="Paginador adaptativo con elipsis y navegación por página. Responsive a cualquier total."
      controls={[
        { label: 'Total págs.', type: 'number', value: total, onChange: v => { setTotal(Math.max(1, Number(v))); setPage(1); } },
        { label: 'Página', type: 'number', value: page, onChange: v => setPage(Math.min(Math.max(1, Number(v)), total)) },
        { label: 'Elipsis', type: 'toggle', value: showEllipsis, onChange: setShowEllipsis, labels: ['No', 'Sí'] },
      ]}
    >
      <div className="space-y-4 w-full text-center">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-2.5 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-lg cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
            ‹
          </button>
          {getPages().map((p, idx) => (
            p === '...'
              ? <span key={`el-${idx}`} className="px-1 text-[10px] text-[var(--color-text-muted)]">…</span>
              : <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                    p === page ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/80'
                  }`}>
                  {p}
                </button>
          ))}
          <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}
            className="px-2.5 py-1.5 text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)] rounded-lg cursor-pointer disabled:opacity-30 hover:bg-[var(--color-surface-2)]/80 transition-all">
            ›
          </button>
        </div>
        <p className="text-center text-[10px] text-[var(--color-text-muted)] font-mono">
          Página <span className="text-indigo-400 font-bold">{page}</span> de <span className="text-indigo-400 font-bold">{total}</span>
        </p>
      </div>
    </SandboxLayout>
  );
}
