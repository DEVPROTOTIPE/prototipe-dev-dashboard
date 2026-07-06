import React, { useState, useRef, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalAutoResizeTextArea({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  minRows = 3,
  maxHeight = 300,
  className = ''
}) {
  const textareaRef = useRef(null);

  const resize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reiniciar altura para calcular el scrollHeight real
    textarea.style.height = 'auto';

    // Asignar el scrollHeight con un tope opcional
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={`w-full p-3 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none resize-none transition-all duration-200 overflow-y-auto scrollbar-thin ${className}`}
      style={{ maxHeight: `${maxHeight}px` }}
    />
  );
}

export default function AutoResizeTextAreaSandbox() {
  const [text, setText] = useState('');
  const [minRows, setMinRows] = useState(3);
  const [maxHeight, setMaxHeight] = useState(250);

  return (
    <SandboxLayout
      title="AutoResizeTextArea"
      description="Caja de entrada de texto multilínea que ajusta automáticamente su altura al contenido para evitar scrolls innecesarios."
      controls={
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Filas Mínimas
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 5].map((rows) => (
                <button
                  key={rows}
                  onClick={() => setMinRows(rows)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    minRows === rows
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  {rows} filas
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Altura Máxima
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[150, 250, 400].map((height) => (
                <button
                  key={height}
                  onClick={() => setMaxHeight(height)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    maxHeight === height
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  {height}px
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Área de Observaciones / Notas
            </label>
            <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
              Caracteres: {text.length}
            </span>
          </div>

          <LocalAutoResizeTextArea
            value={text}
            onChange={setText}
            placeholder="Comienza a escribir párrafos largos aquí para observar cómo se expande la altura de la caja de forma inteligente..."
            minRows={minRows}
            maxHeight={maxHeight}
          />
        </div>

        <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          <strong className="text-[var(--color-text)]">Comportamiento esperado:</strong> La caja crecerá verticalmente de forma adaptativa hasta llegar al tope de <span className="font-semibold">{maxHeight}px</span>, momento en el cual activará de forma segura el scrollbar nativo suavizado.
        </div>
      </div>
    </SandboxLayout>
  );
}
