import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Upload, AlertCircle, HelpCircle } from 'lucide-react';
import SandboxLayout from './SandboxLayout';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: CircularDishMenu (Arco, Infinito, Desenfoque y Diseño Premium)
// ─────────────────────────────────────────────────────────────────────────────
function CircularDishMenu({
  items,
  title = 'Menú de Platos',
  subtitle = 'Explora las opciones disponibles',
  selectedId,
  onSelect,
  onItemsChange,
  allowUpload = true,
  showPrice = true,
  showCategory = true,
  showDescription = true,
  maxFileSizeMB = 4,
  emptyText = 'Aún no hay platos cargados',
  size = 'md',
  variant = 'default',
  className = ''
}) {
  const [localItems, setLocalItems] = useState(items);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadError, setUploadError] = useState('');
  
  const dragStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef([]);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    if (selectedId !== undefined) {
      const idx = localItems.findIndex(item => item.id === selectedId);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [selectedId, localItems]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const activeDish = localItems[activeIndex] || null;

  const handleSelectIndex = (index) => {
    const total = localItems.length;
    if (total === 0) return;
    
    const normalizedIndex = (index + total) % total;
    setActiveIndex(normalizedIndex);
    setUploadError('');

    if (onSelect && localItems[normalizedIndex]) {
      onSelect(localItems[normalizedIndex]);
    }
  };

  const handlePrev = () => handleSelectIndex(activeIndex - 1);
  const handleNext = () => handleSelectIndex(activeIndex + 1);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (localItems.length === 0) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, localItems]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeDish) return;

    if (file.type !== 'image/png') {
      setUploadError('Únicamente se permiten imágenes en formato PNG.');
      return;
    }

    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`El archivo excede el tamaño máximo permitido de ${maxFileSizeMB} MB.`);
      return;
    }

    setUploadError('');
    const localUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(localUrl);

    const updatedItems = localItems.map((item, idx) => {
      if (idx === activeIndex) {
        return { ...item, image: localUrl };
      }
      return item;
    });

    setLocalItems(updatedItems);
    if (onItemsChange) {
      onItemsChange(updatedItems);
    }
  };

  // Gestos Swipe
  const handleDragStart = (clientX) => {
    dragStartRef.current = clientX;
    isDraggingRef.current = true;
  };

  const handleDragMove = (clientX) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    const diff = clientX - dragStartRef.current;
    
    if (Math.abs(diff) > 60) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      isDraggingRef.current = false;
      dragStartRef.current = null;
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  // Configuración de tamaños físicos
  const sizeStyles = {
    sm: {
      activeWidth: 'w-28 h-28',
      inactiveWidth: 'w-20 h-20',
      spacing: 85,
      yOffsetMultiplier: 12,
      containerHeight: 'h-48'
    },
    md: {
      activeWidth: 'w-40 h-40',
      inactiveWidth: 'w-28 h-28',
      spacing: 120,
      yOffsetMultiplier: 16,
      containerHeight: 'h-64'
    },
    lg: {
      activeWidth: 'w-52 h-52',
      inactiveWidth: 'w-36 h-36',
      spacing: 155,
      yOffsetMultiplier: 22,
      containerHeight: 'h-80'
    }
  };

  if (localItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--color-border)] rounded-3xl bg-[var(--color-surface)]/20 text-center">
        <AlertCircle size={24} className="text-[var(--color-text-muted)]" />
        <p className="text-xs font-bold text-[var(--color-text-muted)] mt-2">{emptyText}</p>
      </div>
    );
  }

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`space-y-6 select-none ${className}`}>
      {/* Cabecera */}
      {variant !== 'compact' && (
        <div className="text-center">
          <h3 className="text-base font-black text-[var(--color-text)] tracking-tight">{title}</h3>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
        </div>
      )}

      {/* Contenedor del Carrusel en Arco con overflow-visible */}
      <div 
        className={`relative w-full overflow-visible flex items-center justify-center ${currentSize.containerHeight}`}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Flecha Izquierda */}
        <button
          onClick={handlePrev}
          className="absolute left-4 z-30 p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg shadow-black/5 text-[var(--color-text)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Arco de Platos */}
        <div className="relative w-full max-w-lg h-full flex items-center justify-center overflow-visible">
          {localItems.map((item, index) => {
            const total = localItems.length;
            
            let offset = index - activeIndex;
            if (offset < -total / 2) offset += total;
            if (offset > total / 2) offset -= total;

            const absOffset = Math.abs(offset);
            const isCenter = absOffset === 0;

            if (absOffset > 2) return null;

            // Fórmulas de Transformación
            const translateX = offset * currentSize.spacing;
            const translateY = Math.pow(absOffset, 2) * currentSize.yOffsetMultiplier;
            const scale = 1 - absOffset * 0.18;
            const opacity = 1 - absOffset * 0.45;
            const zIndex = 20 - absOffset;

            // Desenfoque gradual (Depth of Field)
            const blurAmount = isCenter ? 0 : absOffset === 1 ? 1.5 : 3.5;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectIndex(index)}
                style={{
                  transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  filter: `blur(${blurAmount}px)`,
                  transition: 'all 450ms cubic-bezier(0.25, 1, 0.5, 1)'
                }}
                className={`absolute ${isCenter ? currentSize.activeWidth : currentSize.inactiveWidth} flex items-center justify-center`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  
                  {/* DISEÑO PREMIUM: Efectos exclusivos para el plato central */}
                  {isCenter && (
                    <>
                      {/* Glow de Ambiente Difuso */}
                      <div className="absolute -inset-4 bg-[var(--color-primary)]/25 rounded-full blur-xl animate-pulse pointer-events-none" />
                      
                      {/* Anillo de Órbita de Puntos Giratorio */}
                      <div className="absolute -inset-6 rounded-full border border-dashed border-[var(--color-primary)]/50 animate-[spin_25s_linear_infinite] pointer-events-none" />
                    </>
                  )}

                  {/* Wrapper del Borde */}
                  <div className={`w-full h-full rounded-full transition-all duration-300 p-[3px] ${
                    isCenter 
                      ? 'bg-gradient-to-tr from-[var(--color-primary)] via-indigo-500 to-amber-400 shadow-xl' 
                      : 'bg-transparent border border-[var(--color-border)] hover:border-[var(--color-primary)]/30'
                  }`}>
                    {/* Espaciador de Separación (Gap) */}
                    <div className={`w-full h-full rounded-full p-1.5 ${isCenter ? 'bg-[var(--color-bg)]' : 'bg-transparent'}`}>
                      {/* Círculo de la Imagen */}
                      <div className="w-full h-full rounded-full overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)] relative flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-full"
                            draggable="false"
                          />
                        ) : (
                          <HelpCircle size={32} className="text-[var(--color-text-muted)]" />
                        )}

                        {!item.available && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-full">
                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-white tracking-widest px-1.5 py-0.5 bg-red-600 rounded">Agotado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 bg-[var(--color-primary)] text-white font-black uppercase tracking-wider rounded-full shadow-md text-[8px] sm:text-[9px] z-10 ${
                      isCenter ? 'px-2.5 py-1' : 'px-1.5 py-0.5'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Flecha Derecha */}
        <button
          onClick={handleNext}
          className="absolute right-4 z-30 p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg shadow-black/5 text-[var(--color-text)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Título y Precio del Plato Activo (Estático y Centrado abajo del carrusel, evita cortes) */}
      {activeDish && (
        <div className="text-center space-y-1 py-2">
          <h4 className="text-base sm:text-lg font-black text-[var(--color-text)] tracking-tight leading-none">
            {activeDish.name}
          </h4>
          {showPrice && activeDish.price && (
            <span className="text-sm font-black text-[var(--color-primary)] block">
              {activeDish.price}
            </span>
          )}
        </div>
      )}

      {/* Detalle Detallado del Plato Seleccionado */}
      {activeDish && variant !== 'compact' && (
        <div className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-3xl shadow-sm text-left transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center relative shadow-inner">
              {activeDish.image ? (
                <img
                  src={activeDish.image}
                  alt={activeDish.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <HelpCircle size={24} className="text-[var(--color-text-muted)]" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-[var(--color-text)]">{activeDish.name}</h4>
                {showCategory && activeDish.category && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)]">
                    {activeDish.category}
                  </span>
                )}
                {activeDish.badge && (
                  <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-[var(--color-primary)] text-white rounded-lg">
                    {activeDish.badge}
                  </span>
                )}
              </div>

              {showDescription && activeDish.description && (
                <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed max-w-lg">
                  {activeDish.description}
                </p>
              )}

              <div className="flex items-center justify-between gap-4 pt-1">
                {showPrice && (
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Precio</span>
                    <span className="text-sm font-black text-[var(--color-primary)]">{activeDish.price}</span>
                  </div>
                )}

                {allowUpload && (
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[10px] font-bold text-[var(--color-text)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <Upload size={12} className="text-[var(--color-primary)]" />
                      Subir Foto PNG
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 mt-1">
                  <AlertCircle size={10} />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYGROUND: CircularDishMenuSandbox
// ─────────────────────────────────────────────────────────────────────────────
export default function CircularDishMenuSandbox() {
  const [title, setTitle] = useState('Menú de Platos Especiales');
  const [subtitle, setSubtitle] = useState('Desliza o usa las flechas para girar el menú');
  const [size, setSize] = useState('md');
  const [variant, setVariant] = useState('default');
  const [allowUpload, setAllowUpload] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showCategory, setShowCategory] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(4);

  const [items, setItems] = useState([
    {
      id: 'dish-1',
      name: 'Bowl Tropical',
      description: 'Frutas frescas de temporada, granola crocante y crema suave batida.',
      price: '$24.000',
      category: 'Saludable',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      available: true,
      badge: 'Nuevo'
    },
    {
      id: 'dish-2',
      name: 'Pancakes Berry',
      description: 'Pancakes esponjosos caseros con arándanos frescos y miel de abejas.',
      price: '$18.500',
      category: 'Dulce',
      image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300',
      available: true,
      badge: 'Popular'
    },
    {
      id: 'dish-3',
      name: 'Toast Aguacate',
      description: 'Pan de masa madre tostado, aguacate triturado, huevo pochado y semillas.',
      price: '$21.000',
      category: 'Saludable',
      image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=300',
      available: true
    },
    {
      id: 'dish-4',
      name: 'Waffle Nutella',
      description: 'Waffle belga caliente con crema de avellanas, fresas y helado de vainilla.',
      price: '$19.000',
      category: 'Dulce',
      image: 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=300',
      available: false
    },
    {
      id: 'dish-5',
      name: 'Acai Bowl Super',
      description: 'Base de acai orgánico licuado con fresas, banano, chía y coco rallado.',
      price: '$26.000',
      category: 'Saludable',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300',
      available: true,
      badge: 'Recomendado'
    }
  ]);

  const [selectedDish, setSelectedDish] = useState(items[0]);

  const handleSelect = (dish) => {
    setSelectedDish(dish);
  };

  const handleItemsChange = (newItems) => {
    setItems(newItems);
    const updatedSelected = newItems.find(item => item.id === selectedDish?.id);
    if (updatedSelected) {
      setSelectedDish(updatedSelected);
    }
  };

  return (
    <SandboxLayout
      title="CircularDishMenu"
      description="Menú circular responsivo con carrusel horizontal fluido, controles de navegación y soporte de subida de imágenes PNG locales."
      controls={[
        { label: 'Título', type: 'text', value: title, onChange: setTitle },
        { label: 'Subtítulo', type: 'text', value: subtitle, onChange: setSubtitle },
        { label: 'Tamaño', type: 'select', value: size, options: ['sm', 'md', 'lg'], onChange: setSize },
        { label: 'Variante', type: 'select', value: variant, options: ['default', 'compact', 'showcase'], onChange: setVariant },
        { label: 'Subir PNG', type: 'toggle', value: allowUpload, onChange: setAllowUpload, labels: ['No', 'Sí'] },
        { label: 'Mostrar Precio', type: 'toggle', value: showPrice, onChange: setShowPrice, labels: ['No', 'Sí'] },
        { label: 'Mostrar Categ', type: 'toggle', value: showCategory, onChange: setShowCategory, labels: ['No', 'Sí'] },
        { label: 'Mostrar Desc', type: 'toggle', value: showDescription, onChange: setShowDescription, labels: ['No', 'Sí'] },
        { label: 'Peso Máx (MB)', type: 'number', value: String(maxFileSizeMB), onChange: (val) => setMaxFileSizeMB(Number(val) || 1) },
      ]}
    >
      <div className="w-full max-w-2xl space-y-6">
        <CircularDishMenu
          items={items}
          title={title}
          subtitle={subtitle}
          selectedId={selectedDish?.id}
          onSelect={handleSelect}
          onItemsChange={handleItemsChange}
          allowUpload={allowUpload}
          showPrice={showPrice}
          showCategory={showCategory}
          showDescription={showDescription}
          maxFileSizeMB={maxFileSizeMB}
          size={size}
          variant={variant}
        />

        {/* Panel de Depuración */}
        {selectedDish && (
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-4 text-left">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Debug: Plato Seleccionado</h5>
            <pre className="text-[9px] font-mono text-[var(--color-text)] overflow-x-auto bg-[var(--color-bg)]/40 p-3 rounded-xl border border-[var(--color-border)]">
              {JSON.stringify(selectedDish, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
