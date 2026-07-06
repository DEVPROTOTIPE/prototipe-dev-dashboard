import React, { useState, useRef, useEffect } from 'react';
import SandboxLayout from './SandboxLayout';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENT DEFINITION ---
function CanvasRevealCard({
  children,
  className = '',
  dotColor = 'var(--color-primary)',
  dotSize = 2,
  dotGap = 15
}) {
  const [hovered, setHovered] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!hovered || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();

    let mouse = { x: null, y: null };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    const draw = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rows = Math.ceil(canvas.height / dotGap);
      const cols = Math.ceil(canvas.width / dotGap);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * dotGap;
          const y = r * dotGap;

          let scale = 0.5 + Math.sin(time + (x + y) * 0.01) * 0.5;

          if (mouse.x !== null && mouse.y !== null) {
            const dist = Math.hypot(x - mouse.x, y - mouse.y);
            if (dist < 60) {
              scale += (1 - dist / 60) * 1.5;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, dotSize * Math.max(0.2, scale), 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [dotGap, dotSize, dotColor, hovered]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 overflow-hidden min-h-[220px] flex items-center justify-center transition-shadow duration-300 ${
        hovered ? 'shadow-xl shadow-[var(--color-primary)]/5' : 'shadow-sm'
      } ${className}`}
    >
      <AnimatePresence>
        {hovered && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex flex-col justify-between select-none">
        {children}
      </div>
    </div>
  );
}

// --- SANDBOX EXPORT ---
export default function CanvasRevealCardSandbox() {
  const [dotSize, setDotSize] = useState(2);
  const [dotGap, setDotGap] = useState(15);
  const [dotColor, setDotColor] = useState('#8b5cf6'); // Purple default

  const controls = [
    {
      name: 'dotSize',
      label: 'Tamaño del Punto (px)',
      type: 'number',
      value: dotSize,
      min: 1,
      max: 5,
      step: 1,
      onChange: (v) => setDotSize(v),
    },
    {
      name: 'dotGap',
      label: 'Espaciado de la Grilla (px)',
      type: 'number',
      value: dotGap,
      min: 10,
      max: 25,
      step: 1,
      onChange: (v) => setDotGap(v),
    },
    {
      name: 'dotColor',
      label: 'Color de los Puntos (Hex)',
      type: 'text',
      value: dotColor,
      onChange: (v) => setDotColor(v),
    }
  ];

  return (
    <SandboxLayout
      title="CanvasRevealCard"
      description="Tarjeta interactiva con revelación de canvas geométrico en hover"
      controls={controls}
    >
      <div className="py-12 flex items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-6">
        <CanvasRevealCard 
          dotSize={dotSize} 
          dotGap={dotGap} 
          dotColor={dotColor}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col gap-6 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
              Colección Cápsula
            </span>
            <div>
              <h4 className="text-2xl font-black text-[var(--color-text)]">
                Invierno Glamour
              </h4>
              <p className="text-sm text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                Pasa el cursor por encima para revelar la constelación geométrica que sigue a tu mouse.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--color-surface-3)] text-[var(--color-text)]">
                100% Algodón
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--color-surface-3)] text-[var(--color-text)]">
                Eco-Friendly
              </span>
            </div>
          </div>
        </CanvasRevealCard>
      </div>
    </SandboxLayout>
  );
}
