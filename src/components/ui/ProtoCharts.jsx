/**
 * PROTOTIPE Charts — SVG Pure (Zero Dependencies)
 * ─────────────────────────────────────────────────
 * Colección de componentes de visualización de datos 100% SVG nativos.
 * Sin recharts, sin D3, sin ninguna dependencia externa.
 *
 * Componentes exportados:
 *  - Sparkline          → línea de tendencia inline
 *  - AreaChart          → gráfica de área con gradiente y tooltip
 *  - BarChart           → barras verticales con animación
 *  - KpiCard            → tarjeta de KPI completa con sparkline integrada
 */

import React, { useMemo, useState, useRef, useCallback } from 'react';

// ─── UTILIDADES ─────────────────────────────────────────────────────────────

/** Normaliza un array de valores al rango [padY, h - padY] dentro del viewBox */
function normalizePoints(data, w, h, padX = 0, padY = 4) {
  if (!data || data.length < 2) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: padY + (1 - (v - min) / range) * (h - padY * 2),
    raw: v,
  }));
}

/** Genera un path SVG suavizado con Bézier cuadrático (algoritmo midpoint) */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const xMid = (pts[i].x + pts[i + 1].x) / 2;
    const yMid = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x},${pts[i].y} ${xMid},${yMid}`;
  }
  d += ` Q ${pts[pts.length - 2].x},${pts[pts.length - 2].y} ${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;
  return d;
}

/** Formatea números grandes a notación compacta: 1500 → 1.5K */
export function formatCompact(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

// ─── SPARKLINE ───────────────────────────────────────────────────────────────
/**
 * Línea de tendencia ultra-compacta. Ideal para tablas y KPI cards inline.
 *
 * @param {number[]} data        - Array de valores numéricos
 * @param {number}   w           - Ancho en px (default 80)
 * @param {number}   h           - Alto en px (default 32)
 * @param {string}   color       - Color del trazo (default var(--color-primary))
 * @param {boolean}  area        - Si muestra relleno debajo de la línea
 * @param {number}   strokeWidth - Grosor del trazo (default 1.5)
 */
export function Sparkline({ data = [], w = 80, h = 32, color, area = false, strokeWidth = 1.5 }) {
  const pts = useMemo(() => normalizePoints(data, w, h, 2, 3), [data, w, h]);
  const linePath = useMemo(() => smoothPath(pts), [pts]);
  const stroke = color || 'var(--color-primary)';
  const id = useMemo(() => `sp-${Math.random().toString(36).slice(2)}`, []);

  if (pts.length < 2) return null;

  const areaPath = linePath
    + ` L ${pts[pts.length - 1].x},${h} L ${pts[0].x},${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
      {area && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {area && <path d={areaPath} fill={`url(#${id})`} />}
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── AREA CHART ──────────────────────────────────────────────────────────────
/**
 * Gráfica de área con tooltip flotante, ejes Y, línea de promedio opcional.
 *
 * @param {number[]} data        - Valores del eje Y
 * @param {string[]} labels      - Etiquetas del eje X (misma longitud que data)
 * @param {string}   color       - Color principal
 * @param {number}   h           - Altura total en px (default 160)
 * @param {boolean}  showAvg     - Muestra línea de promedio
 * @param {string}   unit        - Unidad para el tooltip (ej: '$ ', '%')
 * @param {function} formatY     - Formateador custom para eje Y
 */
export function AreaChart({
  data = [],
  labels = [],
  color,
  h = 160,
  showAvg = false,
  unit = '',
  formatY = formatCompact,
}) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);
  const stroke = color || 'var(--color-primary)';
  const gradId = useMemo(() => `ac-${Math.random().toString(36).slice(2)}`, []);

  const PAD = { top: 12, right: 12, bottom: 28, left: 40 };

  // Dimensiones dinámicas — usamos 100% de ancho via viewBox
  const VW = 480;
  const VH = h;
  const chartW = VW - PAD.left - PAD.right;
  const chartH = VH - PAD.top - PAD.bottom;

  const pts = useMemo(
    () => normalizePoints(data, chartW, chartH, 0, 2),
    [data, chartW, chartH]
  );

  const linePath = useMemo(() => smoothPath(pts), [pts]);

  const areaPath = pts.length >= 2
    ? linePath + ` L ${pts[pts.length - 1].x},${chartH} L ${pts[0].x},${chartH} Z`
    : '';

  const min = Math.min(...data);
  const max = Math.max(...data);
  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const avgY = pts.length ? 2 + (1 - (avg - min) / (max - min || 1)) * (chartH - 4) : 0;

  // Etiquetas eje Y (4 niveles)
  const yTicks = [0, 0.33, 0.66, 1].map(t => ({
    value: min + t * (max - min),
    y: 2 + (1 - t) * (chartH - 4),
  }));

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || pts.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * VW - PAD.left;
    const idx = Math.round((mouseX / chartW) * (pts.length - 1));
    const clamped = Math.max(0, Math.min(pts.length - 1, idx));
    setHover(clamped);
  }, [pts, chartW, VW, PAD.left]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: '100%', height: `${h}px`, overflow: 'visible', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <g transform={`translate(${PAD.left}, ${PAD.top})`}>
          {/* Grid lines Y */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={0} y1={t.y} x2={chartW} y2={t.y}
                stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
              <text x={-6} y={t.y + 4} textAnchor="end"
                style={{ fontSize: '9px', fill: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                {formatY(t.value)}
              </text>
            </g>
          ))}

          {/* Línea de promedio */}
          {showAvg && (
            <line x1={0} y1={avgY} x2={chartW} y2={avgY}
              stroke={stroke} strokeWidth="1" strokeDasharray="6 3" opacity="0.4" />
          )}

          {/* Área */}
          {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

          {/* Línea */}
          {linePath && (
            <path d={linePath} fill="none" stroke={stroke} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Etiquetas X */}
          {pts.map((pt, i) => {
            if (labels.length <= i) return null;
            const step = Math.max(1, Math.floor(pts.length / 6));
            if (i % step !== 0 && i !== pts.length - 1) return null;
            return (
              <text key={i} x={pt.x} y={chartH + 18} textAnchor="middle"
                style={{ fontSize: '9px', fill: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                {labels[i]}
              </text>
            );
          })}

          {/* Tooltip hover */}
          {hover !== null && pts[hover] && (
            <>
              <line x1={pts[hover].x} y1={0} x2={pts[hover].x} y2={chartH}
                stroke={stroke} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
              <circle cx={pts[hover].x} cy={pts[hover].y} r="4"
                fill={stroke} stroke="var(--color-surface)" strokeWidth="2" />
              {/* Tooltip box */}
              <g transform={`translate(${Math.min(pts[hover].x - 30, chartW - 70)}, ${Math.max(pts[hover].y - 36, 0)})`}>
                <rect width="64" height="22" rx="5"
                  fill="var(--color-surface)" stroke={stroke} strokeWidth="1" opacity="0.95" />
                <text x="32" y="15" textAnchor="middle"
                  style={{ fontSize: '10px', fontWeight: 700, fill: stroke, fontFamily: 'monospace' }}>
                  {unit}{data[hover]?.toLocaleString('es-CO')}
                </text>
              </g>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
/**
 * Gráfica de barras verticales con animación CSS y tooltip hover.
 *
 * @param {number[]}  data    - Valores
 * @param {string[]}  labels  - Etiquetas eje X
 * @param {string[]}  colors  - Color por barra (opcional, usa primary si no)
 * @param {number}    h       - Altura total (default 140)
 * @param {string}    unit    - Prefijo de valor en tooltip
 * @param {boolean}   rounded - Bordes redondeados en barras
 */
export function BarChart({
  data = [],
  labels = [],
  colors = [],
  h = 140,
  unit = '',
  rounded = true,
}) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...data, 1);
  const PAD = { top: 8, right: 4, bottom: 24, left: 36 };
  const VW = 480;
  const VH = h;
  const chartW = VW - PAD.left - PAD.right;
  const chartH = VH - PAD.top - PAD.bottom;

  const barW = (chartW / data.length) * 0.6;
  const gap = chartW / data.length;

  const yTicks = [0, 0.5, 1].map(t => ({
    value: t * max,
    y: PAD.top + (1 - t) * chartH,
  }));

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`}
      style={{ width: '100%', height: `${h}px`, overflow: 'visible', display: 'block' }}>

      <g transform={`translate(${PAD.left}, 0)`}>
        {/* Grid */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={0} y1={t.y} x2={chartW} y2={t.y}
              stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.5" />
            <text x={-5} y={t.y + 4} textAnchor="end"
              style={{ fontSize: '9px', fill: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
              {formatCompact(t.value)}
            </text>
          </g>
        ))}

        {/* Barras */}
        {data.map((val, i) => {
          const barH = (val / max) * chartH;
          const x = i * gap + gap / 2 - barW / 2;
          const y = PAD.top + chartH - barH;
          const c = colors[i] || 'var(--color-primary)';
          const r = rounded ? Math.min(4, barW / 2) : 0;
          const isHovered = hover === i;

          return (
            <g key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}>
              {/* Barra con esquinas superiores redondeadas */}
              <path
                d={`M ${x + r},${y} H ${x + barW - r} Q ${x + barW},${y} ${x + barW},${y + r} V ${y + barH} H ${x} V ${y + r} Q ${x},${y} ${x + r},${y}`}
                fill={c}
                opacity={isHovered ? 1 : 0.75}
                style={{ transition: 'opacity 0.15s' }}
              />

              {/* Etiqueta X */}
              <text x={x + barW / 2} y={PAD.top + chartH + 16} textAnchor="middle"
                style={{ fontSize: '9px', fill: isHovered ? 'var(--color-text)' : 'var(--color-text-muted)', fontFamily: 'monospace', transition: 'fill 0.15s' }}>
                {labels[i] || i}
              </text>

              {/* Tooltip */}
              {isHovered && (
                <g transform={`translate(${Math.min(x + barW / 2 - 32, chartW - 70)}, ${y - 28})`}>
                  <rect width="64" height="22" rx="5"
                    fill="var(--color-surface)" stroke={c} strokeWidth="1" opacity="0.97" />
                  <text x="32" y="15" textAnchor="middle"
                    style={{ fontSize: '10px', fontWeight: 700, fill: c, fontFamily: 'monospace' }}>
                    {unit}{val.toLocaleString('es-CO')}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
/**
 * Tarjeta de indicador clave de rendimiento con sparkline integrada.
 *
 * @param {string}   title     - Nombre del KPI
 * @param {number}   value     - Valor principal
 * @param {number}   prevValue - Valor anterior (calcula % de cambio)
 * @param {number[]} trend     - Array de valores para sparkline
 * @param {string}   unit      - Prefijo (ej: '$', '%')
 * @param {string}   suffix    - Sufijo (ej: 'uds', 'kg')
 * @param {string}   icon      - Emoji o carácter para el ícono
 * @param {string}   color     - Color de acento
 * @param {function} formatVal - Formateador del valor principal
 */
export function KpiCard({
  title = 'KPI',
  value = 0,
  prevValue,
  trend = [],
  unit = '',
  suffix = '',
  icon = '📊',
  color,
  formatVal = (v) => v.toLocaleString('es-CO'),
}) {
  const accentColor = color || 'var(--color-primary)';
  const hasPrev = prevValue !== undefined && prevValue !== null;
  const delta = hasPrev && prevValue !== 0
    ? ((value - prevValue) / Math.abs(prevValue)) * 100
    : null;
  const isPositive = delta !== null && delta >= 0;
  const deltaColor = delta === null ? 'var(--color-text-muted)'
    : isPositive ? '#22c55e' : '#ef4444';

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      position: 'relative',
      overflow: 'hidden',
      minWidth: '180px',
    }}>
      {/* Glow decorativo */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '80px', height: '80px', borderRadius: '50%',
        background: accentColor, opacity: 0.07,
        transform: 'translate(30%, -30%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <span style={{
          fontSize: '18px', lineHeight: 1,
          background: `${accentColor}20`,
          padding: '4px 6px', borderRadius: '8px',
        }}>{icon}</span>
      </div>

      {/* Valor principal */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {unit && <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{unit}</span>}
        <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1, letterSpacing: '-1px' }}>
          {formatVal(value)}
        </span>
        {suffix && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{suffix}</span>}
      </div>

      {/* Sparkline + Delta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {trend.length >= 2 && (
          <Sparkline data={trend} w={90} h={28} color={accentColor} area />
        )}
        {delta !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            background: `${deltaColor}18`, borderRadius: '20px',
            padding: '2px 8px',
          }}>
            <span style={{ fontSize: '11px', color: deltaColor }}>{isPositive ? '▲' : '▼'}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: deltaColor }}>
              {Math.abs(delta).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXPORTS DEFAULT ─────────────────────────────────────────────────────────
export default { Sparkline, AreaChart, BarChart, KpiCard, formatCompact };
