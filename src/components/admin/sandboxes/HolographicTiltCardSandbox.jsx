import React, { useState, useRef } from 'react';
import { SandboxLayout } from './SandboxLayout';

function HolographicTiltCard({
  children,
  maxTilt = 15,
  perspective = 1000,
  scale = 1.02,
  className = ''
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    const rotateX = (-yPct * maxTilt).toFixed(2);
    const rotateY = (xPct * maxTilt).toFixed(2);

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'none'
    });

    const glareX = (mouseX / width * 100).toFixed(2);
    const glareY = (mouseY / height * 100).toFixed(2);

    setGlareStyle({
      opacity: 0.25,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 80%)`,
      mixBlendMode: 'screen',
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
    setGlareStyle({
      opacity: 0,
      transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl transition-shadow shadow-md hover:shadow-indigo-500/10 cursor-pointer ${className}`}
    >
      <div 
        className="absolute inset-0 pointer-events-none z-10" 
        style={glareStyle} 
      />
      <div className="relative z-2">
        {children}
      </div>
    </div>
  );
}

export default function HolographicTiltCardSandbox() {
  const [maxTilt, setMaxTilt] = useState(15);
  const [perspective, setPerspective] = useState(1000);
  const [scale, setScale] = useState(1.05);

  return (
    <SandboxLayout
      title="Tarjeta 3D Holográfica"
      description="Efecto de inclinación 3D realista basado en coordenadas del ratón con capa reflectante de brillo."
      controls={[
        { label: 'Inclinación máx', type: 'number', value: maxTilt, onChange: v => setMaxTilt(Number(v)) },
        { label: 'Perspectiva', type: 'number', value: perspective, onChange: v => setPerspective(Number(v)) },
        { label: 'Escala hover', type: 'text', value: String(scale), onChange: v => setScale(Number(v)) },
      ]}
    >
      <div className="flex justify-center items-center py-4">
        <HolographicTiltCard
          maxTilt={maxTilt}
          perspective={perspective}
          scale={scale}
          className="w-56 h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border-slate-750 flex flex-col justify-between p-4 text-white"
        >
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black tracking-widest text-indigo-400">PROTOTIPE PREMIUM</span>
              <span className="text-xs">💳</span>
            </div>
            <p className="text-[8px] font-mono text-slate-400 mt-1">NÚMERO DE SOCIO</p>
            <p className="text-[10px] font-mono font-bold tracking-wider text-slate-200">**** **** **** 2026</p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[7px] text-slate-500 font-mono">SOCIO</p>
              <p className="text-[9px] font-black text-slate-150">SERGIO AGUDELO</p>
            </div>
            <span className="text-[10px] font-black text-indigo-400">GOLD VIP</span>
          </div>
        </HolographicTiltCard>
      </div>
    </SandboxLayout>
  );
}
