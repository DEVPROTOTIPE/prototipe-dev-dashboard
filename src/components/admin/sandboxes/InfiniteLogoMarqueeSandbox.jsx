import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

function InfiniteLogoMarquee({
  items = [],
  speed = 'fast',
  pauseOnHover = true,
  className = ''
}) {
  const speedDuration = {
    slow: '40s',
    medium: '25s',
    fast: '15s',
  }[speed] || '25s';
  const doubleItems = [...items, ...items, ...items];
  return (
    <div className={`relative w-full overflow-hidden py-4 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: customMarquee var(--marquee-speed) linear infinite;
        }
        .marquee-container:hover .animate-marquee-infinite {
          animation-play-state: var(--marquee-hover-state, running);
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
          {doubleItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-shrink-0 group relative flex items-center justify-center p-5 min-w-[120px] h-16 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.alt || item.name} 
                  className="max-w-[80px] max-h-[32px] object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none filter grayscale group-hover:grayscale-0"
                />
              ) : (
                <span className="text-xs font-mono font-black text-[var(--color-text-muted)] group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InfiniteLogoMarqueeSandbox() {
  const [speed, setSpeed] = useState('fast');
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const mockItems = [
    { id: '1', name: 'Nike' },
    { id: '2', name: 'Adidas' },
    { id: '3', name: 'Puma' },
    { id: '4', name: 'Reebok' },
    { id: '5', name: 'Under Armour' },
    { id: '6', name: 'Fila' },
  ];

  return (
    <SandboxLayout
      title="Marquesina de Logos"
      description="Marquesina de logos infinita con animación fluida en CSS, configurable en velocidad y pausa al hover."
      controls={[
        { label: 'Velocidad', type: 'select', value: speed, options: ['slow', 'medium', 'fast'], onChange: setSpeed },
        { label: 'Pausa hover', type: 'toggle', value: pauseOnHover, onChange: setPauseOnHover, labels: ['No', 'Sí'] },
      ]}
    >
      <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2">
        <InfiniteLogoMarquee
          items={mockItems}
          speed={speed}
          pauseOnHover={pauseOnHover}
        />
      </div>
    </SandboxLayout>
  );
}
