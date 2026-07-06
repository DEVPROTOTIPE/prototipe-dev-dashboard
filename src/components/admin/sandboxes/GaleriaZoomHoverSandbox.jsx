import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente real inline para el Sandbox
function GaleriaZoomHover({
  images = [],
  zoomScale = 2,
  className = ''
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const containerRef = React.useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeImage = images[activeIndex] || {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=90',
    alt: 'Zapato deportivo rojo'
  };

  React.useEffect(() => {
    setIsLoading(true);
  }, [activeIndex]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage.highResUrl || activeImage.url})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: `${width * zoomScale}px ${height * zoomScale}px`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div 
      id="galeria-zoom-hover-wrapper"
      className={`flex flex-col md:flex-row gap-3.5 w-full ${className} animate-fade-in`}
    >
      {/* Miniaturas */}
      <div 
        id="galeria-thumbnails"
        className="flex flex-row md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-visible py-0.5 md:py-0"
      >
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`relative w-12 h-12 rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer ${
              idx === activeIndex
                ? 'border-indigo-500 ring-2 ring-indigo-500/25 scale-95 shadow-md shadow-indigo-500/10'
                : 'border-[var(--color-border)] hover:border-indigo-500/50'
            }`}
          >
            <img 
              src={img.url} 
              alt={img.alt || `Miniatura ${idx + 1}`} 
              className="w-full h-full object-cover select-none"
            />
          </button>
        ))}
      </div>

      {/* Visor Principal */}
      <div className="flex-1 order-1 md:order-2">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-square rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden cursor-crosshair group shadow-inner"
          id="zoom-main-image-viewport"
        >
          {isLoading && (
            <div className="absolute inset-0 bg-[var(--color-bg)]/50 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
            </div>
          )}

          <img
            src={activeImage.url}
            alt={activeImage.alt || 'Imagen de producto'}
            onLoad={() => setIsLoading(false)}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />

          <div
            className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-150 border border-indigo-500/10 bg-no-repeat opacity-0 group-hover:opacity-100"
            style={zoomStyle}
          />
          
          <div className="absolute bottom-3 right-3 bg-[var(--color-surface)]/75 backdrop-blur-md border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text)] px-2.5 py-1 rounded-lg pointer-events-none flex items-center gap-1.5 shadow-sm opacity-100 group-hover:opacity-0 transition-opacity">
            <svg className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Hover para zoom
          </div>
        </div>
      </div>
    </div>
  );
}

const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=90',
    alt: 'Calzado deportivo rojo - Vista lateral'
  },
  {
    url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&auto=format&fit=crop&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&auto=format&fit=crop&q=90',
    alt: 'Calzado deportivo rojo - Textura suela'
  },
  {
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80',
    highResUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&auto=format&fit=crop&q=90',
    alt: 'Calzado deportivo verde - Alternativa'
  }
];

export default function GaleriaZoomHoverSandbox() {
  const [scale, setScale] = useState(2);

  const controls = [
    {
      label: 'Escala de Lupa: x1.5',
      type: 'toggle',
      value: scale === 1.5,
      onChange: (val) => setScale(val ? 1.5 : 2.5),
      labels: ['Activado (1.5x)', 'Por defecto (2.5x)']
    }
  ];

  return (
    <SandboxLayout
      title="Galería con Zoom en Hover"
      description="Simulador interactivo del visor de producto premium con lupa virtual para magnificar texturas y costuras."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-80">
        <GaleriaZoomHover
          images={sampleImages}
          zoomScale={scale}
        />
      </div>
    </SandboxLayout>
  );
}
