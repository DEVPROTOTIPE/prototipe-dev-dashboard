import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import RaffleWheelOfFortune from '../../common/RaffleWheelOfFortune';

export default function RaffleWheelOfFortuneSandbox() {
  const [prizesText, setPrizesText] = useState(
    '10% OFF, Bebida Gratis, Postre Gratis, Café Gratis, Reintenta, Descuento $5k'
  );
  const [duration, setDuration] = useState(5000);
  const [spinsCount, setSpinsCount] = useState(6);
  const [lastWin, setLastWin] = useState(null);

  const controls = [
    {
      type: 'text',
      label: 'Premios (separados por coma)',
      value: prizesText,
      onChange: (val) => setPrizesText(val),
    },
    {
      type: 'number',
      label: 'Duración del giro (ms)',
      value: duration,
      onChange: (val) => setDuration(Number(val)),
    },
    {
      type: 'number',
      label: 'Número de vueltas',
      value: spinsCount,
      onChange: (val) => setSpinsCount(Number(val)),
    },
  ];

  return (
    <SandboxLayout
      title="RaffleWheelOfFortune"
      description="Ruleta de premios SVG con aro dorado metálico, bombillos LED parpadeantes y generación automática de cupones. Parametrizable vía texto CSV de premios."
      controls={controls}
    >
      <div className="flex flex-col items-center gap-4 w-full">
        <RaffleWheelOfFortune
          prizesText={prizesText}
          duration={duration}
          spinsCount={spinsCount}
          onWin={(prize, code) => setLastWin({ prize, code })}
        />
        {lastWin && (
          <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-400">
            🏆 Ganaste: <strong>{lastWin.prize}</strong>
            {lastWin.code && <span className="ml-2 font-mono opacity-70">({lastWin.code})</span>}
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
