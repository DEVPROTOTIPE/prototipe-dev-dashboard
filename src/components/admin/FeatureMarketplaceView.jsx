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
  Check 
} from 'lucide-react';

export default function FeatureMarketplaceView({ clientesSaas = [] }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/feature-registry');
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

  // Obtener categorías únicas
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

  // Obtener clientes que usan una feature específica
  const getClientsUsingFeature = (featureId) => {
    return clientesSaas.filter(client => 
      client.featuresEnabled?.includes(featureId) || 
      client.activeFeatures?.includes(featureId)
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl shadow-[var(--shadow-default)]">
        <div>
          <h2 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <Store className="text-[var(--color-primary)]" size={24} />
            Feature Marketplace &amp; Registry
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Catálogo universal de módulos funcionales y gobernanza de dependencias del ecosistema.
          </p>
        </div>
        <button 
          onClick={fetchFeatures}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-xs font-bold text-[var(--color-text)] transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Actualizar Registro
        </button>
      </div>

      {/* Grid de 2 Columnas (Layout Bento 30% / 70% o 40% / 60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Panel Izquierdo: Lista de Features (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Controles de Búsqueda y Filtro */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]/60" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar feature o palabra clave..."
                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] placeholder-[var(--color-text-muted)]/40 transition-all"
              />
            </div>

            {/* Carrusel Horizontal de Categorías */}
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
                <span className="text-xs text-[var(--color-text-muted)] italic">Cargando catálogo universal...</span>
              </div>
            ) : filteredFeatures.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--color-text-muted)] italic">
                No se encontraron features en esta categoría.
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

        {/* Panel Derecho: Detalle de Feature Seleccionada (lg:col-span-7) */}
        <div className="lg:col-span-7">
          {selectedFeature ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl space-y-6 shadow-[var(--shadow-default)] animate-fade-in">
              
              {/* Header Detalle */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded-md border border-[var(--color-primary)]/20">
                    {selectedFeature.category}
                  </span>
                  <h3 className="text-lg font-black text-[var(--color-text)] mt-2">
                    {selectedFeature.displayName}
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]/70 block mt-0.5">
                    Feature Identifier: {selectedFeature.id} • Versión: v{selectedFeature.version}
                  </span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  selectedFeature.status === 'stable'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                }`}>
                  {selectedFeature.status}
                </span>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Descripción del Módulo</span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]/50 p-3.5 rounded-xl">
                  {selectedFeature.description}
                </p>
              </div>

              {/* Capabilities Mapeadas */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Capacidades Técnicas Resueltas (Capabilities)</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFeature.capabilities?.map(cap => (
                    <span 
                      key={cap}
                      className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Cpu size={10} />
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dependencias y Compatibilidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Dependencias */}
                <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Dependencias Internas</span>
                  {selectedFeature.dependencies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFeature.dependencies.map(dep => (
                        <span 
                          key={dep}
                          className="text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md"
                        >
                          🔗 {dep}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[var(--color-text-muted)] italic block mt-1">Sin dependencias requeridas.</span>
                  )}
                </div>

                {/* NPM Dependencies */}
                <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Dependencias NPM</span>
                  {selectedFeature.npmDependencies && Object.keys(selectedFeature.npmDependencies).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(selectedFeature.npmDependencies).map(([pkg, ver]) => (
                        <span 
                          key={pkg}
                          className="text-[9px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md"
                        >
                          📦 {pkg} ({ver})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[var(--color-text-muted)] italic block mt-1">Sin librerías npm adicionales.</span>
                  )}
                </div>

              </div>

              {/* Compatibilidad de Industrias */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Compatibilidad Vertical</span>
                <div className="flex flex-wrap gap-1">
                  {selectedFeature.compatibleIndustries?.map(ind => (
                    <span 
                      key={ind}
                      className="text-[9px] font-bold bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded text-[var(--color-text-muted)]"
                    >
                      🏬 {ind.replace(/[_-]/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clientes Activos que Usan el Módulo */}
              <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block flex items-center gap-1">
                  <Users size={12} className="text-emerald-500" />
                  Instancias de Clientes Activos ({getClientsUsingFeature(selectedFeature.id).length})
                </span>
                {getClientsUsingFeature(selectedFeature.id).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {getClientsUsingFeature(selectedFeature.id).map(client => (
                      <div 
                        key={client.id}
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] text-left shrink-0"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[var(--color-text)] block truncate">{client.name}</span>
                          <span className="text-[8px] font-mono text-[var(--color-text-muted)] block truncate">{client.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-[var(--color-surface-2)]/30 border border-dashed border-[var(--color-border)] rounded-xl text-center justify-center">
                    <span className="text-[10px] text-[var(--color-text-muted)] italic">Ninguna instancia utiliza este módulo actualmente.</span>
                  </div>
                )}
              </div>

              {/* Tags de Búsqueda */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--color-border)]/40">
                {selectedFeature.tags?.map(tag => (
                  <span 
                    key={tag}
                    className="text-[8px] font-bold text-[var(--color-text-muted)]/60 bg-[var(--color-surface-3)]/50 border border-[var(--color-border)]/30 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-12 rounded-2xl text-center flex flex-col items-center justify-center h-full gap-3 shadow-[var(--shadow-default)]">
              <Info className="text-[var(--color-text-muted)]/30" size={32} />
              <span className="text-xs text-[var(--color-text-muted)] italic">Selecciona una feature para ver su detalle arquitectónico.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
