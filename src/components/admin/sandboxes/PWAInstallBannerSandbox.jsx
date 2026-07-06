import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { Smartphone, Download, Share, PlusSquare, ArrowUp, X, Check } from 'lucide-react';

export default function PWAInstallBannerSandbox() {
  const [platform, setPlatform] = useState('android'); // 'android' | 'ios'
  const [showBanner, setShowBanner] = useState(true);
  const [installed, setInstalled] = useState(false);

  const handleInstall = () => {
    setInstalled(true);
    setTimeout(() => {
      setInstalled(false);
      setShowBanner(true);
    }, 3000);
  };

  return (
    <SandboxLayout
      title="Banner de Instalación PWA (PWAInstallBanner)"
      description="Visualiza e interactúa con el banner responsivo flotante de inducción de instalación de la aplicación web progresiva (PWA) optimizado para sistemas operativos móviles."
    >
      <div className="space-y-4 max-w-lg mx-auto bg-surface border border-app rounded-3xl p-6 shadow-xl relative min-h-[300px] flex flex-col justify-between">
        
        {/* Controles de prueba */}
        <div className="flex items-center justify-between border-b border-app pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text)]">Plataforma Simulada</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setPlatform('android'); setInstalled(false); }}
              className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                platform === 'android' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-surface-2 hover:bg-surface-3 text-[var(--color-text-muted)]'
              }`}
            >
              Android (Chrome)
            </button>
            <button
              onClick={() => { setPlatform('ios'); setInstalled(false); }}
              className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                platform === 'ios' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-surface-2 hover:bg-surface-3 text-[var(--color-text-muted)]'
              }`}
            >
              iOS (Safari)
            </button>
            {!showBanner && !installed && (
              <button
                onClick={() => setShowBanner(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700/60 text-slate-300 text-[9px] font-black uppercase tracking-wider cursor-pointer"
              >
                Re-abrir
              </button>
            )}
          </div>
        </div>

        {/* Demo Central */}
        <div className="py-6 text-center text-[10px] text-[var(--color-text-muted)] font-mono leading-relaxed">
          {installed ? (
            <div className="flex flex-col items-center gap-2 text-emerald-400 animate-pulse">
              <Check size={24} />
              <p className="font-bold uppercase tracking-wider">¡Instalación Simulada con Éxito!</p>
            </div>
          ) : (
            <p>
              [Simulador de PWA]<br />
              {platform === 'android'
                ? 'Se intercepta el evento \'beforeinstallprompt\' nativo para desplegar el banner de un toque.'
                : 'Safari no soporta instalación directa programática; se instruye al usuario a usar el menú de compartir.'}
            </p>
          )}
        </div>

        {/* Renderizado de Banner Condicional */}
        {showBanner && !installed && (
          <div className="bg-surface-2 border border-indigo-500/20 rounded-2xl p-4 shadow-lg animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Smartphone size={18} />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-[11px] font-bold text-[var(--color-text)]">Instalar Aplicación</h4>
                <p className="text-[9px] text-[var(--color-text-muted)] leading-tight">
                  {platform === 'android'
                    ? 'Accede más rápido, ahorra datos y opera offline desde tu pantalla de inicio.'
                    : 'Añade la app a tu pantalla: presiona Compartir y luego \'Añadir a pantalla de inicio\'.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-app/60 pt-2.5 sm:pt-0 shrink-0">
              {platform === 'android' ? (
                <button
                  onClick={handleInstall}
                  className="px-3.5 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Download size={11} />
                  Instalar
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[9px] font-bold">
                  <Share size={11} />
                  <PlusSquare size={11} />
                  <span>Compartir → Agregar</span>
                </div>
              )}
              <button
                onClick={() => setShowBanner(false)}
                className="w-7 h-7 rounded-lg bg-surface hover:bg-surface-3 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors border border-app cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
