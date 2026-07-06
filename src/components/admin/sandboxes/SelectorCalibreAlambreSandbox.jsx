import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import SelectorCalibreAlambre from '../../common/SelectorCalibreAlambre';
import { Info, CheckCircle2 } from 'lucide-react';

export default function SelectorCalibreAlambreSandbox() {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [lastSelection, setLastSelection] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleConfirm = (data) => {
    setLastSelection(data);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const controls = [
    {
      id: 'currencySymbol',
      label: 'Símbolo de Moneda',
      type: 'select',
      value: currencySymbol,
      onChange: setCurrencySymbol,
      options: ['$', 'USD', '€']
    }
  ];

  return (
    <SandboxLayout
      title="Selector de Calibre y Alambre Rural"
      description="Playground interactivo para configurar calibres de alambre de púas o galvanizado, longitudes de cercas y cálculo de peso."
      controls={controls}
    >
      <div className="space-y-6">
        <SelectorCalibreAlambre
          currencySymbol={currencySymbol}
          onConfirm={handleConfirm}
        />

        {/* Info panel of playground */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] max-w-4xl mx-auto">
          <h4 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-violet-500" />
            Guía de Pruebas en Sandbox
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Modifica las opciones en el panel superior y observa cómo varían dinámicamente el <strong>peso en kg</strong> y la <strong>resistencia en kgf</strong>. Haz clic en "Confirmar Selección Técnica" para simular el envío de datos de configuración al backend o flujo de cotizaciones.
          </p>
        </div>

        {/* Selection feedback toast */}
        {showToast && lastSelection && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-4 rounded-2xl shadow-xl flex items-start gap-3 border border-emerald-500/20 max-w-sm animate-bounce-short z-50">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold">¡Selección Confirmada!</p>
              <div className="text-xs text-white/90 mt-1 space-y-0.5 font-mono">
                <p>• Tipo: {lastSelection.tipo}</p>
                <p>• Calibre: {lastSelection.calibreLabel}</p>
                <p>• Longitud: {lastSelection.longitud} m</p>
                <p>• Peso: {lastSelection.pesoEstimadoKg} kg</p>
                <p>• Resistencia: {lastSelection.resistencia}</p>
                <p>• Total: {currencySymbol} {lastSelection.precioTotal.toLocaleString('es-CO')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
