import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { ShieldAlert, Camera, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import CustomSelect from '../../ui/CustomSelect';
import { useAlertConfirm } from '../../common/AlertConfirmContext'; // Import hook for premium confirmation

// Recreación inline del componente
function FormularioSolicitudRectificacion({
  onSubmit = null,
  materialOptions = [
    { value: 'steel_hard', label: 'Acero Templado / Herramienta' },
    { value: 'steel_soft', label: 'Acero SAE 1020 / 1045' },
    { value: 'cast_iron', label: 'Fundición Gris' },
    { value: 'bronze', label: 'Bronce fosforado' }
  ],
  damageOptions = [
    { value: 'wear', label: 'Desgaste Dimensional' },
    { value: 'scratch', label: 'Rayadura Profunda o Fisura' },
    { value: 'deformed', label: 'Deformación / Alabeo' },
    { value: 'broken', label: 'Pieza rota (Requiere soldadura + mecanizado)' }
  ]
}) {
  const [material, setMaterial] = useState(materialOptions[0].value);
  const [damageType, setDamageType] = useState(damageOptions[0].value);
  const [desc, setDesc] = useState('');
  const [measure, setMeasure] = useState(''); // Medida actual (mm)
  const [targetMeasure, setTargetMeasure] = useState(''); // Medida objetivo (mm)
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const confirm = useAlertConfirm();

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const list = [];
      for (let i = 0; i < files.length; i++) {
        list.push({
          name: files[i].name,
          url: URL.createObjectURL(files[i])
        });
      }
      setImages([...images, ...list]);
    }
  };

  const removeImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);
  };

  const handleClear = async () => {
    const confirmed = await confirm({
      title: 'Limpiar Solicitud',
      message: '¿Estás seguro de que deseas vaciar todos los campos de este formulario de rectificación?',
      variant: 'warning',
      confirmText: 'Sí, limpiar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      setMaterial(materialOptions[0].value);
      setDamageType(damageOptions[0].value);
      setDesc('');
      setMeasure('');
      setTargetMeasure('');
      setImages([]);
      setSubmitted(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        material,
        damageType,
        description: desc,
        currentMeasure: parseFloat(measure) || 0,
        targetMeasure: parseFloat(targetMeasure) || 0,
        imagesCount: images.length
      });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-green-500/20 rounded-2xl p-8 shadow-sm text-center flex flex-col items-center justify-center">
        <CheckCircle2 size={48} className="text-green-500 mb-3" />
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1">Solicitud Registrada</h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-6 max-w-xs">
          El reporte dimensional y las imágenes de desgaste han sido enviados al equipo de rectificadores.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 cursor-pointer"
        >
          Crear Nueva Solicitud
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <ShieldAlert size={16} className="text-[var(--color-primary)]" />
        <span>Solicitud de Rectificación</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Describe el desgaste y sube evidencia fotográfica para evaluar la viabilidad de la reparación.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fila de Daño y Material */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Material Base</label>
            <CustomSelect
              value={material}
              onChange={setMaterial}
              options={materialOptions}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Falla / Síntoma Principal</label>
            <CustomSelect
              value={damageType}
              onChange={setDamageType}
              options={damageOptions}
            />
          </div>
        </div>

        {/* Medidas Críticas */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Medida Actual (mm)</label>
            <input
              type="number"
              step="0.001"
              value={measure}
              onChange={(e) => setMeasure(e.target.value)}
              placeholder="Ej: 49.82"
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block mb-1">Medida Objetivo (mm)</label>
            <input
              type="number"
              step="0.001"
              value={targetMeasure}
              onChange={(e) => setTargetMeasure(e.target.value)}
              placeholder="Ej: 50.00"
              className="w-full h-9 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none"
              required
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1">Descripción del Desgaste</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Especifica si tiene ralladuras, zonas ovaladas o si requiere rectificado plano o cilíndrico..."
            className="w-full h-20 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none resize-none"
            required
          />
        </div>

        {/* Dropzone de Carga */}
        <div>
          <label className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-1.5">Fotografías del Desgaste</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-14 h-14 border border-[var(--color-border)] rounded-lg overflow-hidden group">
                <img src={img.url} alt="desgaste" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <label className="w-14 h-14 border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-2)]/40 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Camera size={16} className="text-[var(--color-text-muted)]" />
            </label>
          </div>
        </div>

        {/* Botones de Envío y Limpieza */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 h-10 border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Limpiar Formulario
          </button>
          <button
            type="submit"
            className="flex-1 h-10 bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>Enviar Solicitud</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function FormularioSolicitudRectificacionSandbox() {
  const [data, setData] = useState(null);

  return (
    <SandboxLayout
      title="Formulario de Solicitud de Rectificación"
      description="Formulario de taller para detallar dimensiones y fallas de piezas a rectificar, con confirmaciones useAlertConfirm."
      controls={[]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <FormularioSolicitudRectificacion
          onSubmit={setData}
        />
        {data && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-xs">
            Solicitud enviada para pieza de <strong>{data.material}</strong>. Desgaste registrado de: {(data.targetMeasure - data.currentMeasure).toFixed(3)} mm.
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
