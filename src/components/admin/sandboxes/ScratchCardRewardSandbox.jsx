import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import ScratchCardReward from '../../common/ScratchCardReward';
import CustomSelect from '../../ui/CustomSelect';

export default function ScratchCardRewardSandbox() {
  const [rewardType, setRewardType] = useState('gift');
  const [rewardContent, setRewardContent] = useState('¡Copa de Vino Gratis!');
  const [subtitle, setSubtitle] = useState('Código: GOURMETWINE');
  const [revealLog, setRevealLog] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const rewardTypeOptions = [
    { value: 'gift', label: 'Regalo con Icono (gift)' },
    { value: 'number', label: 'Texto/Número Gigante (number)' },
    { value: 'image', label: 'Imagen de Producto (image)' }
  ];

  const handleReveal = () => {
    setRevealLog(`[Reveal Event] ¡Premio revelado con éxito a las ${new Date().toLocaleTimeString()}!`);
  };

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setRevealLog('');
  };

  const handleTypeChange = (value) => {
    setRewardType(value);
    if (value === 'gift') {
      setRewardContent('¡Copa de Vino Gratis!');
      setSubtitle('Código: GOURMETWINE');
    } else if (value === 'number') {
      setRewardContent('40% OFF');
      setSubtitle('Válido por compras > $50k');
    } else {
      // URL de imagen mock de postre/comida gourmet
      setRewardContent('https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=350&auto=format&fit=crop');
      setSubtitle('Postre de la Casa');
    }
  };

  return (
    <SandboxLayout
      title="ScratchCardReward Sandbox"
      description="Playground interactivo para simular el componente de tarjeta de rasca y gana con físicas destructivas sobre Canvas HTML5, moneda de seguimiento táctil y desbloqueo al 50% de raspado."
      controls={
        <div className="space-y-4">
          
          {/* Selector de Tipo de Premio */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
              Tipo de Premio
            </label>
            <CustomSelect
              options={rewardTypeOptions}
              value={rewardType}
              onChange={handleTypeChange}
            />
          </div>

          {/* Input de Contenido */}
          {rewardType !== 'image' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Contenido del Premio
              </label>
              <input
                type="text"
                value={rewardContent}
                onChange={(e) => setRewardContent(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/30"
              />
            </div>
          )}

          {/* Input de Subtítulo */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
              Subtítulo / Restricción
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/30"
            />
          </div>

          {/* Botón de Reinicio */}
          <button
            onClick={handleReset}
            className="w-full h-10 px-4 mt-2 text-xs font-bold text-white rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 active:scale-95 cursor-pointer shadow-soft-md transition-all"
          >
            Reiniciar Tarjeta
          </button>
        </div>
      }
    >
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* Renderizado de la tarjeta */}
        <div className="flex items-center justify-center p-4 bg-[var(--color-surface)] rounded-[24px] border border-[var(--color-border)] shadow-sm min-h-[250px]">
          <ScratchCardReward
            key={resetKey}
            rewardType={rewardType}
            rewardContent={rewardContent}
            subtitle={subtitle}
            onReveal={handleReveal}
          />
        </div>

        {/* Log de Revelación */}
        {revealLog && (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-3)] border border-[var(--color-border)] space-y-1 animate-fade-in">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">
              Evento Disparado (onReveal)
            </span>
            <p className="text-xs font-semibold text-[var(--color-text)]">
              {revealLog}
            </p>
          </div>
        )}

      </div>
    </SandboxLayout>
  );
}
