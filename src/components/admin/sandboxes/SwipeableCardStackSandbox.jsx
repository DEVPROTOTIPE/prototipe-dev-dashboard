import React, { useState, useRef } from 'react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

function SandboxSwipeableCardStack({
  items = [],
  onSwipe = () => {},
  onEmpty = () => {},
  className = '',
  threshold = 120
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const topCardRef = useRef(null);

  const activeItem = items[currentIndex];

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    if (topCardRef.current) {
      topCardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (topCardRef.current) {
      topCardRef.current.releasePointerCapture(e.pointerId);
    }

    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      swipeCard(direction);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const swipeCard = (direction) => {
    const exitX = direction === 'right' ? 600 : -600;
    setDragOffset({ x: exitX, y: dragOffset.y });

    setTimeout(() => {
      onSwipe(direction, activeItem);
      setDragOffset({ x: 0, y: 0 });
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex >= items.length) {
        onEmpty();
      }
    }, 200);
  };

  if (currentIndex >= items.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--color-border)] rounded-3xl h-52 text-center w-full">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Mazo Vacío</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full max-w-sm h-64 select-none touch-none ${className}`}>
      {currentIndex + 2 < items.length && (
        <div className="absolute inset-x-4 bottom-0 h-52 rounded-3xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] opacity-40 scale-90 translate-y-8 z-0 transition-all duration-300" />
      )}

      {currentIndex + 1 < items.length && (
        <div 
          style={{
            transform: isDragging 
              ? `scale(${0.95 + Math.min(Math.abs(dragOffset.x), threshold) / threshold * 0.05}) translate3d(0, ${16 - Math.min(Math.abs(dragOffset.x), threshold) / threshold * 16}px, 0)` 
              : 'scale(0.95) translate3d(0, 16px, 0)'
          }}
          className="absolute inset-x-2 bottom-0 h-52 rounded-3xl bg-[var(--color-surface-2)] border border-[var(--color-border)] opacity-85 z-10 transition-transform duration-300 pointer-events-none"
        />
      )}

      <div
        ref={topCardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.08}deg)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        className="absolute inset-x-0 top-0 h-52 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-20 cursor-grab active:cursor-grabbing overflow-hidden p-6 flex flex-col justify-between"
      >
        <div className="pointer-events-none h-full flex flex-col justify-between">
          {activeItem.render ? activeItem.render() : activeItem.content}
        </div>
      </div>
    </div>
  );
}

export default function SwipeableCardStackSandbox() {
  const { showAlert } = useAlertConfirm();
  const [threshold, setThreshold] = useState(120);
  const [empty, setEmpty] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const mockCards = [
    {
      id: '1',
      render: () => (
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">Cupones</span>
            <h4 className="text-sm font-black text-[var(--color-text)] mt-3">Cupón de Bienvenida</h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">Obtén 10% de descuento en tu primera compra en la tienda.</p>
          </div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2.5">Desliza para descartar</div>
        </div>
      )
    },
    {
      id: '2',
      render: () => (
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">Destacado</span>
            <h4 className="text-sm font-black text-[var(--color-text)] mt-3">Zapatillas Sport Pro</h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">Diseñadas para máximo confort y amortiguación elástica.</p>
          </div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2.5">Desliza para descartar</div>
        </div>
      )
    },
    {
      id: '3',
      render: () => (
        <div className="flex flex-col justify-between h-full w-full">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">Evento</span>
            <h4 className="text-sm font-black text-[var(--color-text)] mt-3">Envío Gratis</h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">Solo por el fin de semana en todas las categorías de calzado.</p>
          </div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2.5">Desliza para descartar</div>
        </div>
      )
    }
  ];

  return (
    <SandboxLayout
      title="Mazo de Tarjetas Deslizables"
      description="Mazo apilado interactivo que responde a gestos táctiles y de ratón para descartes elásticos."
      controls={[
        { label: 'Umbral descarte (px)', type: 'number', value: threshold, onChange: v => setThreshold(Number(v)) },
      ]}
    >
      <div className="flex flex-col items-center justify-center p-8 w-full h-full min-h-[280px]">
        {empty ? (
          <button
            onClick={() => {
              setEmpty(false);
              setResetKey(prev => prev + 1);
            }}
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
          >
            Reiniciar Mazo
          </button>
        ) : (
          <SandboxSwipeableCardStack
            key={resetKey}
            items={mockCards}
            threshold={threshold}
            onSwipe={(dir, item) => showAlert({ title: 'Descarte', message: `Tarjeta descartada hacia la ${dir === 'right' ? 'derecha' : 'izquierda'}`, variant: 'info' })}
            onEmpty={() => setEmpty(true)}
          />
        )}
      </div>
    </SandboxLayout>
  );
}
