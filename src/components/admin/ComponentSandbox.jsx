import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAlertConfirm } from '../common/AlertConfirmContext';
import {
  Sliders, ToggleLeft, ToggleRight, Package, ShoppingBag, Receipt, Search, Info
} from 'lucide-react';

// ─── Importaciones Dinámicas (Playgrounds Modularizados) ────────────────────
const AuthGuardUserProfileSandbox = React.lazy(() => import('./sandboxes/AuthGuardUserProfileSandbox'));
const GlobalSkeletonLoaderSandbox = React.lazy(() => import('./sandboxes/GlobalSkeletonLoaderSandbox'));
const BreadcrumbHeaderSandbox = React.lazy(() => import('./sandboxes/BreadcrumbHeaderSandbox'));
const ErrorBoundaryFallbackSandbox = React.lazy(() => import('./sandboxes/ErrorBoundaryFallbackSandbox'));
const DarkModeToggleSandbox = React.lazy(() => import('./sandboxes/DarkModeToggleSandbox'));
const GuidedToastSandbox = React.lazy(() => import('./sandboxes/GuidedToastSandbox'));
const BotonPremiumSandbox = React.lazy(() => import('./sandboxes/BotonPremiumSandbox'));
const ModalConfirmacionSandbox = React.lazy(() => import('./sandboxes/ModalConfirmacionSandbox'));
const SelectorAtributosSandbox = React.lazy(() => import('./sandboxes/SelectorAtributosSandbox'));
const GestorCategoriasSandbox = React.lazy(() => import('./sandboxes/GestorCategoriasSandbox'));
const InputPremiumSandbox = React.lazy(() => import('./sandboxes/InputPremiumSandbox'));
const ContadorCantidadSandbox = React.lazy(() => import('./sandboxes/ContadorCantidadSandbox'));
const StepperPedidosSandbox = React.lazy(() => import('./sandboxes/StepperPedidosSandbox'));
const PaginacionSandbox = React.lazy(() => import('./sandboxes/PaginacionSandbox'));
const TarjetaProductoSandbox = React.lazy(() => import('./sandboxes/TarjetaProductoSandbox'));
const TarjetaPedidoAdminSandbox = React.lazy(() => import('./sandboxes/TarjetaPedidoAdminSandbox'));
const CarruselAnunciosSandbox = React.lazy(() => import('./sandboxes/CarruselAnunciosSandbox'));
const SwipeableBottomSheetSandbox = React.lazy(() => import('./sandboxes/SwipeableBottomSheetSandbox'));
const OtpInputFieldSandbox = React.lazy(() => import('./sandboxes/OtpInputFieldSandbox'));
const CommandPaletteKBarSandbox = React.lazy(() => import('./sandboxes/CommandPaletteKBarSandbox'));
const InteractiveCouponBadgeSandbox = React.lazy(() => import('./sandboxes/InteractiveCouponBadgeSandbox'));
const InteractiveTutorialTourSandbox = React.lazy(() => import('./sandboxes/InteractiveTutorialTourSandbox'));
const UseDebounceValueSandbox = React.lazy(() => import('./sandboxes/UseDebounceValueSandbox'));
const StockHeatmapSandbox = React.lazy(() => import('./sandboxes/StockHeatmapSandbox'));
const BentoGridSandbox = React.lazy(() => import('./sandboxes/BentoGridSandbox'));
const UseLocalStorageStateSandbox = React.lazy(() => import('./sandboxes/UseLocalStorageStateSandbox'));
const FacturacionComisionalSandbox = React.lazy(() => import('./sandboxes/FacturacionComisionalSandbox'));
const TelemetriaCentralizadaSandbox = React.lazy(() => import('./sandboxes/TelemetriaCentralizadaSandbox'));
const CalendarioPremiumSandbox = React.lazy(() => import('./sandboxes/CalendarioPremiumSandbox'));
const InfiniteLogoMarqueeSandbox = React.lazy(() => import('./sandboxes/InfiniteLogoMarqueeSandbox'));
const MagneticButtonSandbox = React.lazy(() => import('./sandboxes/MagneticButtonSandbox'));
const SwipeableCardStackSandbox = React.lazy(() => import('./sandboxes/SwipeableCardStackSandbox'));
const InteractiveAmbientGlowSandbox = React.lazy(() => import('./sandboxes/InteractiveAmbientGlowSandbox'));
const SelectorBoletasRifasSandbox = React.lazy(() => import('./sandboxes/SelectorBoletasRifasSandbox'));
const RadialInteractiveMenuSandbox = React.lazy(() => import('./sandboxes/RadialInteractiveMenuSandbox'));
const HolographicTiltCardSandbox = React.lazy(() => import('./sandboxes/HolographicTiltCardSandbox'));
const EmptyStateSandbox = React.lazy(() => import('./sandboxes/EmptyStateSandbox'));
const RuletaSuerteSandbox = React.lazy(() => import('./sandboxes/RuletaSuerteSandbox'));
const ReservasAgendaSandbox = React.lazy(() => import('./sandboxes/ReservasAgendaSandbox'));
const SistemaNotificacionesSandbox = React.lazy(() => import('./sandboxes/SistemaNotificacionesSandbox'));
const CajaDiariaPOSSandbox = React.lazy(() => import('./sandboxes/CajaDiariaPOSSandbox'));
const CurrencyInputSandbox = React.lazy(() => import('./sandboxes/CurrencyInputSandbox'));
const ModalTemplateSandbox = React.lazy(() => import('./sandboxes/ModalTemplateSandbox'));
const DatePickerSandbox = React.lazy(() => import('./sandboxes/DatePickerSandbox'));
const ConnectivityToastSandbox = React.lazy(() => import('./sandboxes/ConnectivityToastSandbox'));
const QuantitySelectorSandbox = React.lazy(() => import('./sandboxes/QuantitySelectorSandbox'));
const CustomCursorSandbox = React.lazy(() => import('./sandboxes/CustomCursorSandbox'));
const PantallaCocinaKDSSandbox = React.lazy(() => import('./sandboxes/PantallaCocinaKDSSandbox'));
const ReservasAgendaCitasSandbox = React.lazy(() => import('./sandboxes/ReservasAgendaCitasSandbox'));
const POSExpressScannerSandbox = React.lazy(() => import('./sandboxes/POSExpressScannerSandbox'));
const OrdenesTrabajoEquiposSandbox = React.lazy(() => import('./sandboxes/OrdenesTrabajoEquiposSandbox'));
const CreditosSaldosSandbox = React.lazy(() => import('./sandboxes/CreditosSaldosSandbox'));
const OmnicanalidadWhatsAppSandbox = React.lazy(() => import('./sandboxes/OmnicanalidadWhatsAppSandbox'));

const LoaderSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-3">
    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Cargando playground...</p>
  </div>
);

// ─── Map de Playgrounds Asíncronos ──────────────────────────────────────────
const SANDBOXES = {
  'auth_guard_userprofile': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <AuthGuardUserProfileSandbox />
    </React.Suspense>
  ),
  'global_skeleton_loader': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <GlobalSkeletonLoaderSandbox />
    </React.Suspense>
  ),
  'breadcrumb_header': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <BreadcrumbHeaderSandbox />
    </React.Suspense>
  ),
  'error_boundary_fallback': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <ErrorBoundaryFallbackSandbox />
    </React.Suspense>
  ),
  'dark_mode_toggle': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <DarkModeToggleSandbox />
    </React.Suspense>
  ),
  'guided_toast': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <GuidedToastSandbox />
    </React.Suspense>
  ),
  'boton_premium': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <BotonPremiumSandbox />
    </React.Suspense>
  ),
  'modal_confirmacion': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <ModalConfirmacionSandbox />
    </React.Suspense>
  ),
  'selector_atributos': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <SelectorAtributosSandbox />
    </React.Suspense>
  ),
  'caja_diaria_pos': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <CajaDiariaPOSSandbox />
    </React.Suspense>
  ),
  'gestor_categorias': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <GestorCategoriasSandbox />
    </React.Suspense>
  ),
  'input_premium': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <InputPremiumSandbox />
    </React.Suspense>
  ),
  'contador_cantidad': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <ContadorCantidadSandbox />
    </React.Suspense>
  ),
  'stepper_pedidos': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <StepperPedidosSandbox />
    </React.Suspense>
  ),
  'paginacion': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <PaginacionSandbox />
    </React.Suspense>
  ),
  'tarjeta_producto': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <TarjetaProductoSandbox />
    </React.Suspense>
  ),
  'tarjeta_pedido_admin': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <TarjetaPedidoAdminSandbox />
    </React.Suspense>
  ),
  'carrusel_anuncios': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <CarruselAnunciosSandbox />
    </React.Suspense>
  ),
  'swipeable_bottom_sheet': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <SwipeableBottomSheetSandbox />
    </React.Suspense>
  ),
  'otp_input_field': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <OtpInputFieldSandbox />
    </React.Suspense>
  ),
  'command_palette_kbar': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <CommandPaletteKBarSandbox />
    </React.Suspense>
  ),
  'interactive_coupon_badge': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <InteractiveCouponBadgeSandbox />
    </React.Suspense>
  ),
  'interactive_tutorial_tour': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <InteractiveTutorialTourSandbox />
    </React.Suspense>
  ),
  'use_debounce_value': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <UseDebounceValueSandbox />
    </React.Suspense>
  ),
  'stock_heatmap': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <StockHeatmapSandbox />
    </React.Suspense>
  ),
  'bento_grid': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <BentoGridSandbox />
    </React.Suspense>
  ),
  'use_local_storage_state': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <UseLocalStorageStateSandbox />
    </React.Suspense>
  ),
  'facturacion_comisional': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <FacturacionComisionalSandbox />
    </React.Suspense>
  ),
  'telemetria_centralizada': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <TelemetriaCentralizadaSandbox />
    </React.Suspense>
  ),
  'calendario_premium': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <CalendarioPremiumSandbox />
    </React.Suspense>
  ),
  'infinite_logo_marquee': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <InfiniteLogoMarqueeSandbox />
    </React.Suspense>
  ),
  'magnetic_button': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <MagneticButtonSandbox />
    </React.Suspense>
  ),
  'swipeable_card_stack': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <SwipeableCardStackSandbox />
    </React.Suspense>
  ),
  'interactive_ambient_glow': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <InteractiveAmbientGlowSandbox />
    </React.Suspense>
  ),
  'selector_boletas_rifas': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <SelectorBoletasRifasSandbox />
    </React.Suspense>
  ),
  'radial_interactive_menu': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <RadialInteractiveMenuSandbox />
    </React.Suspense>
  ),
  'holographic_tilt_card': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <HolographicTiltCardSandbox />
    </React.Suspense>
  ),
  'empty_state': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <EmptyStateSandbox />
    </React.Suspense>
  ),
  'ruleta_suerte': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <RuletaSuerteSandbox />
    </React.Suspense>
  ),
  'reservas_agenda': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <ReservasAgendaSandbox />
    </React.Suspense>
  ),
  'sistema_notificaciones': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <SistemaNotificacionesSandbox />
    </React.Suspense>
  ),
  'currency_input': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <CurrencyInputSandbox />
    </React.Suspense>
  ),
  'modal_template': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <ModalTemplateSandbox />
    </React.Suspense>
  ),
  'date_picker': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <DatePickerSandbox />
    </React.Suspense>
  ),
  'connectivity_toast': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <ConnectivityToastSandbox />
    </React.Suspense>
  ),
  'quantity_selector': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <QuantitySelectorSandbox />
    </React.Suspense>
  ),
  'custom_cursor': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <CustomCursorSandbox />
    </React.Suspense>
  ),
  'pantalla_cocina_kds': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <PantallaCocinaKDSSandbox />
    </React.Suspense>
  ),
  'reservas_agenda_citas': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <ReservasAgendaCitasSandbox />
    </React.Suspense>
  ),
  'pos_express_scanner': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <POSExpressScannerSandbox />
    </React.Suspense>
  ),
  'ordenes_trabajo_equipos': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <OrdenesTrabajoEquiposSandbox />
    </React.Suspense>
  ),
  'creditos_y_saldos': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <CreditosSaldosSandbox />
    </React.Suspense>
  ),
  'omnicanalidad_whatsapp': () => (
    <React.Suspense fallback={<LoaderSpinner />}>
      <OmnicanalidadWhatsAppSandbox />
    </React.Suspense>
  ),
};

// ─── Control Panel ────────────────────────────────────────────────────────────
function ControlPanel({ controls }) {
  if (!controls || controls.length === 0) return null;
  return (
    <div className="bg-[var(--color-bg)]/60 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Sliders size={11} className="text-indigo-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Controles</span>
      </div>
      {controls.map((ctrl, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3">
          <label className="text-[10px] font-semibold text-[var(--color-text-muted)] shrink-0 w-20">{ctrl.label}</label>
          {ctrl.type === 'toggle' && (
            <button
              onClick={() => ctrl.onChange(!ctrl.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                ctrl.value ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400' : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {ctrl.value ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
              {ctrl.value ? (ctrl.labels?.[1] || 'On') : (ctrl.labels?.[0] || 'Off')}
            </button>
          )}
          {ctrl.type === 'select' && (
            <select
              value={ctrl.value}
              onChange={e => ctrl.onChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] rounded-xl px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            >
              {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {(ctrl.type === 'text' || ctrl.type === 'number') && (
            <input
              type={ctrl.type}
              value={ctrl.value}
              onChange={e => ctrl.onChange(e.target.value)}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] rounded-xl px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 min-w-0"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Layout del Sandbox ──────────────────────────────────────────────────────
function SandboxLayout({ title, description, controls, children }) {
  return (
    <div className="space-y-4 h-full">
      <div>
        <h4 className="text-xs font-black text-[var(--color-text)]">{title}</h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-4 h-full">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center min-h-[180px] bg-[var(--color-bg)]/40 border border-dashed border-[var(--color-border)] rounded-2xl p-6 relative">
          <div className="absolute top-2 left-3">
            <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">preview</span>
          </div>
          <div className="w-full max-w-xs">{children}</div>
        </div>
        {/* Controls */}
        <ControlPanel controls={controls} />
      </div>
    </div>
  );
}

// ─── Metadatos para componentes SIN playground ────────────────────────────────
const COMPONENT_META = {
  'sincronización de firestore en tiempo real': { type: 'hook', label: 'Hook Firebase', color: 'amber', note: 'Hook reactivo. Requiere conexión a Firestore y un proyecto Firebase activo para ejecutarse.' },
  'sistema de transacciones atómicas de inventario': { type: 'service', label: 'Servicio', color: 'amber', note: 'Servicio puro JS. Orquesta runTransaction en Firestore. No tiene UI propia.' },
  'motor dinámico de cupones': { type: 'service', label: 'Servicio', color: 'amber', note: 'Lógica CRUD sobre Firestore. Sin interfaz visual propia. Se integra en el Checkout.' },
  'omnicanalidad whatsapp': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo de redirección a WhatsApp. Sin UI propia, se llama desde botones de acción.' },
  'generación pdf': { type: 'service', label: 'Servicio', color: 'amber', note: 'Utilidad de generación de PDF con jsPDF. Sin UI renderizable de forma aislada.' },
  'exportador centralizado pdf': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo de generación de PDF. Sin UI propia.' },
  'servicio unificado de whatsapp': { type: 'service', label: 'Servicio', color: 'amber', note: 'Módulo JS puro de sanitización y redirección. Sin interfaz visual.' },
  'hook de control de inactividad': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook puro de React. Detecta inactividad vía eventos del DOM. Integrar en el componente padre.' },
  'hook de copiado al portapapeles': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Custom hook para gestionar copiado al portapapeles con reset temporizado.' },
  'hook de ubicación guardada': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook reactivo con estado persistido en localStorage y Firestore.' },
  'alertas y confirmaciones globales': { type: 'hook', label: 'Context + Hook', color: 'violet', note: 'Provider de Context React con modal promesificado. Debe envolverse en el árbol de componentes.' },
  'página de login híbrida': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Vista completa de login con autenticación Firebase. Requiere Firebase Auth configurado.' },
  'seguimiento de pedido público': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Vista pública con consulta de pedidos por token. Requiere Firestore con datos reales.' },
  'mapa interactivo': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Requiere Leaflet.js y Nominatim. No renderizable en sandbox sin las librerías cargadas.' },
  'mapa interactivo (leafletmappicker)': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Requiere Leaflet.js y Nominatim. No renderizable en sandbox sin las librerías cargadas.' },
  'leafletmappicker': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Requiere Leaflet.js y Nominatim. No renderizable en sandbox sin las librerías cargadas.' },
  'mapa desplegable': { type: 'complex', label: 'Dependencia Externa', color: 'teal', note: 'Wrapper animado del LeafletMapPicker. Requiere Leaflet y Framer Motion.' },
  'servicio de gestión de domicilios (deliveryservice)': { type: 'service', label: 'Servicio', color: 'amber', note: 'Administra mensajeros, cola de entregas, asignaciones y analíticas de domicilios. Sin UI propia.' },
  'servicio de gestión de domicilios': { type: 'service', label: 'Servicio', color: 'amber', note: 'Administra mensajeros, cola de entregas, asignaciones y analíticas de domicilios. Sin UI propia.' },
  'deliveryservice': { type: 'service', label: 'Servicio', color: 'amber', note: 'Administra mensajeros, cola de entregas, asignaciones y analíticas de domicilios. Sin UI propia.' },
  'carrito de compras completo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Store Zustand + CartDrawer con Framer Motion. Requiere store inicializado y productos reales.' },
  'modal de checkout multipaso': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Wizard de 3 pasos con validaciones, cupones y Firestore. Requiere store de carrito activo.' },
  'sistema de temas dinámicos': { type: 'complex', label: 'Sistema CSS', color: 'teal', note: 'Inyecta variables CSS en :root. Su efecto es global y ya está activo en todo el dashboard.' },
  'restaurador de aplicación a fábrica': { type: 'complex', label: 'Herramienta Destructiva', color: 'red', note: '⚠️ Borra datos de Firestore en lotes. Solo se ejecuta con confirmación explícita del admin.' },
  'compra rápida por código qr': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Vista pública con lógica de variantes y carrito. Requiere datos de producto de Firestore.' },
  'sistema integral de monetización del desarrollador v2.0': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Sistema de 3 sub-componentes con Firestore y lógica de comisiones. Integración compleja.' },
  'consola de diagnóstico de desarrollador': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Panel de diagnóstico en tiempo real con code-splitting. Ya disponible en el dashboard.' },
  'formulario de producto con ia': { type: 'complex', label: 'Dependencia IA', color: 'teal', note: 'Formulario con integración de Gemini API para sugerencias automáticas.' },
  'creador de filtros de catálogo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Extrae atributos dinámicamente de una colección de Firestore.' },
  'panel de filtros de catálogo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Bottom sheet con filtros extraídos de productos reales. Requiere datos de catálogo.' },
  'banner de instalación pwa': { type: 'complex', label: 'API del Navegador', color: 'teal', note: 'Usa el evento beforeinstallprompt del navegador. Solo se activa en contexto real de PWA.' },
};

// Mapa: nombre en minúsculas → clave de playground
export const COMPONENT_SANDBOX_MAP = {
  'switch de modo oscuro (darkmodetoggle)': 'dark_mode_toggle',
  'darkmodetoggle': 'dark_mode_toggle',
  'switch de modo oscuro': 'dark_mode_toggle',
  'dark_mode_toggle': 'dark_mode_toggle',
  'modo oscuro': 'dark_mode_toggle',
  'notificación toast interactiva (guidedtoast)': 'guided_toast',
  'guidedtoast': 'guided_toast',
  'notificación toast interactiva': 'guided_toast',
  'guided_toast': 'guided_toast',
  'toast guiado': 'guided_toast',
  'boton premium': 'boton_premium',
  'boton_premium': 'boton_premium',
  'botón premium': 'boton_premium',
  'botón de regreso (backbutton)': 'boton_premium',
  'botón de regreso': 'boton_premium',
  'backbutton': 'boton_premium',
  'modal base premium (portals & scroll lock)': 'modal_template',
  'modal base premium': 'modal_template',
  'modal_base': 'modal_template',
  'modal de confirmación': 'modal_confirmacion',
  'modal confirmacion': 'modal_confirmacion',
  'modal base': 'modal_template',
  'selector de categorías (categorymanager)': 'gestor_categorias',
  'selector de categorías': 'gestor_categorias',
  'selector_categorias': 'gestor_categorias',
  'selector de variantes de producto (variantselector)': 'selector_atributos',
  'selector de variantes de producto': 'selector_atributos',
  'selector de variantes': 'selector_atributos',
  'selector desplegable premium (customselect)': 'selector_atributos',
  'selector desplegable premium': 'selector_atributos',
  'selector desplegable': 'selector_atributos',
  'input premium': 'input_premium',
  'input_premium': 'input_premium',
  'campo de texto': 'input_premium',
  'selector de cantidad (quantityselector)': 'quantity_selector',
  'selector de cantidad': 'quantity_selector',
  'quantityselector': 'quantity_selector',
  'contador': 'quantity_selector',
  'cantidad': 'quantity_selector',
  'stepper de seguimiento de pedidos (ordertracingtimeline)': 'stepper_pedidos',
  'stepper de seguimiento de pedidos (ordertrackingtimeline)': 'stepper_pedidos',
  'stepper de seguimiento de pedidos': 'stepper_pedidos',
  'stepper pedidos': 'stepper_pedidos',
  'paginación fluida (pagination)': 'paginacion',
  'paginación fluida': 'paginacion',
  'paginación': 'paginacion',
  'pagination': 'paginacion',
  'tarjeta de producto adaptativa y skeleton shimmer (productcard)': 'tarjeta_producto',
  'tarjeta de producto adaptativa y skeleton shimmer': 'tarjeta_producto',
  'tarjeta de producto': 'tarjeta_producto',
  'productcard': 'tarjeta_producto',
  'tarjeta de pedido admin (ordercard)': 'tarjeta_pedido_admin',
  'tarjeta de pedido admin': 'tarjeta_pedido_admin',
  'ordercard': 'tarjeta_pedido_admin',
  'carrusel de anuncios promocionales (catalogbanner)': 'carrusel_anuncios',
  'carrusel de anuncios promocionales': 'carrusel_anuncios',
  'catalogbanner': 'carrusel_anuncios',
  'panel deslizable inferior táctil (swipeablebottomsheet)': 'swipeable_bottom_sheet',
  'panel deslizable inferior táctil': 'swipeable_bottom_sheet',
  'swipeablebottomsheet': 'swipeable_bottom_sheet',
  'swipeable_bottom_sheet': 'swipeable_bottom_sheet',
  'bottom sheet': 'swipeable_bottom_sheet',
  'entrada de código de verificación celular (otpinputfield)': 'otp_input_field',
  'entrada de código de verificación celular': 'otp_input_field',
  'otpinputfield': 'otp_input_field',
  'otp_input_field': 'otp_input_field',
  'otp': 'otp_input_field',
  'paleta de comandos globales (commandpalettekbar)': 'command_palette_kbar',
  'paleta de comandos globales': 'command_palette_kbar',
  'commandpalettekbar': 'command_palette_kbar',
  'command_palette_kbar': 'command_palette_kbar',
  'aplicador animado de cupones con confeti (interactivecouponbadge)': 'interactive_coupon_badge',
  'aplicador animado de cupones con confeti': 'interactive_coupon_badge',
  'interactivecouponbadge': 'interactive_coupon_badge',
  'interactive_coupon_badge': 'interactive_coupon_badge',
  'guía de onboarding paso a paso (interactivetutorialtour)': 'interactive_tutorial_tour',
  'guía de onboarding paso a paso': 'interactive_tutorial_tour',
  'interactivetutorialtour': 'interactive_tutorial_tour',
  'interactive_tutorial_tour': 'interactive_tutorial_tour',
  'hook de optimización de búsqueda (usedebouncevalue)': 'use_debounce_value',
  'hook de optimización de búsqueda': 'use_debounce_value',
  'usedebouncevalue': 'use_debounce_value',
  'use_debounce_value': 'use_debounce_value',
  'indicador de stock crítico (stockheatmap)': 'stock_heatmap',
  'indicador de stock crítico': 'stock_heatmap',
  'stockheatmap': 'stock_heatmap',
  'stock_heatmap': 'stock_heatmap',
  'cuadrícula bento responsiva (bentogrid)': 'bento_grid',
  'cuadrícula bento responsiva': 'bento_grid',
  'bentogrid': 'bento_grid',
  'bento_grid': 'bento_grid',
  'bento grid': 'bento_grid',
  'hook de estado auto persistente (uselocalstoragestate)': 'use_local_storage_state',
  'hook de estado auto persistente': 'use_local_storage_state',
  'uselocalstoragestate': 'use_local_storage_state',
  'use_local_storage_state': 'use_local_storage_state',
  'local storage state': 'use_local_storage_state',
  'facturación comisional del desarrollador (developerbillingpanel)': 'facturacion_comisional',
  'facturación comisional del desarrollador': 'facturacion_comisional',
  'facturación y firma digital': 'facturacion_comisional',
  'facturacion y firma digital': 'facturacion_comisional',
  'developerbillingpanel': 'facturacion_comisional',
  'ruleta de la fortuna de premios': 'ruleta_suerte',
  'ruleta de la fortuna': 'ruleta_suerte',
  'ruleta de la suerte': 'ruleta_suerte',
  'ruleta': 'ruleta_suerte',
  'ruleta_suerte': 'ruleta_suerte',
  'wheel of fortune': 'ruleta_suerte',
  'rafflewheeloffortune': 'ruleta_suerte',
  'selector de reservas tipo agenda': 'reservas_agenda',
  'selector de reservas agenda': 'reservas_agenda',
  'selector de reservas': 'reservas_agenda',
  'reservas_agenda': 'reservas_agenda',
  'agenda': 'reservas_agenda',
  'reservas': 'reservas_agenda',
  'agendareservationcalendar': 'reservas_agenda',
  'telemetría centralizada (centralfirebaseservice + telemetryservice)': 'telemetria_centralizada',
  'telemetría centralizada': 'telemetria_centralizada',
  'telemetria centralizada': 'telemetria_centralizada',
  'centralfirebaseservice': 'telemetria_centralizada',
  'telemetryservice': 'telemetria_centralizada',
  'telemetria_centralizada': 'telemetria_centralizada',
  'selector de fecha y rangos premium (datepickerpremium)': 'calendario_premium',
  'selector de fecha y rangos premium': 'calendario_premium',
  'datepickerpremium': 'calendario_premium',
  'calendario_premium': 'calendario_premium',
  'calendario premium': 'calendario_premium',
  'datepicker': 'date_picker',
  'marquesina de marcas (infinitelogomarquee)': 'infinite_logo_marquee',
  'marquesina de marcas': 'infinite_logo_marquee',
  'marquesina de marcas infinita': 'infinite_logo_marquee',
  'marquesina de marcas infinita (infinitelogomarquee)': 'infinite_logo_marquee',
  'infinitelogomarquee': 'infinite_logo_marquee',
  'infinite_logo_marquee': 'infinite_logo_marquee',
  'marquesina': 'infinite_logo_marquee',
  'menú radial interactivo (radialinteractivemenu)': 'radial_interactive_menu',
  'menú radial interactivo': 'radial_interactive_menu',
  'radialinteractivemenu': 'radial_interactive_menu',
  'radial_interactive_menu': 'radial_interactive_menu',
  'menú radial': 'radial_interactive_menu',
  'menú de acción flotante radial': 'radial_interactive_menu',
  'menu de accion flotante radial': 'radial_interactive_menu',
  'menú de acción flotante radial (radialinteractivemenu)': 'radial_interactive_menu',
  'tarjeta 3d holográfica (holographictiltcard)': 'holographic_tilt_card',
  'tarjeta 3d holográfica': 'holographic_tilt_card',
  'tarjeta 3d holografica': 'holographic_tilt_card',
  'holographictiltcard': 'holographic_tilt_card',
  'holographic_tilt_card': 'holographic_tilt_card',
  'tarjeta holografica': 'holographic_tilt_card',
  'tarjeta holográfica': 'holographic_tilt_card',
  'botón magnético reactivo (magneticbutton)': 'magnetic_button',
  'botón magnético reactivo': 'magnetic_button',
  'boton magnetico reactivo': 'magnetic_button',
  'magneticbutton': 'magnetic_button',
  'magnetic_button': 'magnetic_button',
  'boton magnetico': 'magnetic_button',
  'botón magnético': 'magnetic_button',
  'mazo de tarjetas deslizables (swipeablecardstack)': 'swipeable_card_stack',
  'mazo de tarjetas deslizables': 'swipeable_card_stack',
  'mazo tarjetas deslizables': 'swipeable_card_stack',
  'swipeablecardstack': 'swipeable_card_stack',
  'swipeable_card_stack': 'swipeable_card_stack',
  'mazo tarjetas': 'swipeable_card_stack',
  'fondo de luces orgánicas interactivas (interactiveambientglow)': 'interactive_ambient_glow',
  'fondo de luces orgánicas interactivas': 'interactive_ambient_glow',
  'fondo de luces organicas interactivas': 'interactive_ambient_glow',
  'interactiveambientglow': 'interactive_ambient_glow',
  'interactive_ambient_glow': 'interactive_ambient_glow',
  'fondo luces': 'interactive_ambient_glow',
  'fondo luces organicas': 'interactive_ambient_glow',
  'fondo de luces organicas': 'interactive_ambient_glow',
  'empty state premium interactivo (emptystate)': 'empty_state',
  'empty state premium interactivo': 'empty_state',
  'empty_state': 'empty_state',
  'empty state': 'empty_state',
  'selector de boletas de rifa (rafflenumberselector)': 'selector_boletas_rifas',
  'selector de boletas de rifa': 'selector_boletas_rifas',
  'selector de boletas': 'selector_boletas_rifas',
  'selector_boletas_rifas': 'selector_boletas_rifas',
  'rafflenumberselector': 'selector_boletas_rifas',
  'rifas': 'selector_boletas_rifas',
  'boletas': 'selector_boletas_rifas',
  'sistema de notificaciones premium': 'sistema_notificaciones',
  'sistema de notificaciones': 'sistema_notificaciones',
  'sistema_notificaciones': 'sistema_notificaciones',
  'notificaciones': 'sistema_notificaciones',
  'notification system': 'sistema_notificaciones',
  'toaststack': 'sistema_notificaciones',
  'notificationbell': 'sistema_notificaciones',
  'notificationtray': 'sistema_notificaciones',
  'campana de notificaciones': 'sistema_notificaciones',
  'bandeja de notificaciones': 'sistema_notificaciones',
  'authguard & userprofile': 'auth_guard_userprofile',
  'auth_guard_userprofile': 'auth_guard_userprofile',
  'authguard': 'auth_guard_userprofile',
  'userprofile': 'auth_guard_userprofile',
  'guard de autenticación + perfil de usuario (authguard & userprofile)': 'auth_guard_userprofile',
  'global_skeleton_loader': 'global_skeleton_loader',
  'globalskeletonloader': 'global_skeleton_loader',
  'skeleton loader': 'global_skeleton_loader',
  'shimmer loader': 'global_skeleton_loader',
  'skeleton loader premium global (globalskeletonloader)': 'global_skeleton_loader',
  'breadcrumb_header': 'breadcrumb_header',
  'breadcrumbheader': 'breadcrumb_header',
  'breadcrumb': 'breadcrumb_header',
  'breadcrumb / header contextual adaptativo (breadcrumbheader)': 'breadcrumb_header',
  'error_boundary_fallback': 'error_boundary_fallback',
  'errorboundaryfallback': 'error_boundary_fallback',
  'error boundary': 'error_boundary_fallback',
  'error boundary premium con fallback ui (errorboundaryfallback)': 'error_boundary_fallback',
  'caja_diaria_pos': 'caja_diaria_pos',
  'cajadiariapos': 'caja_diaria_pos',
  'caja diaria': 'caja_diaria_pos',
  'caja diaria pos': 'caja_diaria_pos',
  'control de caja y cierre de turno': 'caja_diaria_pos',
  'control de caja': 'caja_diaria_pos',
  'cierre de caja': 'caja_diaria_pos',
  'pantalla de cocina kds': 'pantalla_cocina_kds',
  'pantallacocinakds': 'pantalla_cocina_kds',
  'pantalla de cocina': 'pantalla_cocina_kds',
  'kds': 'pantalla_cocina_kds',
  'reservas y agenda de citas': 'reservas_agenda_citas',
  'reservasagendacitas': 'reservas_agenda_citas',
  'agenda de citas': 'reservas_agenda_citas',
  'reservas y citas': 'reservas_agenda_citas',
  'cobro pos exprés por lector de barras': 'pos_express_scanner',
  'posexpressscanner': 'pos_express_scanner',
  'lector de barras': 'pos_express_scanner',
  'órdenes de trabajo y equipos': 'ordenes_trabajo_equipos',
  'ordenes_trabajo_equipos': 'ordenes_trabajo_equipos',
  'ordenestrabajoequipos': 'ordenes_trabajo_equipos',
  'órdenes de trabajo': 'ordenes_trabajo_equipos',
  'créditos y saldos': 'creditos_y_saldos',
  'creditossaldos': 'creditos_y_saldos',
  'creditos_y_saldos': 'creditos_y_saldos',
  'omnicanalidad whatsapp': 'omnicanalidad_whatsapp',
  'omnicanalidadwhatsapp': 'omnicanalidad_whatsapp',
  'omnicanalidad_whatsapp': 'omnicanalidad_whatsapp',
  'whatsapp': 'omnicanalidad_whatsapp',
  'currency_input': 'currency_input',
  'currencyinput': 'currency_input',
  'entrada de moneda formateada cop (currencyinput)': 'currency_input',
  'entrada de moneda': 'currency_input',
  'modal_template': 'modal_template',
  'modaltemplate': 'modal_template',
  'modal template': 'modal_template',
  'modal base premium (modaltemplate)': 'modal_template',
  'date_picker': 'date_picker',
  'date-picker': 'date_picker',
  'date picker': 'date_picker',
  'connectivity_toast': 'connectivity_toast',
  'connectivitytoast': 'connectivity_toast',
  'alerta de conectividad (connectivitytoast)': 'connectivity_toast',
  'alerta de conectividad': 'connectivity_toast',
  'toast de red': 'connectivity_toast',
  'connectivity toast': 'connectivity_toast',
  'quantity_selector': 'quantity_selector',
  'quantityselector': 'quantity_selector',
  'selector de cantidad (quantityselector)': 'quantity_selector',
  'selector de cantidad': 'quantity_selector',
  'quantity selector': 'quantity_selector',
  'cursor personalizado': 'custom_cursor',
  'cursor personalizado interactivo (customcursor)': 'custom_cursor',
  'customcursor': 'custom_cursor',
  'custom_cursor': 'custom_cursor',
};

export function getSandboxKey(name = '', technicalName = '') {
  const normName = name.toLowerCase().trim();
  const normTech = (technicalName || '').toLowerCase().trim();
  
  let key = COMPONENT_SANDBOX_MAP[normName] || COMPONENT_SANDBOX_MAP[normTech] || null;
  if (key) return key;
  
  const check = (str) => {
    if (!str) return null;
    if (str.includes('currency') || str.includes('moneda')) return 'currency_input';
    if (str.includes('modaltemplate') || (str.includes('modal') && str.includes('template'))) return 'modal_template';
    if (str.includes('datepicker') || str.includes('date picker')) return 'date_picker';
    if (str.includes('connectivity') || str.includes('wifi') || str.includes('toast de red') || str.includes('toast red')) return 'connectivity_toast';
    if (str.includes('quantity') || str.includes('quantityselector')) return 'quantity_selector';
    if (str.includes('marquee') || str.includes('marquesina')) return 'infinite_logo_marquee';
    if (str.includes('radial') || str.includes('menú radial') || str.includes('menu radial')) return 'radial_interactive_menu';
    if (str.includes('tilt') || str.includes('holograf') || str.includes('holográf')) return 'holographic_tilt_card';
    if (str.includes('magnét') || str.includes('magnet') || str.includes('magnetic')) return 'magnetic_button';
    if (str.includes('swipe') || str.includes('desliza') || str.includes('mazo')) return 'swipeable_card_stack';
    if (str.includes('glow') || str.includes('fondo luces') || str.includes('luces orgán') || str.includes('ambient')) return 'interactive_ambient_glow';
    if (str.includes('empty') || str.includes('vacio') || str.includes('vacío')) return 'empty_state';
    if (str.includes('rifa') || str.includes('boleta') || str.includes('ticket') || str.includes('numberselector')) return 'selector_boletas_rifas';
    if (str.includes('ruleta') || str.includes('fortuna') || str.includes('suerte') || str.includes('wheel')) return 'ruleta_suerte';
    if (str.includes('agenda') || str.includes('reserva') || str.includes('cita') || str.includes('calendario')) return 'reservas_agenda';
    if (str.includes('notif') || str.includes('toast') || str.includes('campana') || str.includes('bandeja') || str.includes('bell') || str.includes('tray')) return 'sistema_notificaciones';
    if (str.includes('ubicación') || str.includes('ubicacion') || str.includes('savedlocation') || str.includes('saved_location')) return null;
    if (str.includes('auth') || str.includes('profile') || str.includes('guard')) return 'auth_guard_userprofile';
    if (str.includes('skeleton') || str.includes('shimmer')) return 'global_skeleton_loader';
    if (str.includes('breadcrumb') || str.includes('migas') || str.split(' ').includes('pan')) return 'breadcrumb_header';
    if (str.includes('error') || str.includes('boundary') || str.includes('fallback')) return 'error_boundary_fallback';
    if (str.includes('cocina') || str.includes('kds')) return 'pantalla_cocina_kds';
    if (str.includes('reservas y agenda') || str.includes('reservasagenda') || str.includes('agenda de citas')) return 'reservas_agenda_citas';
    if (str.includes('lector de barras') || str.includes('scanner') || str.includes('barcode') || str.includes('barras')) return 'pos_express_scanner';
    if (str.includes('órdenes de trabajo') || str.includes('ordenes de trabajo') || str.includes('equipos') || str.includes('workorder') || str.includes('ot ')) return 'ordenes_trabajo_equipos';
    if (str.includes('créditos') || str.includes('creditos') || str.includes('saldos') || str.includes('deuda')) return 'creditos_y_saldos';
    if (str.includes('omnicanalidad') || str.includes('redirección whatsapp') || str.includes('redireccion whatsapp') || str.includes('whatsapp')) return 'omnicanalidad_whatsapp';
    if (str.includes('caja') || str.includes('cierre') || str.includes('arqueo') || str.includes('diaria')) return 'caja_diaria_pos';
    if (str.includes('cursor') || str.includes('ccursor') || str.includes('puntero')) return 'custom_cursor';
    return null;
  };
  
  return check(normName) || check(normTech);
}

export default function ComponentSandbox({ componentName = '', technicalName = '' }) {
  const normalizedName = componentName.toLowerCase().trim();
  console.log('[ComponentSandbox] Received componentName:', componentName, 'technicalName:', technicalName);
  
  const sandboxKey = getSandboxKey(componentName, technicalName);
  
  console.log('[ComponentSandbox] Resolved sandboxKey:', sandboxKey);

  const SandboxComponent = sandboxKey ? SANDBOXES[sandboxKey] : null;
  const meta = COMPONENT_META[normalizedName] || null;

  if (!SandboxComponent) {
    const colorMap = {
      amber: { badge: 'bg-amber-500/10 border-amber-500/25 text-amber-400', icon: '⚙️', pill: 'bg-amber-500/15 text-amber-400' },
      violet: { badge: 'bg-violet-500/10 border-violet-500/25 text-violet-400', icon: '🪝', pill: 'bg-violet-500/15 text-violet-400' },
      blue: { badge: 'bg-blue-500/10 border-blue-500/25 text-blue-400', icon: '📄', pill: 'bg-blue-500/15 text-blue-400' },
      teal: { badge: 'bg-teal-500/10 border-teal-500/25 text-teal-400', icon: '🧩', pill: 'bg-teal-500/15 text-teal-400' },
      red: { badge: 'bg-red-500/10 border-red-500/25 text-red-400', icon: '⚠️', pill: 'bg-red-500/15 text-red-400' },
      default: { badge: 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]', icon: '📦', pill: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]' },
    };
    const c = meta ? (colorMap[meta.color] || colorMap.default) : colorMap.default;

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] p-6 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className={`p-5 border rounded-3xl text-3xl ${c.badge}`}>
            {c.icon}
          </div>
          {meta && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.pill}`}>
              {meta.label}
            </span>
          )}
        </div>

        <div className="text-center max-w-[320px] space-y-2">
          <p className="text-sm font-bold text-[var(--color-text)]">
            {meta ? 'Sandbox No Aplicable' : 'Playground No Configurado'}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            {meta
              ? meta.note
              : 'Este componente aún no tiene un playground interactivo asignado. Consulta la pestaña Documentación para ver el código completo y los casos de uso.'}
          </p>
        </div>

        <div className={`w-full max-w-sm p-3.5 rounded-2xl border text-center ${c.badge}`}>
          <p className="text-[10px] font-bold leading-relaxed">
            {meta?.type === 'hook' && '→ Importa el hook en tu componente y pásale los parámetros de configuración.'}
            {meta?.type === 'service' && '→ Importa el servicio como módulo JS y llama sus funciones directamente.'}
            {meta?.type === 'page' && '→ Registra esta vista como ruta en tu router y pásale las props requeridas.'}
            {meta?.type === 'complex' && '→ Instala las dependencias indicadas en la documentación antes de integrar.'}
            {!meta && '→ Revisa la pestaña Documentación para ver el código completo y copiarlo.'}
          </p>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] text-center mb-2">Playgrounds disponibles</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.keys(SANDBOXES).map(k => (
              <div key={k} className="px-2.5 py-1.5 bg-indigo-600/8 border border-indigo-500/15 rounded-xl text-[9px] text-indigo-400/70 font-mono text-center">
                {k.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <SandboxComponent />
    </div>
  );
}
