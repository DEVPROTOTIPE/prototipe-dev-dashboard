import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Table, CheckCircle2 } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function TablaDespieceMateriales() {
  const { alertConfirm } = useAlertConfirm();
  const [tipoMueble, setTipoMueble] = useState('closet');

  const despieces = {
    closet: [
      { id: 1, name: 'Lateral Izquierdo', w: 2200, h: 600, qty: 1, material: 'MDF Roble 18mm', cantos: 'Largo 2, Ancho 1' },
      { id: 2, name: 'Lateral Derecho', w: 2200, h: 600, qty: 1, material: 'MDF Roble 18mm', cantos: 'Largo 2, Ancho 1' },
      { id: 3, name: 'Techo / Piso', w: 1200, h: 600, qty: 2, material: 'MDF Roble 18mm', cantos: 'Largo 1, Ancho 2' },
      { id: 4, name: 'Repisas Ajustables', w: 1164, h: 580, qty: 4, material: 'MDF Roble 15mm', cantos: 'Largo 1' }
    ],
    cocina_bajo: [
      { id: 1, name: 'Costado Gabinete', w: 720, h: 580, qty: 2, material: 'Melamina Blanca 15mm', cantos: 'Largo 1, Ancho 1' },
      { id: 2, name: 'Base Inferior', w: 800, h: 580, qty: 1, material: 'Melamina Blanca 15mm', cantos: 'Largo 1' },
      { id: 3, name: 'Amarres Superiores', w: 768, h: 100, qty: 2, material: 'Melamina Blanca 15mm', cantos: 'Ninguno' }
    ]
  };

  const activeRows = despieces[tipoMueble] || despieces.closet;

  const handleExport = () => {
    alertConfirm({
      title: 'Despiece Exportado',
      message: 'El listado de cortes en formato CSV ha sido descargado para la sierra.',
      variant: 'success'
    });
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-2xl mx-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)]">Lista de Piezas de Corte</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5">Desglose paramétrico por pieza individual</p>
            </div>
          </div>
          <div className="w-48 shrink-0">
            <CustomSelect
              value={tipoMueble}
              onChange={setTipoMueble}
              options={[
                { value: 'closet', label: 'Módulo de Closet Estándar' },
                { value: 'cocina_bajo', label: 'Módulo Cocina Bajo 80cm' }
              ]}
            />
          </div>
        </div>

        {/* Tabla despiece */}
        <div className="overflow-x-auto py-2">
          <table className="w-full text-left text-xs text-[var(--color-text)] border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-bold">
                <th className="pb-2.5">Pieza / Nombre</th>
                <th className="pb-2.5 text-right">Largo (mm)</th>
                <th className="pb-2.5 text-right">Ancho (mm)</th>
                <th className="pb-2.5 text-center">Cant.</th>
                <th className="pb-2.5">Material</th>
                <th className="pb-2.5">Tapacantos PVC</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)]/30 transition-colors">
                  <td className="py-3 font-semibold">{row.name}</td>
                  <td className="py-3 text-right font-bold text-indigo-400">{row.w}</td>
                  <td className="py-3 text-right font-bold text-indigo-400">{row.h}</td>
                  <td className="py-3 text-center font-extrabold">{row.qty}</td>
                  <td className="py-3 text-[10px] text-[var(--color-text-muted)]">{row.material}</td>
                  <td className="py-3 text-[10px] text-amber-400 font-semibold">{row.cantos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleExport}
          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          Exportar Lista a la Seccionadora (CSV)
        </button>
      </div>
    </>
  );
}

export default function TablaDespieceMaterialesSandbox() {
  return (
    <SandboxLayout
      title="Tabla de Despiece de Materiales"
      description="Listado de cortes de piezas y tapacantos para producción en taller."
    >
      <TablaDespieceMateriales />
    </SandboxLayout>
  );
}
