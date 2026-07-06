import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente real inline para el Sandbox
function SelectorEmpaqueRegalo({
  options,
  defaultChecked = false,
  onGiftChange
}) {
  const [isGift, setIsGift] = useState(defaultChecked);
  const [selectedPack, setSelectedPack] = useState(options[0]?.id || 'bag');
  const [message, setMessage] = useState('');
  const maxChars = 150;

  const activePack = options.find(p => p.id === selectedPack) || options[0];

  React.useEffect(() => {
    if (onGiftChange) {
      onGiftChange({
        isGift,
        packId: isGift ? selectedPack : null,
        price: isGift ? activePack.price : 0,
        message: isGift ? message : ''
      });
    }
  }, [isGift, selectedPack, message, activePack, onGiftChange]);

  return (
    <div 
      id="selector-empaque-regalo-container"
      className="w-full max-w-sm p-5 rounded-2xl bg-[var(--color-surface)]/20 border border-[var(--color-border)] text-[var(--color-text)] shadow-xl backdrop-blur-xl animate-fade-in"
    >
      <label 
        className="flex items-center gap-3.5 p-1 cursor-pointer select-none"
        id="gift-toggle-label"
      >
        <input
          id="gift-checkbox"
          type="checkbox"
          checked={isGift}
          onChange={(e) => setIsGift(e.target.checked)}
          className="w-4.5 h-4.5 rounded border-[var(--color-border)] bg-[var(--color-surface-2)] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-[var(--color-bg)] cursor-pointer"
        />
        <div className="flex-1">
          <span className="text-xs font-bold text-[var(--color-text)] block">¿Es un regalo?</span>
          <span className="text-[10px] text-[var(--color-text-muted)] block">Añade empaque especial y dedicatoria</span>
        </div>
        <div className="text-indigo-500 dark:text-indigo-400 font-bold text-xs shrink-0 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Gifts
        </div>
      </label>

      {isGift && (
        <div className="mt-4 space-y-4 border-t border-[var(--color-border)]/45 pt-3 animate-fade-in" id="gift-config-panel">
          
          {/* Empaques */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">1. Selecciona el empaque</span>
            <div className="grid grid-cols-3 gap-2" id="packaging-options-grid">
              {options.map(p => {
                const isSelected = selectedPack === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPack(p.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5'
                        : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] hover:border-indigo-500/50'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[var(--color-text)] block truncate">{p.name}</span>
                      <span className="text-[8px] text-[var(--color-text-muted)] block mt-1 leading-normal line-clamp-2">{p.description}</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 block mt-2.5">+ ${p.price.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mensaje */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-black tracking-wider text-[var(--color-text-muted)]">
              <span>2. Mensaje de Dedicatoria</span>
              <span className={message.length >= maxChars ? 'text-rose-500 font-bold animate-pulse' : 'text-[var(--color-text-muted)]'}>
                {message.length}/{maxChars}
              </span>
            </div>
            <textarea
              id="gift-message-textarea"
              maxLength={maxChars}
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/35 transition-all resize-none"
            />
          </div>

          {/* Postal Preview */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)] block">Vista previa de tarjeta postal</span>
            <div 
              id="postal-card-preview"
              className="w-full aspect-[1.8/1] bg-[floralwhite] rounded-xl p-3.5 text-slate-800 border border-amber-900/10 shadow-inner flex flex-col justify-between relative overflow-hidden select-none font-serif"
            >
              <div className="absolute top-2 right-2 opacity-10">
                <svg className="w-10 h-10 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>

              <div className="border-b border-amber-900/10 pb-0.5">
                <span className="text-[8px] uppercase tracking-wider font-bold text-amber-900/40 block">Para alguien especial</span>
              </div>

              <div className="flex-1 flex items-center justify-center py-1">
                <p className="text-[11px] text-amber-950 text-center italic leading-relaxed break-words max-w-[90%] font-serif">
                  {message || 'Escribe tu dedicatoria arriba...'}
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-amber-900/10 pt-1 text-[8px] text-amber-900/40 uppercase tracking-widest font-bold font-serif">
                <span>Con cariño</span>
                <span>Empaque: {activePack.name}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

const PACKAGING_DEFAULT = [
  { id: 'bag', name: 'Bolsa Kraft', price: 3000, description: 'Papel kraft reciclado con cinta de yute' },
  { id: 'box', name: 'Caja Premium', price: 8000, description: 'Caja rígida negra con cinta de raso' },
  { id: 'special', name: 'Envoltura Lujo', price: 5000, description: 'Papel satinado con lazo decorativo' }
];

export default function SelectorEmpaqueRegaloSandbox() {
  const [giftData, setGiftData] = useState(null);

  const controls = [
    {
      label: 'Mostrar total estimado en consola',
      type: 'toggle',
      value: true,
      onChange: () => {}
    }
  ];

  return (
    <SandboxLayout
      title="Empaque de Regalo y Dedicatoria"
      description="Simulador del selector de envolturas físicas y redactor de mensajes con previsualización postal."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-80">
        <SelectorEmpaqueRegalo
          options={PACKAGING_DEFAULT}
          onGiftChange={setGiftData}
        />
        {giftData?.isGift && (
          <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 text-[var(--color-text)] text-xs rounded-xl w-full flex justify-between">
            <span className="font-semibold">Servicio Regalo:</span>
            <span className="font-black text-indigo-500 dark:text-indigo-400">
              +{giftData.price.toLocaleString()} COP
            </span>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
