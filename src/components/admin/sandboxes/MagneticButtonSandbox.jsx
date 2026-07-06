import React, { useState, useEffect, useRef } from 'react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

function SandboxMagneticButton({
  children,
  onClick,
  className = '',
  range = 80,
  attraction = 0.35,
  innerAttraction = 0.18,
  variant = 'primary'
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [innerPosition, setInnerPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const distanceX = e.clientX - btnCenterX;
      const distanceY = e.clientY - btnCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < range) {
        setIsHovered(true);
        const targetX = distanceX * attraction;
        const targetY = distanceY * attraction;
        const innerTargetX = distanceX * innerAttraction;
        const innerTargetY = distanceY * innerAttraction;

        setPosition({ x: targetX, y: targetY });
        setInnerPosition({ x: innerTargetX, y: innerTargetY });
      } else {
        if (isHovered) {
          handleMouseLeave();
        }
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setPosition({ x: 0, y: 0 });
      setInnerPosition({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [range, attraction, innerAttraction, isHovered]);

  const variantClasses = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-indigo-500/20 border-transparent',
    secondary: 'bg-[var(--color-surface-2)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-border)]',
    outline: 'bg-transparent text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
  }[variant] || 'bg-[var(--color-primary)] text-white';

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
      className={`relative inline-flex items-center justify-center px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest cursor-pointer select-none active:scale-95 will-change-transform ${variantClasses} ${className}`}
    >
      <span
        className="relative block pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${innerPosition.x}px, ${innerPosition.y}px, 0)`,
          transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {children}
      </span>
    </button>
  );
}

export default function MagneticButtonSandbox() {
  const { showAlert } = useAlertConfirm();
  const [range, setRange] = useState(80);
  const [attraction, setAttraction] = useState(0.35);
  const [innerAttraction, setInnerAttraction] = useState(0.18);
  const [variant, setVariant] = useState('primary');

  return (
    <SandboxLayout
      title="Botón Magnético Reactivo"
      description="Botón premium de conversión que se magnetiza y atrae suavemente hacia el cursor del ratón."
      controls={[
        { label: 'Radio de atracción', type: 'number', value: range, onChange: v => setRange(Number(v)) },
        { label: 'Atracción exterior', type: 'number', value: attraction, min: 0.1, max: 0.9, step: 0.05, onChange: v => setAttraction(Number(v)) },
        { label: 'Atracción interna', type: 'number', value: innerAttraction, min: 0.05, max: 0.5, step: 0.02, onChange: v => setInnerAttraction(Number(v)) },
        { label: 'Variante', type: 'select', value: variant, options: ['primary', 'secondary', 'outline'], onChange: setVariant },
      ]}
    >
      <div className="flex items-center justify-center p-16 w-full h-full min-h-[160px]">
        <SandboxMagneticButton
          range={range}
          attraction={attraction}
          innerAttraction={innerAttraction}
          variant={variant}
          onClick={() => showAlert({ title: 'Éxito', message: '¡Botón magnético activado!', variant: 'success' })}
        >
          Púlsame
        </SandboxMagneticButton>
      </div>
    </SandboxLayout>
  );
}
