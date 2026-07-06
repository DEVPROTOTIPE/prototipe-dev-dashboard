import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';

// Componente Local para el Sandbox de pruebas
function LocalSmartOtpInput({
  length = 6,
  value = '',
  onChange,
  disabled = false
}) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    const valString = String(value || '');
    const newDigits = Array(length).fill('');
    for (let i = 0; i < length; i++) {
      newDigits[i] = valString[i] || '';
    }
    setDigits(newDigits);
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    const lastChar = val.substring(val.length - 1);
    if (lastChar && !/^\d$/.test(lastChar)) return;

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    setDigits(newDigits);

    const joined = newDigits.join('');
    if (onChange) onChange(joined);

    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      if (digits[index] === '' && index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        newDigits[index] = '';
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasteData)) return;

    const newDigits = [...digits];
    for (let i = 0; i < length; i++) {
      if (pasteData[i]) {
        newDigits[i] = pasteData[i];
      }
    }
    setDigits(newDigits);
    if (onChange) onChange(newDigits.join(''));

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 800);

    const focusIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <motion.div 
      animate={isSuccess ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.4 }}
      className="flex gap-2 justify-center items-center py-2"
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={digit}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={idx === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`w-10 h-12 text-center text-lg font-bold rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)] outline-none transition-all duration-200
            ${isSuccess 
              ? 'border-green-500 ring-4 ring-green-500/20' 
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20'
            }
            disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
        />
      ))}
    </motion.div>
  );
}

export default function SmartOtpInputSandbox() {
  const [val, setVal] = useState('');
  const [length, setLength] = useState(6);
  const [disabled, setDisabled] = useState(false);

  const controls = [
    {
      type: 'toggle',
      label: 'Deshabilitar Input',
      value: disabled,
      onChange: setDisabled
    },
    {
      type: 'select',
      label: 'Longitud del Código',
      value: length,
      onChange: (v) => {
        setLength(Number(v));
        setVal('');
      },
      options: [
        { value: 4, label: '4 Casilleros' },
        { value: 6, label: '6 Casilleros' }
      ]
    }
  ];

  return (
    <SandboxLayout title="SmartOtpInput" controls={controls}>
      <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-sm mx-auto">
        <div className="w-full">
          <LocalSmartOtpInput
            length={length}
            value={val}
            onChange={setVal}
            disabled={disabled}
          />
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] w-full text-center">
          Valor del código: <span className="font-mono text-[var(--color-text)] font-bold">{val || 'Vacio'}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
