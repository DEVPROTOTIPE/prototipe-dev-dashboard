import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function useDebounceValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function UseDebounceValueSandbox() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounceValue(search, 500);

  return (
    <SandboxLayout
      title="useDebounceValue"
      description="Retrasa la propagación de entrada para optimizar búsquedas. El valor debounced se actualiza tras 500ms de inactividad de teclado."
      controls={[
        { label: 'Input búsqueda', type: 'text', value: search, onChange: setSearch },
      ]}
    >
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5">
          <Search size={14} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Escribe rápido aquí..."
            className="bg-transparent outline-none text-xs text-slate-100 placeholder-slate-600 w-full"
          />
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[10px] font-mono text-slate-300">
          <p>Valor en caliente: <span className="text-indigo-400 font-bold">"{search}"</span></p>
          <p>Valor debounced: <span className="text-emerald-400 font-bold">"{debouncedSearch}"</span></p>
        </div>
      </div>
    </SandboxLayout>
  );
}
