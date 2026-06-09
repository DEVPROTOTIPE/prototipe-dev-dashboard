import React, { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, User, Sparkles } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

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

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const getReservation = (hour) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return reservations.find(r => r.date === dateStr && r.hour === hour && r.professionalId === selectedProf);
  };

  const changeDay = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleCellClick = (hour, res) => {
    if (!res) {
      const client = prompt('Ingrese nombre del cliente para la cita:');
      if (client) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const newRes = {
          id: Date.now().toString(),
          professionalId: selectedProf,
          date: dateStr,
          hour,
          clientName: client
        };
        setReservations(prev => [...prev, newRes]);
      }
    } else {
      if (confirm(`¿Desea cancelar la cita de ${res.clientName} a las ${hour}?`)) {
        setReservations(prev => prev.filter(r => r.id !== res.id));
      }
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 max-w-md mx-auto text-slate-200">
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

      <div className="flex items-center justify-between bg-slate-900/60 p-2 border border-slate-800/80 rounded-xl">
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
    </div>
  );
}
