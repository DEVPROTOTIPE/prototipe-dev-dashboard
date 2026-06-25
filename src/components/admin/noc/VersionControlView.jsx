import React, { useState, useMemo } from 'react';
import { useNocStore } from '../../../stores/nocStore';
import { useDevStore } from '../../../stores/devStore';
import { useAuthStore } from '../../../stores/authStore';
import useToast from '../../../hooks/useToast';
import { 
  GitCommit, CheckCircle, AlertCircle, RefreshCw, Plus, Clock, Cpu, ArrowUpRight 
} from 'lucide-react';

export default function VersionControlView() {
  const { user } = useAuthStore();
  const { clientesSaas } = useDevStore();
  const { versions, publishCoreRelease } = useNocStore();
  const { showToast } = useToast();

  const [newVersion, setNewVersion] = useState('');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Obtener la última versión estable oficial
  const stableVersion = useMemo(() => {
    const stableRelease = versions.find(v => v.stable);
    return stableRelease ? stableRelease.version : '1.0.1';
  }, [versions]);

  // 2. Clasificar clientes por versión
  const fleetVersions = useMemo(() => {
    return clientesSaas.map(client => {
      const installed = client.tecnico?.versionCore || '1.0.0';
      const isOutdated = installed !== stableVersion;
      return {
        ...client,
        installedVersion: installed,
        isOutdated
      };
    });
  }, [clientesSaas, stableVersion]);

  // 3. Clientes desactualizados count
  const outdatedCount = useMemo(() => {
    return fleetVersions.filter(c => c.isOutdated).length;
  }, [fleetVersions]);

  const handlePublishRelease = async (e) => {
    e.preventDefault();
    if (!newVersion || !description) {
      showToast('Por favor completa todos los campos.', { type: 'error' });
      return;
    }
    setActionLoading(true);
    try {
      await publishCoreRelease(newVersion, description, user);
      showToast(`Nueva release v${newVersion} publicada.`, { type: 'success' });
      setNewVersion('');
      setDescription('');
    } catch (err) {
      console.error(err);
      showToast('Error al publicar el release.', { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 tab-content-enter select-none text-left">
      
      {/* ===== BLOQUE SUPERIOR: RELEASE FORM & STATUS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Release Form (7 columnas) */}
        <form 
          onSubmit={handlePublishRelease}
          className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4"
        >
          <div>
            <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
              <Plus size={14} />
              Publicar Nueva Versión del Core (Release)
            </h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Registra una nueva actualización en el repositorio central de cores.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Versión (SemVer)</label>
              <input
                type="text"
                placeholder="Ej. 1.0.2"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                className="w-full bg-[var(--color-surface-2)]/65 border border-[var(--color-border)]/60 rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 placeholder:text-slate-650"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">Notas de Release</label>
              <input
                type="text"
                placeholder="Ej. Corrección de telemetría y performance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[var(--color-surface-2)]/65 border border-[var(--color-border)]/60 rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-indigo-500 placeholder:text-slate-650"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <GitCommit size={14} />
            Publicar Core Release
          </button>
        </form>

        {/* Stable Status (5 columnas) */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-violet-650/10 to-indigo-650/10 border border-violet-500/20 p-5 rounded-2xl flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase text-violet-400 tracking-widest flex items-center gap-1.5">
              <GitCommit size={14} className="animate-pulse" />
              Versión Estable Actual
            </h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">v{stableVersion}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-violet-500/20 border border-violet-500/30 px-1.5 py-0.5 rounded-md">
                RELEASED
              </span>
            </div>
          </div>

          <div className="border-t border-violet-500/10 pt-4 flex justify-between items-center text-xs">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Flota Desactualizada</span>
              <span className={`font-black font-mono ${outdatedCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{outdatedCount} instancias</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Cores homologados</span>
          </div>
        </div>

      </div>

      {/* ===== INSTANCIAS DE FLOTA ===== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4 text-left">
        <div>
          <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
            <RefreshCw size={14} />
            Control de Versiones de Clientes (Fleet Status)
          </h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Comparación de la versión instalada en cada cliente respecto a la versión oficial homologada.</p>
        </div>

        <div className="space-y-2">
          {fleetVersions.map(client => (
            <div 
              key={client.id}
              className="p-3 bg-slate-950/45 border border-slate-900 rounded-xl text-xs flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="font-black text-slate-300 uppercase block">🏢 {client.nombre}</span>
                <span className="text-[9px] text-slate-550 text-slate-500 block font-mono">ID: {client.id}</span>
              </div>

              <div className="flex items-center gap-6 font-mono text-[10px]">
                <div className="text-right">
                  <span className="text-slate-500 block text-[8px] font-black uppercase tracking-wider">Versión</span>
                  <span className="font-bold text-slate-300">v{client.installedVersion}</span>
                </div>

                <div className="w-28 text-right">
                  {client.isOutdated ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black tracking-wide uppercase text-[8.5px]">
                      ⚠️ Actualizar
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black tracking-wide uppercase text-[8.5px]">
                      ✓ Al Día
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== HISTORIAL DE RELEASES ===== */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm space-y-4 text-left">
        <div>
          <h3 className="font-black text-xs uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
            <Clock size={14} />
            Historial de Releases del Core
          </h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-medium">Registro cronológico de las versiones publicadas en el ecosistema.</p>
        </div>

        <div className="space-y-4 font-mono text-[10px]">
          {versions.map((ver, idx) => (
            <div key={ver.id || idx} className="flex gap-4 border-l-2 border-indigo-500/20 pl-4 py-0.5 relative">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900" />
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-350 text-indigo-400 text-xs">v{ver.version}</span>
                  <span className="text-slate-500">{ver.releaseDate}</span>
                  {ver.stable && (
                    <span className="px-1 py-0.25 bg-emerald-500/15 text-emerald-450 border border-emerald-500/25 text-[7px] font-black rounded uppercase">
                      Estable
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[10px] font-sans">{ver.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
