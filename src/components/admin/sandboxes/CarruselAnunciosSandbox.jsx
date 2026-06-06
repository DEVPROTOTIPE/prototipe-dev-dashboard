import React, { useState, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';

export default function CarruselAnunciosSandbox() {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [mode, setMode] = useState('gradient');

  const banners = [
    { title: '🔥 Sale de Temporada', desc: 'Hasta 40% de descuento en toda la tienda', color: 'from-indigo-600 to-violet-600' },
    { title: '🚚 Envío Gratis', desc: 'En pedidos mayores a $80.000', color: 'from-emerald-600 to-teal-600' },
    { title: '⭐ Nuevos Productos', desc: 'Descubre lo último de nuestra colección', color: 'from-amber-500 to-orange-600' },
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => setActive(a => (a + 1) % banners.length), 2000);
    return () => clearInterval(t);
  }, [autoPlay, banners.length]);

  const b = banners[active];

  return (
    <SandboxLayout
      title="Carrusel de Anuncios Promocionales"
      description="Hero banner con auto-rotación, glow pulsante, 3 modos de fondo y navegación por dots y flechas."
      controls={[
        { label: 'Auto-play', type: 'toggle', value: autoPlay, onChange: setAutoPlay, labels: ['Off', 'On'] },
        { label: 'Modo', type: 'select', value: mode, options: ['gradient', 'dark', 'light'], onChange: setMode },
      ]}
    >
      <div className="w-full space-y-3 text-left">
        {/* Banner */}
        <div className={`relative rounded-2xl overflow-hidden h-28 flex items-center px-5 transition-all duration-500 ${
          mode === 'gradient' ? `bg-gradient-to-r ${b.color}` :
          mode === 'dark' ? 'bg-slate-900 border border-slate-800' :
          'bg-white border border-slate-200'
        }`}>
          <div className="relative z-10">
            <p className={`text-sm font-black ${mode === 'light' ? 'text-slate-900' : 'text-white'}`}>{b.title}</p>
            <p className={`text-[10px] mt-0.5 ${mode === 'light' ? 'text-slate-600' : 'text-white/75'}`}>{b.desc}</p>
            <button className={`mt-2 px-3 py-1 text-[10px] font-black rounded-xl cursor-pointer transition-all border-none ${
              mode === 'light' ? 'bg-indigo-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}>Ver más</button>
          </div>
          {/* Decoración */}
          {mode === 'gradient' && <div className="absolute right-5 text-5xl opacity-30 select-none">🛍️</div>}
        </div>
        {/* Navegación */}
        <div className="flex items-center justify-between">
          <button onClick={() => setActive(a => (a - 1 + banners.length) % banners.length)}
            className="p-1.5 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-surface-2)]/80 text-xs border-none flex items-center justify-center">‹</button>
          <div className="flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`rounded-full cursor-pointer transition-all border-none ${active === i ? 'w-5 h-2 bg-indigo-500' : 'w-2 h-2 bg-[var(--color-border)] hover:bg-indigo-400/50'}`} />
            ))}
          </div>
          <button onClick={() => setActive(a => (a + 1) % banners.length)}
            className="p-1.5 bg-[var(--color-surface-2)] rounded-lg text-[var(--color-text-muted)] cursor-pointer hover:bg-[var(--color-surface-2)]/80 text-xs border-none flex items-center justify-center">›</button>
        </div>
      </div>
    </SandboxLayout>
  );
}
