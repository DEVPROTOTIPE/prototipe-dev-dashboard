import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Receipt, Search, Info } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

function SandboxEmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction,
  illustration: Illustration
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className="mb-6 relative flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/5 text-indigo-400"
      >
        {Illustration ? (
          <Illustration />
        ) : Icon ? (
          <Icon size={40} className="stroke-[1.5]" />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </motion.div>

      <h3 className="text-xs font-black text-[var(--color-text)] mb-1.5 uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-[11px] text-[var(--color-text-muted)] mb-6 leading-relaxed max-w-[280px]">
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          {actionLabel}
        </motion.button>
      )}
    </div>
  );
}

export default function EmptyStateSandbox() {
  const { showAlert } = useAlertConfirm();
  const [title, setTitle] = useState('No hay productos');
  const [description, setDescription] = useState('Tu catálogo está vacío por ahora. Registra un nuevo producto para comenzar.');
  const [iconName, setIconName] = useState('Package');
  const [actionLabel, setActionLabel] = useState('Crear Producto');
  const [hasAction, setHasAction] = useState(true);

  const icons = {
    Package: Package,
    ShoppingBag: ShoppingBag,
    Receipt: Receipt,
    Search: Search,
    Info: Info
  };

  const SelectedIcon = icons[iconName] || Package;

  return (
    <SandboxLayout
      title="Empty State Premium Interactivo"
      description="Pantalla de estado vacío premium con animaciones elásticas y botón de llamada a la acción."
      controls={[
        { label: 'Título', type: 'text', value: title, onChange: setTitle },
        { label: 'Descripción', type: 'text', value: description, onChange: setDescription },
        { label: 'Icono', type: 'select', value: iconName, options: Object.keys(icons), onChange: setIconName },
        { label: 'Con Acción', type: 'toggle', value: hasAction, onChange: setHasAction, labels: ['No', 'Sí'] },
        { label: 'Texto Acción', type: 'text', value: actionLabel, onChange: setActionLabel },
      ]}
    >
      <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4">
        <SandboxEmptyState
          title={title}
          description={description}
          icon={SelectedIcon}
          actionLabel={hasAction ? actionLabel : null}
          onAction={hasAction ? () => showAlert({ title: 'Acción', message: `¡Botón "${actionLabel}" pulsado!`, variant: 'success' }) : null}
        />
      </div>
    </SandboxLayout>
  );
}
