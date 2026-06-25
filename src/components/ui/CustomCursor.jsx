import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor({ color = '#8b5cf6', size = 40 }) {
  const ringRef    = useRef(null);
  const mouse      = useRef({ x: -200, y: -200 });
  const scaleRef   = useRef(1);
  const rafRef     = useRef(null);
  const isHoverRef = useRef(false);
  const [activated, setActivated] = useState(false);

  // Escapar el color hexadecimal para usar en el SVG inline de forma segura
  const escapedColor = encodeURIComponent(color);

  // Dot SVG renderizado a nivel OS (cero latencia JS) — 4 4 = hotspot centrado
  const DOT_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'><circle cx='4' cy='4' r='3.5' fill='${escapedColor}'/><circle cx='4' cy='4' r='3.5' fill='${escapedColor}' opacity='0.5' filter='blur(2px)'/></svg>`;
  const DOT_CURSOR = `url("data:image/svg+xml,${DOT_SVG}") 4 4, none`;

  useEffect(() => {
    let styleEl = null;
    let targetScale = 1.0;

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px) scale(${scaleRef.current})`;
      }

      const el = e.target.closest('button,a,input,select,textarea,[role="button"],label,[tabindex],.cursor-pointer');
      const hover = !!el;
      if (hover !== isHoverRef.current) {
        isHoverRef.current = hover;
        targetScale = hover ? 1.5 : 1.0;
      }
    };

    const onFirstMove = () => {
      setActivated(true);

      styleEl = document.createElement('style');
      styleEl.id = 'ccursor-style';
      styleEl.textContent = `*,*::before,*::after{cursor:${DOT_CURSOR}!important}`;
      document.head.appendChild(styleEl);

      window.removeEventListener('mousemove', onFirstMove);
      window.addEventListener('mousemove', onMove, { passive: true });
      rafRef.current = requestAnimationFrame(tick);
    };

    const onDown = () => {
      if (ringRef.current) ringRef.current.style.opacity = '0.4';
    };
    const onUp = () => {
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const tick = () => {
      scaleRef.current += (targetScale - scaleRef.current) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${mouse.current.x - size / 2}px, ${mouse.current.y - size / 2}px) scale(${scaleRef.current})`;
        ringRef.current.style.borderColor = isHoverRef.current
          ? color : `${color}99`; // Color completo o con 60% de opacidad (99 en hex)
        ringRef.current.style.backgroundColor = isHoverRef.current
          ? `${color}14` : 'transparent'; // Fondo con 8% de opacidad (14 en hex)
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onFirstMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onFirstMove);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const styleElement = document.getElementById('ccursor-style');
      if (styleElement) styleElement.remove();
    };
  }, [color, size]);

  if (!activated) return null;

  return (
    <div
      ref={ringRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: `1.5px solid ${color}99`,
        backgroundColor: 'transparent',
        willChange: 'transform',
        transformOrigin: 'center center',
      }}
    />
  );
}
