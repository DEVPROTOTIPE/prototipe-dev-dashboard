import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag, User, Bell, Heart } from 'lucide-react';
import { SandboxLayout } from './SandboxLayout';

// Opciones predefinidas para pruebas en el Sandbox (Nombres planos para compatibilidad con SandboxLayout y CustomSelect)
const PRESETS = {
  '3 Botones (Mínimo)': [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'catalog', label: 'Buscar', icon: Search },
    { id: 'cart', label: 'Bolsa', icon: ShoppingBag },
  ],
  '4 Botones (Recomendado)': [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'catalog', label: 'Catálogo', icon: Search },
    { id: 'cart', label: 'Carrito', icon: ShoppingBag },
    { id: 'profile', label: 'Perfil', icon: User },
  ],
  '5 Botones (Máximo)': [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'catalog', label: 'Buscar', icon: Search },
    { id: 'favs', label: 'Favs', icon: Heart },
    { id: 'alerts', label: 'Alertas', icon: Bell },
    { id: 'profile', label: 'Perfil', icon: User },
  ]
};

// Componente completo copiado de la biblioteca para self-containment
function AnimatedNavbarMobile({ 
  activeTab: externalActiveTab, 
  onChange, 
  items = PRESETS['4 Botones (Recomendado)'],
  demo = false 
}) {
  const [localActiveTab, setLocalActiveTab] = useState('home');
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : localActiveTab;

  const handleTabChange = (itemId) => {
    if (externalActiveTab === undefined) {
      setLocalActiveTab(itemId);
    }
    if (onChange) {
      onChange(itemId);
    }
  };

  return (
    <nav className={`${demo ? 'relative w-full rounded-2xl border' : 'fixed bottom-0 left-0 z-50 w-full pb-safe sm:hidden'} bg-[var(--color-surface)]/85 backdrop-blur-xl border-t border-[var(--color-border)] overflow-hidden`}>
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center w-full h-full min-h-[48px] min-w-[48px] active:scale-95 transition-all duration-200 ease-in-out cursor-pointer ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {/* Burbuja elástica (Framer Motion) */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-bubble-demo"
                  className="absolute inset-0 w-12 h-12 mx-auto mt-1 bg-[var(--color-primary)]/15 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8
                  }}
                />
              )}
              
              <Icon 
                className="w-[22px] h-[22px] z-10" 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className="text-[10px] font-bold z-10 mt-1 truncate max-w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function AnimatedNavbarMobileSandbox() {
  const [presetKey, setPresetKey] = useState('4 Botones (Recomendado)');
  const [activeTab, setActiveTab] = useState('home');
  const [simulatedPage, setSimulatedPage] = useState('Inicio');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const item = PRESETS[presetKey].find(i => i.id === tabId);
    if (item) {
      setSimulatedPage(item.label);
    }
  };

  const handlePresetChange = (newPreset) => {
    setPresetKey(newPreset);
    const firstTab = PRESETS[newPreset][0];
    setActiveTab(firstTab.id);
    setSimulatedPage(firstTab.label);
  };

  return (
    <SandboxLayout
      title="Animated Navbar Mobile"
      description="Barra táctil inferior elástica para PWA optimizada con Framer Motion y adaptabilidad cromática."
      controls={[
        {
          label: 'Cantidad de Botones',
          type: 'select',
          value: presetKey,
          options: [
            '3 Botones (Mínimo)',
            '4 Botones (Recomendado)',
            '5 Botones (Máximo)'
          ],
          onChange: handlePresetChange
        }
      ]}
    >
      <div className="w-full space-y-6 text-left">
        {/* Simulación de Frame de Smartphone */}
        <div className="mx-auto max-w-[340px] h-[480px] bg-[var(--color-surface-2)] rounded-[2.5rem] border border-[var(--color-border)] shadow-2xl overflow-hidden relative flex flex-col justify-between">
          {/* Barra superior de estado ficticia */}
          <div className="px-6 pt-3 pb-1 flex justify-between items-center text-[10px] font-bold text-[var(--color-text-muted)] select-none">
            <span>8:42 p. m.</span>
            <div className="flex gap-1.5 items-center">
              <span>5G</span>
              <div className="w-5 h-2.5 rounded-sm border border-[var(--color-text-muted)] p-0.5 flex items-center">
                <div className="w-full h-full bg-[var(--color-text-muted)] rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Contenido simulado del viewport móvil */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              key={simulatedPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h3 className="text-lg font-black text-[var(--color-text)]">Pantalla: {simulatedPage}</h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-[200px] mx-auto">
                El scroll del usuario se desplaza detrás de la barra de navegación translúcida.
              </p>
            </motion.div>
          </div>

          {/* Componente bajo test (inline) */}
          <AnimatedNavbarMobile
            items={PRESETS[presetKey]}
            activeTab={activeTab}
            onChange={handleTabChange}
            demo={true}
          />
        </div>

        {/* Indicadores técnicos de depuración */}
        <div className="flex justify-between items-center bg-[var(--color-surface-2)]/65 border border-[var(--color-border)] rounded-xl p-4 text-[10px] gap-2 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[var(--color-text-muted)]">Prop activeTab:</span>
            <span className="font-mono font-bold text-[var(--color-primary)]">"{activeTab}"</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[var(--color-text-muted)]">LayoutId Bubble:</span>
            <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">active-nav-bubble-demo</span>
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
}
