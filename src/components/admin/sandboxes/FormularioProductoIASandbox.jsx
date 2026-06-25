import React, { useState } from 'react';
import SandboxLayout from './SandboxLayout';
import { Sparkles, Camera, Plus, Trash2, Check } from 'lucide-react';

export default function FormularioProductoIASandbox() {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    descripcion: '',
  });
  const [loadingIA, setLoadingIA] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Simular la inyección de IA de Gemini 1.5 Flash
  const handleSimulateIA = () => {
    setLoadingIA(true);
    setTimeout(() => {
      setFormData({
        nombre: 'Auriculares Inalámbricos Quantum Pro',
        precio: '289000',
        categoria: 'Tecnología',
        descripcion: 'Experimenta una inmersión acústica total con cancelación activa de ruido híbrida de 45dB, transductores de grafeno de 40mm para bajos profundos y una autonomía extendida de hasta 60 horas. Diseño ergonómico de almohadillas viscoelásticas premium de memoria y conectividad multipunto Bluetooth 5.4.',
      });
      setSelectedImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60');
      setLoadingIA(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1500);
  };

  const handleClear = () => {
    setFormData({ nombre: '', precio: '', categoria: '', descripcion: '' });
    setSelectedImage(null);
  };

  return (
    <SandboxLayout
      title="Formulario de Producto con IA (Simulador Gemini)"
      description="Simula el flujo inteligente de autocompletado y descripción persuasiva generados automáticamente por Gemini 1.5 Flash al proveer una imagen o título base."
    >
      <div className="space-y-4 max-w-lg mx-auto bg-surface border border-app rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-app pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text)]">Ficha del Producto</h3>
          <div className="flex gap-2">
            <button
              onClick={handleSimulateIA}
              disabled={loadingIA}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={11} className={loadingIA ? 'animate-spin' : ''} />
              {loadingIA ? 'Analizando...' : 'Auto-Completar IA'}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/60 text-slate-300 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Simulador de Subida de Imagen */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Foto del Producto</label>
          <div className="flex items-center gap-4">
            {selectedImage ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-app group">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60')}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-indigo-500/50 flex flex-col items-center justify-center text-[var(--color-text-muted)] hover:text-indigo-400 transition-all cursor-pointer"
              >
                <Camera size={20} />
                <span className="text-[9px] font-bold uppercase mt-1">Cargar</span>
              </button>
            )}
            <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed max-w-[240px]">
              El motor de IA analiza la geometría, color y marca en la foto para sugerir tags, nombres precisos y redactar la ficha de venta persuasiva.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Nombre del Artículo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Auriculares Bluetooth"
              className="w-full px-3.5 py-2.5 bg-surface-2 border border-app rounded-xl text-xs text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Precio ($ COP)</label>
            <input
              type="number"
              value={formData.precio}
              onChange={e => setFormData({ ...formData, precio: e.target.value })}
              placeholder="Ej: 289000"
              className="w-full px-3.5 py-2.5 bg-surface-2 border border-app rounded-xl text-xs text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Categoría</label>
          <input
            type="text"
            value={formData.categoria}
            onChange={e => setFormData({ ...formData, categoria: e.target.value })}
            placeholder="Ej: Tecnología"
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-app rounded-xl text-xs text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Descripción Persuasiva de Ventas</label>
          <textarea
            rows="4"
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Introduce las especificaciones o deja que Gemini redacte una ficha de conversión comercial..."
            className="w-full px-3.5 py-2.5 bg-surface-2 border border-app rounded-xl text-xs text-[var(--color-text)] placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed font-sans"
          />
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
            <Check size={12} />
            ¡Ficha de venta y descripción comercial optimizadas por Gemini!
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
