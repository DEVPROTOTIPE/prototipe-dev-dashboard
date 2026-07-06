import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Check, Heart, Plus, Sparkles } from 'lucide-react';

const PRODUCTOS_DATA = [
  {
    id: 'prod-crema-urea',
    nombre: 'Crema Urea 20%',
    descripcion: 'Hidratación ultra profunda para talones agrietados y resequedad.',
    precio: 35000,
    categoria: 'hidratacion',
    nichoLabel: 'Resequedad',
    imagenColor: 'from-blue-200 to-sky-300'
  },
  {
    id: 'prod-antimicotico',
    nombre: 'Gel Antimicótico',
    descripcion: 'Tratamiento localizado para pie de atleta y micosis en uñas.',
    precio: 42000,
    categoria: 'micosis',
    nichoLabel: 'Hongos',
    imagenColor: 'from-emerald-200 to-teal-300'
  },
  {
    id: 'prod-silicona',
    nombre: 'Separadores de Dedos',
    descripcion: 'Par de ortesis de silicona suave para corrección de hallux valgus.',
    precio: 18000,
    categoria: 'ortesis',
    nichoLabel: 'Juanetes',
    imagenColor: 'from-amber-200 to-orange-300'
  },
  {
    id: 'prod-plantillas',
    nombre: 'Plantillas Confort',
    descripcion: 'Reducción de impactos y amortiguación en metatarso y talón.',
    precio: 75000,
    categoria: 'pisada',
    nichoLabel: 'Dolor / Pisada',
    imagenColor: 'from-indigo-200 to-violet-300'
  }
];

function TarjetasProductosPostCuidadoComponent({ onAddRecipe, activeCondition }) {
  const [selectedCategoria, setSelectedCategoria] = useState('todos');
  const [recetaIds, setRecetaIds] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  const filteredProducts = PRODUCTOS_DATA.filter(prod => {
    const matchesCategoria = selectedCategoria === 'todos' || prod.categoria === selectedCategoria;
    const matchesCondition = !activeCondition || prod.categoria === activeCondition;
    return matchesCategoria && matchesCondition;
  });

  const handleToggleRecipe = (id) => {
    setRecetaIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(pId => pId !== id) : [...prev, id];
      if (onAddRecipe) {
        onAddRecipe(PRODUCTOS_DATA.filter(p => updated.includes(p.id)));
      }
      return updated;
    });
  };

  const toggleFavorito = (id) => {
    setFavoritos(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const formatearPrecio = (valor) => {
    return '$' + valor.toLocaleString('es-CO') + ' COP';
  };

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* Cabecera y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Productos Post-Cuidado</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Recomendados según el tratamiento</p>
        </div>

        {/* Botones de Categorías */}
        <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'hidratacion', label: 'Resequedad' },
            { id: 'micosis', label: 'Hongos' },
            { id: 'ortesis', label: 'Corrección' },
            { id: 'pisada', label: 'Pisada/Dolor' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategoria === cat.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredProducts.map(prod => {
          const inReceta = recetaIds.includes(prod.id);
          const isFav = favoritos.includes(prod.id);
          return (
            <div
              key={prod.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden flex flex-col gap-2 group hover:shadow-md transition-all duration-200"
            >
              {/* Contenedor Imagen Simulado */}
              <div className={`h-28 bg-gradient-to-tr ${prod.imagenColor} relative flex items-center justify-center p-3`}>
                <span className="text-[9px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                  {prod.nichoLabel}
                </span>

                <button
                  type="button"
                  onClick={() => toggleFavorito(prod.id)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/70 hover:bg-white text-slate-700 transition-all cursor-pointer"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                </button>
              </div>

              {/* Detalles de Producto */}
              <div className="p-3 flex flex-col gap-1 flex-1 justify-between">
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-[var(--color-text)] line-clamp-1">{prod.nombre}</h4>
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-normal line-clamp-2 h-7">{prod.descripcion}</p>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-xs font-black text-[var(--color-primary)]">{formatearPrecio(prod.precio)}</span>
                  
                  <button
                    type="button"
                    onClick={() => handleToggleRecipe(prod.id)}
                    className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      inReceta
                        ? 'bg-emerald-500 !text-white hover:bg-emerald-600 shadow-sm'
                        : 'bg-[var(--color-primary)] !text-white hover:bg-[var(--color-primary-dark)] shadow-sm'
                    }`}
                  >
                    {inReceta ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Recetado</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Recetar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recetaIds.length > 0 && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold flex justify-between items-center animate-fadeIn">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Tiene {recetaIds.length} recomendados agregados a la orden.</span>
          </div>
          <button 
            onClick={() => setRecetaIds([])}
            className="text-[9px] font-black uppercase text-red-500 hover:underline cursor-pointer"
          >
            Limpiar Todo
          </button>
        </div>
      )}

    </div>
  );
}

export default function TarjetasProductosPostCuidadoSandbox() {
  return (
    <SandboxLayout
      title="Tarjetas de Productos para Post-Cuidado"
      description="Carrusel/Grid de sugerencias de cremas y plantillas ortopédicas recomendadas clínicamente"
    >
      <TarjetasProductosPostCuidadoComponent />
    </SandboxLayout>
  );
}
