import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Home, Settings, Save, Trash, MoreHorizontal } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

// Inline implementation of BreadcrumbHeader to keep it completely self-contained and portable
export function BreadcrumbHeader({
  items = [],            // Array de { label: string, path?: string, onClick?: fn }
  onBack = null,         // Callback opcional de retroceso manual
  title = '',            // Título principal de la sección
  actions = null,        // Elementos JSX secundarios en la esquina derecha (botones)
  showHome = true,       // Si muestra el icono de Home inicial
  onHomeClick = () => {} // Callback para redirigir a Home
}) {
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 sm:px-6 space-y-2 shrink-0 text-left">
      {/* Fila Superior: Breadcrumbs */}
      <nav className="flex items-center text-[10px] font-bold tracking-wide uppercase text-[var(--color-text-muted)] overflow-x-auto whitespace-nowrap scrollbar-none">
        {/* Home */}
        {showHome && (
          <div className="flex items-center">
            <button
              onClick={onHomeClick}
              className="hover:text-[var(--color-text)] transition-colors cursor-pointer flex items-center gap-1"
              title="Inicio"
            >
              <Home size={11} className="text-indigo-400" />
            </button>
            {items.length > 0 && (
              <ChevronRight size={10} className="mx-2 opacity-40 shrink-0" />
            )}
          </div>
        )}

        {/* Migas de pan */}
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const shouldHideOnMobile = items.length > 3 && idx > 0 && idx < items.length - 2;

          return (
            <div
              key={idx}
              className={`items-center ${shouldHideOnMobile ? 'hidden sm:flex' : 'flex'}`}
            >
              {items.length > 3 && idx === 1 && (
                <div className="flex sm:hidden items-center">
                  <MoreHorizontal size={10} className="text-[var(--color-text-muted)] opacity-60" />
                  <ChevronRight size={10} className="mx-2 opacity-40 shrink-0" />
                </div>
              )}

              {isLast ? (
                <span className="text-[var(--color-text)] font-black truncate max-w-[120px] sm:max-w-[200px]">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="hover:text-[var(--color-text)] transition-colors cursor-pointer truncate max-w-[100px] sm:max-w-[150px]"
                >
                  {item.label}
                </button>
              )}

              {!isLast && (
                <ChevronRight size={10} className="mx-2 opacity-40 shrink-0" />
              )}
            </div>
          );
        })}
      </nav>

      {/* Fila Inferior: Título principal y Acciones */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Botón de Regreso */}
          <button
            onClick={handleBackClick}
            className="p-1.5 rounded-xl border border-[var(--color-border)] hover:border-indigo-500/35 hover:scale-105 active:scale-95 bg-[var(--color-surface-2)]/60 text-[var(--color-text)] transition-all cursor-pointer outline-none shrink-0 flex items-center justify-center"
            title="Volver"
          >
            <ArrowLeft size={14} strokeWidth={2.2} />
          </button>

          {/* Título */}
          {title && (
            <h2 className="text-xs sm:text-sm font-black text-[var(--color-text)] tracking-wide truncate">
              {title}
            </h2>
          )}
        </div>

        {/* Acciones Secundarias */}
        {actions && (
          <div className="flex items-center gap-1.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BreadcrumbHeaderSandbox() {
  const [title, setTitle] = useState('Detalle del Pedido #4891');
  const [showHome, setShowHome] = useState(true);
  const { showAlert } = useAlertConfirm();

  // Simulated breadcrumb items
  const items = [
    { label: 'E-commerce', onClick: () => handleSegmentClick('E-commerce') },
    { label: 'Pedidos', onClick: () => handleSegmentClick('Pedidos') },
    { label: 'Detalles' }
  ];

  const handleSegmentClick = (label) => {
    showAlert({
      title: 'Navegación Interactiva',
      message: `El usuario intentó navegar hacia la sección: "${label}"`,
      variant: 'success'
    });
  };

  const handleBack = () => {
    showAlert({
      title: 'Acción de Regreso',
      message: 'El botón de retorno contextual ha sido pulsado de manera exitosa.',
      variant: 'info'
    });
  };

  const handleSave = () => {
    showAlert({
      title: 'Guardado',
      message: 'Los datos del pedido simulado se han guardado.',
      variant: 'success'
    });
  };

  const handleDelete = () => {
    showAlert({
      title: 'Advertencia',
      message: '¿Está seguro de que desea eliminar este pedido simulado?',
      variant: 'warning'
    });
  };

  return (
    <SandboxLayout
      title="BreadcrumbHeader"
      description="Cabecera contextual adaptativa para navegación multinivel. Muestra la jerarquía de rutas del negocio y proporciona accesos rápidos de acción."
      controls={[
        { 
          label: 'Título en Cabecera', 
          type: 'text', 
          value: title, 
          onChange: setTitle 
        },
        { 
          label: 'Mostrar Home Inicial', 
          type: 'toggle', 
          value: showHome, 
          onChange: setShowHome 
        }
      ]}
    >
      <div className="w-full space-y-6 text-[var(--color-text)] font-sans">
        
        {/* Mock Application Outer Window */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          
          {/* Simulated App Top Bar Decorator */}
          <div className="px-4 py-2 bg-[var(--color-surface-2)]/60 border-b border-[var(--color-border)] flex items-center justify-between text-[9px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Simulación de Vista Administrativa
            </span>
            <span className="font-mono text-indigo-400">PROTOTIPE Engine</span>
          </div>

          {/* Component Instance */}
          <BreadcrumbHeader
            items={items}
            title={title}
            showHome={showHome}
            onHomeClick={() => handleSegmentClick('Inicio')}
            onBack={handleBack}
            actions={
              <>
                <button
                  onClick={handleSave}
                  className="px-2.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-500/25 active:scale-95 cursor-pointer"
                >
                  <Save size={11} />
                  <span>Guardar</span>
                </button>
                
                <button
                  onClick={handleDelete}
                  className="p-1.5 bg-[var(--color-surface)] hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 border border-[var(--color-border)] hover:border-red-500/20 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Eliminar"
                >
                  <Trash size={12} />
                </button>
              </>
            }
          />

          {/* Content Area Decorator */}
          <div className="p-8 bg-[var(--color-surface)] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto shadow-inner">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-[var(--color-text)] leading-none">Cuerpo del Contenedor Activo</p>
              <p className="text-[9px] text-[var(--color-text-muted)]">
                Las migas de pan superiores y el botón de regreso cambian reactivamente según sus props.
              </p>
            </div>
          </div>

        </div>

      </div>
    </SandboxLayout>
  );
}
