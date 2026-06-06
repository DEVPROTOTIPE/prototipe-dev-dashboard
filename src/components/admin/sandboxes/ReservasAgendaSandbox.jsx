import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { SandboxLayout } from './SandboxLayout';

export default function ReservasAgendaSandbox() {
  const { showAlert } = useAlertConfirm();
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState('45');
  const [occupiedRate, setOccupiedRate] = useState('40');

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState({});
  const [clientName, setClientName] = useState('');
  const [clientService, setClientService] = useState('Corte de Cabello 💈');
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const daysList = useMemo(() => {
    const list = [];
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        dateString: d.toISOString().split('T')[0],
        dayName: days[d.getDay()],
        dayNumber: d.getDate().toString().padStart(2, '0'),
        monthName: months[d.getMonth()],
        fullDate: d
      });
    }
    return list;
  }, []);

  useEffect(() => {
    if (daysList.length > 0 && !selectedDate) {
      setSelectedDate(daysList[0].dateString);
    }
  }, [daysList, selectedDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    const [sh, sm] = startHour.split(':').map(Number);
    const [eh, em] = endHour.split(':').map(Number);
    const duration = Number(slotDuration);

    let current = new Date();
    current.setHours(sh, sm, 0, 0);

    const end = new Date();
    end.setHours(eh, em, 0, 0);

    while (current < end) {
      const timeString = current.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  }, [startHour, endHour, slotDuration]);

  const getOccupiedForDate = (dateStr) => {
    if (occupiedSlots[dateStr]) return occupiedSlots[dateStr];
    const rate = Number(occupiedRate) / 100;
    const occupied = timeSlots.filter(() => Math.random() < rate);
    setOccupiedSlots(prev => ({
      ...prev,
      [dateStr]: occupied
    }));
    return occupied;
  };

  const currentOccupied = selectedDate ? getOccupiedForDate(selectedDate) : [];

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot) {
      alert("Por favor selecciona una fecha y hora");
      return;
    }
    if (!clientName) {
      alert("Por favor ingresa tu nombre");
      return;
    }
    
    showAlert({
      title: '¡Reserva Confirmada!',
      message: `Cita reservada para ${clientName} el día ${selectedDate} a las ${selectedSlot} para: ${clientService}`,
      variant: 'success'
    });

    setOccupiedSlots(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), selectedSlot]
    }));
    
    setSelectedSlot(null);
    setClientName('');
  };

  return (
    <SandboxLayout
      title="Agenda & Reservador de Citas Premium"
      description="Selector de fechas y horas interactivo en formato agenda para citas y servicios técnicos (barberías, mantenimiento, spa). Soporta visualización de slots ocupados/libres."
      controls={[
        { label: 'Apertura', type: 'text', value: startHour, onChange: setStartHour },
        { label: 'Cierre', type: 'text', value: endHour, onChange: setEndHour },
        { label: 'Duración (min)', type: 'select', value: slotDuration, options: ['15', '30', '45', '60'], onChange: setSlotDuration },
        { label: 'Ocupación (%)', type: 'text', value: occupiedRate, onChange: setOccupiedRate },
      ]}
    >
      <div className="w-full space-y-4 text-[var(--color-text)]">
        <div>
          <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Selecciona un día:</span>
          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            {daysList.map((day) => {
              const isActive = selectedDate === day.dateString;
              return (
                <button
                  key={day.dateString}
                  onClick={() => {
                    setSelectedDate(day.dateString);
                    setSelectedSlot(null);
                  }}
                  className={`flex flex-col items-center justify-center min-w-[54px] p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-indigo-500/30 hover:text-[var(--color-text)]'
                  }`}
                >
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${isActive ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>{day.dayName}</span>
                  <span className={`text-sm font-black mt-1 ${isActive ? 'text-white' : 'text-[var(--color-text)]'}`}>{day.dayNumber}</span>
                  <span className={`text-[8px] mt-0.5 font-mono ${isActive ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>{day.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Horas disponibles:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {timeSlots.map((slot) => {
              const isOccupied = currentOccupied.includes(slot);
              const isSelected = selectedSlot === slot;
              
              let btnClass = "";
              if (isOccupied) {
                btnClass = "bg-[var(--color-surface-2)] border-[var(--color-border)]/40 text-[var(--color-text-muted)] opacity-35 cursor-not-allowed line-through";
              } else if (isSelected) {
                btnClass = "bg-purple-600/15 border-purple-500 text-purple-600 dark:text-purple-300 font-black scale-105 shadow-md shadow-purple-500/5";
              } else {
                btnClass = "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:border-indigo-500/30 hover:scale-[1.02] cursor-pointer";
              }

              return (
                <button
                  key={slot}
                  disabled={isOccupied}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-2 py-2.5 text-[10px] text-center font-bold rounded-xl border transition-all duration-200 ${btnClass}`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {selectedSlot && (
          <div className="p-3 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-2xl space-y-3 animate-fade-in">
            <div>
              <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Resumen de Cita:</span>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase">
                📅 {selectedDate} a las ⏰ {selectedSlot}
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tu Nombre"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 transition placeholder-[var(--color-text-muted)]/50"
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] flex items-center justify-between transition cursor-pointer hover:border-indigo-500/50"
                >
                  <span>{clientService}</span>
                  <ChevronDown size={14} className={`text-[var(--color-text-muted)] transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isSelectOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSelectOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-[var(--color-border)]/50"
                      >
                        {[
                          "Corte de Cabello 💈",
                          "Mantenimiento de Barba 🪒",
                          "Servicio Técnico Premium 🛠️",
                          "Lavado & Peinado 🧼"
                        ].map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => {
                              setClientService(service);
                              setIsSelectOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-xs text-left transition-colors flex items-center justify-between hover:bg-[var(--color-surface-2)] cursor-pointer ${
                              clientService === service ? 'text-indigo-400 font-bold bg-indigo-500/5' : 'text-[var(--color-text)]'
                            }`}
                          >
                            <span>{service}</span>
                            {clientService === service && <span className="text-indigo-400 font-bold">✓</span>}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold uppercase rounded-xl tracking-wider transition-all duration-300 shadow-lg shadow-indigo-500/15 cursor-pointer text-center text-white"
            >
              Confirmar Reserva
            </button>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
