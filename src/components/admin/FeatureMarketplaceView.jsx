import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  Layers, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Box, 
  Cpu, 
  RefreshCw, 
  Check,
  Plus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Copy,
  Code,
  Shield,
  Database,
  Terminal,
  Loader2
} from 'lucide-react';
import { CLI_URL } from '../../config';

export default function FeatureMarketplaceView({ clientesSaas = [] }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Estados del Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    featureId: '',
    displayName: '',
    category: 'commerce',
    version: '1.0.0',
    description: '',
    compatibleIndustries: [],
    dependencies: [],
    npmDependencies: {},
    navigation: {
      adminMenu: { label: '', path: '', icon: 'Layers' },
      clientMenu: { label: '', path: '' }
    },
    firestore: {
      path: '',
      readPermissions: ['client', 'vendedor'],
      createPermissions: ['client'],
      updatePermissions: ['vendedor'],
      deletePermissions: [],
      requiredFields: ['createdAt']
    }
  });

  const [cliToken, setCliToken] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannedData, setPlannedData] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Lista de categorías estáticas para el formulario
  const categoriesList = ['commerce', 'pos', 'inventory', 'auth', 'marketing', 'support', 'finance'];

  // Lista de verticales de Prototype
  const industriesList = [
    'retail_clothing', 'grocery_food', 'machinery_rental', 'technical_services',
    'wellness_podology', 'laundry', 'distribuidoras-beauty', 'petshops-locales'
  ];

  useEffect(() => {
    fetchFeatures();
    fetchSecurityToken();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CLI_URL}/api/feature-registry`);
      const data = await res.json();
      if (data.success) {
        setFeatures(data.features || []);
        if (data.features?.length > 0) {
          setSelectedFeature(data.features[0]);
        }
      }
    } catch (err) {
      console.error('Error al cargar Feature Registry:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityToken = async () => {
    try {
      const res = await fetch(`${CLI_URL}/api/project/features/token`);
      const data = await res.json();
      if (data.token) {
        setCliToken(data.token);
      }
    } catch (err) {
      console.warn('[Dashboard] No se pudo obtener token de seguridad loopback:', err.message);
    }
  };

  // Obtener categorías únicas del registro
  const categories = ['all', ...new Set(features.map(f => f.category))];

  // Filtrar features
  const filteredFeatures = features.filter(feat => {
    const matchesSearch = 
      feat.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || feat.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getClientsUsingFeature = (featureId) => {
    return clientesSaas.filter(client => 
      client.featuresEnabled?.includes(featureId) || 
      client.activeFeatures?.includes(featureId)
    );
  };

  // Generador de Prompt de Implementación Maestro Hidratado
  const generateMaestroPrompt = () => {
    const pascalName = wizardForm.featureId
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    return `PROMPT DE IMPLEMENTACIÓN MAESTRO (FEATURE PORTABLE)
===================================================
Vertical/Nicho: ${wizardForm.compatibleIndustries.join(', ') || 'General'}
Feature ID: ${wizardForm.featureId}
Pascal Name: ${pascalName}

Estructura de Carpetas Requerida (12 Archivos Desacoplados):
-----------------------------------------------------------
1. src/features/${wizardForm.featureId}/index.js: exporta modulo, hooks y servicios.
2. src/features/${wizardForm.featureId}/module.js: entrypoint para featureModuleLoader.js.
3. src/features/${wizardForm.featureId}/implementation.manifest.json: metadatos y navegación.
4. src/features/${wizardForm.featureId}/routes.jsx: definición lazy de rutas del enrutador.
5. src/features/${wizardForm.featureId}/security/feature-security.json: descriptor Firestore.
6. src/features/${wizardForm.featureId}/constants/index.js: variables y constantes de acción.
7. src/features/${wizardForm.featureId}/schemas/schemas.js: validaciones Zod.
8. src/features/${wizardForm.featureId}/api/repository.js: queries de Firebase y offline storage.
9. src/features/${wizardForm.featureId}/services/service.js: casos de uso y reglas de negocio.
10. src/features/${wizardForm.featureId}/hooks/use${pascalName}.js: custom hook de estado y llamadas.
11. src/features/${wizardForm.featureId}/components/AdminView.jsx: interfaz de administración.
12. src/features/${wizardForm.featureId}/components/ClientView.jsx: interfaz presentacional de tienda.

Descriptor Firestore Requerido:
------------------------------
Colección: tenants/{tenantId}/${wizardForm.featureId}
Esquema Zod: id (opcional), createdAt (ISO), tenantId (string)
Reglas:
- READ: Roles [${wizardForm.firestore.readPermissions.join(', ')}]
- WRITE: Roles [${wizardForm.firestore.createPermissions.join(', ')}]
- UPDATE: Roles [${wizardForm.firestore.updatePermissions.join(', ')}]

Instrucciones de Construcción:
-----------------------------
Implementar el modulo respetando el monorepo y las variables CSS de tema HSL.
Asegurar Touch Targets de mínimo 44x44px en toda la interfaz de cliente.
`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generateMaestroPrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleToggleIndustry = (ind) => {
    setWizardForm(prev => {
      const active = prev.compatibleIndustries.includes(ind);
      return {
        ...prev,
        compatibleIndustries: active
          ? prev.compatibleIndustries.filter(x => x !== ind)
          : [...prev.compatibleIndustries, ind]
      };
    });
  };

  const handleToggleDependency = (depId) => {
    setWizardForm(prev => {
      const active = prev.dependencies.includes(depId);
      return {
        ...prev,
        dependencies: active
          ? prev.dependencies.filter(x => x !== depId)
          : [...prev.dependencies, depId]
      };
    });
  };

  // Planificar scaffolder
  const handleRequestPlan = async () => {
    setIsPlanning(true);
    setCommitResult(null);
    try {
      // Generar payload
      const payload = {
        featureId: wizardForm.featureId,
        displayName: wizardForm.displayName,
        version: wizardForm.version,
        description: wizardForm.description,
        category: wizardForm.category,
        dependencies: wizardForm.dependencies,
        compatibleIndustries: wizardForm.compatibleIndustries,
        npmDependencies: wizardForm.npmDependencies,
        defaultConfiguration: {
          enabled: true
        },
        tags: [wizardForm.category, ...wizardForm.compatibleIndustries]
      };

      const res = await fetch(`${CLI_URL}/api/project/features/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prototipe-CLI-Token': cliToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar planificación.');

      setPlannedData(data);
      setWizardStep(6); // Ir al paso de confirmación y commit
    } catch (err) {
      alert(`Error en validación: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  // Ejecutar commit e inyección en caliente
  const handleExecuteCommit = async () => {
    if (!plannedData) return;
    setIsCommitting(true);
    setCommitResult(null);
    try {
      const res = await fetch(`${CLI_URL}/api/project/features/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Prototipe-CLI-Token': cliToken
        },
        body: JSON.stringify({
          operationId: plannedData.operationId,
          currentRegistryHash: plannedData.currentRegistryHash
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCommitResult({ success: false, error: data.error || data.details || 'Fallo de build' });
      } else {
        setCommitResult({ success: true, message: data.message });
        fetchFeatures(); // Recargar catálogo
      }
    } catch (err) {
      setCommitResult({ success: false, error: err.message });
    } finally {
      setIsCommitting(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setWizardForm({
      featureId: '',
      displayName: '',
      category: 'commerce',
      version: '1.0.0',
      description: '',
      compatibleIndustries: [],
      dependencies: [],
      npmDependencies: {},
      navigation: {
        adminMenu: { label: '', path: '', icon: 'Layers' },
        clientMenu: { label: '', path: '' }
      },
      firestore: {
        path: '',
        readPermissions: ['client', 'vendedor'],
        createPermissions: ['client'],
        updatePermissions: ['vendedor'],
        deletePermissions: [],
        requiredFields: ['createdAt']
      }
    });
    setPlannedData(null);
    setCommitResult(null);
    setIsWizardOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl shadow-[var(--shadow-default)]">
        <div>
          <h2 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <Store className="text-[var(--color-primary)]" size={24} />
            Feature Marketplace &amp; Registry
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Catálogo universal de módulos funcionales y gobernanza de dependencias del ecosistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={fetchFeatures}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-xs font-bold text-[var(--color-text)] transition-all cursor-pointer min-h-[44px]"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Actualizar Registro
          </button>
          
          <button 
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] !text-white hover:opacity-90 active:scale-[0.98] transition-all font-bold text-xs shadow-md min-h-[44px]"
          >
            <Sparkles size={14} />
            Crear Feature Modular
          </button>
        </div>
      </div>

      {/* Grid de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Panel Izquierdo: Lista de Features */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar feature o palabra clave..."
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] placeholder-[var(--color-text-muted)]/40 transition-all min-h-[44px]"
              />
            </div>

            {/* Categorías */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] !text-white'
                      : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Tarjetas */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 max-h-[500px] overflow-y-auto space-y-2 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
                <span className="text-xs text-[var(--color-text-muted)] italic">Cargando catálogo...</span>
              </div>
            ) : filteredFeatures.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--color-text-muted)] italic">
                No se encontraron features.
              </div>
            ) : (
              filteredFeatures.map(feat => {
                const isSelected = selectedFeature?.id === feat.id;
                const clientsCount = getClientsUsingFeature(feat.id).length;
                return (
                  <div
                    key={feat.id}
                    onClick={() => setSelectedFeature(feat)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 group relative ${
                      isSelected
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/60 shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.15)]'
                        : 'bg-[var(--color-surface-2)]/20 border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)]/50 hover:border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                          {feat.displayName}
                        </h4>
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)]/80 block mt-0.5">
                          ID: {feat.id}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-full px-2 py-0.5 text-[var(--color-text-muted)]">
                        v{feat.version}
                      </span>
                    </div>

                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2 line-clamp-2 leading-relaxed">
                      {feat.description}
                    </p>

                    <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-[var(--color-border)]/40">
                      <span className="text-[8px] font-black uppercase tracking-wider text-[var(--color-primary)]/80">
                        📁 {feat.category}
                      </span>
                      {clientsCount > 0 && (
                        <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Users size={8} />
                          {clientsCount} cliente{clientsCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel Detalle */}
        <div className="lg:col-span-7">
          {selectedFeature ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-6 shadow-[var(--shadow-default)]">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-md border border-[var(--color-primary)]/20">
                    {selectedFeature.category}
                  </span>
                  <h3 className="text-lg font-black text-[var(--color-text)] mt-2">
                    {selectedFeature.displayName}
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]/70 block mt-0.5">
                    Feature ID: {selectedFeature.id} • v{selectedFeature.version}
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                  {selectedFeature.status || 'stable'}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Descripción del Módulo</span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]/50 p-3.5 rounded-xl">
                  {selectedFeature.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Dependencias Internas</span>
                  {selectedFeature.dependencies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFeature.dependencies.map(dep => (
                        <span key={dep} className="text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          🔗 {dep}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[var(--color-text-muted)] italic block mt-1">Sin dependencias.</span>
                  )}
                </div>

                <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Compatibilidad Vertical</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeature.compatibleIndustries?.map(ind => (
                      <span key={ind} className="text-[9px] font-bold bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded text-[var(--color-text-muted)]">
                        🏬 {ind.replace(/[_-]/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-12 rounded-2xl text-center flex flex-col items-center justify-center h-full gap-3 shadow-[var(--shadow-default)]">
              <Info className="text-[var(--color-text-muted)]/30" size={32} />
              <span className="text-xs text-[var(--color-text-muted)] italic">Selecciona una feature para ver su detalle.</span>
            </div>
          )}
        </div>

      </div>

      {/* Modal / Wizard de Creación de Features */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Header del Wizard */}
            <div className="flex justify-between items-center p-5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[var(--color-primary)]" size={18} />
                <h3 className="text-base font-black text-[var(--color-text)]">Asistente de Creación de Feature</h3>
              </div>
              <button 
                type="button"
                onClick={resetWizard}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pasos / Stepper Progress */}
            <div className="px-6 py-4 bg-[var(--color-surface-2)]/10 border-b border-[var(--color-border)]/50 flex justify-between items-center gap-2 overflow-x-auto">
              {[1, 2, 3, 4, 5, 6].map(step => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    wizardStep === step
                      ? 'bg-[var(--color-primary)] !text-white ring-4 ring-[var(--color-primary)]/20'
                      : wizardStep > step
                      ? 'bg-emerald-500 !text-white'
                      : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
                  }`}>
                    {wizardStep > step ? <Check size={12} /> : step}
                  </div>
                  {step < 6 && <div className="w-6 sm:w-12 h-0.5 bg-[var(--color-border)]" />}
                </div>
              ))}
            </div>

            {/* Contenido Dinámico del Paso */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              
              {/* Paso 1: Identificación básica */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={16} className="text-[var(--color-primary)]" />
                    Paso 1: Identificación básica
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="feature-id" className="block text-xs font-bold text-[var(--color-text)]">ID de la Feature (Kebab-Case)</label>
                      <input 
                        id="feature-id"
                        type="text"
                        placeholder="ej. customer-loyalty"
                        value={wizardForm.featureId}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, featureId: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="display-name" className="block text-xs font-bold text-[var(--color-text)]">Nombre de Módulo</label>
                      <input 
                        id="display-name"
                        type="text"
                        placeholder="ej. Programa de Puntos"
                        value={wizardForm.displayName}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="block text-xs font-bold text-[var(--color-text)]">Categoría Funcional</span>
                      <div className="grid grid-cols-2 gap-2">
                        {categoriesList.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setWizardForm(prev => ({ ...prev, category: cat }))}
                            className={`px-3 py-2 border rounded-xl text-[10px] font-bold text-left capitalize transition-all cursor-pointer ${
                              wizardForm.category === cat
                                ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                                : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                            }`}
                          >
                            📁 {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="version-input" className="block text-xs font-bold text-[var(--color-text)]">Versión Inicial</label>
                      <input 
                        id="version-input"
                        type="text"
                        value={wizardForm.version}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, version: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Descripción y Verticales */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={16} className="text-[var(--color-primary)]" />
                    Paso 2: Descripción y Verticales
                  </h4>
                  <div className="space-y-1.5">
                    <label htmlFor="feature-desc" className="block text-xs font-bold text-[var(--color-text)]">Descripción Funcional</label>
                    <textarea 
                      id="feature-desc"
                      rows={3}
                      placeholder="Explica qué problemas de negocio resuelve y qué funcionalidades inyecta..."
                      value={wizardForm.description}
                      onChange={(e) => setWizardForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-[var(--color-text)]">Verticales de Negocio Compatibles</span>
                    <div className="flex flex-wrap gap-2">
                      {industriesList.map(ind => {
                        const isActive = wizardForm.compatibleIndustries.includes(ind);
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => handleToggleIndustry(ind)}
                            className={`px-3 py-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                            }`}
                          >
                            🏬 {ind.replace(/[_-]/g, ' ')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 3: Dependencias */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu size={16} className="text-[var(--color-primary)]" />
                    Paso 3: Dependencias de Módulo
                  </h4>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Selecciona otros módulos de los cuales depende esta feature. Si se produce un ciclo de dependencias, la API denegará la creación.
                  </p>
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-[var(--color-text)]">Módulos Registrados</span>
                    {features.length === 0 ? (
                      <span className="text-xs text-[var(--color-text-muted)] italic">No hay módulos disponibles en el registry.</span>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1 border border-[var(--color-border)]/40 rounded-xl">
                        {features.map(feat => {
                          const isChecked = wizardForm.dependencies.includes(feat.id);
                          return (
                            <button
                              key={feat.id}
                              type="button"
                              onClick={() => handleToggleDependency(feat.id)}
                              className={`p-2.5 border rounded-xl text-left text-[10px] font-bold flex justify-between items-center transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                  : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)]/50 text-[var(--color-text-muted)]'
                              }`}
                            >
                              <span>🔗 {feat.displayName}</span>
                              {isChecked && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paso 4: Rutas y Navegación */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight size={16} className="text-[var(--color-primary)]" />
                    Paso 4: Rutas y Navegación
                  </h4>
                  <div className="p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">Layout Administrador</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="nav-admin-label" className="block text-[10px] font-bold text-[var(--color-text)]">Etiqueta de Menú</label>
                        <input 
                          id="nav-admin-label"
                          type="text"
                          placeholder="ej. Programa de Fidelización"
                          value={wizardForm.navigation.adminMenu.label}
                          onChange={(e) => setWizardForm(prev => ({
                            ...prev,
                            navigation: {
                              ...prev.navigation,
                              adminMenu: { ...prev.navigation.adminMenu, label: e.target.value, path: `/admin/${prev.featureId}` }
                            }
                          }))}
                          className="w-full px-3.5 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nav-admin-path" className="block text-[10px] font-bold text-[var(--color-text)] font-mono">Ruta Admin (Rígida)</label>
                        <input 
                          id="nav-admin-path"
                          type="text"
                          disabled
                          value={`/admin/${wizardForm.featureId || '[feature-id]'}`}
                          className="w-full px-3.5 py-2 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-muted)] cursor-not-allowed min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">Layout Cliente</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="nav-client-label" className="block text-[10px] font-bold text-[var(--color-text)]">Etiqueta de Cliente</label>
                        <input 
                          id="nav-client-label"
                          type="text"
                          placeholder="ej. Mis Puntos"
                          value={wizardForm.navigation.clientMenu.label}
                          onChange={(e) => setWizardForm(prev => ({
                            ...prev,
                            navigation: {
                              ...prev.navigation,
                              clientMenu: { label: e.target.value, path: `/tienda/${prev.featureId}` }
                            }
                          }))}
                          className="w-full px-3.5 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nav-client-path" className="block text-[10px] font-bold text-[var(--color-text)] font-mono">Ruta Cliente (Rígida)</label>
                        <input 
                          id="nav-client-path"
                          type="text"
                          disabled
                          value={`/tienda/${wizardForm.featureId || '[feature-id]'}`}
                          className="w-full px-3.5 py-2 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-muted)] cursor-not-allowed min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 5: Reglas de Persistencia y Seguridad */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={16} className="text-[var(--color-primary)]" />
                    Paso 5: Seguridad Firestore
                  </h4>
                  <div className="p-4 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] flex items-center gap-1">
                      <Database size={12} />
                      Aislamiento Multi-Tenant (Estricto)
                    </span>
                    <div className="space-y-1.5">
                      <label htmlFor="fs-path" className="block text-[10px] font-bold text-[var(--color-text)] font-mono">Path Canónico de Colección</label>
                      <input 
                        id="fs-path"
                        type="text"
                        disabled
                        value={`tenants/{tenantId}/${wizardForm.featureId || '[feature-id]'}/{docId}`}
                        className="w-full px-3.5 py-2.5 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-muted)] font-mono cursor-not-allowed min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-[var(--color-text)]">Permisos de Lectura (Read)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['client', 'vendedor', 'bodeguero', 'mensajero'].map(role => {
                          const active = wizardForm.firestore.readPermissions.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setWizardForm(prev => {
                                const exist = prev.firestore.readPermissions.includes(role);
                                return {
                                  ...prev,
                                  firestore: {
                                    ...prev.firestore,
                                    readPermissions: exist
                                      ? prev.firestore.readPermissions.filter(r => r !== role)
                                      : [...prev.firestore.readPermissions, role]
                                  }
                                };
                              })}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                active
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                  : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)]/50 text-[var(--color-text-muted)]'
                              }`}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="block text-xs font-bold text-[var(--color-text)]">Permisos de Creación (Create)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['client', 'vendedor', 'bodeguero', 'mensajero'].map(role => {
                          const active = wizardForm.firestore.createPermissions.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setWizardForm(prev => {
                                const exist = prev.firestore.createPermissions.includes(role);
                                return {
                                  ...prev,
                                  firestore: {
                                    ...prev.firestore,
                                    createPermissions: exist
                                      ? prev.firestore.createPermissions.filter(r => r !== role)
                                      : [...prev.firestore.createPermissions, role]
                                  }
                                };
                              })}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                active
                                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                                  : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)]/50 text-[var(--color-text-muted)]'
                              }`}
                            >
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 6: Confirmación, Prompt Maestro & Commit */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal size={16} className="text-[var(--color-primary)]" />
                    Paso 6: Prompt Maestro y Compilación
                  </h4>

                  {/* Panel de visualización de Prompt */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1">
                        <Code size={12} />
                        Prompt de Implementación Maestro (Autogenerado)
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer min-h-[44px]"
                      >
                        <Copy size={12} />
                        {copiedPrompt ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] rounded-xl overflow-x-auto max-h-[160px] text-left leading-normal whitespace-pre-wrap select-all">
                      {generateMaestroPrompt()}
                    </pre>
                  </div>

                  {/* Detalle del plan transaccional */}
                  {plannedData && (
                    <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl space-y-3 text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)] block">Plan de Cambios Físicos del Scaffold</span>
                      <div className="max-h-[100px] overflow-y-auto space-y-1.5 scrollbar-thin text-[10px] font-mono divide-y divide-[var(--color-border)]/40">
                        {plannedData.plan.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1">
                            <span className="text-[var(--color-text-muted)]">{p.path}</span>
                            <span className={`font-black uppercase text-[8px] px-1.5 py-0.5 rounded-md ${
                              p.action === 'CREATE_FILE' || p.action === 'CREATE_DIR'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : p.action === 'MODIFY_FILE'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {p.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estado de ejecución de Commit */}
                  {isCommitting && (
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/30 border border-[var(--color-border)] rounded-xl gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                      <span className="text-xs font-bold text-[var(--color-text)]">Creando Workspace Candidato y compilando con Vite...</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] italic">Esto puede tomar unos segundos para asegurar la integridad de la base de código.</span>
                    </div>
                  )}

                  {/* Mensajes de resultado */}
                  {commitResult && (
                    <div className={`p-4 border rounded-xl flex items-start gap-3 text-left ${
                      commitResult.success
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                        : 'bg-red-500/10 border-red-500 text-red-500'
                    }`}>
                      {commitResult.success ? (
                        <CheckCircle className="shrink-0 mt-0.5" size={16} />
                      ) : (
                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                      )}
                      <div>
                        <span className="text-xs font-bold block">
                          {commitResult.success ? 'Inyección Exitosa' : 'Fallo en Transacción'}
                        </span>
                        <p className="text-[10px] mt-1 leading-relaxed whitespace-pre-wrap font-mono max-h-[140px] overflow-y-auto">
                          {commitResult.success ? commitResult.message : commitResult.error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer del Wizard */}
            <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex justify-between items-center gap-3">
              {wizardStep > 1 && wizardStep < 6 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-xs font-bold text-[var(--color-text)] transition-all cursor-pointer min-h-[44px]"
                >
                  <ArrowLeft size={12} />
                  Anterior
                </button>
              )}
              
              <div className="ml-auto flex items-center gap-3">
                {wizardStep < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && (!wizardForm.featureId.trim() || !wizardForm.displayName.trim())) {
                        alert('ID de feature y Nombre de Módulo son requeridos.');
                        return;
                      }
                      if (wizardStep === 2 && !wizardForm.description.trim()) {
                        alert('La descripción es requerida.');
                        return;
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] !text-white hover:opacity-90 active:scale-[0.98] transition-all font-bold text-xs min-h-[44px]"
                  >
                    Siguiente
                    <ArrowRight size={12} />
                  </button>
                )}

                {wizardStep === 5 && (
                  <button
                    type="button"
                    onClick={handleRequestPlan}
                    disabled={isPlanning}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--color-primary)] !text-white hover:opacity-90 active:scale-[0.98] transition-all font-bold text-xs min-h-[44px] disabled:opacity-50"
                  >
                    {isPlanning ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        Planificar Feature
                        <Sparkles size={12} />
                      </>
                    )}
                  </button>
                )}

                {wizardStep === 6 && (
                  <>
                    <button
                      type="button"
                      onClick={resetWizard}
                      disabled={isCommitting}
                      className="px-4 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-xs font-bold text-[var(--color-text)] transition-all cursor-pointer min-h-[44px]"
                    >
                      {commitResult?.success ? 'Cerrar' : 'Cancelar'}
                    </button>
                    {!commitResult?.success && (
                      <button
                        type="button"
                        onClick={handleExecuteCommit}
                        disabled={isCommitting}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 !text-white hover:opacity-90 active:scale-[0.98] transition-all font-bold text-xs min-h-[44px] disabled:opacity-50"
                      >
                        {isCommitting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            Compilar e Inyectar
                            <Check size={12} />
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
