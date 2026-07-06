import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Calendar, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import DatePickerPremium from '../../ui/DatePickerPremium';

const PAQUETE_DEFAULT = {
  nombre: 'Tratamiento Integral de Quiropodia',
  sesionesTotales: 5,
  especialista: 'Dra. Gómez',
  sesiones: [
    { num: 1, fecha: '2026-07-05', hora: '09:00', estado: 'agendada' },
    { num: 2, fecha: '2026-07-12', hora: '10:00', estado: 'agendada' },
    { num: 3, fecha: '', hora: '', estado: 'pendiente' },
    { num: 4, fecha: '', hora: '', estado: 'pendiente' },
    { num: 5, fecha: '', hora: '', estado: 'pendiente' }
  ]
};

const HORAS_DISPONIBLES = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

function ProgramadorSesionesPaqueteComponent({ onSave }) {
  const { alertConfirm } = useAlertConfirm();
  const [paquete, setPaquete] = useState(PAQUETE_DEFAULT);
  const [sesionIndexEdicion, setSesionIndexEdicion] = useState(null);
  const [tempFecha, setTempFecha] = useState(new Date());
  const [tempHora, setTempHora] = useState('09:00');

  const handleEditSesion = (idx) => {
    setSesionIndexEdicion(idx);
    const sesion = paquete.sesiones[idx];
    if (sesion.fecha) {
      setTempFecha(new Date(sesion.fecha));
      setTempHora(sesion.hora);
    } else {
      setTempFecha(new Date());
      setTempHora('09:00');
    }
  };

  const handleConfirmDate = (e) => {
    e.preventDefault();
    if (sesionIndexEdicion === null) return;

    const formattedDate = tempFecha.toISOString().slice(0, 10);

    const updatedSesiones = paquete.sesiones.map((s, idx) => {
      if (idx === sesionIndexEdicion) {
        return {
          ...s,
          fecha: formattedDate,
          hora: tempHora,
          estado: 'agendada'
        };
      }
      return s;
    });

    setPaquete(prev => ({ ...prev, sesiones: updatedSesiones }));
    setSesionIndexEdicion(null);

    if (onSave) onSave(updatedSesiones);
  };

  const handleCancelSesion = async (idx) => {
    const confirm = await alertConfirm({
      title: '¿Cancelar Cita del Paquete?',
      message: '¿Está seguro de que desea liberar este horario reservado en el calendario?',
      variant: 'warning'
    });

    if (confirm) {
      const updatedSesiones = paquete.sesiones.map((s, i) => {
        if (i === idx) {
          return { ...s, fecha: '', hora: '', estado: 'pendiente' };
        }
        return s;
      });
      setPaquete(prev => ({ ...prev, sesiones: updatedSesiones }));
    }
  };

  const sesionesAgendadas = paquete.sesiones.filter(s => s.estado === 'agendada').length;
  const porcentajeProgreso = (sesionesAgendadas / paquete.sesionesTotales) * 100;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Resumen del Paquete */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Plan de Tratamiento</span>
          <h3 className="text-xs font-black text-[var(--color-text)] mt-0.5">{paquete.nombre}</h3>
          <p className="text-[9px] text-[var(--color-text-muted)]">Especialista: {paquete.especialista}</p>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-44 text-right">
          <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-muted)]">
            <span>Progreso</span>
            <span>{sesionesAgendadas} de {paquete.sesionesTotales} agendadas</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid de Sesiones y Cronograma */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Timeline Listado de Citas */}
        <div className="lg:col-span-7 flex flex-col gap-3 py-1 px-1">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Cronograma de Sesiones</span>
          <div className="relative pl-6 flex flex-col gap-3">
            
            {/* Línea de progreso - position absolute behind circles */}
            <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-[var(--color-border)] z-[-10]" />

            {paquete.sesiones.map((ses, idx) => {
              const isAgendada = ses.estado === 'agendada';
              return (
                <div key={idx} className="relative flex items-center justify-between gap-3 animate-fadeIn">
                  
                  {/* Círculo indicador - z-10 over the line with solid bg */}
                  <div className={`absolute -left-[23px] w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all duration-200 z-10 bg-[var(--color-surface)] ${
                    isAgendada 
                      ? 'border-emerald-500 text-emerald-500' 
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className={`flex-1 p-2.5 rounded-xl border flex justify-between items-center transition-all ${
                    isAgendada
                      ? 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30'
                      : 'border-dashed border-[var(--color-border)] bg-transparent'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-[var(--color-text)]">Sesión #{ses.num}</span>
                      {isAgendada ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{ses.fecha}</span>
                          <Clock className="w-3.5 h-3.5 ml-1" />
                          <span>{ses.hora}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                          Cita pendiente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isAgendada ? (
                        <button
                          type="button"
                          onClick={() => handleCancelSesion(idx)}
                          className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditSesion(idx)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--color-primary)] !text-white text-[10px] font-bold shadow-sm hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer"
                        >
                          Agendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Agendamiento Activo (DatePicker) */}
        <div className="lg:col-span-5">
          {sesionIndexEdicion !== null ? (
            <div className="p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] flex flex-col gap-3">
              <div>
                <h4 className="text-xs font-black text-[var(--color-text)] uppercase">Agendar Sesión #{sesionIndexEdicion + 1}</h4>
                <p className="text-[10px] text-[var(--color-text-muted)]">Selecciona fecha y hora</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden scale-90 origin-top">
                  <DatePickerPremium
                    selectedDate={tempFecha}
                    onChange={setTempFecha}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase">Hora</label>
                <div className="grid grid-cols-4 gap-1">
                  {HORAS_DISPONIBLES.map(hr => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setTempHora(hr)}
                      className={`py-1 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                        tempHora === hr
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {hr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSesionIndexEdicion(null)}
                  className="flex-1 py-1.5 text-[10px] font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDate}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-500 !text-white text-[10px] font-black uppercase shadow-md hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Agendar
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/50 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[200px]">
              <div className="w-9 h-9 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center text-[var(--color-text-muted)]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">Listo para Agendar</p>
                <p className="text-[9px] text-[var(--color-text-muted)] mt-1 max-w-[170px]">
                  Haz clic en "Agendar" en el cronograma lateral para abrir el calendario.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function ProgramadorSesionesPaqueteSandbox() {
  return (
    <SandboxLayout
      title="Programador de Sesiones en Paquete"
      description="Herramienta para calendarizar en lote citas recurrentes usando DatePickerPremium y barra de progreso"
    >
      <ProgramadorSesionesPaqueteComponent />
    </SandboxLayout>
  );
}
