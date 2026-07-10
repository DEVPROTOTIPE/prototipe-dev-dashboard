import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import CatalogBanner from '../../ui/CatalogBanner';

// Datos de prueba para el carrusel
const MOCK_ADS = [
  {
    id: 'ad-1',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    type: 'custom',
    title: '¡Descuento de Temporada!',
    description: 'Aprovecha un 20% de descuento en toda la colección de verano usando el código VERANO26.',
    category: 'Descuento',
    ctaText: 'Ver Colección',
    ctaAction: 'redirect',
    ctaValue: '/summer-collection',
    banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    glowEffect: true
  },
  {
    id: 'ad-2',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    type: 'inventory',
    productId: 'prod-100',
    customTitle: 'Smart Watch Premium Pro',
    customBanner: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80',
    discountType: 'percentage',
    discountValue: 15,
    glowEffect: false
  },
  {
    id: 'ad-3',
    active: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    type: 'custom',
    title: 'Nueva Colección Minimalista',
    description: 'Líneas limpias, materiales sostenibles y estilo atemporal para tu día a día.',
    category: 'Nuevo',
    ctaText: 'Explorar Tendencias',
    ctaAction: 'modal',
    ctaValue: 'modal_minimalist',
    colors: {
      bg: 'linear-gradient(135deg, #1e293b, #0f172a)',
      text: '#f8fafc'
    },
    glowEffect: true
  }
];

// Productos vinculados ficticios
const MOCK_PRODUCTS = [
  {
    id: 'prod-100',
    nombre: 'Smart Watch Premium Pro',
    descripcion: 'Monitoreo de salud avanzado, batería de 7 días y pantalla AMOLED siempre activa.',
    imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80',
    precio: 189000
  }
];

export default function CatalogBannerSandbox() {
  const [mode, setMode] = useState('carousel'); // carousel, static-gradient, static-image, empty
  const [autoRotateMs, setAutoRotateMs] = useState(5000);
  const [lastAction, setLastAction] = useState(null);

  const handleAction = (event) => {
    setLastAction(event);
  };

  const getPropsByMode = () => {
    switch (mode) {
      case 'carousel':
        return {
          ads: MOCK_ADS,
          products: MOCK_PRODUCTS,
          bannerConfig: { type: 'none' }
        };
      case 'static-gradient':
        return {
          ads: [],
          products: [],
          bannerConfig: { type: 'gradient' }
        };
      case 'static-image':
        return {
          ads: [],
          products: [],
          bannerConfig: {
            type: 'image',
            value: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
          }
        };
      case 'empty':
      default:
        return {
          ads: [],
          products: [],
          bannerConfig: { type: 'none' }
        };
    }
  };

  const controls = [
    {
      type: 'select',
      label: 'Modo del Banner',
      value: mode,
      options: [
        { value: 'carousel', label: 'Carrusel de Anuncios' },
        { value: 'static-gradient', label: 'Banner Estático (Gradiente)' },
        { value: 'static-image', label: 'Banner Estático (Imagen)' },
        { value: 'empty', label: 'Sin Banner (Oculto)' }
      ],
      onChange: (val) => setMode(val)
    },
    {
      type: 'number',
      label: 'Intervalo de Rotación (ms)',
      value: autoRotateMs,
      onChange: (val) => setAutoRotateMs(Number(val) || 6000)
    }
  ];

  const currentProps = getPropsByMode();

  return (
    <SandboxLayout
      title="CatalogBanner"
      description="Hero banner y carrusel interactivo optimizado para cabeceras de catálogos. Soporta anuncios de inventario o custom y fallbacks estáticos de marca."
      controls={controls}
    >
      <div className="w-full space-y-6">
        <div className="w-full border border-[var(--color-border)] rounded-3xl p-2 bg-[var(--color-bg)] overflow-hidden">
          <CatalogBanner
            {...currentProps}
            autoRotateMs={autoRotateMs}
            onAction={handleAction}
          />
          {mode === 'empty' && (
            <div className="py-12 text-center text-xs text-[var(--color-text-muted)] italic">
              El banner retornó null y está completamente oculto según la configuración.
            </div>
          )}
        </div>

        {lastAction && (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
              Última Acción Capturada (onAction)
            </div>
            <div className="text-xs font-mono bg-black/30 p-3 rounded-lg overflow-x-auto text-[var(--color-text)]">
              {JSON.stringify(lastAction, null, 2)}
            </div>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
