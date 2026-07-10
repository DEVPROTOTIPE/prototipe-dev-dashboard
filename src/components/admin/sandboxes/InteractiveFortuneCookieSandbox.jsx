import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import InteractiveFortuneCookie from '../../common/InteractiveFortuneCookie';

export default function InteractiveFortuneCookieSandbox() {
  const [fortuneText, setFortuneText] = useState('La organización hoy, será tu mayor ganancia de mañana.');
  const [author, setAuthor] = useState('PROTOTIPE Ecosistema');
  const [key, setKey] = useState(0); // Para forzar el remonte y reset del componente desde fuera

  const handleRandomize = () => {
    const fortunes = [
      { text: "¡Felicidades! Ganaste un 15% de descuento. Código: COOKIE15", auth: "CUPÓN COMERCIAL" },
      { text: "El éxito no es el final, el fracaso no es la ruina: el valor para continuar es lo que cuenta.", auth: "Winston Churchill" },
      { text: "¡Boom! Envío gratis para tu próximo pedido. Código: SHIPFREE", auth: "CUPÓN COMERCIAL" },
      { text: "Tu esfuerzo de hoy pavimentará la autopista de tus logros de mañana.", auth: "Pensamiento Core" },
      { text: "2x1 en toda la tienda usando el cupón: DOUBLEFORTUNE", auth: "CUPÓN COMERCIAL" }
    ];
    const random = fortunes[Math.floor(Math.random() * fortunes.length)];
    setFortuneText(random.text);
    setAuthor(random.auth);
    setKey(prev => prev + 1); // Resetear el estado visual de la galleta
  };

  return (
    <SandboxLayout
      title="Galleta de la Fortuna Interactiva (InteractiveFortuneCookie)"
      description="Micro-interacción interactiva gamificada que permite entregar códigos de descuento u oráculos motivacionales de forma lúdica."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Controles de Configuración */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-[var(--color-text)] mb-4 text-sm uppercase tracking-wider">
              Controles de la Fortuna
            </h4>
            
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                  Texto del Mensaje / Código
                </label>
                <textarea
                  value={fortuneText}
                  onChange={(e) => setFortuneText(e.target.value)}
                  placeholder="Escribe la fortuna o cupón..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                  Autor / Subtítulo
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ej. Confucio o Cupón Especial"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setKey(prev => prev + 1)}
              className="flex-1 py-2 text-xs font-semibold text-[var(--color-text)] bg-[var(--color-surface-3)] rounded-lg active:scale-95 transition-all border border-[var(--color-border)]"
            >
              Cerrar Galleta
            </button>
            <button
              onClick={handleRandomize}
              className="flex-1 py-2 text-xs font-semibold text-white bg-[var(--color-primary)] rounded-lg active:scale-95 transition-all"
            >
              Cargar Aleatorio
            </button>
          </div>
        </div>

        {/* Zona de Visualización */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] relative overflow-visible min-h-[300px]">
          <div>
            <h4 className="font-bold text-[var(--color-text)] mb-1 text-sm uppercase tracking-wider">
              Área de Interacción
            </h4>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Haz clic sobre la galleta levitante para quebrarla y revelar la fortuna.
            </p>
          </div>

          {/* Instancia Reactiva con key de remonte */}
          <div className="flex-1 flex items-center justify-center overflow-visible">
            <InteractiveFortuneCookie key={key} fortuneText={fortuneText} author={author} />
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
