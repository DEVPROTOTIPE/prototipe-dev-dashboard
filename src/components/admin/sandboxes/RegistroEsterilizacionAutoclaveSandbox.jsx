import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { ShieldCheck, Thermometer, Activity, Trash2 } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

const LOTES_INICIALES = [
  { id: 'LOT-20260701-A', fecha: '2026-07-01', operadora: 'Dra. Gómez', autoclaveId: 'AUTO-01', temperatura: '134°C', presion: '2.1 bar', tiempo: '15 min', estado: 'aprobado' },
  { id: 'LOT-20260702-B', fecha: '2026-07-02', operadora: 'Dra. Ortiz', autoclaveId: 'AUTO-02', temperatura: '121°C', presion: '1.1 bar', tiempo: '30 min', estado: 'aprobado' },
  { id: 'LOT-20260702-C', fecha: '2026-07-02', operadora: 'Sr. Mendoza', autoclaveId: 'AUTO-01', temperatura: '115°C', presion: '0.9 bar', tiempo: '8 min', estado: 'fallido' }
];

function RegistroEsterilizacionAutoclaveComponent({ onAddLote }) {
  const { alertConfirm } = useAlertConfirm();
  const [lotes, setLotes] = useState(LOTES_INICIALES);
  
  const [nuevoLoteId, setNuevoLoteId] = useState(`LOT-20260702-E`);
  const [temperatura, setTemperatura] = useState('134°C');
  const [presion, setPresion] = useState('2.1 bar');
  const [tiempo, setTiempo] = useState('15 min');
  const [autoclaveId, setAutoclaveId] = useState('AUTO-01');
  const [operadora, setOperadora] = useState('Dra. Gómez');
  
  const curvePointsTemp = "10,90 40,90 80,30 150,30 190,90 230,90";
  const curvePointsPres = "10,90 40,90 80,45 150,45 190,90 230,90";

  const handleCreateLote = (e) => {
    e.preventDefault();
    
    const tempNum = parseInt(temperatura);
    const presNum = parseFloat(presion);
    const timeNum = parseInt(tiempo);
    
    let estado = 'fallido';
    if ((tempNum >= 134 && presNum >= 2.0 && timeNum >= 15) || 
        (tempNum >= 121 && presNum >= 1.0 && timeNum >= 30)) {
      estado = 'aprobado';
    }

    const nuevoLote = {
      id: nuevoLoteId,
      fecha: new Date().toISOString().slice(0, 10),
      operadora,
      autoclaveId,
      temperatura,
      presion,
      tiempo: `${timeNum} min`,
      estado
    };

    const updated = [nuevoLote, ...lotes];
    setLotes(updated);
    if (onAddLote) onAddLote(nuevoLote);

    setNuevoLoteId(`LOT-20260702-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`);
  };

  const handleDeleteLote = async (id) => {
    const confirm = await alertConfirm({
      title: '¿Eliminar Lote de Esterilización?',
      message: `Está por purgar el registro del lote ${id}. Esta acción no se puede revertir.`,
      variant: 'error'
    });

    if (confirm) {
      setLotes(lotes.filter(l => l.id !== id));
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Sección Superior: Formulario y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Formulario de Registro */}
        <form onSubmit={handleCreateLote} className="lg:col-span-5 flex flex-col gap-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
          <div>
            <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Nuevo Registro de Ciclo</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Lecturas físicas del autoclave</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Autoclave</label>
              <CustomSelect
                value={autoclaveId}
                onChange={setAutoclaveId}
                options={[
                  { value: 'AUTO-01', label: 'Autoclave 01' },
                  { value: 'AUTO-02', label: 'Autoclave 02' }
                ]}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Operadora</label>
              <CustomSelect
                value={operadora}
                onChange={setOperadora}
                options={[
                  { value: 'Dra. Gómez', label: 'Dra. Gómez' },
                  { value: 'Dra. Ortiz', label: 'Dra. Ortiz' },
                  { value: 'Sr. Mendoza', label: 'Sr. Mendoza' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Temp</label>
              <CustomSelect
                value={temperatura}
                onChange={setTemperatura}
                options={[
                  { value: '134°C', label: '134°C' },
                  { value: '121°C', label: '121°C' },
                  { value: '115°C', label: '115°C' }
                ]}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Presión</label>
              <CustomSelect
                value={presion}
                onChange={setPresion}
                options={[
                  { value: '2.1 bar', label: '2.1 bar' },
                  { value: '1.1 bar', label: '1.1 bar' },
                  { value: '0.9 bar', label: '0.9 bar' }
                ]}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Tiempo (min)</label>
              <input
                type="number"
                value={parseInt(tiempo)}
                onChange={(e) => setTiempo(`${e.target.value} min`)}
                min="1"
                max="60"
                className="w-full px-1.5 py-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[10px] text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] !text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-fadeIn"
          >
            <ShieldCheck className="w-4 h-4" /> Registrar Lote
          </button>
        </form>

        {/* Gráfico de Trazabilidad */}
        <div className="lg:col-span-7 flex flex-col gap-2 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Fases del Autoclave</h3>
              <p className="text-[9px] text-[var(--color-text-muted)]">Ciclo físico activo</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5">
                <Thermometer className="w-2.5 h-2.5" /> Temp
              </span>
              <span className="text-[9px] font-bold text-blue-500 flex items-center gap-0.5">
                <Activity className="w-2.5 h-2.5" /> Presión
              </span>
            </div>
          </div>

          <div className="w-full bg-[var(--color-bg)]/30 rounded-lg p-2 border border-[var(--color-border)] flex items-center justify-center">
            <svg className="w-full max-h-[120px]" viewBox="0 0 240 100">
              <line x1="10" y1="90" x2="230" y2="90" stroke="var(--color-border)" strokeWidth="1" />
              <line x1="10" y1="10" x2="10" y2="90" stroke="var(--color-border)" strokeWidth="1" />
              
              <polyline fill="none" stroke="#ef4444" strokeWidth="2" points={curvePointsTemp} />
              <polyline fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3" points={curvePointsPres} />

              <text x="75" y="20" fill="var(--color-text)" fontSize="7" fontWeight="bold">Fase Meseta (134°C / 2.1 bar)</text>
              <text x="15" y="98" fill="var(--color-text-muted)" fontSize="7">Prevacío</text>
              <text x="100" y="98" fill="var(--color-text-muted)" fontSize="7">Esterilizar</text>
              <text x="195" y="98" fill="var(--color-text-muted)" fontSize="7">Secado</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Listado / Tabla de Lotes */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-wider">Historial de Lotes de Instrumental</span>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/20">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[9px] font-black uppercase text-[var(--color-text-muted)]">
                <th className="p-2.5">Lote</th>
                <th className="p-2.5">Fecha</th>
                <th className="p-2.5">Autoclave</th>
                <th className="p-2.5">Parámetros</th>
                <th className="p-2.5">Personal</th>
                <th className="p-2.5 text-center">Estado</th>
                <th className="p-2.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {lotes.map(l => (
                <tr key={l.id} className="hover:bg-[var(--color-surface-2)]/30 transition-all">
                  <td className="p-2.5 font-mono font-bold text-[10px] text-[var(--color-primary)]">{l.id}</td>
                  <td className="p-2.5 text-[var(--color-text-muted)]">{l.fecha}</td>
                  <td className="p-2.5">{l.autoclaveId}</td>
                  <td className="p-2.5">
                    <span className="font-semibold">{l.temperatura}</span> • {l.presion} • {l.tiempo}
                  </td>
                  <td className="p-2.5 text-[var(--color-text-muted)]">{l.operadora}</td>
                  <td className="p-2.5">
                    <div className="flex items-center justify-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        l.estado === 'aprobado'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {l.estado}
                      </span>
                    </div>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => handleDeleteLote(l.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default function RegistroEsterilizacionAutoclaveSandbox() {
  return (
    <SandboxLayout
      title="Registro de Esterilización en Autoclave"
      description="Auditoría e historial de trazabilidad de bioseguridad para instrumental podológico"
    >
      <RegistroEsterilizacionAutoclaveComponent />
    </SandboxLayout>
  );
}
