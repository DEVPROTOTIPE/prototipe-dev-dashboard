import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  Cpu, 
  ShieldAlert, 
  FileText, 
  Package, 
  Zap, 
  RotateCcw,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { CLI_URL } from '../../config';

const NICHES = [
  { value: 'retail_clothing', label: '🛍️ Ropa y Retail Tradicional' },
  { value: 'technical_services', label: '⚙️ Tornerías y Mecanizado de Precisión' },
  { value: 'refrigeration_ac', label: '❄️ Refrigeración y Climatización' },
  { value: 'contractors', label: '📐 Contratistas y Construcción' },
  { value: 'machinery_rental', label: '🚜 Alquiler de Maquinaria y Equipos' },
  { value: 'carpentry', label: '🪚 Carpinterías y Muebles' },
  { value: 'laundry', label: '🧺 Lavanderías y Tintorerías' },
  { value: 'furniture_repair', label: '🛋️ Restauración y Tapicería de Muebles' },
  { value: 'wellness_podology', label: '💆 Estética, Podología y Bienestar' },
  { value: 'grocery_food', label: '🍎 Minimarkets y Alimentos' },
  { value: 'insumos-agricolas', label: '🚜 Insumos y Repuestos Agrícolas' },
  { value: 'alimentos-artesanales', label: '🎂 Alimentos Artesanales y Repostería' },
  { value: 'ferreteria-rural', label: '🛠️ Ferretería y Construcción Rural' },
  { value: 'repuestos-motos', label: '🏍️ Repuestos y Accesorios de Motos' },
  { value: 'distribuidoras-beauty', label: '💅 Suministros de Belleza Profesional' },
  { value: 'petshops-locales', label: '🐶 Alimentos y Accesorios para Mascotas' },
  { value: 'repuestos-lineablanca', label: '⚙️ Repuestos de Electrodomésticos' },
  { value: 'moda-local-calzado', label: '👞 Calzado y Confección Local' },
  { value: 'alimentacion-saludable', label: '🥗 Alimentación Orgánica y Saludable' },
  { value: 'home-office-ergonomia', label: '💻 Equipamiento Home Office' },
  { value: 'licores-cocteleria', label: '🍹 Bodega de Licores y Coctelería' },
  { value: 'coleccionismo-geek', label: '🧸 Artículos Geek y Coleccionismo' },
  { value: 'distribucion-horeca', label: '📦 Insumos Horeca B2B' }
];

export default function CorePromotionModal({ isOpen, onClose, clientId, nicho: initialNicho }) {
  if (!isOpen) return null;

  const [step, setStep] = useState('PREFLIGHT'); // PREFLIGHT, PIPELINE, PUBLISH, ACTIVATE, COMPLETED, ROLLBACK
  const [targetCoreKey, setTargetCoreKey] = useState(`app-${clientId.toLowerCase()}`);
  const [targetCoreName, setTargetCoreName] = useState(clientId.charAt(0).toUpperCase() + clientId.slice(1));
  const [nicho, setNicho] = useState(initialNicho || 'retail_clothing');
  
  const [loading, setLoading] = useState(false);
  const [promotionId, setPromotionId] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  
  // SSE logs
  const [logs, setLogs] = useState([]);
  const consoleEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Auto-scroll en consola SSE
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Limpiar EventSource al desmontar
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handlePreflight = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CLI_URL}/api/project/${clientId}/core-promotion/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCoreKey, targetCoreName, nicho })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPromotionId(data.promotionId);
        setBlueprint(data.blueprint);
        setStep('PIPELINE');
      } else {
        alert(data.error || 'Error en Preflight.');
      }
    } catch (err) {
      alert(`Error de red en preflight: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!promotionId) return;
    try {
      setLoading(true);
      setLogs([]);
      
      // 1. Conectar SSE para logs en caliente
      const es = new EventSource(`${CLI_URL}/api/project/core-promotion/${promotionId}/events`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log') {
            setLogs(prev => [...prev, data.line]);
          }
        } catch (e) {
          console.error('Error parseando evento SSE:', e);
        }
      };

      es.onerror = () => {
        console.warn('Conexión SSE cerrada o perdida.');
        es.close();
      };

      // 2. Ejecutar Pipeline
      const res = await fetch(`${CLI_URL}/api/project/core-promotion/${promotionId}/execute`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al ejecutar.');
      }
    } catch (err) {
      alert(`Error de red al ejecutar: ${err.message}`);
    } finally {
      setLoading(false);
      // Comenzar sondeo periódico rápido del estado del blueprint
      startBlueprintPolling();
    }
  };

  const startBlueprintPolling = () => {
    const timer = setInterval(async () => {
      if (!promotionId) {
        clearInterval(timer);
        return;
      }
      try {
        const res = await fetch(`${CLI_URL}/api/project/core-promotion/${promotionId}`);
        const data = await res.json();
        setBlueprint(data);

        if (data.status === 'CANDIDATE_READY') {
          clearInterval(timer);
          setStep('PUBLISH');
        } else if (data.status.startsWith('FAILED') || data.status === 'QUARANTINED') {
          clearInterval(timer);
        }
      } catch (err) {
        console.error('Error sondeando blueprint:', err);
      }
    }, 2000);
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CLI_URL}/api/project/core-promotion/${promotionId}/publish`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlueprint(data.blueprint);
        setStep('ACTIVATE');
      } else {
        alert(data.error || 'Error en publicación.');
      }
    } catch (err) {
      alert(`Error de red al publicar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CLI_URL}/api/project/core-promotion/${promotionId}/activate`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlueprint(data.blueprint);
        setStep('COMPLETED');
      } else {
        alert(data.error || 'Error en activación.');
      }
    } catch (err) {
      alert(`Error de red al activar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRollbackPublish = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CLI_URL}/api/project/core-promotion/${promotionId}/publication/rollback`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlueprint(data.blueprint);
        alert('Rollback de publicación física ejecutado con éxito.');
        setStep('PIPELINE');
      } else {
        alert(data.error || 'Error al ejecutar rollback.');
      }
    } catch (err) {
      alert(`Error de red en rollback: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRollbackActivate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CLI_URL}/api/project/core-promotion/${promotionId}/activation/rollback`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlueprint(data.blueprint);
        alert('Rollback de activación física ejecutado con éxito.');
        setStep('PUBLISH');
      } else {
        alert(data.error || 'Error en rollback de activación.');
      }
    } catch (err) {
      alert(`Error de red en rollback: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-[var(--color-border)]/60 flex items-center justify-between bg-slate-950/30">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-indigo-400 animate-pulse" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)]">Pipeline de Promoción a Core</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Clonar instancia '{clientId}' a Plantilla Core limpia</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-surface-2)]/60 rounded-xl transition-all cursor-pointer text-[var(--color-text-muted)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stepper Superior */}
        <div className="px-6 py-4 bg-slate-950/15 border-b border-[var(--color-border)]/35 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
          <div className={`flex items-center gap-1.5 ${step === 'PREFLIGHT' ? 'text-indigo-400' : 'text-emerald-400'}`}>
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px]">1</span>
            Preflight
          </div>
          <ArrowRight size={10} className="text-slate-650" />
          <div className={`flex items-center gap-1.5 ${step === 'PIPELINE' ? 'text-indigo-400' : blueprint?.status === 'CANDIDATE_READY' || step === 'PUBLISH' || step === 'ACTIVATE' || step === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px]">2</span>
            Validation & Staging
          </div>
          <ArrowRight size={10} className="text-slate-650" />
          <div className={`flex items-center gap-1.5 ${step === 'PUBLISH' ? 'text-indigo-400' : step === 'ACTIVATE' || step === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px]">3</span>
            Publish
          </div>
          <ArrowRight size={10} className="text-slate-650" />
          <div className={`flex items-center gap-1.5 ${step === 'ACTIVATE' ? 'text-indigo-400' : step === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px]">4</span>
            Activate
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* STEP 1: PREFLIGHT INPUTS */}
          {step === 'PREFLIGHT' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <p className="text-[11px] text-indigo-300 leading-relaxed font-medium">
                  El preflight analizará los manifiestos de la instancia del cliente, auditará la presencia de las features requeridas contra el Feature Registry local, y validará si existe alguna colisión de clave en el catálogo de cores oficiales.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Clave Técnica del Core (Slug)</label>
                  <input
                    type="text"
                    value={targetCoreKey}
                    onChange={(e) => setTargetCoreKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] p-2.5 rounded-xl text-[11px] font-mono text-[var(--color-text)] focus:border-indigo-500 focus:outline-none"
                    placeholder="ej. app-clothing"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Nombre Descriptivo del Core</label>
                  <input
                    type="text"
                    value={targetCoreName}
                    onChange={(e) => setTargetCoreName(e.target.value)}
                    className="w-full bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] p-2.5 rounded-xl text-[11px] font-medium text-[var(--color-text)] focus:border-indigo-500 focus:outline-none"
                    placeholder="ej. Retail Clothing Core"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Nicho Comercial</label>
                  <CustomSelect
                    options={NICHES}
                    value={nicho}
                    onChange={setNicho}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handlePreflight}
                  disabled={loading || !targetCoreKey || !targetCoreName}
                  className="py-2.5 px-5 bg-indigo-650 hover:bg-indigo-500 text-white !text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  {loading ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                  Ejecutar Análisis Preflight
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PIPELINE EXECUTION */}
          {step === 'PIPELINE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text)]">Ejecución del Pipeline</h4>
                  <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">ID Promoción: {promotionId} | Estado: <span className="font-bold text-indigo-400 font-mono">{blueprint?.status}</span></p>
                </div>
                {blueprint?.status === 'PENDING_PREFLIGHT' && (
                  <button
                    type="button"
                    onClick={handleExecute}
                    disabled={loading}
                    className="py-2 px-4 bg-indigo-650 hover:bg-indigo-500 text-white !text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    {loading ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                    Comenzar Construcción y Test
                  </button>
                )}
              </div>

              {/* Status Stepper de validación interna */}
              {blueprint && blueprint.status !== 'PENDING_PREFLIGHT' && (
                <div className="p-4 bg-slate-950/20 border border-[var(--color-border)]/60 rounded-2xl space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Monitoreo de Verificadores</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                      {blueprint.diagnostics.piiScan.status === 'PASSED' ? (
                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      ) : blueprint.diagnostics.piiScan.status === 'FAILED' ? (
                        <ShieldAlert size={14} className="text-red-500 shrink-0" />
                      ) : (
                        <RefreshCw size={14} className={`text-slate-500 shrink-0 ${blueprint.diagnostics.piiScan.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                      )}
                      <div>
                        <p className="text-[9px] font-black text-slate-300">Escaneo PII</p>
                        <p className="text-[8px] text-slate-500 font-mono">{blueprint.diagnostics.piiScan.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                      {blueprint.diagnostics.secretsScan.status === 'PASSED' ? (
                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      ) : blueprint.diagnostics.secretsScan.status === 'FAILED' ? (
                        <ShieldAlert size={14} className="text-red-500 shrink-0" />
                      ) : (
                        <RefreshCw size={14} className={`text-slate-500 shrink-0 ${blueprint.diagnostics.secretsScan.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                      )}
                      <div>
                        <p className="text-[9px] font-black text-slate-300">Secretos y API Keys</p>
                        <p className="text-[8px] text-slate-500 font-mono">{blueprint.diagnostics.secretsScan.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
                      {blueprint.diagnostics.build.status === 'PASSED' ? (
                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      ) : blueprint.diagnostics.build.status === 'FAILED' ? (
                        <ShieldAlert size={14} className="text-red-500 shrink-0" />
                      ) : (
                        <RefreshCw size={14} className={`text-slate-500 shrink-0 ${blueprint.diagnostics.build.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                      )}
                      <div>
                        <p className="text-[9px] font-black text-slate-300">Build & Smoke Test</p>
                        <p className="text-[8px] text-slate-500 font-mono">{blueprint.diagnostics.build.status}</p>
                      </div>
                    </div>
                  </div>

                  {blueprint.diagnostics.errors.length > 0 && (
                    <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl space-y-1.5">
                      <p className="text-[9px] font-black uppercase text-red-400">⚠️ Errores de Validación Detectados:</p>
                      {blueprint.diagnostics.errors.map((err, idx) => (
                        <p key={idx} className="text-[9px] text-red-300/80 font-mono leading-tight">{err.step}: {err.message}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Consola SSE */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  <Terminal size={11} />
                  Consola de logs de validación
                </div>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[9px] text-slate-300 h-64 overflow-y-auto space-y-1 scrollbar-thin">
                  {logs.length === 0 ? (
                    <p className="text-slate-650 italic">Esperando inicialización de logs del orquestador...</p>
                  ) : (
                    logs.map((log, idx) => (
                      <p key={idx} className="leading-relaxed hover:bg-slate-900 px-1 rounded transition-colors whitespace-pre-wrap">{log}</p>
                    ))
                  )}
                  <div ref={consoleEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PUBLISH */}
          {step === 'PUBLISH' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">¡Verificación Exitosa!</h4>
                  <p className="text-[10px] text-emerald-300/80 mt-1 leading-relaxed">
                    La validación ha sido aprobada de forma limpia. Se han removido datos PII, auditado API keys confidenciales y la compilación es 100% libre de errores.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Operación</span>
                  <span className="text-[9px] font-mono bg-indigo-500/10 px-2 py-0.5 text-indigo-400 border border-indigo-500/20 rounded">PUBLISH_CANDIDATE</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                  Este paso copiará el Core de Staging a <strong>d:\PROTOTIPE\Prototipe-CLI\templates\{blueprint?.targetCoreKey}</strong>, registrándolo en estado <code>Inactivo</code> en la base de catálogo física del sistema.
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('PIPELINE')}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Ver Consola de Logs
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="py-2.5 px-5 bg-indigo-650 hover:bg-indigo-500 text-white !text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {loading ? <RefreshCw size={12} className="animate-spin" /> : <Package size={12} />}
                  Publicar en Catálogo (Inactivo)
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ACTIVATE */}
          {step === 'ACTIVATE' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Paso Crítico: Activación del Core</h4>
                  <p className="text-[10px] text-amber-300/80 mt-1 leading-relaxed">
                    La plantilla ha sido copiada con éxito en el CLI. Ahora se procederá a realizar su primera activación física, mapeándola en la carpeta de <strong>Plantillas Core</strong> del desarrollador, versionándola a <code>1.0.0</code> y haciéndola disponible en el Wizard global.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRollbackPublish}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-red-650/10 hover:bg-red-650/20 border border-red-500/25 text-red-500 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  Rollback Publicación
                </button>

                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white !text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                  Activar y Desplegar Core
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLETED */}
          {step === 'COMPLETED' && (
            <div className="space-y-4 text-center py-6">
              <div className="inline-flex p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 mb-2">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">¡Core Promocionado y Activo!</h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed">
                El Core <strong>{blueprint?.targetCoreKey}</strong> se ha desplegado con éxito en la versión <code>1.0.0</code>. Toda la documentación de gobernanza se ha sincronizado en <code>09_Modulos_Completos</code>.
              </p>

              <div className="pt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleRollbackActivate}
                  disabled={loading}
                  className="py-2.5 px-4 bg-red-650/10 hover:bg-red-650/20 border border-red-500/25 text-red-500 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  Deshacer Activación
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white !text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  Finalizar Promoción
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
