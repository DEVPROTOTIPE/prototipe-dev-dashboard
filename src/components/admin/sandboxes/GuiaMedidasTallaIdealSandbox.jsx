import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente real inline para el Sandbox
function GuiaMedidasTallaIdeal({
  tablaMedidas,
  onTallaSugerida
}) {
  const [unit, setUnit] = useState('cm'); // 'cm' o 'in'
  
  // Estados de medidas en Centímetros internos por defecto
  const [busto, setBusto] = useState(88); // 88 cm
  const [cintura, setCintura] = useState(70); // 70 cm
  const [cadera, setCadera] = useState(96); // 96 cm

  // Conversores de unidades
  const toDisplay = (val) => {
    if (unit === 'in') {
      return (val / 2.54).toFixed(1);
    }
    return Math.round(val);
  };

  const handleSliderChange = (type, val) => {
    const numericVal = parseFloat(val);
    const cmVal = unit === 'in' ? numericVal * 2.54 : numericVal;
    
    if (type === 'busto') setBusto(cmVal);
    if (type === 'cintura') setCintura(cmVal);
    if (type === 'cadera') setCadera(cmVal);
  };

  // Límites según unidad para sliders
  const limits = React.useMemo(() => {
    return unit === 'cm'
      ? { busto: { min: 70, max: 130 }, cintura: { min: 50, max: 110 }, cadera: { min: 80, max: 140 } }
      : { busto: { min: 27.5, max: 51.2 }, cintura: { min: 19.6, max: 43.3 }, cadera: { min: 31.5, max: 55.1 } };
  }, [unit]);

  // Algoritmo de Talla Recomendada
  const recomendacion = React.useMemo(() => {
    let mejorTalla = 'XS';
    let menorDiferencia = Infinity;
    let coincidenciaPorcentaje = 0;

    tablaMedidas.forEach((item) => {
      const cBusto = (item.busto[0] + item.busto[1]) / 2;
      const cCintura = (item.cintura[0] + item.cintura[1]) / 2;
      const cCadera = (item.cadera[0] + item.cadera[1]) / 2;

      const diffB = Math.pow(busto - cBusto, 2) * 1.2;
      const diffCi = Math.pow(cintura - cCintura, 2) * 0.8;
      const diffCa = Math.pow(cadera - cCadera, 2) * 1.0;
      
      const totalDiff = Math.sqrt(diffB + diffCi + diffCa);

      if (totalDiff < menorDiferencia) {
        menorDiferencia = totalDiff;
        mejorTalla = item.talla;
        
        const maxMedida = Math.max(busto, cintura, cadera);
        const errRatio = totalDiff / maxMedida;
        coincidenciaPorcentaje = Math.max(0, Math.min(100, Math.round((1 - errRatio) * 100)));
      }
    });

    if (onTallaSugerida) {
      onTallaSugerida(mejorTalla);
    }

    const tallaMatch = tablaMedidas.find((item) => item.talla === mejorTalla) || tablaMedidas[0];

    return {
      talla: mejorTalla,
      match: tallaMatch,
      score: coincidenciaPorcentaje
    };
  }, [busto, cintura, cadera, tablaMedidas, onTallaSugerida]);

  const getRangePercentage = (val, range) => {
    const [min, max] = range;
    if (val < min) return 0;
    if (val > max) return 100;
    return ((val - min) / (max - min)) * 100;
  };

  return (
    <div 
      id="guia-medidas-talla-ideal-container"
      className="w-full max-w-sm p-5 rounded-2xl bg-[var(--color-surface)]/20 border border-[var(--color-border)] text-[var(--color-text)] shadow-xl backdrop-blur-xl animate-fade-in"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xs font-bold tracking-tight text-[var(--color-text)] uppercase">Guía de Talla Ideal</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Ingresa tus medidas corporales</p>
        </div>
        
        {/* Selector de Unidades */}
        <div className="flex items-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-0.5" id="unit-selector">
          <button
            type="button"
            onClick={() => setUnit('cm')}
            className={`px-3 py-0.5 text-[10px] font-semibold rounded-md transition-all duration-300 cursor-pointer ${
              unit === 'cm'
                ? 'bg-indigo-600 !text-white shadow-sm shadow-indigo-600/10'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            cm
          </button>
          <button
            type="button"
            onClick={() => setUnit('in')}
            className={`px-3 py-0.5 text-[10px] font-semibold rounded-md transition-all duration-300 cursor-pointer ${
              unit === 'in'
                ? 'bg-indigo-600 !text-white shadow-sm shadow-indigo-600/10'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            in
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input Busto */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-[var(--color-text)]">Pecho / Busto</span>
            <span className="font-black text-indigo-500 dark:text-indigo-400">
              {toDisplay(busto)} {unit}
            </span>
          </div>
          <input
            id="input-slider-busto"
            type="range"
            min={limits.busto.min}
            max={limits.busto.max}
            step="0.1"
            value={unit === 'in' ? (busto / 2.54).toFixed(1) : Math.round(busto)}
            onChange={(e) => handleSliderChange('busto', e.target.value)}
            className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>

        {/* Input Cintura */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-[var(--color-text)]">Cintura</span>
            <span className="font-black text-indigo-500 dark:text-indigo-400">
              {toDisplay(cintura)} {unit}
            </span>
          </div>
          <input
            id="input-slider-cintura"
            type="range"
            min={limits.cintura.min}
            max={limits.cintura.max}
            step="0.1"
            value={unit === 'in' ? (cintura / 2.54).toFixed(1) : Math.round(cintura)}
            onChange={(e) => handleSliderChange('cintura', e.target.value)}
            className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>

        {/* Input Cadera */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-[var(--color-text)]">Cadera</span>
            <span className="font-black text-indigo-500 dark:text-indigo-400">
              {toDisplay(cadera)} {unit}
            </span>
          </div>
          <input
            id="input-slider-cadera"
            type="range"
            min={limits.cadera.min}
            max={limits.cadera.max}
            step="0.1"
            value={unit === 'in' ? (cadera / 2.54).toFixed(1) : Math.round(cadera)}
            onChange={(e) => handleSliderChange('cadera', e.target.value)}
            className="w-full h-1 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bloque de Recomendación de Talla */}
      <div 
        id="resultado-talla-sugerida"
        className="mt-5 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-550/5 to-transparent border border-indigo-500/20 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Talla Recomendada</span>
        <div className="text-3xl font-black text-indigo-650 dark:text-indigo-400 my-1 tracking-tighter drop-shadow-md select-none">
          {recomendacion.talla}
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          Ajuste estimado del {recomendacion.score}%
        </span>
      </div>

      {/* Indicadores Visuales de Ajuste de Rango */}
      <div className="mt-4 space-y-3 bg-[var(--color-surface-2)]/30 p-3.5 rounded-xl border border-[var(--color-border)]">
        <h4 className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Ajuste en Talla {recomendacion.talla}</h4>
        
        {/* Ajuste Busto */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-text-muted)]">Pecho</span>
            <span className="text-[var(--color-text)] font-bold">
              {toDisplay(recomendacion.match.busto[0])} - {toDisplay(recomendacion.match.busto[1])} {unit}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]/40 flex relative">
            <div 
              className="h-full bg-indigo-500/20 absolute"
              style={{ left: '20%', width: '60%' }}
            />
            <div 
              className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[var(--color-bg)] absolute -top-0.5 -translate-x-1/2 transition-all duration-300"
              style={{ left: `${getRangePercentage(busto, recomendacion.match.busto)}%` }}
            />
          </div>
        </div>

        {/* Ajuste Cintura */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-text-muted)]">Cintura</span>
            <span className="text-[var(--color-text)] font-bold">
              {toDisplay(recomendacion.match.cintura[0])} - {toDisplay(recomendacion.match.cintura[1])} {unit}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]/40 flex relative">
            <div 
              className="h-full bg-indigo-500/20 absolute"
              style={{ left: '20%', width: '60%' }}
            />
            <div 
              className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[var(--color-bg)] absolute -top-0.5 -translate-x-1/2 transition-all duration-300"
              style={{ left: `${getRangePercentage(cintura, recomendacion.match.cintura)}%` }}
            />
          </div>
        </div>

        {/* Ajuste Cadera */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-[var(--color-text-muted)]">Cadera</span>
            <span className="text-[var(--color-text)] font-bold">
              {toDisplay(recomendacion.match.cadera[0])} - {toDisplay(recomendacion.match.cadera[1])} {unit}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]/40 flex relative">
            <div 
              className="h-full bg-indigo-500/20 absolute"
              style={{ left: '20%', width: '60%' }}
            />
            <div 
              className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[var(--color-bg)] absolute -top-0.5 -translate-x-1/2 transition-all duration-300"
              style={{ left: `${getRangePercentage(cadera, recomendacion.match.cadera)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const TABLA_MEDIDAS_DEFAULT = [
  { talla: 'XS', busto: [78, 83], cintura: [60, 65], cadera: [86, 91] },
  { talla: 'S',  busto: [84, 89], cintura: [66, 71], cadera: [92, 97] },
  { talla: 'M',  busto: [90, 95], cintura: [72, 77], cadera: [98, 103] },
  { talla: 'L',  busto: [96, 101], cintura: [78, 83], cadera: [104, 109] },
  { talla: 'XL', busto: [102, 107], cintura: [84, 89], cadera: [110, 115] },
  { talla: 'XXL', busto: [108, 113], cintura: [90, 95], cadera: [116, 121] }
];

export default function GuiaMedidasTallaIdealSandbox() {
  const [lastSuggested, setLastSuggested] = useState('M');
  const [customTable, setCustomTable] = useState(false);

  const testTable = customTable 
    ? TABLA_MEDIDAS_DEFAULT.map(item => ({ ...item, busto: [item.busto[0] - 2, item.busto[1] - 2] }))
    : TABLA_MEDIDAS_DEFAULT;

  const controls = [
    {
      label: 'Ajustar Medidas (-2cm Pecho)',
      type: 'toggle',
      value: customTable,
      onChange: setCustomTable
    }
  ];

  return (
    <SandboxLayout
      title="Guía de Medidas y Talla Ideal"
      description="Simulador del asistente inteligente de cálculo de tallas por error euclidiano ponderado y visualizador de rangos HSL."
      controls={controls}
    >
      <div className="flex flex-col items-center justify-center p-2 w-80">
        <GuiaMedidasTallaIdeal
          tablaMedidas={testTable}
          onTallaSugerida={setLastSuggested}
        />
        <div className="mt-3 text-[11px] text-[var(--color-text-muted)] font-bold text-center">
          Talla sugerida actual: <span className="text-[var(--color-text)] font-black">{lastSuggested}</span>
        </div>
      </div>
    </SandboxLayout>
  );
}
