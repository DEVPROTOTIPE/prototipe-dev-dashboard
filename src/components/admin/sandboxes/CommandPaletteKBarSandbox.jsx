import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

function SandboxCommandPaletteKBar({ isOpen, onClose, commands = [] }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => { setSelectedIndex(0); }, [search]);

  const handleKeyDown = (e) => {
    if (filteredCommands.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetCmd = filteredCommands[selectedIndex];
      if (targetCmd) {
        targetCmd.action();
        onClose();
      }
    }
  };

  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.children[selectedIndex];
      if (activeElement) activeElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[360px] mt-[10vh] overflow-hidden z-10 text-slate-100 text-left">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 shrink-0">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un comando o navega..."
            className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-550 focus:ring-0"
          />
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[9px] font-bold text-slate-400">ESC</kbd>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1" ref={listRef}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const showCategory = idx === 0 || filteredCommands[idx - 1].category !== cmd.category;
              return (
                <div key={cmd.id}>
                  {showCategory && (
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5 mt-2">{cmd.category}</div>
                  )}
                  <div
                    onClick={() => { cmd.action(); onClose(); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer ${
                      selectedIndex === idx ? 'bg-indigo-600/15 text-indigo-400 font-bold' : 'text-slate-350 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xs">{cmd.title}</span>
                    {cmd.shortcut && (
                      <span className="font-mono text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{cmd.shortcut}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-slate-550">No se encontraron resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommandPaletteKBarSandbox() {
  const { showAlert } = useAlertConfirm();
  const [isOpen, setIsOpen] = useState(false);
  
  const mockCommands = [
    { id: '1', title: 'Ir al CRM de Clientes', category: 'Navegación', action: () => showAlert({ title: 'Navegación', message: 'Redirección simulada al CRM de Clientes.', variant: 'info' }), shortcut: 'G + C' },
    { id: '2', title: 'Ver Facturación Comisional', category: 'Navegación', action: () => showAlert({ title: 'Navegación', message: 'Redirección simulada a Facturación Comisional.', variant: 'info' }), shortcut: 'G + B' },
    { id: '3', title: 'Crear Nuevo Producto', category: 'Acciones', action: () => showAlert({ title: 'Acción Ejecutada', message: 'Formulario de Creación de Producto abierto en segundo plano.', variant: 'success' }), shortcut: 'N + P' },
    { id: '4', title: 'Ver Diagnóstico de Latencia', category: 'Sistema', action: () => showAlert({ title: 'Diagnóstico de Red', message: 'Latencia central: 24ms (Excelente)\nFirestore: Conectado\nStorage: Conectado', variant: 'success' }), shortcut: 'D + P' }
  ];

  return (
    <SandboxLayout
      title="CommandPaletteKBar"
      description="Barra de búsqueda flotante de comandos globales. Presiona el botón o usa CMD+K / CTRL+K para probar."
      controls={[]}
    >
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-none"
        >
          Abrir Paleta de Comandos
        </button>
        <p className="text-[10px] text-slate-500 font-mono">O presiona Ctrl+K / Cmd+K en tu teclado.</p>

        <SandboxCommandPaletteKBar isOpen={isOpen} onClose={() => setIsOpen(false)} commands={mockCommands} />
      </div>
    </SandboxLayout>
  );
}
