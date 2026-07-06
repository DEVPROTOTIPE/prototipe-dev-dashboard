import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para simulación autónoma en el sandbox
function LocalDualSliderRange({
  min = 0,
  max = 100,
  value = [10, 80],
  onChange,
  disabled = false
}) {
  const containerRef = React.useRef(null);
  const [rangeVal, setRangeVal] = useState(value);

  React.useEffect(() => {
    setRangeVal(value);
  }, [value]);

  const getPercentage = (val) => {
    return ((val - min) / (max - min)) * 100;
  };

  const handlePointerDown = (e, isMax) => {
    if (disabled || !containerRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const updateValue = (pointerEvent) => {
      const { left, width } = containerRef.current.getBoundingClientRect();
      const clientX = pointerEvent.clientX;
      const percentage = Math.max(0, Math.min(100, ((clientX - left) / width) * 100));
      const calculatedVal = Math.round(min + (percentage / 100) * (max - min));

      const newRange = [...rangeVal];
      if (isMax) {
        newRange[1] = Math.max(newRange[0] + 1, calculatedVal);
      } else {
        newRange[0] = Math.min(newRange[1] - 1, calculatedVal);
      }
      
      setRangeVal(newRange);
      if (onChange) onChange(newRange);
    };

    const handlePointerMove = (moveEvent) => updateValue(moveEvent);
    const handlePointerUp = (upEvent) => {
      upEvent.currentTarget.releasePointerCapture(upEvent.pointerId);
      upEvent.currentTarget.removeEventListener('pointermove', handlePointerMove);
      upEvent.currentTarget.removeEventListener('pointerup', handlePointerUp);
    };

    e.currentTarget.addEventListener('pointermove', handlePointerMove);
    e.currentTarget.addEventListener('pointerup', handlePointerUp);
  };

  const minPct = getPercentage(rangeVal[0]);
  const maxPct = getPercentage(rangeVal[1]);

  return (
    <div className={`w-full py-4 px-2 select-none ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
      <div
        ref={containerRef}
        className="relative w-full h-2 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)]"
      >
        <div
          className="absolute h-full bg-[var(--color-primary)] rounded-full"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <motion.div
          onPointerDown={(e) => handlePointerDown(e, false)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[var(--color-primary)] shadow-md cursor-ew-resize z-20"
          style={{ left: `calc(${minPct}% - 10px)` }}
        />
        <motion.div
          onPointerDown={(e) => handlePointerDown(e, true)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[var(--color-primary)] shadow-md cursor-ew-resize z-20"
          style={{ left: `calc(${maxPct}% - 10px)` }}
        />
      </div>
    </div>
  );
}

export default function DualSliderRangeSandbox() {
  const [disabled, setDisabled] = useState(false);
  const [range, setRange] = useState([20, 75]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Slider',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'number',
      label: 'Límite Mínimo',
      value: min,
      onChange: (v) => setMin(Number(v))
    },
    {
      type: 'number',
      label: 'Límite Máximo',
      value: max,
      onChange: (v) => setMax(Number(v))
    }
  ];

  return (
    <SandboxLayout title="DualSliderRange" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <LocalDualSliderRange
          min={min}
          max={max}
          value={range}
          onChange={setRange}
          disabled={disabled}
        />
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center flex justify-around">
          <div>Min: <span className="font-mono text-[var(--color-text)] font-bold">{range[0]}</span></div>
          <div>Max: <span className="font-mono text-[var(--color-text)] font-bold">{range[1]}</span></div>
        </div>
      </div>
    </SandboxLayout>
  );
}
