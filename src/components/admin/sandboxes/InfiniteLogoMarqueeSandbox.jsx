import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

function InfiniteLogoMarquee({
  items = [],
  speed = 'fast',
  pauseOnHover = true,
  className = ''
}) {
  const [activeClickId, setActiveClickId] = useState(null);

  const speedDuration = {
    slow: '40s',
    medium: '25s',
    fast: '15s',
  }[speed] || '25s';

  const doubleItems = [...items, ...items, ...items];

  const handleItemClick = (id) => {
    setActiveClickId(id);
    setTimeout(() => {
      setActiveClickId(null);
    }, 300);
  };

  return (
    <div className={`relative w-full overflow-hidden py-4 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes clickPop {
          0% { transform: scale(1); }
          30% { transform: scale(0.85); }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: customMarquee var(--marquee-speed) linear infinite;
        }
        .marquee-container:hover .animate-marquee-infinite {
          animation-play-state: var(--marquee-hover-state, running);
        }
        .animate-click-pop {
          animation: clickPop 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}} />

      <div 
        className="marquee-container w-full"
        style={{
          '--marquee-speed': speedDuration,
          '--marquee-hover-state': pauseOnHover ? 'paused' : 'running'
        }}
      >
        <div className="animate-marquee-infinite gap-6 flex items-center">
          {doubleItems.map((item, idx) => {
            const uniqueId = `${item.id}-${idx}`;
            const isClicked = activeClickId === uniqueId;

            return (
              <div
                key={uniqueId}
                onClick={() => handleItemClick(uniqueId)}
                className={`flex-shrink-0 group relative flex items-center justify-center px-6 py-4 w-44 h-20 rounded-[24px] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 cursor-pointer overflow-hidden select-none ${
                  isClicked ? 'animate-click-pop border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)] z-20' : ''
                }`}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.alt || item.name}
                    className="max-w-[110px] max-h-[40px] object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0 dark:brightness-0 dark:invert select-none pointer-events-none"
                  />
                ) : (
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)] group-hover:text-indigo-400 transition-colors truncate">
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function InfiniteLogoMarqueeSandbox() {
  const [speed, setSpeed] = useState('fast');
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const mockItems = [
    { id: '1', name: 'Nike', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nike.svg' },
    { id: '2', name: 'Adidas', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/adidas.svg' },
    { id: '3', name: 'Puma', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/puma.svg' },
    { id: '4', name: 'Reebok', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/reebok.svg' },
    { id: '5', name: 'Under Armour', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/underarmour.svg' },
    { id: '6', name: 'Fila', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/fila.svg' },
  ];

  return (
    <SandboxLayout
      title="Marquesina de Logos"
      description="Marquesina de logos infinita con animación fluida en CSS, configurable en velocidad y pausa al hover. Soporta logos grandes y micro-interacciones táctiles."
      controls={[
        { label: 'Velocidad', type: 'select', value: speed, options: ['slow', 'medium', 'fast'], onChange: setSpeed },
        { label: 'Pausa hover', type: 'toggle', value: pauseOnHover, onChange: setPauseOnHover, labels: ['No', 'Sí'] },
      ]}
    >
      <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
        <InfiniteLogoMarquee
          items={mockItems}
          speed={speed}
          pauseOnHover={pauseOnHover}
        />
      </div>
    </SandboxLayout>
  );
}
