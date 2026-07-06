import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Star, Clock, Check, Search, ShieldCheck } from 'lucide-react';

const STAFF_DATA = [
  {
    id: 'staff-1',
    nombre: 'Dra. Liliana Gómez',
    especialidad: 'Podología Clínica',
    calificacion: 4.9,
    experiencia: '8 años',
    horario: 'Mañana',
    fotoColor: 'from-teal-400 to-emerald-500',
    disponibleHoy: true,
    servicios: ['Quiropodia', 'Uña encarnada', 'Pie diabético']
  },
  {
    id: 'staff-2',
    nombre: 'Sr. Andrés Mendoza',
    especialidad: 'Masoterapia y Spa',
    calificacion: 4.8,
    experiencia: '5 años',
    horario: 'Tarde',
    fotoColor: 'from-purple-400 to-indigo-500',
    disponibleHoy: true,
    servicios: ['Masaje relajante', 'Piedras calientes', 'Exfoliación']
  },
  {
    id: 'staff-3',
    nombre: 'Dra. Claudia Ortiz',
    especialidad: 'Reflexología',
    calificacion: 4.7,
    experiencia: '6 años',
    horario: 'Mañana',
    fotoColor: 'from-amber-400 to-orange-500',
    disponibleHoy: false,
    servicios: ['Reflexología podal', 'Aromaterapia', 'Drenaje linfático']
  },
  {
    id: 'staff-4',
    nombre: 'Dr. Héctor Cárdenas',
    especialidad: 'Podología Deportiva',
    calificacion: 5.0,
    experiencia: '12 años',
    horario: 'Tarde',
    fotoColor: 'from-blue-400 to-sky-500',
    disponibleHoy: true,
    servicios: ['Estudio de pisada', 'Ortesis de silicona', 'Fisioterapia podal']
  }
];

const ESPECIALIDADES = ['Todos', 'Podología Clínica', 'Podología Deportiva', 'Masoterapia y Spa', 'Reflexología'];
const TURNOS = ['Cualquier horario', 'Mañana', 'Tarde'];

function SelectorProfesionalStaffComponent() {
  const [selectedStaffId, setSelectedStaffId] = useState('staff-1');
  const [activeEspecialidad, setActiveEspecialidad] = useState('Todos');
  const [activeTurno, setActiveTurno] = useState('Cualquier horario');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = STAFF_DATA.filter(member => {
    const matchesEspecialidad = activeEspecialidad === 'Todos' || member.especialidad === activeEspecialidad;
    const matchesTurno = activeTurno === 'Cualquier horario' || member.horario === activeTurno;
    const matchesSearch = member.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.servicios.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEspecialidad && matchesTurno && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Filtros Superiores */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <div>
            <h3 className="text-sm font-black text-[var(--color-text)]">Seleccionar Especialista</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Elige el terapeuta o podólogo para tu servicio</p>
          </div>
          
          {/* Buscador */}
          <div className="w-full md:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>
        </div>

        {/* Chips de Especialidad */}
        <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {ESPECIALIDADES.map(esp => (
            <button
              key={esp}
              onClick={() => setActiveEspecialidad(esp)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                activeEspecialidad === esp
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {esp}
            </button>
          ))}
        </div>

        {/* Turno Horario */}
        <div className="flex gap-2 items-center">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] mr-2">Horario:</span>
          {TURNOS.map(turno => (
            <button
              key={turno}
              onClick={() => setActiveTurno(turno)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                activeTurno === turno
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              {turno}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Personal */}
      {filteredStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredStaff.map(member => {
            const isSelected = selectedStaffId === member.id;
            return (
              <div
                key={member.id}
                onClick={() => setSelectedStaffId(member.id)}
                className={`p-3.5 rounded-xl border text-left flex gap-3.5 transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)] ring-2 ring-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-2)]/20'
                }`}
              >
                {/* Avatar Simulador */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${member.fotoColor} flex items-center justify-center shrink-0 text-white font-black text-sm shadow-sm`}>
                  {member.nombre.split(' ').pop().substring(0, 1)}
                  {member.nombre.split(' ').filter(n => n !== 'Dr.' && n !== 'Dra.' && n !== 'Sr.').pop()?.substring(0,1)}
                </div>

                <div className="flex flex-col gap-1 w-full min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1 truncate pr-6">
                      {member.nombre}
                      {member.calificacion >= 4.9 && <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {member.calificacion.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
                    {member.especialidad} • Exp: {member.experiencia}
                  </span>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.servicios.map((s, idx) => (
                      <span key={idx} className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[9px] text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{member.horario}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${member.disponibleHoy ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                      <span>{member.disponibleHoy ? 'Disponible' : 'No disponible'}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] text-xs">
          No se encontraron especialistas.
        </div>
      )}
    </div>
  );
}

export default function SelectorProfesionalStaffSandbox() {
  return (
    <SandboxLayout
      title="Selector de Profesional y Staff"
      description="Visualizador interactivo de perfiles con calificación, disponibilidad diaria y turnos de atención"
    >
      <SelectorProfesionalStaffComponent />
    </SandboxLayout>
  );
}
