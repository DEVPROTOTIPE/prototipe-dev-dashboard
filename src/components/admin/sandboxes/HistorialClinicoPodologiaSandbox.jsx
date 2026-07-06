import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Shield, AlertCircle, Heart, Info, ClipboardList, CheckCircle } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';

function HistorialClinicoComponent({ onSubmit, initialData = {} }) {
  const [activeTab, setActiveTab] = useState('personales');
  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    edad: initialData.edad || '',
    telefono: initialData.telefono || '',
    diabetico: initialData.diabetico || 'no',
    insulinoDependiente: initialData.insulinoDependiente || 'no',
    problemasCirculatorios: initialData.problemasCirculatorios || 'no',
    alergias: initialData.alergias || '',
    condicionesFisicas: initialData.condicionesFisicas || [],
    observaciones: initialData.observaciones || ''
  });

  const [submitted, setSubmitted] = useState(false);

  const condicionesOpciones = [
    { id: 'onicocriptosis', label: 'Uña Encarnada (Onicocriptosis)' },
    { id: 'micosis', label: 'Hongos en Uñas/Piel (Onicomicosis/Dermatomicosis)' },
    { id: 'helomas', label: 'Callosidades Profundas (Helomas)' },
    { id: 'anhidrosis', label: 'Resequedad Extrema (Anhidrosis/Grietas)' },
    { id: 'hiperhidrosis', label: 'Sudoración Excesiva (Hiperhidrosis)' },
    { id: 'verruga', label: 'Verruga Plantar (Ojo de pescado)' }
  ];

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConditionToggle = (id) => {
    setFormData(prev => {
      const active = prev.condicionesFisicas.includes(id);
      return {
        ...prev,
        condicionesFisicas: active 
          ? prev.condicionesFisicas.filter(item => item !== id)
          : [...prev.condicionesFisicas, id]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.edad) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }
    setSubmitted(true);
    if (onSubmit) onSubmit(formData);
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden transition-all duration-300">
      {/* Encabezado */}
      <div className="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-light)] to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">Historial Clínico</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Ficha de ingreso para tratamientos podológicos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
          <Shield className="w-3.5 h-3.5" /> HIPAA Compliant
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
        {[
          { id: 'personales', label: '1. Datos Personales' },
          { id: 'clinicos', label: '2. Antecedentes Médicos' },
          { id: 'patologias', label: '3. Afecciones' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-surface-2)]/30'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {submitted ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-text)]">Historial Guardado Exitosamente</h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm">
            Los datos clínicos de <strong>{formData.nombre}</strong> han sido encriptados y vinculados a su expediente correctamente.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all"
          >
            Editar Registro
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Alertas de Riesgo Crítico */}
          {(formData.diabetico === 'si' || formData.problemasCirculatorios === 'si') && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs">Alerta de Riesgo Clínico:</span>
                <p className="text-[10px] mt-0.5 opacity-90 leading-relaxed">
                  Paciente diabético o con problemas circulatorios. Se debe utilizar únicamente instrumental esterilizado de punta roma y evitar cortes profundos para prevenir úlceras o necrosis.
                </p>
              </div>
            </div>
          )}

          {/* Tab 1: Datos Personales */}
          {activeTab === 'personales' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleTextChange}
                    placeholder="Ej. María López"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">Edad *</label>
                  <input
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleTextChange}
                    placeholder="Ej. 34"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">Número de Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleTextChange}
                  placeholder="Ej. +57 300 123 4567"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Antecedentes Clínicos */}
          {activeTab === 'clinicos' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                  <span className="block text-xs font-bold text-[var(--color-text)] mb-2">¿Padece Diabetes?</span>
                  <div className="flex gap-2">
                    {[{ value: 'no', label: 'No padece' }, { value: 'si', label: 'Sí padece' }].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, diabetico: opt.value }))}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          formData.diabetico === opt.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 transition-all ${formData.diabetico === 'no' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <span className="block text-xs font-bold text-[var(--color-text)] mb-2">¿Es insulino-dependiente?</span>
                  <div className="flex gap-2">
                    {[{ value: 'no', label: 'No es' }, { value: 'si', label: 'Sí es' }].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, insulinoDependiente: opt.value }))}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                          formData.insulinoDependiente === opt.value
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                <span className="block text-xs font-bold text-[var(--color-text)] mb-2.5">¿Sufre de problemas circulatorios o de cicatrización?</span>
                <div className="flex gap-2">
                  {[{ value: 'no', label: 'Sin problemas' }, { value: 'si', label: 'Sí, insuficiencia/varices' }].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, problemasCirculatorios: opt.value }))}
                      className={`flex-1 py-2 px-3 text-[10px] font-bold rounded-lg border transition-all ${
                        formData.problemasCirculatorios === opt.value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">Alergias a Medicamentos o Sustancias</label>
                <textarea
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleTextChange}
                  placeholder="Ej. Penicilina, yodo..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Patologías Podológicas */}
          {activeTab === 'patologias' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="block text-xs font-bold text-[var(--color-text)] mb-2">Marque las afecciones actuales de sus pies:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {condicionesOpciones.map(cond => {
                    const active = formData.condicionesFisicas.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => handleConditionToggle(cond.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          active
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          active 
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' 
                            : 'border-[var(--color-border)] bg-transparent'
                        }`}>
                          {active && <span className="text-[8px] font-bold">✓</span>}
                        </div>
                        <span className="text-[11px] font-semibold">{cond.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase mb-1">Observaciones / Motivo de consulta</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleTextChange}
                  placeholder="Dolores, sensaciones o requerimientos especiales..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Botones de Navegación del Formulario */}
          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'patologias') setActiveTab('clinicos');
                else if (activeTab === 'clinicos') setActiveTab('personales');
              }}
              disabled={activeTab === 'personales'}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              Anterior
            </button>

            {activeTab === 'patologias' ? (
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[var(--color-primary)] !text-white text-xs font-bold shadow-md hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer"
              >
                Guardar Historial
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'personales') setActiveTab('clinicos');
                  else if (activeTab === 'clinicos') setActiveTab('patologias');
                }}
                className="px-5 py-2 rounded-xl bg-[var(--color-primary)] !text-white text-xs font-bold shadow-md hover:bg-[var(--color-primary-dark)] transition-all cursor-pointer"
              >
                Siguiente
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default function HistorialClinicoPodologiaSandbox() {
  return (
    <SandboxLayout
      title="Historial Clínico de Podología"
      description="Ficha digital premium con alertas de riesgo clínico automático para pie diabético"
    >
      <HistorialClinicoComponent />
    </SandboxLayout>
  );
}
