import React, { useState, useMemo } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { AlertCircle, ShieldCheck, Heart, User, Settings, Info } from 'lucide-react';

const ALERGENS_REGISTRY = [
  { key: 'lactose', label: 'Intolerancia a la Lactosa' },
  { key: 'gluten', label: 'Celiaquía / Intolerancia al Gluten' },
  { key: 'peanuts', label: 'Alergia al Maní / Frutos Secos' },
  { key: 'sugar', label: 'Diabetes / Restricción de Azúcar' },
  { key: 'seafood', label: 'Alergia a Mariscos / Pescados' }
];

function AdvertenciaNutricionalAlergenos({
  productName = "Galletas de Avena con Maní y Miel",
  seals = ['Alto en Azúcares', 'Contiene Frutos Secos'],
  composition = {
    hasLactose: false,
    hasGluten: true,
    hasPeanuts: true,
    hasSugar: true,
    hasSeafood: false
  },
  onProfileUpdate = () => {}
}) {
  const [userProfile, setUserProfile] = useState({
    lactose: false,
    gluten: true,
    peanuts: false,
    sugar: false,
    seafood: false
  });

  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleToggleAlergen = (key) => {
    const updated = { ...userProfile, [key]: !userProfile[key] };
    setUserProfile(updated);
    onProfileUpdate(updated);
  };

  const alertsDetected = useMemo(() => {
    const alerts = [];
    if (userProfile.lactose && composition.hasLactose) {
      alerts.push({ key: 'lactose', text: 'Este producto contiene lactosa, incompatible con tu perfil.' });
    }
    if (userProfile.gluten && composition.hasGluten) {
      alerts.push({ key: 'gluten', text: 'Contiene gluten. No apto para personas con celiaquía.' });
    }
    if (userProfile.peanuts && composition.hasPeanuts) {
      alerts.push({ key: 'peanuts', text: 'Peligro: Contiene maní o trazas de frutos secos.' });
    }
    if (userProfile.sugar && composition.hasSugar) {
      alerts.push({ key: 'sugar', text: 'Alto contenido de azúcar. No recomendado para dietas restringidas.' });
    }
    if (userProfile.seafood && composition.hasSeafood) {
      alerts.push({ key: 'seafood', text: 'Contiene trazas de mariscos/pescados.' });
    }
    return alerts;
  }, [userProfile, composition]);

  const hasCriticalConflict = alertsDetected.length > 0;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl w-full p-6 text-[var(--color-text)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{productName}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Información Nutricional y Alertas de Salud</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsConfiguring(!isConfiguring)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${isConfiguring ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:bg-[var(--color-border)]/20'}`}
        >
          <Settings className="w-3.5 h-3.5" />
          Configurar Alérgenos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-7 flex flex-col gap-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Sellos Nutricionales
            </span>
            <div className="flex flex-wrap gap-2">
              {seals.length === 0 ? (
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Producto Libre de Sellos Críticos
                </span>
              ) : (
                seals.map(seal => (
                  <span
                    key={seal}
                    className="px-3 py-1 bg-black !text-white text-[10px] font-black tracking-tighter rounded-md uppercase border border-neutral-800 shadow"
                  >
                    {seal}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Trazas e Ingredientes Declarados
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded-lg border ${composition.hasGluten ? 'bg-amber-500/5 border-amber-500/25' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]/50 opacity-60'}`}>
                Gluten: <span className="font-bold">{composition.hasGluten ? 'SÍ' : 'NO'}</span>
              </div>
              <div className={`p-2 rounded-lg border ${composition.hasLactose ? 'bg-amber-500/5 border-amber-500/25' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]/50 opacity-60'}`}>
                Lactosa: <span className="font-bold">{composition.hasLactose ? 'SÍ' : 'NO'}</span>
              </div>
              <div className={`p-2 rounded-lg border ${composition.hasPeanuts ? 'bg-amber-500/5 border-amber-500/25' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]/50 opacity-60'}`}>
                Frutos Secos: <span className="font-bold">{composition.hasPeanuts ? 'SÍ' : 'NO'}</span>
              </div>
              <div className={`p-2 rounded-lg border ${composition.hasSugar ? 'bg-amber-500/5 border-amber-500/25' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]/50 opacity-60'}`}>
                Azúcar Añadida: <span className="font-bold">{composition.hasSugar ? 'SÍ' : 'NO'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col gap-4">
          {isConfiguring ? (
            <div className="p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)]/55 rounded-xl">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Mis Restricciones
              </span>
              <div className="flex flex-col gap-2">
                {ALERGENS_REGISTRY.map(alergen => {
                  const isChecked = userProfile[alergen.key];
                  return (
                    <label
                      key={alergen.key}
                      className="flex items-center justify-between p-2 hover:bg-[var(--color-border)]/10 rounded-lg cursor-pointer transition text-xs"
                    >
                      <span>{alergen.label}</span>
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAlergen(alergen.key)}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between min-h-[150px]">
              {hasCriticalConflict ? (
                <div className="flex-1 flex flex-col gap-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-red-500">
                    Alerta de Compatibilidad
                  </span>
                  <div className="flex flex-col gap-2">
                    {alertsDetected.map((alert, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 text-red-500 rounded-xl text-xs animate-pulse"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-semibold">{alert.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-xl">
                  <ShieldCheck className="w-8 h-8 mb-2" />
                  <p className="font-bold text-xs">Compatible con tu perfil</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">No se detectaron alérgenos cruzados con tus restricciones.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdvertenciaNutricionalAlergenosSandbox() {
  const [product, setProduct] = useState({
    name: "Yogurt con Almendras y Trozos de Banano",
    seals: ["Alto en Azúcares", "Contiene Lactosa"],
    composition: {
      hasLactose: true,
      hasGluten: false,
      hasPeanuts: true,
      hasSugar: true,
      hasSeafood: false
    }
  });

  const handleProductChange = (prodKey) => {
    if (prodKey === 'yogurt') {
      setProduct({
        name: "Yogurt con Almendras y Trozos de Banano",
        seals: ["Alto en Azúcares", "Contiene Lactosa"],
        composition: { hasLactose: true, hasGluten: false, hasPeanuts: true, hasSugar: true, hasSeafood: false }
      });
    } else if (prodKey === 'pan') {
      setProduct({
        name: "Pan Integral Multicereal Orgánico",
        seals: ["Bajo en Grasas"],
        composition: { hasLactose: false, hasGluten: true, hasPeanuts: false, hasSugar: false, hasSeafood: false }
      });
    } else if (prodKey === 'mariscos') {
      setProduct({
        name: "Sopa de Cangrejo e Insumos del Mar",
        seals: ["Alto en Sodio"],
        composition: { hasLactose: false, hasGluten: false, hasPeanuts: false, hasSugar: false, hasSeafood: true }
      });
    }
  };

  return (
    <SandboxLayout
      title="Advertencia Nutricional y Alérgenos"
      description="Simulador de perfiles de restricción alimentaria y validación nutricional en fichas de producto"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
        {/* Panel de Configuración de Prueba */}
        <div className="xl:col-span-4 p-6 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-4">
          <h4 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--color-primary)]" />
            Elegir Producto Demo
          </h4>

          <div className="flex flex-col gap-2">
            {[
              { key: 'yogurt', name: 'Yogurt con Almendras (Lactosa + Maní + Azúcar)' },
              { key: 'pan', name: 'Pan Integral Multicereal (Contiene Gluten)' },
              { key: 'mariscos', name: 'Sopa de Cangrejo (Contiene Mariscos)' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => handleProductChange(p.key)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition ${product.name.includes(p.name.split(' ')[0]) ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-border)]/20'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Componente Ficha */}
        <div className="xl:col-span-8">
          <AdvertenciaNutricionalAlergenos 
            productName={product.name}
            seals={product.seals}
            composition={product.composition}
          />
        </div>
      </div>
    </SandboxLayout>
  );
}
