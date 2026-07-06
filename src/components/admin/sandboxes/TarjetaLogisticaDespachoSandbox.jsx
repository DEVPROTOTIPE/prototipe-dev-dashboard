import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Truck, Phone, Navigation, Clock, ShieldCheck } from 'lucide-react';

function TarjetaLogisticaDespacho() {
  const { alertConfirm } = useAlertConfirm();
  const [state, setState] = useState('in_transit');

  const logistics = {
    operadorLogistico: 'Transportes Trans-Obra S.A.S.',
    chofer: 'Juan Carlos Patiño',
    contacto: '+57 312 456 7890',
    placa: 'TWH-890 (Cama Baja)',
    origen: 'Centro de Distribución Mosquera',
    destino: 'Obra Calle 100 #15-30, Bogotá',
    eta: '10:45 AM (Aprox)',
    maquina: 'Mini-Excavadora Bobcat E26'
  };

  const handleCall = () => {
    alertConfirm({
      title: 'Llamar a Chofer',
      message: 'Llamando a Juan Carlos Patiño al ' + logistics.contacto + '... (Simulación de redirección)',
      variant: 'info'
    });
  };

  const handleNotifyArrival = async () => {
    const confirm = await alertConfirm({
      title: 'Notificar Recepción',
      message: '¿Deseas registrar que la maquinaria ha llegado y se encuentra descargada en obra?',
      variant: 'warning'
    });

    if (confirm) {
      setState('delivered');
      alertConfirm({
        title: 'Despacho Completado',
        message: 'Se ha registrado la entrega satisfactoria del equipo.',
        variant: 'success'
      });
    }
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6 max-w-xl mx-auto shadow-xl">
        <div className="flex justify-between items-start border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)]">{logistics.maquina}</h3>
              <p className="text-[10px] text-[var(--color-text-muted)]">{logistics.operadorLogistico}</p>
            </div>
          </div>
          <span className={'text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase shrink-0 ' + (
            state === 'delivered'
              ? 'bg-emerald-500/10 text-emerald-400'
              : state === 'in_transit'
              ? 'bg-indigo-500/10 text-indigo-400 animate-pulse'
              : 'bg-amber-500/10 text-amber-400'
          )}>
            {state === 'delivered' ? 'Entregada en Obra' : state === 'in_transit' ? 'En Ruta (In Transit)' : 'Preparando Despacho'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--color-text)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Hora Estimada de Llegada (ETA)</span>
                <span className="font-bold">{state === 'delivered' ? 'Entregado' : logistics.eta}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Navigation className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Destino de Entrega</span>
                <span className="font-semibold">{logistics.destino}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl p-3.5">
            <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Datos de Transporte</span>
            <div className="flex flex-col gap-1 text-[10px]">
              <div>Chofer: <strong className="text-[var(--color-text)]">{logistics.chofer}</strong></div>
              <div>Vehículo/Placas: <strong className="text-[var(--color-text)]">{logistics.placa}</strong></div>
            </div>
            <button
              onClick={handleCall}
              className="mt-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg flex items-center justify-center gap-1.5 text-[10px]"
            >
              <Phone className="w-3.5 h-3.5" />
              Llamar Chofer
            </button>
          </div>
        </div>

        {state !== 'delivered' && (
          <button
            onClick={handleNotifyArrival}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4" />
            Confirmar Recepción y Descargue en Obra
          </button>
        )}
      </div>
    </>
  );
}

export default function TarjetaLogisticaDespachoSandbox() {
  return (
    <SandboxLayout
      title="Tarjeta de Logística de Despacho"
      description="Seguimiento en caliente y ficha logística de envío de maquinaria."
    >
      <TarjetaLogisticaDespacho />
    </SandboxLayout>
  );
}
