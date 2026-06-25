import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { Package, Truck, ClipboardList, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';

const STEPS = [
  { status: 'recibido', label: 'Recibido', icon: ClipboardList, desc: 'El pedido fue ingresado y está en cola de aprobación.' },
  { status: 'preparacion', label: 'Alistamiento', icon: Package, desc: 'Nuestros operarios empacan y validan stock de los artículos.' },
  { status: 'despachado', label: 'En Ruta', icon: Truck, desc: 'El mensajero ha tomado el pedido y va camino a tu ubicación.' },
  { status: 'entregado', label: 'Entregado', icon: CheckCircle2, desc: 'El artículo ha sido entregado a conformidad.' }
];

export default function OrderTrackingSandbox() {
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [isCancelled, setIsCancelled] = useState(false);

  const activeStep = STEPS[currentStepIndex];

  return (
    <SandboxLayout
      title="Seguimiento de Pedido Público (OrderTracking)"
      description="Simula el estado dinámico y responsivo de un pedido activo en el portal público de cara al cliente. Admite cancelaciones, hitos operativos y visualización de progreso."
    >
      <div className="space-y-6 max-w-lg mx-auto bg-surface border border-app rounded-3xl p-6 shadow-xl">
        {/* Cabecera del pedido */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-app pb-4 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[var(--color-text)]">Pedido #PT-9041</span>
              {isCancelled ? (
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-wider">Cancelado</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-wider">{activeStep.label}</span>
              )}
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono">Token UUID: e3b0c442-98fc-11ed-a8fc-0242ac120002</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { if (currentStepIndex > 0) { setCurrentStepIndex(currentStepIndex - 1); setIsCancelled(false); } }}
              disabled={currentStepIndex === 0 || isCancelled}
              className="p-1.5 rounded-lg bg-surface-2 border border-app hover:bg-surface-3 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => { if (currentStepIndex < STEPS.length - 1) { setCurrentStepIndex(currentStepIndex + 1); setIsCancelled(false); } }}
              disabled={currentStepIndex === STEPS.length - 1 || isCancelled}
              className="p-1.5 rounded-lg bg-surface-2 border border-app hover:bg-surface-3 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setIsCancelled(!isCancelled)}
              className={`px-2.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                isCancelled
                  ? 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400'
                  : 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {isCancelled ? 'Re-activar' : 'Cancelar'}
            </button>
          </div>
        </div>

        {/* Stepper visual */}
        {!isCancelled ? (
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Barra de progreso */}
            <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-[var(--color-border)] -z-10 rounded-full">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;

              return (
                <div key={step.status} className="flex flex-col items-center text-center space-y-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCompleted
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md scale-105'
                        : 'bg-surface-2 border-[var(--color-border)] text-slate-500'
                    } ${isActive ? 'ring-2 ring-indigo-500/30' : ''}`}
                  >
                    <StepIcon size={14} />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider ${
                      isCompleted ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-400">
            <AlertTriangle size={20} className="shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold uppercase tracking-wider">Pedido Cancelado</p>
              <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                Este pedido ha sido cancelado. Si tienes dudas, ponte en contacto con soporte técnico.
              </p>
            </div>
          </div>
        )}

        {/* Detalle descriptivo */}
        {!isCancelled && (
          <div className="p-4 bg-surface-2 border border-app rounded-2xl space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Estado Actual</p>
            <p className="text-xs font-bold text-[var(--color-text)]">{activeStep.label}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
              {activeStep.desc}
            </p>
          </div>
        )}

        {/* Resumen del Cliente mock */}
        <div className="grid grid-cols-2 gap-4 border-t border-app pt-4 text-[10px]">
          <div className="space-y-1">
            <p className="font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Destinatario</p>
            <p className="text-[var(--color-text)] font-semibold">Sergio González</p>
            <p className="text-[var(--color-text-muted)]">Calle 45 # 12-34, Bogotá</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Pedido</p>
            <p className="text-sm font-black text-indigo-400">$ 289.000 COP</p>
            <p className="text-[9px] text-[var(--color-text-muted)]">Pago: Contra-entrega</p>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
