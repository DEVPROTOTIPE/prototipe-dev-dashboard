import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Settings, 
  FileText, 
  Copy, 
  Save, 
  UserPlus, 
  Check, 
  DollarSign, 
  ChevronRight, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { exportProposalPDF } from '../../services/pdfService';

const PASOS_SCORING = [
  {
    titulo: 'Paso 1: Complejidad Funcional',
    desc: 'Determina los módulos del Core y lógica requeridos por el cliente (Max 32 pts).',
    preguntas: [
      {
        id: 'funcional',
        tipo: 'radio',
        opciones: [
          { label: '🔴 Nivel 1: Landing comercial e institucional básico (Sin usuarios ni DB)', pts: 4 },
          { label: '🔴 Nivel 2: Catálogo digital / Tienda QR simple (Menú de productos estáticos, WhatsApp link)', pts: 8 },
          { label: '🟡 Nivel 3: Sistema con roles y Auth (Admin + Vendedores + Clientes, carrito persistente)', pts: 14 },
          { label: '🟡 Nivel 4: Inventarios avanzados y Multi-sucursal (Traspasos, alertas críticas de stock)', pts: 20 },
          { label: '🟢 Nivel 5: POS Completo (Control de caja diaria, cierres, egresos e ingresos auxiliares)', pts: 26 },
          { label: '🟢 Nivel 6: Facturación Electrónica DIAN y Devoluciones automatizadas', pts: 32 }
        ]
      }
    ]
  },
  {
    titulo: 'Paso 2: Complejidad Técnica e Integraciones',
    desc: 'Bases de datos, tiempo real y plataformas necesarias (Max 22 pts).',
    preguntas: [
      {
        id: 'tecnico',
        tipo: 'radio',
        opciones: [
          { label: '🔴 Nivel 1: Estructura simple (Base de datos Firestore básica, lecturas directas)', pts: 4 },
          { label: '🟡 Nivel 2: Reglas de negocio intermedias (Cupones, descuentos por volumen, garantías)', pts: 10 },
          { label: '🟡 Nivel 3: Tiempo Real y Offline-First (Sincronía bidireccional en caliente, IndexedDB local)', pts: 16 },
          { label: '🟢 Nivel 4: Integraciones externas complejas (Pasarela de pagos + DIAN + Mapas en ruta)', pts: 22 }
        ]
      }
    ]
  },
  {
    titulo: 'Paso 3: Nivel de Personalización Estética/Visual',
    desc: 'Diseño e identidad visual y branding dinámico (Max 17 pts).',
    preguntas: [
      {
        id: 'personalizacion',
        tipo: 'radio',
        opciones: [
          { label: '🔴 Nivel 1: Estándar (Plantilla limpia del Core adaptando colores HSL base)', pts: 4 },
          { label: '🟡 Nivel 2: Media (Ajustes en el layout, banners radiales interactivos y cursor customizado)', pts: 10 },
          { label: '🟢 Nivel 3: Alta (Diseño a la medida con componentes 3D Holographic, Bento analíticas exclusivos)', pts: 17 }
        ]
      }
    ]
  },
  {
    titulo: 'Paso 4: Riesgos y Definición de Alcance',
    desc: 'Claridad en los requerimientos del cliente potencial (Max 17 pts).',
    preguntas: [
      {
        id: 'riesgo',
        tipo: 'radio',
        opciones: [
          { label: '🔴 Nivel 1: Bajo (Requerimientos cerrados, cliente con madurez tecnológica previa)', pts: 4 },
          { label: '🟡 Nivel 2: Medio (Requerimientos definidos pero sujeto a ajustes en fase beta)', pts: 10 },
          { label: '🟢 Nivel 3: Alto (Cliente no conoce su proceso, dependencias de software legado de terceros)', pts: 17 }
        ]
      }
    ]
  },
  {
    titulo: 'Paso 5: Valor Empresarial',
    desc: 'Ahorro de horas y reducción de dinero perdido estimado (Max 20 pts).',
    preguntas: [
      {
        id: 'valor',
        tipo: 'radio',
        opciones: [
          { label: '🔴 Nivel 1: Retorno moderado (Digitalización simple de catálogo para visibilidad)', pts: 5 },
          { label: '🟡 Nivel 2: Ahorro de tiempo (~2 a 3 horas libres diarias en administración)', pts: 10 },
          { label: '🟡 Nivel 3: Control absoluto (Reducción de diferencias en caja a 0% y stock crítico)', pts: 15 },
          { label: '🟢 Nivel 4: Crítico para el negocio (El sistema es el núcleo comercial que habilita la escala)', pts: 20 }
        ]
      }
    ]
  }
];

const DEFAULT_PRICING_MATRIX = [
  { nivel: '🔴 Micro', minPts: 0, maxPts: 20, setupMin: 500000, setupMax: 1500000, mensualidad: 50000, comision: 1.0 },
  { nivel: '🟡 Pequeño', minPts: 21, maxPts: 40, setupMin: 1500000, setupMax: 4000000, mensualidad: 100000, comision: 1.5 },
  { nivel: '🟢 Medio', minPts: 41, maxPts: 60, setupMin: 3500000, setupMax: 7000000, mensualidad: 180000, comision: 2.0 },
  { nivel: '🔵 Grande', minPts: 61, maxPts: 80, setupMin: 6000000, setupMax: 12000000, mensualidad: 300000, comision: 2.5 },
  { nivel: '⭐ Estratégico', minPts: 81, maxPts: 108, setupMin: 10000000, setupMax: 25000000, mensualidad: 500000, comision: 3.5 }
];

export default function CotizadorView({ dbInstance, showToast, onImportToOnboarding }) {
  const [activeTab, setActiveTab] = useState('calculadora'); // 'calculadora' | 'config'
  const [scores, setScores] = useState({
    funcional: 4,
    tecnico: 4,
    personalizacion: 4,
    riesgo: 4,
    valor: 5
  });

  // Matriz de precios
  const [pricingMatrix, setPricingMatrix] = useState(DEFAULT_PRICING_MATRIX);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Form de propuesta
  const [clienteName, setClienteName] = useState('');
  const [resumenPropuesta, setResumenPropuesta] = useState('');
  const [factorAjuste, setFactorAjuste] = useState(0); // Porcentaje de descuento o recargo (-30 a +50)
  const [pagoMensualCustom, setPagoMensualCustom] = useState('');
  const [comisionCustom, setComisionCustom] = useState('');
  const [setupCustom, setSetupCustom] = useState('');

  // Cargar configuración de Firestore
  useEffect(() => {
    loadPricingConfig();
  }, []);

  const loadPricingConfig = async () => {
    if (!dbInstance) return;
    setLoadingConfig(true);
    try {
      const docRef = doc(dbInstance, 'dashboard_config', 'pricing_matrix');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().matrix) {
        setPricingMatrix(snap.data().matrix);
      }
    } catch (err) {
      console.warn('Aviso: cargando matriz de precios por defecto (offline o firestore restrictivo)');
    } finally {
      setLoadingConfig(false);
    }
  };

  const savePricingConfig = async () => {
    if (!dbInstance) return;
    try {
      const docRef = doc(dbInstance, 'dashboard_config', 'pricing_matrix');
      await setDoc(docRef, { matrix: pricingMatrix, actualizadoEn: serverTimestamp() });
      showToast('Matriz de precios guardada en Firestore ✓', { type: 'success' });
    } catch (err) {
      showToast(`Error al guardar: ${err.message}`, { type: 'error' });
    }
  };

  // Cálculos en caliente
  const totalPts = Object.values(scores).reduce((a, b) => a + b, 0);

  const matchedNivel = pricingMatrix.find(
    n => totalPts >= n.minPts && totalPts <= n.maxPts
  ) || pricingMatrix[0];

  const baseSetupMin = matchedNivel.setupMin;
  const baseSetupMax = matchedNivel.setupMax;
  const baseSetupMed = (baseSetupMin + baseSetupMax) / 2;

  // Aplicar factor de ajuste
  const setupVal = setupCustom !== '' ? parseFloat(setupCustom) : Math.round(baseSetupMed * (1 + factorAjuste / 100));
  const mensualidadVal = pagoMensualCustom !== '' ? parseFloat(pagoMensualCustom) : matchedNivel.mensualidad;
  const comisionVal = comisionCustom !== '' ? parseFloat(comisionCustom) : matchedNivel.comision;

  const handleScoreChange = (pasoId, pts) => {
    setScores(prev => ({ ...prev, [pasoId]: pts }));
    // Limpiar campos custom para recalcular
    setSetupCustom('');
    setPagoMensualCustom('');
    setComisionCustom('');
  };

  const handleMatrixCellChange = (nivelIdx, key, val) => {
    const updated = pricingMatrix.map((n, i) => {
      if (i === nivelIdx) return { ...n, [key]: parseFloat(val) || 0 };
      return n;
    });
    setPricingMatrix(updated);
  };

  const generateMarkdownProposal = () => {
    return `### PROPUESTA COMERCIAL: ${clienteName || 'Prospecto'}
Fecha: ${new Date().toLocaleDateString()}
Total Score: ${totalPts} pts (${matchedNivel.nivel})

1. **Setup Inicial**: $${setupVal.toLocaleString()} COP
2. **Mensualidad de Licencia/Soporte**: $${mensualidadVal.toLocaleString()} COP
3. **Tasa de Comisión por Transacción**: ${comisionVal}%

**Resumen de Alcance**:
${resumenPropuesta || 'Digitalización y control operativo del negocio mediante el Ecosistema PROTOTIPE.'}
`;
  };

  const handleCopyMarkdown = () => {
    const text = generateMarkdownProposal();
    navigator.clipboard.writeText(text);
    showToast('Cotización copiada al portapapeles en Markdown ✓', { type: 'success' });
  };

  const handleExportPDF = () => {
    exportProposalPDF({
      clienteName: clienteName || 'Prospecto',
      resumen: resumenPropuesta,
      setupVal,
      mensualidadVal,
      comisionVal,
      modulos: Object.entries(scores).map(([k, v]) => `${k.toUpperCase()}: ${v} pts`)
    });
    showToast('Propuesta comercial exportada a PDF ✓', { type: 'success' });
  };

  const handlePortToOnboarding = () => {
    if (!onImportToOnboarding) return;
    onImportToOnboarding({
      projectName: clienteName,
      requirements: `Resumen de Cotización:\n${resumenPropuesta}`,
      setupFee: setupVal,
      mensualidad: mensualidadVal,
      comision: comisionVal,
      branding: {
        primaryColor: '#4f46e5',
        secondaryColor: '#0f172a',
        googleFont: 'Inter'
      },
      flags: {
        creditsEnabled: scores.funcional >= 14,
        enableDianBilling: scores.funcional >= 32
      }
    });
    showToast('Datos de cotización transferidos al Asistente ✓', { type: 'success' });
  };

  const handleSaveQuotation = async () => {
    if (!dbInstance || !clienteName) {
      showToast('Ingresa el nombre del cliente para guardar', { type: 'warning' });
      return;
    }
    try {
      const qRef = doc(dbInstance, 'cotizaciones', `${sanitizeFileName(clienteName)}_${Date.now()}`);
      await setDoc(qRef, {
        clienteName,
        totalPts,
        nivel: matchedNivel.nivel,
        setupVal,
        mensualidadVal,
        comisionVal,
        resumenPropuesta,
        scores,
        creadoEn: serverTimestamp()
      });
      showToast('Cotización guardada exitosamente en Firestore ✓', { type: 'success' });
    } catch (err) {
      showToast(`Error al guardar: ${err.message}`, { type: 'error' });
    }
  };

  function sanitizeFileName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').substring(0, 30);
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden text-[var(--color-text)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Calculator className="text-emerald-400 w-6 h-6" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">Cotizador de Proyectos</h2>
            <span className="text-[10px] text-[var(--color-text-muted)] block font-semibold mt-0.5">Calculadora Interactiva de Setup, SaaS y Comisiones</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-0.5 text-xs">
          <button 
            onClick={() => setActiveTab('calculadora')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all focus:outline-none focus:ring-0 ${activeTab === 'calculadora' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
          >
            Calculadora
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all focus:outline-none focus:ring-0 ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
          >
            Matriz de Precios
          </button>
        </div>
      </div>

      {activeTab === 'calculadora' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Panel Izquierdo: Calculadora Stepper */}
          <div className="w-1/2 border-r border-[var(--color-border)] overflow-y-auto p-6 space-y-6 bg-[var(--color-bg)]/20">
            {PASOS_SCORING.map((paso, idx) => (
              <div key={idx} className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[var(--color-surface-2)] flex items-center justify-center text-[10px] text-[var(--color-text-muted)] font-bold">{idx + 1}</span>
                  {paso.titulo}
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold">{paso.desc}</p>
                
                <div className="space-y-2 mt-2">
                  {paso.preguntas[0].opciones.map((opt, oIdx) => (
                    <label 
                      key={oIdx}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        scores[paso.preguntas[0].id] === opt.pts 
                          ? 'bg-indigo-950/30 border-indigo-500/25 text-indigo-300 [.light_&]:bg-indigo-50 [.light_&]:border-indigo-200 [.light_&]:text-indigo-700' 
                          : 'bg-[var(--color-bg)]/40 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]/55'
                      }`}
                    >
                      <input 
                        type="radio"
                        name={paso.preguntas[0].id}
                        checked={scores[paso.preguntas[0].id] === opt.pts}
                        onChange={() => handleScoreChange(paso.preguntas[0].id, opt.pts)}
                        className="mt-0.5 accent-indigo-500"
                      />
                      <div className="flex-1 text-xs">
                        <span className={`font-semibold block ${
                          scores[paso.preguntas[0].id] === opt.pts 
                            ? 'text-indigo-200 [.light_&]:text-indigo-900' 
                            : 'text-[var(--color-text)]'
                        }`}>{opt.label}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                        scores[paso.preguntas[0].id] === opt.pts
                          ? 'bg-indigo-900/40 text-indigo-300 [.light_&]:bg-indigo-100 [.light_&]:text-indigo-700'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                      }`}>
                        {opt.pts} pts
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Panel Derecho: Propuesta y Resultados */}
          <div className="w-1/2 overflow-y-auto p-6 space-y-6 flex flex-col justify-between bg-[var(--color-bg)]/10">
            <div className="space-y-6">
              {/* Score total */}
              <div className="bg-[var(--color-bg)]/50 border border-[var(--color-border)] p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-black text-[var(--color-text-muted)] tracking-widest block">Complejidad Estimada</span>
                  <h4 className="text-2xl font-black text-[var(--color-text)] mt-1">{totalPts} <span className="text-xs text-[var(--color-text-muted)] font-normal">/ 108 pts</span></h4>
                  <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block mt-1">Clasificación: {matchedNivel.nivel}</span>
                </div>

                <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl text-center min-w-[120px] [.light_&]:bg-indigo-50 [.light_&]:border-indigo-100">
                  <span className="text-[9px] uppercase font-bold text-indigo-400 [.light_&]:text-indigo-650 tracking-wider">Setup Base Recomendado</span>
                  <div className="text-xs font-black text-indigo-200 [.light_&]:text-indigo-900 mt-2">
                    ${baseSetupMin.toLocaleString()} - ${baseSetupMax.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Formulario de Ajustes */}
              <div className="bg-[var(--color-bg)]/40 border border-[var(--color-border)] p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Ajuste de Propuesta Económica</h4>
                
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Nombre del Cliente / Empresa</label>
                  <input 
                    type="text"
                    value={clienteName}
                    onChange={(e) => setClienteName(e.target.value)}
                    placeholder="Ej: Repuestos Pitalito"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                  />
                </div>

                {/* Factor de ajuste slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Factor de Ajuste (Markup / Descuento)</label>
                    <span className={`text-xs font-bold ${factorAjuste > 0 ? 'text-amber-400' : factorAjuste < 0 ? 'text-emerald-400' : 'text-[var(--color-text-muted)]'}`}>
                      {factorAjuste > 0 ? `+${factorAjuste}% Recargo` : `${factorAjuste}% Descuento`}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="-30" 
                    max="50" 
                    step="5"
                    value={factorAjuste}
                    onChange={(e) => {
                      setFactorAjuste(parseInt(e.target.value, 10));
                      setSetupCustom(''); // Borrar custom setup al mover slider
                    }}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Inputs personalizados manuales (overrides) */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Setup Final ($)</label>
                    <input 
                      type="number"
                      value={setupCustom !== '' ? setupCustom : setupVal}
                      onChange={(e) => setSetupCustom(e.target.value)}
                      placeholder={setupVal}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Mensual ($)</label>
                    <input 
                      type="number"
                      value={pagoMensualCustom !== '' ? pagoMensualCustom : mensualidadVal}
                      onChange={(e) => setPagoMensualCustom(e.target.value)}
                      placeholder={mensualidadVal}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Comisión (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={comisionCustom !== '' ? comisionCustom : comisionVal}
                      onChange={(e) => setComisionCustom(e.target.value)}
                      placeholder={comisionVal}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Resumen / Notas de Requerimientos Especiales</label>
                  <textarea 
                    value={resumenPropuesta} 
                    onChange={(e) => setResumenPropuesta(e.target.value)}
                    placeholder="Escribe detalles o ajustes especiales para este cliente..."
                    rows={3}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:border-indigo-500/50 focus:outline-none focus:ring-0 outline-none text-[var(--color-text)] resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Acciones del Cotizador */}
            <div className="flex gap-2 border-t border-[var(--color-border)] pt-4 mt-6">
              <button 
                onClick={handleCopyMarkdown}
                className="flex-1 py-2 bg-[var(--color-surface-2)]/80 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-0"
              >
                <Copy size={14} /> Markdown
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex-1 py-2 bg-[var(--color-surface-2)]/80 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus:ring-0"
              >
                <FileText size={14} /> Exportar PDF
              </button>
              <button 
                onClick={handleSaveQuotation}
                className="flex-1 py-2 bg-emerald-700/80 hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-white focus:outline-none focus:ring-0"
              >
                <Save size={14} /> Guardar
              </button>
              <button 
                onClick={handlePortToOnboarding}
                className="flex-[1.5] py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-white focus:outline-none focus:ring-0"
              >
                <UserPlus size={14} /> Crear Cliente
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA: CONFIGURACIÓN DE LA MATRIZ DE PRECIOS */
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center bg-[var(--color-surface-2)]/30 p-6 rounded-2xl border border-[var(--color-border)]">
            <div>
              <h3 className="text-sm font-black uppercase text-[var(--color-text)]">Matriz de Precios Oficial</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Configura las tarifas mínimas, máximas y mensualidades según el puntaje de complejidad.</p>
            </div>
            <button 
              onClick={savePricingConfig}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold flex items-center gap-2 text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-0"
            >
              <Save size={14} /> Guardar Cambios en Firestore
            </button>
          </div>

          <div className="bg-[var(--color-bg)]/20 border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider text-[9px] font-black">
                  <th className="p-4">Nivel</th>
                  <th className="p-4">Puntaje</th>
                  <th className="p-4">Setup Mín ($)</th>
                  <th className="p-4">Setup Máx ($)</th>
                  <th className="p-4">Mensualidad ($)</th>
                  <th className="p-4">Comisión (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {pricingMatrix.map((lvl, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-surface-2)]/30 text-[var(--color-text-muted)]">
                    <td className="p-4 font-bold text-[var(--color-text)]">{lvl.nivel}</td>
                    <td className="p-4">
                      {lvl.minPts} - {lvl.maxPts}
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={lvl.setupMin}
                        onChange={(e) => handleMatrixCellChange(idx, 'setupMin', e.target.value)}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs text-[var(--color-text)] w-28 outline-none focus:border-indigo-500/50 focus:outline-none focus:ring-0 font-bold"
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={lvl.setupMax}
                        onChange={(e) => handleMatrixCellChange(idx, 'setupMax', e.target.value)}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs text-[var(--color-text)] w-28 outline-none focus:border-indigo-500/50 focus:outline-none focus:ring-0 font-bold"
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={lvl.mensualidad}
                        onChange={(e) => handleMatrixCellChange(idx, 'mensualidad', e.target.value)}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs text-[var(--color-text)] w-28 outline-none focus:border-indigo-500/50 focus:outline-none focus:ring-0 font-bold"
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        step="0.1"
                        value={lvl.comision}
                        onChange={(e) => handleMatrixCellChange(idx, 'comision', e.target.value)}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-xs text-[var(--color-text)] w-20 outline-none focus:border-indigo-500/50 focus:outline-none focus:ring-0 font-bold text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
