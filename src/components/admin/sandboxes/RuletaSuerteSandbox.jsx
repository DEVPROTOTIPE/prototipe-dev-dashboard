import React, { useState, useMemo } from 'react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

export default function RuletaSuerteSandbox() {
  const { showAlert } = useAlertConfirm();
  const [prizesText, setPrizesText] = useState('10% OFF, Bebida Gratis, Postre Gratis, Café Gratis, Reintenta, Descuento $5k');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prizeResult, setPrizeResult] = useState(null);
  const [couponCode, setCouponCode] = useState('');

  const slices = useMemo(() => {
    const colors = [
      'var(--color-primary, #6366f1)',
      'var(--color-accent, #3b82f6)',
      '#10b981',
      '#f59e0b',
      '#ec4899',
      '#8b5cf6',
      '#64748b'
    ];
    return prizesText.split(',').map((p, i) => ({
      label: p.trim(),
      color: colors[i % colors.length]
    })).filter(p => p.label.length > 0);
  }, [prizesText]);

  const spin = () => {
    if (isSpinning || slices.length === 0) return;
    setIsSpinning(true);
    setPrizeResult(null);
    setCouponCode('');

    const winningIndex = Math.floor(Math.random() * slices.length);
    const angle = 360 / slices.length;
    const spins = 6;
    
    const targetRotation = (spins * 360) - (winningIndex * angle) - 90;
    const relativeRotation = targetRotation + (Math.ceil(rotation / 360) * 360);
    setRotation(relativeRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const win = slices[winningIndex];
      setPrizeResult(win.label);
      
      if (!win.label.toLowerCase().includes('reintenta') && !win.label.toLowerCase().includes('intenta')) {
        const code = `PROMO-${win.label.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        setCouponCode(code);
        import('canvas-confetti').then(module => {
          module.default({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        });
      }
    }, 5000);
  };

  const angle = 360 / slices.length;
  const rad = (angle * Math.PI) / 180;
  const x1 = 100 + 84 * Math.cos(-rad / 2);
  const y1 = 100 + 84 * Math.sin(-rad / 2);
  const x2 = 100 + 84 * Math.cos(rad / 2);
  const y2 = 100 + 84 * Math.sin(rad / 2);
  const pathD = `M 100 100 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 84 84 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

  return (
    <SandboxLayout
      title="Ruleta de la Fortuna (Fidelización)"
      description="Ruleta de premios de marca blanca para restaurantes y comercios. Fideliza clientes otorgando cupones de descuento interactivos con física de inercia."
      controls={[
        { label: 'Premios (CSV)', type: 'text', value: prizesText, onChange: setPrizesText },
      ]}
    >
      <div className="flex flex-col items-center gap-6 py-4 select-none">
        <style>{`
          @keyframes bulbGlow {
            0%, 100% { fill: #fef08a; filter: drop-shadow(0 0 2px #d97706); opacity: 0.6; }
            50% { fill: #fbbf24; filter: drop-shadow(0 0 8px #f59e0b); opacity: 1; }
          }
          .bulb-glow {
            animation: bulbGlow 0.9s infinite alternate;
          }
        `}</style>

        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute -top-3.5 z-30 flex flex-col items-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            <svg width="28" height="36" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldPointer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
              </defs>
              <path d="M12 32L22 12C24 8 22 0 12 0C2 0 0 8 2 12L12 32Z" fill="url(#goldPointer)" />
              <path d="M12 28L19 13C20.2 10.5 19 3 12 3C5 3 3.8 10.5 5 13L12 28Z" fill="#f43f5e" />
              <circle cx="12" cy="10" r="3.5" fill="#ffffff" opacity="0.9" />
            </svg>
          </div>

          <div className="absolute inset-2 bg-gradient-to-tr from-amber-500/10 to-indigo-500/15 rounded-full blur-2xl z-0" />

          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5000ms cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none'
            }}
            className="w-full h-full rounded-full overflow-hidden z-10 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="30%" stopColor="#eab308" />
                  <stop offset="50%" stopColor="#ca8a04" />
                  <stop offset="70%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                <radialGradient id="wheelCenter" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#030712" />
                </radialGradient>
                <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodOpacity="0.8" />
                </filter>
              </defs>

              {slices.map((slice, i) => (
                <g key={i} transform={`rotate(${i * angle}, 100, 100)`}>
                  <path d={pathD} fill={slice.color} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />
                  <text
                    x="176"
                    y="100"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize="5"
                    fontWeight="900"
                    filter="url(#shadowFilter)"
                    className="uppercase tracking-wider fill-white font-sans select-none"
                  >
                    {slice.label}
                  </text>
                </g>
              ))}

              <circle cx="100" cy="100" r="95" fill="none" stroke="url(#goldMetallic)" strokeWidth="5" />
              <circle cx="100" cy="100" r="91.5" fill="none" stroke="url(#goldMetallic)" strokeWidth="1" opacity="0.4" />

              {Array.from({ length: 24 }).map((_, idx) => {
                const bulbAngle = (360 / 24) * idx;
                const radBulb = (bulbAngle * Math.PI) / 180;
                const cx = 100 + 91.5 * Math.cos(radBulb);
                const cy = 100 + 91.5 * Math.sin(radBulb);
                const delay = (idx % 4) * 220;
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="1.8"
                    className="bulb-glow"
                    style={{
                      animationDelay: `${delay}ms`
                    }}
                  />
                );
              })}

              <circle cx="100" cy="100" r="84" fill="none" stroke="url(#goldMetallic)" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="28" fill="url(#wheelCenter)" stroke="url(#goldMetallic)" strokeWidth="2.5" className="drop-shadow-md" />
            </svg>
          </div>

          <button
            onClick={spin}
            disabled={isSpinning}
            className={`absolute z-30 w-14 h-14 rounded-full flex flex-col items-center justify-center text-[10px] font-black uppercase shadow-[0_6px_20px_rgba(217,119,6,0.3)] transition-all duration-300 cursor-pointer ${
              isSpinning
                ? 'bg-slate-900 text-slate-500 border-slate-800'
                : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 text-white hover:scale-105 active:scale-95 hover:shadow-[0_6px_24px_rgba(217,119,6,0.5)] border border-white/20'
            }`}
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              letterSpacing: '0.05em'
            }}
          >
            <span className="relative z-10">{isSpinning ? 'GIRO...' : 'GIRAR'}</span>
          </button>
        </div>

        {prizeResult && (
          <div className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-3 text-center space-y-2 animate-fade-in shadow-xl max-w-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">¡Felicidades, ganaste!</span>
            <p className="text-sm font-black text-amber-400 uppercase">{prizeResult}</p>
            {couponCode && (
              <div className="flex flex-col items-center gap-1.5 pt-1 border-t border-white/5">
                <span className="text-[8px] text-slate-500 font-mono">CÓDIGO DE CUPÓN:</span>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-mono font-bold text-amber-400 select-all cursor-pointer">
                  {couponCode}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
