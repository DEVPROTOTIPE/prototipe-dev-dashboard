import React, { useState, useEffect, useRef } from 'react';
import { SandboxLayout } from './SandboxLayout';

function SandboxInteractiveAmbientGlow({
  color1 = 'var(--color-primary)',
  color2 = 'var(--color-accent)',
  color3 = '#ec4899',
  sensitivity = 0.05,
  className = ''
}) {
  const containerRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isPointerActiveRef = useRef(false);
  const gyroRef = useRef({ x: 0, y: 0 });
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!containerRef.current) return;
      isPointerActiveRef.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      mousePosRef.current = { x, y };
    };

    const handlePointerLeave = () => {
      isPointerActiveRef.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
      container.addEventListener('pointerup', handlePointerLeave);
    }

    const handleOrientation = (e) => {
      if (e.beta !== null && e.gamma !== null) {
        const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
        const clampedBeta = Math.max(-45, Math.min(45, e.beta - 45));
        gyroRef.current = { x: clampedGamma, y: clampedBeta };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      if (container) {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
        container.removeEventListener('pointerup', handlePointerLeave);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;

    const updatePosition = () => {
      setGlowOffset((prev) => {
        if (!isPointerActiveRef.current) {
          mousePosRef.current.x += (0 - mousePosRef.current.x) * 0.05;
          mousePosRef.current.y += (0 - mousePosRef.current.y) * 0.05;
        }

        const pointerTargetX = mousePosRef.current.x * sensitivity * 12;
        const pointerTargetY = mousePosRef.current.y * sensitivity * 12;

        const gyroTargetX = gyroRef.current.x * sensitivity * 40;
        const gyroTargetY = gyroRef.current.y * sensitivity * 40;

        const targetX = pointerTargetX + gyroTargetX;
        const targetY = pointerTargetY + gyroTargetY;

        const nextX = prev.x + (targetX - prev.x) * 0.08;
        const nextY = prev.y + (targetY - prev.y) * 0.08;
        return { x: nextX, y: nextY };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [sensitivity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden bg-[var(--color-bg)] z-0 transition-colors duration-500 rounded-3xl ${className}`}
    >
      {/* Blob 1 */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.x * 1.2}px, ${glowOffset.y * 1.2}px, 0)`,
        }}
        className="absolute w-64 h-64 top-[-10%] left-[5%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color1,
            animation: 'floatBlob1 25s ease-in-out infinite'
          }}
          className="w-full h-full rounded-full blur-[60px] opacity-45"
        />
      </div>

      {/* Blob 2 */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.x * -0.9}px, ${glowOffset.y * -0.9}px, 0)`,
        }}
        className="absolute w-64 h-64 bottom-[-10%] right-[10%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color2,
            animation: 'floatBlob2 30s ease-in-out infinite'
          }}
          className="w-full h-full rounded-full blur-[70px] opacity-40"
        />
      </div>

      {/* Blob 3 */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.y * 0.8}px, ${glowOffset.x * 0.8}px, 0)`,
        }}
        className="absolute w-48 h-48 top-[30%] left-[40%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color3,
            animation: 'floatBlob3 20s ease-in-out infinite'
          }}
          className="w-full h-full rounded-full blur-[50px] opacity-35"
        />
      </div>

      <div className="absolute inset-0 backdrop-blur-[40px] bg-[var(--color-bg)]/20 z-2 pointer-events-none" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-40px, 30px) scale(0.95); }
        }
        @keyframes floatBlob3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); }
          50% { transform: translate(30px, 40px) scale(1.15); }
        }
      `}} />
    </div>
  );
}

export default function InteractiveAmbientGlowSandbox() {
  const [sensitivity, setSensitivity] = useState(0.05);

  return (
    <SandboxLayout
      title="Fondo de Luces Orgánicas"
      description="Fondo estético de marca blanca con blobs HSL animados que siguen al puntero con inercia elástica."
      controls={[
        { label: 'Sensibilidad ratón', type: 'number', value: sensitivity, min: 0.01, max: 0.2, step: 0.01, onChange: v => setSensitivity(Number(v)) },
      ]}
    >
      <div className="relative w-full h-64 border border-[var(--color-border)] rounded-3xl overflow-hidden flex items-center justify-center">
        <SandboxInteractiveAmbientGlow sensitivity={sensitivity} />
        <div className="relative z-10 text-center p-6 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 max-w-[240px]">
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Capa Superior</h4>
          <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">Mueve el cursor dentro del área para ver las luces seguir tu puntero.</p>
        </div>
      </div>
    </SandboxLayout>
  );
}
