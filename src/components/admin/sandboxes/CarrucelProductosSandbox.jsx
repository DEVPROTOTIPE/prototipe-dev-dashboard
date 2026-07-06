import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { ChevronLeft, ChevronRight, ShoppingBag, Star, HelpCircle } from 'lucide-react';

// Recreación inline del componente real para aislamiento del Sandbox
function CarrucelProductos({
  products = [],
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  onAddToCart = () => {}
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [addedIds, setAddedIds] = useState({});
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Determinar cuántos productos se muestran por vista (simulado para el cálculo del índice máximo)
  const [visibleSlides, setVisibleSlides] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (!carouselRef.current) return;
      const width = carouselRef.current.offsetWidth;
      if (width < 450) {
        setVisibleSlides(1);
      } else if (width < 750) {
        setVisibleSlides(2);
      } else {
        setVisibleSlides(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleSlides);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay Effect
  useEffect(() => {
    if (autoPlay && maxIndex > 0) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, autoPlayInterval, nextSlide, maxIndex]);

  // Scroll manual sincronizado con el currentIndex
  useEffect(() => {
    if (carouselRef.current && !isDrag) {
      const slideWidth = carouselRef.current.scrollWidth / products.length;
      carouselRef.current.scrollTo({
        left: currentIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, products.length, isDrag]);

  // Gestores de arrastre (Swipe/Drag)
  const handleMouseDown = (e) => {
    setIsDrag(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDrag) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Factor de velocidad
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDrag) return;
    setIsDrag(false);
    
    // Ajustar al slide más cercano al soltar
    const slideWidth = carouselRef.current.scrollWidth / products.length;
    const rawIndex = carouselRef.current.scrollLeft / slideWidth;
    const nearestIndex = Math.min(maxIndex, Math.max(0, Math.round(rawIndex)));
    setCurrentIndex(nearestIndex);
  };

  const handleTouchStart = (e) => {
    setIsDrag(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDrag) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleAddToCartFeedback = (product) => {
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    onAddToCart(product);
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (!products || products.length === 0) {
    return (
      <div className="w-full py-8 text-center border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] text-xs">
        No hay productos para mostrar en el carrusel.
      </div>
    );
  }

  return (
    <div className="relative w-[340px] xs:w-[480px] sm:w-[600px] md:w-[680px] lg:w-[720px] xl:w-[760px] group/carrusel select-none mx-auto">
      {/* Flechas de Navegación */}
      {showArrows && maxIndex > 0 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--color-surface)]/85 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center cursor-pointer shadow-md hover:bg-[var(--color-primary)] hover:text-white transition-all duration-350 opacity-0 group-hover/carrusel:opacity-100 outline-none border-none"
            aria-label="Anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--color-surface)]/85 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center cursor-pointer shadow-md hover:bg-[var(--color-primary)] hover:text-white transition-all duration-350 opacity-0 group-hover/carrusel:opacity-100 outline-none border-none"
            aria-label="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Contenedor del Carrusel */}
      <div
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
                className="w-full flex gap-4 overflow-x-auto cursor-grab active:cursor-grabbing scrollbar-none py-2 select-none"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((prod) => {
          const isAdded = addedIds[prod.id];
          const hasImage = prod.image && (prod.image.startsWith('http') || prod.image.startsWith('/') || prod.image.startsWith('data:'));
          
          return (
            <div
              key={prod.id}
              className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)] shrink-0 p-4 rounded-[24px] bg-[var(--color-surface)] border border-[var(--color-border)]/65 shadow-md hover:border-[var(--color-primary)]/45 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative flex flex-col justify-between"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Imagen y Descuento */}
              <div className="relative aspect-square w-full rounded-[20px] overflow-hidden bg-[var(--color-surface)]/10 dark:bg-[var(--color-bg)]/20 border border-[var(--color-border)]/30 mb-3 flex items-center justify-center group/img">
                {hasImage ? (
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-500 select-none"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 select-none">
                    <span className="text-4xl">{prod.image || '📦'}</span>
                  </div>
                )}
                {prod.discount && (
                  <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-md z-10">
                    -{prod.discount}%
                  </div>
                )}
              </div>

              {/* Detalles */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                      {prod.category}
                    </span>
                    {prod.rating && (
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star size={8} fill="currentColor" />
                        <span className="text-[8px] font-mono font-bold">{prod.rating}</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[var(--color-text)] truncate mt-1">
                    {prod.name}
                  </h4>
                </div>

                <div className="pt-2 mt-2 border-t border-[var(--color-border)]/35 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    {prod.discount ? (
                      <>
                        <span className="text-[8px] line-through text-[var(--color-text-muted)] font-mono">
                          ${prod.price}
                        </span>
                        <span className="text-xs font-black text-[var(--color-primary)] font-mono">
                          ${Math.round(prod.price * (1 - prod.discount / 100))}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-black text-[var(--color-text)] font-mono">
                        ${prod.price}
                      </span>
                    )}
                  </div>
                  
                  {/* Botón Añadir */}
                  <button
                    onClick={() => handleAddToCartFeedback(prod)}
                    className={`h-7 px-3.5 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-bold transition-all border cursor-pointer outline-none ${
                      isAdded
                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                        : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white hover:scale-[1.03]'
                    }`}
                  >
                    {isAdded ? (
                      <span>¡Añadido!</span>
                    ) : (
                      <>
                        <ShoppingBag size={10} />
                        <span>Añadir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores de Posición (Dots) */}
      {showDots && maxIndex > 0 && (
        <div className="flex justify-center gap-1.5 mt-3.5">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-350 border-none ${
                currentIndex === idx ? 'w-5 bg-[var(--color-primary)]' : 'w-1.5 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]/50'
              }`}
              aria-label={`Ir al grupo de productos ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sandbox Wrapper
export default function CarrucelProductosSandbox() {
  const [autoPlay, setAutoPlay] = useState(false);
  const [showDots, setShowDots] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [addedLogs, setAddedLogs] = useState([]);

  const MOCK_PRODUCTS = [
    { id: '1', name: 'Crema Modeladora Premium', price: 45000, discount: 15, rating: 4.8, category: 'Barbería', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=300&auto=format&fit=crop' },
    { id: '2', name: 'Aceite de Eucalipto para Barba', price: 32000, discount: 10, rating: 4.9, category: 'Barbería', image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=300&auto=format&fit=crop' },
    { id: '3', name: 'Navaja Profesional Acero', price: 95000, discount: 20, rating: 4.7, category: 'Herramientas', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=300&auto=format&fit=crop' },
    { id: '4', name: 'Tijeras de Entresacar 6"', price: 85000, discount: 0, rating: 4.6, category: 'Herramientas', image: 'https://images.unsplash.com/photo-1593702275687-f8b40e12fc77?q=80&w=300&auto=format&fit=crop' },
    { id: '5', name: 'Cera Fijación Extrema', price: 38000, discount: 5, rating: 4.9, category: 'Barbería', image: 'https://images.unsplash.com/photo-1590156546746-c58d8b1393c0?q=80&w=300&auto=format&fit=crop' },
    { id: '6', name: 'Peine de Madera Orgánica', price: 28000, discount: 0, rating: 4.5, category: 'Herramientas', image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=300&auto=format&fit=crop' }
  ];

  const handleAddToCart = (product) => {
    const log = `[${new Date().toLocaleTimeString()}] Añadido al carrito: ${product.name}`;
    setAddedLogs((prev) => [log, ...prev].slice(0, 4));
  };

  return (
    <SandboxLayout
      title="Carrusel de Productos (CarrucelProductos)"
      description="Cuadrícula horizontal de tarjetas de productos premium deslizable con autoplay, navegación interactiva y adaptabilidad responsiva."
      controls={[
        { label: 'Auto-play', type: 'toggle', value: autoPlay, onChange: setAutoPlay, labels: ['Off', 'On'] },
        { label: 'Mostrar Dots', type: 'toggle', value: showDots, onChange: setShowDots, labels: ['Ocultar', 'Mostrar'] },
        { label: 'Mostrar Flechas', type: 'toggle', value: showArrows, onChange: setShowArrows, labels: ['Ocultar', 'Mostrar'] }
      ]}
    >
      <div className="w-full space-y-4">
        {/* Render del carrusel */}
        <CarrucelProductos
          products={MOCK_PRODUCTS}
          autoPlay={autoPlay}
          showDots={showDots}
          showArrows={showArrows}
          onAddToCart={handleAddToCart}
        />

        {/* Logs del Carrito */}
        {addedLogs.length > 0 && (
          <div className="max-w-md mx-auto p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 text-left">
            <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider block mb-1">Registro de Actividad (Carrito)</span>
            <div className="space-y-1 font-mono text-[9px] text-[var(--color-text-muted)]">
              {addedLogs.map((log, idx) => (
                <div key={idx} className="truncate">{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
