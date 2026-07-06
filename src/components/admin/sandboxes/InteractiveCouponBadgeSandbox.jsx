import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

function SandboxInteractiveCouponBadge({ onValidate, onApply, onRemove }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  const triggerConfetti = async () => {
    try {
      const module = await import('canvas-confetti');
      const confetti = module.default || module;
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.75 }, colors: ['#6366f1', '#10b981', '#f59e0b'] });
    } catch (e) {
      console.warn(e.message);
    }
  };

  const handleApply = async () => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) return;
    setStatus('validating');
    setErrorMessage('');
    try {
      const result = await onValidate(cleanCode);
      if (result.success) {
        setStatus('success');
        setAppliedCoupon({ code: cleanCode, ...result });
        onApply(result);
        triggerConfetti();
      } else {
        setStatus('error');
        setErrorMessage(result.message);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Error al validar.');
    }
  };

  return (
    <div className="w-full space-y-2 text-left">
      {status === 'success' && appliedCoupon ? (
        <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl animate-fade-in-up text-slate-100">
          <div>
            <p className="text-xs font-black text-emerald-400">🎟️ Cupón: {appliedCoupon.code}</p>
            <p className="text-[10px] text-slate-400">Descuento aplicado: -{appliedCoupon.value}%</p>
          </div>
          <button onClick={() => { setStatus('idle'); setCode(''); setAppliedCoupon(null); onRemove(); }} className="px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-bold text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer border-none">Eliminar</button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className={`flex items-center bg-[var(--color-bg)] border rounded-2xl p-1 gap-2 border-[var(--color-border)] focus-within:border-indigo-500/50 ${isShaking ? 'animate-shake' : ''}`}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CUPÓN DE PRUEBA (Ej: BIENVENIDO10)"
              className="bg-transparent outline-none text-xs text-slate-100 placeholder-slate-600 flex-1 pl-3 uppercase border-none focus:ring-0"
            />
            <button onClick={handleApply} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl cursor-pointer border-none">Aplicar</button>
          </div>
          {status === 'error' && <p className="text-[9px] text-red-400 font-semibold pl-2">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

export default function InteractiveCouponBadgeSandbox() {
  const [discount, setDiscount] = useState(0);

  const mockValidate = async (code) => {
    await new Promise(r => setTimeout(r, 600));
    if (code === 'BIENVENIDO10') return { success: true, value: 10, type: 'percent' };
    if (code === 'GLAMOUR20') return { success: true, value: 20, type: 'percent' };
    return { success: false, message: 'Cupón inválido, vencido o expirado' };
  };

  return (
    <SandboxLayout
      title="InteractiveCouponBadge"
      description="Campo de cupones con validación simulada. Escribe 'BIENVENIDO10' o 'GLAMOUR20' para activar el confeti."
      controls={[]}
    >
      <div className="space-y-4 w-full">
        <SandboxInteractiveCouponBadge
          onValidate={mockValidate}
          onApply={(res) => setDiscount(res.value)}
          onRemove={() => setDiscount(0)}
        />
        <div className="text-center font-mono text-[10px] text-slate-400">
          Descuento actual en caja: <span className="text-indigo-400 font-black">{discount}%</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
