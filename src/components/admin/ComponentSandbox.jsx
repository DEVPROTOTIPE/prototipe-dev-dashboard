import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAlertConfirm } from '../common/AlertConfirmContext';
import {
  Sliders, ToggleLeft, ToggleRight, Package, ShoppingBag, Receipt, Search, Info, Plus, Loader2
} from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { CLI_URL } from '../../config';

const sandboxModules = import.meta.glob('./sandboxes/*.jsx');

function snakeToPascal(str) {
  if (!str) return '';
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

const LoaderSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-3">
    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Cargando playground...</p>
  </div>
);

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
            <div className="w-32 shrink-0">
              <CustomSelect
                value={ctrl.value}
                onChange={ctrl.onChange}
                options={ctrl.options.map(o => ({ value: o, label: String(o) }))}
              />
            </div>
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
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-black text-[var(--color-text)]">{title}</h4>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col gap-4">
        {/* Preview Area */}
        <div className="min-h-[180px] bg-[var(--color-bg)]/40 border border-dashed border-[var(--color-border)] rounded-2xl p-6 relative flex items-center justify-center">
          <div className="absolute top-2 left-3">
            <span className="text-[8px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">preview</span>
          </div>
          <div className="max-w-full">{children}</div>
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
  'propuesta portal creación features': { type: 'service', label: 'Servicio / CLI', color: 'amber', note: 'Especificación y wizard transaccional de features del monorepo. No requiere simulación.' },
  'restaurador de aplicación a fábrica': { type: 'complex', label: 'Herramienta Destructiva', color: 'red', note: '⚠️ Borra datos de Firestore en lotes. Solo se ejecuta con confirmación explícita del admin.' },
  'compra rápida por código qr': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Vista pública con lógica de variantes y carrito. Requiere datos de producto de Firestore.' },
  'sistema integral de monetización del desarrollador v2.0': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Sistema de 3 sub-componentes con Firestore y lógica de comisiones. Integración compleja.' },
  'consola de diagnóstico de desarrollador': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Panel de diagnóstico en tiempo real con code-splitting. Ya disponible en el dashboard.' },
  'consola de errores y diagnóstico inteligente': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Monitoreo de fallas y asistente de diagnóstico de código. Integrado de manera nativa en el dashboard central.' },
  'rejilla de catálogo inteligente': { type: 'complex', label: 'Componente UI', color: 'teal', note: 'Rejilla responsiva con layouts e imágenes. Requiere inicialización de appConfigStore y productos en base de datos.' },
  'hook de carrito de compras': { type: 'hook', label: 'Zustand Store', color: 'violet', note: 'Store Zustand persistente para controlar existencias, adiciones y límites de stock.' },
  'hook de control del asistente guiado': { type: 'hook', label: 'Zustand Store', color: 'violet', note: 'Store Zustand para el flujo guiado de usuario. Sin interfaz visual directa.' },
  // Mapeos para consistencia física/lógica con linter de biblioteca
  'compra_rapida_por_qr': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Compra rápida mediante código QR. Lógica integrada de catálogo y checkout.' },
  'carrito_completo': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Carrito de compras flotante con animaciones y control de persistencia.' },
  'carrito_lateral': { type: 'complex', label: 'Componente UI', color: 'teal', note: 'Drawer lateral interactivo que consume el hook de carrito global.' },
  'checkout_modal': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Modal wizard para flujos de pago multipaso. Requiere Firebase.' },
  'imagen_lazy': { type: 'complex', label: 'Componente UI', color: 'teal', note: 'Componente atómico de carga diferida de imágenes con skeleton y animaciones.' },
  'rejilla_catalogo': { type: 'complex', label: 'Componente UI', color: 'teal', note: 'Rejilla responsiva optimizada para catálogos comerciales fluidos.' },
  'alertas_confirmaciones_globales': { type: 'hook', label: 'Context + Hook', color: 'violet', note: 'Manejador global de alertas de confirmación a nivel de Context React.' },
  'control_carrito': { type: 'hook', label: 'Zustand Store', color: 'violet', note: 'Store Zustand persistido que orquesta el carrito de compras.' },
  'control_inactividad': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook para el rastreo y timeout por inactividad de usuario en DOM.' },
  'hook_ubicacion_guardada': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook persistido para geolocalización o dirección guardada del cliente.' },
  'panel_domicilio': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Panel interactivo para el control y despacho de domiciliarios.' },
  'pantalla_bienvenida': { type: 'page', label: 'Página Completa', color: 'blue', note: 'Pantalla inicial de onboarding y bienvenida de clientes.' },
  'consola_errores_diagnostico': { type: 'complex', label: 'Módulo Completo', color: 'red', note: 'Herramienta de diagnóstico de errores en runtime e integridad.' },
  'gestion_domicilios': { type: 'service', label: 'Servicio', color: 'amber', note: 'Servicio de orquestación de domicilios, rutas y estados de entrega.' },
  'motor_cupones': { type: 'service', label: 'Servicio', color: 'amber', note: 'Motor lógico para la aplicación y validación de cupones en checkout.' },
  'sincronizacion_firebase': { type: 'service', label: 'Servicio', color: 'amber', note: 'Servicio de sincronización en tiempo real y listeners con Firestore.' },
  'transacciones_atomicas_inventario': { type: 'service', label: 'Servicio', color: 'amber', note: 'Transacciones para actualización segura y atómica de stocks.' },
  'consola_diagnostico_desarrollador': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Consola integral de telemetría y diagnóstico de desarrollo.' },
  'copiador_portapapeles': { type: 'hook', label: 'Custom Hook', color: 'violet', note: 'Hook interactivo para copiado rápido de textos en portapapeles.' },
  'exportador_pdf': { type: 'service', label: 'Servicio', color: 'amber', note: 'Servicio para la generación vectorial y exportación de facturas PDF.' },
  'restauracion_aplicacion': { type: 'complex', label: 'Módulo Completo', color: 'red', note: 'Módulo crítico de restauración del estado a fábrica del ecosistema.' },
  'servicio_whatsapp': { type: 'service', label: 'Servicio', color: 'amber', note: 'Servicio de notificaciones y redireccionamiento unificado a WhatsApp.' },
  'sistema_temas_dinamicos': { type: 'complex', label: 'Módulo CSS', color: 'teal', note: 'Manejador global de inyección de variables HSL cromáticas en runtime.' },
  'modulo_commits_despliegues': { type: 'complex', label: 'Módulo Completo', color: 'teal', note: 'Mapeador del pipeline de git commits, logs de despliegue y telemetría.' },
  'propuesta_dashboard_interactivo': { type: 'document', label: 'Documento Técnico', color: 'slate', note: 'Propuesta de interactividad directa (Playable Preview) para la ilustración del Hero.' },
  'toast_notification': { type: 'atom', label: 'Componente Atómico', color: 'indigo', note: 'Notificación temporal (Toast) atómica para retroalimentación visual de operaciones.' },
  'modal_base_premium': { type: 'atom', label: 'Componente Atómico', color: 'indigo', note: 'Envoltura modal atómica con soporte de React Portals y scroll-lock básico.' }
};

// Mapa: nombre en minúsculas → clave de playground
export const COMPONENT_SANDBOX_MAP = {
  'animatednavbarmobile': 'AnimatedNavbarMobile',
  'animated_navbar_mobile': 'AnimatedNavbarMobile',
  'barra_navegacion_animada_movil': 'AnimatedNavbarMobile',
  'floatingpromogrenade': 'FloatingPromoGrenade',
  'floating_promo_grenade': 'FloatingPromoGrenade',
  'granada_promocional_flotante': 'FloatingPromoGrenade',
  'interactivefortunecookie': 'InteractiveFortuneCookie',
  'interactive_fortune_cookie': 'InteractiveFortuneCookie',
  'galleta_fortuna_interactiva': 'InteractiveFortuneCookie',
  'interactivefortune_wheel': 'InteractiveFortuneWheel',
  'interactive_fortune_wheel': 'InteractiveFortuneWheel',
  'interactivefortunewheel': 'InteractiveFortuneWheel',
  'ruleta_fortuna_premios_premium': 'InteractiveFortuneWheel',
  'catalogbanner': 'CatalogBanner',
  'catalog_banner': 'CatalogBanner',
  'carrusel_anuncios_promocionales': 'CatalogBanner',
  'premiumnotificationcenter': 'PremiumNotificationCenter',
  'premium_notification_center': 'PremiumNotificationCenter',
  'notificationhistorytray': 'PremiumNotificationCenter',
  'notification_history_tray': 'PremiumNotificationCenter',
  // --- FASE 1: Componentes Atómicos Premium ---
  'pin_code_input': 'PinCodeInput',
  'pincodeinput': 'PinCodeInput',
  'magnetic_glow_input': 'MagneticGlowInput',
  'magneticglowinput': 'MagneticGlowInput',
  'placeholder_vanish_input': 'PlaceholderVanishInput',
  'placeholdervanishinput': 'PlaceholderVanishInput',
  'border_beam_input': 'BorderBeamInput',
  'borderbeaminput': 'BorderBeamInput',
  'slider_numeric_input': 'SliderNumericInput',
  'slidernumericinput': 'SliderNumericInput',
  'smart_otp_input': 'SmartOtpInput',
  'smartotpinput': 'SmartOtpInput',
  'inline_chip_picker_input': 'InlineChipPickerInput',
  'inlinechippickerinput': 'InlineChipPickerInput',
  'magnetic_parallax_button': 'MagneticParallaxButton',
  'magneticparallaxbutton': 'MagneticParallaxButton',
  'liquid_glow_button': 'LiquidGlowButton',
  'liquidglowbutton': 'LiquidGlowButton',
  'border_beam_button': 'BorderBeamButton',
  'borderbeambutton': 'BorderBeamButton',
  // --- FASE 2: Componentes Atómicos Premium ---
  'elastic_toggle_switch': 'ElasticToggleSwitch',
  'elastictoggleswitch': 'ElasticToggleSwitch',
  'floating_menu_trigger': 'FloatingMenuTrigger',
  'floatingmenutrigger': 'FloatingMenuTrigger',
  'accordion_interactive_filter': 'AccordionInteractiveFilter',
  'accordioninteractivefilter': 'AccordionInteractiveFilter',
  'dual_slider_range': 'DualSliderRange',
  'dualsliderrange': 'DualSliderRange',
  'interactive_segmented_control': 'InteractiveSegmentedControl',
  'interactivesegmentedcontrol': 'InteractiveSegmentedControl',
  'ripple_button': 'RippleButton',
  'ripplebutton': 'RippleButton',
  'confetti_trigger_button': 'ConfettiTriggerButton',
  'confettitriggerbutton': 'ConfettiTriggerButton',
  'slide_to_unlock_button': 'SlideToUnlockButton',
  'slidetounlockbutton': 'SlideToUnlockButton',
  'interactive_copy_button': 'InteractiveCopyButton',
  'interactivecopybutton': 'InteractiveCopyButton',
  'feedback_emoji_picker': 'FeedbackEmojiPicker',
  'feedbackemojipicker': 'FeedbackEmojiPicker',
  // --- FASE 3: Badges, Chips e Indicadores de Estado ---
  'animated_notification_badge': 'AnimatedNotificationBadge',
  'animatednotificationbadge': 'AnimatedNotificationBadge',
  'status_indicator_glow': 'StatusIndicatorGlow',
  'statusindicatorglow': 'StatusIndicatorGlow',
  'multi_step_progress_bar': 'MultiStepProgressBar',
  'multistepprogressbar': 'MultiStepProgressBar',
  'activity_dot_pulse': 'ActivityDotPulse',
  'activitydotpulse': 'ActivityDotPulse',
  'interactive_tag_chip': 'InteractiveTagChip',
  'interactivetagchip': 'InteractiveTagChip',
  'sparkles_text_indicator': 'SparklesTextIndicator',
  'sparklestextindicator': 'SparklesTextIndicator',
  'border_beam_badge': 'BorderBeamBadge',
  'borderbeambadge': 'BorderBeamBadge',
  'progress_circle_ring': 'ProgressCircleRing',
  'progresscirclering': 'ProgressCircleRing',
  'rating_stars_elastic': 'RatingStarsElastic',
  'ratingstarselastic': 'RatingStarsElastic',
  'alert_banner_slide': 'AlertBannerSlide',
  'alertbannerslide': 'AlertBannerSlide',
  // --- FASE 4: Animaciones de Carga y Skeletons ---
  'infinite_flow_loader': 'InfiniteFlowLoader',
  'infiniteflowloader': 'InfiniteFlowLoader',
  'glow_pulse_skeleton': 'GlowPulseSkeleton',
  'glowpulseskeleton': 'GlowPulseSkeleton',
  'circular_dash_spinner': 'CircularDashSpinner',
  'circulardashspinner': 'CircularDashSpinner',
  'success_checkmark': 'SuccessCheckmark',
  'successcheckmark': 'SuccessCheckmark',
  'error_cross': 'ErrorCross',
  'errorcross': 'ErrorCross',
  'bouncing_dots_loader': 'BouncingDotsLoader',
  'bouncingdotsloader': 'BouncingDotsLoader',
  'waveform_voice_indicator': 'WaveformVoiceIndicator',
  'waveformvoiceindicator': 'WaveformVoiceIndicator',
  'typing_bubble_indicator': 'TypingBubbleIndicator',
  'typingbubbleindicator': 'TypingBubbleIndicator',
  'expanding_grid_skeleton': 'ExpandingGridSkeleton',
  'expandinggridskeleton': 'ExpandingGridSkeleton',
  'shimmer_gradient_overlay': 'ShimmerGradientOverlay',
  'shimmergradientoverlay': 'ShimmerGradientOverlay',
  // --- FASE 5: Tarjetas, Contenedores y Decorativos ---
  'physical_3d_tilt_card': 'Physical3dTiltCard',
  'physical3dtiltcard': 'Physical3dTiltCard',
  'cursor_follow_glow_container': 'CursorFollowGlowContainer',
  'cursorfollowglowcontainer': 'CursorFollowGlowContainer',
  'canvas_reveal_card': 'CanvasRevealCard',
  'canvasrevealcard': 'CanvasRevealCard',
  'dynamic_glassmorphic_container': 'DynamicGlassmorphicContainer',
  'dynamicglassmorphiccontainer': 'DynamicGlassmorphicContainer',
  'parallax_zoom_card': 'ParallaxZoomCard',
  'parallaxzoomcard': 'ParallaxZoomCard',
  'magnetic_border_container': 'MagneticBorderContainer',
  'magneticbordercontainer': 'MagneticBorderContainer',
  'dynamic_confetti_trigger': 'DynamicConfettiTrigger',
  'dynamicconfettitrigger': 'DynamicConfettiTrigger',
  'floating_hover_text': 'FloatingHoverText',
  'floatinghovertext': 'FloatingHoverText',
  'magnetic_svg_icon': 'MagneticSvgIcon',
  'magneticsvgicon': 'MagneticSvgIcon',
  'light_beam_divider': 'LightBeamDivider',
  'lightbeamdivider': 'LightBeamDivider',
  'floating_rating_stars': 'FloatingRatingStars',
  'floatingratingstars': 'FloatingRatingStars',
  // --- FASE 6: 20 Nuevos Componentes Atómicos (Fase 1: 1-10) ---
  'search_vanish_highlight_input': 'SearchVanishHighlightInput',
  'searchvanishhighlightinput': 'SearchVanishHighlightInput',
  'auto_resize_text_area': 'AutoResizeTextArea',
  'autoresizetextarea': 'AutoResizeTextArea',
  'animated_password_input': 'AnimatedPasswordInput',
  'animatedpasswordinput': 'AnimatedPasswordInput',
  'phone_formatting_input': 'PhoneFormattingInput',
  'phoneformattinginput': 'PhoneFormattingInput',
  'animated_search_dropdown': 'AnimatedSearchDropdown',
  'animatedsearchdropdown': 'AnimatedSearchDropdown',
  'vertical_fill_liquid_glass': 'VerticalFillLiquidGlass',
  'verticalfillliquidglass': 'VerticalFillLiquidGlass',
  'scratch_card_reward': 'ScratchCardReward',
  'scratchcardreward': 'ScratchCardReward',
  'interactive_gold_pot': 'InteractiveGoldPot',
  'interactivegoldpot': 'InteractiveGoldPot',
  'olla_oro_interactiva': 'InteractiveGoldPot',
  'ollaorointersctiva': 'InteractiveGoldPot',
  'alcancia_ahorradora': 'InteractiveGoldPot',
  'credit_card_interactive_flip': 'CreditCardInteractiveFlip',
  'creditcardinteractiveflip': 'CreditCardInteractiveFlip',
  'drag_and_drop_zone': 'DragAndDropZone',
  'draganddropzone': 'DragAndDropZone',
  'interactive_otp_timer': 'InteractiveOtpTimer',
  'interactiveotptimer': 'InteractiveOtpTimer',
  'selector_calibre_alambre': 'SelectorCalibreAlambre',
  'selectorcalibrealambre': 'SelectorCalibreAlambre',
  'selector de calibre y alambre': 'SelectorCalibreAlambre',
  'selector de calibre y alambre rural': 'SelectorCalibreAlambre',
  'selector_tallas_colores': 'SelectorTallasColores',
  'selectortallascolores': 'SelectorTallasColores',
  'selector de tallas y colores': 'SelectorTallasColores',
  'selector de tallas y colores (selectortallascolores)': 'SelectorTallasColores',
  'guia_medidas_talla_ideal': 'GuiaMedidasTallaIdeal',
  'guiamedidastallaideal': 'GuiaMedidasTallaIdeal',
  'guía de medidas y talla ideal': 'GuiaMedidasTallaIdeal',
  'guía de medidas y talla ideal (guiamedidastallaideal)': 'GuiaMedidasTallaIdeal',
  'galeria_zoom_hover': 'GaleriaZoomHover',
  'galeriazoomhover': 'GaleriaZoomHover',
  'galería con zoom en hover': 'GaleriaZoomHover',
  'galería con zoom en hover (galeriazoomhover)': 'GaleriaZoomHover',
  'carrusel_completa_look': 'CarruselCompletaLook',
  'carruselcompletalook': 'CarruselCompletaLook',
  'carrusel completa el look': 'CarruselCompletaLook',
  'carrusel completa el look (carruselcompletalook)': 'CarruselCompletaLook',
  'buscador_disponibilidad_tiendas': 'BuscadorDisponibilidadTiendas',
  'buscadordisponibilidadtiendas': 'BuscadorDisponibilidadTiendas',
  'buscador de disponibilidad en tiendas': 'BuscadorDisponibilidadTiendas',
  'buscador de disponibilidad en tiendas (buscadordisponibilidadtiendas)': 'BuscadorDisponibilidadTiendas',
  'selector_empaque_regalo': 'SelectorEmpaqueRegalo',
  'selectorempaqueregalo': 'SelectorEmpaqueRegalo',
  'selector de empaque de regalo': 'SelectorEmpaqueRegalo',
  'selector de empaque de regalo y dedicatoria': 'SelectorEmpaqueRegalo',
  'selector de empaque de regalo (selectorempaqueregalo)': 'SelectorEmpaqueRegalo',
  'carrucel_productos': 'CarrucelProductos',
  'carrucelproductos': 'CarrucelProductos',
  'carrucel de productos': 'CarrucelProductos',
  'modulo_agendamiento_barberia': 'ModuloAgendamientoBarberia',
  'moduloagendamientobarberia': 'ModuloAgendamientoBarberia',
  'modulo de agendamiento de citas (barberia)': 'ModuloAgendamientoBarberia',
  'modulo de agendamiento de citas (barbería)': 'ModuloAgendamientoBarberia',
  'circular_dish_menu': 'CircularDishMenu',
  'circulardishmenu': 'CircularDishMenu',
  'menu de platos circular': 'CircularDishMenu',
  'menu de platos circular (circulardishmenu)': 'CircularDishMenu',
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
  'selector desplegable animado premium (customselect)': 'CustomSelect',
  'selector desplegable animado premium': 'CustomSelect',
  'selector desplegable premium (customselect)': 'CustomSelect',
  'selector desplegable premium': 'CustomSelect',
  'selector desplegable': 'CustomSelect',
  'customselect': 'CustomSelect',
  'custom_select': 'CustomSelect',
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
  // Mapeos adicionales de nombres de carpetas físicas para compatibilidad con linter de biblioteca
  'telemetria_ecosistema_global': 'telemetria_centralizada',
  'ruleta_fortuna_premios': 'ruleta_suerte',
  'boton_regreso': 'boton_premium',
  'entrada_moneda': 'currency_input',
  'selector_fecha': 'date_picker',
  'selector_variantes': 'selector_atributos',
  'sistema_notificaciones_premium': 'sistema_notificaciones',
  'hook_estado_local_storage': 'use_local_storage_state',
  'hook_filtro_debounce': 'use_debounce_value',
  'plantilla_modal': 'modal_template',
  'selector_reservas_agenda': 'reservas_agenda_citas',
  'carrusel_anuncios_promocionales': 'carrusel_anuncios',
  'marquesina_marcas': 'infinite_logo_marquee',
  'alertas_stock_critico': 'stock_heatmap',
  // Mapeos para los nuevos 5 sandboxes interactivos
  'formulario_producto_ia': 'formulario_producto_ia',
  'formulario de producto con ia': 'formulario_producto_ia',
  'productformmodal_ia': 'formulario_producto_ia',
  'login_page': 'login_page',
  'pagina_login': 'login_page',
  'página de login híbrida': 'login_page',
  'hybridloginpage': 'login_page',
  'hybrid_login_page': 'login_page',
  'phoneidloginpage': 'phone_id_login_page',
  'phone_id_login_page': 'phone_id_login_page',
  'welcomepage': 'WelcomePage',
  'welcome_page': 'WelcomePage',
  'premiumwelcomesplash': 'WelcomePage',
  'premium_welcome_splash': 'WelcomePage',
  'scratchcardreward': 'ScratchCardReward',
  'scratch_card_reward': 'ScratchCardReward',
  'tarjeta_rasca_gana': 'ScratchCardReward',
  'interactivegoldpot': 'InteractiveGoldPot',
  'interactive_gold_pot': 'InteractiveGoldPot',
  'olla_oro_interactiva': 'InteractiveGoldPot',
  'ollaorointersctiva': 'InteractiveGoldPot',
  'alcancia_ahorradora': 'InteractiveGoldPot',
  'alcancía interactiva': 'InteractiveGoldPot',
  'order_tracking': 'order_tracking',
  'seguimiento_pedido': 'order_tracking',
  'seguimiento de pedido público': 'order_tracking',
  'catalog_filters': 'catalog_filters',
  'creador_filtros_catalogo': 'catalog_filters',
  'panel_filtros_catalogo': 'catalog_filters',
  'creador de filtros de catálogo': 'catalog_filters',
  'panel de filtros de catálogo': 'catalog_filters',
  'pwa_install_banner': 'pwa_install_banner',
  'banner_instalacion_pwa': 'pwa_install_banner',
  'banner de instalación pwa': 'pwa_install_banner',
  'deslizador_productos_similares': 'deslizador_productos_similares',
  'deslizadorproductossimilares': 'deslizador_productos_similares',
  'deslizador de productos similares': 'deslizador_productos_similares',
  'iconos_cuidado_prendas': 'iconos_cuidado_prendas',
  'iconosc cuidadoprendas': 'iconos_cuidado_prendas',
  'iconos de cuidado de prendas': 'iconos_cuidado_prendas',
  'pestanas_filtro_temporada': 'pestanas_filtro_temporada',
  'pestanasfiltrotemporada': 'pestanas_filtro_temporada',
  'pestañas de filtro por temporada': 'pestanas_filtro_temporada',
  'insignias_descuento_volumen': 'insignias_descuento_volumen',
  'insigniasdescuentovolumen': 'insignias_descuento_volumen',
  'insignias de descuento por volumen': 'insignias_descuento_volumen',
  
  'cargador_planos_cad': 'CargadorPlanosCAD',
  'cargadorplanoscad': 'CargadorPlanosCAD',
  'cargador de planos cad': 'CargadorPlanosCAD',
  'calculadora_cotizacion_mecanizado': 'CalculadoraCotizacionMecanizado',
  'calculadoracotizacionmecanizado': 'CalculadoraCotizacionMecanizado',
  'calculadora de cotización de mecanizado': 'CalculadoraCotizacionMecanizado',
  'selector_procesos_mecanizado': 'SelectorProcesosMecanizado',
  'selectorprocesosmecanizado': 'SelectorProcesosMecanizado',
  'selector de procesos de mecanizado': 'SelectorProcesosMecanizado',
  'selector_tratamiento_acabado': 'SelectorTratamientoAcabado',
  'selectortratamientoacabado': 'SelectorTratamientoAcabado',
  'selector de tratamiento y acabado': 'SelectorTratamientoAcabado',
  'reporte_control_calidad': 'ReporteControlCalidad',
  'reportecontrolcalidad': 'ReporteControlCalidad',
  'reporte de control de calidad': 'ReporteControlCalidad',

  'selector_especificacion_rosca': 'SelectorEspecificacionRosca',
  'selectorespecificacionrosca': 'SelectorEspecificacionRosca',
  'selector de especificación de rosca': 'SelectorEspecificacionRosca',
  'seguimiento_ordenes_produccion': 'SeguimientoOrdenesProduccion',
  'seguimientoordenesproduccion': 'SeguimientoOrdenesProduccion',
  'seguimiento de órdenes de producción': 'SeguimientoOrdenesProduccion',
  'calculadora_peso_materiales': 'CalculadoraPesoMateriales',
  'calculadorapesomateriales': 'CalculadoraPesoMateriales',
  'calculadora de peso de materiales': 'CalculadoraPesoMateriales',
  'selector_lotes_volumen': 'SelectorLotesVolumen',
  'selectorlotesvolumen': 'SelectorLotesVolumen',
  'selector de lotes y volumen': 'SelectorLotesVolumen',
  'formulario_solicitud_rectificacion': 'FormularioSolicitudRectificacion',
  'formulariosolicitudrectificacion': 'FormularioSolicitudRectificacion',
  'formulario de solicitud de rectificación': 'FormularioSolicitudRectificacion',

  'calculadora_carga_btu': 'CalculadoraCargaBTU',
  'calculadoracargabtu': 'CalculadoraCargaBTU',
  'calculadora de carga btu': 'CalculadoraCargaBTU',
  'selector_tipo_aire_acondicionado': 'SelectorTipoAireAcondicionado',
  'selectortipoaireacondicionado': 'SelectorTipoAireAcondicionado',
  'selector de tipo de aire acondicionado': 'SelectorTipoAireAcondicionado',
  'programador_mantenimiento_preventivo': 'ProgramadorMantenimientoPreventivo',
  'programadormantenimientopreventivo': 'ProgramadorMantenimientoPreventivo',
  'programador de mantenimiento preventivo': 'ProgramadorMantenimientoPreventivo',
  'estimador_ahorro_energetico': 'EstimadorAhorroEnergetico',
  'estimadorahorroenergetico': 'EstimadorAhorroEnergetico',
  'estimador de ahorro energético': 'EstimadorAhorroEnergetico',
  'estimador_ahorro_energia': 'EstimadorAhorroEnergetico',
  'estimadorahorroenergia': 'EstimadorAhorroEnergetico',
  'estimador de ahorro energía': 'EstimadorAhorroEnergetico',
  'selector_refrigerante_repuestos': 'SelectorRefrigeranteRepuestos',
  'selectorrefrigeranterepuestos': 'SelectorRefrigeranteRepuestos',
  'selector de refrigerante y repuestos': 'SelectorRefrigeranteRepuestos',

  'lista_diagnostico_fallas': 'ListaDiagnosticoFallas',
  'listadiagnosticofallas': 'ListaDiagnosticoFallas',
  'lista de diagnóstico de fallas': 'ListaDiagnosticoFallas',
  'tabla_especificaciones_hvac': 'TablaEspecificacionesHVAC',
  'tablaespecificacioneshvac': 'TablaEspecificacionesHVAC',
  'tabla de especificaciones hvac': 'TablaEspecificacionesHVAC',
  'selector_tramos_tuberia': 'SelectorTramosTuberia',
  'selectortramostuberia': 'SelectorTramosTuberia',
  'selector de tramos de tubería': 'SelectorTramosTuberia',
  'tarjeta_garantias_contratos': 'TarjetaGarantiaContratos',
  'tarjetagarantiascontratos': 'TarjetaGarantiaContratos',
  'tarjeta de garantías y contratos': 'TarjetaGarantiaContratos',
  'selector_termostatos_sensores': 'SelectorTermostatosSensores',
  'selectortermostatossensores': 'SelectorTermostatosSensores',
  'selector de termostatos y sensores': 'SelectorTermostatosSensores',

  'calculadora_presupuesto_obra': 'CalculadoraPresupuestoObra',
  'calculadorapresupuestoobra': 'CalculadoraPresupuestoObra',
  'calculadora de presupuesto de obra': 'CalculadoraPresupuestoObra',

  'selector_especialidad_contratistas': 'SelectorEspecialidadContratistas',
  'selectorespecialidadcontratistas': 'SelectorEspecialidadContratistas',
  'selector de especialidad de contratistas': 'SelectorEspecialidadContratistas',

  'bitacora_diaria_obra': 'BitacoraDiariaObra',
  'bitacoradiariaobra': 'BitacoraDiariaObra',
  'bitácora diaria de obra': 'BitacoraDiariaObra',

  'calculadora_dosificacion_concreto': 'CalculadoraDosificacionConcreto',
  'calculadoradosificacionconcreto': 'CalculadoraDosificacionConcreto',
  'calculadora de dosificación de concreto': 'CalculadoraDosificacionConcreto',

  'cronograma_hitos_proyecto': 'CronogramaHitosProyecto',
  'cronogramahitosproyecto': 'CronogramaHitosProyecto',
  'cronograma de hitos del proyecto': 'CronogramaHitosProyecto',

  'selector_alquiler_andamios': 'SelectorAlquilerAndamios',
  'selectoralquilerandamios': 'SelectorAlquilerAndamios',
  'selector de alquiler de andamios': 'SelectorAlquilerAndamios',

  'visor_planos_diseno': 'VisorPlanosDiseno',
  'visorplanosdiseno': 'VisorPlanosDiseno',
  'visor de planos de diseño': 'VisorPlanosDiseno',

  'solicitud_pedido_materiales': 'SolicitudPedidoMateriales',
  'solicitudpedidomateriales': 'SolicitudPedidoMateriales',
  'solicitud de pedido de materiales': 'SolicitudPedidoMateriales',

  'grafico_presupuesto_vs_gasto': 'GraficoPresupuestoVsGasto',
  'graficopresupuestovsgasto': 'GraficoPresupuestoVsGasto',
  'gráfico presupuesto vs gasto': 'GraficoPresupuestoVsGasto',

  'checklist_seguridad_epp': 'ChecklistSeguridadEPP',
  'checklistseguridadepp': 'ChecklistSeguridadEPP',
  'checklist de seguridad y epp': 'ChecklistSeguridadEPP',

  'calendario_rango_alquiler': 'CalendarioRangoAlquiler',
  'calendariorangoalquiler': 'CalendarioRangoAlquiler',
  'calendario de rango de alquiler': 'CalendarioRangoAlquiler',

  'calculadora_tarifas_alquiler': 'CalculadoraTarifasAlquiler',
  'calculadoratarifasalquiler': 'CalculadoraTarifasAlquiler',
  'calculadora de tarifas de alquiler': 'CalculadoraTarifasAlquiler',

  'checklist_inspeccion_maquinaria': 'ChecklistInspeccionMaquinaria',
  'checklistinspeccionmaquinaria': 'ChecklistInspeccionMaquinaria',
  'checklist de inspección de maquinaria': 'ChecklistInspeccionMaquinaria',

  'tarjetas_operadores_autorizados': 'TarjetasOperadoresAutorizados',
  'tarjetasoperadoresautorizados': 'TarjetasOperadoresAutorizados',
  'tarjetas de operadores autorizados': 'TarjetasOperadoresAutorizados',

  'calculadora_fletes_transporte': 'CalculadoraFletesTransporte',
  'calculadorafletestransporte': 'CalculadoraFletesTransporte',
  'calculadora de fletes y transporte': 'CalculadoraFletesTransporte',

  'selector_accesorios_maquinaria': 'SelectorAccesoriosMaquinaria',
  'selectoraccesoriosmaquinaria': 'SelectorAccesoriosMaquinaria',
  'selector de accesorios de maquinaria': 'SelectorAccesoriosMaquinaria',

  'monitor_horas_alertas': 'MonitorHorasAlertas',
  'monitorhorasalertas': 'MonitorHorasAlertas',
  'monitor de horas y alertas': 'MonitorHorasAlertas',

  'selector_seguro_danos': 'SelectorSeguroDanos',
  'selectorsegurodanos': 'SelectorSeguroDanos',
  'selector de seguro contra daños': 'SelectorSeguroDanos',

  'deslizador_capacidad_tonelaje': 'DeslizadorCapacidadTonelaje',
  'deslizadorcapacidadtonelaje': 'DeslizadorCapacidadTonelaje',
  'deslizador de capacidad y tonelaje': 'DeslizadorCapacidadTonelaje',

  'tarjeta_logistica_despacho': 'TarjetaLogisticaDespacho',
  'tarjetalogisticadespacho': 'TarjetaLogisticaDespacho',
  'tarjeta de logística de despacho': 'TarjetaLogisticaDespacho',

  'optimizador_corte_tableros': 'OptimizadorCorteTableros',
  'optimizadorcortetableros': 'OptimizadorCorteTableros',
  'optimizador de corte de tableros': 'OptimizadorCorteTableros',

  'selector_madera_acabado': 'SelectorMaderaAcabado',
  'selectormaderaacabado': 'SelectorMaderaAcabado',
  'selector de madera y acabado': 'SelectorMaderaAcabado',

  'calculadora_muebles_medida': 'CalculadoraMueblesMedida',
  'calculadoramueblesmedida': 'CalculadoraMueblesMedida',
  'calculadora de muebles a medida': 'CalculadoraMueblesMedida',

  'selector_herrajes_accesorios': 'SelectorHerrajesAccesorios',
  'selectorherrajesaccesorios': 'SelectorHerrajesAccesorios',
  'selector de herrajes y accesorios': 'SelectorHerrajesAccesorios',

  'tabla_despiece_materiales': 'TablaDespieceMateriales',
  'tabladespiecemateriales': 'TablaDespieceMateriales',
  'tabla de despiece de materiales': 'TablaDespieceMateriales',

  'agendamiento_toma_medidas': 'AgendamientoTomaMedidas',
  'agendamientotomamedidas': 'AgendamientoTomaMedidas',
  'agendamiento de toma de medidas': 'AgendamientoTomaMedidas',

  'selector_modulos_cocina': 'SelectorModulosCocina',
  'selectormoduloscocina': 'SelectorModulosCocina',
  'selector de módulos de cocina': 'SelectorModulosCocina',

  'galeria_renders_muebles': 'GaleriaRendersMuebles',
  'galeriarendersmuebles': 'GaleriaRendersMuebles',
  'galería de renders y muebles': 'GaleriaRendersMuebles',

  'selector_apertura_puertas': 'SelectorAperturaPuertas',
  'selectoraperturapuertas': 'SelectorAperturaPuertas',
  'selector de apertura de puertas': 'SelectorAperturaPuertas',

  'calculador_tarifa_instalacion': 'CalculadorTarifaInstalacion',
  'calculadortarifainstalacion': 'CalculadorTarifaInstalacion',
  'calculador de tarifa de instalación': 'CalculadorTarifaInstalacion',

  // 🧺 Vertical 7: Lavanderías y Tintorerías (Laundry)
  'selector_tipo_prenda_lavado': 'SelectorTipoPrendaLavado',
  'selectortipoprendalavado': 'SelectorTipoPrendaLavado',
  'selector de tipo de prenda de lavado': 'SelectorTipoPrendaLavado',
  'selector de tipo de prenda': 'SelectorTipoPrendaLavado',

  'calculadora_lavado_kilos': 'CalculadoraLavadoKilos',
  'calculadoralavadokilos': 'CalculadoraLavadoKilos',
  'calculadora de lavado por kilos': 'CalculadoraLavadoKilos',
  'calculadora lavado kilos': 'CalculadoraLavadoKilos',

  'programador_rutas_domicilio': 'ProgramadorRutasDomicilio',
  'programadorrutasdomicilio': 'ProgramadorRutasDomicilio',
  'programador de rutas de domicilio': 'ProgramadorRutasDomicilio',
  'programador rutas domicilio': 'ProgramadorRutasDomicilio',

  'ficha_reporte_manchas': 'FichaReporteManchas',
  'fichareportemanchas': 'FichaReporteManchas',
  'ficha de reporte de manchas': 'FichaReporteManchas',
  'ficha reporte manchas': 'FichaReporteManchas',

  'selector_fragancia_suavizante': 'SelectorFraganciaSuavizante',
  'selectorfraganciasuavizante': 'SelectorFraganciaSuavizante',
  'selector de fragancia y suavizante': 'SelectorFraganciaSuavizante',
  'selector fragancia suavizante': 'SelectorFraganciaSuavizante',

  'tarjeta_sesion_autoservicio': 'TarjetaSesionAutoservicio',
  'tarjetasesionautoservicio': 'TarjetaSesionAutoservicio',
  'tarjeta de sesión de autoservicio': 'TarjetaSesionAutoservicio',
  'tarjeta sesion autoservicio': 'TarjetaSesionAutoservicio',

  'buscador_percheros_ropa': 'BuscadorPercherosRopa',
  'buscadorpercherosropa': 'BuscadorPercherosRopa',
  'buscador de percheros de ropa': 'BuscadorPercherosRopa',
  'buscador percheros ropa': 'BuscadorPercherosRopa',

  'selector_velocidad_servicio': 'SelectorVelocidadServicio',
  'selectorvelocidadservicio': 'SelectorVelocidadServicio',
  'selector de velocidad de servicio': 'SelectorVelocidadServicio',
  'selector velocidad servicio': 'SelectorVelocidadServicio',

  'saldo_puntos_fidelizacion': 'SaldoPuntosFidelizacion',
  'saldopuntosfidelizacion': 'SaldoPuntosFidelizacion',
  'saldo de puntos y fidelización': 'SaldoPuntosFidelizacion',
  'saldo puntos fidelizacion': 'SaldoPuntosFidelizacion',

  'cuadricula_prendas_olvidas': 'CuadriculaPrendasOlvidas',
  'cuadriculaprendasolvidas': 'CuadriculaPrendasOlvidas',
  'cuadrícula de prendas olvidadas': 'CuadriculaPrendasOlvidas',
  'cuadricula prendas olvidadas': 'CuadriculaPrendasOlvidas',
  'cuadricula_prendas_olvidadas': 'CuadriculaPrendasOlvidas',

  // 🛋️ Vertical 8: Tapicería y Restauración de Muebles (Furniture Repair)
  'selector_telas_texturas': 'SelectorTelasTexturas',
  'selectortelastexturas': 'SelectorTelasTexturas',
  'selector de telas y texturas': 'SelectorTelasTexturas',
  'selector telas texturas': 'SelectorTelasTexturas',

  'calculadora_metraje_tela': 'CalculadoraMetrajeTela',
  'calculadorametrajetela': 'CalculadoraMetrajeTela',
  'calculadora de metraje de tela': 'CalculadoraMetrajeTela',
  'calculadora metraje tela': 'CalculadoraMetrajeTela',

  'selector_densidad_espuma': 'SelectorDensidadEspuma',
  'selectordensidadespuma': 'SelectorDensidadEspuma',
  'selector de densidad de espuma y resortes': 'SelectorDensidadEspuma',
  'selector de densidad de espuma': 'SelectorDensidadEspuma',
  'selector densidad espuma': 'SelectorDensidadEspuma',

  'cargador_fotos_restauracion': 'CargadorFotosRestauracion',
  'cargadorfotosrestauracion': 'CargadorFotosRestauracion',
  'cargador de fotos de restauración': 'CargadorFotosRestauracion',
  'cargador fotos restauracion': 'CargadorFotosRestauracion',

  'selector_acabado_patas': 'SelectorAcabadoPatas',
  'selectoracabadopatas': 'SelectorAcabadoPatas',
  'selector de acabado de patas': 'SelectorAcabadoPatas',
  'selector acabado patas': 'SelectorAcabadoPatas',

  'seguimiento_fases_restauracion': 'SeguimientoFasesRestauracion',
  'seguimientofasesrestauracion': 'SeguimientoFasesRestauracion',
  'seguimiento de fases de restauración': 'SeguimientoFasesRestauracion',
  'seguimiento fases restauracion': 'SeguimientoFasesRestauracion',

  'selector_estilo_costuras': 'SelectorEstiloCosturas',
  'selectorestilocosturas': 'SelectorEstiloCosturas',
  'selector de estilo de costuras': 'SelectorEstiloCosturas',
  'selector estilo costuras': 'SelectorEstiloCosturas',

  'calculadora_flete_muebles': 'CalculadoraFleteMuebles',
  'calculadorafletemuebles': 'CalculadoraFleteMuebles',
  'calculadora de flete de muebles': 'CalculadoraFleteMuebles',
  'calculadora flete muebles': 'CalculadoraFleteMuebles',

  'manual_cuidado_tapiceria': 'ManualCuidadoTapiceria',
  'manualcuidadotapiceria': 'ManualCuidadoTapiceria',
  'manual de cuidado de tapicería': 'ManualCuidadoTapiceria',
  'manual cuidado tapiceria': 'ManualCuidadoTapiceria',

  'toggle_impermeabilizacion': 'ToggleImpermeabilizacion',
  'toggleimpermeabilizacion': 'ToggleImpermeabilizacion',
  'toggle de impermeabilización': 'ToggleImpermeabilizacion',
  'toggle impermeabilizacion': 'ToggleImpermeabilizacion',

  // --- Vertical 9: Estética, Podología y Bienestar ---
  'historial_clinico_podologia': 'HistorialClinicoPodologia',
  'historialclinicopodologia': 'HistorialClinicoPodologia',
  'historial clínico podología': 'HistorialClinicoPodologia',
  'mapa_anatomico_pie': 'MapaAnatomicoPie',
  'mapaanatomicopie': 'MapaAnatomicoPie',
  'mapa anatómico del pie': 'MapaAnatomicoPie',
  'selector_servicio_cabina': 'SelectorServicioCabina',
  'selectorserviciocabina': 'SelectorServicioCabina',
  'selector de servicio y cabina': 'SelectorServicioCabina',
  'selector_profesional_staff': 'SelectorProfesionalStaff',
  'selectorprofesionalstaff': 'SelectorProfesionalStaff',
  'selector de profesional y staff': 'SelectorProfesionalStaff',
  'consentimiento_firma_digital': 'ConsentimientoFirmaDigital',
  'consentimientofirmadigital': 'ConsentimientoFirmaDigital',
  'consentimiento informado y firma digital': 'ConsentimientoFirmaDigital',
  'selector_aceites_esenciales': 'SelectorAceitesEsenciales',
  'selectoraceitesesenciales': 'SelectorAceitesEsenciales',
  'selector de aceites esenciales': 'SelectorAceitesEsenciales',
  'registro_esterilizacion_autoclave': 'RegistroEsterilizacionAutoclave',
  'registroesterilizacionautoclave': 'RegistroEsterilizacionAutoclave',
  'registro de esterilización en autoclave': 'RegistroEsterilizacionAutoclave',
  'programador_sesiones_paquete': 'ProgramadorSesionesPaquete',
  'programadorsesionespaquete': 'ProgramadorSesionesPaquete',
  'programador de sesiones en paquete': 'ProgramadorSesionesPaquete',
  'tarjetas_productos_post_cuidado': 'TarjetasProductosPostCuidado',
  'tarjetasproductospostcuidado': 'TarjetasProductosPostCuidado',
  'tarjetas de productos para post-cuidado': 'TarjetasProductosPostCuidado',
  'visor_analisis_pisada': 'VisorAnalisisPisada',
  'visoranalisispisada': 'VisorAnalisisPisada',
  'visor de análisis de pisada': 'VisorAnalisisPisada',

  // --- Vertical 10: Minimarkets y Alimentos ---
  'selector_cantidad_granel': 'SelectorCantidadGranel',
  'selectorcantidadgranel': 'SelectorCantidadGranel',
  'selector de cantidad a granel': 'SelectorCantidadGranel',
  'alerta_vencimiento_lotes': 'AlertaVencimientoLotes',
  'alertavencimientolotes': 'AlertaVencimientoLotes',
  'alerta de vencimiento de lotes': 'AlertaVencimientoLotes',
  'buscador_codigo_plu': 'BuscadorCodigoPLU',
  'buscadorcodigoplu': 'BuscadorCodigoPLU',
  'buscador de código plu': 'BuscadorCodigoPLU',
  'buscador de codigo plu': 'BuscadorCodigoPLU',
  'calculadora_combos_ofertas': 'CalculadoraCombosOfertas',
  'calculadoracombosofertas': 'CalculadoraCombosOfertas',
  'calculadora de combos y ofertas': 'CalculadoraCombosOfertas',
  'formulario_abastecimiento_gondolas': 'FormularioAbastecimientoGondolas',
  'formularioabastecimientogondolas': 'FormularioAbastecimientoGondolas',
  'formulario de abastecimiento de góndolas': 'FormularioAbastecimientoGondolas',
  'formulario de abastecimiento de gondolas': 'FormularioAbastecimientoGondolas',
  'selector_horarios_retiro': 'SelectorHorariosRetiro',
  'selectorhorariosretiro': 'SelectorHorariosRetiro',
  'selector de horarios de retiro y entrega': 'SelectorHorariosRetiro',
  'selector de horarios de retiro': 'SelectorHorariosRetiro',
  'advertencia_nutricional_alergenos': 'AdvertenciaNutricionalAlergenos',
  'advertencianutricionalalergenos': 'AdvertenciaNutricionalAlergenos',
  'advertencia nutricional y alérgenos': 'AdvertenciaNutricionalAlergenos',
  'advertencia nutricional y alergenos': 'AdvertenciaNutricionalAlergenos',
  'formulario_mermas_desperdicios': 'FormularioMermasDesperdicios',
  'formulariomermasdesperdicios': 'FormularioMermasDesperdicios',
  'formulario de mermas y desperdicios': 'FormularioMermasDesperdicios',
  'plantilla_compras_recurrentes': 'PlantillaComprasRecurrentes',
  'plantillacomprasrecurrentes': 'PlantillaComprasRecurrentes',
  'plantilla de compras recurrentes': 'PlantillaComprasRecurrentes',
  'plantillas de compras recurrentes': 'PlantillaComprasRecurrentes',
  'cuadricula_ofertas_dia': 'CuadriculaOfertasDia',
  'cuadriculaofertasdia': 'CuadriculaOfertasDia',
  'cuadrícula de ofertas del día': 'CuadriculaOfertasDia',
  'cuadricula de ofertas del dia': 'CuadriculaOfertasDia',

  // --- Vertical 11: Insumos y Repuestos Agrícolas ---
  'buscador_compatibilidad_insumos': 'BuscadorCompatibilidadInsumos',
  'buscadorcompatibilidadinsumos': 'BuscadorCompatibilidadInsumos',
  'buscador de compatibilidad de insumos': 'BuscadorCompatibilidadInsumos',
  'calculadora_rendimiento_dosificacion': 'CalculadoraRendimientoDosificacion',
  'calculadorarendimientodosificacion': 'CalculadoraRendimientoDosificacion',
  'calculadora de rendimiento y dosificación': 'CalculadoraRendimientoDosificacion',
  'formulario_pedido_mayorista': 'FormularioPedidoMayorista',
  'formulariopedidomayorista': 'FormularioPedidoMayorista',
  'formulario de pedido mayorista agrícola': 'FormularioPedidoMayorista',

  // --- Vertical 12: Alimentos Artesanales y Repostería ---
  'configurador_pasteles_eventos': 'ConfiguradorPastelesEventos',
  'configuradorpasteleseventos': 'ConfiguradorPastelesEventos',
  'configurador de pasteles para eventos': 'ConfiguradorPastelesEventos',
  'bloqueador_calendario_entregas': 'BloqueadorCalendarioEntregas',
  'bloqueadorcalendarioentregas': 'BloqueadorCalendarioEntregas',
  'bloqueador y agenda de entregas': 'BloqueadorCalendarioEntregas',
  'modulo_presupuesto_mesas_dulces': 'ModuloPresupuestoMesasDulces',
  'modulopresupuestomesasdulces': 'ModuloPresupuestoMesasDulces',
  'cotizador de mesas de postres': 'ModuloPresupuestoMesasDulces',

  // --- ProtoCharts: Biblioteca SVG Zero-Deps ---
  'proto_charts': 'ProtoCharts',
  'protocharts': 'ProtoCharts',
  'protocharts — biblioteca svg de visualización (protocharts)': 'ProtoCharts',
  'biblioteca svg de visualización': 'ProtoCharts',
  'protocharts svg': 'ProtoCharts',
  'gráficas svg': 'ProtoCharts',
  'kpi cards': 'ProtoCharts',
  'sparkline': 'ProtoCharts',
  'area chart': 'ProtoCharts',
  'bar chart svg': 'ProtoCharts',

  // --- Hub de Iconos Atómicos de Marca ---
  'brandicons': 'BrandIcons',
  'brand_icons': 'BrandIcons',
  'iconos_marca': 'BrandIcons',
  'hub de iconos de marca': 'BrandIcons'
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
    if (str.includes('interactivefortune') || str.includes('interactive_fortune') || str.includes('fortunewheel') || str.includes('fortune_wheel') || (str.includes('fortuna') && str.includes('premium')) || (str.includes('ruleta') && str.includes('interactiv'))) return 'interactive_fortune_wheel';
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

class SandboxErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[SandboxErrorBoundary] Capturado error de renderizado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 border border-red-500/20 bg-red-500/5 rounded-3xl space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-red-400">Error en Sandbox</h3>
          </div>
          <div className="text-center max-w-md space-y-2">
            <p className="text-xs font-bold text-[var(--color-text)]">
              El componente ha fallado al renderizarse en runtime.
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
              Esto suele deberse a llamadas de props faltantes, estados indefinidos o efectos secundarios incompatibles con el entorno aislado.
            </p>
          </div>
          {this.state.error && (
            <div className="w-full max-w-lg p-4 bg-slate-900 rounded-2xl border border-slate-800 text-left overflow-auto font-mono text-[9px] text-red-300 max-h-[180px]">
              <p className="font-bold mb-1">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre className="whitespace-pre-wrap leading-relaxed opacity-80">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="px-4 py-2 bg-red-650 hover:bg-red-550 border border-red-500/30 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            Reintentar Renderizado
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ComponentSandbox({ componentName = '', technicalName = '', componentLink = '' }) {
  const normalizedName = componentName.toLowerCase().trim();
  const [scaffolding, setScaffolding] = useState(false);
  const [scaffoldDone, setScaffoldDone] = useState(false);

  const [Comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sandboxKey = getSandboxKey(componentName, technicalName);
  const candidates = useMemo(() => {
    const list = [];
    if (technicalName) {
      list.push(`${technicalName}Sandbox.jsx`);
    }
    if (sandboxKey) {
      list.push(`${snakeToPascal(sandboxKey)}Sandbox.jsx`);
    }
    return list;
  }, [technicalName, sandboxKey]);

  useEffect(() => {
    let active = true;
    const loadSandbox = async () => {
      setLoading(true);
      setError(null);
      setComp(null);

      let resolvedPath = null;
      let importer = null;

      for (const candidate of candidates) {
        const matchingPath = Object.keys(sandboxModules).find(path => 
          path.toLowerCase().endsWith(`/${candidate.toLowerCase()}`)
        );
        if (matchingPath) {
          resolvedPath = matchingPath;
          importer = sandboxModules[matchingPath];
          break;
        }
      }

      if (!importer) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        const mod = await importer();
        if (active) {
          setComp(() => mod.default);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadSandbox();
    return () => { active = false; };
  }, [candidates, scaffoldDone]);

  const handleCreateSandbox = async () => {
    if (!technicalName || !componentLink) return;
    setScaffolding(true);
    try {
      const res = await fetch(`${CLI_URL}/api/library/sandbox/scaffold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentLink,
          technicalName
        })
      });
      const data = await res.json();
      if (data.success) {
        setScaffoldDone(true);
      } else {
        alert(data.error || 'No se pudo crear el sandbox.');
      }
    } catch (err) {
      alert(`Error al contactar con el servidor CLI: ${err.message}`);
    } finally {
      setScaffolding(false);
    }
  };

  const meta = COMPONENT_META[normalizedName] || null;

  if (loading) return <LoaderSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] p-6 space-y-4">
        <div className="text-center text-red-400 text-xs font-bold">Error en Sandbox</div>
        <p className="text-[10px] text-slate-400 text-center max-w-sm">{error}</p>
      </div>
    );
  }

  if (!Comp) {
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
              : 'Este componente aún no tiene un playground interactivo asignado. ¿Deseas autogenerar un playground en blanco para probarlo?'}
          </p>
        </div>

        {!meta && technicalName && (
          <button
            onClick={handleCreateSandbox}
            disabled={scaffolding}
            className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-550 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer shadow-lg shadow-indigo-650/15"
          >
            {scaffolding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            {scaffolding ? 'Generando Playground...' : 'Crear Playground Sandbox'}
          </button>
        )}

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
          <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
            {Object.keys(sandboxModules).map(k => {
              const name = k.split('/').pop().replace('Sandbox.jsx', '');
              return (
                <div key={k} className="px-2.5 py-1.5 bg-indigo-600/8 border border-indigo-500/15 rounded-xl text-[9px] text-indigo-400/70 font-mono text-center">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <SandboxErrorBoundary key={`${technicalName}-${scaffoldDone}`}>
        <Comp />
      </SandboxErrorBoundary>
    </div>
  );
}
