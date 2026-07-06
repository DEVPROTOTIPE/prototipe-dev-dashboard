/**
 * BrandingEffectsPanel
 * Panel modular de Design Tokens de efectos y fondos avanzados para el asistente de aprovisionamiento.
 * Expone controles para: shadowStyle, glassmorphism, animationSpeed, radiusMode, bgType, bgMouseTracking, etc.
 * Todos los valores se mapean a alias semánticos CSS en el generador.
 */

import React, { useState, useEffect } from 'react';
import CustomSelect from '../ui/CustomSelect';

import { PARTICLES_LIBRARY_ICONS, PARTICLES_ICONS_BY_KEY } from './particlesIcons';

/**
 * Genera la sombra de caja CSS basada dinámicamente en el color primario
 */
const getShadowCss = (value, color) => {
  const baseColor = color || '#6366f1';
  switch (value) {
    case 'none':
      return 'none';
    case 'soft':
      return `0 10px 30px ${baseColor}26`;
    case 'hard':
      return `4px 4px 0 ${baseColor}`;
    case 'glow':
      return `0 0 24px ${baseColor}55`;
    case 'neon':
      return `0 0 12px ${baseColor}73, 0 0 24px ${baseColor}52, 0 0 48px ${baseColor}2e`;
    default:
      return 'none';
  }
};

const SHADOW_OPTIONS = [
  {
    value: 'none',
    label: 'Sin Sombra',
    icon: '▭',
    desc: 'Diseño plano (flat)',
  },
  {
    value: 'soft',
    label: 'Suave',
    icon: '◎',
    desc: 'Profundidad sutil (recomendado)',
  },
  {
    value: 'hard',
    label: 'Dura',
    icon: '⬛',
    desc: 'Neobrutalism / offset block',
  },
  {
    value: 'glow',
    label: 'Glow',
    icon: '✦',
    desc: 'Resplandor cromático',
  },
  {
    value: 'neon',
    label: 'Neon',
    icon: '⚡',
    desc: 'Efecto neón doble capa',
  },
];

const RADIUS_OPTIONS = [
  {
    value: 'sharp',
    label: 'Sharp',
    icon: '▪',
    desc: 'Totalmente recto',
    css: '0rem',
  },
  {
    value: 'soft',
    label: 'Soft',
    icon: '▫',
    desc: 'Bordes leves (4-8px)',
    css: '0.375rem',
  },
  {
    value: 'rounded',
    label: 'Rounded',
    icon: '▣',
    desc: 'Redondeado premium (defecto)',
    css: '0.75rem',
  },
  {
    value: 'extra',
    label: 'Extra',
    icon: '◈',
    desc: 'Muy redondeado (20px)',
    css: '1.25rem',
  },
  {
    value: 'pill',
    label: 'Pill',
    icon: '⭕',
    desc: 'Cápsulas / pill shape',
    css: '9999px',
  },
];

const ANIMATION_OPTIONS = [
  { value: 'instant', label: 'Instant', desc: '0ms', icon: '⚡' },
  { value: 'fast',    label: 'Rápido',  desc: '150ms', icon: '›' },
  { value: 'normal',  label: 'Normal',  desc: '250ms', icon: '→' },
  { value: 'slow',    label: 'Lento',   desc: '400ms', icon: '⟶' },
];

const BG_TYPE_OPTIONS = [
  { value: 'solid',     label: 'Sólido',      icon: '🎨', desc: 'Fondo de color liso estándar' },
  { value: 'mesh',      label: 'Malla Mesh',  icon: '🔮', desc: 'Orbs flotantes con blur dinámico' },
  { value: 'aurora',    label: 'Aurora',      icon: '🌌', desc: 'Degradado líquido animado' },
  { value: 'grid',      label: 'Rejilla 3D',  icon: '🌐', desc: 'Malla en perspectiva tecnológica' },
  { value: 'particles', label: 'Partículas',  icon: '✨', desc: 'Partículas aceleradas por GPU' },
];

export default function BrandingEffectsPanel({
  primaryColor,
  shadowStyle,
  setShadowStyle,
  glassmorphism,
  setGlassmorphism,
  animationSpeed,
  setAnimationSpeed,
  radiusMode,
  setRadiusMode,
  bgType,
  setBgType,
  bgMouseTracking,
  setBgMouseTracking,
  bgParticlesCount,
  setBgParticlesCount,
  bgParticlesSpeed,
  setBgParticlesSpeed,
  bgParticlesSize,
  setBgParticlesSize,
  bgParticlesColor,
  setBgParticlesColor,
  bgParticlesOpacity,
  setBgParticlesOpacity,
  bgParticlesDirection,
  setBgParticlesDirection,
  bgParticlesShape,
  setBgParticlesShape,
  bgParticlesIcon = 'default',
  setBgParticlesIcon,
  bgOrbsCount,
  setBgOrbsCount,
  bgOrbsOpacity,
  setBgOrbsOpacity,
  borderBeam,
  setBorderBeam,
  tilt3d,
  setTilt3d,
  niche
}) {
  const activeShadow = getShadowCss(shadowStyle, primaryColor);

  const radiusCss =
    RADIUS_OPTIONS.find((o) => o.value === radiusMode)?.css || '0.75rem';

  const [simulatorActive, setSimulatorActive] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [selectedIconCategory, setSelectedIconCategory] = useState('Todos');

  const previewBg = glassmorphism ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)';
  const previewBlur = glassmorphism ? 'blur(16px)' : 'none';
  const previewBorder = glassmorphism ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.04)';
  const animDur = { instant: '0ms', fast: '150ms', normal: '250ms', slow: '400ms' }[animationSpeed] || '250ms';

  const btnRadiusMap = {
    sharp: '0rem',
    soft: '0.375rem',
    rounded: '0.5rem',
    extra: '1rem',
    pill: '9999px',
  };

  const [angle, setAngle] = useState(0);
  useEffect(() => {
    if (!borderBeam) return;
    let frame;
    const tick = () => {
      setAngle((a) => (a + 2) % 360);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [borderBeam]);

  return (
    <div className="space-y-4">
      {/* ─── FONDOS PREMIUM ───────────────────────────────────── */}
      <div className="relative z-20 p-3 bg-[var(--color-bg)]/80 border border-[var(--color-border)] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
            Personalización de Lienzo & Fondos
          </span>
          <span className="text-[8px] font-mono text-indigo-400">bgType:{bgType}</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {BG_TYPE_OPTIONS.map((opt) => {
            const isActive = bgType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                title={`${opt.label}: ${opt.desc}`}
                onClick={() => setBgType(opt.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer min-h-[52px] justify-center ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500 scale-105 shadow-md'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                }`}
              >
                <span className="text-sm">{opt.icon}</span>
                <span className="text-[8px] font-bold leading-tight truncate w-full text-[var(--color-text-muted)]">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel de Controles Específicos según Fondo */}
        {bgType === 'particles' && (
          <div className="space-y-3 p-2 bg-[var(--color-surface-2)]/25 rounded-xl border border-[var(--color-border)]/50 animate-fade-in text-[10px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Cantidad</label>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={bgParticlesCount}
                  onChange={(e) => setBgParticlesCount(Number(e.target.value))}
                  className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[8px] text-[var(--color-text)] font-mono block text-right">{bgParticlesCount} orbs</span>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Velocidad</label>
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.1"
                  value={bgParticlesSpeed}
                  onChange={(e) => setBgParticlesSpeed(Number(e.target.value))}
                  className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[8px] text-[var(--color-text)] font-mono block text-right">{bgParticlesSpeed}x</span>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Tamaño Máx</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={bgParticlesSize}
                  onChange={(e) => setBgParticlesSize(Number(e.target.value))}
                  className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[8px] text-[var(--color-text)] font-mono block text-right">{bgParticlesSize}px</span>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Opacidad Partícula</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={bgParticlesOpacity}
                  onChange={(e) => setBgParticlesOpacity(Number(e.target.value))}
                  className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[8px] text-[var(--color-text)] font-mono block text-right">{bgParticlesOpacity}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Dirección Flujo</label>
                <CustomSelect
                  options={[
                    { value: 'random', label: 'Aleatorio (Rebote)' },
                    { value: 'up', label: 'Subir (Vertical)' },
                    { value: 'down', label: 'Bajar (Vertical)' },
                    { value: 'left', label: 'Izquierda (Horizontal)' },
                    { value: 'right', label: 'Derecha (Horizontal)' },
                  ]}
                  value={bgParticlesDirection}
                  onChange={(val) => setBgParticlesDirection(val)}
                  direction="up"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Tipo / Forma</label>
                <CustomSelect
                  options={[
                    { value: 'circle', label: 'Círculo Sólido' },
                    { value: 'glow', label: 'Luz Glare (Glow)' },
                    { value: 'star', label: 'Chispas (4 puntas)' },
                    { value: 'niche', label: `Nicho (${niche ? niche.replace(/[_-]/g, ' ') : 'Estilo de Marca'})` },
                  ]}
                  value={bgParticlesShape}
                  onChange={(val) => setBgParticlesShape(val)}
                  direction="up"
                />
              </div>

              {bgParticlesShape === 'niche' && (() => {
                const categories = ['Todos', ...new Set(PARTICLES_LIBRARY_ICONS.map((i) => i.category))];
                const filteredIcons = PARTICLES_LIBRARY_ICONS.filter((icon) => {
                  const matchesCategory = selectedIconCategory === 'Todos' || icon.category === selectedIconCategory;
                  const matchesSearch = icon.name.toLowerCase().includes(iconSearchQuery.toLowerCase()) || 
                                       icon.key.toLowerCase().includes(iconSearchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                });

                return (
                  <div className="col-span-2 space-y-2 bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-xl p-2.5 mt-1 animate-fade-in relative z-30">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-[var(--color-text-muted)] block">Biblioteca de Iconos (100+)</label>
                      <span className="text-[8px] text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10">
                        {bgParticlesIcon === 'default' ? '⚡ Auto' : bgParticlesIcon.replace(/[_-]/g, ' ')}
                      </span>
                    </div>

                    {/* Buscador de Iconos */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar icono... (ej: estrella, café)"
                        value={iconSearchQuery}
                        onChange={(e) => setIconSearchQuery(e.target.value)}
                        className="w-full text-[9px] px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-3)]/60 border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      {iconSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setIconSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filtro horizontal de Categorías */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
                      {categories.map((cat) => {
                        const isCatSelected = selectedIconCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedIconCategory(cat)}
                            className={`text-[8px] px-2 py-0.5 rounded-md border whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                              isCatSelected
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                                : 'bg-[var(--color-surface-3)]/30 border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]/60'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Cuadrícula de Iconos */}
                    <div className="grid grid-cols-6 gap-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                      {/* Botón Auto (solo si no hay filtro de búsqueda activo) */}
                      {!iconSearchQuery && selectedIconCategory === 'Todos' && (
                        <button
                          type="button"
                          onClick={() => setBgParticlesIcon('default')}
                          className={`p-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[38px] ${
                            bgParticlesIcon === 'default'
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                              : 'bg-[var(--color-surface-3)]/40 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)]'
                          }`}
                          title="Icono automático según el nicho de tu cliente"
                        >
                          <span className="text-xs">⚡</span>
                          <span className="scale-75 origin-center leading-none text-[8px] font-bold">Auto</span>
                        </button>
                      )}

                      {/* Lista filtrada de iconos */}
                      {filteredIcons.map((icon) => {
                        const isSelected = bgParticlesIcon === icon.key;
                        return (
                          <button
                            key={icon.key}
                            type="button"
                            onClick={() => setBgParticlesIcon(icon.key)}
                            className={`p-1 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer min-h-[38px] hover:scale-105 ${
                              isSelected
                                ? 'bg-indigo-500/35 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                                : 'bg-[var(--color-surface-3)]/40 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)]'
                            }`}
                            title={`${icon.name} (${icon.category})`}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d={icon.path} />
                            </svg>
                          </button>
                        );
                      })}

                      {filteredIcons.length === 0 && (
                        <div className="col-span-6 py-4 text-center text-[9px] text-[var(--color-text-muted)]">
                          Ningún icono coincide
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Modo Color</label>
                <div className="grid grid-cols-2 gap-1">
                  {['brand', 'mixed'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBgParticlesColor(c)}
                      className={`text-[8px] font-bold py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer min-h-[32px] flex items-center justify-center ${
                        bgParticlesColor === c
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)]'
                      }`}
                    >
                      {c === 'brand' ? 'Marca' : 'Mixto'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {bgType === 'mesh' && (
          <div className="grid grid-cols-2 gap-3 p-2 bg-[var(--color-surface-2)]/25 rounded-xl border border-[var(--color-border)]/50 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Número de Esferas (Orbs)</label>
              <input
                type="range"
                min="2"
                max="6"
                value={bgOrbsCount}
                onChange={(e) => setBgOrbsCount(Number(e.target.value))}
                className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[8px] text-[var(--color-text)] font-mono block text-right">{bgOrbsCount} orbs</span>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-[var(--color-text-muted)] block">Opacidad de Esferas</label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={bgOrbsOpacity}
                onChange={(e) => setBgOrbsOpacity(Number(e.target.value))}
                className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[8px] text-[var(--color-text)] font-mono block text-right">{Math.round(bgOrbsOpacity * 100)}%</span>
            </div>
          </div>
        )}

        {/* Control Spotlight (Cursor Tracking) */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]/35">
          <div className="space-y-0.5">
            <label className="text-[9px] font-bold text-[var(--color-text-muted)] block">Spotlight (Cursor Tracking)</label>
            <span className="text-[8px] text-[var(--color-text-muted)]/70 block">Iluminación radial dinámica al mover el mouse</span>
          </div>
          <button
            type="button"
            onClick={() => setBgMouseTracking(!bgMouseTracking)}
            className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${bgMouseTracking ? 'bg-indigo-500' : 'bg-slate-700'}`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${bgMouseTracking ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* ─── SOMBRAS ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">
          Estilo de Sombra — <code className="text-violet-400 text-[9px]">--shadow-default</code>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {SHADOW_OPTIONS.map((opt) => {
            const isActive = shadowStyle === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                title={`${opt.label}: ${opt.desc}`}
                onClick={() => setShadowStyle(opt.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer min-h-[52px] justify-center ${
                  isActive
                    ? 'bg-violet-600/20 border-violet-500 scale-105'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                }`}
              >
                <div
                  className="w-7 h-5 rounded-md"
                  style={{
                    backgroundColor: primaryColor || '#6366f1',
                    boxShadow: getShadowCss(opt.value, primaryColor),
                    opacity: 0.9,
                  }}
                />
                <span className={`text-[8px] font-bold leading-tight ${isActive ? 'text-violet-300' : 'text-[var(--color-text-muted)]'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── RADIO (CURVAS) ───────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">
          Curvas / Border Radius — <code className="text-violet-400 text-[9px]">--radius-card</code>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {RADIUS_OPTIONS.map((opt) => {
            const isActive = radiusMode === opt.value;
            const r = opt.css === '9999px' ? '9999px' : opt.css;
            return (
              <button
                key={opt.value}
                type="button"
                title={opt.desc}
                onClick={() => setRadiusMode(opt.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer min-h-[52px] justify-center ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500 scale-105'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                }`}
              >
                <div
                  className="w-7 h-5 border-2"
                  style={{
                    borderRadius: r,
                    borderColor: primaryColor || '#6366f1',
                    backgroundColor: `${primaryColor || '#6366f1'}22`,
                  }}
                />
                <span className={`text-[8px] font-bold ${isActive ? 'text-indigo-300' : 'text-[var(--color-text-muted)]'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── EFECTOS DE BORDES PREMIUM ────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-[var(--color-text-muted)] block uppercase">
            Borde Láser XOR
          </label>
          <button
            type="button"
            onClick={() => setBorderBeam(!borderBeam)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
              borderBeam
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            <span>{borderBeam ? '⚡ Haz Láser' : '⬜ Inactivo'}</span>
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-[var(--color-text-muted)] block uppercase">
            Efecto 3D Tilt
          </label>
          <button
            type="button"
            onClick={() => setTilt3d(!tilt3d)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
              tilt3d
                ? 'bg-pink-600/20 border-pink-500 text-pink-300 shadow-sm'
                : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            <span>{tilt3d ? '🎛️ Rotación 3D' : '⬜ Inactivo'}</span>
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-[var(--color-text-muted)] block uppercase">
            Vidrio Esmerilado
          </label>
          <button
            type="button"
            onClick={() => setGlassmorphism(!glassmorphism)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
              glassmorphism
                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            <span>{glassmorphism ? '🪟 Frosted Glass' : '⬜ Inactivo'}</span>
          </button>
        </div>
      </div>

      {/* ─── VELOCIDAD DE ANIMACIONES ────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">
          Velocidad de Transiciones — <code className="text-violet-400 text-[9px]">--motion-duration</code>
        </label>
        <div className="grid grid-cols-4 gap-1">
          {ANIMATION_OPTIONS.map((opt) => {
            const isActive = animationSpeed === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                title={`${opt.label} (${opt.desc})`}
                onClick={() => setAnimationSpeed(opt.value)}
                className={`flex flex-col items-center py-1 rounded-lg border text-center cursor-pointer transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 border-emerald-500'
                    : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                }`}
              >
                <span className="text-[10px]">{opt.icon}</span>
                <span className={`text-[7.5px] font-bold leading-none mt-0.5 ${isActive ? 'text-emerald-300' : 'text-[var(--color-text-muted)]'}`}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>



      {/* ─── LIVE PREVIEW CARD ────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">
          Vista Previa en Tiempo Real
        </label>
        <div
          className="p-3 flex items-center justify-between gap-3 border-beam-container border-beam-effect"
          style={{
            borderRadius: radiusCss,
            background: previewBg,
            backdropFilter: previewBlur,
            WebkitBackdropFilter: previewBlur,
            border: previewBorder,
            boxShadow: activeShadow,
            transition: `all ${animDur} ease`,
            '--border-beam-width': borderBeam ? '1.5px' : '0px',
            '--beam-angle': `${angle}deg`,
          }}
        >
          {/* Fake card content */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 shrink-0 flex items-center justify-center text-white text-[10px] font-black"
              style={{
                borderRadius: btnRadiusMap[radiusMode] || '0.5rem',
                backgroundColor: primaryColor || '#6366f1',
                boxShadow: activeShadow,
              }}
            >
              P
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[var(--color-text)] truncate">
                Producto de Ejemplo
              </div>
              <div className="text-[8px] text-[var(--color-text-muted)] truncate">
                $ 45.000 · Stock 12 und
              </div>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 text-[9px] font-black !text-white px-2.5 py-1.5 cursor-default"
            style={{
              borderRadius: btnRadiusMap[radiusMode] || '0.5rem',
              backgroundColor: primaryColor || '#6366f1',
              boxShadow: activeShadow,
              transition: `all ${animDur} ease`,
            }}
          >
            Agregar
          </button>
        </div>
        <p className="text-[8px] text-[var(--color-text-muted)] text-center">
          Esta tarjeta refleja los tokens exactos que se inyectarán en la app generada
        </p>
      </div>

      {/* ─── SIMULADOR DE VELOCIDAD INTERACTIVO ──────────────── */}
      <div className="space-y-1.5 border-t border-[var(--color-border)]/50 pt-2.5">
        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">
          ⚡ Simulador de Transición en Vivo
        </label>
        <div className="p-2.5 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex flex-col gap-2.5">
          <div className="flex gap-2">
            <button
              type="button"
              onMouseEnter={() => setSimulatorActive(true)}
              onMouseLeave={() => setSimulatorActive(false)}
              onClick={() => setSimulatorActive(!simulatorActive)}
              className="flex-1 py-1.5 rounded-lg bg-[var(--color-surface)] text-[9px] font-bold border border-[var(--color-border)] shadow-sm hover:brightness-105 active:scale-95 transition-all text-center cursor-pointer"
              style={{
                transition: `all ${animDur} cubic-bezier(0.25, 1, 0.5, 1)`,
                borderColor: simulatorActive ? primaryColor : 'var(--color-border)',
                color: simulatorActive ? primaryColor : 'var(--color-text)',
              }}
            >
              Hover / Pulsar aquí
            </button>

            <button
              type="button"
              onClick={() => setSimulatorOpen(!simulatorOpen)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[9px] font-bold hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
              style={{
                backgroundColor: primaryColor,
                transition: `all ${animDur} ease`,
              }}
            >
              {simulatorOpen ? 'Colapsar ▲' : 'Expandir ▼'}
            </button>
          </div>

          <div
            className="overflow-hidden transition-all ease-in-out"
            style={{
              maxHeight: simulatorOpen ? '100px' : '0px',
              opacity: simulatorOpen ? 1 : 0,
              transition: `all ${animDur} cubic-bezier(0.25, 1, 0.5, 1)`,
            }}
          >
            <div className="p-2 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)]/50 rounded-lg space-y-1">
              <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Panel de Diagnóstico</span>
              <p className="text-[8.5px] leading-tight text-[var(--color-text-muted)]">
                Este panel dinámico se expande a la velocidad de la transición seleccionada ({animDur}). Siente cómo responde el diseño elástico.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
