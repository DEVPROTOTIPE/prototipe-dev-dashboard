import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, User, Sparkles } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import { useAlertConfirm } from '../../common/AlertConfirmContext';

export default function ReservasAgendaCitasSandbox() {
  const professionals = [
    { id: '1', name: 'Dr. Alejandro Soto (Médico/Mecánico)' },
    { id: '2', name: 'Laura Restrepo (Estilista/Tornero)' }
  ];

  const [selectedProf, setSelectedProf] = useState(professionals[0].id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([
    { id: '1', professionalId: '1', date: new Date().toISOString().split('T')[0], hour: '09:00', clientName: 'Sergio Restrepo' },
    { id: '2', professionalId: '2', date: new Date().toISOString().split('T')[0], hour: '11:00', clientName: 'María Fernanda' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [inputClient, setInputClient] = useState('');
  const [selectedHour, setSelectedHour] = useState('');

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  const confirm = useAlertConfirm();

  const getReservation = (hour) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return reservations.find(r => r.date === dateStr && r.hour === hour && r.professionalId === selectedProf);
  };

  const changeDay = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleCellClick = async (hour, res) => {
    if (!res) {
      setSelectedHour(hour);
      setShowModal(true);
    } else {
      const confirmed = await confirm({
        title: '¿Cancelar Cita?',
        message: `¿Desea cancelar la cita de ${res.clientName} a las ${hour}?`,
        variant: 'error',
        confirmText: 'Cancelar Cita',
        cancelText: 'Volver'
      });
      if (confirmed) {
        setReservations(prev => prev.filter(r => r.id !== res.id));
      }
    }
  };

  const confirmAddCita = () => {
    if (!inputClient.trim()) return;
    const dateStr = currentDate.toISOString().split('T')[0];
    const newRes = {
      id: Date.now().toString(),
      professionalId: selectedProf,
      date: dateStr,
      hour: selectedHour,
      clientName: inputClient.trim()
    };
    setReservations(prev => [...prev, newRes]);
    setShowModal(false);
    setInputClient('');
  };

  return (
    <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 space-y-4 max-w-md mx-auto text-slate-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block">Agenda de Servicios</span>
          <span className="text-[9px] text-slate-500 block">Presiona horas libres para agendar o cita para cancelar.</span>
        </div>
        <div className="w-56">
          <CustomSelect
            value={selectedProf}
            onChange={setSelectedProf}
            options={professionals.map(p => ({ value: p.id, label: p.name }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-[var(--color-surface)]/60 p-2 border border-[var(--color-border)]/80 rounded-xl">
        <button onClick={() => changeDay(-1)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Calendar size={12} className="text-indigo-400" />
          {currentDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
        <button onClick={() => changeDay(1)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer">
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
        {hours.map(hour => {
          const res = getReservation(hour);
          return (
            <div
              key={hour}
              className={`flex items-center justify-between p-2.5 border rounded-xl transition-all ${
                res
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  : 'bg-indigo-600/5 hover:bg-indigo-600/15 border-indigo-500/15 hover:border-indigo-500/30 text-indigo-300 cursor-pointer'
              }`}
              onClick={() => handleCellClick(hour, res)}
            >
              <div className="flex items-center gap-2">
                <Clock size={11} className={res ? 'text-rose-400' : 'text-indigo-400'} />
                <span className="font-mono text-xs font-bold">{hour}</span>
              </div>

              <div className="text-right">
                {res ? (
                  <span className="text-[9px] font-bold bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/10 flex items-center gap-1">
                    <User size={9} /> {res.clientName}
                  </span>
                ) : (
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300">
                    Reservar Cita +
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Modal for Adding Client */}
      {showModal && (
        <div className="absolute inset-0 bg-[var(--color-bg)]/90 backdrop-blur-xs flex items-center justify-center p-4 z-50 rounded-2xl">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 w-full max-w-[280px] space-y-3 shadow-2xl">
            <h4 className="text-xs font-black text-slate-200">Nueva Cita a las {selectedHour}</h4>
            <div className="space-y-1">
              <label className="text-[9px] text-[var(--color-text-muted)] font-bold block">Nombre del Cliente *</label>
              <input
                type="text"
                value={inputClient}
                onChange={e => setInputClient(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] placeholder-[var(--color-text-muted)]/50"
                autoFocus
              />
            </div>
            <div className="flex gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setInputClient('');
                }}
                className="flex-1 py-1.5 rounded-lg bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] font-bold cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={confirmAddCita}
                disabled={!inputClient.trim()}
                className="flex-1 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-[10px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
