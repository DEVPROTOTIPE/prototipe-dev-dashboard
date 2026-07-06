import React, { useState, useEffect, useRef } from 'react';
import { Mail, User, ShoppingCart, Bell } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

const HelpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function RadialInteractiveMenu({
  position = 'bottom-right',
  radius = 90,
  angleRange = 90,
  startAngle = 180,
  items = [],
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }[position] || 'bottom-6 right-6';

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[var(--color-bg)]/30 backdrop-blur-[2px] z-[990] transition-opacity duration-300"
        />
      )}
      <div 
        ref={menuRef} 
        className={`fixed z-[995] w-12 h-12 ${positionClasses} ${className}`}
      >
        {items.map((item, idx) => {
          const angleStep = items.length > 1 ? angleRange / (items.length - 1) : 0;
          const itemAngle = startAngle + (idx * angleStep);
          const angleInRadians = (itemAngle * Math.PI) / 180;
          const x = isOpen ? radius * Math.cos(angleInRadians) : 0;
          const y = isOpen ? radius * Math.sin(angleInRadians) : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isOpen ? 1 : 0})`,
                transitionDelay: `${isOpen ? idx * 45 : 0}ms`,
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className={`absolute w-9 h-9 left-1.5 top-1.5 flex items-center justify-center rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] hover:text-indigo-400 hover:border-indigo-500/40 shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group z-[991] ${item.className || ''}`}
              title={item.label}
            >
              {item.icon || <HelpIcon />}
              <span className="absolute scale-0 group-hover:scale-100 transition-all duration-200 bg-[var(--color-surface)] border border-[var(--color-border)] text-[8px] font-black uppercase text-slate-100 rounded-lg px-2 py-1 -top-8 whitespace-nowrap shadow z-20 pointer-events-none">
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={toggleMenu}
          className={`absolute inset-0 flex items-center justify-center rounded-2xl shadow-xl hover:shadow-indigo-500/25 border border-[var(--color-border)] cursor-pointer text-white font-bold transition-all duration-300 hover:scale-105 active:scale-95 z-[992] ${
            isOpen
              ? 'bg-red-500 hover:bg-red-400 border-red-500/30 rotate-45'
              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/30 rotate-0'
          }`}
        >
          {isOpen ? (
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}

export default function RadialInteractiveMenuSandbox() {
  const { showAlert } = useAlertConfirm();
  const [position, setPosition] = useState('bottom-right');
  const [radius, setRadius] = useState(90);
  const [angleRange, setAngleRange] = useState(90);
  const [startAngle, setStartAngle] = useState(180);

  const menuItems = [
    { id: '1', label: 'Mensajes', icon: <Mail size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Mensajes abiertos', variant: 'info' }) },
    { id: '2', label: 'Perfil', icon: <User size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Perfil abierto', variant: 'info' }) },
    { id: '3', label: 'Carrito', icon: <ShoppingCart size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Carrito abierto', variant: 'info' }) },
    { id: '4', label: 'Notificaciones', icon: <Bell size={16} />, onClick: () => showAlert({ title: 'Acción', message: 'Notificaciones abiertas', variant: 'info' }) },
  ];

  return (
    <SandboxLayout
      title="Menú Radial Interactivo"
      description="Menú circular animado que se expande radialmente en abanico con retrasos coordinados."
      controls={[
        { label: 'Posición', type: 'select', value: position, options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'], onChange: setPosition },
        { label: 'Radio (px)', type: 'number', value: radius, onChange: v => setRadius(Number(v)) },
        { label: 'Ángulo abanico', type: 'number', value: angleRange, onChange: v => setAngleRange(Number(v)) },
        { label: 'Ángulo inicio', type: 'number', value: startAngle, onChange: v => setStartAngle(Number(v)) },
      ]}
    >
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[160px] w-full">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center max-w-[200px]">
          Haz clic en el botón flotante en la esquina {position === 'bottom-right' ? 'inferior derecha' : position === 'bottom-left' ? 'inferior izquierda' : position === 'top-right' ? 'superior derecha' : 'superior izquierda'} de este sandbox.
        </p>
        <RadialInteractiveMenu
          position={position}
          radius={radius}
          angleRange={angleRange}
          startAngle={startAngle}
          items={menuItems}
          className="!absolute"
        />
      </div>
    </SandboxLayout>
  );
}
