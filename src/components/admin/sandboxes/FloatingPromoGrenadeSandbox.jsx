import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import FloatingPromoGrenade from '../../common/FloatingPromoGrenade';

export default function FloatingPromoGrenadeSandbox() {
  const [promotions, setPromotions] = useState([
    { id: 1, title: '20% en tu primera compra', code: 'BOOM20' },
    { id: 2, title: 'Envío Gratis Hoy', code: 'FLASHFREE' },
    { id: 3, title: 'Cupón VIP de Bienvenida', code: 'VIPWELCOME' }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');

  const handleAddPromo = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    setPromotions([
      ...promotions,
      {
        id: Date.now(),
        title: newTitle.trim(),
        code: newCode.trim().toUpperCase()
      }
    ]);
    setNewTitle('');
    setNewCode('');
  };

  const handleRemovePromo = (id) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  return (
    <SandboxLayout
      title="Granada Promocional Flotante (FloatingPromoGrenade)"
      description="Simula ofertas explosivas interactivas en tu tienda con efectos de ignición y explosión de confeti en tiempo real."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Controles de Configuración */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)]">
          <h4 className="font-bold text-[var(--color-text)] mb-4 text-sm uppercase tracking-wider">
            Configuración de Cupones Dinámicos
          </h4>
          
          <form onSubmit={handleAddPromo} className="flex flex-col gap-3 mb-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Título de la Promoción
              </label>
              <input
                type="text"
                placeholder="Ej. 15% Descuento Especial"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                  Código del Cupón
                </label>
                <input
                  type="text"
                  placeholder="Ej. PROMO15"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg active:scale-95 transition-transform"
                >
                  Agregar Cupón
                </button>
              </div>
            </div>
          </form>

          {/* Lista de cupones actuales */}
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
              Cupones en la Granada ({promotions.length})
            </label>
            <div className="max-h-[180px] overflow-y-auto scrollbar-thin pr-1 flex flex-col gap-2">
              {promotions.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-semibold text-[var(--color-text)] truncate">{p.title}</p>
                    <p className="text-[10px] text-[var(--color-primary)] font-bold">{p.code}</p>
                  </div>
                  <button
                    onClick={() => handleRemovePromo(p.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 active:scale-95"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zona de Demostración/Simulación */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] relative overflow-hidden min-h-[300px]">
          <div>
            <h4 className="font-bold text-[var(--color-text)] mb-2 text-sm uppercase tracking-wider">
              Instrucciones de Simulación
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Haz clic en el icono de la granada flotante 💣 en la esquina inferior derecha de la pantalla de demostración para detonar la explosión interactiva y revelar los cupones configurados.
            </p>
          </div>

          <div className="flex items-center justify-center flex-1">
            <span className="text-xs text-[var(--color-text-muted)] italic">
              (El disparador está anclado en la parte inferior derecha)
            </span>
          </div>

          {/* Instancia del componente */}
          <FloatingPromoGrenade promotions={promotions} />
        </div>
      </div>
    </SandboxLayout>
  );
}
