import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalInteractiveTagChip({
  label = '',
  onRemove,
  disabled = false,
  className = ''
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-text)] shadow-sm hover:border-[var(--color-primary)]/30 transition-colors select-none ${className}`}
    >
      <span>{label}</span>

      {onRemove && (
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold outline-none text-[var(--color-text-muted)] hover:bg-red-500/15 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

export default function InteractiveTagChipSandbox() {
  const [tags, setTags] = useState(['Ropa Deportiva 👟', 'Talla L 📐', 'Oferta 🔥', 'Nuevo 🌟']);
  const [inputText, setInputText] = useState('');

  const addTag = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (tags.includes(inputText.trim())) return;
    setTags([...tags, inputText.trim()]);
    setInputText('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const controls = [];

  return (
    <SandboxLayout title="InteractiveTagChip" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        
        {/* Contenedor flex con AnimatePresence para animar la entrada/salida de chips */}
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full min-h-[80px]">
          <AnimatePresence>
            {tags.map((tag) => (
              <LocalInteractiveTagChip
                key={tag}
                label={tag}
                onRemove={() => removeTag(tag)}
              />
            ))}
          </AnimatePresence>
          {tags.length === 0 && (
            <div className="text-xs text-[var(--color-text-muted)] w-full text-center flex items-center justify-center select-none py-4">
              Sin filtros activos
            </div>
          )}
        </div>

        <form onSubmit={addTag} className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Nuevo filtro/tag..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 py-2 px-3 rounded-xl text-xs bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:border-[var(--color-primary)] outline-none transition-colors"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl text-xs font-semibold bg-[var(--color-primary)] !text-white hover:bg-[var(--color-primary)]/90 transition-all outline-none"
          >
            Añadir
          </button>
        </form>

        <div className="flex gap-2 w-full">
          <button
            onClick={() => setTags(['Ropa Deportiva 👟', 'Talla L 📐', 'Oferta 🔥', 'Nuevo 🌟'])}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-all outline-none"
          >
            Restaurar Tags Base
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
