import React, { useState, useEffect, useMemo } from 'react';
import useCrm from '../../../hooks/useCrm';
import CustomSelect from '../../ui/CustomSelect';
import useToast from '../../../hooks/useToast';
import { 
  ClipboardList, Building, Layers, AlertTriangle, Cpu, Sliders, ShieldCheck, 
  Save, Check, AlertCircle, RefreshCw, Star, Info
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  // 1. Información General
  companyName: '',
  commercialName: '',
  nit: '',
  sector: 'retail_clothing',
  city: '',
  address: '',
  website: '',
  socialMedia: '',
  contactName: '',
  contactRole: '',
  contactPhone: '',
  contactWhatsapp: '',
  contactEmail: '',

  // 2. Contexto Empresarial
  history: '',
  employeeCount: '',
  headquartersCount: '',
  mainBusinessLines: '',
  biggestChallenge: '',

  // 3. Modelo de Negocio
  whatItSells: '',
  mainProductsServices: '',
  highestIncomeProducts: '',
  highestProblemProducts: '',
  idealCustomer: '',
  currentCustomerProfile: '',
  customerRecurrence: 'both', // 'recurrent' | 'sporadic' | 'both'
  salesChannels: [], // list of channels: presencial, whatsapp, instagram, facebook, web, marketplace, other

  // 4. Flujo Operativo Actual
  captacionFlow: '',
  atencionFlow: '',
  ventaFlow: '',
  entregaFlow: '',
  postventaFlow: '',

  // 5. Usuarios y Roles
  rolesTable: {
    admin: { count: '', functions: '' },
    employee: { count: '', functions: '' },
    supervisor: { count: '', functions: '' },
    customer: { count: '', functions: '' }
  },

  // 6. Problemas y Dolores
  doloresOperativos: '',
  doloresAdministrativos: '',
  doloresComerciales: '',

  // 7. Impacto Económico
  lostTimeWeekly: '',
  lostMoneyErrors: '',
  mostExpensiveProblem: '',

  // 8. Oportunidades de Automatización
  eliminateManualTask: '',
  automateTask: '',
  complexProcess: '',

  // 9. Crecimiento y Escalabilidad
  oneYearGoal: '',
  newLocationsPlan: '',
  newStaffPlan: '',
  doubleCustomersImpact: '',

  // 10. Tecnología Actual
  currentSoftware: '',
  softwareLikes: '',
  softwareDislikes: '',

  // 11. Reportes e Indicadores
  dailyReports: '',
  weeklyReports: '',
  monthlyReports: '',
  desiredAutoReports: '',

  // 12. Integraciones Necesarias
  integrationsList: [], // whatsapp, email, gateway, billing, printers, scales, external_api, other

  // 13. Branding e Identidad Visual
  hasLogo: 'no',
  hasBrandManual: 'no',
  primaryColor: '#6366F1',
  secondaryColor: '#10B981',
  actionColor: '#EC4899',
  desiredStyle: [], // minimalista, corporativo, moderno, elegante, industrial, other

  // 14. Requerimientos Funcionales
  mandatoryRequirements: '',
  desirableRequirements: '',

  // 15. Parametrización Técnica del Core
  hasProductVariants: 'no',
  hasVolumePricing: 'no',
  hasOnDemandProducts: 'no',
  minPurchaseAmount: '',
  operativeWhatsappNumber: '',
  paymentMethods: [], // bank_transfer, cash, card, gateway, other
  hasCredits: 'no',
  creditLimitPerCustomer: '',
  hasCoupons: 'no',
  hasClaimsModule: 'no',

  // 16. Resumen del Analista PROTOTIPE
  analystMainProblem: '',
  analystMainOpportunity: '',
  analystMainAutomation: '',
  analystExpectedBenefit: '',

  // 17. Diagnóstico Preliminar
  techMaturityLevel: 'medio', // 'bajo' | 'medio' | 'alto'
  complexityLevel: 'media', // 'baja' | 'media' | 'alta' | 'muy_alta'
  customizationLevel: 'medio', // 'bajo' | 'medio' | 'alto'
  preliminaryDiagnosis: '',

  // 18. Componentes Reutilizables Identificados
  reusableComponents: [], // catalog, inventory, cart, checkout, orders, tracking, crm, agenda, billing, reports, logistics, clients, coupons, credits, claims

  // 19. Feature Flags Propuestas
  featureFlags: {
    creditsEnabled: false,
    couponsEnabled: false,
    claimsEnabled: false,
    wholesaleEnabled: false,
    inventoryEnabled: false,
    reportsEnabled: false,
    appointmentsEnabled: false,
    crmEnabled: false,
    trackingEnabled: false
  },

  // 20. Próximos Pasos
  nextStepsList: [], // next_diag, next_prop_tech, next_prop_com, next_costs, next_roadmap, next_meet
  nextStepsDetails: ''
};

const SECTIONS = [
  { id: 'general', label: '1. General & Contexto', icon: Building },
  { id: 'modelo', label: '2. Modelo & Operación', icon: Layers },
  { id: 'dolores', label: '3. Dolores & Impacto', icon: AlertTriangle },
  { id: 'tecnologia', label: '4. Tecnología & Marca', icon: Cpu },
  { id: 'parametros', label: '5. Parámetros del Core', icon: Sliders },
  { id: 'diagnostico', label: '6. Diagnóstico & Flags', icon: ShieldCheck }
];

export default function CrmDiagnosticsView() {
  const { showToast } = useToast();
  
  // CRM Hook
  const { 
    leads, diagnostics, saveDiagnostic, updateDiagnostic, updateLead, loading
  } = useCrm(true);

  // Estados locales
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [diagId, setDiagId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar el Lead seleccionado
  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Leads aptos para diagnóstico (excluyendo won/lost para mantener enfoque, pero listando todos por si acaso)
  const availableLeads = useMemo(() => {
    return leads.filter(l => l.status !== 'won' && l.status !== 'lost');
  }, [leads]);

  // Cargar diagnóstico existente o inicializar autocompletado del Lead
  useEffect(() => {
    if (!selectedLeadId) {
      setFormData(INITIAL_FORM_STATE);
      setDiagId(null);
      return;
    }

    const existingDiag = diagnostics.find(d => d.leadId === selectedLeadId);

    if (existingDiag) {
      // Unir datos para evitar campos undefined
      setFormData({
        ...INITIAL_FORM_STATE,
        ...existingDiag,
        // Cuidar objetos anidados
        rolesTable: {
          ...INITIAL_FORM_STATE.rolesTable,
          ...(existingDiag.rolesTable || {})
        },
        featureFlags: {
          ...INITIAL_FORM_STATE.featureFlags,
          ...(existingDiag.featureFlags || {})
        }
      });
      setDiagId(existingDiag.id);
    } else {
      // Inicializar y autocompletar con campos del Lead
      setFormData({
        ...INITIAL_FORM_STATE,
        companyName: selectedLead?.company || '',
        commercialName: selectedLead?.company || '',
        contactName: selectedLead?.name || '',
        contactPhone: selectedLead?.phone || '',
        contactWhatsapp: selectedLead?.phone || '',
        contactEmail: selectedLead?.email || '',
        sector: selectedLead?.sector || 'retail_clothing'
      });
      setDiagId(null);
    }
  }, [selectedLeadId, diagnostics, selectedLead]);

  // Guardado de la sección activa
  const handleSaveSection = async () => {
    if (!selectedLeadId) {
      showToast('Debe seleccionar un Lead antes de guardar.', { type: 'error' });
      return;
    }

    if (!formData.companyName || !formData.companyName.trim()) {
      showToast('El nombre de la empresa es obligatorio.', { type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        leadId: selectedLeadId,
        updatedAt: new Date().toISOString()
      };

      let newId = diagId;
      if (diagId) {
        await updateDiagnostic(diagId, payload);
        showToast(`Sección de diagnóstico guardada correctamente.`, { type: 'success' });
      } else {
        newId = await saveDiagnostic(payload);
        setDiagId(newId);
        showToast(`Diagnóstico creado y asociado al Lead.`, { type: 'success' });
      }

      // Sincronizar el estado del lead si no está en un estado avanzado
      if (selectedLead && !['diagnostic_completed', 'proposal_in_preparation', 'proposal_sent', 'negotiation', 'won', 'lost'].includes(selectedLead.status)) {
        await updateLead(selectedLeadId, { status: 'diagnostic_completed' });
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar la sección del diagnóstico.', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper para checkboxes de arrays simples (canales de venta, integraciones, etc.)
  const handleCheckboxListChange = (field, itemValue) => {
    setFormData(prev => {
      const currentList = prev[field] || [];
      const newList = currentList.includes(itemValue)
        ? currentList.filter(v => v !== itemValue)
        : [...currentList, itemValue];
      return { ...prev, [field]: newList };
    });
  };

  // Helper para roles de usuario
  const handleRoleChange = (roleKey, fieldKey, val) => {
    setFormData(prev => ({
      ...prev,
      rolesTable: {
        ...prev.rolesTable,
        [roleKey]: {
          ...prev.rolesTable[roleKey],
          [fieldKey]: val
        }
      }
    }));
  };

  // Helper para Feature Flags
  const handleFeatureFlagChange = (flagKey, checked) => {
    setFormData(prev => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [flagKey]: checked
      }
    }));
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Selector de Lead */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList size={16} className="text-emerald-400" />
            Briefing Maestro y Diagnóstico
          </h2>
          <p className="text-[10px] text-slate-450">
            Levantamiento de información técnica, modelo de negocio e infraestructura para parametrizar el Core.
          </p>
        </div>
        <div className="w-full md:w-72 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Prospecto / Lead a Evaluar *</label>
          <CustomSelect
            value={selectedLeadId}
            onChange={setSelectedLeadId}
            options={[
              { value: '', label: 'Seleccionar Lead...' },
              ...availableLeads.map(l => ({
                value: l.id,
                label: `${l.name} (${l.company || 'Sin Empresa'})`
              }))
            ]}
          />
        </div>
      </div>

      {!selectedLeadId ? (
        <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Building size={20} />
          </div>
          <p className="text-xs text-slate-400 font-medium">Por favor, seleccione un Lead en el menú superior para comenzar el Briefing Maestro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Navegación de Secciones (Sidebar) */}
          <div className="lg:col-span-1 space-y-1 bg-slate-950/30 border border-slate-850 p-2.5 rounded-2xl">
            {SECTIONS.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all font-bold text-xs flex items-center gap-2.5 border-none cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/25 border-solid'
                      : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  <Icon size={15} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
            <div className="border-t border-slate-850 my-2 pt-2.5 px-3">
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 leading-relaxed">
                <Info size={11} className="shrink-0 text-slate-400" />
                <span>Cada sección se guarda de manera independiente.</span>
              </div>
            </div>
          </div>

          {/* Formulario de la Sección Activa */}
          <div className="lg:col-span-3 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-6 relative overflow-hidden">
            {/* Cabecera de Sección */}
            <div className="border-b border-slate-850 pb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                {activeSection === 'general' && <Building size={14} className="text-emerald-400" />}
                {activeSection === 'modelo' && <Layers size={14} className="text-emerald-400" />}
                {activeSection === 'dolores' && <AlertTriangle size={14} className="text-emerald-400" />}
                {activeSection === 'tecnologia' && <Cpu size={14} className="text-emerald-400" />}
                {activeSection === 'parametros' && <Sliders size={14} className="text-emerald-400" />}
                {activeSection === 'diagnostico' && <ShieldCheck size={14} className="text-emerald-400" />}
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </h3>
            </div>

            {/* Campos Dinámicos por Sección */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
              
              {/* SECCIÓN 1: GENERAL & CONTEXTO */}
              {activeSection === 'general' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Datos del Negocio</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre de la Empresa</label>
                        <input type="text" value={formData.companyName} onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Ej. SmartFix SAS" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre Comercial</label>
                        <input type="text" value={formData.commercialName} onChange={e => setFormData(prev => ({ ...prev, commercialName: e.target.value }))}
                          placeholder="Ej. SmartFix" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">NIT / Identificación</label>
                        <input type="text" value={formData.nit} onChange={e => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                          placeholder="Ej. 900.123.456-7" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sector</label>
                        <CustomSelect value={formData.sector} onChange={val => setFormData(prev => ({ ...prev, sector: val }))}
                          options={[
                            { value: 'retail_clothing', label: 'Moda y Calzado (Retail)' },
                            { value: 'retail_food', label: 'Alimentos y Supermercado' },
                            { value: 'retail_electronics', label: 'Tecnología y Electrodomésticos' },
                            { value: 'services_booking', label: 'Servicios con Agendamiento' },
                            { value: 'services_general', label: 'Servicios Generales / B2B' },
                            { value: 'other', label: 'Otro Sector comercial' }
                          ]}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ciudad / Ubicación</label>
                        <input type="text" value={formData.city} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Ej. Bogotá" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dirección física</label>
                        <input type="text" value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Ej. Calle 100 # 15-20" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sitio Web</label>
                        <input type="text" value={formData.website} onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="Ej. https://smartfix.com" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Redes Sociales</label>
                        <input type="text" value={formData.socialMedia} onChange={e => setFormData(prev => ({ ...prev, socialMedia: e.target.value }))}
                          placeholder="Ej. @smartfix.instagram" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Contacto Principal</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre Completo</label>
                        <input type="text" value={formData.contactName} onChange={e => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                          placeholder="Nombre del interlocutor" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cargo / Rol en Empresa</label>
                        <input type="text" value={formData.contactRole} onChange={e => setFormData(prev => ({ ...prev, contactRole: e.target.value }))}
                          placeholder="Ej. Gerente de Operaciones" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Correo Corporativo</label>
                        <input type="email" value={formData.contactEmail} onChange={e => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="Ej. contacto@empresa.com" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Teléfono de Oficina</label>
                        <input type="text" value={formData.contactPhone} onChange={e => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          placeholder="Ej. +57601234567" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">WhatsApp Directo</label>
                        <input type="text" value={formData.contactWhatsapp} onChange={e => setFormData(prev => ({ ...prev, contactWhatsapp: e.target.value }))}
                          placeholder="Ej. +573009876543" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Contexto de la Empresa</h4>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Historia & Trayectoria</label>
                      <textarea value={formData.history} onChange={e => setFormData(prev => ({ ...prev, history: e.target.value }))} rows={2}
                        placeholder="¿Cómo nació la empresa, hace cuánto tiempo existe y cómo ha sido su desarrollo hasta hoy?"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cantidad de Empleados</label>
                        <input type="text" value={formData.employeeCount} onChange={e => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
                          placeholder="Ej. 15 empleados" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cantidad de Sedes / Puntos de Venta</label>
                        <input type="text" value={formData.headquartersCount} onChange={e => setFormData(prev => ({ ...prev, headquartersCount: e.target.value }))}
                          placeholder="Ej. 3 tiendas físicas" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Líneas de Negocio Principales</label>
                      <input type="text" value={formData.mainBusinessLines} onChange={e => setFormData(prev => ({ ...prev, mainBusinessLines: e.target.value }))}
                        placeholder="Ej. Venta de repuestos, Servicio técnico y Accesorios" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mayor Reto Comercial / Operativo Actual</label>
                      <input type="text" value={formData.biggestChallenge} onChange={e => setFormData(prev => ({ ...prev, biggestChallenge: e.target.value }))}
                        placeholder="Ej. Fugas de inventario y demora en cuadre de caja diario." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: MODELO DE NEGOCIO & OPERACIÓN */}
              {activeSection === 'modelo' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Modelo Comercial y Catálogo</h4>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Qué vende exactamente la empresa?</label>
                      <input type="text" value={formData.whatItSells} onChange={e => setFormData(prev => ({ ...prev, whatItSells: e.target.value }))}
                        placeholder="Ej. Ropa y calzado multimarca de gama media." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Productos / Servicios principales</label>
                        <input type="text" value={formData.mainProductsServices} onChange={e => setFormData(prev => ({ ...prev, mainProductsServices: e.target.value }))}
                          placeholder="Ej. Chaquetas, Vaqueros, Zapatillas" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Productos de mayor rentabilidad / facturación</label>
                        <input type="text" value={formData.highestIncomeProducts} onChange={e => setFormData(prev => ({ ...prev, highestIncomeProducts: e.target.value }))}
                          placeholder="Ej. Chaquetas de cuero sintético" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Productos que generan más devoluciones o problemas de inventario</label>
                      <input type="text" value={formData.highestProblemProducts} onChange={e => setFormData(prev => ({ ...prev, highestProblemProducts: e.target.value }))}
                        placeholder="Ej. Calzado deportivo por diferencias en tallaje internacional." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Perfil del Consumidor</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cliente Ideal</label>
                        <input type="text" value={formData.idealCustomer} onChange={e => setFormData(prev => ({ ...prev, idealCustomer: e.target.value }))}
                          placeholder="Ej. Jóvenes de 18 a 35 años" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Perfil de Clientes Actual</label>
                        <input type="text" value={formData.currentCustomerProfile} onChange={e => setFormData(prev => ({ ...prev, currentCustomerProfile: e.target.value }))}
                          placeholder="Ej. B2C (Consumidor directo)" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recurrencia de compra</label>
                        <CustomSelect value={formData.customerRecurrence} onChange={val => setFormData(prev => ({ ...prev, customerRecurrence: val }))}
                          options={[
                            { value: 'recurrent', label: 'Clientes Recurrentes' },
                            { value: 'sporadic', label: 'Clientes Esporádicos / Compra Única' },
                            { value: 'both', label: 'Ambos perfiles' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Canales de Venta Utilizados</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-1">
                        {['Presencial', 'WhatsApp', 'Instagram', 'Facebook', 'Página Web', 'Marketplace'].map(chan => {
                          const isChecked = (formData.salesChannels || []).includes(chan);
                          return (
                            <button
                              key={chan}
                              type="button"
                              onClick={() => handleCheckboxListChange('salesChannels', chan)}
                              className={`px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                                isChecked
                                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold'
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                              } cursor-pointer`}
                            >
                              <span>{chan}</span>
                              {isChecked && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Flujo Operativo (Cómo trabajan hoy)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">1. Captación (Atracción)</label>
                        <textarea value={formData.captacionFlow} onChange={e => setFormData(prev => ({ ...prev, captacionFlow: e.target.value }))} rows={2}
                          placeholder="¿Cómo llegan los prospectos?" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">2. Atención (Calificar)</label>
                        <textarea value={formData.atencionFlow} onChange={e => setFormData(prev => ({ ...prev, atencionFlow: e.target.value }))} rows={2}
                          placeholder="¿Cómo los atienden?" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">3. Venta (Cierre)</label>
                        <textarea value={formData.ventaFlow} onChange={e => setFormData(prev => ({ ...prev, ventaFlow: e.target.value }))} rows={2}
                          placeholder="¿Cómo facturan?" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">4. Entrega (Despacho)</label>
                        <textarea value={formData.entregaFlow} onChange={e => setFormData(prev => ({ ...prev, entregaFlow: e.target.value }))} rows={2}
                          placeholder="¿Cómo se envía el pedido?" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">5. Postventa (Seguimiento)</label>
                        <textarea value={formData.postventaFlow} onChange={e => setFormData(prev => ({ ...prev, postventaFlow: e.target.value }))} rows={2}
                          placeholder="¿Cómo se fideliza?" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Estructura Organizacional (Roles)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                      {['admin', 'employee', 'supervisor', 'customer'].map(rk => {
                        const labelMap = { admin: 'Administrador', employee: 'Vendedor / Empleado', supervisor: 'Supervisor / Coordinador', customer: 'Cliente (Portal)' };
                        const roleObj = formData.rolesTable?.[rk] || { count: '', functions: '' };
                        return (
                          <div key={rk} className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-2">
                            <span className="font-bold text-slate-300 text-[11px] block border-b border-slate-850 pb-1.5">{labelMap[rk]}</span>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase">Cantidad</label>
                              <input type="text" value={roleObj.count} onChange={e => handleRoleChange(rk, 'count', e.target.value)}
                                placeholder="Ej. 2 usuarios" className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-indigo-500/50" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase">Funciones principales</label>
                              <input type="text" value={roleObj.functions} onChange={e => handleRoleChange(rk, 'functions', e.target.value)}
                                placeholder="Ej. Facturar y cuadre" className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-indigo-500/50" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 3: DOLORES, IMPACTO & CRECIMIENTO */}
              {activeSection === 'dolores' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Dolores y Fugas del Negocio</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dolores Operativos (Inventario, Tiempos)</label>
                        <textarea value={formData.doloresOperativos} onChange={e => setFormData(prev => ({ ...prev, doloresOperativos: e.target.value }))} rows={3}
                          placeholder="Ej. Cuadres manuales lentos, errores en inventarios físicos..." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dolores Administrativos (Reportes, Control)</label>
                        <textarea value={formData.doloresAdministrativos} onChange={e => setFormData(prev => ({ ...prev, doloresAdministrativos: e.target.value }))} rows={3}
                          placeholder="Ej. Dificultad para calcular comisiones de vendedores, falta de reportes mensuales..." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dolores Comerciales (Venta, Atención)</label>
                        <textarea value={formData.doloresComerciales} onChange={e => setFormData(prev => ({ ...prev, doloresComerciales: e.target.value }))} rows={3}
                          placeholder="Ej. Demoras en responder WhatsApp, pérdida de leads por falta de seguimiento..." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Impacto Económico de los Problemas</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tiempo Perdido Semanal (Horas)</label>
                        <input type="text" value={formData.lostTimeWeekly} onChange={e => setFormData(prev => ({ ...prev, lostTimeWeekly: e.target.value }))}
                          placeholder="Ej. 10 horas semanales" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dinero Perdido Mensual (Estimado)</label>
                        <input type="text" value={formData.lostMoneyErrors} onChange={e => setFormData(prev => ({ ...prev, lostMoneyErrors: e.target.value }))}
                          placeholder="Ej. $800.000 COP" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Problema Más Costoso de Resolver</label>
                        <input type="text" value={formData.mostExpensiveProblem} onChange={e => setFormData(prev => ({ ...prev, mostExpensiveProblem: e.target.value }))}
                          placeholder="Ej. Pérdida/robo de mercancía sin registrar." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Oportunidades de Automatización</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tarea manual a eliminar</label>
                        <input type="text" value={formData.eliminateManualTask} onChange={e => setFormData(prev => ({ ...prev, eliminateManualTask: e.target.value }))}
                          placeholder="Ej. Transcripción de facturas a Excel" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tarea a automatizar</label>
                        <input type="text" value={formData.automateTask} onChange={e => setFormData(prev => ({ ...prev, automateTask: e.target.value }))}
                          placeholder="Ej. Descuento automático de stock al vender" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Proceso Innecesariamente Complejo</label>
                        <input type="text" value={formData.complexProcess} onChange={e => setFormData(prev => ({ ...prev, complexProcess: e.target.value }))}
                          placeholder="Ej. Aprobación manual de créditos fiados." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Crecimiento y Proyección</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Meta en 1 Año</label>
                        <input type="text" value={formData.oneYearGoal} onChange={e => setFormData(prev => ({ ...prev, oneYearGoal: e.target.value }))}
                          placeholder="Ej. Duplicar facturación digital y abrir nueva sede" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Planes de nuevas sedes / locales</label>
                        <input type="text" value={formData.newLocationsPlan} onChange={e => setFormData(prev => ({ ...prev, newLocationsPlan: e.target.value }))}
                          placeholder="Ej. Sí, 1 punto adicional en Medellín a fin de año" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Planes de contratación de personal</label>
                        <input type="text" value={formData.newStaffPlan} onChange={e => setFormData(prev => ({ ...prev, newStaffPlan: e.target.value }))}
                          placeholder="Ej. Contratar 2 vendedores adicionales." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Impacto si duplicara su volumen de clientes mañana</label>
                        <input type="text" value={formData.doubleCustomersImpact} onChange={e => setFormData(prev => ({ ...prev, doubleCustomersImpact: e.target.value }))}
                          placeholder="Ej. Colapso operativo, descontrol total de entregas." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 4: TECNOLOGÍA & BRANDING */}
              {activeSection === 'tecnologia' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Tecnología en Uso y Reportes</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Software actual (POS, ERP, CRM, Excel)</label>
                        <input type="text" value={formData.currentSoftware} onChange={e => setFormData(prev => ({ ...prev, currentSoftware: e.target.value }))}
                          placeholder="Ej. Excel y software POS antiguo" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Qué les GUSTA de su software actual?</label>
                        <input type="text" value={formData.softwareLikes} onChange={e => setFormData(prev => ({ ...prev, softwareLikes: e.target.value }))}
                          placeholder="Ej. Es simple de abrir y facturar." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Qué les DISGUSTA?</label>
                        <input type="text" value={formData.softwareDislikes} onChange={e => setFormData(prev => ({ ...prev, softwareDislikes: e.target.value }))}
                          placeholder="Ej. Lento, no tiene nube, se borran datos." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reportes Diarios consultados</label>
                        <input type="text" value={formData.dailyReports} onChange={e => setFormData(prev => ({ ...prev, dailyReports: e.target.value }))}
                          placeholder="Ej. Ventas totales" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reportes Semanales</label>
                        <input type="text" value={formData.weeklyReports} onChange={e => setFormData(prev => ({ ...prev, weeklyReports: e.target.value }))}
                          placeholder="Ej. Reposición de stock" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reportes Mensuales</label>
                        <input type="text" value={formData.monthlyReports} onChange={e => setFormData(prev => ({ ...prev, monthlyReports: e.target.value }))}
                          placeholder="Ej. Utilidad neta" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reportes deseados en PROTOTIPE</label>
                        <input type="text" value={formData.desiredAutoReports} onChange={e => setFormData(prev => ({ ...prev, desiredAutoReports: e.target.value }))}
                          placeholder="Ej. Comisiones y rentabilidad de productos." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Integraciones Críticas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        { key: 'whatsapp', label: 'WhatsApp API' },
                        { key: 'email', label: 'Correo Electrónico' },
                        { key: 'gateway', label: 'Pasarela de Pagos' },
                        { key: 'billing', label: 'Facturación Electrónica DIAN' },
                        { key: 'printers', label: 'Impresoras Térmicas' },
                        { key: 'scales', label: 'Básculas / Balanzas' },
                        { key: 'external_api', label: 'APIs Externas / Envíos' }
                      ].map(integ => {
                        const isChecked = (formData.integrationsList || []).includes(integ.key);
                        return (
                          <button
                            key={integ.key}
                            type="button"
                            onClick={() => handleCheckboxListChange('integrationsList', integ.key)}
                            className={`px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                              isChecked
                                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                            } cursor-pointer`}
                          >
                            <span>{integ.label}</span>
                            {isChecked && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Identidad Visual & Branding</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Tiene Logo?</label>
                        <CustomSelect value={formData.hasLogo} onChange={val => setFormData(prev => ({ ...prev, hasLogo: val }))}
                          options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'pending', label: 'En proceso' }]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Tiene Manual de Marca?</label>
                        <CustomSelect value={formData.hasBrandManual} onChange={val => setFormData(prev => ({ ...prev, hasBrandManual: val }))}
                          options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'pending', label: 'En desarrollo' }]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Colores Clave (HEX / Nombre)</label>
                        <div className="flex gap-1.5">
                          <input type="text" value={formData.primaryColor} onChange={e => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            placeholder="Primario" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-[11px] text-slate-200 outline-none focus:border-indigo-500/50" />
                          <input type="text" value={formData.secondaryColor} onChange={e => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            placeholder="Secundario" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-[11px] text-slate-200 outline-none focus:border-indigo-500/50" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estilo Deseado</label>
                        <div className="grid grid-cols-2 gap-1 mt-0.5">
                          {['Minimalista', 'Corporativo', 'Moderno', 'Elegante', 'Industrial'].map(styleVal => {
                            const isChecked = (formData.desiredStyle || []).includes(styleVal);
                            return (
                              <button
                                key={styleVal}
                                type="button"
                                onClick={() => handleCheckboxListChange('desiredStyle', styleVal)}
                                className={`px-2 py-1 rounded-lg text-[10px] text-left transition-all border ${
                                  isChecked
                                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold'
                                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                                } cursor-pointer`}
                              >
                                {styleVal}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 5: PARAMETRIZACIÓN TÉCNICA DEL CORE */}
              {activeSection === 'parametros' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Gestión de Catálogo e Inventario</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Usa Variantes? (Tallas/Colores)</label>
                        <CustomSelect value={formData.hasProductVariants} onChange={val => setFormData(prev => ({ ...prev, hasProductVariants: val }))}
                          options={[{ value: 'yes', label: 'Sí (Crítico)' }, { value: 'no', label: 'No (Catálogo simple)' }]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Precios por Volumen / Mayoristas?</label>
                        <CustomSelect value={formData.hasVolumePricing} onChange={val => setFormData(prev => ({ ...prev, hasVolumePricing: val }))}
                          options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Vende Productos Bajo Pedido?</label>
                        <CustomSelect value={formData.hasOnDemandProducts} onChange={val => setFormData(prev => ({ ...prev, hasOnDemandProducts: val }))}
                          options={[{ value: 'yes', label: 'Sí (Requiere módulo producción)' }, { value: 'no', label: 'No' }]} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Monto Mínimo de Compra en el Portal</label>
                        <input type="text" value={formData.minPurchaseAmount} onChange={e => setFormData(prev => ({ ...prev, minPurchaseAmount: e.target.value }))}
                          placeholder="Ej. Sin mínimo / $50.000 COP" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">WhatsApp Operativo para Pedidos</label>
                        <input type="text" value={formData.operativeWhatsappNumber} onChange={e => setFormData(prev => ({ ...prev, operativeWhatsappNumber: e.target.value }))}
                          placeholder="Ej. +573009876543" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Finanzas, Métodos de Pago y Créditos</h4>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Métodos de Pago Autorizados</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-1">
                        {[
                          { key: 'bank_transfer', label: 'Transferencia Bancaria' },
                          { key: 'cash', label: 'Efectivo / Caja' },
                          { key: 'card', label: 'Tarjeta (Datáfono)' },
                          { key: 'gateway', label: 'Pasarela Online' }
                        ].map(pm => {
                          const isChecked = (formData.paymentMethods || []).includes(pm.key);
                          return (
                            <button
                              key={pm.key}
                              type="button"
                              onClick={() => handleCheckboxListChange('paymentMethods', pm.key)}
                              className={`px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                                isChecked
                                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold'
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                              } cursor-pointer`}
                            >
                              <span>{pm.label}</span>
                              {isChecked && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Maneja Créditos / Fiados?</label>
                        <CustomSelect value={formData.hasCredits} onChange={val => setFormData(prev => ({ ...prev, hasCredits: val }))}
                          options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]} />
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Límite de Crédito Promedio</label>
                        <input type="text" value={formData.creditLimitPerCustomer} onChange={e => setFormData(prev => ({ ...prev, creditLimitPerCustomer: e.target.value }))}
                          placeholder="Ej. $1.000.000 COP" className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Cupones de Descuento?</label>
                        <CustomSelect value={formData.hasCoupons} onChange={val => setFormData(prev => ({ ...prev, hasCoupons: val }))}
                          options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">¿Módulo Reclamaciones / PQRS?</label>
                        <CustomSelect value={formData.hasClaimsModule} onChange={val => setFormData(prev => ({ ...prev, hasClaimsModule: val }))}
                          options={[{ value: 'yes', label: 'Sí' }, { value: 'no', label: 'No' }]} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 6: DIAGNÓSTICO, COMPONENTES & FLAGS */}
              {activeSection === 'diagnostico' && (
                <div className="space-y-5">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Resumen del Analista PROTOTIPE</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Problema Principal del Negocio</label>
                        <input type="text" value={formData.analystMainProblem} onChange={e => setFormData(prev => ({ ...prev, analystMainProblem: e.target.value }))}
                          placeholder="Fuga de caja e inventario descontrolado por registro manual." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Oportunidad Principal Identificada</label>
                        <input type="text" value={formData.analystMainOpportunity} onChange={e => setFormData(prev => ({ ...prev, analystMainOpportunity: e.target.value }))}
                          placeholder="Centralizar ventas presenciales y WhatsApp en un único panel." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Automatización Principal Sugerida</label>
                        <input type="text" value={formData.analystMainAutomation} onChange={e => setFormData(prev => ({ ...prev, analystMainAutomation: e.target.value }))}
                          placeholder="Sincronización en tiempo real de WhatsApp con inventario." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Beneficio Comercial Directo Esperado</label>
                        <input type="text" value={formData.analystExpectedBenefit} onChange={e => setFormData(prev => ({ ...prev, analystExpectedBenefit: e.target.value }))}
                          placeholder="Ahorro de 6 horas semanales en cierres y 100% control de stock." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Diagnóstico Técnico y Calificación</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nivel de Madurez Tecnológica</label>
                        <CustomSelect value={formData.techMaturityLevel} onChange={val => setFormData(prev => ({ ...prev, techMaturityLevel: val }))}
                          options={[{ value: 'bajo', label: 'Bajo (Excel / Papel)' }, { value: 'medio', label: 'Medio (POS simple)' }, { value: 'alto', label: 'Alto (ERP en la nube)' }]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Complejidad Estimada</label>
                        <CustomSelect value={formData.complexityLevel} onChange={val => setFormData(prev => ({ ...prev, complexityLevel: val }))}
                          options={[{ value: 'baja', label: 'Baja (Core Estándar)' }, { value: 'media', label: 'Media (Personalización Básica)' }, { value: 'alta', label: 'Alta (Muchas integraciones)' }, { value: 'muy_alta', label: 'Muy Alta (Lógica Especializada)' }]} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nivel de Personalización</label>
                        <CustomSelect value={formData.customizationLevel} onChange={val => setFormData(prev => ({ ...prev, customizationLevel: val }))}
                          options={[{ value: 'bajo', label: 'Bajo (Core Puro)' }, { value: 'medio', label: 'Medio (Cambios UI/Flujos)' }, { value: 'alto', label: 'Alto (Código a medida)' }]} />
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Diagnóstico Preliminar Técnico</label>
                      <textarea value={formData.preliminaryDiagnosis} onChange={e => setFormData(prev => ({ ...prev, preliminaryDiagnosis: e.target.value }))} rows={2}
                        placeholder="Escribe un resumen técnico de la viabilidad de despliegue de PROTOTIPE en este negocio..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50 resize-y" />
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Componentes de Biblioteca Reutilizables</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { key: 'catalog', label: 'Catálogo Modular' },
                        { key: 'inventory', label: 'Control de Inventario' },
                        { key: 'cart', label: 'Carrito de Compras' },
                        { key: 'checkout', label: 'Checkout unificado' },
                        { key: 'orders', label: 'Gestión de Pedidos' },
                        { key: 'tracking', label: 'Rastreo en WhatsApp' },
                        { key: 'crm', label: 'CRM de Clientes' },
                        { key: 'agenda', label: 'Agenda de Reservas' },
                        { key: 'billing', label: 'Facturación / POS' },
                        { key: 'reports', label: 'Reportes y Cierres' },
                        { key: 'logistics', label: 'Despachos/Rutas' },
                        { key: 'clients', label: 'Directorio Clientes' },
                        { key: 'coupons', label: 'Cupones de Descuento' },
                        { key: 'credits', label: 'Líneas de Crédito' },
                        { key: 'claims', label: 'Reclamaciones PQRS' }
                      ].map(comp => {
                        const isChecked = (formData.reusableComponents || []).includes(comp.key);
                        return (
                          <button
                            key={comp.key}
                            type="button"
                            onClick={() => handleCheckboxListChange('reusableComponents', comp.key)}
                            className={`px-2 py-1.5 rounded-lg text-left text-[11px] transition-all flex items-center justify-between border ${
                              isChecked
                                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                            } cursor-pointer`}
                          >
                            <span>{comp.label}</span>
                            {isChecked && <Check size={11} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Feature Flags Propuestas (Habilitar Módulos del Core)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'creditsEnabled', label: 'Módulo de Créditos (Fiados)' },
                        { key: 'couponsEnabled', label: 'Módulo de Cupones y Promos' },
                        { key: 'claimsEnabled', label: 'Módulo de Reclamaciones (PQRS)' },
                        { key: 'wholesaleEnabled', label: 'Módulo Mayorista (Volumen)' },
                        { key: 'inventoryEnabled', label: 'Módulo de Inventario Avanzado' },
                        { key: 'reportsEnabled', label: 'Módulo de Reportes BI' },
                        { key: 'appointmentsEnabled', label: 'Módulo de Citas y Reservas' },
                        { key: 'crmEnabled', label: 'Módulo CRM Incorporado' },
                        { key: 'trackingEnabled', label: 'Módulo de Envíos y Tracking' }
                      ].map(ff => {
                        const val = formData.featureFlags?.[ff.key] || false;
                        return (
                          <label key={ff.key} className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={e => handleFeatureFlagChange(ff.key, e.target.checked)}
                              className="w-3.5 h-3.5 accent-indigo-500 rounded border-slate-800 bg-slate-950"
                            />
                            <span className="text-[11px] text-slate-300 font-medium">{ff.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Próximos Pasos en el Embudo</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      {[
                        { key: 'next_diag', label: 'Elaborar Diagnóstico Formal' },
                        { key: 'next_prop_tech', label: 'Elaborar Propuesta Técnica' },
                        { key: 'next_prop_com', label: 'Elaborar Propuesta Comercial' },
                        { key: 'next_costs', label: 'Estimar Costos Internos' },
                        { key: 'next_roadmap', label: 'Definir Roadmap Inicial' },
                        { key: 'next_meet', label: 'Programar Segunda Reunión' }
                      ].map(ns => {
                        const isChecked = (formData.nextStepsList || []).includes(ns.key);
                        return (
                          <button
                            key={ns.key}
                            type="button"
                            onClick={() => handleCheckboxListChange('nextStepsList', ns.key)}
                            className={`px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                              isChecked
                                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                            } cursor-pointer`}
                          >
                            <span>{ns.label}</span>
                            {isChecked && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Detalles adicionales / Notas de Próximos Pasos</label>
                      <input type="text" value={formData.nextStepsDetails} onChange={e => setFormData(prev => ({ ...prev, nextStepsDetails: e.target.value }))}
                        placeholder="Ej. Quedamos en llamarla el próximo martes con la cotización del Core lista." className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/50" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones de Guardado */}
            <div className="border-t border-slate-850 pt-4 mt-6 flex justify-between items-center bg-slate-900/10 relative z-10">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                {isSaving ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-emerald-400" />
                    <span>Guardando sección...</span>
                  </>
                ) : (
                  <>
                    <Star size={12} className="text-slate-400 animate-pulse" />
                    <span>Los cambios se guardan localmente para este Lead.</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving || loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-slate-400 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer border-none shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <Save size={14} />
                Guardar Sección Activa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
