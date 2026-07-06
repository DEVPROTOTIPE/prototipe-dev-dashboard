import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para el Sandbox de pruebas
function LocalSliderNumericInput({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const startXRef = React.useRef(0);
  const startValRef = React.useRef(0);

  const handlePointerDown = (e) => {
    if (disabled || isEditing) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startValRef.current = value;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const stepsMoved = Math.round(deltaX / 10);
    const newVal = Math.min(max, Math.max(min, startValRef.current + stepsMoved * step));
    if (newVal !== value && onChange) {
      onChange(newVal);
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative w-full select-none">
      {isEditing ? (
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          autoFocus
          onBlur={handleBlur}
          onChange={(e) => {
            const num = Number(e.target.value);
            if (!isNaN(num) && onChange) {
              onChange(Math.min(max, Math.max(min, num)));
            }
          }}
          className="w-full text-center text-lg font-bold rounded-xl border border-[var(--color-primary)] bg-[var(--color-surface)] py-3 px-4 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      ) : (
        <motion.div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          whileTap={{ scale: 0.98 }}
          className={`w-full text-center py-3 px-4 rounded-xl border font-bold text-lg cursor-ew-resize transition-all
            ${isDragging 
              ? 'border-[var(--color-primary)] bg-[var(--color-surface-2)] shadow-md shadow-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/20' 
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/60'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--color-surface-3)]/40 pointer-events-none' : ''}
          `}
        >
          <span className="text-xs font-normal text-[var(--color-text-muted)] block">Arrastra o Doble Click</span>
          <span className="text-xl font-extrabold text-[var(--color-text)]">{value}</span>
        </motion.div>
      )}
    </div>
  );
}

export default function SliderNumericInputSandbox() {
  const [val, setVal] = useState(10);
  const [disabled, setDisabled] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Control',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'number',
      label: 'Valor Mínimo',
      value: min,
      onChange: (v) => setMin(Number(v))
    },
    {
      type: 'number',
      label: 'Valor Máximo',
      value: max,
      onChange: (v) => setMax(Number(v))
    }
  ];

  return (
    <SandboxLayout title="SliderNumericInput" controls={controls}>
      <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-sm mx-auto">
        <div className="w-full">
          <LocalSliderNumericInput
            min={min}
            max={max}
            value={val}
            onChange={setVal}
            disabled={disabled}
          />
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Valor del estado padre: <span className="font-mono text-[var(--color-text)] font-bold">{val}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
