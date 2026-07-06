import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { ShieldCheck, User, Star, BadgeCheck } from 'lucide-react';

function TarjetasOperadoresAutorizados() {
  const { alertConfirm } = useAlertConfirm();
  const [selectedOp, setSelectedOp] = useState(null);

  const operadores = [
    {
      id: 'op1',
      nombre: 'Carlos Mendoza',
      categoria: 'Excavadoras y Bulldozers',
      licencia: 'Categoría C3 (Vigente)',
      experiencia: '12 años',
      tarifa: 150000,
      calificacion: 4.9,
      seguridad: 'Cero Accidentes Reportados'
    },
    {
      id: 'op2',
      nombre: 'Héctor Duarte',
      categoria: 'Grúas Telescópicas',
      licencia: 'Categoría C2 (Vigente)',
      experiencia: '8 años',
      tarifa: 180000,
      calificacion: 4.8,
      seguridad: 'Certificación OHSAS Activa'
    },
    {
      id: 'op3',
      nombre: 'Javier Restrepo',
      categoria: 'Minicargadores y Bobcats',
      licencia: 'Categoría C1 (Vigente)',
      experiencia: '5 años',
      tarifa: 120000,
      calificacion: 4.7,
      seguridad: 'Cero Incidentes'
    }
  ];

  const handleSelectOperator = async (op) => {
    const isSelected = selectedOp?.id === op.id;
    if (isSelected) {
      setSelectedOp(null);
      return;
    }

    const confirm = await alertConfirm({
      title: 'Seleccionar Operador',
      message: '¿Deseas contratar a ' + op.nombre + ' como operador para el servicio?',
      variant: 'warning'
    });

    if (confirm) {
      setSelectedOp(op);
      alertConfirm({
        title: 'Operador Asignado',
        message: op.nombre + ' ha sido añadido a tu orden de alquiler.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operadores.map((op) => {
            const isSelected = selectedOp?.id === op.id;
            return (
              <div
                key={op.id}
                onClick={() => handleSelectOperator(op)}
                className={'bg-[var(--color-surface)] border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 cursor-pointer hover:shadow-lg ' + (
                  isSelected
                    ? 'border-indigo-500 shadow-indigo-500/5 ring-1 ring-indigo-500'
                    : 'border-[var(--color-border)] hover:border-indigo-500/30'
                )}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {op.calificacion}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                      {op.nombre}
                      <BadgeCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    </h4>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5">{op.categoria}</p>
                  </div>

                  <div className="flex flex-col gap-1 text-[10px] text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2.5">
                    <div className="flex justify-between">
                      <span>Licencia:</span>
                      <span className="font-bold text-[var(--color-text)]">{op.licencia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experiencia:</span>
                      <span className="font-bold text-[var(--color-text)]">{op.experiencia}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded mt-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      {op.seguridad}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-[var(--color-border)]">
                  <div>
                    <span className="text-[9px] text-[var(--color-text-muted)] block">Tarifa por Día</span>
                    <span className="text-xs font-bold text-[var(--color-text)]">${op.tarifa.toLocaleString()} COP</span>
                  </div>
                  <span className={'text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ' + (
                    isSelected
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-[var(--color-surface-2)]/50 border-[var(--color-border)] text-indigo-400'
                  )}>
                    {isSelected ? 'Seleccionado' : 'Contratar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function TarjetasOperadoresAutorizadosSandbox() {
  return (
    <SandboxLayout
      title="Tarjetas de Operadores Autorizados"
      description="Visualización y selección de operadores certificados de maquinaria pesada."
    >
      <TarjetasOperadoresAutorizados />
    </SandboxLayout>
  );
}
