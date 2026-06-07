import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function useLocalStorageState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : (typeof defaultValue === 'function' ? defaultValue() : defaultValue);
    } catch {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  });
  const keyRef = useRef(key);
  keyRef.current = key;
  const setPersistedState = useCallback((value) => {
    try {
      setState((prevState) => {
        const newValue = typeof value === 'function' ? value(prevState) : value;
        window.localStorage.setItem(keyRef.current, JSON.stringify(newValue));
        return newValue;
      });
    } catch (e) {
      console.warn(e);
    }
  }, []);
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === keyRef.current && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return [state, setPersistedState];
}

export default function UseLocalStorageStateSandbox() {
  const [name, setName] = useLocalStorageState('sandbox_user_name', 'Sergio');
  const [count, setCount] = useLocalStorageState('sandbox_counter', 0);

  return (
    <SandboxLayout
      title="useLocalStorageState"
      description="Mantiene el estado sincronizado con localStorage. Abre otra pestaña del dashboard para ver los cambios sincronizarse en tiempo real."
      controls={[]}
    >
      <div className="space-y-4 w-full">
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">Nombre Persistente</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500/50"
            placeholder="Escribe tu nombre..."
          />
        </div>
        <div className="flex items-center justify-between p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">Contador Persistente</span>
            <p className="text-xs font-mono text-indigo-400 font-bold">Valor: {count}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCount(c => c - 1)}
              className="p-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text)] rounded-lg cursor-pointer transition-all active:scale-95"
            >
              <Minus size={12} />
            </button>
            <button
              onClick={() => setCount(c => c + 1)}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer transition-all active:scale-95"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
