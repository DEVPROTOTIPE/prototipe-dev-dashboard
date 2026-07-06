import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function SandboxDarkModeToggle({ isDark = false, onToggle = () => {}, className = '' }) {
  return (
    <button
      onClick={onToggle}
      className={`focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:scale-105 active:scale-95 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-amber-400'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 shadow-sm'
      } ${className}`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
    >
      <div className="transition-transform duration-500" style={{ transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)' }}>
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </div>
    </button>
  );
}

export default function DarkModeToggleSandbox() {
  const [isDark, setIsDark] = useState(false);
  const [size, setSize] = useState('md');
  const sizes = { sm: 'p-1.5 rounded-lg', md: 'p-2.5 rounded-xl', lg: 'p-3.5 rounded-2xl' };
  
  return (
    <SandboxLayout
      title="DarkModeToggle"
      description="Interruptor de tema claro/oscuro con animación de rotación."
      controls={[
        { label: 'Estado', type: 'toggle', value: isDark, onChange: setIsDark, labels: ['Claro', 'Oscuro'] },
        { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
      ]}
    >
      <div className="flex flex-col items-center gap-6">
        <div className={`transition-all duration-500 ${isDark ? 'bg-[var(--color-surface)] p-8 rounded-2xl' : 'bg-white p-8 rounded-2xl shadow-md'}`}>
          <SandboxDarkModeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} className={sizes[size]} />
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
          isDark: <span className={isDark ? 'text-amber-400' : 'text-indigo-400'}>{String(isDark)}</span>
        </p>
      </div>
    </SandboxLayout>
  );
}
