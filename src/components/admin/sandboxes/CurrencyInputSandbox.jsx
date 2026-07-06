import React, { useState, useEffect } from 'react';
import { Landmark, X } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = '', 
  className = '', 
  disabled = false 
}) {
  const [displayValue, setDisplayValue] = useState('');

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = String(val).replace(/\D/g, '');
    if (!num) return '';
    return '$ ' + Number(num).toLocaleString('es-CO', { maximumFractionDigits: 0 });
  };

  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    const numStr = rawVal.replace(/\D/g, '');
    const finalVal = numStr === '' ? '' : Number(numStr);
    
    setDisplayValue(formatCurrency(numStr));
    onChange(finalVal);
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      inputMode="numeric"
    />
  );
}

export default function CurrencyInputSandbox() {
  const [value, setValue] = useState(150000);
  const [disabled, setDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState('Ingrese valor en COP...');

  return (
    <SandboxLayout
      title="Currency Input"
      description="Máscara monetaria en tiempo real (es-CO) con sanitización y reporte numérico limpio para validaciones."
      controls={[
        { label: 'Disabled', type: 'toggle', value: disabled, onChange: setDisabled, labels: ['Off', 'On'] },
        { label: 'Placeholder', type: 'text', value: placeholder, onChange: setPlaceholder },
      ]}
    >
      <div className="w-full space-y-3 text-left">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Importe de Transacción (COP)</label>
        
        <div className={`flex items-center gap-2.5 bg-[var(--color-surface)] border rounded-xl px-3.5 py-2.5 transition-all ${
          disabled ? 'border-[var(--color-border)] opacity-50' : 'border-[var(--color-border)] focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20'
        }`}>
          <Landmark size={14} className="text-[var(--color-text-muted)] shrink-0" />
          
          <CurrencyInput
            value={value}
            onChange={setValue}
            disabled={disabled}
            placeholder={placeholder}
            className="bg-transparent outline-none text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] w-full disabled:cursor-not-allowed"
          />
          
          {value !== '' && !disabled && (
            <button 
              onClick={() => setValue('')} 
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer flex items-center justify-center"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex justify-between items-center bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl p-3 text-[10px]">
          <span className="font-semibold text-[var(--color-text-muted)]">Valor Reportado (Padre):</span>
          <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {value === '' ? '"" (cadena vacía)' : typeof value + ': ' + value}
          </span>
        </div>
      </div>
    </SandboxLayout>
  );
}
