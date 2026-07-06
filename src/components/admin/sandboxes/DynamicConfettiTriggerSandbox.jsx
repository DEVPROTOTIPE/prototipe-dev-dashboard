import React, { useState, useEffect, useRef } from 'react';
import SandboxLayout from './SandboxLayout';

// --- COMPONENT DEFINITION ---
function DynamicConfettiTrigger({
  active = false,
  particleCount = 80,
  colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#eab308'],
  onComplete
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class ConfettiParticle {
      constructor() {
        this.x = canvas.width / 2 + (Math.random() - 0.5) * 50;
        this.y = canvas.height - 20;
        this.size = Math.random() * 8 + 6;
        
        this.vx = (Math.random() - 0.5) * 16;
        this.vy = -Math.random() * 12 - 12;
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.gravity = 0.4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.opacity = 1;
      }

      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        if (this.vy > 0) {
          this.opacity -= 0.015;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2);
        ctx.restore();
      }
    }

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new ConfettiParticle());
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        
        if (p.opacity <= 0 || p.y > canvas.height + 50) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [active, particleCount, colors, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full rounded-xl"
    />
  );
}

// --- SANDBOX EXPORT ---
export default function DynamicConfettiTriggerSandbox() {
  const [active, setActive] = useState(false);
  const [particleCount, setParticleCount] = useState(80);

  const controls = [
    {
      name: 'particleCount',
      label: 'Cantidad de Partículas',
      type: 'number',
      value: particleCount,
      min: 30,
      max: 180,
      step: 10,
      onChange: (v) => setParticleCount(v),
    }
  ];

  const handleTrigger = () => {
    setActive(false);
    // Un leve timeout para forzar el remonte del componente de confeti
    setTimeout(() => {
      setActive(true);
    }, 50);
  };

  return (
    <SandboxLayout
      title="DynamicConfettiTrigger"
      description="Disparador interactivo de explosión de confeti con física de gravedad en Canvas"
      controls={controls}
    >
      <div className="py-12 flex flex-col items-center justify-center bg-[var(--color-surface-2)] rounded-xl min-h-[350px] p-6 relative overflow-hidden">
        {/* Componente Confeti */}
        <DynamicConfettiTrigger 
          active={active} 
          particleCount={particleCount}
          onComplete={() => setActive(false)}
        />

        <div className="flex flex-col items-center gap-4 text-center z-20">
          <span className="text-4xl animate-bounce">🏆</span>
          <h4 className="text-xl font-bold text-[var(--color-text)]">
            ¡Meta Alcanzada!
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
            Presiona el botón de abajo para simular una venta POS exitosa y disparar el confeti físico.
          </p>
          <button
            onClick={handleTrigger}
            className="mt-2 py-3 px-6 rounded-xl bg-indigo-500 !text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all"
          >
            Lanzar Confeti de Venta
          </button>
        </div>
      </div>
    </SandboxLayout>
  );
}
