import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import InteractiveFortuneWheel from '../../common/InteractiveFortuneWheel';

// Premios predeterminados para demostración
const DEMO_PRIZES_6 = [
  { id: 1, label: "10% DCTO" },
  { id: 2, label: "Envío Gratis" },
  { id: 3, label: "Premio Sorpresa" },
  { id: 4, label: "Sigue Intentando" },
  { id: 5, label: "5% DCTO" },
  { id: 6, label: "2x1 Hoy" }
];

const DEMO_PRIZES_4 = [
  { id: 1, label: "20% DCTO" },
  { id: 2, label: "Sigue Intentando" },
  { id: 3, label: "Envío Gratis" },
  { id: 4, label: "Cupón $5K" }
];

const DEMO_PRIZES_8 = [
  { id: 1, label: "10% DCTO" },
  { id: 2, label: "Envío Gratis" },
  { id: 3, label: "5% DCTO" },
  { id: 4, label: "Sigue Intentando" },
  { id: 5, label: "2x1 Hoy" },
  { id: 6, label: "Premio Sorpresa" },
  { id: 7, label: "Cupón $3K" },
  { id: 8, label: "Sigue Intentando" }
];

const PRIZE_SETS = {
  '4': DEMO_PRIZES_4,
  '6': DEMO_PRIZES_6,
  '8': DEMO_PRIZES_8,
};

export default function InteractiveFortuneWheelSandbox() {
  const [prizeCount, setPrizeCount] = useState('6');
  const [lastPrize, setLastPrize] = useState(null);

  const controls = [
    {
      type: 'select',
      label: 'Número de Porciones',
      value: prizeCount,
      options: [
        { value: '4', label: '4 Porciones' },
        { value: '6', label: '6 Porciones (Defecto)' },
        { value: '8', label: '8 Porciones' },
      ],
      onChange: (val) => setPrizeCount(val),
    },
  ];

  return (
    <SandboxLayout
      title="InteractiveFortuneWheel"
      description="Ruleta de premios con conic-gradient matemático, física de inercia real y confeti. Parametrizable para cualquier número de porciones."
      controls={controls}
    >
      <div className="flex flex-col items-center gap-4 w-full">
        <InteractiveFortuneWheel
          prizes={PRIZE_SETS[prizeCount]}
          onPrizeWon={(prize) => setLastPrize(prize)}
        />
        {lastPrize && (
          <div className="px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-xs font-semibold text-[var(--color-primary)]">
            ✅ Último premio: <span className="font-bold">{lastPrize.label}</span>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
