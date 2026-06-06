import React, { useState, useEffect, useRef } from 'react';
import { SandboxLayout } from './SandboxLayout';

function SandboxOTPInputField({ length = 4, onComplete = () => {}, disabled = false }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    setOtp(Array(length).fill(''));
  }, [length]);

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }

    if (cleanValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '') {
        if (index > 0) {
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').substring(0, length);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < length; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      if (pastedData.length === length) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex justify-center gap-2.5 w-full max-w-xs mx-auto">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[idx]}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-11 h-11 sm:w-12 sm:h-12 text-center text-sm font-black bg-slate-900 border rounded-xl outline-none text-slate-100 transition-all focus:scale-105 ${
            otp[idx] ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-800'
          } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-40 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

export default function OtpInputFieldSandbox() {
  const [length, setLength] = useState('4');
  const [disabled, setDisabled] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  return (
    <SandboxLayout
      title="OTPInputField"
      description="Campo de entrada especializado de 4 o 6 dígitos numéricos. Maneja pegado directo y retroceso inteligente."
      controls={[
        { label: 'Dígitos', type: 'select', value: length, options: ['4', '6'], onChange: setLength },
        { label: 'Deshabilitado', type: 'toggle', value: disabled, onChange: setDisabled },
      ]}
    >
      <div className="space-y-5 w-full">
        <SandboxOTPInputField
          key={`${length}-${disabled}`}
          length={Number(length)}
          disabled={disabled}
          onComplete={(code) => setOtpCode(code)}
        />
        <div className="text-center">
          {otpCode ? (
            <p className="text-xs text-emerald-400 font-bold">Código Completado: <span className="font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">{otpCode}</span></p>
          ) : (
            <p className="text-xs text-slate-500 font-medium">Ingresa el código OTP para verificar</p>
          )}
        </div>
      </div>
    </SandboxLayout>
  );
}
