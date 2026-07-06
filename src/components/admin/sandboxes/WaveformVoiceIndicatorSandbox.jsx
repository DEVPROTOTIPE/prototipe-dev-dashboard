import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';

// Componente Local para simulación autónoma en el sandbox
function LocalWaveformVoiceIndicator({
  isPlaying = true,
  amplitude = 'normal',
  color = 'bg-[var(--color-primary)]',
  className = ''
}) {
  const ampClass = amplitude === 'high' ? 'scale-y-[1.6]' : amplitude === 'low' ? 'scale-y-[0.6]' : 'scale-y-[1]';

  return (
    <div className={`flex items-end justify-center gap-1 h-6 py-1 select-none ${className}`}>
      <div 
        className={`w-0.5 rounded-full ${color} animate-barWave ${isPlaying ? 'running' : 'paused'} ${ampClass}`}
        style={{ animationDelay: '0.1s', minHeight: '6px' }}
      />
      <div 
        className={`w-0.5 rounded-full ${color} animate-barWave ${isPlaying ? 'running' : 'paused'} ${ampClass}`}
        style={{ animationDelay: '0.3s', minHeight: '12px' }}
      />
      <div 
        className={`w-0.5 rounded-full ${color} animate-barWave ${isPlaying ? 'running' : 'paused'} ${ampClass}`}
        style={{ animationDelay: '0s', minHeight: '16px' }}
      />
      <div 
        className={`w-0.5 rounded-full ${color} animate-barWave ${isPlaying ? 'running' : 'paused'} ${ampClass}`}
        style={{ animationDelay: '0.4s', minHeight: '10px' }}
      />
      <div 
        className={`w-0.5 rounded-full ${color} animate-barWave ${isPlaying ? 'running' : 'paused'} ${ampClass}`}
        style={{ animationDelay: '0.2s', minHeight: '6px' }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes barWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
        .animate-barWave {
          animation: barWave 1.2s infinite ease-in-out;
          transform-origin: bottom;
        }
        .running { animation-play-state: running; }
        .paused {
          animation-play-state: paused;
          transform: scaleY(0.4) !important;
        }
      `}} />
    </div>
  );
}

export default function WaveformVoiceIndicatorSandbox() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [amplitude, setAmplitude] = useState('normal');
  const [colorOption, setColorOption] = useState('bg-[var(--color-primary)]');

  const controls = [
    {
      type: 'toggle',
      label: 'Reproduciendo (Play)',
      value: isPlaying,
      onChange: setIsPlaying
    },
    {
      type: 'select',
      label: 'Amplitud de Onda',
      value: amplitude,
      options: [
        { value: 'low', label: 'Baja (Amortiguada)' },
        { value: 'normal', label: 'Estándar (Conversación)' },
        { value: 'high', label: 'Alta (Grito/Ruido)' }
      ],
      onChange: setAmplitude
    },
    {
      type: 'select',
      label: 'Color de Onda',
      value: colorOption,
      options: [
        { value: 'bg-[var(--color-primary)]', label: 'Marca (Primary)' },
        { value: 'bg-emerald-500', label: 'Voz Activa (Emerald)' },
        { value: 'bg-indigo-500', label: 'Línea (Indigo)' }
      ],
      onChange: setColorOption
    }
  ];

  return (
    <SandboxLayout title="WaveformVoiceIndicator" controls={controls}>
      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full max-w-sm mx-auto">
        <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] w-full flex flex-col items-center justify-center gap-6 min-h-[160px]">
          <div className="flex items-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] w-full justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-xs">
                👤
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[var(--color-text)]">Nota de voz</span>
                <span className="text-[9px] text-[var(--color-text-muted)]">0:14</span>
              </div>
            </div>
            <LocalWaveformVoiceIndicator 
              isPlaying={isPlaying} 
              amplitude={amplitude} 
              color={colorOption} 
              className="w-24"
            />
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
