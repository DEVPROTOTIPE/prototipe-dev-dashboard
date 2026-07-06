import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ClipboardList, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Save, 
  FileText, 
  UserPlus, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Database,
  Info,
  Trash2,
  ChevronDown,
  ChevronRight,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, deleteDoc, collection, getDocs, getFirestore, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import CustomSelect from '../ui/CustomSelect';
import { CLI_URL } from '../../config';

const COMP_TYPE_STYLES = {
  atom:      { icon: '⚛️', color: 'text-rose-400',    bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   activeBorder: 'border-rose-400/50' },
  component: { icon: '🧩', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', activeBorder: 'border-violet-400/50' },
  module:    { icon: '📦', color: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  activeBorder: 'border-amber-400/50' },
  hook:      { icon: '⚡', color: 'text-sky-400',     bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    activeBorder: 'border-sky-400/50' },
  service:   { icon: '🔌', color: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',activeBorder: 'border-emerald-400/50' },
};

const SECCIONES = [
  { id: 1, title: 'Información General', desc: 'Nombre, NIT, ubicación y web' },
  { id: 2, title: 'Contacto Principal', desc: 'Representante, cargo y canales' },
  { id: 3, title: 'Contexto Empresarial', desc: 'Historia, empleados y sedes' },
  { id: 4, title: 'Modelo de Negocio', desc: 'Canales, tipo de venta y catálogo' },
  { id: 5, title: 'Flujo Operativo', desc: 'Captación, venta y entrega' },
  { id: 6, title: 'Usuarios y Roles', desc: 'Roles y volumen operativo' },
  { id: 7, title: 'Problemas y Dolores', desc: 'Dolores de caja, stock y tiempos' },
  { id: 8, title: 'Impacto Económico', desc: 'Horas y dinero perdido estimado' },
  { id: 9, title: 'Oportunidades', desc: 'Automatizaciones clave' },
  { id: 10, title: 'Escalabilidad', desc: 'Planes de expansión' },
  { id: 11, title: 'Tecnología Actual', desc: 'Sistemas en uso y pros/contras' },
  { id: 12, title: 'Reportes e Indicadores', desc: 'Reportes necesarios' },
  { id: 13, title: 'Integraciones', desc: 'WhatsApp, pasarelas, DIAN' },
  { id: 14, title: 'Branding e Identidad', desc: 'Logos, colores HSL, tipografía' },
  { id: 15, title: 'Requerimientos', desc: 'Obligatorios y deseables' },
  { id: 16, title: 'Parametrización Core', desc: 'Configuración inicial' },
  { id: 17, title: 'Resumen del Analista', desc: 'Dolor y solución recomendada' },
  { id: 18, title: 'Diagnóstico Preliminar', desc: 'Complejidad y madurez tech' },
  { id: 19, title: 'Componentes Reutilizables', desc: 'Mapeo contra catálogo' },
  { id: 20, title: 'Feature Flags', desc: 'Flags sugeridas para el Core' }
];

export default function BriefingStudioView({ dbInstance, showToast, onImportToOnboarding }) {
  const [activeTab, setActiveTab] = useState('interview'); // 'interview' | 'analysis'
  const [currentSection, setCurrentSection] = useState(1);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [showExportSuccessModal, setShowExportSuccessModal] = useState(false);
  const [exportedPaths, setExportedPaths] = useState({ briefing: '', analisis: '' });
  const [cores, setCores] = useState({});
  const [selectedCoreKey, setSelectedCoreKey] = useState('ventas');

  // Cargar metadatos de cores
  useEffect(() => {
    loadCoresMetadata();
  }, []);

  const loadCoresMetadata = async () => {
    try {
      const res = await fetch(`${CLI_URL}/api/cores/metadata`);
      const data = await res.json();
      if (data.success) {
        setCores(data.metadata);
      }
    } catch (err) {
      console.error('Error al cargar metadatos de cores:', err);
    }
  };

  // Form State
  const [form, setForm] = useState({
    seccion1: { nombre: '', nit: '', ciudad: '', web: '' },
    seccion2: { contacto: '', cargo: '', celular: '', whatsapp: '', email: '' },
    seccion3: { sector: '', empleados: '', sedes: '', reseña: '' },
    seccion4: { canales: [], catalogos: [] },
    seccion5: { captacion: '', atencion: '', venta: '', entrega: '', postventa: '' },
    seccion6: { roles: [{ rol: '', cantidad: '', funciones: '' }] },
    seccion7: { doloresCaja: '', doloresInventario: '', doloresTiempos: '', doloresPrincipales: '' },
    seccion8: { horasPerdidas: '', dineroPerdido: '', dolorMasCostoso: '' },
    seccion9: { tareasEliminar: '', tareasAutomatizar: '' },
    seccion10: { expansion: '', nuevasSedes: 'no', masPersonal: 'no' },
    seccion11: { softwareActual: '', prosSoftware: '', contrasSoftware: '', offline: 'no' },
    seccion12: { reportes: '' },
    seccion13: { integraciones: [] },
    seccion14: { logoUrl: '', colorPrimario: '#10b981', colorSecundario: '#1e293b', googleFont: 'Inter' },
    seccion15: { obligatorios: [], deseables: [] },
    seccion16: { minCompra: '', whatsappNotificaciones: '', requiereCreditos: 'no' },
    seccion17: { dolorPrincipal: '', solucionPropuesta: '', beneficioPrincipal: '' },
    seccion18: { madurezTech: 'media', complejidad: 'media', personalizacion: 'baja' },
    seccion19: { componentesId: [] },
    seccion20: { flags: {} }
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedCompCat, setExpandedCompCat] = useState(null);

  const groupedComponents = useMemo(() => {
    if (!analysisResult || !analysisResult.suggestedComponents) return {};
    const groups = {};
    analysisResult.suggestedComponents.forEach(comp => {
      const cat = comp.categoryLabel || 'Otros';
      if (!groups[cat]) {
        groups[cat] = {
          label: cat,
          typeKey: comp.typeKey || 'component',
          components: []
        };
      }
      groups[cat].components.push(comp);
    });
    return groups;
  }, [analysisResult]);

  useEffect(() => {
    if (analysisResult && analysisResult.suggestedComponents && analysisResult.suggestedComponents.length > 0) {
      const firstComp = analysisResult.suggestedComponents[0];
      if (firstComp && firstComp.categoryLabel) {
        setExpandedCompCat(firstComp.categoryLabel);
      }
    }
  }, [analysisResult]);

  // Cargar sesiones previas
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!dbInstance) return;
    setLoadingSessions(true);
    try {
      const q = query(collection(dbInstance, 'briefings'), orderBy('fecha', 'desc'), limit(50));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setSessions(list);
    } catch (err) {
      console.error('Error al cargar briefings:', err.message);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSelectSession = (id) => {
    setSelectedSessionId(id);
    const sess = sessions.find(s => s.id === id);
    if (sess && sess.form) {
      setForm(sess.form);
      if (sess.coreKey) {
        setSelectedCoreKey(sess.coreKey);
      } else {
        setSelectedCoreKey('ventas');
      }
      showToast('Sesión de briefing recuperada ✓', { type: 'success' });
    }
  };

  const injectDemoData = () => {
    const demoData = {
      seccion1: {
        nombre: 'Ferretería El Tornillo Feliz',
        nit: '901.456.789-0',
        ciudad: 'Bucaramanga, Santander',
        web: 'www.eltornillofeliz.com'
      },
      seccion2: {
        contacto: 'Carlos Mendoza',
        cargo: 'Director General',
        celular: '+57 315 789 4512',
        whatsapp: '+57 315 789 4512',
        email: 'gerencia@eltornillofeliz.com'
      },
      seccion3: {
        sector: 'Ferretería y Construcción',
        empleados: '12',
        sedes: '3',
        reseña: 'Empresa familiar con más de 15 años en el mercado de Bucaramanga, distribuyendo herramientas y materiales de construcción a nivel local.'
      },
      seccion4: {
        canales: ['mostrador', 'whatsapp', 'b2b / distribuidores'],
        catalogos: []
      },
      seccion5: {
        captacion: 'Clientes pasan por el local o escriben por recomendaciones en WhatsApp.',
        atencion: 'Se atiende por orden de llegada en mostrador o asignando chat de WhatsApp de forma aleatoria.',
        venta: 'Efectivo, transferencias Nequi/Daviplata y créditos a clientes de confianza anotados en un cuaderno.',
        entrega: 'Retiro en tienda o envío propio con motocarro para pedidos grandes.',
        postventa: 'Garantías se gestionan físicamente con la factura de papel.'
      },
      seccion6: {
        roles: [
          { rol: 'Vendedor de mostrador', cantidad: '4', funciones: 'Atención al cliente y facturación física.' },
          { rol: 'Cajero', cantidad: '2', funciones: 'Recibir pagos y cuadre diario.' },
          { rol: 'Repartidor', cantidad: '2', funciones: 'Entrega de pedidos a domicilio.' }
        ]
      },
      seccion7: {
        doloresCaja: 'Frecuentes descuadres al final del día por tickets mal registrados.',
        doloresInventario: 'Pérdidas de ventas por no saber si un producto está en stock en otra bodega.',
        doloresTiempos: 'Tardan más de 10 minutos cotizando pedidos complejos de clientes de construcción.',
        doloresPrincipales: 'Falta de control del saldo deudor de clientes de fiado y cuadres ineficientes en mostrador.'
      },
      seccion8: {
        horasPerdidas: '20',
        dineroPerdido: '$1.200.000 COP',
        dolorMasCostoso: 'Créditos vencidos no cobrados a tiempo por pérdida de registros en cuaderno.'
      },
      seccion9: {
        tareasEliminar: 'Anotar cuentas por cobrar en cuadernos y validar manualmente inventario en bodega física.',
        tareasAutomatizar: 'Registro de cobros con recordatorios automáticos por WhatsApp y sincronización de stock multi-sede.'
      },
      seccion10: {
        expansion: 'Abrir una cuarta sede en Floridablanca en los próximos 8 meses.',
        nuevasSedes: 'si',
        masPersonal: 'si'
      },
      seccion11: {
        softwareActual: 'Excel básico para inventario de fin de mes y facturación en papel autocopiativo.',
        prosSoftware: 'Fácil de usar, sin costo adicional de software.',
        contrasSoftware: 'No hay datos en tiempo real, propenso a pérdidas de archivos y errores humanos.',
        offline: 'si'
      },
      seccion12: {
        reportes: 'Ventas diarias por sede, inventario valorizado y reporte consolidado de cuentas por cobrar vencidas.'
      },
      seccion13: {
        integraciones: ['whatsapp', 'impresora', 'maps']
      },
      seccion14: {
        logoUrl: '',
        colorPrimario: '#f59e0b',
        colorSecundario: '#1e293b',
        googleFont: 'Outfit'
      },
      seccion15: {
        obligatorios: ['pos', 'inventario', 'credito', 'domicilio'],
        deseables: ['cupones']
      },
      seccion16: {
        minCompra: '$20.000 COP',
        whatsappNotificaciones: '+57 315 789 4512',
        requiereCreditos: 'si'
      },
      seccion17: {
        dolorPrincipal: 'Pérdida de trazabilidad de créditos otorgados a contratistas.',
        solucionPropuesta: 'Implementar el portal de clientes con balance de saldos, límites de crédito por usuario y pasarela Bold integrada.',
        beneficioPrincipal: 'Reducción del 40% en cartera vencida y cuadre de caja 100% automatizado.'
      },
      seccion18: {
        madurezTech: 'media',
        complejidad: 'media',
        personalizacion: 'media'
      },
      seccion19: {
        componentesId: ['OrderCard', 'InventoryTransactionService', 'guided_toast']
      },
      seccion20: {
        flags: {
          creditsEnabled: true,
          couponsEnabled: false,
          wholesaleEnabled: true,
          deliveryEnabled: true,
          enableDianBilling: false
        }
      }
    };
    
    setForm(demoData);
    if (showToast) {
      showToast('Datos de prueba inyectados correctamente ✓', { type: 'success' });
    }
  };

  const clearFormData = () => {
    const emptyData = {
      seccion1: { nombre: '', nit: '', ciudad: '', web: '' },
      seccion2: { contacto: '', cargo: '', celular: '', whatsapp: '', email: '' },
      seccion3: { sector: '', empleados: '', sedes: '', reseña: '' },
      seccion4: { canales: [], catalogos: [] },
      seccion5: { captacion: '', atencion: '', venta: '', entrega: '', postventa: '' },
      seccion6: { roles: [{ rol: '', cantidad: '', funciones: '' }] },
      seccion7: { doloresCaja: '', doloresInventario: '', doloresTiempos: '', doloresPrincipales: '' },
      seccion8: { horasPerdidas: '', dineroPerdido: '', dolorMasCostoso: '' },
      seccion9: { tareasEliminar: '', tareasAutomatizar: '' },
      seccion10: { expansion: '', nuevasSedes: 'no', masPersonal: 'no' },
      seccion11: { softwareActual: '', prosSoftware: '', contrasSoftware: '', offline: 'no' },
      seccion12: { reportes: '' },
      seccion13: { integraciones: [] },
      seccion14: { logoUrl: '', colorPrimario: '#10b981', colorSecundario: '#1e293b', googleFont: 'Inter' },
      seccion15: { obligatorios: [], deseables: [] },
      seccion16: { minCompra: '', whatsappNotificaciones: '', requiereCreditos: 'no' },
      seccion17: { dolorPrincipal: '', solucionPropuesta: '', beneficioPrincipal: '' },
      seccion18: { madurezTech: 'media', complejidad: 'media', personalizacion: 'baja' },
      seccion19: { componentesId: [] },
      seccion20: { flags: {} }
    };
    
    setForm(emptyData);
    setSelectedSessionId('');
    if (showToast) {
      showToast('Formulario de briefing limpiado ✓', { type: 'success' });
    }
  };

  const confirmDeleteSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete || !dbInstance) return;
    try {
      const docRef = doc(dbInstance, 'briefings', sessionToDelete.id);
      await deleteDoc(docRef);
      showToast('Sesión de briefing eliminada ✓', { type: 'success' });
      setSelectedSessionId('');
      // Limpiar también el formulario ya que la sesión no existe
      clearFormData();
      // Recargar la lista
      await loadSessions();
    } catch (err) {
      showToast(`Error al eliminar sesión: ${err.message}`, { type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  };

  // Auto-guardado al cambiar de sección
  const autoSave = async (updatedForm = form) => {
    if (!dbInstance) return;
    const name = updatedForm.seccion1?.nombre || 'Sin_Nombre';
    const sessionId = selectedSessionId || `session_${sanitizeFileName(name)}_${Date.now()}`;
    
    if (!selectedSessionId) {
      setSelectedSessionId(sessionId);
    }

    try {
      const docRef = doc(dbInstance, 'briefings', sessionId);
      await setDoc(docRef, {
        form: updatedForm,
        nombreEmpresa: name,
        coreKey: selectedCoreKey,
        fecha: new Date().toLocaleDateString(),
        progreso: Math.round((currentSection / 20) * 100),
        actualizadoEn: serverTimestamp()
      });
    } catch (err) {
      console.warn('Aviso: auto-guardado en Firestore diferido (sin conexión u offline)');
    }
  };

  const handleNext = () => {
    if (currentSection < 20) {
      const nextSec = currentSection + 1;
      setCurrentSection(nextSec);
      autoSave();
    }
  };

  const handlePrev = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderDynamicManifestFields = (stepNumber) => {
    const stepConfig = cores[selectedCoreKey]?.manifest?.wizardSteps?.find(s => s.step === stepNumber);
    if (!stepConfig) return null;

    return (
      <div className="space-y-4">
        {stepConfig.fields.map(field => {
          const sectionKey = `seccion${stepNumber}`;
          const value = form[sectionKey]?.[field.id] !== undefined ? form[sectionKey][field.id] : '';

          if (field.type === 'textarea') {
            return (
              <div key={field.id}>
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">{field.label}</label>
                <textarea
                  value={value}
                  onChange={(e) => handleFieldChange(sectionKey, field.id, e.target.value)}
                  placeholder={field.placeholder || ''}
                  rows={3}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all resize-none"
                />
              </div>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.id}>
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">{field.label}</label>
                <select
                  value={value}
                  onChange={(e) => handleFieldChange(sectionKey, field.id, e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all cursor-pointer"
                >
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === 'checkbox_group') {
            const list = Array.isArray(value) ? value : [];
            return (
              <div key={field.id} className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">{field.label}</label>
                <div className="grid grid-cols-2 gap-2">
                  {field.options?.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-xs text-[var(--color-text)] select-none cursor-pointer p-2 bg-[var(--color-bg)]/40 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)]/80 transition-all">
                      <input
                        type="checkbox"
                        checked={list.includes(opt.value)}
                        onChange={() => handleCheckboxChange(sectionKey, field.id, opt.value)}
                        className="accent-indigo-500"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={field.id}>
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">{field.label}</label>
              <input
                type={field.type || 'text'}
                value={value}
                onChange={(e) => handleFieldChange(sectionKey, field.id, e.target.value)}
                placeholder={field.placeholder || ''}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const handleFieldChange = (section, field, value) => {
    const updated = {
      ...form,
      [section]: {
        ...form[section],
        [field]: value
      }
    };
    setForm(updated);
  };

  const handleCheckboxChange = (section, field, val) => {
    const list = form[section][field] || [];
    const updatedList = list.includes(val)
      ? list.filter(x => x !== val)
      : [...list, val];
    
    handleFieldChange(section, field, updatedList);
  };

  const addRoleRow = () => {
    const roles = [...form.seccion6.roles, { rol: '', cantidad: '', funciones: '' }];
    handleFieldChange('seccion6', 'roles', roles);
  };

  const removeRoleRow = (idx) => {
    const roles = form.seccion6.roles.filter((_, i) => i !== idx);
    handleFieldChange('seccion6', 'roles', roles);
  };

  const handleRoleChange = (idx, key, val) => {
    const roles = form.seccion6.roles.map((r, i) => {
      if (i === idx) return { ...r, [key]: val };
      return r;
    });
    handleFieldChange('seccion6', 'roles', roles);
  };

  // Modo 2: Ejecutar Análisis
  const handleAnalyzeBriefing = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`${CLI_URL}/api/briefing/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, coreKey: selectedCoreKey })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnalysisResult(data);
      setActiveTab('analysis');
      showToast('Análisis cognitivo del briefing completado ✓', { type: 'success' });

      // Guardar el análisis en Firestore para que el asistente pueda recuperarlo con todo y análisis
      if (dbInstance) {
        const name = form.seccion1?.nombre || 'Sin_Nombre';
        const sessionId = selectedSessionId || `session_${sanitizeFileName(name)}_${Date.now()}`;
        if (!selectedSessionId) {
          setSelectedSessionId(sessionId);
        }
        const docRef = doc(dbInstance, 'briefings', sessionId);
        await setDoc(docRef, {
          form,
          nombreEmpresa: name,
          coreKey: selectedCoreKey,
          fecha: new Date().toLocaleDateString(),
          progreso: 100,
          actualizadoEn: serverTimestamp(),
          analysisResult: data
        }, { merge: true });
      }
    } catch (err) {
      showToast(`Error al analizar: ${err.message}`, { type: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  // Exportar a Markdown local
  const handleExportMarkdown = async () => {
    setExporting(true);
    try {
      const briefingMarkdown = generateBriefingMarkdown();
      const analisisMarkdown = generateAnalisisMarkdown();

      const res = await fetch(`${CLI_URL}/api/briefing/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa: form.seccion1.nombre || 'Sin_Nombre',
          contacto: form.seccion2.contacto || 'Sin_Contacto',
          fecha: new Date().toLocaleDateString().replace(/\//g, '-'),
          briefingData: briefingMarkdown,
          analisisData: analisisMarkdown,
          coreKey: selectedCoreKey
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setExportedPaths({
        briefing: data.briefingPath,
        analisis: data.analisisPath
      });
      setShowExportSuccessModal(true);
      showToast('Documentos exportados con éxito ✓', { type: 'success' });
    } catch (err) {
      showToast(`Error al exportar: ${err.message}`, { type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handlePortToOnboarding = () => {
    if (!onImportToOnboarding || !analysisResult) return;
    onImportToOnboarding({
      nombreEmpresa: form.seccion1.nombre || 'Cliente Nuevo',
      form: form,
      coreKey: selectedCoreKey,
      analysisResult: analysisResult
    });
  };

  const handleCopyPrompt = () => {
    if (!analysisResult || !analysisResult.appContext) return;
    const ctx = analysisResult.appContext;
    const compsText = analysisResult.suggestedComponents.map(c => {
      return `- **${c.name}** (${c.technicalName}):
  - Categoría: ${c.categoryLabel}
  - Ruta de biblioteca: ${c.link}
  - Pistas de adaptación:
    ${c.adaptationHints ? c.adaptationHints.map(h => `* ${h}`).join('\n    ') : 'N/A'}`;
    }).join('\n\n');

    const promptText = `Hola Antigravity, por favor actúa como un Ingeniero de Software Principal. He completado el onboarding de un cliente y requiero inyectar los siguientes componentes adaptados de la biblioteca de componentes al proyecto.

### Contexto del Cliente / Proyecto:
- **Cliente:** ${ctx.clientName}
- **Sector:** ${ctx.sector}
- **Paleta de Colores de Marca:**
  - Primario: ${ctx.primaryColor}
  - Secundario: ${ctx.secondaryColor}
- **Tipografía (Google Fonts):** ${ctx.googleFont}
- **Prefijo Firestore sugerido:** ${ctx.firestorePrefix}
- **Feature Flags habilitadas:** ${ctx.enabledFlags ? ctx.enabledFlags.join(', ') : 'Ninguna'}

### Componentes de la Biblioteca a Portar:
${compsText}

Por favor ejecuta el comando \`@portar-componente\` para cada uno de los componentes de arriba. Asegúrate de adaptar la lógica del componente, los nombres de colecciones de Firestore, y las variables de color CSS (como \`var(--color-primary)\` utilizando ${ctx.primaryColor} y ${ctx.secondaryColor}) para que encajen a la perfección con la marca del cliente.`;

    copyTextToClipboard(promptText, 'Prompt de Adaptación copiado al portapapeles ✓');
  };

  const copyTextToClipboard = async (text, successMsg = 'Copiado al portapapeles ✓') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(successMsg, { type: 'success' });
      } else {
        throw new Error('Clipboard API no disponible');
      }
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast(`${successMsg} (método secundario) ✓`, { type: 'success' });
      } catch (fallbackErr) {
        showToast('No se pudo copiar de forma automática.', { type: 'error' });
      }
      document.body.removeChild(textArea);
    }
  };

  function sanitizeFileName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').substring(0, 30);
  }

  // Generadores estáticos de Markdown
  const generateBriefingMarkdown = () => {
    return `# BRIEFING MAESTRO DE CLIENTE: ${form.seccion1.nombre || 'Sin Nombre'}
Fecha de Levantamiento: ${new Date().toLocaleDateString()}

## 1. Información General
- **Nombre/Empresa:** ${form.seccion1.nombre || 'N/A'}
- **NIT:** ${form.seccion1.nit || 'N/A'}
- **Ciudad:** ${form.seccion1.ciudad || 'N/A'}
- **Web:** ${form.seccion1.web || 'N/A'}

## 2. Contacto Principal
- **Representante:** ${form.seccion2.contacto || 'N/A'}
- **Cargo:** ${form.seccion2.cargo || 'N/A'}
- **Celular:** ${form.seccion2.celular || 'N/A'}
- **WhatsApp:** ${form.seccion2.whatsapp || 'N/A'}

## 3. Contexto Comercial y Dolores
- **Sector:** ${form.seccion3.sector || 'N/A'}
- **Empleados:** ${form.seccion3.empleados || 'N/A'}
- **Dolor Principal:** ${form.seccion7.doloresPrincipales || 'N/A'}
- **Impacto Estimado:** ${form.seccion8.horasPerdidas || '0'} horas/semana y ${form.seccion8.dineroPerdido || 'N/A'} de pérdida.

## 4. Feature Flags Propuestas
${Object.entries(analysisResult?.recommendedFlags || {}).map(([k, v]) => `- **${k}**: ${v ? '🟢 Habilitado' : '🔴 Deshabilitado'}`).join('\n')}
`;
  };

  const generateAnalisisMarkdown = () => {
    const ctx = analysisResult?.appContext || {};
    const compsMarkdown = analysisResult?.suggestedComponents?.map(comp => {
      const hintsStr = comp.adaptationHints?.map(hint => `  * ${hint}`).join('\n') || '  * Validar dependencias internas del manifiesto.';
      return `#### ${comp.name} (${comp.technicalName})
- **Categoría:** ${comp.categoryLabel}
- **Ruta física:** ${comp.link}
- **Pistas de portabilidad:**
${hintsStr}`;
    }).join('\n\n') || 'Ninguno';

    return `# ANÁLISIS POST-DESCUBRIMIENTO: ${form.seccion1.nombre || 'Sin Nombre'}
Fecha: ${new Date().toLocaleDateString()}

## 1. Resumen Ejecutivo
${analysisResult?.resumenEjecutivo || 'N/A'}

## 2. Estimación de Complejidad
- **Paso 1 (Funcional):** ${analysisResult?.score?.funcional || 0} pts
- **Paso 2 (Técnico):** ${analysisResult?.score?.tecnico || 0} pts
- **Paso 3 (Personalización):** ${analysisResult?.score?.personalizacion || 0} pts
- **Paso 4 (Riesgos):** ${analysisResult?.score?.riesgo || 0} pts
- **Paso 5 (Valor Comercial):** ${analysisResult?.score?.valor || 0} pts
- **Total Score:** ${analysisResult?.score?.total || 0} / 108 pts
- **Clasificación:** ${analysisResult?.score?.nivel || '🔴 Micro'}

## 3. Propuesta Económica
- **Setup Inicial Recomendado:** $${analysisResult?.pricing?.minSetup.toLocaleString()} COP a $${analysisResult?.pricing?.maxSetup.toLocaleString()} COP
- **Soporte/Licencia Mensual:** $${analysisResult?.pricing?.mensualidad.toLocaleString()} COP
- **Tasa de Comisión sugerida:** ${analysisResult?.pricing?.comision}%

## 4. Contexto de Adaptación para IA (Portabilidad de Componentes)
- **Sector:** ${ctx.sector || 'N/A'}
- **Color Primario:** ${ctx.primaryColor || 'N/A'}
- **Color Secundario:** ${ctx.secondaryColor || 'N/A'}
- **Tipografía:** ${ctx.googleFont || 'N/A'}
- **Prefijo Firestore:** ${ctx.firestorePrefix || 'N/A'}
- **Feature Flags Activas:** ${ctx.enabledFlags?.join(', ') || 'Ninguna'}

### Componentes Recomendados y Guía de Inyección:
${compsMarkdown}
`;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden text-[var(--color-text)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-indigo-400 w-6 h-6" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">Briefing Studio</h2>
            <span className="text-[10px] text-[var(--color-text-muted)] block font-semibold mt-0.5">Wizard de Descubrimiento & Análisis de Clientes</span>
          </div>
        </div>

        {/* Cargar Sesiones */}
        <div className="flex items-center gap-3 text-xs min-w-[280px]">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] shrink-0">Retomar sesión:</span>
          <div className="w-52">
            <CustomSelect
              value={selectedSessionId}
              onChange={handleSelectSession}
              options={[
                { value: '', label: '-- Nueva Sesión --' },
                ...sessions.map(s => ({
                  value: s.id,
                  label: `${s.nombreEmpresa} (${s.fecha})`
                }))
              ]}
              placeholder="Nueva Sesión"
            />
          </div>
          {selectedSessionId && (
            <button 
              onClick={() => confirmDeleteSession(selectedSessionId)}
              className="p-1.5 bg-red-950/20 hover:bg-red-900/40 border border-red-900/10 text-red-400 [.light_&]:bg-red-50 [.light_&]:hover:bg-red-100 [.light_&]:border-red-100 [.light_&]:text-red-650 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-0 flex items-center justify-center"
              title="Eliminar sesión guardada"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button 
            onClick={injectDemoData}
            className="px-2.5 py-1.5 bg-indigo-950/30 hover:bg-indigo-900/50 border border-indigo-500/10 text-indigo-400 [.light_&]:bg-indigo-50 [.light_&]:hover:bg-indigo-100 [.light_&]:border-indigo-100 [.light_&]:text-indigo-650 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-0 flex items-center gap-1.5 font-bold"
            title="Inyectar datos de prueba en la entrevista"
          >
            <Sparkles size={12} />
            Cargar Demo
          </button>
          <button 
            onClick={clearFormData}
            className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-900/40 border border-red-900/10 text-red-400 [.light_&]:bg-red-50 [.light_&]:hover:bg-red-100 [.light_&]:border-red-100 [.light_&]:text-red-600 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-0 flex items-center gap-1.5 font-bold"
            title="Limpiar datos del formulario"
          >
            <Trash2 size={12} />
            Limpiar Datos
          </button>
          <button 
            onClick={loadSessions}
            className="px-2 py-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] rounded-xl border border-[var(--color-border)] text-[var(--color-text)] cursor-pointer transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-0"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--color-surface-2)]/40 border-b border-[var(--color-border)] px-6">
        <button 
          onClick={() => setActiveTab('interview')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'interview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
        >
          <ClipboardList size={14} />
          Entrevista de Descubrimiento
        </button>
        {analysisResult && (
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'analysis' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
          >
            <Sparkles size={14} />
            Análisis de Viabilidad
          </button>
        )}
      </div>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'interview' ? (
          <>
            {/* Sidebar de Secciones */}
            <div className="w-80 border-r border-[var(--color-border)] bg-[var(--color-bg)]/20 overflow-y-auto p-4 flex flex-col gap-2">
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Progreso del Wizard</span>
                <div className="w-full bg-[var(--color-surface-2)] h-2 rounded-full overflow-hidden mt-1 border border-[var(--color-border)]">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-300" 
                    style={{ width: `${(currentSection / 20) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mt-1">Sección {currentSection} de 20 ({Math.round((currentSection / 20) * 100)}%)</span>
              </div>

              {SECCIONES.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setCurrentSection(sec.id);
                    autoSave();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-start gap-2.5 cursor-pointer ${
                    currentSection === sec.id 
                      ? 'bg-indigo-950/30 border-indigo-500/25 text-indigo-300 [.light_&]:bg-indigo-50 [.light_&]:border-indigo-200 [.light_&]:text-indigo-700' 
                      : 'bg-transparent border-transparent hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] text-[var(--color-text-muted)]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                    currentSection === sec.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  }`}>
                    {sec.id}
                  </span>
                  <div>
                    <h4 className="text-xs font-black tracking-wide">{sec.title}</h4>
                    <span className={`text-[9px] font-semibold block truncate mt-0.5 ${
                      currentSection === sec.id ? 'text-indigo-400/60 [.light_&]:text-indigo-600/70' : 'text-slate-500'
                    }`}>{sec.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Inputs de Sección */}
            <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-surface)]/10 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Paso {currentSection}</span>
                  <h3 className="text-lg font-black text-[var(--color-text)]">{SECCIONES[currentSection - 1].title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{SECCIONES[currentSection - 1].desc}</p>
                </div>

                {/* Renderizar Inputs Dinámicamente según Sección */}
                <div className="bg-[var(--color-bg)]/20 border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
                  {currentSection === 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Core Base de la Aplicación</label>
                        <CustomSelect
                          value={selectedCoreKey}
                          onChange={(val) => setSelectedCoreKey(val)}
                          options={
                            Object.keys(cores).length > 0
                              ? Object.entries(cores).map(([key, c]) => ({
                                  value: key,
                                  label: c.manifest?.coreName || c.nombre || key
                                }))
                              : [{ value: 'ventas', label: 'App Ventas (Core por defecto)' }]
                          }
                          placeholder="Seleccionar Core..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Nombre Comercial de la Empresa</label>
                        <input 
                          type="text" 
                          value={form.seccion1.nombre} 
                          onChange={(e) => handleFieldChange('seccion1', 'nombre', e.target.value)}
                          placeholder="Ej: Ferretería El Clavo"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">NIT / Identificación Fiscal</label>
                        <input 
                          type="text" 
                          value={form.seccion1.nit} 
                          onChange={(e) => handleFieldChange('seccion1', 'nit', e.target.value)}
                          placeholder="Ej: 900.123.456-1"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Ciudad / Municipio</label>
                        <input 
                          type="text" 
                          value={form.seccion1.ciudad} 
                          onChange={(e) => handleFieldChange('seccion1', 'ciudad', e.target.value)}
                          placeholder="Ej: Pitalito, Huila"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Sitio Web / Redes</label>
                        <input 
                          type="text" 
                          value={form.seccion1.web} 
                          onChange={(e) => handleFieldChange('seccion1', 'web', e.target.value)}
                          placeholder="Ej: www.elclavo.com"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 2 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Representante / Contacto</label>
                        <input 
                          type="text" 
                          value={form.seccion2.contacto} 
                          onChange={(e) => handleFieldChange('seccion2', 'contacto', e.target.value)}
                          placeholder="Ej: Sergio Gómez"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Cargo</label>
                        <input 
                          type="text" 
                          value={form.seccion2.cargo} 
                          onChange={(e) => handleFieldChange('seccion2', 'cargo', e.target.value)}
                          placeholder="Ej: Gerente Operativo"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Celular / Teléfono</label>
                        <input 
                          type="text" 
                          value={form.seccion2.celular} 
                          onChange={(e) => handleFieldChange('seccion2', 'celular', e.target.value)}
                          placeholder="Ej: +57 312 345 6789"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Correo Electrónico</label>
                        <input 
                          type="email" 
                          value={form.seccion2.email} 
                          onChange={(e) => handleFieldChange('seccion2', 'email', e.target.value)}
                          placeholder="Ej: contacto@elclavo.com"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Vertical / Sector Económico</label>
                          <input 
                            type="text" 
                            value={form.seccion3.sector} 
                            onChange={(e) => handleFieldChange('seccion3', 'sector', e.target.value)}
                            placeholder="Ej: Ferretería, Modas, Repuestos"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Cantidad de Empleados</label>
                          <input 
                            type="number" 
                            value={form.seccion3.empleados} 
                            onChange={(e) => handleFieldChange('seccion3', 'empleados', e.target.value)}
                            placeholder="Ej: 5"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Número de Sucursales / Sedes</label>
                          <input 
                            type="number" 
                            value={form.seccion3.sedes} 
                            onChange={(e) => handleFieldChange('seccion3', 'sedes', e.target.value)}
                            placeholder="Ej: 2"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Reseña o Historia Corta del Negocio</label>
                        <textarea 
                          value={form.seccion3.reseña} 
                          onChange={(e) => handleFieldChange('seccion3', 'reseña', e.target.value)}
                          placeholder="Breve reseña operativa..."
                          rows={3}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Canales de Venta Utilizados</label>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {['Mostrador', 'WhatsApp', 'Sitio Web / Catálogo', 'Redes Sociales', 'B2B / Distribuidores', 'Venta Telefónica'].map(c => (
                            <label key={c} className="flex items-center gap-2 bg-[var(--color-bg)]/60 p-2.5 rounded-xl border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-2)]">
                              <input 
                                type="checkbox" 
                                checked={form.seccion4.canales?.includes(c.toLowerCase())}
                                onChange={() => handleCheckboxChange('seccion4', 'canales', c.toLowerCase())}
                                className="accent-indigo-500"
                              />
                              {c}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSection === 5 && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Flujo de Captación / Lead</label>
                        <input 
                          type="text" 
                          value={form.seccion5.captacion} 
                          onChange={(e) => handleFieldChange('seccion5', 'captacion', e.target.value)}
                          placeholder="¿Cómo llegan nuevos clientes?"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Flujo de Atención y Cotización</label>
                        <input 
                          type="text" 
                          value={form.seccion5.atencion} 
                          onChange={(e) => handleFieldChange('seccion5', 'atencion', e.target.value)}
                          placeholder="¿Cómo se cotiza y atiende hoy?"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Flujo de Venta y Cobro</label>
                        <input 
                          type="text" 
                          value={form.seccion5.venta} 
                          onChange={(e) => handleFieldChange('seccion5', 'venta', e.target.value)}
                          placeholder="¿Métodos de pago, crédito, fiado?"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 6 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Roles del Negocio</span>
                        <button 
                          onClick={addRoleRow}
                          className="px-2 py-1 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-[10px] font-black cursor-pointer transition-all active:scale-95"
                        >
                          + Agregar Rol
                        </button>
                      </div>

                      <div className="space-y-2">
                        {form.seccion6.roles.map((r, i) => (
                          <div key={i} className="flex gap-2 items-center bg-[var(--color-bg)]/40 p-2.5 rounded-xl border border-[var(--color-border)]">
                            <input 
                              type="text" 
                              value={r.rol}
                              onChange={(e) => handleRoleChange(i, 'rol', e.target.value)}
                              placeholder="Rol (vendedor, cajero, repartidor)"
                              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-text)] flex-1 focus:outline-none focus:ring-0 outline-none focus:border-indigo-500/50 transition-all"
                            />
                            <input 
                              type="number" 
                              value={r.cantidad}
                              onChange={(e) => handleRoleChange(i, 'cantidad', e.target.value)}
                              placeholder="Cant"
                              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-text)] w-16 focus:outline-none focus:ring-0 outline-none focus:border-indigo-500/50 text-center transition-all"
                            />
                            <input 
                              type="text" 
                              value={r.funciones}
                              onChange={(e) => handleRoleChange(i, 'funciones', e.target.value)}
                              placeholder="Funciones principales"
                              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--color-text)] flex-[2] focus:outline-none focus:ring-0 outline-none focus:border-indigo-500/50 transition-all"
                            />
                            <button 
                              onClick={() => removeRoleRow(i)}
                              className="p-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 text-red-400 rounded-lg text-xs"
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSection === 7 && (
                    <div className="space-y-3">
                      {cores[selectedCoreKey]?.manifest?.wizardSteps?.some(s => s.step === 7) ? (
                        renderDynamicManifestFields(7)
                      ) : (
                        <>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Dolores en Caja y Cuentas por Cobrar</label>
                            <input 
                              type="text" 
                              value={form.seccion7.doloresCaja} 
                              onChange={(e) => handleFieldChange('seccion7', 'doloresCaja', e.target.value)}
                              placeholder="Ej: diferencias en cuadres de caja, fiado sin registro..."
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Dolores de Stock e Inventario</label>
                            <input 
                              type="text" 
                              value={form.seccion7.doloresInventario} 
                              onChange={(e) => handleFieldChange('seccion7', 'doloresInventario', e.target.value)}
                              placeholder="Ej: pérdidas de venta por stock agotado..."
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Dolor Principal de Operación (Dolor Core)</label>
                        <textarea 
                          value={form.seccion7.doloresPrincipales} 
                          onChange={(e) => handleFieldChange('seccion7', 'doloresPrincipales', e.target.value)}
                          placeholder="¿Cuál es el dolor número 1 que quieren resolver?"
                          rows={2}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 8 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Horas Perdidas Semanales en Procesos Manuales</label>
                        <input 
                          type="number" 
                          value={form.seccion8.horasPerdidas} 
                          onChange={(e) => handleFieldChange('seccion8', 'horasPerdidas', e.target.value)}
                          placeholder="Ej: 15"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Dinero Estimado Perdido Mensualmente por Errores</label>
                        <input 
                          type="text" 
                          value={form.seccion8.dineroPerdido} 
                          onChange={(e) => handleFieldChange('seccion8', 'dineroPerdido', e.target.value)}
                          placeholder="Ej: $400.000 COP"
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 9 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Tareas a Eliminar (Carga Inútil)</label>
                        <textarea 
                          value={form.seccion9.tareasEliminar} 
                          onChange={(e) => handleFieldChange('seccion9', 'tareasEliminar', e.target.value)}
                          placeholder="Ej: cuadres manuales en cuadernos, llamadas para confirmar pedidos..."
                          rows={3}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Tareas a Automatizar (Eficiencia)</label>
                        <textarea 
                          value={form.seccion9.tareasAutomatizar} 
                          onChange={(e) => handleFieldChange('seccion9', 'tareasAutomatizar', e.target.value)}
                          placeholder="Ej: alertas de stock bajo, recibos PDF automáticos, sincronía de pedidos en la nube..."
                          rows={3}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 10 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">¿Nuevas Sedes a Corto Plazo?</label>
                        <CustomSelect 
                          value={form.seccion10.nuevasSedes} 
                          onChange={(val) => handleFieldChange('seccion10', 'nuevasSedes', val)}
                          options={[
                            { value: 'no', label: 'No' },
                            { value: 'si', label: 'Sí, planea expandirse' }
                          ]}
                          placeholder="Seleccionar..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">¿Requiere Más Personal en el Corto Plazo?</label>
                        <CustomSelect 
                          value={form.seccion10.masPersonal} 
                          onChange={(val) => handleFieldChange('seccion10', 'masPersonal', val)}
                          options={[
                            { value: 'no', label: 'No' },
                            { value: 'si', label: 'Sí, planea contratar más personal' }
                          ]}
                          placeholder="Seleccionar..."
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 11 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Software / Herramientas Actuales en Uso</label>
                          <input 
                            type="text" 
                            value={form.seccion11.softwareActual} 
                            onChange={(e) => handleFieldChange('seccion11', 'softwareActual', e.target.value)}
                            placeholder="Ej: Excel, WhatsApp Business, Cuaderno"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">¿Requiere Operación Offline / Sin Internet?</label>
                          <CustomSelect 
                            value={form.seccion11.offline} 
                            onChange={(val) => handleFieldChange('seccion11', 'offline', val)}
                            options={[
                              { value: 'no', label: 'No, internet estable' },
                              { value: 'si', label: 'Sí, internet inestable o nulo' }
                            ]}
                            placeholder="Seleccionar..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSection === 12 && (
                    <div>
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Reportes e Indicadores Clave del Negocio</label>
                      <textarea 
                        value={form.seccion12.reportes} 
                        onChange={(e) => handleFieldChange('seccion12', 'reportes', e.target.value)}
                        placeholder="Ej: ventas diarias netas, comisiones por vendedor, stock crítico, cuentas por cobrar vencidas..."
                        rows={3}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all resize-none"
                      />
                    </div>
                  )}

                  {currentSection === 13 && (
                    cores[selectedCoreKey]?.manifest?.wizardSteps?.some(s => s.step === 13) ? (
                      renderDynamicManifestFields(13)
                    ) : (
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Integraciones Tecnológicas Necesarias</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { id: 'whatsapp', name: 'Notificaciones WhatsApp (Confirmaciones)' },
                            { id: 'pasarela', name: 'Pasarelas de Pago (Wompi, Bold)' },
                            { id: 'dian', name: 'Facturación Electrónica DIAN' },
                            { id: 'impresora', name: 'Impresoras POS Bluetooth / Térmicas' },
                            { id: 'maps', name: 'Geolocalización / Mapas (Reparto)' }
                          ].map(it => (
                            <label key={it.id} className="flex items-center gap-2 bg-[var(--color-bg)]/60 p-2.5 rounded-xl border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-2)]">
                              <input 
                                type="checkbox" 
                                checked={form.seccion13.integraciones?.includes(it.id)}
                                onChange={() => handleCheckboxChange('seccion13', 'integraciones', it.id)}
                                className="accent-indigo-500"
                              />
                              {it.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {currentSection === 14 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Color Primario (Hex)</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={form.seccion14.colorPrimario} 
                              onChange={(e) => handleFieldChange('seccion14', 'colorPrimario', e.target.value)}
                              className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={form.seccion14.colorPrimario} 
                              onChange={(e) => handleFieldChange('seccion14', 'colorPrimario', e.target.value)}
                              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 text-xs w-full outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Color Secundario (Hex)</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={form.seccion14.colorSecundario} 
                              onChange={(e) => handleFieldChange('seccion14', 'colorSecundario', e.target.value)}
                              className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={form.seccion14.colorSecundario} 
                              onChange={(e) => handleFieldChange('seccion14', 'colorSecundario', e.target.value)}
                              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 text-xs w-full outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Tipografía Google Font</label>
                          <CustomSelect 
                            value={form.seccion14.googleFont} 
                            onChange={(val) => handleFieldChange('seccion14', 'googleFont', val)}
                            options={['Inter', 'Poppins', 'Montserrat', 'Roboto', 'Outfit', 'Plus Jakarta Sans'].map(font => ({
                              value: font,
                              label: font
                            }))}
                            placeholder="Tipografía"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSection === 15 && (
                    cores[selectedCoreKey]?.manifest?.wizardSteps?.some(s => s.step === 15) ? (
                      renderDynamicManifestFields(15)
                    ) : (
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Módulos Requeridos (Obligatorios)</label>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {[
                            { id: 'pos', name: 'Punto de Venta (POS) / Caja' },
                            { id: 'inventario', name: 'Inventario / Alertas Stock' },
                            { id: 'credito', name: 'Créditos / Fiados' },
                            { id: 'agenda', name: 'Citas / Agenda Reservas' },
                            { id: 'dian', name: 'Facturación DIAN' },
                            { id: 'domicilio', name: 'Reparto Domicilios' },
                            { id: 'cupones', name: 'Cupones Descuento' }
                          ].map(req => (
                            <label key={req.id} className="flex items-center gap-2 bg-[var(--color-bg)]/60 p-2.5 rounded-xl border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-2)]">
                              <input 
                                type="checkbox" 
                                checked={form.seccion15.obligatorios?.includes(req.id)}
                                onChange={() => handleCheckboxChange('seccion15', 'obligatorios', req.id)}
                                className="accent-indigo-500"
                              />
                              {req.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  {currentSection === 16 && (
                    cores[selectedCoreKey]?.manifest?.wizardSteps?.some(s => s.step === 16) ? (
                      renderDynamicManifestFields(16)
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Compra Mínima Habilitada</label>
                          <input 
                            type="text" 
                            value={form.seccion16.minCompra} 
                            onChange={(e) => handleFieldChange('seccion16', 'minCompra', e.target.value)}
                            placeholder="Ej: $10.000 COP"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">WhatsApp de Envío de Notificaciones</label>
                          <input 
                            type="text" 
                            value={form.seccion16.whatsappNotificaciones} 
                            onChange={(e) => handleFieldChange('seccion16', 'whatsappNotificaciones', e.target.value)}
                            placeholder="Ej: +57 312 345 6789"
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                          />
                        </div>
                      </div>
                    )
                  )}

                  {currentSection === 17 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Dolor Operativo Detectado (Por el analista)</label>
                        <input 
                          type="text" 
                          value={form.seccion17.dolorPrincipal} 
                          onChange={(e) => handleFieldChange('seccion17', 'dolorPrincipal', e.target.value)}
                          placeholder="Ej: descuadre de caja por fiado manual e informal..."
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Solución Propuesta en la Plataforma</label>
                        <textarea 
                          value={form.seccion17.solucionPropuesta} 
                          onChange={(e) => handleFieldChange('seccion17', 'solucionPropuesta', e.target.value)}
                          placeholder="Ej: Módulo POS + Cuenta de Créditos para cliente final con checkout UUID..."
                          rows={2}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 18 && (
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Madurez Tecnológica del Cliente</label>
                        <CustomSelect 
                          value={form.seccion18.madurezTech} 
                          onChange={(val) => handleFieldChange('seccion18', 'madurezTech', val)}
                          options={[
                            { value: 'alta', label: 'Alta (Maneja Excel, software POS previo)' },
                            { value: 'media', label: 'Media (Maneja WhatsApp, celular básico)' },
                            { value: 'baja', label: 'Baja (Maneja cuaderno físico, reacio a pantallas)' }
                          ]}
                          placeholder="Seleccionar..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Complejidad Estimada del Proyecto</label>
                        <CustomSelect 
                          value={form.seccion18.complejidad} 
                          onChange={(val) => handleFieldChange('seccion18', 'complejidad', val)}
                          options={[
                            { value: 'baja', label: 'Baja (Solo catálogo / landing)' },
                            { value: 'media', label: 'Media (Catálogo + POS + Crédito)' },
                            { value: 'alta', label: 'Alta (Multi-sede, DIAN, pasarelas)' }
                          ]}
                          placeholder="Seleccionar..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Personalización Requerida</label>
                        <CustomSelect 
                          value={form.seccion18.personalizacion} 
                          onChange={(val) => handleFieldChange('seccion18', 'personalizacion', val)}
                          options={[
                            { value: 'baja', label: 'Baja (Plantilla HSL estándar)' },
                            { value: 'media', label: 'Media (Ajustes a flujos operativos básicos)' },
                            { value: 'alta', label: 'Alta (Componentes visuales / lógica exclusiva)' }
                          ]}
                          placeholder="Seleccionar..."
                        />
                      </div>
                    </div>
                  )}

                  {currentSection === 19 && (
                    <div>
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Mapear contra Componentes Reutilizables del Catálogo</label>
                      <div className="grid grid-cols-2 gap-2 text-xs max-h-60 overflow-y-auto">
                        {[
                          { id: 'OrderCard', name: 'Tarjeta de Pedido Admin (OrderCard)' },
                          { id: 'ModalTemplate', name: 'Modal Base Premium (ModalTemplate)' },
                          { id: 'DatePickerPremium', name: 'Selector de Fecha y Rangos (DatePickerPremium)' },
                          { id: 'InventoryTransactionService', name: 'Transacciones Atómicas (InventoryTransactionService)' },
                          { id: 'ThemeManager', name: 'Sistema de Temas Dinámicos (ThemeManager)' },
                          { id: 'guided_toast', name: 'Notificación Toast GuidedToast' }
                        ].map(comp => (
                          <label key={comp.id} className="flex items-center gap-2 bg-[var(--color-bg)]/60 p-2.5 rounded-xl border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface-2)]">
                            <input 
                              type="checkbox" 
                              checked={form.seccion19.componentesId?.includes(comp.id)}
                              onChange={() => handleCheckboxChange('seccion19', 'componentesId', comp.id)}
                              className="accent-indigo-500"
                            />
                            {comp.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSection === 20 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl text-indigo-400 text-xs">
                        <Info size={16} className="shrink-0" />
                        <p>Estas Feature Flags se configurarán en la base de datos de Firestore al aprovisionar al cliente, bloqueando o desbloqueando módulos en caliente sin necesidad de recompilación.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {(cores[selectedCoreKey]?.manifest?.featureFlags || [
                          { id: 'creditsEnabled', label: 'Créditos y Fiado' },
                          { id: 'couponsEnabled', label: 'Cupones de Descuento' },
                          { id: 'wholesaleEnabled', label: 'Ventas por Mayoreo' },
                          { id: 'deliveryEnabled', label: 'Seguimiento de Domicilios' },
                          { id: 'enableDianBilling', label: 'Facturación Electrónica DIAN' }
                        ]).map(flag => (
                          <div key={flag.id} className="flex items-center justify-between bg-[var(--color-bg)]/60 p-3 rounded-xl border border-[var(--color-border)]">
                            <span className="text-xs text-[var(--color-text)] font-bold">{flag.label}</span>
                            <button
                              onClick={() => {
                                const currentFlags = form.seccion20.flags || {};
                                handleFieldChange('seccion20', 'flags', {
                                  ...currentFlags,
                                  [flag.id]: !currentFlags[flag.id]
                                });
                              }}
                              className={`w-10 h-6 rounded-full p-1 transition-all ${form.seccion20.flags?.[flag.id] ? 'bg-emerald-600' : 'bg-slate-700'}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-all ${form.seccion20.flags?.[flag.id] ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Navegación del Wizard */}
              <div className="flex justify-between items-center mt-6 border-t border-[var(--color-border)] pt-4">
                <button
                  onClick={handlePrev}
                  disabled={currentSection === 1}
                  className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-slate-800 disabled:opacity-40 rounded-xl text-xs flex items-center gap-2 border border-[var(--color-border)] cursor-pointer"
                >
                  <ArrowLeft size={14} /> Anterior
                </button>

                {currentSection === 20 ? (
                  <button
                    onClick={handleAnalyzeBriefing}
                    disabled={analyzing}
                    className="px-6 py-2 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-40 rounded-xl text-xs font-black flex items-center gap-2 text-white shadow-lg cursor-pointer transition-all active:scale-95"
                  >
                    {analyzing ? 'Procesando...' : 'Completar y Analizar Discovery'} <Play size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs flex items-center gap-2 text-white cursor-pointer"
                  >
                    Siguiente <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* MODO 2: RESULTADOS Y ANÁLISIS DE VIABILIDAD */
          <div className="flex-1 p-8 overflow-y-auto bg-[var(--color-surface)]/10 space-y-6">
            {/* Header del Diagnóstico */}
            <div className="flex justify-between items-start bg-[var(--color-surface-2)]/30 p-6 rounded-2xl border border-[var(--color-border)]">
              <div>
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Diagnóstico Estratégico Completado</span>
                <h3 className="text-xl font-black text-[var(--color-text)] mt-1">Viabilidad de Proyecto: {form.seccion1.nombre || 'Sin Nombre'}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-2 max-w-2xl">{analysisResult.resumenEjecutivo}</p>
              </div>

              {/* Score Badges */}
              <div className="flex gap-4">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl text-center min-w-[100px]">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Score Total</span>
                  <div className="text-lg font-black text-[var(--color-text)] mt-1">{analysisResult.score?.total} <span className="text-xs text-[var(--color-text-muted)] font-normal">/ 108</span></div>
                </div>
                <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl text-center min-w-[100px]">
                  <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider">Nivel</span>
                  <div className="text-xs font-black text-indigo-300 mt-2">{analysisResult.score?.nivel}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Bloque 1: Propuesta Económica Estimada */}
              <div className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                  <Database size={14} /> Propuesta Comercial Estimada
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-[var(--color-text-muted)]">Setup Inicial (Estimado):</span>
                    <span className="font-bold text-[var(--color-text)]">
                      ${analysisResult.pricing?.minSetup.toLocaleString()} - ${analysisResult.pricing?.maxSetup.toLocaleString()} COP
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-[var(--color-text-muted)]">Licencia / Soporte Mensual:</span>
                    <span className="font-bold text-[var(--color-text)]">
                      ${analysisResult.pricing?.mensualidad.toLocaleString()} COP
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-[var(--color-text-muted)]">Comisión por Transacción:</span>
                    <span className="font-bold text-emerald-400">
                      {analysisResult.pricing?.comision}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Feature Flags Recomendadas */}
              <div className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                  <Layers size={14} /> Feature Flags Sugeridas
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(analysisResult.recommendedFlags).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-1">
                      <span className="text-[var(--color-text-muted)] font-semibold">{key}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${val ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[var(--color-surface-2)] text-slate-500 border border-[var(--color-border)]'}`}>
                        {val ? 'Habilitar' : 'Apagado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque 3: Componentes de Biblioteca Recomendados */}
              <div className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={14} /> Componentes de Biblioteca a Usar
                    </h4>
                    <span className="text-[10px] text-[var(--color-text-muted)] block font-semibold mt-0.5">Agrupados por categoría de sistema</span>
                  </div>
                  {analysisResult.appContext && (
                    <button
                      onClick={handleCopyPrompt}
                      className="px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/25 hover:bg-indigo-600/20 text-[10px] font-bold text-indigo-400 flex items-center gap-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Copy size={11} />
                      Copiar Prompt de Adaptación
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs max-h-80 overflow-y-auto scrollbar-thin">
                  {Object.keys(groupedComponents).length === 0 ? (
                    <p className="text-slate-500 italic text-center py-4">No se recomendaron componentes específicos.</p>
                  ) : (
                    Object.values(groupedComponents).map(group => {
                      const style = COMP_TYPE_STYLES[group.typeKey] || COMP_TYPE_STYLES.component;
                      const isCollapsed = expandedCompCat !== group.label;

                      return (
                        <div key={group.label} className="space-y-1.5">
                          {/* Carpeta Cabecera */}
                          <button
                            onClick={() => setExpandedCompCat(prev => prev === group.label ? null : group.label)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl ${style.bg} border ${style.border} hover:opacity-90 transition-opacity cursor-pointer text-left`}
                          >
                            <ChevronRight
                              size={10}
                              className={`${style.color} transition-transform duration-200 shrink-0 ${isCollapsed ? '' : 'rotate-90'}`}
                            />
                            <span className="text-xs leading-none shrink-0">{style.icon}</span>
                            <div className="flex-1 min-w-0">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${style.color}`}>
                                {group.label}
                              </span>
                            </div>
                            <span className={`${style.bg} ${style.color} px-1.5 py-0.5 rounded-full text-[8px] font-black shrink-0 border ${style.border}`}>
                              {group.components.length}
                            </span>
                          </button>

                          {/* Lista con animación */}
                          <AnimatePresence initial={false}>
                            {!isCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1, transition: { height: { type: 'spring', damping: 25, stiffness: 220 }, opacity: { duration: 0.15 } } }}
                                exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.18 }, opacity: { duration: 0.1 } } }}
                                className="overflow-hidden pl-3 pr-1 py-1 space-y-1.5 border-l border-dashed border-[var(--color-border)] ml-3.5"
                              >
                                {group.components.map((comp, idx) => (
                                  <div key={idx} className="p-3 bg-[var(--color-bg)]/60 border border-[var(--color-border)] rounded-xl space-y-1.5">
                                    <div>
                                      <span className="font-bold text-[var(--color-text)] block text-xs">{comp.name}</span>
                                      {comp.technicalName && (
                                        <span className="text-[9px] font-mono text-slate-500 block">{comp.technicalName}</span>
                                      )}
                                    </div>
                                    {comp.adaptationHints && comp.adaptationHints.length > 0 && (
                                      <div className="pt-2 border-t border-[var(--color-border)]/40 space-y-1">
                                        <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest block">Instrucciones de portabilidad:</span>
                                        <ul className="list-disc pl-3 text-[9px] text-[var(--color-text-muted)] space-y-0.5">
                                          {comp.adaptationHints.map((hint, hIdx) => (
                                            <li key={hIdx}>{hint}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Acciones Finales del Análisis */}
            <div className="flex justify-end gap-3 mt-6 border-t border-[var(--color-border)] pt-6">
              <button
                onClick={handleExportMarkdown}
                disabled={exporting}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-slate-800 border border-[var(--color-border)] text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <FileText size={14} /> {exporting ? 'Exportando...' : 'Exportar a Plantillas de Levantamiento (.md)'}
              </button>

              <button
                onClick={handlePortToOnboarding}
                className="px-6 py-2 bg-indigo-650 hover:bg-indigo-600 text-xs font-black rounded-xl flex items-center gap-2 text-white shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <UserPlus size={14} /> Crear Cliente desde Briefing (Importar a Onboarding)
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && sessionToDelete && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) { setShowDeleteModal(false); setSessionToDelete(null); } }}
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl ring-1 ring-red-500/30 animate-fade-in-up text-left">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-[var(--color-surface-2)] rounded-2xl shrink-0">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-black text-sm text-[var(--color-text)]">Eliminar sesión</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar la sesión de briefing de **"{sessionToDelete.nombreEmpresa || 'Sin Nombre'}"**? Esta acción es irreversible.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionToDelete(null);
                }}
                className="flex-1 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSession}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showExportSuccessModal && exportedPaths.briefing && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={e => { if (e.target === e.currentTarget) setShowExportSuccessModal(false); }}
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-7 max-w-lg w-full mx-4 shadow-2xl ring-1 ring-emerald-500/30 animate-scale-in text-left">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-[var(--color-surface-2)] rounded-2xl shrink-0">
                <CheckCircle2 size={22} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm text-[var(--color-text)]">¡Documentos Exportados con Éxito!</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                  Los archivos en formato Markdown (.md) han sido guardados en el almacenamiento local del proyecto de documentación.
                </p>

                <div className="mt-4 space-y-3 bg-[var(--color-bg)]/40 p-4 rounded-2xl border border-[var(--color-border)] text-[11px] font-mono">
                  <div>
                    <span className="text-emerald-400 block font-bold mb-1">📝 Briefing de Levantamiento:</span>
                    <div className="flex items-center gap-2 bg-[var(--color-surface-2)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)]">
                      <span className="truncate flex-1 text-slate-300 select-all">{exportedPaths.briefing}</span>
                      <button
                        onClick={() => {
                          copyTextToClipboard(exportedPaths.briefing, 'Ruta copiada ✓');
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-[var(--color-text)] cursor-pointer"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-emerald-400 block font-bold mb-1">📊 Análisis de Viabilidad:</span>
                    <div className="flex items-center gap-2 bg-[var(--color-surface-2)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)]">
                      <span className="truncate flex-1 text-slate-300 select-all">{exportedPaths.analisis}</span>
                      <button
                        onClick={() => {
                          copyTextToClipboard(exportedPaths.analisis, 'Ruta copiada ✓');
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-[var(--color-text)] cursor-pointer"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-300 flex items-center gap-2">
                  <Info size={14} className="shrink-0" />
                  <span>Tip: Puedes arrastrar estas rutas directas en Obsidian o abrirlas en tu editor Markdown favorito.</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setShowExportSuccessModal(false)}
                className="px-6 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
