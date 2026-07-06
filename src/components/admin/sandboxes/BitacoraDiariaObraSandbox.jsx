import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Camera, Calendar, CloudRain, Sun, AlertTriangle, Users, FileText, Check, Trash2, ArrowDown } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function BitacoraDiariaObra({
  onSaveReport,
  confirmAction,
  personalInicial = [
    { id: '1', nombre: 'Carlos Mendoza (Albañil Principal)', presente: true },
    { id: '2', nombre: 'Jaime Rincón (Ayudante de obra)', presente: true },
    { id: '3', nombre: 'Andrés López (Electricista oficial)', presente: false },
    { id: '4', nombre: 'Mateo Gómez (Pintor/Acabados)', presente: true }
  ]
}) {
  const [clima, setClima] = useState('soleado');
  const [incidentes, setIncidentes] = useState('');
  const [personal, setPersonal] = useState(personalInicial);
  const [registros, setRegistros] = useState([
    {
      id: 'r1',
      fecha: '2026-07-01',
      clima: 'soleado',
      novedad: 'Normal',
      personalPresente: 3,
      personalTotal: 4,
      detalles: 'Se completó la excavación del tramo norte. Acero de cimentación habilitado al 100%.',
      fotos: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200']
    }
  ]);

  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [progresoCarga, setProgresoCarga] = useState(0);
  const [imagenesSubidas, setImagenesSubidas] = useState([]);

  const toggleAsistencia = (id) => {
    setPersonal(personal.map(p => p.id === id ? { ...p, presente: !p.presente } : p));
  };

  const handleSimularArchivo = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setCargandoImagen(true);
    setProgresoCarga(10);

    const interval = setInterval(() => {
      setProgresoCarga(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCargandoImagen(false);
          setImagenesSubidas([...imagenesSubidas, 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200']);
          return 0;
        }
        return prev + 30;
      });
    }, 200);
  };

  const guardarReporte = () => {
    const presentesCount = personal.filter(p => p.presente).length;
    const nuevoReporte = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      clima,
      novedad: incidentes.length > 25 ? 'Alerta' : 'Normal',
      personalPresente: presentesCount,
      personalTotal: personal.length,
      detalles: incidentes || 'Jornada habitual sin incidentes registrados.',
      fotos: imagenesSubidas
    };

    const nuevosRegistros = [nuevoReporte, ...registros];
    setRegistros(nuevosRegistros);
    setIncidentes('');
    setImagenesSubidas([]);
    if (onSaveReport) {
      onSaveReport(nuevoReporte);
    }
  };

  const eliminarRegistro = async (id) => {
    const confirmed = await confirmAction({
      title: '¿Eliminar reporte?',
      message: 'Esta acción no se puede deshacer. El reporte de bitácora será borrado permanentemente.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setRegistros(registros.filter(r => r.id !== id));
    }
  };

  const getClimaIcon = (climaKey) => {
    switch (climaKey) {
      case 'soleado': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'lluvioso': return <CloudRain className="w-5 h-5 text-blue-400" />;
      default: return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl text-[var(--color-text)]">
      {/* Encabezado */}
      <div className="flex items-center gap-3 pb-5 border-b border-[var(--color-border)] mb-6">
        <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Bitácora Diaria de Obra</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Control de asistencia, clima e incidencias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Nueva Bitácora */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              Nueva Entrada de Bitácora
            </h3>

            {/* Fila Clima y Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Estado del Clima</label>
                <CustomSelect
                  value={clima}
                  onChange={setClima}
                  options={[
                    { value: 'soleado', label: 'Soleado y Despejado' },
                    { value: 'parcial', label: 'Nublado / Vientos' },
                    { value: 'lluvioso', label: 'Lluvia / Paro Parcial' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Evidencia Fotográfica</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimularArchivo}
                    disabled={cargandoImagen}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[var(--color-bg)]/80 hover:bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm font-medium transition-colors">
                    <Camera className="w-4 h-4" />
                    <span>{cargandoImagen ? 'Cargando...' : 'Tomar Foto / Subir'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso de Carga */}
            {cargandoImagen && (
              <div className="w-full bg-[var(--color-bg)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-primary)] h-full transition-all duration-300"
                  style={{ width: `${progresoCarga}%` }}
                />
              </div>
            )}

            {/* Fotos Cargadas Previsualización */}
            {imagenesSubidas.length > 0 && (
              <div className="flex gap-2 py-1 overflow-x-auto py-4">
                {imagenesSubidas.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg border border-[var(--color-border)] overflow-hidden shrink-0">
                    <img src={url} alt="Evidencia" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Detalles / Novedades */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Novedades e Incidentes</label>
              <textarea
                rows="3"
                placeholder="Escribe el avance físico o cualquier incidente técnico..."
                value={incidentes}
                onChange={(e) => setIncidentes(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder-[var(--color-text-muted)]/50"
              />
            </div>

            <button
              onClick={guardarReporte}
              className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
            >
              Registrar Jornada
            </button>
          </div>
        </div>

        {/* Control de Asistencia del Personal */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-primary)]" />
              Asistencia de Personal
            </h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 py-1">
              {personal.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleAsistencia(p.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    p.presente
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-[var(--color-bg)]/50 border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  <span className="text-xs font-semibold">{p.nombre}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    p.presente ? 'bg-emerald-500 border-transparent text-white' : 'border-[var(--color-border)]'
                  }`}>
                    {p.presente && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Listado Histórico de Hojas de Bitácora */}
      <div className="mt-8 border-t border-[var(--color-border)] pt-6">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          Historial de Bitácoras
          <span className="text-xs font-normal text-[var(--color-text-muted)]">({registros.length} registros)</span>
        </h3>
        <div className="flex flex-col gap-4">
          {registros.map(r => (
            <div
              key={r.id}
              className="p-5 bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <Calendar className="w-3.5 h-3.5" />
                    {r.fecha}
                  </div>
                  <div className="flex items-center gap-1">
                    {getClimaIcon(r.clima)}
                    <span className="text-xs capitalize">{r.clima}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    r.novedad === 'Alerta'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {r.novedad}
                  </span>
                </div>
                <button
                  onClick={() => eliminarRegistro(r.id)}
                  className="text-[var(--color-text-muted)] hover:text-red-500 p-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm leading-relaxed">{r.detalles}</p>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[var(--color-border)]/40 mt-1">
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Users className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Asistencia: {r.personalPresente}/{r.personalTotal} presentes</span>
                </div>

                {r.fotos && r.fotos.length > 0 && (
                  <div className="flex gap-1.5">
                    {r.fotos.map((url, i) => (
                      <div key={i} className="relative w-10 h-10 rounded border border-[var(--color-border)] overflow-hidden">
                        <img src={url} alt="Adjunto" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BitacoraDiariaObraSandbox() {
  const { alertConfirm } = useAlertConfirm();
  const [lastReport, setLastReport] = useState(null);

  return (
    <SandboxLayout
      title="Bitácora Diaria de Obra"
      description="Reportes diarios de obra, control de asistencia rápido y carga simulada de fotos."
    >
      <div className="flex flex-col gap-6">
        <BitacoraDiariaObra
          onSaveReport={setLastReport}
          confirmAction={alertConfirm}
        />

        {lastReport && (
          <div className="max-w-5xl mx-auto w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            <p className="font-bold">✓ Entrada de bitácora registrada exitosamente:</p>
            <p className="mt-1">
              Fecha: {lastReport.fecha} | Clima: {lastReport.clima} | Asistencia: {lastReport.personalPresente}/{lastReport.personalTotal} presentes.
            </p>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
