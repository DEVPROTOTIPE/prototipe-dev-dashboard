import React, { useState, useRef, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalScratchCardReward({
  width = 300,
  height = 150,
  overlayColor = '#a1a1aa', // zinc-400
  overlayText = '¡Raspa aquí con el ratón!',
  brushSize = 24,
  revealThreshold = 45, // porcentaje de raspado para auto-revelar
  onComplete,
  children,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pintar fondo satinado de cobertura
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);

    // Agregar texto descriptivo centrado
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(overlayText, width / 2, height / 2);
  }, [width, height, overlayColor, overlayText]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Soporte para mouse y touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Usar composición global 'destination-out' para borrar píxeles
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    checkPercentage();
  };

  const checkPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Contar píxeles borrados (alfa === 0)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;

    if (percentage >= revealThreshold) {
      setIsRevealed(true);
      if (onComplete) onComplete();
    }
  };

  // Manejadores de Eventos
  const handleStart = (e) => {
    setIsScratching(true);
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleMove = (e) => {
    if (!isScratching) return;
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleEnd = () => {
    setIsScratching(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden border border-[var(--color-border)] select-none cursor-crosshair bg-[var(--color-surface)] ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Contenido oculto revelado */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        {children}
      </div>

      {/* Capa Canvas de Raspado */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 w-full h-full z-10"
        />
      )}
    </div>
  );
}

export default function ScratchCardRewardSandbox() {
  const [key, setKey] = useState(0);
  const [complete, setComplete] = useState(false);

  const handleReset = () => {
    setKey((prev) => prev + 1);
    setComplete(false);
  };

  return (
    <SandboxLayout
      title="ScratchCardReward"
      description="Tarjeta interactiva rascable basada en Canvas HTML5 para incentivos comerciales, cupones y gamificación."
      controls={
        <div className="space-y-4">
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-all shadow-sm"
          >
            Restablecer Tarjeta
          </button>
        </div>
      }
    >
      <div className="w-full max-w-sm mx-auto space-y-6 flex flex-col items-center">
        <LocalScratchCardReward
          key={key}
          width={320}
          height={160}
          overlayText="¡Raspa para revelar el cupón!"
          overlayColor="#3f3f46" // zinc-700
          revealThreshold={40}
          onComplete={() => setComplete(true)}
          className="shadow-lg"
        >
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/20 w-full h-full border border-emerald-500/30">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-500">
              CÓDIGO REVELADO
            </span>
            <h3 className="text-2xl font-black text-[var(--color-text)] mt-1 font-mono tracking-wider">
              DESC-4522
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-1">
              Recibes 15% OFF en tu primer pedido
            </p>
          </div>
        </LocalScratchCardReward>

        {complete && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-center text-xs font-semibold animate-pulse w-full max-w-[320px]">
            🎉 ¡Felicidades! Recompensa revelada con éxito.
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
