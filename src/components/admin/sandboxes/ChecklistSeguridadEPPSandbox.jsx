import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { ShieldAlert, CheckCircle, RotateCcw, AlertTriangle, Check, UserCheck, HardHat } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

// Recreación inline del componente
function ChecklistSeguridadEPP({
  onValidate,
  confirmAction,
  laboresConfig = [
    {
      value: 'alturas',
      label: 'Trabajo en Alturas (Fachadas/Andamios)',
      requeridos: ['casco', 'botas', 'arnes', 'gafas', 'eslinga']
    },
    {
      value: 'soldadura',
      label: 'Soldadura y Oxicorte Estructural',
      requeridos: ['casco', 'botas', 'careta', 'delantal', 'guantes_cuero']
    },
    {
      value: 'electricidad',
      label: 'Instalaciones Eléctricas de Media/Baja Tensión',
      requeridos: ['casco_dieléctrico', 'botas_dieléctricas', 'guantes_dieléctricos', 'gafas']
    },
    {
      value: 'obra_gris',
      label: 'Albañilería y Excavación Tradicional',
      requeridos: ['casco', 'botas', 'gafas', 'guantes_hilo']
    }
  ],
  itemsCatalogo = {
    casco: { label: 'Casco de Seguridad de Impacto (Clase A o B)', critico: true },
    casco_dieléctrico: { label: 'Casco de Seguridad Dieléctrico (Clase E)', critico: true },
    botas: { label: 'Botas de Seguridad con Puntera de Acero', critico: true },
    botas_dieléctricas: { label: 'Botas de Seguridad Dieléctricas sin Acero', critico: true },
    gafas: { label: 'Gafas de Seguridad Policarbonato (Contra impactos)', critico: false },
    arnes: { label: 'Arnés de Cuerpo Entero Multipropósito Certificado', critico: true },
    eslinga: { label: 'Eslinga con Absorbedor de Choque de Doble Terminal', critico: true },
    careta: { label: 'Careta de Soldar con Filtro Fotosensible Grado 10-12', critico: true },
    delantal: { label: 'Peto o Delantal de Cuero Plomado para Calor', critico: false },
    guantes_cuero: { label: 'Guantes de Cuero Carnaza de Caña Larga', critico: true },
    guantes_dieléctricos: { label: 'Guantes Dieléctricos Certificados con Sobreguante', critico: true },
    guantes_hilo: { label: 'Guantes de Hilo con Palma de Nitrilo', critico: false }
  }
}) {
  const [labor, setLabor] = useState('alturas');
  const [checkedIds, setCheckedIds] = useState({});
  const [nombreOperario, setNombreOperario] = useState('');
  const [aprobado, setAprobado] = useState(false);

  const laborActiva = React.useMemo(() => {
    return laboresConfig.find(l => l.value === labor) || laboresConfig[0];
  }, [labor, laboresConfig]);

  const toggleCheck = (id) => {
    if (aprobado) return;
    setCheckedIds({
      ...checkedIds,
      [id]: !checkedIds[id]
    });
  };

  const validacionEPP = React.useMemo(() => {
    const faltantes = [];
    let cumpleCriticos = true;

    laborActiva.requeridos.forEach(itemId => {
      const item = itemsCatalogo[itemId];
      const isChecked = !!checkedIds[itemId];

      if (!isChecked) {
        if (item?.critico) {
          cumpleCriticos = false;
        }
        faltantes.push(item?.label || itemId);
      }
    });

    return {
      cumpleCriticos,
      faltantes,
      completadoPct: Math.round(
        ((laborActiva.requeridos.filter(id => !!checkedIds[id]).length) / laborActiva.requeridos.length) * 100
      )
    };
  }, [laborActiva, checkedIds, itemsCatalogo]);

  const handleValidarFirma = () => {
    if (!nombreOperario.trim() || !validacionEPP.cumpleCriticos) return;
    setAprobado(true);
    if (onValidate) {
      onValidate({
        operario: nombreOperario,
        labor: laborActiva.label,
        faltantesNoCriticos: validacionEPP.faltantes
      });
    }
  };

  const handleReset = async () => {
    const confirmed = await confirmAction({
      title: '¿Reiniciar Checklist?',
      message: 'Se desmarcarán todos los equipos de seguridad y se cancelará la validación actual.',
      confirmText: 'Reiniciar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setCheckedIds({});
      setNombreOperario('');
      setAprobado(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl text-[var(--color-text)]">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)] mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Checklist de Seguridad y EPP</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Verificación obligatoria de equipo de protección personal</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-sm font-medium rounded-xl transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar Checklist
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entradas */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Tipo de Labor */}
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Labor Técnica a Realizar</label>
            <CustomSelect
              value={labor}
              onChange={(val) => {
                setLabor(val);
                setCheckedIds({});
                setAprobado(false);
              }}
              options={laboresConfig.map(l => ({ value: l.value, label: l.label }))}
            />
          </div>

          {/* Listado de checks */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Equipamiento EPP Requerido</label>
            <div className="flex flex-col gap-2">
              {laborActiva.requeridos.map(itemId => {
                const item = itemsCatalogo[itemId];
                if (!item) return null;
                const isChecked = !!checkedIds[itemId];

                return (
                  <button
                    key={itemId}
                    onClick={() => toggleCheck(itemId)}
                    disabled={aprobado}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 text-[var(--color-primary)]'
                        : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:border-[var(--color-border)]/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-[var(--color-primary)] border-transparent text-white' : 'border-[var(--color-border)]'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-text)]">{item.label}</span>
                    </div>
                    {item.critico && (
                      <span className="text-[9px] px-2 py-0.5 rounded font-extrabold uppercase bg-red-500/10 border border-red-500/20 text-red-400">
                        Crítico
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resumen y Validación */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] p-6 rounded-2xl flex flex-col gap-6 sticky top-6">
            <h3 className="text-base font-bold pb-3 border-b border-[var(--color-border)]">Estado de Validación</h3>

            {/* Barra de Completado */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Avance Checklist</span>
                <span>{validacionEPP.completadoPct}%</span>
              </div>
              <div className="w-full bg-[var(--color-bg)] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    validacionEPP.cumpleCriticos ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${validacionEPP.completadoPct}%` }}
                />
              </div>
            </div>

            {/* Alertas Faltantes */}
            {!validacionEPP.cumpleCriticos ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="font-bold">Acceso Denegado / EPP Incompleto</p>
                  <p className="text-[var(--color-text-muted)] text-[10px]">
                    Falta marcar equipo crítico obligatorio antes del inicio.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-xs">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="font-bold">EPP Crítico Verificado</p>
                  <p className="text-[var(--color-text-muted)] text-[10px]">
                    El operario cumple con todas las protecciones vitales.
                  </p>
                </div>
              </div>
            )}

            {/* Operario y Firma */}
            {!aprobado ? (
              <div className="flex flex-col gap-4 pt-3 border-t border-[var(--color-border)]">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">Nombre Completo del Operario</label>
                  <input
                    type="text"
                    placeholder="Ej: Pedro Infante"
                    value={nombreOperario}
                    onChange={(e) => setNombreOperario(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:border-[var(--color-primary)] focus:outline-none placeholder-[var(--color-text-muted)]/50"
                  />
                </div>
                <button
                  onClick={handleValidarFirma}
                  disabled={!nombreOperario.trim() || !validacionEPP.cumpleCriticos}
                  className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-text-muted)]/20 disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  <UserCheck className="w-4 h-4" />
                  Firmar Declaración EPP
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-dashed border-emerald-500/30 rounded-xl flex flex-col items-center justify-center text-center py-6">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                <span className="text-xs font-bold text-emerald-400">Pase de Acceso Firmado</span>
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Operario: {nombreOperario} | Labor: {laborActiva.label}
                </span>
                <div className="mt-4 w-32 h-6 bg-[var(--color-bg)] flex gap-0.5 px-2 py-1 items-center justify-center rounded">
                  <div className="h-full w-2 bg-slate-200" />
                  <div className="h-full w-0.5 bg-slate-200" />
                  <div className="h-full w-1.5 bg-slate-200" />
                  <div className="h-full w-1 bg-slate-200" />
                  <div className="h-full w-2.5 bg-slate-200" />
                  <div className="h-full w-0.5 bg-slate-200" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistSeguridadEPPSandbox() {
  const { alertConfirm } = useAlertConfirm();
  const [validation, setValidation] = useState(null);

  return (
    <SandboxLayout
      title="Checklist de Seguridad y EPP"
      description="Verificación obligatoria de EPP por tipo de labor con firmas de control digital."
    >
      <div className="flex flex-col gap-6">
        <ChecklistSeguridadEPP
          onValidate={setValidation}
          confirmAction={alertConfirm}
        />

        {validation && (
          <div className="max-w-4xl mx-auto w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            <p className="font-bold">✓ Pase de ingreso aprobado y firmado:</p>
            <p className="mt-1">
              Operario: {validation.operario} | Labor: {validation.labor} | Faltantes No Críticos: {validation.faltantesNoCriticos.length > 0 ? validation.faltantesNoCriticos.join(', ') : 'Ninguno'}.
            </p>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
