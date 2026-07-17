import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  Palette, 
  Layers, 
  X, 
  RefreshCw, 
  Play, 
  AlertCircle, 
  Trash2,
  CheckCircle,
  Activity,
  Lock,
  Eye,
  RotateCcw,
  StopCircle,
  ArrowUpRight
} from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import CorePromotionModal from './CorePromotionModal';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { CLI_URL } from '../../config';
import { PALETTE_CATALOG, SEASONAL_EVENT_CATALOG } from '../../constants/paletteCatalog';

// Conversión HSL -> Hex para los sliders de branding (H en grados 0-360, S/L en % 0-100)
function hslToHex(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function ClientLifecyclePanel({ 
  clientId, 
  clientData = {}, 
  dbInstance,
  onClose, 
  onSave, 
  showToast,
  isCrmClientCore = false,
  
  // DevOps y Drift Props
  driftData,
  driftLoading,
  onLoadDriftData,
  onSyncFile,
  onGitDiscard,
  onDeployClient,
  onRunBuildAudit,
  onSetupCors,
  buildAuditing,
  buildAuditResult,
  settingUpCors,
  corsAuditResult,
  syncingFile,
  gitDiscardingFile,
  setActiveDiffFile,
  setBulkSyncFiles,
  setIsBulkSyncModalOpen
}) {
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  // --- Estados de Configuración Operativa ---
  const [niche, setNiche] = useState(clientData.niche || 'retail_clothing');
  const [billingMode, setBillingMode] = useState(clientData.billingMode || 'percentage');
  const [comisionPorcentaje, setComisionPorcentaje] = useState(clientData.comisionPorcentaje !== undefined ? clientData.comisionPorcentaje : 1.5);
  const [montoFijoServicio, setMontoFijoServicio] = useState(clientData.montoFijoServicio !== undefined ? clientData.montoFijoServicio : 500);
  const [pagoMensualFijo, setPagoMensualFijo] = useState(clientData.pagoMensualFijo !== undefined ? clientData.pagoMensualFijo : 50000);
  const [setupFee, setSetupFee] = useState(clientData.setupFee !== undefined ? clientData.setupFee : 1500000);
  const [enableDianBilling, setEditEnableDianBilling] = useState(!!clientData.enableDianBilling);
  const [costoPorFacturaDian, setCostoPorFacturaDian] = useState(clientData.costoPorFacturaDian !== undefined ? clientData.costoPorFacturaDian : 150);
  
  // Estado de cuenta/instancia: active, suspended, offboarded
  const [status, setStatus] = useState(clientData.status || (clientData.deactivated ? 'suspended' : 'active'));
  const [deactivationReason, setDeactivationReason] = useState(clientData.deactivationReason || '');

  // Alerta administrativa remota
  const [alertActive, setAlertActive] = useState(!!clientData.sistemaAlerta?.active);
  const [alertType, setAlertType] = useState(clientData.sistemaAlerta?.type || 'info');
  const [alertTitle, setAlertTitle] = useState(clientData.sistemaAlerta?.title || '');
  const [alertMessage, setAlertMessage] = useState(clientData.sistemaAlerta?.message || '');
  const [alertDismissible, setAlertDismissible] = useState(clientData.sistemaAlerta?.dismissible !== undefined ? clientData.sistemaAlerta?.dismissible : true);

  // --- Estados de Paleta/Temporada remota (control en tiempo real, vía clientes_control) ---
  const [appearanceControlledByDashboard, setAppearanceControlledByDashboard] = useState(!!clientData.appearanceControlledByDashboard);
  const [dashboardTheme, setDashboardTheme] = useState(clientData.dashboardTheme || 'zafiro-moderno');
  const [dashboardSeasonalEvent, setDashboardSeasonalEvent] = useState(clientData.dashboardSeasonalEvent || 'none');
  const [savingAppearance, setSavingAppearance] = useState(false);

  // --- Estados de Branding ---
  const [primaryH, setPrimaryH] = useState(clientData.colors?.primaryH || 240);
  const [primaryS, setPrimaryS] = useState(clientData.colors?.primaryS || 70);
  const [primaryL, setPrimaryL] = useState(clientData.colors?.primaryL || 50);
  const [secondaryH, setSecondaryH] = useState(clientData.colors?.secondaryH || 340);
  const [secondaryS, setSecondaryS] = useState(clientData.colors?.secondaryS || 70);
  const [secondaryL, setSecondaryL] = useState(clientData.colors?.secondaryL || 50);

  // --- Estados de Features/Módulos ---
  const [registryFeatures, setRegistryFeatures] = useState([]);
  const [installedFeatures, setInstalledFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  useEffect(() => {
    fetchFeaturesAndLock();
  }, [clientId]);

  const fetchFeaturesAndLock = async () => {
    try {
      setFeaturesLoading(true);
      // 1. Obtener features del feature-registry
      const regRes = await fetch(`${CLI_URL}/api/feature-registry`);
      const regData = await regRes.json();
      if (regData.success) {
        setRegistryFeatures(regData.features || []);
      }

      // 2. Obtener features instaladas
      const driftRes = await fetch(`${CLI_URL}/api/project/drift?clientId=${encodeURIComponent(clientId)}`);
      const driftData = await driftRes.json();
      if (driftData.success && driftData.lockData?.featuresInstalled) {
        setInstalledFeatures(Object.keys(driftData.lockData.featuresInstalled));
      } else if (clientData.featuresEnabled) {
        setInstalledFeatures(clientData.featuresEnabled);
      }
    } catch (err) {
      console.error('Error al sincronizar features del cliente:', err);
    } finally {
      setFeaturesLoading(false);
    }
  };

  const handleToggleFeature = async (featureId, isInstalled) => {
    try {
      setFeaturesLoading(true);
      const action = isInstalled ? 'remove' : 'add';
      const res = await fetch(`${CLI_URL}/api/project/features/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, featureId })
      });
      const data = await res.json();
      if (data.success) {
        // Sincronizar en Firestore para la consola central SaaS
        if (dbInstance) {
          try {
            const clientDocRef = doc(dbInstance, 'clientes_control', clientId);
            await updateDoc(clientDocRef, {
              installedFeatures: isInstalled ? arrayRemove(featureId) : arrayUnion(featureId),
              [`flags.${featureId}`]: !isInstalled
            });
            console.log(`[Firestore Client Sync] Feature "${featureId}" actualizada exitosamente en Firestore.`);
          } catch (dbErr) {
            console.error('[Firestore Client Sync] Error al actualizar documento en Firestore:', dbErr.message);
          }
        }
        showToast(`Módulo "${featureId}" ${isInstalled ? 'desinstalado' : 'instalado'} con éxito de la instancia.`, 'success');
        fetchFeaturesAndLock();
      } else {
        showToast(data.error || 'Error al procesar la feature.', 'error');
      }
    } catch (err) {
      showToast(`Fallo en la comunicación con el Bridge: ${err.message}`, 'error');
    } finally {
      setFeaturesLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    if (!dbInstance) {
      showToast('No hay conexión con Firestore Central.', 'error');
      return;
    }
    try {
      setSavingAppearance(true);
      // Escritura directa a clientes_control (mismo patrón que handleToggleFeature):
      // este panel mantiene su propio estado local de niche/billingMode/etc. que NO
      // se refleja al guardar vía el prop onSave (ese lee variables "editX" aparte,
      // gestionadas en App.jsx desde la apertura del modal). Para no heredar esa
      // desconexión, la apariencia remota se persiste aquí mismo, directo.
      const clientDocRef = doc(dbInstance, 'clientes_control', clientId);
      await updateDoc(clientDocRef, {
        appearanceControlledByDashboard,
        dashboardTheme,
        dashboardSeasonalEvent
      });
      showToast(
        appearanceControlledByDashboard
          ? 'Paleta y temporada del cliente controladas desde el dashboard.'
          : 'Control remoto de apariencia desactivado. La app del cliente vuelve a decidir su paleta localmente.',
        'success'
      );
    } catch (err) {
      showToast(`Error al guardar la apariencia remota: ${err.message}`, 'error');
    } finally {
      setSavingAppearance(false);
    }
  };

  const DEFAULT_PRIMARY_HSL = { h: 240, s: 70, l: 50 };
  const DEFAULT_SECONDARY_HSL = { h: 340, s: 70, l: 50 };

  const handleResetBrandingDefaults = () => {
    setPrimaryH(DEFAULT_PRIMARY_HSL.h);
    setPrimaryS(DEFAULT_PRIMARY_HSL.s);
    setPrimaryL(DEFAULT_PRIMARY_HSL.l);
    setSecondaryH(DEFAULT_SECONDARY_HSL.h);
    setSecondaryS(DEFAULT_SECONDARY_HSL.s);
    setSecondaryL(DEFAULT_SECONDARY_HSL.l);
  };

  const handleSaveBranding = async () => {
    // Nota (2026-07-16): este botón antes solo escribía VITE_COLOR_* en
    // .env.local vía el Bridge del CLI — nada en el código de App Ventas lee
    // esas variables (verificado por búsqueda: 0 resultados), así que los
    // sliders HSL nunca surtían efecto real. Se reemplaza por escritura
    // directa a clientes_control (mismo patrón que handleSaveAppearance /
    // handleToggleFeature), reutilizando el canal en tiempo real ya
    // construido: primario/secundario se convierten a hex y se guardan como
    // un tema personalizado plano, sin pasar por el prop onSave/editX roto.
    if (!dbInstance) {
      showToast('No hay conexión con Firestore Central.', 'error');
      return;
    }
    try {
      setLoading(true);
      const primaryHex = hslToHex(primaryH, primaryS, primaryL);
      const secondaryHex = hslToHex(secondaryH, secondaryS, secondaryL);
      const clientDocRef = doc(dbInstance, 'clientes_control', clientId);
      await updateDoc(clientDocRef, {
        appearanceControlledByDashboard: true,
        dashboardTheme: { primary: primaryHex, secondary: secondaryHex, accent: secondaryHex }
      });
      setAppearanceControlledByDashboard(true);
      showToast('Paleta HSL aplicada en tiempo real a la app del cliente.', 'success');
    } catch (err) {
      showToast(`Error al guardar branding: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      
      const statusRes = await fetch(`${CLI_URL}/api/project/status/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, status })
      });
      const statusData = await statusRes.json();
      if (!statusData.success) {
        showToast(statusData.error || 'Error al actualizar el estado físico.', 'error');
      }

      const updatedData = {
        niche,
        billingMode,
        comisionPorcentaje,
        montoFijoServicio,
        pagoMensualFijo,
        setupFee,
        enableDianBilling,
        costoPorFacturaDian,
        status,
        deactivated: status === 'suspended',
        deactivationReason: status === 'suspended' ? deactivationReason : '',
        sistemaAlerta: {
          active: alertActive,
          type: alertType,
          title: alertTitle,
          message: alertMessage,
          dismissible: alertDismissible
        },
        colors: {
          primaryH,
          primaryS,
          primaryL,
          secondaryH,
          secondaryS,
          secondaryL
        }
      };

      onSave(clientId, updatedData);
    } catch (err) {
      showToast(`Error al guardar configuración: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Cabecera del Panel */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-black flex items-center justify-center text-xs border border-[var(--color-primary)]/20">
              <Users size={16} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-[var(--color-text)]">
                {isCrmClientCore ? `Gestionar Ecosistema Core: ${clientId}` : `Gestionar Cliente: ${clientId}`}
              </h3>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Control de branding, módulos instalados y estados de cuenta SaaS.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="flex border-b border-[var(--color-border)] gap-6 text-xs font-bold shrink-0">
          <button 
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'config' 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' 
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Settings size={13} />
            Configuración Operativa
          </button>
          
          {!isCrmClientCore && (
            <>
              <button 
                onClick={() => setActiveTab('branding')}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'branding' 
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' 
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Palette size={13} />
                Identidad &amp; Branding
              </button>
              <button 
                onClick={() => setActiveTab('features')}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'features' 
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' 
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <Layers size={13} />
                Módulos Habilitados
              </button>
            </>
          )}

          <button 
            onClick={() => {
              setActiveTab('drift');
              onLoadDriftData(clientId);
            }}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drift' 
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' 
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <RefreshCw size={13} />
            Sincronización Core (Drift)
          </button>
        </div>

        {/* Contenido según Pestaña */}
        <div className="py-2">
          
          {/* 1. CONFIGURACIÓN OPERATIVA */}
          {activeTab === 'config' && (
            <div className="space-y-4 tab-content-enter">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Nicho de Mercado / Vertical de Negocio</label>
                  <CustomSelect 
                    value={niche} 
                    onChange={setNiche}
                    options={[
                      { value: "retail_clothing", label: "🛍️ Ropa y Retail Tradicional" },
                      { value: "technical_services", label: "⚙️ Tornerías y Mecanizado de Precisión" },
                      { value: "refrigeration_ac", label: "❄️ Refrigeración y Climatización" },
                      { value: "contractors", label: "📐 Contratistas y Construcción" },
                      { value: "machinery_rental", label: "🚜 Alquiler de Maquinaria" },
                      { value: "carpentry", label: "🪚 Carpinterías y Muebles" },
                      { value: "laundry", label: "🧺 Lavanderías y Tintorerías" },
                      { value: "furniture_repair", label: "🛋️ Restauración y Tapicería" },
                      { value: "wellness_podology", label: "💆 Estética, Podología y Bienestar" },
                      { value: "grocery_food", label: "🍎 Minimarkets y Alimentos" },
                      { value: "insumos-agricolas", label: "🚜 Insumos y Repuestos Agrícolas" },
                      { value: "alimentos-artesanales", label: "🎂 Alimentos Artesanales" },
                      { value: "ferreteria-rural", label: "🛠️ Ferretería y Construcción Rural" },
                      { value: "repuestos-motos", label: "🏍️ Repuestos Motos" },
                      { value: "distribuidoras-beauty", label: "💅 Distribuidoras Belleza" },
                      { value: "petshops-locales", label: "🐶 Petshops Locales" },
                      { value: "repuestos-lineablanca", label: "⚙️ Repuestos Línea Blanca" },
                      { value: "moda-local-calzado", label: "👞 Moda y Calzado" },
                      { value: "alimentacion-saludable", label: "🥗 Alimentación Saludable" },
                      { value: "home-office-ergonomia", label: "💻 Home Office/Ergonomía" },
                      { value: "licores-cocteleria", label: "🍹 Licores y Coctelería" },
                      { value: "coleccionismo-geek", label: "🧸 Coleccionismo Geek" },
                      { value: "distribucion-horeca", label: "📦 Distribución Horeca B2B" }
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Estado Administrativo SaaS</label>
                  <CustomSelect 
                    value={status} 
                    onChange={setStatus}
                    options={[
                      { value: "active", label: "🟢 Activo y Operacional" },
                      { value: "pending_provisioning", label: "🟡 Aprovisionamiento Pendiente" },
                      { value: "pending_update", label: "🔵 Actualización Pendiente" },
                      { value: "suspended", label: "🔴 Suspendido / Falta de Pago" },
                      { value: "offboarded", label: "⚪ Inactivo / Dado de Baja" }
                    ]}
                  />
                </div>
              </div>

              {status === 'suspended' && (
                <div className="space-y-1.5 animate-fade-in pl-4 border-l border-red-500/30">
                  <label className="text-[10px] font-bold text-red-400 block uppercase tracking-wider">Motivo de Suspensión</label>
                  <textarea 
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    placeholder="Tu cuenta ha sido suspendida temporalmente por falta de pago..."
                    className="bg-[var(--color-surface-2)]/30 border border-red-500/20 rounded-xl px-3 py-2 text-xs w-full h-16 text-[var(--color-text)] outline-none focus:border-red-500 resize-none font-sans"
                  />
                </div>
              )}

              <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Modelo de Cobro Base</label>
                    <CustomSelect
                      value={billingMode}
                      onChange={setBillingMode}
                      options={[
                        { value: "percentage", label: "Porcentaje sobre Ventas (%)" },
                        { value: "fixed_per_service", label: "Monto Fijo por Servicio" },
                        { value: "flat_monthly", label: "Pago Mensual Fijo" }
                      ]}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">Costo de Setup Inicial ($ COP)</label>
                    <input 
                      type="number" 
                      value={setupFee} 
                      onChange={(e) => setSetupFee(parseInt(e.target.value) || 0)}
                      className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9"
                    />
                  </div>
                </div>

                {billingMode === 'percentage' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">Tasa de Comisión (%)</label>
                    <input 
                      type="number" 
                      value={comisionPorcentaje} 
                      onChange={(e) => setComisionPorcentaje(parseFloat(e.target.value) || 0)}
                      className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9"
                      step="0.1"
                    />
                  </div>
                )}

                {billingMode === 'fixed_per_service' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">Monto Fijo por Servicio ($ COP)</label>
                    <input 
                      type="number" 
                      value={montoFijoServicio} 
                      onChange={(e) => setMontoFijoServicio(parseInt(e.target.value) || 0)}
                      className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9"
                    />
                  </div>
                )}

                {billingMode === 'flat_monthly' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">Pago Mensual Fijo ($ COP)</label>
                    <input 
                      type="number" 
                      value={pagoMensualFijo} 
                      onChange={(e) => setPagoMensualFijo(parseInt(e.target.value) || 0)}
                      className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                  <input 
                    type="checkbox" 
                    checked={alertActive} 
                    onChange={(e) => setAlertActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--color-primary)] bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                  />
                  Habilitar Alerta Remota / Aviso de Bloqueo Administrativo
                </label>

                {alertActive && (
                  <div className="space-y-3 animate-fade-in pl-6 border-l border-[var(--color-primary)]/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">Tipo de Alerta</label>
                        <CustomSelect
                          value={alertType}
                          onChange={setAlertType}
                          options={[
                            { value: "info", label: "Información (Azul)" },
                            { value: "warning", label: "Advertencia (Naranja)" },
                            { value: "error", label: "Error / Bloqueante (Rojo)" }
                          ]}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">Título del Aviso</label>
                        <input 
                          type="text" 
                          value={alertTitle} 
                          onChange={(e) => setAlertTitle(e.target.value)}
                          placeholder="Ej: Mantenimiento de Servidores"
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block uppercase tracking-wider">Mensaje del Aviso</label>
                      <textarea 
                        value={alertMessage} 
                        onChange={(e) => setAlertMessage(e.target.value)}
                        placeholder="Ingresa el texto que visualizará el usuario..."
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full h-16 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] resize-none font-sans"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Guardado */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                <button 
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <RefreshCw size={12} className="animate-spin" />}
                  Guardar Configuración
                </button>
              </div>

            </div>
          )}

          {/* 2. IDENTIDAD Y BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-5 tab-content-enter">
              
              <div className="p-4 bg-indigo-950/5 border border-indigo-500/10 rounded-2xl">
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Configura la paleta de colores HSL del cliente. Al guardar, el Bridge re-escribirá el `.env.local` y los tokens cromáticos en caliente.
                </p>
              </div>

              {/* Control remoto de Paleta y Temporada — independiente de los sliders HSL de abajo */}
              <div className="p-4 bg-violet-950/5 border border-violet-500/15 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[var(--color-text)] flex items-center gap-1.5">
                      <Palette size={13} className="text-violet-400" />
                      Paleta y Temporada (Tiempo Real)
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
                      A diferencia de los sliders HSL (requieren recompilar), esto se sincroniza al instante
                      con las Opciones de Desarrollador de la app del cliente, sin redeploy. Si lo activas,
                      la selección local del cliente queda bloqueada con el aviso "Configurado desde el dashboard".
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-[var(--color-text-muted)] select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={appearanceControlledByDashboard}
                      onChange={(e) => setAppearanceControlledByDashboard(e.target.checked)}
                      className="w-4 h-4 rounded accent-violet-500 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                    />
                    Controlar desde el Dashboard
                  </label>
                </div>

                {appearanceControlledByDashboard && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in pl-4 border-l border-violet-500/20">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Paleta de la Tienda</label>
                      <CustomSelect
                        value={dashboardTheme}
                        onChange={setDashboardTheme}
                        options={PALETTE_CATALOG.map(p => ({ value: p.id, label: `${p.name} — ${p.category}` }))}
                      />
                      <div className="flex gap-1.5 pt-1">
                        {(() => {
                          const p = PALETTE_CATALOG.find(x => x.id === dashboardTheme);
                          if (!p) return null;
                          return [p.primary, p.secondary, p.accent].map((c, i) => (
                            <span key={i} className="w-5 h-5 rounded-full border border-[var(--color-border)] shadow-sm shrink-0" style={{ backgroundColor: c }} />
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Evento de Temporada</label>
                      <CustomSelect
                        value={dashboardSeasonalEvent}
                        onChange={setDashboardSeasonalEvent}
                        options={SEASONAL_EVENT_CATALOG.map(s => ({ value: s.id, label: s.name }))}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1 border-t border-[var(--color-border)]/50 -mx-4 -mb-4 px-4 pb-4 pt-3">
                  <button
                    onClick={handleSaveAppearance}
                    disabled={savingAppearance}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingAppearance && <RefreshCw size={12} className="animate-spin" />}
                    Guardar Apariencia Remota
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)]/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `hsl(${primaryH}, ${primaryS}%, ${primaryL}%)` }} />
                    Color Primario (Primary HSL)
                  </span>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-black">
                        <span>HUE (Matiz)</span>
                        <span>{primaryH}°</span>
                      </div>
                      <input type="range" min="0" max="360" value={primaryH} onChange={e => setPrimaryH(Number(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-black">
                        <span>SATURATION (Saturación)</span>
                        <span>{primaryS}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={primaryS} onChange={e => setPrimaryS(Number(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-black">
                        <span>LIGHTNESS (Luminosidad)</span>
                        <span>{primaryL}%</span>
                      </div>
                      <input type="range" min="15" max="85" value={primaryL} onChange={e => setPrimaryL(Number(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)]/50 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `hsl(${secondaryH}, ${secondaryS}%, ${secondaryL}%)` }} />
                    Color Secundario (Secondary HSL)
                  </span>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-black">
                        <span>HUE (Matiz)</span>
                        <span>{secondaryH}°</span>
                      </div>
                      <input type="range" min="0" max="360" value={secondaryH} onChange={e => setSecondaryH(Number(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-black">
                        <span>SATURATION (Saturación)</span>
                        <span>{secondaryS}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={secondaryS} onChange={e => setSecondaryS(Number(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-black">
                        <span>LIGHTNESS (Luminosidad)</span>
                        <span>{secondaryL}%</span>
                      </div>
                      <input type="range" min="15" max="85" value={secondaryL} onChange={e => setSecondaryL(Number(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                <button
                  onClick={handleResetBrandingDefaults}
                  disabled={loading}
                  className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw size={12} />
                  Volver a Valor Predeterminado
                </button>
                <button
                  onClick={handleSaveBranding}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <RefreshCw size={12} className="animate-spin" />}
                  Propagar Branding en Caliente
                </button>
              </div>

            </div>
          )}

          {/* 3. GESTIÓN DE FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-4 tab-content-enter">
              
              <div className="p-4 bg-indigo-950/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Activa o desactiva módulos funcionales para este cliente. La inyección de código se realiza en tiempo real usando el FeatureRegistry.
                </p>
                <button 
                  onClick={fetchFeaturesAndLock}
                  className="p-1 text-[var(--color-primary)] hover:text-indigo-400 cursor-pointer"
                  title="Recargar estado físico"
                >
                  <RefreshCw size={14} className={featuresLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {featuresLoading && registryFeatures.length === 0 ? (
                <div className="flex items-center justify-center py-12 gap-2 text-xs text-[var(--color-text-muted)] italic">
                  <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  Sincronizando estado con el Bridge...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {registryFeatures.map(feat => {
                    const isInstalled = installedFeatures.includes(feat.id);
                    return (
                      <div 
                        key={feat.id}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all duration-200 ${
                          isInstalled
                            ? 'bg-indigo-600/10 border-indigo-500/40 shadow-sm'
                            : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)]/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--color-text)] truncate">{feat.displayName}</span>
                            <span className="text-[8px] font-mono text-[var(--color-text-muted)]">v{feat.version}</span>
                          </div>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-tight">
                            {feat.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={featuresLoading}
                          onClick={() => handleToggleFeature(feat.id, isInstalled)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                            isInstalled
                              ? 'bg-red-500/10 text-red-500 border-red-500/25 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/20'
                          }`}
                          title={isInstalled ? 'Desinstalar módulo' : 'Instalar módulo'}
                        >
                          {isInstalled ? <Trash2 size={12} /> : <Play size={12} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* 4. SINCRONIZACIÓN Y DEVOPS (DRIFT) */}
          {activeTab === 'drift' && (
            <div className="space-y-4 tab-content-enter">
              {driftLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <RefreshCw size={24} className="animate-spin text-indigo-500" />
                  <span className="text-xs text-[var(--color-text-muted)] italic">Analizando desviación respecto al Core...</span>
                </div>
              ) : driftData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const filesMap = {};
                        driftData.differences.forEach(diff => {
                          filesMap[diff.file] = true;
                        });
                        setBulkSyncFiles(filesMap);
                        setIsBulkSyncModalOpen(true);
                      }}
                      disabled={driftData.differences.length === 0}
                      className="py-2 bg-indigo-650/10 hover:bg-indigo-650/20 border border-indigo-500/25 text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <RefreshCw size={11} />
                      Sincronizar Lote
                    </button>

                    <button
                      type="button"
                      onClick={() => onGitDiscard(clientId.toLowerCase(), null, true)}
                      disabled={driftData.differences.length === 0 || gitDiscardingFile === 'all'}
                      className="py-2 bg-red-650/10 hover:bg-red-650/20 border border-red-500/25 text-red-500 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <RotateCcw size={11} />
                      Limpiar Git
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeployClient(clientId, false)}
                      className="py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <Activity size={11} />
                      Deploy Host
                    </button>

                    <button
                      type="button"
                      onClick={() => onRunBuildAudit(clientId)}
                      disabled={buildAuditing}
                      className="py-2 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/25 text-amber-400 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      {buildAuditing ? <RefreshCw size={11} className="animate-spin" /> : <Activity size={11} />}
                      Auditar Build
                    </button>
                  </div>

                  {buildAuditResult && (
                    <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resultado de Compilación Vite</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                          buildAuditResult.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {buildAuditResult.status === 'success' ? 'COMPILADO' : 'ERRÓNEO'}
                        </span>
                      </div>
                      <pre className="text-[9px] font-mono text-slate-300 overflow-x-auto max-h-36 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 whitespace-pre-wrap">
                        {buildAuditResult.output}
                      </pre>
                    </div>
                  )}

                  {driftData.dependencyDetails && (
                    <div className="p-3 bg-[var(--color-surface-2)]/20 border border-[var(--color-border)]/60 rounded-xl space-y-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Desviación de Dependencias (NPM Drift)</p>
                      
                      {driftData.dependencyDetails.missingDeps?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-amber-400">⚠️ Faltan en el Cliente (Requeridas por el Core):</p>
                          <div className="flex flex-wrap gap-1">
                            {driftData.dependencyDetails.missingDeps.map(dep => (
                              <span key={dep} className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-mono rounded border border-amber-500/20">{dep}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {driftData.dependencyDetails.mismatchDeps?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-amber-400">✏️ Versiones Desalineadas:</p>
                          <div className="grid grid-cols-1 gap-1">
                            {driftData.dependencyDetails.mismatchDeps.map(dep => (
                              <div key={dep.name} className="flex items-center justify-between text-[9px] font-mono px-2 py-1 bg-slate-950/40 rounded border border-slate-850">
                                <span className="text-[var(--color-text-muted)]">{dep.name}</span>
                                <span className="text-amber-400">{dep.clientVersion} <span className="text-slate-500 font-sans">vs</span> {dep.coreVersion} (Core)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!driftData.dependenciesOutOfSync ? (
                        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle size={11} /> Dependencias 100% alineadas con el Core.
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]/40 mt-1">
                          <button
                            type="button"
                            onClick={() => onSyncFile(clientId, 'package.json')}
                            disabled={syncingFile['package.json']}
                            className="h-6 px-2.5 bg-indigo-650/10 hover:bg-indigo-650/20 border border-indigo-500/25 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {syncingFile['package.json'] && <RefreshCw size={9} className="animate-spin" />}
                            Alinear package.json
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                    {driftData.differences.length === 0 ? (
                      <div className="text-center py-10 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                          <CheckCircle size={14} />
                          ¡Código 100% Alineado!
                        </p>
                        <p className="text-[10px] text-emerald-300/60 mt-1">Esta instancia de cliente no presenta desviaciones físicas con el Core.</p>
                      </div>
                    ) : (
                      driftData.differences.map((diff, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-surface-2)]/10 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-2)]/20 transition-all">
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-mono font-bold text-[var(--color-text)] break-all">{diff.file}</p>
                            <p className="text-[9px] text-[var(--color-text-muted)]">
                              {diff.status === 'missing_in_client' ? '⚠️ Archivo ausente en cliente' : '✏️ Archivo modificado/desviado'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {diff.status === 'modified' && (
                              <>
                                <button
                                  onClick={() => onGitDiscard(clientId.toLowerCase(), diff.file)}
                                  disabled={gitDiscardingFile === diff.file}
                                  className="h-6 px-1.5 bg-red-650/10 hover:bg-red-650/20 text-red-500 rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 border border-red-500/10"
                                >
                                  <RotateCcw size={10} className={gitDiscardingFile === diff.file ? 'animate-spin' : ''} />
                                  Deshacer
                                </button>
                                <button
                                  onClick={() => setActiveDiffFile(diff)}
                                  className="h-6 px-2 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg text-[9px] font-bold cursor-pointer"
                                >
                                  Diff Core
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => onSyncFile(clientId, diff.file)}
                              disabled={syncingFile[diff.file]}
                              className="h-6 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              {syncingFile[diff.file] ? <RefreshCw size={8} className="animate-spin" /> : <RefreshCw size={8} />}
                              Sincronizar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tarjeta del Pipeline de Promoción a Core */}
                  <div className="mt-4 p-4 bg-gradient-to-br from-indigo-950/30 to-slate-900/50 border border-indigo-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-400">Pipeline de Promoción a Core</h4>
                        <p className="text-[9px] text-[var(--color-text-muted)] max-w-sm">Extrae, sanitiza, valida y publica esta instancia de cliente como una nueva plantilla Core en el monorepo.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPromotionModalOpen(true)}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white !text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <ArrowUpRight size={13} />
                        Promocionar Instancia
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic text-center py-6">Selecciona cargar desviación para comparar archivos.</p>
              )}

              <CorePromotionModal
                isOpen={isPromotionModalOpen}
                onClose={() => setIsPromotionModalOpen(false)}
                clientId={clientId}
                nicho={niche}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
