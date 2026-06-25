import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDevStore } from '../../stores/devStore';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import useToast from '../../hooks/useToast';
import { useAlertConfirm } from '../../components/common/AlertConfirmContext';
import { 
  Sparkles, Plus, ChevronRight, ChevronDown, Server, Palette, Settings, Database,
  ArrowLeft, RefreshCw, Play, CheckCircle, Copy, AlertCircle, Check 
} from 'lucide-react';
import CustomSelect from '../../components/ui/CustomSelect';
import Pagination from '../../components/ui/Pagination';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { CLI_URL } from '../../config/constants';

// --- CONFIGURACIÓN CENTRAL LOCAL ---
const CENTRAL_CONFIG = {
  apiKey:            import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY            || '',
  authDomain:        import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID             || ''
};

// --- INTERACTIVE AMBIENT GLOW COMPONENT ---
function InteractiveAmbientGlow({
  color1 = 'var(--color-primary)',
  color2 = 'var(--color-accent)',
  color3 = '#ec4899',
  sensitivity = 0.05,
  className = ''
}) {
  const containerRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isPointerActiveRef = useRef(false);
  const gyroRef = useRef({ x: 0, y: 0 });
  const [glowOffset, setGlowOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!containerRef.current) return;
      isPointerActiveRef.current = true;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      mousePosRef.current = { x, y };
    };

    const handlePointerLeave = () => {
      isPointerActiveRef.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
      container.addEventListener('pointerup', handlePointerLeave);
    }

    const handleOrientation = (e) => {
      if (e.beta !== null && e.gamma !== null) {
        const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
        const clampedBeta = Math.max(-45, Math.min(45, e.beta - 45));
        gyroRef.current = { x: clampedGamma, y: clampedBeta };
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      if (container) {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
        container.removeEventListener('pointerup', handlePointerLeave);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;

    const updatePosition = () => {
      setGlowOffset((prev) => {
        if (!isPointerActiveRef.current) {
          mousePosRef.current.x += (0 - mousePosRef.current.x) * 0.05;
          mousePosRef.current.y += (0 - mousePosRef.current.y) * 0.05;
        }

        const pointerTargetX = mousePosRef.current.x * sensitivity * 12;
        const pointerTargetY = mousePosRef.current.y * sensitivity * 12;

        const gyroTargetX = gyroRef.current.x * sensitivity * 40;
        const gyroTargetY = gyroRef.current.y * sensitivity * 40;

        const targetX = pointerTargetX + gyroTargetX;
        const targetY = pointerTargetY + gyroTargetY;

        const nextX = prev.x + (targetX - prev.x) * 0.08;
        const nextY = prev.y + (targetY - prev.y) * 0.08;
        return { x: nextX, y: nextY };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [sensitivity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden bg-[var(--color-bg)] z-0 transition-colors duration-500 rounded-3xl ${className}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        style={{ transform: `translate3d(${glowOffset.x * 1.2}px, ${glowOffset.y * 1.2}px, 0)` }}
        className="absolute w-[620px] h-[580px] top-[-20%] left-[-5%] pointer-events-none will-change-transform z-1"
      >
        <div style={{ backgroundColor: color1, animation: 'floatBlob1 25s ease-in-out infinite, morphBlob1 18s ease-in-out infinite' }} className="w-full h-full blur-[45px] opacity-70" />
      </div>

      <div 
        style={{ transform: `translate3d(${glowOffset.x * -0.9}px, ${glowOffset.y * -0.9}px, 0)` }}
        className="absolute w-[580px] h-[560px] bottom-[-20%] right-[-5%] pointer-events-none will-change-transform z-1"
      >
        <div style={{ backgroundColor: color2, animation: 'floatBlob2 30s ease-in-out infinite, morphBlob2 22s ease-in-out infinite' }} className="w-full h-full blur-[50px] opacity-65" />
      </div>

      <div 
        style={{ transform: `translate3d(${glowOffset.y * 0.8}px, ${glowOffset.x * 0.8}px, 0)` }}
        className="absolute w-[420px] h-[380px] top-[20%] left-[35%] pointer-events-none will-change-transform z-1"
      >
        <div style={{ backgroundColor: color3, animation: 'floatBlob3 20s ease-in-out infinite, morphBlob3 14s ease-in-out infinite' }} className="w-full h-full blur-[40px] opacity-55" />
      </div>

      <div 
        style={{ transform: `translate3d(${glowOffset.x * 0.6}px, ${glowOffset.y * -0.6}px, 0)` }}
        className="absolute w-[370px] h-[340px] top-[-5%] right-[15%] pointer-events-none will-change-transform z-1"
      >
        <div style={{ backgroundColor: color2, animation: 'floatBlob4 35s ease-in-out infinite, morphBlob4 26s ease-in-out infinite' }} className="w-full h-full blur-[55px] opacity-45" />
      </div>

      <div className="absolute inset-0 backdrop-blur-[20px] bg-[var(--color-bg)]/10 z-2 pointer-events-none" />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.12); }
          66% { transform: translate(-30px, 30px) scale(0.92); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-55px, 45px) scale(0.93); }
        }
        @keyframes floatBlob3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); }
          50% { transform: translate(45px, 55px) scale(1.18); }
        }
        @keyframes floatBlob4 {
          0%, 100% { transform: translate(0, 0) scale(1.05); }
          40% { transform: translate(35px, 50px) scale(0.9); }
          80% { transform: translate(-25px, -35px) scale(1.1); }
        }
        @keyframes morphBlob1 {
          0%   { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
          20%  { border-radius: 40% 60% 30% 70% / 65% 35% 55% 45%; }
          40%  { border-radius: 70% 30% 50% 50% / 40% 60% 70% 30%; }
          60%  { border-radius: 35% 65% 60% 40% / 55% 45% 35% 65%; }
          80%  { border-radius: 55% 45% 40% 60% / 30% 70% 50% 50%; }
          100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
        }
        @keyframes morphBlob2 {
          0%   { border-radius: 50% 50% 35% 65% / 60% 40% 70% 30%; }
          25%  { border-radius: 70% 30% 55% 45% / 40% 60% 30% 70%; }
          50%  { border-radius: 40% 60% 65% 35% / 70% 30% 50% 50%; }
          75%  { border-radius: 65% 35% 45% 55% / 35% 65% 60% 40%; }
          100% { border-radius: 50% 50% 35% 65% / 60% 40% 70% 30%; }
        }
        @keyframes morphBlob3 {
          0%   { border-radius: 45% 55% 60% 40% / 55% 45% 35% 65%; }
          30%  { border-radius: 65% 35% 40% 60% / 30% 70% 65% 35%; }
          60%  { border-radius: 35% 65% 55% 45% / 70% 30% 45% 55%; }
          100% { border-radius: 45% 55% 60% 40% / 55% 45% 35% 65%; }
        }
        @keyframes morphBlob4 {
          0%   { border-radius: 55% 45% 50% 50% / 40% 60% 55% 45%; }
          35%  { border-radius: 40% 60% 65% 35% / 60% 40% 35% 65%; }
          65%  { border-radius: 70% 30% 45% 55% / 50% 50% 65% 35%; }
          100% { border-radius: 55% 45% 50% 50% / 40% 60% 55% 45%; }
        }
      `}} />
    </div>
  );
}

// --- CONSTANTES DE COLOR ---
const PALETTE_CATEGORIES = [
  {
    id: "retail_clothing",
    name: "🛍️ Ropa y Retail Tradicional",
    palettes: [
      { name: 'Royal Indigo', primary: '#6366f1', secondary: '#a855f7', bg: '#070b13', text: '#f8fafc' },
      { name: 'Soft Rose', primary: '#f43f5e', secondary: '#fb7185', bg: '#0f0507', text: '#fff1f2' },
      { name: 'Elegant Lilac', primary: '#8b5cf6', secondary: '#d8b4fe', bg: '#0a0410', text: '#fdf4ff' },
      { name: 'Nordic Sage', primary: '#14b8a6', secondary: '#99f6e4', bg: '#05100f', text: '#f0fdfa' },
      { name: 'Midnight Chic', primary: '#f43f5e', secondary: '#ec4899', bg: '#09090b', text: '#fafafa' },
      { name: 'Luxury Gold', primary: '#d97706', secondary: '#fde047', bg: '#110d06', text: '#fefdfa' },
      { name: 'Classic Denim', primary: '#2563eb', secondary: '#93c5fd', bg: '#0a1128', text: '#f0fdfa' }
    ]
  }
];

// --- FUNCIONES DE CONTRASTE ---
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
  let cleaned = hex.trim().replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) return { r: 0, g: 0, b: 0 };
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getRelativeLuminance(rgb) {
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function getContrastFeedback(ratio) {
  if (ratio >= 7) return { text: 'AAA (Excelente)', badgeClass: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400', isPass: true };
  if (ratio >= 4.5) return { text: 'AA (Óptimo)', badgeClass: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400', isPass: true };
  if (ratio >= 3) return { text: 'AA Grande (Regular)', badgeClass: 'bg-amber-500/10 border border-amber-500/20 text-amber-400', isPass: true };
  return { text: 'Fail (Bajo Contraste)', badgeClass: 'bg-red-500/10 border border-red-500/20 text-red-400', isPass: false };
}

export default function OnboardingPage() {
  const { 
    clientesSaas, 
    setClientesSaas, 
    reports, 
    setReports, 
    failures, 
    telemetryTokens, 
    setTelemetryTokens, 
    isSimulated, 
    addLog 
  } = useDevStore();

  const { showToast } = useToast();
  const { showConfirm } = useAlertConfirm();
  const [isCopied, copy] = useCopyToClipboard();

  // Estados Onboarding Wizard
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [wizardTab, setWizardTab] = useState('server');
  
  // Variables de Servidor
  const [newClientName, setNewClientName] = useState('');
  const [billingMode, setBillingMode] = useState('percentage');
  const [comisionPorcentaje, setComisionPorcentaje] = useState(1.5);
  const [montoFijoServicio, setMontoFijoServicio] = useState(500);
  const [pagoMensualFijo, setPagoMensualFijo] = useState(50000);
  const [targetPath, setTargetPath] = useState('');
  const [templates, setTemplates] = useState([
    { id: 'template-core-seed', name: 'Crear desde cero' }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState('template-core-seed');
  const [autoProvisionFirebase, setAutoProvisionFirebase] = useState(false);
  
  // Variables Firebase
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbAuthDomain, setFbAuthDomain] = useState('');
  const [fbStorageBucket, setFbStorageBucket] = useState('');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState('');
  const [fbAppId, setFbAppId] = useState('');
  const [fbVapidKey, setFbVapidKey] = useState('');
  const [isFetchingConfig, setIsFetchingConfig] = useState(false);
  const [isValidatingCredentials, setIsValidatingCredentials] = useState(false);
  const [credentialsValidationError, setCredentialsValidationError] = useState(null);
  const [isCredentialsValidated, setIsCredentialsValidated] = useState(false);

  // Variables Branding
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#a855f7');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [textColor, setTextColor] = useState('#f8fafc');
  const [surfaceColor, setSurfaceColor] = useState('#ffffff');
  const [surface2Color, setSurface2Color] = useState('#f1f5f9');
  const [borderColor, setBorderColor] = useState('#cbd5e1');
  const [textMutedColor, setTextMutedColor] = useState('#475569');
  const [radiusBase, setRadiusBase] = useState('0.75rem');
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);
  const [googleFont, setGoogleFont] = useState('Inter');
  const [expandedPaletteCategory, setExpandedPaletteCategory] = useState('retail_clothing');
  const [logoFilename, setLogoFilename] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoLocalPath, setLogoLocalPath] = useState('');

  // Variables Módulos
  const [niche, setNiche] = useState('retail_clothing');
  const [enableGithub, setEnableGithub] = useState(true);
  const [enableFirebaseDeploy, setEnableFirebaseDeploy] = useState(true);
  const [enablePwa, setEnablePwa] = useState(true);
  const [enablePush, setEnablePush] = useState(true);
  const [enableBilling, setEnableBilling] = useState(true);
  const [enableDianBilling, setEnableDianBilling] = useState(true);
  const [costoPorFacturaDian, setCostoPorFacturaDian] = useState(150);
  const [customRequirements, setCustomRequirements] = useState('');
  const [selectedRecomendations, setSelectedRecomendations] = useState([]);
  const [libraryList, setLibraryList] = useState([]);

  // Variables de Envío
  const [isRegistering, setIsRegistering] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [pendingCliProvisioning, setPendingCliProvisioning] = useState(null);

  // Historial y paginación
  const [showArchivedHistory, setShowArchivedHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Carga inicial
  useEffect(() => {
    // 1. Cargar plantillas
    fetch(`${CLI_URL}/api/templates`)
      .then(res => res.json())
      .then(data => {
        const seedTemplate = { id: 'template-core-seed', name: 'Crear desde cero' };
        const templatesArray = data && Array.isArray(data.templates) ? data.templates : (Array.isArray(data) ? data : []);
        if (templatesArray.length > 0) {
          const list = templatesArray.some(t => (t.id || t) === 'template-core-seed')
            ? templatesArray
            : [seedTemplate, ...templatesArray];
          setTemplates(list);
          if (list.length > 0 && !list.some(t => (t.id || t) === selectedTemplate)) {
            setSelectedTemplate(list[0].id || list[0]);
          }
        } else {
          setTemplates([
            seedTemplate,
            { id: 'template-ventas', name: 'Plantilla de Ventas Base (Local)' }
          ]);
        }
      })
      .catch(err => {
        console.warn("No se pudo cargar plantillas del backend CLI, usando fallback:", err);
        setTemplates([
          { id: 'template-core-seed', name: 'Crear desde cero' },
          { id: 'template-ventas', name: 'Plantilla de Ventas Base (Local)' }
        ]);
      });

    // 2. Cargar catálogo de biblioteca para recomendaciones
    fetch(`${CLI_URL}/api/library`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.categories)) {
          setLibraryList(data.categories);
        }
      })
      .catch(err => console.warn("No se pudo cargar catálogo de la biblioteca para recomendaciones:", err));
  }, []);

  const handleBgColorChange = (hex) => {
    setBgColor(hex);
    const c = (hex || '#000000').replace('#', '');
    const rgb = parseInt(c, 16) || 0;
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const dark = luma < 128;
    setSurfaceColor(dark ? '#1a1a1a' : '#ffffff');
    setSurface2Color(dark ? '#252525' : '#f1f5f9');
    setBorderColor(dark ? '#333333' : '#e2e8f0');
    setTextMutedColor(dark ? '#a0a0a0' : '#64748b');
  };

  const handleClientNameChange = (val) => {
    setNewClientName(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setTargetPath(val.trim() ? `D:\\PROTOTIPE\\Instancias Clientes\\App-${slug}` : '');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target.result.split(',')[1];
      setLogoFilename(file.name);
      setLogoBase64(base64Str);
      
      try {
        addLog(`Subiendo y optimizando logo: ${file.name}...`, "info");
        const res = await fetch(`${CLI_URL}/api/upload-logo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64: base64Str })
        });
        const data = await res.json();
        if (data.success) {
          setLogoLocalPath(data.filePath);
          showToast(data.message, { type: 'success' });
          addLog(`Logo procesado con éxito en el servidor. Ruta física: ${data.filePath}`, "info");
        } else {
          showToast(`Error al procesar logo: ${data.error}`, { type: 'error' });
        }
      } catch (err) {
        showToast(`Fallo al conectar con el optimizador: ${err.message}`, { type: 'error' });
      }
    };
    reader.readAsDataURL(file);
  };

  const validateFirebaseCreds = async () => {
    if (!fbApiKey.trim() || !fbProjectId.trim()) return;
    setIsValidatingCredentials(true);
    setCredentialsValidationError(null);
    setIsCredentialsValidated(false);
    try {
      const res = await fetch(`${CLI_URL}/api/firebase/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: fbApiKey.trim(), projectId: fbProjectId.trim() })
      });
      const data = await res.json();
      if (data.valid) {
        setIsCredentialsValidated(true);
        showToast(data.warning || 'Credenciales de Firebase validadas con éxito.', { type: 'success' });
      } else {
        setCredentialsValidationError(data.error);
        showToast(data.error, { type: 'warning' });
      }
    } catch (err) {
      setCredentialsValidationError(`Error de red: ${err.message}`);
    } finally {
      setIsValidatingCredentials(false);
    }
  };

  const handleAutoDetectConfig = async () => {
    const cleanProjectId = fbProjectId.trim();
    if (!cleanProjectId) {
      showToast('Ingresa primero el Firebase Project ID para auto-detectar', { type: 'error' });
      return;
    }
    setIsFetchingConfig(true);
    setIsCredentialsValidated(false);
    setCredentialsValidationError(null);
    addLog(`Auto-detectando credenciales Firebase para proyecto: ${cleanProjectId}...`, 'info');
    try {
      const res = await fetch(
        `${CLI_URL}/api/firebase-config?projectId=${encodeURIComponent(cleanProjectId)}&projectName=${encodeURIComponent((newClientName || '').trim() || cleanProjectId)}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error desconocido del servidor CLI.');
      }
      const { config, vapidKey } = data;
      setFbApiKey((config.apiKey || '').trim());
      setFbAuthDomain((config.authDomain || '').trim());
      setFbStorageBucket((config.storageBucket || '').trim());
      setFbMessagingSenderId((config.messagingSenderId || '').trim());
      setFbAppId((config.appId || '').trim());
      if (vapidKey) {
        setFbVapidKey(vapidKey);
      }
      addLog(`✓ Credenciales Firebase auto-detectadas y cargadas para ${cleanProjectId}.`, 'success');
      showToast('Configuración de Firebase auto-detectada y rellenada ✓', { type: 'success' });
    } catch (err) {
      console.error('Auto-detect error:', err);
      addLog(`Error al auto-detectar config Firebase: ${err.message}`, 'error');
      showToast(`CLI offline o error: ${err.message}. Copia las credenciales manualmente.`, { type: 'error' });
    } finally {
      setIsFetchingConfig(false);
    }
  };

  const handleArchiveClient = async (clientId) => {
    if (isSimulated) {
      setClientesSaas(clientesSaas.map(c => c.id.toLowerCase() === clientId.toLowerCase() ? { ...c, archived: true } : c));
      addLog(`[Sandbox] Cliente ${clientId} archivado localmente.`, "success");
      showToast(`Cliente ${clientId} archivado (Sandbox)`, { type: 'success' });
      return;
    }

    try {
      const clientRef = doc(db, 'clientes_control', clientId.toLowerCase());
      await updateDoc(clientRef, { archived: true });
      addLog(`[Firestore] Cliente ${clientId} archivado en Firestore central.`, "success");
      showToast(`Cliente ${clientId} archivado correctamente`, { type: 'success' });
    } catch (err) {
      console.error(err);
      addLog(`Error al archivar cliente ${clientId}: ${err.message}`, "error");
      showToast(`Error al archivar cliente: ${err.message}`, { type: 'error' });
    }
  };

  const handleUnarchiveClient = async (clientId) => {
    if (isSimulated) {
      setClientesSaas(clientesSaas.map(c => c.id.toLowerCase() === clientId.toLowerCase() ? { ...c, archived: false } : c));
      addLog(`[Sandbox] Cliente ${clientId} desarchivado localmente.`, "success");
      showToast(`Cliente ${clientId} desarchivado (Sandbox)`, { type: 'success' });
      return;
    }

    try {
      const clientRef = doc(db, 'clientes_control', clientId.toLowerCase());
      await updateDoc(clientRef, { archived: false });
      addLog(`[Firestore] Cliente ${clientId} desarchivado en Firestore central.`, "success");
      showToast(`Cliente ${clientId} desarchivado correctamente`, { type: 'success' });
    } catch (err) {
      console.error(err);
      addLog(`Error al desactivar archivo para cliente ${clientId}: ${err.message}`, "error");
      showToast(`Error al desarchivar cliente: ${err.message}`, { type: 'error' });
    }
  };

  // Filtrar provisionamientos previos
  const filteredProvisionings = useMemo(() => {
    return clientesSaas.filter(c => {
      const isArchived = !!c.archived;
      return showArchivedHistory ? isArchived : !isArchived;
    });
  }, [clientesSaas, showArchivedHistory]);

  const HISTORY_ITEMS_PER_PAGE = 5;
  const totalHistoryPages = Math.ceil(filteredProvisionings.length / HISTORY_ITEMS_PER_PAGE) || 1;
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages);
  const paginatedProvisionings = filteredProvisionings.slice(
    (currentHistoryPage - 1) * HISTORY_ITEMS_PER_PAGE,
    currentHistoryPage * HISTORY_ITEMS_PER_PAGE
  );

  const getSandboxKey = (compName, techName) => {
    return techName || compName;
  };

  const setLivePreviewComponent = (comp) => {
    addLog(`Abriendo demostración en vivo de: ${comp.name}`, "info");
    // Redirigir o abrir un sandbox. Para fines de este dashboard, mostramos aviso
    showToast(`Mostrando demo para ${comp.name} en Biblioteca`, { type: 'success' });
  };

  return (
    <div className="tab-content-enter h-full">
      {isOnboardingActive ? (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans pb-12 overflow-x-clip transition-colors duration-300">
          <div className="absolute top-0 right-0 w-[50%] h-[400px] rounded-full bg-gradient-to-b from-violet-500/5 to-cyan-500/0 blur-[150px] pointer-events-none opacity-50 dark:opacity-100" />
          
          <nav className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsOnboardingActive(false)}
                className="h-9 px-3 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-xs font-bold border border-[var(--color-border)] transition-colors flex items-center gap-1.5 cursor-pointer text-[var(--color-text)]"
              >
                <ArrowLeft size={14} />
                Volver al Dashboard
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-slate-250 to-slate-450 bg-clip-text text-transparent">Aprovisionamiento y Onboarding</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">PROTOTIPE Engine</span>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* WIZARD PANEL (Left) */}
              <div className="lg:col-span-7 self-start bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm border border-[var(--color-border)] flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <h2 className="text-lg font-black text-[var(--color-text)] flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-400" />
                      Asistente de Aprovisionamiento
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">Configura e inicializa una nueva instancia de ventas.</p>
                  </div>
                </div>

                {/* Wizard Tabs */}
                <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm">
                  {[
                    { id: 'server', label: 'Servidor', icon: Server },
                    { id: 'branding', label: 'Branding', icon: Palette },
                    { id: 'modules', label: 'Módulos', icon: Settings }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setWizardTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        wizardTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="space-y-4 min-h-[350px]">
                  {wizardTab === 'server' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Nombre del Cliente</label>
                          <input 
                            type="text" 
                            placeholder="Nombre del Cliente (Ej: Ventas SmartFix)"
                            value={newClientName}
                            onChange={(e) => handleClientNameChange(e.target.value)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Client ID (Auto-generado)</label>
                          <input 
                            type="text" 
                            disabled
                            value={newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                            placeholder="ventas-smartfix"
                            className="bg-[var(--color-bg)] opacity-60 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none cursor-not-allowed font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Modelo de Facturación</label>
                          <CustomSelect 
                            value={billingMode}
                            onChange={(e) => setBillingMode(e.target.value)}
                            options={[
                              { id: 'percentage', name: 'Porcentaje de Venta' },
                              { id: 'fixed_per_service', name: 'Monto Fijo por Servicio' },
                              { id: 'flat_monthly', name: 'Pago Mensual Fijo' }
                            ]}
                          />
                        </div>

                        {billingMode === 'percentage' && (
                          <div className="space-y-1 animate-fade-in">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Tasa de Comisión (%)</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={comisionPorcentaje}
                              onChange={(e) => setComisionPorcentaje(parseFloat(e.target.value) || 0)}
                              className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        )}

                        {billingMode === 'fixed_per_service' && (
                          <div className="space-y-1 animate-fade-in">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Monto Fijo por Servicio ($)</label>
                            <input 
                              type="number" 
                              value={montoFijoServicio}
                              onChange={(e) => setMontoFijoServicio(parseFloat(e.target.value) || 0)}
                              className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        )}

                        {billingMode === 'flat_monthly' && (
                          <div className="space-y-1 animate-fade-in">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Pago Mensual Fijo ($)</label>
                            <input 
                              type="number" 
                              value={pagoMensualFijo}
                              onChange={(e) => setPagoMensualFijo(parseFloat(e.target.value) || 0)}
                              className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Telemetry Token (Auto-generado)</label>
                          <input 
                            type="text" 
                            disabled
                            value={newClientName.trim() ? `${newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-token-${Date.now()}` : ''}
                            placeholder="token-telemetria"
                            className="bg-[var(--color-bg)] opacity-60 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none cursor-not-allowed font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Ruta Física en Disco</label>
                          <input 
                            type="text" 
                            value={targetPath}
                            onChange={(e) => setTargetPath(e.target.value)}
                            placeholder="D:\PROTOTIPE\Instancias Clientes\App-ventas-smartfix"
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Plantilla Base</label>
                          <CustomSelect 
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            options={templates}
                          />
                        </div>
                      </div>

                      <div className="border-t border-[var(--color-border)] pt-4 mt-2 space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-indigo-600/10 border border-indigo-500/25 rounded-2xl">
                          <div className="space-y-0.5 max-w-[80%]">
                            <label className="text-xs font-bold text-[var(--color-text)] block">Aprovisionar Firebase Automáticamente</label>
                            <span className="text-[10px] text-[var(--color-text-muted)] leading-relaxed block">
                              Habilita la creación desatendida del proyecto, base de datos Firestore y registro de la Web App bajo tus credenciales de CLI.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAutoProvisionFirebase(!autoProvisionFirebase)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              autoProvisionFirebase ? 'bg-indigo-600' : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                autoProvisionFirebase ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {autoProvisionFirebase ? (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-2.5 animate-fade-in">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Plan de Aprovisionamiento Automático</span>
                            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                              El daemon CLI local creará el proyecto Firebase con el identificador recomendado:
                            </p>
                            <div className="bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
                              <span className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">PROJECT ID:</span>
                              <code className="text-xs font-mono text-emerald-400 font-bold">
                                {newClientName.trim() ? newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'auto-detect'}
                              </code>
                            </div>
                            <p className="text-[10px] text-[var(--color-text-muted)] italic">
                              ✓ Firestore, Web Auth, y la Web App se inicializarán automáticamente. Las credenciales se extraerán e inyectarán directamente.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fade-in">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Project ID</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={fbProjectId}
                                  onChange={(e) => {
                                    setFbProjectId(e.target.value.replace(/\s+/g, '').toLowerCase());
                                    setIsCredentialsValidated(false);
                                    setCredentialsValidationError(null);
                                  }}
                                  placeholder="proyecto-cliente"
                                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={handleAutoDetectConfig}
                                  disabled={isFetchingConfig}
                                  className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/35 text-indigo-400 border border-indigo-500/25 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {isFetchingConfig ? 'Detectando...' : 'Auto-detectar'}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase API Key</label>
                                <input 
                                  type="text" 
                                  value={fbApiKey}
                                  onChange={(e) => {
                                    setFbApiKey(e.target.value);
                                    setIsCredentialsValidated(false);
                                    setCredentialsValidationError(null);
                                  }}
                                  placeholder="AIzaSy..."
                                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Auth Domain</label>
                                <input 
                                  type="text" 
                                  value={fbAuthDomain}
                                  onChange={(e) => setFbAuthDomain(e.target.value)}
                                  placeholder="proyecto.firebaseapp.com"
                                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Storage Bucket</label>
                                <input 
                                  type="text" 
                                  value={fbStorageBucket}
                                  onChange={(e) => setFbStorageBucket(e.target.value)}
                                  placeholder="proyecto.appspot.com"
                                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Messaging Sender ID</label>
                                <input 
                                  type="text" 
                                  value={fbMessagingSenderId}
                                  onChange={(e) => setFbMessagingSenderId(e.target.value)}
                                  placeholder="856294715..."
                                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase App ID</label>
                                <input 
                                  type="text" 
                                  value={fbAppId}
                                  onChange={(e) => setFbAppId(e.target.value)}
                                  placeholder="1:856294715:web:a1b2c3d4..."
                                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">VAPID Key de Web Push (Manual)</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={fbVapidKey}
                                  onChange={(e) => setFbVapidKey(e.target.value)}
                                  placeholder="BDd3L1s..."
                                  className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`${CLI_URL}/api/vapid/generate`);
                                      const data = await res.json();
                                      if (data.publicKey) {
                                        setFbVapidKey(data.publicKey);
                                        showToast('Clave VAPID generada ✓', { type: 'success' });
                                      } else {
                                        throw new Error(data.error || 'Respuesta vacía del servidor');
                                      }
                                    } catch (e) {
                                      showToast(`Error al generar: ${e.message}`, { type: 'error' });
                                    }
                                  }}
                                  className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/35 text-indigo-400 border border-indigo-500/25 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Generar
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl justify-between">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-[var(--color-text)] block">Validar Credenciales</span>
                                <span className="text-[9px] text-[var(--color-text-muted)] block">Prueba la API Key y el Project ID contra Firebase.</span>
                              </div>
                              <button
                                type="button"
                                onClick={validateFirebaseCreds}
                                disabled={isValidatingCredentials || !fbApiKey.trim() || !fbProjectId.trim()}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                {isValidatingCredentials ? 'Validando...' : 'Comprobar Conexión'}
                              </button>
                            </div>

                            {credentialsValidationError && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl">
                                <p className="text-[10px] text-rose-400 font-bold leading-relaxed">⚠️ {credentialsValidationError}</p>
                              </div>
                            )}

                            {isCredentialsValidated && !credentialsValidationError && (
                              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1.5 animate-fade-in">
                                <span className="text-[9px] text-emerald-400 font-bold">🟢 Conexión validada con éxito. Credenciales listas.</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {wizardTab === 'branding' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
                      <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Paletas de Colores de Marca Recomendadas</span>
                          
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {PALETTE_CATEGORIES.map((category) => {
                              const isOpen = expandedPaletteCategory === category.id;
                              return (
                                <div 
                                  key={category.id} 
                                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                                    isOpen 
                                      ? 'border-indigo-500/40 bg-indigo-500/[0.02]' 
                                      : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/10 hover:border-indigo-500/20'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setExpandedPaletteCategory(isOpen ? null : category.id)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-surface-2)]/30 hover:bg-[var(--color-surface-2)]/60 transition-colors text-xs font-bold text-[var(--color-text)] cursor-pointer select-none"
                                  >
                                    <span className="flex items-center gap-2">{category.name}</span>
                                    <ChevronDown 
                                      size={14} 
                                      className={`text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                  </button>

                                  {isOpen && (
                                    <div className="p-4 bg-[var(--color-surface)]/20 border-t border-[var(--color-border)] animate-scale-up origin-top">
                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {category.palettes.map((preset, pIdx) => {
                                          const isSelected = primaryColor === preset.primary && secondaryColor === preset.secondary && bgColor === preset.bg && textColor === preset.text;
                                          return (
                                            <button
                                              key={pIdx}
                                              type="button"
                                              onClick={() => {
                                                const dark = hexToRgb(preset.bg).r * 0.2126 + hexToRgb(preset.bg).g * 0.7152 + hexToRgb(preset.bg).b * 0.0722 < 128;
                                                setPrimaryColor(preset.primary);
                                                setSecondaryColor(preset.secondary);
                                                setBgColor(preset.bg);
                                                setTextColor(preset.text);
                                                setSurfaceColor(dark ? '#1a1a1a' : '#ffffff');
                                                setSurface2Color(dark ? '#252525' : '#f1f5f9');
                                                setBorderColor(dark ? '#333333' : '#e2e8f0');
                                                setTextMutedColor(dark ? '#a0a0a0' : '#64748b');
                                                showToast(`Aplicada paleta: ${preset.name}`, { type: 'success' });
                                              }}
                                              className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                                isSelected 
                                                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md scale-[1.02]' 
                                                  : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/80'
                                              }`}
                                            >
                                              <div className="flex items-center gap-1 mb-1.5 justify-start">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} />
                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: preset.secondary }} />
                                                <div className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: preset.bg }} />
                                                <div className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: preset.text }} />
                                              </div>
                                              <span className="text-[9px] font-bold block text-[var(--color-text)] truncate">{preset.name}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="h-px bg-[var(--color-border)] my-2" />

                        {/* Logo Upload */}
                        <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Logo Corporativo de Marca</span>
                            <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5">Favicon Ready</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Subir Logo (SVG, PNG, JPG)</label>
                              <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] hover:border-indigo-500/50 rounded-xl p-4 transition-all bg-[var(--color-bg)]/40 hover:bg-[var(--color-bg)]/70 text-center cursor-pointer">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={handleLogoChange}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <svg className="w-6 h-6 text-[var(--color-text-muted)] mb-1.5 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="text-[10px] font-bold text-[var(--color-text)]">
                                  {logoFilename ? logoFilename : 'Seleccionar o arrastrar logo'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">O Ruta Absoluta del Archivo (Local)</label>
                                <input 
                                  type="text" 
                                  value={logoLocalPath}
                                  onChange={(e) => setLogoLocalPath(e.target.value)}
                                  placeholder="C:\\Users\\Sergio\\Pictures\\logo.svg"
                                  className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>
                              {logoLocalPath && (
                                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                                  <span className="text-[8px] font-bold text-emerald-400 font-mono truncate">RUTA DE LOGO GUARDADA</span>
                                  <span className="text-[9px] text-emerald-400 font-bold">✓ Listo</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-[var(--color-border)] my-2" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Color Primario */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color Primario</label>
                            <div className="flex gap-2">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: primaryColor }}>
                                <input 
                                  type="color" 
                                  value={primaryColor} 
                                  onChange={(e) => setPrimaryColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                              <input 
                                type="text" 
                                value={primaryColor} 
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-28 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setPrimaryColor(c)}
                                  className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Color Secundario */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color Secundario</label>
                            <div className="flex gap-2">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: secondaryColor }}>
                                <input 
                                  type="color" 
                                  value={secondaryColor} 
                                  onChange={(e) => setSecondaryColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                              <input 
                                type="text" 
                                value={secondaryColor} 
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-28 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['#a855f7', '#d97706', '#ec4899', '#be123c', '#06b6d4', '#4f46e5', '#3b82f6', '#10b981', '#64748b'].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setSecondaryColor(c)}
                                  className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Color de Fondo */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Fondo</label>
                            <div className="flex gap-2">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: bgColor }}>
                                <input 
                                  type="color" 
                                  value={bgColor} 
                                  onChange={(e) => handleBgColorChange(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                              <input 
                                type="text" 
                                value={bgColor} 
                                onChange={(e) => handleBgColorChange(e.target.value)}
                                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-28 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['#070b13', '#0f172a', '#1e293b', '#06130e', '#0c0714', '#140c0b', '#18080f', '#080f1e', '#f8fafc'].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleBgColorChange(c)}
                                  className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Color de Texto */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Texto</label>
                            <div className="flex gap-2">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: textColor }}>
                                <input 
                                  type="color" 
                                  value={textColor} 
                                  onChange={(e) => setTextColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                              <input 
                                type="text" 
                                value={textColor} 
                                onChange={(e) => setTextColor(e.target.value)}
                                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-28 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {['#f8fafc', '#ffffff', '#e2e8f0', '#ecfdf5', '#fdf6ff', '#fffcfb', '#fff1f2', '#f0f7ff', '#0f172a'].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setTextColor(c)}
                                  className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 sm:col-span-2 p-3 bg-[var(--color-surface-2)]/25 border border-[var(--color-border)] rounded-2xl">
                            <button
                              type="button"
                              onClick={() => setShowAdvancedColors(!showAdvancedColors)}
                              className="w-full flex items-center justify-between text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer select-none"
                            >
                              <span>🎨 {showAdvancedColors ? 'Ocultar' : 'Mostrar'} Personalización de Colores Avanzada</span>
                              <span>{showAdvancedColors ? '▲' : '▼'}</span>
                            </button>

                            {showAdvancedColors && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[var(--color-border)] animate-fade-in">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Superficie</label>
                                  <div className="flex gap-2">
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: surfaceColor }}>
                                      <input type="color" value={surfaceColor} onChange={(e) => setSurfaceColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                    <input type="text" value={surfaceColor} onChange={(e) => setSurfaceColor(e.target.value)} className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs w-28 text-[var(--color-text)] font-mono outline-none" />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Superficie Secundario</label>
                                  <div className="flex gap-2">
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: surface2Color }}>
                                      <input type="color" value={surface2Color} onChange={(e) => setSurface2Color(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                    <input type="text" value={surface2Color} onChange={(e) => setSurface2Color(e.target.value)} className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs w-28 text-[var(--color-text)] font-mono outline-none" />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Bordes</label>
                                  <div className="flex gap-2">
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: borderColor }}>
                                      <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                    <input type="text" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs w-28 text-[var(--color-text)] font-mono outline-none" />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Color de Texto Secundario</label>
                                  <div className="flex gap-2">
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0 shadow-sm" style={{ backgroundColor: textMutedColor }}>
                                      <input type="color" value={textMutedColor} onChange={(e) => setTextMutedColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                    <input type="text" value={textMutedColor} onChange={(e) => setTextMutedColor(e.target.value)} className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs w-28 text-[var(--color-text)] font-mono outline-none" />
                                  </div>
                                </div>

                                <div className="space-y-1 sm:col-span-2">
                                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Redondeado de Bordes</label>
                                  <select
                                    value={radiusBase}
                                    onChange={(e) => setRadiusBase(e.target.value)}
                                    className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500"
                                  >
                                    <option value="0px">Recto / Sharp (0px)</option>
                                    <option value="0.25rem">Ligero (4px)</option>
                                    <option value="0.5rem">Estándar (8px)</option>
                                    <option value="0.75rem">Premium Redondeado (12px - Por Defecto)</option>
                                    <option value="1.25rem">Muy Redondeado (20px)</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Google Font Seleccionada</label>
                            <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-semibold flex items-center justify-between">
                              <span>{googleFont}</span>
                              <span className="text-[11px] opacity-75 font-bold tracking-wide" style={{ fontFamily: `'${googleFont}', sans-serif` }}>Abc - Vista Previa</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mockup Column (Right) */}
                      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                        <div className="p-4 bg-slate-500/5 dark:bg-slate-900/40 border border-[var(--color-border)] rounded-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Simulador de Interfaz (Tiempo Real)</span>
                            <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">Live Mockup</span>
                          </div>

                          <div 
                            className="border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 relative"
                            style={{ 
                              backgroundColor: bgColor, 
                              fontFamily: `'${googleFont}', sans-serif`,
                              color: textColor 
                            }}
                          >
                            <div className="px-3 py-1.5 flex items-center justify-between text-[8px] opacity-40 border-b select-none" style={{ borderColor: `${borderColor}40` }}>
                              <span>12:00 PM</span>
                              <div className="flex items-center gap-1">
                                <span>📶</span>
                                <span>🔋 100%</span>
                              </div>
                            </div>

                            <div className="px-3 py-2.5 flex items-center justify-between border-b" style={{ borderColor: `${borderColor}30` }}>
                              <div className="flex items-center gap-1.5">
                                {logoBase64 ? (
                                  <img 
                                    src={`data:image/*;base64,${logoBase64}`} 
                                    alt="Preview Logo" 
                                    className="h-4 w-auto object-contain"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center text-[7px] text-white font-bold">P</div>
                                )}
                                <span className="text-[10px] font-extrabold tracking-tight">Mi Tienda</span>
                              </div>
                              <div className="flex gap-2.5 text-[9px] font-semibold opacity-80">
                                <span style={{ color: primaryColor }}>Inicio</span>
                                <span>Buscar</span>
                                <span>Carrito</span>
                              </div>
                            </div>

                            <div className="p-3.5 space-y-3.5">
                              <div className="space-y-0.5">
                                <span className="text-[8px] font-bold tracking-wide uppercase opacity-50">Explorar catálogo</span>
                                <h5 className="text-[12px] font-black leading-none">Nuestros Productos</h5>
                              </div>

                              <div 
                                className="p-3 border shadow-sm transition-all animate-fade-in"
                                style={{ 
                                  backgroundColor: surfaceColor, 
                                  borderColor: borderColor,
                                  borderRadius: radiusBase 
                                }}
                              >
                                <div 
                                  className="w-full h-20 rounded-lg relative overflow-hidden mb-2.5 flex items-center justify-center"
                                  style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)` }}
                                >
                                  <span className="text-[16px]">🛍️</span>
                                  <span 
                                    className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold text-white shadow-sm"
                                    style={{ backgroundColor: secondaryColor }}
                                  >
                                    Nuevo
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="text-[10px] font-bold leading-tight block truncate">Chaqueta Premium Fit</span>
                                    <span className="text-[10px] font-extrabold shrink-0" style={{ color: primaryColor }}>$89.900</span>
                                  </div>
                                  <p className="text-[8px] leading-relaxed" style={{ color: textMutedColor }}>
                                    Diseño exclusivo, confort total para el día a día.
                                  </p>
                                </div>

                                <div className="flex gap-1.5 mt-2.5">
                                  <button 
                                    type="button" 
                                    className="flex-1 py-1.5 text-[8.5px] font-black text-center text-white transition-all shadow-sm flex items-center justify-center gap-1"
                                    style={{ 
                                      backgroundColor: primaryColor,
                                      borderRadius: radiusBase 
                                    }}
                                  >
                                    🛒 Comprar
                                  </button>
                                  <button 
                                    type="button" 
                                    className="px-2 py-1.5 text-[8.5px] font-bold transition-all border flex items-center justify-center"
                                    style={{ 
                                      borderColor: borderColor,
                                      color: textColor,
                                      borderRadius: radiusBase 
                                    }}
                                  >
                                    ❤️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* WCAG Contrast check */}
                        <div className="p-4 bg-slate-500/5 dark:bg-slate-900/40 border border-[var(--color-border)] rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Contraste WCAG 2.1</span>
                            <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5">Estándar W3C</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                              const ratio = getContrastRatio(primaryColor, '#ffffff');
                              const feedback = getContrastFeedback(ratio);
                              return (
                                <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2 flex flex-col justify-between">
                                  <div>
                                    <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Botón Primario</span>
                                    <span className="text-xs font-black text-[var(--color-text)] block mt-0.5">{ratio.toFixed(2)} : 1</span>
                                  </div>
                                  <div className="flex flex-col gap-1.5 mt-1">
                                    <span className={`text-[8px] font-bold px-2 py-1 rounded-full text-center ${feedback.badgeClass}`}>
                                      {feedback.text}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                            {(() => {
                              const ratio = getContrastRatio(bgColor, textColor);
                              const feedback = getContrastFeedback(ratio);
                              return (
                                <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2 flex flex-col justify-between">
                                  <div>
                                    <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Fondo vs Texto</span>
                                    <span className="text-xs font-black text-[var(--color-text)] block mt-0.5">{ratio.toFixed(2)} : 1</span>
                                  </div>
                                  <div className="flex flex-col gap-1.5 mt-1">
                                    <span className={`text-[8px] font-bold px-2 py-1 rounded-full text-center ${feedback.badgeClass}`}>
                                      {feedback.text}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardTab === 'modules' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-4">
                        <div className="space-y-1.5 border-b border-[var(--color-border)] pb-4">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Vertical de Negocio</label>
                          <CustomSelect 
                            value={niche} 
                            onChange={(e) => setNiche(e.target.value)}
                            options={[
                              { id: "retail_clothing", name: "🛍️ Ropa y Retail Tradicional (retail_clothing)" },
                              { id: "technical_services", name: "⚙️ Tornerías y Mecanizado de Precisión (technical_services)" },
                              { id: "refrigeration_ac", name: "❄️ Refrigeración y Climatización (refrigeration_ac)" },
                              { id: "contractors", name: "📐 Contratistas y Construcción (contractors)" },
                              { id: "machinery_rental", name: "🚜 Alquiler de Maquinaria y Equipos (machinery_rental)" },
                              { id: "carpentry", name: "🪚 Carpinterías y Muebles (carpentry)" },
                              { id: "laundry", name: "🧺 Lavanderías y Tintorerías (laundry)" },
                              { id: "furniture_repair", name: "🛋️ Restauración y Tapicería de Muebles (furniture_repair)" },
                              { id: "wellness_podology", name: "💆 Estética, Podología y Bienestar (wellness_podology)" },
                              { id: "grocery_food", name: "🍎 Minimarkets y Alimentos (grocery_food)" }
                            ]}
                          />
                        </div>

                        <h4 className="text-xs font-bold text-[var(--color-text)]">Funcionalidades Core y Flags</h4>
                        
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                            <input 
                              type="checkbox" 
                              checked={enableGithub} 
                              onChange={(e) => setEnableGithub(e.target.checked)}
                              className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                            />
                            Inicializar repositorio en GitHub
                          </label>
                          
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                            <input 
                              type="checkbox" 
                              checked={enableFirebaseDeploy} 
                              onChange={(e) => setEnableFirebaseDeploy(e.target.checked)}
                              className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                            />
                            Desplegar reglas e índices en Firebase
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                            <input 
                              type="checkbox" 
                              checked={enablePwa} 
                              onChange={(e) => setEnablePwa(e.target.checked)}
                              className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                            />
                            Activar PWA (Progressive Web App)
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                            <input 
                              type="checkbox" 
                              checked={enablePush} 
                              onChange={(e) => setEnablePush(e.target.checked)}
                              className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                            />
                            Servicio de Notificaciones Push
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                            <input 
                              type="checkbox" 
                              checked={enableBilling} 
                              onChange={(e) => setEnableBilling(e.target.checked)}
                              className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                            />
                            Módulo de Facturación Electrónica
                          </label>

                          <div className="pl-6 border-l border-indigo-500/20 space-y-3 mt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                              <input 
                                type="checkbox" 
                                checked={enableDianBilling} 
                                onChange={(e) => setEnableDianBilling(e.target.checked)}
                                className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                              />
                              Facturación Electrónica DIAN Directa
                            </label>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="border-t border-[var(--color-border)] pt-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Recomendaciones de Biblioteca y Módulos</label>
                            {selectedRecomendations.length > 0 && (
                              <span className="text-[9px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full px-2 py-0.5">
                                {selectedRecomendations.length} seleccionado{selectedRecomendations.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="bg-[var(--color-bg)]/60 border border-[var(--color-border)] rounded-xl p-2.5 max-h-64 overflow-y-auto space-y-3 scrollbar-thin">
                            {libraryList.length === 0 ? (
                              <div className="flex items-center gap-2 py-3 justify-center">
                                <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                <span className="text-[10px] text-[var(--color-text-muted)] italic">Cargando catálogo...</span>
                              </div>
                            ) : (
                              libraryList.map((cat, catIdx) => {
                                if (!cat.components || cat.components.length === 0) return null;
                                return (
                                  <div key={catIdx} className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] uppercase font-extrabold tracking-widest text-indigo-400">
                                        {cat.name}
                                      </span>
                                      <div className="flex-1 h-px bg-[var(--color-border)]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {cat.components.map((comp, compIdx) => {
                                        const isSelected = selectedRecomendations.some(r => r.link === comp.link);
                                        const isModule = comp.resourceType === 'module' || cat.isModule;
                                        return (
                                          <div
                                            key={compIdx}
                                            role="button"
                                            onClick={() => {
                                              if (isSelected) {
                                                setSelectedRecomendations(prev => prev.filter(r => r.link !== comp.link));
                                              } else {
                                                setSelectedRecomendations(prev => [...prev, {
                                                  name: comp.name,
                                                  technicalName: comp.technicalName,
                                                  link: comp.link,
                                                  resourceType: comp.resourceType
                                                }]);
                                              }
                                            }}
                                            className={`relative flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 group select-none overflow-hidden ${
                                              isSelected
                                                ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm'
                                                : 'bg-[var(--color-surface-2)]/25 border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)]/50'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                                                isModule ? 'text-violet-400 bg-violet-500/10 border-violet-500/20' : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                                              }`}>
                                                {isModule ? 'Módulo' : 'Comp.'}
                                              </span>
                                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                isSelected ? 'bg-indigo-600 border-indigo-500' : 'border-[var(--color-border)]'
                                              }`}>
                                                {isSelected && <span className="text-[8px] text-white">✓</span>}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="text-[10px] font-bold block leading-tight">{comp.name}</span>
                                              <span className="text-[8px] font-mono text-[var(--color-text-muted)] block truncate">{comp.technicalName}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="border-t border-[var(--color-border)] pt-3.5 space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Notas Especiales del Cliente</label>
                          <textarea 
                            value={customRequirements}
                            onChange={(e) => setCustomRequirements(e.target.value)}
                            placeholder="Requerimientos específicos..."
                            rows={3}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none resize-none font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del wizard */}
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={wizardTab === 'server'}
                      onClick={() => setWizardTab(wizardTab === 'modules' ? 'branding' : 'server')}
                      className="px-3.5 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[var(--color-border)]"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      disabled={wizardTab === 'modules'}
                      onClick={() => setWizardTab(wizardTab === 'server' ? 'branding' : 'modules')}
                      className="px-3.5 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--color-text)] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[var(--color-border)]"
                    >
                      Siguiente
                    </button>
                  </div>

                  <button 
                    disabled={isRegistering || isProvisioning || !newClientName.trim()}
                    onClick={async () => {
                      if (!newClientName.trim()) return;
                      
                      setIsRegistering(true);
                      setIsProvisioning(true);
                      const clientId = newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      const telemetryToken = `${clientId}-token-${Date.now()}`;

                      addLog(`Registrando nuevo cliente: ${clientId} (${billingMode})`, "info");

                      const cliPayload = {
                        template: selectedTemplate,
                        projectName: newClientName.trim(),
                        targetPath,
                        logoPath: logoLocalPath,
                        telemetryToken,
                        autoProvisionFirebase,
                        paletteChoice: 'custom',
                        customPrimary: primaryColor,
                        customAccent: secondaryColor,
                        enableGithub,
                        enableFirebaseDeploy,
                        firebaseApiKey: fbApiKey.trim(),
                        firebaseAuthDomain: fbAuthDomain.trim(),
                        firebaseProjectId: fbProjectId.trim(),
                        firebaseStorageBucket: fbStorageBucket.trim(),
                        firebaseMessagingSenderId: fbMessagingSenderId.trim(),
                        firebaseAppId: fbAppId.trim(),
                        centralApiKey: CENTRAL_CONFIG.apiKey,
                        centralMessagingSenderId: CENTRAL_CONFIG.messagingSenderId,
                        centralAppId: CENTRAL_CONFIG.appId,
                        customRequirements: customRequirements.trim(),
                        niche,
                        billingMode,
                        comisionPorcentaje,
                        montoFijoServicio,
                        pagoMensualFijo,
                        enableDianBilling,
                        costoPorFacturaDian,
                        selectedRecomendations,
                        branding: {
                          primaryColor,
                          secondaryColor,
                          bgColor,
                          textColor,
                          surfaceColor,
                          surface2Color,
                          borderColor,
                          textMutedColor,
                          radiusBase,
                          googleFont
                        },
                        flags: {
                          enableGithub,
                          enableFirebaseDeploy,
                          enablePwa,
                          enablePush,
                          enableBilling,
                          enableDianBilling
                        }
                      };

                      if (isSimulated) {
                        const testPeriod = new Date().toISOString().substring(0, 7);
                        const reportId = `${clientId}_${testPeriod}`;
                        const sales = Math.floor(Math.random() * 8000000) + 2000000;
                        
                        let comValue = 0;
                        if (billingMode === 'percentage') {
                          comValue = (sales * comisionPorcentaje) / 100;
                        } else if (billingMode === 'fixed_per_service') {
                          comValue = montoFijoServicio * 12;
                        } else if (billingMode === 'flat_monthly') {
                          comValue = pagoMensualFijo;
                        }
                        
                        const newRep = {
                          id: reportId,
                          clientId: clientId,
                          periodo: testPeriod,
                          totalVentas: sales,
                          comisionPorcentaje: billingMode === 'percentage' ? comisionPorcentaje : 0,
                          comisionValor: comValue,
                          estadoPago: 'pendiente',
                          updatedAt: { toDate: () => new Date() }
                        };

                        setClientesSaas([...clientesSaas, { id: clientId, niche, billingMode, comisionPorcentaje, montoFijoServicio, pagoMensualFijo, enableDianBilling, costoPorFacturaDian }]);
                        setReports([newRep, ...reports]);
                        setTelemetryTokens([...telemetryTokens, { id: telemetryToken, clientId }]);

                        addLog(`[Sandbox] Cliente ${clientId} registrado y token configurado localmente.`, "success");
                        showToast(`Cliente ${newClientName} registrado (Sandbox)`, { type: 'success' });
                        
                        setOnboardingData({
                          clientId,
                          token: telemetryToken,
                          comisionPorcentaje,
                          vapidKey: fbVapidKey,
                          prompt: `# Antigravity Bootstrap Prompt for ${clientId}\n\nThis is a simulated prompt for testing purposes.`,
                          adminEmail: `admin@${clientId}.com`,
                          adminPassword: 'Admin2026!'
                        });
                        setIsOnboardingActive(false);
                        setNewClientName('');
                        setFbApiKey('');
                        setFbAuthDomain('');
                        setFbProjectId('');
                        setFbStorageBucket('');
                        setFbMessagingSenderId('');
                        setFbAppId('');
                        setFbVapidKey('');
                        setIsRegistering(false);
                        setIsProvisioning(false);
                        return;
                      }

                      try {
                        const clientRef = doc(db, 'clientes_control', clientId);
                        await setDoc(clientRef, {
                          nombre: newClientName.trim(),
                          niche,
                          billingMode,
                          comisionPorcentaje,
                          montoFijoServicio,
                          pagoMensualFijo,
                          enableDianBilling,
                          costoPorFacturaDian,
                          creadoEn: serverTimestamp(),
                          targetPath,
                          template: selectedTemplate,
                          customRequirements: customRequirements.trim(),
                          firebaseConfig: {
                            apiKey: fbApiKey.trim(),
                            authDomain: fbAuthDomain.trim(),
                            projectId: fbProjectId.trim(),
                            storageBucket: fbStorageBucket.trim(),
                            messagingSenderId: fbMessagingSenderId.trim(),
                            appId: fbAppId.trim(),
                            vapidKey: fbVapidKey.trim()
                          },
                          branding: {
                            primaryColor,
                            secondaryColor,
                            bgColor,
                            textColor,
                            surfaceColor,
                            surface2Color,
                            borderColor,
                            textMutedColor,
                            radiusBase,
                            googleFont
                          },
                          flags: {
                            enableGithub,
                            enableFirebaseDeploy,
                            enablePwa,
                            enablePush,
                            enableBilling,
                            enableDianBilling
                          }
                        });

                        const tokenRef = doc(db, 'tokens', telemetryToken);
                        await setDoc(tokenRef, {
                          active: true,
                          clientId,
                          creadoEn: serverTimestamp()
                        });

                        addLog(`[Firestore] Aprovisionamiento exitoso para el cliente ${clientId} en la nube central.`, "success");
                        
                        let promptResult = '';

                        try {
                          const cliRes = await fetch(`${CLI_URL}/api/create-project`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(cliPayload)
                          });

                          if (cliRes.ok) {
                            const resData = await cliRes.json();
                            promptResult = resData.prompt || (resData.data && resData.data.prompt) || '';
                            addLog(`[CLI API] Aprovisionamiento físico del proyecto en disco completado.`, "success");
                            showToast(`Cliente ${newClientName} registrado y proyecto creado en disco`, { type: 'success' });
                          } else {
                            const errText = await cliRes.text();
                            let errMessage = '';
                            try {
                              const errData = JSON.parse(errText);
                              errMessage = errData.error || errData.message || errText;
                            } catch (_) {
                              errMessage = errText;
                            }
                            addLog(`[CLI API Warning] CLI respondió con error: ${errMessage}. Datos guardados en Firestore.`, "warning");
                            setPendingCliProvisioning({
                              clientId, nombre: newClientName.trim(), comisionPorcentaje, telemetryToken,
                              payload: cliPayload
                            });
                            showToast(`El cliente se guardó en Firestore. Reintenta cuando el CLI esté activo.`, { type: 'error' });
                          }
                        } catch (cliErr) {
                          console.error("Error en API de aprovisionamiento:", cliErr);
                          addLog(`[CLI API Warning] Daemon CLI offline: ${cliErr.message}. Datos en Firestore seguros.`, "warning");
                          setPendingCliProvisioning({
                            clientId, nombre: newClientName.trim(), comisionPorcentaje, telemetryToken,
                            payload: cliPayload
                          });
                          showToast('Daemon CLI offline. Firestore OK. Reintenta cuando esté listo.', { type: 'error' });
                        }

                        setOnboardingData({
                          clientId,
                          token: telemetryToken,
                          comisionPorcentaje,
                          vapidKey: fbVapidKey,
                          prompt: promptResult,
                          adminEmail: `admin@${clientId}.com`,
                          adminPassword: 'Admin2026!'
                        });
                        setIsOnboardingActive(false);
                        setNewClientName('');
                        setFbApiKey('');
                        setFbAuthDomain('');
                        setFbProjectId('');
                        setFbStorageBucket('');
                        setFbMessagingSenderId('');
                        setFbAppId('');
                        setFbVapidKey('');
                        setCustomRequirements('');
                      } catch (err) {
                        console.error(err);
                        addLog(`Error registrando cliente: ${err.message}`, "error");
                        showToast(`Error al registrar cliente: ${err.message}`, { type: 'error' });
                      } finally {
                        setIsRegistering(false);
                        setIsProvisioning(false);
                      }
                    }}
                    className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${(isRegistering || isProvisioning || !newClientName.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {(isRegistering || isProvisioning) ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Procesando Aprovisionamiento...
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        Confirmar y Aprovisionar Instancia
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tarjeta de Inicio */}
          <div className="relative overflow-hidden w-full min-h-[420px] flex items-center justify-center rounded-3xl border border-[var(--color-border)] shadow-2xl p-8 sm:p-12 transition-all duration-300">
            <InteractiveAmbientGlow 
              color1="var(--color-primary)"
              color2="var(--color-accent)"
              color3="#ec4899"
              sensitivity={0.07}
            />
            
            <div className="relative z-10 text-center max-w-xl mx-auto space-y-6 p-6 sm:p-8 rounded-2xl bg-[var(--color-surface-2)]/60 dark:bg-[var(--color-surface-2)]/45 backdrop-blur-xl border border-[var(--color-border)] shadow-xl transition-all duration-500">
              <div className="inline-flex p-3 rounded-2.5xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 shadow-inner animate-pulse">
                <Sparkles size={24} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-text)]">
                  Aprovisionamiento de Clientes
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed">
                  Crea, configura y despliega una instancia exclusiva a la medida del cliente en segundos. Define servidor, branding visual y módulos del negocio.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 pt-2">
                <button 
                  onClick={() => setIsOnboardingActive(true)}
                  className="group relative px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2.5 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.97] hover:scale-[1.02] cursor-pointer"
                >
                  <span className="relative flex items-center gap-2">
                    <Plus size={14} className="text-indigo-200 group-hover:rotate-90 transition-transform" />
                    <span>Iniciar Asistente Aprovisionamiento</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Historial */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 space-y-4 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-2">
                  <Database size={15} className="text-indigo-400" />
                  Historial de Aprovisionamientos
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Listado de instancias de clientes configuradas y desplegadas en la plataforma.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowArchivedHistory(prev => !prev);
                    setHistoryPage(1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none ${
                    showArchivedHistory
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      : 'bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {showArchivedHistory ? 'Ver Activos' : 'Ver Archivados'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/40 select-none">
                    <th className="p-4">Cliente / ID</th>
                    <th className="p-4">Vertical / Nicho</th>
                    <th className="p-4">Comisión / Tarifa</th>
                    <th className="p-4">Facturación DIAN</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-xs">
                  {paginatedProvisionings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-[var(--color-text-muted)] font-medium">
                        {showArchivedHistory ? 'No se encontraron registros archivados.' : 'No se encontraron registros activos.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedProvisionings.map(client => {
                      const nicheData = [
                        { id: "retail_clothing", emoji: "🛍️", name: "Ropa y Retail" },
                        { id: "technical_services", emoji: "⚙️", name: "Tornerías y Mecanizado" },
                        { id: "refrigeration_ac", emoji: "❄️", name: "Refrigeración/AC" },
                        { id: "contractors", emoji: "📐", name: "Contratistas" },
                        { id: "machinery_rental", emoji: "🚜", name: "Alquiler Maquinaria" },
                        { id: "carpentry", emoji: "🪚", name: "Carpinterías" },
                        { id: "laundry", emoji: "🧺", name: "Lavanderías" },
                        { id: "furniture_repair", emoji: "🛋️", name: "Restauración/Tapicería" },
                        { id: "wellness_podology", emoji: "💆", name: "Estética/Podología" },
                        { id: "grocery_food", emoji: "🍎", name: "Minimarkets/Alimentos" }
                      ].find(n => n.id === client.niche) || { emoji: "📦", name: client.niche || "Desconocido" };
                      
                      return (
                        <tr key={client.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                          <td className="p-4 font-extrabold text-[var(--color-text)]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/15">
                                {client.id.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="truncate max-w-[150px]">{client.nombre || client.id}</span>
                                <span className="text-[10px] text-[var(--color-text-muted)] font-mono font-medium">{client.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-muted)]">
                              <span>{nicheData.emoji}</span>
                              <span>{nicheData.name}</span>
                            </span>
                          </td>
                          <td className="p-4 font-bold text-[var(--color-text)]">
                            {client.billingMode === 'percentage' 
                              ? `${client.comisionPorcentaje}% Ventas` 
                              : client.billingMode === 'fixed_per_service' 
                                ? `$${(client.montoFijoServicio || 0).toLocaleString('es-CO')} / Serv` 
                                : `$${(client.pagoMensualFijo || 0).toLocaleString('es-CO')} / Mes`
                            }
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              client.enableDianBilling
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/25'
                            }`}>
                              {client.enableDianBilling ? 'Habilitado' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {showArchivedHistory ? (
                              <button
                                onClick={() => handleUnarchiveClient(client.id)}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                Reactivar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchiveClient(client.id)}
                                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                Archivar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 select-none">
              <Pagination
                currentPage={currentHistoryPage}
                totalPages={totalHistoryPages}
                onPageChange={setHistoryPage}
                siblingCount={1}
                showAlways={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Checklist / Credenciales */}
      {onboardingData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-black text-sm uppercase text-indigo-500 tracking-wider flex items-center gap-2">
                <CheckCircle size={16} />
                Onboarding & Checklist de Integración
              </h3>
              <button 
                onClick={() => setOnboardingData(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block">Verificación Firebase</span>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'fs', label: 'Habilitar Firestore Database y desplegar reglas/índices' },
                  { id: 'auth', label: 'Habilitar Firebase Authentication (Correo/Contraseña)' },
                  { id: 'storage', label: 'Habilitar Firebase Storage para comprobantes' }
                ].map(step => (
                  <label key={step.id} className="flex items-start gap-2.5 cursor-pointer select-none text-[var(--color-text)]">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] mt-0.5"
                    />
                    <span>{step.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-widest">Credenciales del Administrador (Autogeneradas)</span>
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between gap-3 bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)] min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase">EMAIL:</span>
                      <code className="text-[11px] font-mono text-emerald-300 truncate">{onboardingData.adminEmail}</code>
                    </div>
                    <button 
                      onClick={() => {
                        copy(onboardingData.adminEmail);
                        showToast('Correo copiado', { type: 'success' });
                      }}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)] min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase">PASS:</span>
                      <code className="text-[11px] font-mono text-emerald-300 truncate">{onboardingData.adminPassword}</code>
                    </div>
                    <button 
                      onClick={() => {
                        copy(onboardingData.adminPassword);
                        showToast('Contraseña copiada', { type: 'success' });
                      }}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-widest">Token de Telemetría Generado</span>
                <div className="flex items-center justify-between gap-3 bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                  <code className="text-[11px] font-mono text-slate-350 truncate">{onboardingData.token}</code>
                  <button 
                    onClick={() => {
                      copy(onboardingData.token);
                      showToast('Token copiado', { type: 'success' });
                    }}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {onboardingData.prompt && (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block">Prompt de Arranque para Antigravity</span>
                    <button 
                      onClick={() => {
                        copy(onboardingData.prompt);
                        showToast('Prompt copiado', { type: 'success' });
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-extrabold cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Copy size={10} />
                      Copiar Prompt
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-slate-955 p-3 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                    {onboardingData.prompt}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-widest">Pasos para el Aprovisionamiento Manual</span>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-bold text-[var(--color-text)]">Configurar archivo `.env.local`</p>
                      <pre className="bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] font-mono text-[10px] mt-1.5 text-slate-400 overflow-x-auto whitespace-pre-wrap break-all">
{`VITE_DEVELOPER_TELEMETRY_TOKEN=${onboardingData.token}
VITE_DEVELOPER_CLIENT_ID=${onboardingData.clientId}`}
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-bold text-[var(--color-text)]">Configurar archivo `.firebaserc`</p>
                      <pre className="bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] font-mono text-[10px] mt-1.5 text-slate-400 overflow-x-auto">
{`{
  "projects": {
    "default": "${CENTRAL_CONFIG.projectId || 'firebase-project-id'}"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setOnboardingData(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Completado / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProvisioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in p-6">
          <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-100">Aprovisionando Entorno</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aprovisionando entorno local e instalando dependencias npm... por favor espera un momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
