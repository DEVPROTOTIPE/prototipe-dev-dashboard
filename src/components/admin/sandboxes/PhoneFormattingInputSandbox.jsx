import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Phone } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

const COUNTRY_CODES = [
  { value: '+57', label: '🇨🇴 +57' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+52', label: '🇲🇽 +52' },
  { value: '+34', label: '🇪🇸 +34' },
  { value: '+54', label: '🇦🇷 +54' }
];

// Componente Local para simulación autónoma en el sandbox
function LocalPhoneFormattingInput({
  value,
  onChange,
  countryCode = '+57',
  onCountryCodeChange,
  placeholder = '300 123 4567',
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false);

  // Sanitiza el texto reteniendo solo números
  const cleanNumber = (val) => val.replace(/\D/g, '');

  // Aplica la máscara XXX XXX XXXX
  const formatPhone = (val) => {
    const raw = cleanNumber(val).slice(0, 10);
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 3)} ${raw.slice(3)}`;
    return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPhone(rawValue);
    const clean = cleanNumber(formatted);
    onChange(clean, formatted);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`flex items-stretch w-full min-h-[44px] rounded-xl border bg-[var(--color-surface)] overflow-hidden transition-all duration-300 ${
          isFocused
            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md shadow-[var(--color-primary)]/5'
            : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]/50'
        }`}
      >
        {/* Selector de Indicativo de País */}
        <div className="w-[110px] shrink-0 border-r border-[var(--color-border)] flex items-center bg-[var(--color-surface-2)]">
          <CustomSelect
            options={COUNTRY_CODES}
            value={countryCode}
            onChange={onCountryCodeChange}
            className="border-none bg-transparent h-full"
          />
        </div>

        {/* Input Telefónico */}
        <div className="flex-1 flex items-center px-3.5">
          <Phone className="w-5 h-5 text-[var(--color-text-muted)] shrink-0 mr-2.5" />
          <input
            type="text"
            value={formatPhone(value)}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-10 bg-transparent text-[var(--color-text)] focus:outline-none placeholder-transparent text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}

export default function PhoneFormattingInputSandbox() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedNumber, setFormattedNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+57');

  const handlePhoneChange = (clean, formatted) => {
    setPhoneNumber(clean);
    setFormattedNumber(formatted);
  };

  return (
    <SandboxLayout
      title="PhoneFormattingInput"
      description="Input de formulario para teléfono que introduce espaciado de lectura en tiempo real y gestiona prefijos internacionales con CustomSelect."
      controls={
        <div className="space-y-4">
          <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
            <span className="font-semibold text-[var(--color-text)]">Prefijo Activo:</span>
            <p>{countryCode}</p>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Número de Contacto Celular
          </label>
          <LocalPhoneFormattingInput
            value={phoneNumber}
            onChange={handlePhoneChange}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            placeholder="300 123 4567"
          />
        </div>

        <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border)] space-y-2 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-[var(--color-text-muted)] font-medium">Prefijo:</span>
            <span className="font-mono font-bold text-[var(--color-text)]">{countryCode}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] font-medium">Valor Limpio (State):</span>
            <span className="font-mono font-bold text-[var(--color-primary)]">
              {phoneNumber || 'Vacío'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] font-medium">Valor Formateado (Visual):</span>
            <span className="font-mono font-bold text-[var(--color-text)]">
              {formattedNumber || 'Vacío'}
            </span>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
