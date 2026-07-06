import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Home, ShieldAlert, Sparkles, User, Clock, Info } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

const CABINAS_PREDEFINIDAS = [
  { id: 'cab-1', nombre: 'Cabina Aura', estado: 'disponible', equipamiento: ['sillón podológico', 'luz lupa', 'autoclave'] },
  { id: 'cab-2', nombre: 'Cabina Zen', estado: 'disponible', equipamiento: ['camilla masajes', 'difusor aromas', 'cromoterapia'] },
  { id: 'cab-3', nombre: 'Cabina Vital', estado: 'ocupada', equipamiento: ['sillón podológico', 'luz lupa', 'tina hidromasaje'], ocupante: 'Juan Pérez', terapeuta: 'Dr. Cárdenas' },
  { id: 'cab-4', nombre: 'Cabina Manta', estado: 'mantenimiento', equipamiento: ['camilla masajes', 'termo piedras'] }
];

const TRATAMIENTOS = [
  { id: 't-podologia', label: 'Podología Clínica (Quiropodia)', requiere: 'sillón podológico', duracion: '45 min', precio: '$65,000' },
  { id: 't-masaje', label: 'Masaje Relajante de Espalda', requiere: 'camilla masajes', duracion: '60 min', precio: '$80,000' },
  { id: 't-reflexologia', label: 'Reflexología Podal con Aromas', requiere: 'difusor aromas', duracion: '50 min', precio: '$55,000' }
];

const TERAPEUTAS = [
  { value: 'ter-1', label: 'Dra. Liliana Gómez (Podóloga)' },
  { value: 'ter-2', label: 'Sr. Andrés Mendoza (Masoterapeuta)' },
  { value: 'ter-3', label: 'Dra. Claudia Ortiz (Reflexóloga)' }
];

function SelectorServicioCabinaComponent({ onAssign }) {
  const [selectedTratamientoId, setSelectedTratamientoId] = useState('t-podologia');
  const [selectedCabinaId, setSelectedCabinaId] = useState(null);
  const [selectedTerapeuta, setSelectedTerapeuta] = useState('ter-1');
  const [pacienteNombre, setPacienteNombre] = useState('');
  const [cabinas, setCabinas] = useState(CABINAS_PREDEFINIDAS);
  const [mensajeExito, setMensajeExito] = useState('');

  const activeTratamiento = TRATAMIENTOS.find(t => t.id === selectedTratamientoId);
  const selectedCabina = cabinas.find(c => c.id === selectedCabinaId);

  const esCompatible = (cabina) => {
    if (!activeTratamiento) return true;
    return cabina.equipamiento.includes(activeTratamiento.requiere);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!selectedCabinaId || !pacienteNombre || !selectedTerapeuta) return;

    if (selectedCabina.estado !== 'disponible') return;

    const terapeutaLabel = TERAPEUTAS.find(t => t.value === selectedTerapeuta)?.label || '';

    const updatedCabinas = cabinas.map(c => {
      if (c.id === selectedCabinaId) {
        return {
          ...c,
          estado: 'ocupada',
          ocupante: pacienteNombre,
          terapeuta: terapeutaLabel
        };
      }
      return c;
    });

    setCabinas(updatedCabinas);
    setMensajeExito(`¡Asignación exitosa! ${selectedCabina.nombre} ocupada por ${pacienteNombre}.`);
    
    if (onAssign) {
      onAssign({
        cabinaId: selectedCabinaId,
        tratamiento: activeTratamiento,
        terapeuta: terapeutaLabel,
        paciente: pacienteNombre
      });
    }

    setPacienteNombre('');
    setSelectedCabinaId(null);
    setTimeout(() => setMensajeExito(''), 4000);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Sección 1: Selección de Tratamiento */}
      <div>
        <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider block mb-2">1. Seleccionar Tratamiento</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {TRATAMIENTOS.map(tr => (
            <button
              key={tr.id}
              type="button"
              onClick={() => {
                setSelectedTratamientoId(tr.id);
                setSelectedCabinaId(null);
              }}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                selectedTratamientoId === tr.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40'
              }`}
            >
              <span className="text-xs font-bold text-[var(--color-text)]">{tr.label}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{tr.duracion} • <strong className="text-[var(--color-primary)]">{tr.precio}</strong></span>
              <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-bg)] px-1.5 py-0.5 rounded border border-[var(--color-border)] self-start font-semibold mt-1">
                Requiere: {tr.requiere}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sección 2: Cabinas Disponibles y Validación */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">
            2. Cabinas de Tratamiento
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {cabinas.map(cab => {
            const compatible = esCompatible(cab);
            const isSelected = selectedCabinaId === cab.id;
            
            let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            if (cab.estado === 'ocupada') badgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';
            if (cab.estado === 'mantenimiento') badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

            return (
              <button
                key={cab.id}
                type="button"
                onClick={() => compatible && cab.estado === 'disponible' && setSelectedCabinaId(cab.id)}
                disabled={!compatible || cab.estado !== 'disponible'}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2.5 transition-all relative ${
                  isSelected 
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)] ring-2 ring-[var(--color-primary)]/10' 
                    : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                } ${(!compatible || cab.estado !== 'disponible') ? 'opacity-40 cursor-not-allowed bg-[var(--color-surface-2)]/20' : 'cursor-pointer'}`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    <span className="text-xs font-bold text-[var(--color-text)]">{cab.nombre}</span>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${badgeColor}`}>
                    {cab.estado}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cab.equipamiento.map((eq, i) => (
                    <span key={i} className="text-[8px] px-1 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">
                      {eq}
                    </span>
                  ))}
                </div>

                {cab.estado === 'ocupada' && (
                  <div className="text-[9px] text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-1.5 mt-0.5">
                    <p className="truncate">👤 {cab.ocupante}</p>
                    <p className="truncate">🩺 {cab.terapeuta}</p>
                  </div>
                )}

                {!compatible && (
                  <span className="text-[8px] text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded mt-1 self-start flex items-center gap-0.5 border border-red-500/20">
                    <ShieldAlert className="w-3 h-3" /> Incompatible
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sección 3: Asignación y Formulario */}
      {selectedCabinaId && (
        <form onSubmit={handleAssign} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
          <div>
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Paciente</label>
            <input
              type="text"
              value={pacienteNombre}
              onChange={(e) => setPacienteNombre(e.target.value)}
              placeholder="Ej. Carlos Restrepo"
              required
              className="w-full px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Terapeuta</label>
            <CustomSelect
              options={TERAPEUTAS}
              value={selectedTerapeuta}
              onChange={setSelectedTerapeuta}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-[var(--color-primary)] !text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer"
          >
            Asignar Cabina
          </button>
        </form>
      )}

      {mensajeExito && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}
    </div>
  );
}

export default function SelectorServicioCabinaSandbox() {
  return (
    <SandboxLayout
      title="Selector de Servicio y Cabina"
      description="Valida la compatibilidad de equipamiento del salón con los tratamientos clínicos"
    >
      <SelectorServicioCabinaComponent />
    </SandboxLayout>
  );
}
