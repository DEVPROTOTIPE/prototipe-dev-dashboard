import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Briefcase, Calendar, User, DollarSign, Calculator, Info } from 'lucide-react';
import PricingCalculatorWidget from './PricingCalculatorWidget';

function Portal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function ProposalFormModal({ isOpen, onClose, onSave, proposal, leads = [] }) {
  const [leadId, setLeadId] = useState('');
  const [title, setTitle] = useState('');
  const [representative, setRepresentative] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  
  // Valores del modelo financiero
  const [financialValues, setFinancialValues] = useState({
    setupValue: 0,
    monthlyValue: 0,
    commissionPercent: 0,
    projectedSalesVolume: 0,
    dianCost: 0,
    estimatedMargin: 0
  });

  const [errors, setErrors] = useState({});

  // Cargar datos si estamos editando
  useEffect(() => {
    if (proposal) {
      setLeadId(proposal.leadId || '');
      setTitle(proposal.title || '');
      setRepresentative(proposal.representative || '');
      setValidUntil(proposal.validUntil ? proposal.validUntil.split('T')[0] : '');
      setNotes(proposal.notes || '');
      setFinancialValues({
        setupValue: proposal.setupValue || 0,
        monthlyValue: proposal.monthlyValue || 0,
        commissionPercent: proposal.commissionPercent || 0,
        projectedSalesVolume: proposal.projectedSalesVolume || 0,
        dianCost: proposal.dianCost || 0,
        estimatedMargin: proposal.estimatedMargin || 0
      });
    } else {
      // Default: Nueva propuesta
      setLeadId('');
      setTitle('');
      setRepresentative('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30); // 30 días de vigencia por defecto
      setValidUntil(defaultDate.toISOString().split('T')[0]);
      setNotes('');
      setFinancialValues({
        setupValue: 1200000, // setup default sugerido en COP
        monthlyValue: 350000, // mensualidad base default sugerida
        commissionPercent: 1.5,
        projectedSalesVolume: 15000000, // $15M COP de ventas estimadas
        dianCost: 150000,
        estimatedMargin: 0
      });
    }
    setErrors({});
  }, [proposal, isOpen]);

  if (!isOpen) return null;

  const handleCalculatorChange = (newFinances) => {
    setFinancialValues(newFinances);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!leadId) newErrors.leadId = 'Debes seleccionar un Prospecto (Lead)';
    if (!title.trim()) newErrors.title = 'El título de la propuesta es obligatorio';
    if (!representative.trim()) newErrors.representative = 'El responsable comercial es obligatorio';
    if (!validUntil) newErrors.validUntil = 'La fecha de validez es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      leadId,
      title: title.trim(),
      representative: representative.trim(),
      validUntil,
      notes: notes.trim(),
      ...financialValues
    };

    onSave(data);
  };

  // Filtrar leads activos o relevantes
  const availableLeads = leads.filter(l => l.status !== 'won');

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/10 rounded-xl">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
                  {proposal ? 'Editar Propuesta Comercial' : 'Nueva Propuesta Comercial'}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Define los términos financieros y técnicos de la propuesta.</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              type="button"
              className="p-1.5 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
            {/* Columna Izquierda: Información General */}
            <div className="space-y-4">
              <div className="bg-slate-950/20 border border-slate-800/60 p-4 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                  <Info size={12} className="text-indigo-400" />
                  Datos de la Oferta
                </h4>
                
                {/* Prospecto Asociado */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Prospecto (Lead)</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    disabled={!!proposal}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Seleccionar Prospecto...</option>
                    {availableLeads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.company || l.name} - {l.name} ({l.status === 'lead_new' ? 'Nuevo' : l.status === 'meeting_scheduled' ? 'Reunión' : l.status === 'diagnostic_completed' ? 'Diagnóstico' : l.status})
                      </option>
                    ))}
                  </select>
                  {errors.leadId && <p className="text-[9px] text-rose-400 font-medium">{errors.leadId}</p>}
                </div>

                {/* Título de la propuesta */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Título de la Propuesta</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Propuesta Comercial Core Ecosistema - SmartFix"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.title && <p className="text-[9px] text-rose-400 font-medium">{errors.title}</p>}
                </div>

                {/* Responsable Comercial */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Responsable Comercial</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                      placeholder="Nombre del Agente"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {errors.representative && <p className="text-[9px] text-rose-400 font-medium">{errors.representative}</p>}
                </div>

                {/* Fecha de Validez */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Válida Hasta</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {errors.validUntil && <p className="text-[9px] text-rose-400 font-medium">{errors.validUntil}</p>}
                </div>
              </div>

              {/* Notas Técnicas / Alcance */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Notas de Alcance y Compromisos</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalle de integraciones, hosting compartido, exclusiones técnicas..."
                  rows={4}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Columna Derecha: Calculadora Comercial Embebida */}
            <div className="space-y-4">
              <PricingCalculatorWidget 
                values={financialValues}
                onChange={handleCalculatorChange}
              />
            </div>

            {/* Acciones */}
            <div className="col-span-1 lg:col-span-2 flex items-center justify-end gap-3 border-t border-slate-800/80 pt-5 mt-2 bg-slate-900/60 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-450 hover:text-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/25 text-xs font-bold text-slate-100 rounded-xl shadow-lg transition-all"
              >
                {proposal ? 'Guardar Cambios' : 'Crear Propuesta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
