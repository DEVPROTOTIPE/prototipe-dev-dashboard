import React, { useEffect, useState, useRef, useMemo } from 'react'
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw, 
  Search,
  Layers,
  Database,
  Lock,
  Unlock,
  LogOut,
  User,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  BarChart3,
  Activity,
  Terminal,
  ChevronRight,
  CreditCard,
  ArrowUpRight,
  Check,
  Settings,
  ShieldAlert,
  Server,
  Download,
  Copy,
  FileText,
  Plus,
  ArrowLeft,
  Smartphone,
  Palette,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Calculator,
  ChevronLeft,
  Menu,
  X,
  Zap,
  DollarSign,
  Hash,
  Send,
  Trash2,
  FlaskConical,
  Play,
  StopCircle,
  CircleCheck,
  CircleX,
  GitCommit,
  Upload
} from 'lucide-react'
import GitBackupPanel from './components/admin/GitBackupPanel'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy,
  serverTimestamp,
  setDoc,
  addDoc,
  writeBatch
} from 'firebase/firestore'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import useCopyToClipboard from './hooks/useCopyToClipboard'
import { exportCommissionReceiptPDF } from './services/pdfService'
import useToast from './hooks/useToast'
import GuidedToast from './components/ui/GuidedToast'
import { useAlertConfirm } from './components/common/AlertConfirmContext'
import DarkModeToggle from './components/ui/DarkModeToggle'
import ComponentLibraryView from './components/admin/ComponentLibraryView'
import Pagination from './components/ui/Pagination'
import E2EPanel from './components/admin/E2EPanel'
import CoreManagerPanel from './components/admin/CoreManagerPanel'
import ComponentSandbox, { getSandboxKey } from './components/admin/ComponentSandbox'

const MOCK_CATALOG = {
  retail_clothing: [
    { id: 'c1', name: 'Camiseta Oversize Algodón', price: 59900, emoji: '👕' },
    { id: 'c2', name: 'Jeans Slim Fit Denim', price: 120000, emoji: '👖' },
    { id: 'c3', name: 'Chaqueta Impermeable Acolchada', price: 180000, emoji: '🧥' }
  ],
  technical_services: [
    { id: 't1', name: 'Mecanizado de Eje Rotatorio', price: 350000, emoji: '⚙️' },
    { id: 't2', name: 'Fabricación de Buje de Bronce', price: 85000, emoji: '🔩' },
    { id: 't3', name: 'Rectificación de Volante de Motor', price: 120000, emoji: '🚗' }
  ],
  refrigeration_ac: [
    { id: 'r1', name: 'Mantenimiento Preventivo Split', price: 95000, emoji: '❄️' },
    { id: 'r2', name: 'Instalación de Aire Acondicionado', price: 320000, emoji: '🌬️' },
    { id: 'r3', name: 'Recarga de Gas Refrigerante R410a', price: 140000, emoji: '🧪' }
  ],
  contractors: [
    { id: 'ct1', name: 'Instalación Drywall (m2)', price: 45000, emoji: '📐' },
    { id: 'ct2', name: 'Pintura de Fachada Exterior', price: 280000, emoji: '🎨' },
    { id: 'ct3', name: 'Enchape Cerámico Baño/Cocina', price: 60000, emoji: '🧱' }
  ],
  machinery_rental: [
    { id: 'm1', name: 'Alquiler Mini-Excavadora (Día)', price: 450000, emoji: '🚜' },
    { id: 'm2', name: 'Alquiler Planta Eléctrica 5kW', price: 150000, emoji: '⚡' },
    { id: 'm3', name: 'Alquiler Mezcladora Concreto', price: 80000, emoji: '🌀' }
  ],
  carpentry: [
    { id: 'cp1', name: 'Fabricación de Closet (m2)', price: 250000, emoji: '🪚' },
    { id: 'cp2', name: 'Restauración de Puerta Madera', price: 110000, emoji: '🚪' },
    { id: 'cp3', name: 'Mesa de Centro Madera Maciza', price: 190000, emoji: '🪵' }
  ],
  laundry: [
    { id: 'l1', name: 'Lavado/Secado Edredón Plumas', price: 28000, emoji: '🧺' },
    { id: 'l2', name: 'Lavado/Aplanchado Traje Formal', price: 22000, emoji: '👔' },
    { id: 'l3', name: 'Tintura de Prenda Algodón', price: 18000, emoji: '🎨' }
  ],
  furniture_repair: [
    { id: 'f1', name: 'Tapizado de Sofá 3 Puestos', price: 680000, emoji: '🛋️' },
    { id: 'f2', name: 'Restauración Barniz Silla', price: 75000, emoji: '🪑' },
    { id: 'f3', name: 'Reparación Rieles de Cajonera', price: 45000, emoji: '🔧' }
  ],
  wellness_podology: [
    { id: 'w1', name: 'Perfilaxis Podológica Completa', price: 90000, emoji: '🦶' },
    { id: 'w2', name: 'Tratamiento Onicomicosis (Láser)', price: 120000, emoji: '🔦' },
    { id: 'w3', name: 'Masaje Relajante Espalda/Cuello', price: 75000, emoji: '💆' }
  ],
  grocery_food: [
    { id: 'g1', name: 'Canasta de Verduras Orgánicas', price: 35000, emoji: '🍎' },
    { id: 'g2', name: 'Café Tostado Especial (500g)', price: 24000, emoji: '☕' },
    { id: 'g3', name: 'Aceite de Oliva Extra Virgen', price: 42000, emoji: '🫒' }
  ]
};


// Variables de entorno para conectar al Firebase Central de Control
const CENTRAL_CONFIG = {
  apiKey: import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY || "",
  authDomain: import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID || ""
}

const AVAILABLE_FONTS = [
  // Sans-Serif
  { value: 'Inter', desc: 'Sans-serif funcional y altamente legible a cualquier tamaño.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Poppins', desc: 'Redondeada premium, excelente para interfaces amigables.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Roboto', desc: 'Clásica, limpia, geométrica y balanceada.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Montserrat', desc: 'Geométrica moderna, ideal para títulos impactantes.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Outfit', desc: 'Moderna, estilizada y con personalidad geométrica.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Plus Jakarta Sans', desc: 'Limpia, elegante y de estilo de negocio moderno.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Manrope', desc: 'Grotesque contemporánea de proporciones balanceadas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'DM Sans', desc: 'Limpia, neutra y de baja distracción visual.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Open Sans', desc: 'Altamente legible, neutral y de gran versatilidad.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Lato', desc: 'Cálida, legible y muy popular en sitios web modernos.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Nunito', desc: 'Suave, con esquinas redondeadas y tono cercano.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Rubik', desc: 'Formas redondeadas sutiles y gran legibilidad en pantallas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Work Sans', desc: 'Optimizada para pantallas de alta resolución.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Urbanist', desc: 'Estilo sans-serif geométrico elegante y sofisticado.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Lexend', desc: 'Diseñada específicamente para mejorar la velocidad de lectura.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Sora', desc: 'Bordes afilados y aspecto tech, ideal para interfaces modernas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Cabin', desc: 'Neo-grotesque amigable con curvas suaves humanistas.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Quicksand', desc: 'Geometría puramente redondeada, juguetona y muy legible.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Fira Sans', desc: 'Diseño abierto y orgánico creado por Mozilla.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Kanit', desc: 'Formal, moderna y con gran variedad de pesos tipográficos.', cat: 'sans-serif', label: 'Sans-Serif' },
  { value: 'Ubuntu', desc: 'Personalidad única con curvas fluidas e identidad tecnológica.', cat: 'sans-serif', label: 'Sans-Serif' },

  // Serif
  { value: 'Playfair Display', desc: 'Serif elegante con alto contraste de trazos y mucha clase.', cat: 'serif', label: 'Serif' },
  { value: 'Lora', desc: 'Serif contemporánea con pinceladas suaves y tradicionales.', cat: 'serif', label: 'Serif' },
  { value: 'Merriweather', desc: 'Diseñada específicamente para lectura cómoda en pantallas.', cat: 'serif', label: 'Serif' },
  { value: 'PT Serif', desc: 'Estilo clásico con proporciones amplias y excelente legibilidad.', cat: 'serif', label: 'Serif' },
  { value: 'EB Garamond', desc: 'Clásica renacentista, elegante, sofisticada y tradicional.', cat: 'serif', label: 'Serif' },
  { value: 'Cinzel', desc: 'Basada en inscripciones romanas clásicas, ideal para lujo.', cat: 'serif', label: 'Serif' },
  { value: 'Cormorant Garamond', desc: 'Trazo fino de alto impacto editorial y gran distinción.', cat: 'serif', label: 'Serif' },
  { value: 'Arvo', desc: 'Slab-serif geométrica robusta y de gran presencia visual.', cat: 'serif', label: 'Serif' },
  { value: 'Libre Baskerville', desc: 'Clásica optimizada para bloques largos de texto.', cat: 'serif', label: 'Serif' },
  { value: 'Domine', desc: 'Serif amigable diseñada para editoriales web.', cat: 'serif', label: 'Serif' },
  { value: 'DM Serif Display', desc: 'Contraste dramático y sofisticado para grandes titulares.', cat: 'serif', label: 'Serif' },
  { value: 'Cardo', desc: 'Estilo de manuscrito medieval, clásica y distinguida.', cat: 'serif', label: 'Serif' },

  // Display
  { value: 'Space Grotesk', desc: 'Brutalista y futurista, con caracteres de gran impacto.', cat: 'display', label: 'Display' },
  { value: 'Syne', desc: 'Artística, expresiva y diseñada para marcas de moda o creativas.', cat: 'display', label: 'Display' },
  { value: 'Righteous', desc: 'Inspiración Art Deco con formas geométricas singulares.', cat: 'display', label: 'Display' },
  { value: 'Syncopate', desc: 'Ancha, moderna y de proporciones muy extendidas para logos.', cat: 'display', label: 'Display' },
  { value: 'Cabinet Grotesk', desc: 'Formas contrastadas que llaman fuertemente la atención.', cat: 'display', label: 'Display' },
  { value: 'Unbounded', desc: 'Ancha, brutalista y de estilo cyber-tecnológico.', cat: 'display', label: 'Display' },
  { value: 'Archivo Black', desc: 'Ultra-gruesa, idónea para títulos de gran tamaño e impacto.', cat: 'display', label: 'Display' },
  { value: 'Oswald', desc: 'Estilo condensado de gran altura para encabezados firmes.', cat: 'display', label: 'Display' },
  { value: 'Anton', desc: 'Diseño ultra-bold de gran masa visual y estilo póster.', cat: 'display', label: 'Display' },
  { value: 'Abril Fatface', desc: 'Serif Display de alto impacto con curvas gruesas y elegantes.', cat: 'display', label: 'Display' },
  { value: 'Lobster', desc: 'Cursiva gruesa y alegre con estilo retro americano.', cat: 'display', label: 'Display' },
  { value: 'Bungee', desc: 'Estilo urbano monolítico inspirado en carteles callejeros.', cat: 'display', label: 'Display' },
  { value: 'Fredoka', desc: 'Diseño amigable de puntas redondeadas e impacto blando.', cat: 'display', label: 'Display' },

  // Monospace
  { value: 'Space Mono', desc: 'Monospaciada tech con tintes retro y brutalistas.', cat: 'monospace', label: 'Monospace' },
  { value: 'Fira Code', desc: 'Diseñada para desarrollo con ligaduras de programación.', cat: 'monospace', label: 'Monospace' },
  { value: 'JetBrains Mono', desc: 'Optimizada para máxima claridad de código y lectura técnica.', cat: 'monospace', label: 'Monospace' },
  { value: 'Source Code Pro', desc: 'Monospaciada limpia y neutral de Adobe.', cat: 'monospace', label: 'Monospace' },
  { value: 'IBM Plex Mono', desc: 'Basada en la ingeniería clásica de IBM.', cat: 'monospace', label: 'Monospace' },
  { value: 'Inconsolata', desc: 'Sublime tipografía mono muy cercana al clásico Consolas.', cat: 'monospace', label: 'Monospace' },
  { value: 'Courier Prime', desc: 'Remasterización del estilo de máquina de escribir clásica.', cat: 'monospace', label: 'Monospace' },
  { value: 'Ubuntu Mono', desc: 'Variante mono de Ubuntu con formas de curvas suaves.', cat: 'monospace', label: 'Monospace' },
  { value: 'DM Mono', desc: 'Estilo minimalista condensado para terminales limpios.', cat: 'monospace', label: 'Monospace' },
  { value: 'Anonymous Pro', desc: 'Diseñada para programadores, con caracteres muy legibles.', cat: 'monospace', label: 'Monospace' },

  // Handwriting/Script
  { value: 'Great Vibes', desc: 'Caligrafía cursiva clásica con trazos largos y elegantes.', cat: 'handwriting', label: 'Script' },
  { value: 'Caveat', desc: 'Tipografía de escritura a mano fluida y muy natural.', cat: 'handwriting', label: 'Script' },
  { value: 'Pacifico', desc: 'Cursiva retro inspirada en la cultura surf norteamericana.', cat: 'handwriting', label: 'Script' },
  { value: 'Dancing Script', desc: 'Cursiva informal y dinámica con trazos orgánicos.', cat: 'handwriting', label: 'Script' },
  { value: 'Sacramento', desc: 'Línea fina y trazos continuos, elegante y sofisticada.', cat: 'handwriting', label: 'Script' },
  { value: 'Satisfy', desc: 'Brush script contemporánea de curvas fluidas e informales.', cat: 'handwriting', label: 'Script' },
  { value: 'Yellowtail', desc: 'Pincelada plana con toques vintage muy amigables.', cat: 'handwriting', label: 'Script' },
  { value: 'Alex Brush', desc: 'Caligrafía fluida con trazos elegantes de altura corta.', cat: 'handwriting', label: 'Script' },
  { value: 'Allura', desc: 'Estilo manuscrito de trazos finos y sumamente aireados.', cat: 'handwriting', label: 'Script' },
  { value: 'Pinyon Script', desc: 'Cursiva ultra-inclinada aristocrática y de gran lujo.', cat: 'handwriting', label: 'Script' }
];

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
      style={{ pointerEvents: 'auto' }} // Permitimos eventos en el contenedor
    >
      {/* Blob 1 — primary, arriba-izquierda */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.x * 1.2}px, ${glowOffset.y * 1.2}px, 0)`,
        }}
        className="absolute w-[620px] h-[580px] top-[-20%] left-[-5%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color1,
            animation: 'floatBlob1 25s ease-in-out infinite, morphBlob1 18s ease-in-out infinite'
          }}
          className="w-full h-full blur-[45px] opacity-70"
        />
      </div>

      {/* Blob 2 — accent, abajo-derecha */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.x * -0.9}px, ${glowOffset.y * -0.9}px, 0)`,
        }}
        className="absolute w-[580px] h-[560px] bottom-[-20%] right-[-5%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color2,
            animation: 'floatBlob2 30s ease-in-out infinite, morphBlob2 22s ease-in-out infinite'
          }}
          className="w-full h-full blur-[50px] opacity-65"
        />
      </div>

      {/* Blob 3 — rosa, centro */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.y * 0.8}px, ${glowOffset.x * 0.8}px, 0)`,
        }}
        className="absolute w-[420px] h-[380px] top-[20%] left-[35%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color3,
            animation: 'floatBlob3 20s ease-in-out infinite, morphBlob3 14s ease-in-out infinite'
          }}
          className="w-full h-full blur-[40px] opacity-55"
        />
      </div>

      {/* Blob 4 — accent secundario, arriba-derecha */}
      <div 
        style={{
          transform: `translate3d(${glowOffset.x * 0.6}px, ${glowOffset.y * -0.6}px, 0)`,
        }}
        className="absolute w-[370px] h-[340px] top-[-5%] right-[15%] pointer-events-none will-change-transform z-1"
      >
        <div
          style={{
            backgroundColor: color2,
            animation: 'floatBlob4 35s ease-in-out infinite, morphBlob4 26s ease-in-out infinite'
          }}
          className="w-full h-full blur-[55px] opacity-45"
        />
      </div>

      {/* Overlay glassmorphism sutil */}
      <div className="absolute inset-0 backdrop-blur-[20px] bg-[var(--color-bg)]/10 z-2 pointer-events-none" />

      <style dangerouslySetInnerHTML={{__html: `
        /* === FLOAT KEYFRAMES === */
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

        /* === MORPH KEYFRAMES — formas orgánicas irregulares === */
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

// ─── Custom Cursor (solo desktop) ────────────────────────────────────────────
// Dot SVG renderizado a nivel OS (cero latencia JS) — 4 4 = hotspot centrado
const DOT_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'><circle cx='4' cy='4' r='3.5' fill='%238b5cf6'/><circle cx='4' cy='4' r='3.5' fill='%238b5cf6' opacity='0.5' filter='blur(2px)'/></svg>`;
const DOT_CURSOR = `url("data:image/svg+xml,${DOT_SVG}") 4 4, none`;

function CustomCursor() {
  const ringRef    = useRef(null);
  const mouse      = useRef({ x: -200, y: -200 });
  const scaleRef   = useRef(1);
  const rafRef     = useRef(null);
  const isHoverRef = useRef(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    let styleEl = null;
    let targetScale = 1.0;

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${e.clientX - 20}px, ${e.clientY - 20}px) scale(${scaleRef.current})`;
      }

      const el = e.target.closest('button,a,input,select,textarea,[role="button"],label,[tabindex]');
      const hover = !!el;
      if (hover !== isHoverRef.current) {
        isHoverRef.current = hover;
        targetScale = hover ? 1.5 : 1.0;
      }
    };

    const onFirstMove = () => {
      setActivated(true);

      styleEl = document.createElement('style');
      styleEl.id = 'ccursor-style';
      styleEl.textContent = `*,*::before,*::after{cursor:${DOT_CURSOR}!important}`;
      document.head.appendChild(styleEl);

      window.removeEventListener('mousemove', onFirstMove);
      window.addEventListener('mousemove', onMove, { passive: true });
      rafRef.current = requestAnimationFrame(tick);
    };

    const onDown = () => {
      if (ringRef.current) ringRef.current.style.opacity = '0.4';
    };
    const onUp = () => {
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    const tick = () => {
      scaleRef.current += (targetScale - scaleRef.current) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${mouse.current.x - 20}px, ${mouse.current.y - 20}px) scale(${scaleRef.current})`;
        ringRef.current.style.borderColor = isHoverRef.current
          ? 'rgba(139,92,246,1)' : 'rgba(139,92,246,0.6)';
        ringRef.current.style.backgroundColor = isHoverRef.current
          ? 'rgba(139,92,246,0.08)' : 'transparent';
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onFirstMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onFirstMove);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.getElementById('ccursor-style')?.remove();
    };
  }, []);

  if (!activated) return null;

  return (
    <div
      ref={ringRef}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '1.5px solid rgba(139,92,246,0.6)',
        backgroundColor: 'transparent',
        willChange: 'transform',
        transformOrigin: 'center center',
      }}
    />
  );
}

function CustomSelect({ value, onChange, options, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOption = options.find(opt => (opt.id !== undefined ? opt.id : opt) === value)
  const selectedLabel = selectedOption ? (selectedOption.name || selectedOption.label || selectedOption.id || selectedOption) : value

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border rounded-xl px-3 py-2 text-xs font-semibold w-full text-[var(--color-text)] outline-none flex items-center justify-between transition-all cursor-pointer select-none ${
          isOpen ? 'border-indigo-500/40' : 'border-[var(--color-border)] hover:border-indigo-500/30'
        } ${className || ''}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={12} className={`text-[var(--color-text-muted)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl shadow-black/30 py-1 max-h-60 overflow-y-auto backdrop-blur-md animate-scale-up origin-top">
          {options.map(opt => {
            const id = opt.id !== undefined ? opt.id : opt
            const label = opt.name || opt.label || opt.id || opt
            const isSelected = id === value
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChange({ target: { value: id } })
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-indigo-400' : 'bg-[var(--color-border)]'}`} />
                <span className="truncate">{label}</span>
                {isSelected && <Check size={11} className="ml-auto text-indigo-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
      { name: 'Classic Denim', primary: '#2563eb', secondary: '#93c5fd', bg: '#0a1128', text: '#f0fdfa' },
      { name: 'Peach Pastel', primary: '#fb923c', secondary: '#ffedd5', bg: '#1c0d02', text: '#fffcf9' },
      { name: 'Vibrant Fuchsia', primary: '#d946ef', secondary: '#f5d0fe', bg: '#0f0312', text: '#fdf4ff' },
      { name: 'Urban Olive', primary: '#84cc16', secondary: '#bef264', bg: '#101407', text: '#f7fee7' }
    ]
  },
  {
    id: "technical_services",
    name: "⚙️ Tornerías y Mecanizado de Precisión",
    palettes: [
      { name: 'Steel Precision', primary: '#475569', secondary: '#94a3b8', bg: '#0f172a', text: '#f8fafc' },
      { name: 'Industrial Amber', primary: '#f59e0b', secondary: '#d97706', bg: '#0f0f0c', text: '#fffdfa' },
      { name: 'Titanium Blue', primary: '#0284c7', secondary: '#38bdf8', bg: '#080f1e', text: '#f0f9ff' },
      { name: 'Iron Red', primary: '#b91c1c', secondary: '#f87171', bg: '#110606', text: '#fef2f2' },
      { name: 'Carbon Dark', primary: '#1e293b', secondary: '#64748b', bg: '#020617', text: '#f1f5f9' },
      { name: 'Laser Green', primary: '#22c55e', secondary: '#86efac', bg: '#021608', text: '#f0fdf4' },
      { name: 'Brass Glow', primary: '#ca8a04', secondary: '#fef08a', bg: '#161305', text: '#fefdf0' },
      { name: 'Copper Oxide', primary: '#ea580c', secondary: '#fdba74', bg: '#180b05', text: '#fff7ed' },
      { name: 'Graphite Matte', primary: '#52525b', secondary: '#a1a1aa', bg: '#09090b', text: '#f4f4f5' },
      { name: 'Cobalt Tough', primary: '#1d4ed8', secondary: '#60a5fa', bg: '#050b18', text: '#eff6ff' }
    ]
  },
  {
    id: "refrigeration_ac",
    name: "❄️ Refrigeración y Climatización",
    palettes: [
      { name: 'Arctic Ice', primary: '#0ea5e9', secondary: '#38bdf8', bg: '#030f1d', text: '#f0f9ff' },
      { name: 'Cyan Thermal', primary: '#06b6d4', secondary: '#22d3ee', bg: '#021114', text: '#ecfeff' },
      { name: 'Deep Glacier', primary: '#2563eb', secondary: '#60a5fa', bg: '#08132e', text: '#eff6ff' },
      { name: 'Frost Teal', primary: '#0d9488', secondary: '#5eead4', bg: '#021110', text: '#f2fbf9' },
      { name: 'Winter Blue', primary: '#1e40af', secondary: '#93c5fd', bg: '#0b1836', text: '#f8fafc' },
      { name: 'Breeze Green', primary: '#10b981', secondary: '#6ee7b7', bg: '#031810', text: '#f0fdf4' },
      { name: 'Airflow Silver', primary: '#64748b', secondary: '#cbd5e1', bg: '#0f172a', text: '#f8fafc' },
      { name: 'Polar Aurora', primary: '#06b6d4', secondary: '#34d399', bg: '#031214', text: '#f0fdfa' },
      { name: 'Thermal Balance', primary: '#0284c7', secondary: '#f97316', bg: '#060f1b', text: '#f0f9ff' },
      { name: 'Neon Frost', primary: '#00f0ff', secondary: '#7000ff', bg: '#05030f', text: '#f6f3ff' }
    ]
  },
  {
    id: "contractors",
    name: "📐 Contratistas y Construcción",
    palettes: [
      { name: 'Safety Orange', primary: '#f97316', secondary: '#fdba74', bg: '#160d06', text: '#fffaf5' },
      { name: 'Hard Hat Yellow', primary: '#eab308', secondary: '#fef08a', bg: '#141103', text: '#fefdf0' },
      { name: 'Cement Gray', primary: '#4b5563', secondary: '#9ca3af', bg: '#111827', text: '#f9fafb' },
      { name: 'Structure Blue', primary: '#1d4ed8', secondary: '#93c5fd', bg: '#0b122c', text: '#f0f7ff' },
      { name: 'Forest Timber', primary: '#15803d', secondary: '#86efac', bg: '#051608', text: '#f0fdf4' },
      { name: 'Brick Red', primary: '#b91c1c', secondary: '#fca5a5', bg: '#1a0505', text: '#fff5f5' },
      { name: 'Asphalt Dark', primary: '#1f2937', secondary: '#6b7280', bg: '#030712', text: '#f9fafb' },
      { name: 'Copper Pipes', primary: '#d97706', secondary: '#fbbf24', bg: '#130f04', text: '#fefdf5' },
      { name: 'Slate Roof', primary: '#334155', secondary: '#475569', bg: '#0f172a', text: '#f8fafc' },
      { name: 'Safety Green', primary: '#84cc16', secondary: '#bef264', bg: '#0e1405', text: '#f7fee7' }
    ]
  },
  {
    id: "machinery_rental",
    name: "🚜 Alquiler de Maquinaria y Equipos",
    palettes: [
      { name: 'Caterpillar Yellow', primary: '#eab308', secondary: '#ca8a04', bg: '#0d0b01', text: '#fefdf0' },
      { name: 'Deere Green', primary: '#16a34a', secondary: '#ca8a04', bg: '#061208', text: '#f0fdf4' },
      { name: 'Kubota Orange', primary: '#ea580c', secondary: '#f97316', bg: '#140904', text: '#fff7ed' },
      { name: 'Heavy Steel', primary: '#374151', secondary: '#9ca3af', bg: '#111827', text: '#f9fafb' },
      { name: 'Warning Amber', primary: '#f59e0b', secondary: '#fbbf24', bg: '#161105', text: '#fffbeb' },
      { name: 'Hydraulic Blue', primary: '#0252cf', secondary: '#2563eb', bg: '#080d1e', text: '#f0f7ff' },
      { name: 'Industrial Black', primary: '#111827', secondary: '#4b5563', bg: '#030712', text: '#f9fafb' },
      { name: 'Safety Contrast', primary: '#d97706', secondary: '#475569', bg: '#0e0d06', text: '#fefdfa' },
      { name: 'High Vis Green', primary: '#a3e635', secondary: '#84cc16', bg: '#0c1203', text: '#f7fee7' },
      { name: 'Rust Steel', primary: '#9a3412', secondary: '#c2410c', bg: '#180803', text: '#fff7ed' }
    ]
  },
  {
    id: "carpentry",
    name: "🪚 Carpinterías y Muebles",
    palettes: [
      { name: 'Cedar Wood', primary: '#854d0e', secondary: '#a16207', bg: '#130c04', text: '#fefcf0' },
      { name: 'Mahogany Red', primary: '#7f1d1d', secondary: '#991b1b', bg: '#160404', text: '#fff5f5' },
      { name: 'Pine Fresh', primary: '#166534', secondary: '#15803d', bg: '#061208', text: '#f0fdf4' },
      { name: 'Natural Oak', primary: '#b45309', secondary: '#d97706', bg: '#170e05', text: '#fefaf0' },
      { name: 'Charcoal Modern', primary: '#1e293b', secondary: '#475569', bg: '#0f172a', text: '#f8fafc' },
      { name: 'Warm Chestnut', primary: '#c2410c', secondary: '#ea580c', bg: '#190d05', text: '#fff7ed' },
      { name: 'Birch Minimal', primary: '#d97706', secondary: '#fcd34d', bg: '#181308', text: '#fefdf5' },
      { name: 'Forest Green', primary: '#065f46', secondary: '#0f766e', bg: '#030f0c', text: '#f2fbf9' },
      { name: 'Varnish Gold', primary: '#ca8a04', secondary: '#fbbf24', bg: '#141103', text: '#fefdf0' },
      { name: 'Nordic Slate', primary: '#9ca3af', secondary: '#4b5563', bg: '#111827', text: '#e5e7eb' }
    ]
  },
  {
    id: "laundry",
    name: "🧺 Lavanderías y Tintorerías",
    palettes: [
      { name: 'Clean Breeze', primary: '#06b6d4', secondary: '#0891b2', bg: '#041113', text: '#ecfeff' },
      { name: 'Soft Lavender', primary: '#a855f7', secondary: '#c084fc', bg: '#0d0515', text: '#faf5ff' },
      { name: 'Oxygen Blue', primary: '#2563eb', secondary: '#60a5fa', bg: '#0b132c', text: '#eff6ff' },
      { name: 'Fresh Mint', primary: '#10b981', secondary: '#a7f3d0', bg: '#031710', text: '#ecfdf5' },
      { name: 'Suds White', primary: '#3b82f6', secondary: '#60a5fa', bg: '#0c101d', text: '#f8fafc' },
      { name: 'Sunny Cotton', primary: '#fbbf24', secondary: '#fef08a', bg: '#161103', text: '#fefdf0' },
      { name: 'Marine Splash', primary: '#0ea5e9', secondary: '#67e8f9', bg: '#040f1a', text: '#f0fdfa' },
      { name: 'Gentle Rose', primary: '#ec4899', secondary: '#fbcfe8', bg: '#170511', text: '#fdf2f8' },
      { name: 'Pure Linen', primary: '#64748b', secondary: '#cbd5e1', bg: '#0f172a', text: '#f8fafc' },
      { name: 'Citrus Fresh', primary: '#84cc16', secondary: '#a3e635', bg: '#0d1403', text: '#f7fee7' }
    ]
  },
  {
    id: "furniture_repair",
    name: "🛋️ Restauración y Tapicería de Muebles",
    palettes: [
      { name: 'Vintage Leather', primary: '#7c2d12', secondary: '#9a3412', bg: '#140905', text: '#fff7ed' },
      { name: 'Velvet Plum', primary: '#701a75', secondary: '#86198f', bg: '#140316', text: '#fdf4ff' },
      { name: 'Classic Walnut', primary: '#5c2c16', secondary: '#78350f', bg: '#100803', text: '#fffbeb' },
      { name: 'Brass Detail', primary: '#b45309', secondary: '#fbbf24', bg: '#160e03', text: '#fefdf0' },
      { name: 'Emerald Weave', primary: '#047857', secondary: '#059669', bg: '#02120e', text: '#ecfdf5' },
      { name: 'Linen Beige', primary: '#ca8a04', secondary: '#fde047', bg: '#161304', text: '#fffbeb' },
      { name: 'Antique Indigo', primary: '#312e81', secondary: '#4338ca', bg: '#080718', text: '#e0e7ff' },
      { name: 'Sage Weave', primary: '#15803d', secondary: '#4ade80', bg: '#051608', text: '#f0fdf4' },
      { name: 'Bronze Classic', primary: '#854d0e', secondary: '#d97706', bg: '#150f04', text: '#fffbf0' },
      { name: 'Terracotta Earth', primary: '#c2410c', secondary: '#f97316', bg: '#170903', text: '#fffaf0' }
    ]
  },
  {
    id: "wellness_podology",
    name: "💆 Estética, Podología y Bienestar",
    palettes: [
      { name: 'Zen Teal', primary: '#0d9488', secondary: '#2dd4bf', bg: '#031312', text: '#f2fbf9' },
      { name: 'Rose Petal', primary: '#ec4899', secondary: '#f472b6', bg: '#170511', text: '#fdf2f8' },
      { name: 'Lavender Calm', primary: '#8b5cf6', secondary: '#a78bfa', bg: '#0b0518', text: '#f5f3ff' },
      { name: 'Sakura Blossom', primary: '#db2777', secondary: '#f472b6', bg: '#170410', text: '#fff1f2' },
      { name: 'Eucalyptus Fresh', primary: '#10b981', secondary: '#34d399', bg: '#031610', text: '#ecfdf5' },
      { name: 'Orchid Dream', primary: '#d946ef', secondary: '#f5d0fe', bg: '#120316', text: '#fdf4ff' },
      { name: 'Mineral Clay', primary: '#475569', secondary: '#cbd5e1', bg: '#0f172a', text: '#f8fafc' },
      { name: 'Warm Peach', primary: '#f97316', secondary: '#fdba74', bg: '#170d06', text: '#fffaf0' },
      { name: 'Soft Sky', primary: '#0ea5e9', secondary: '#38bdf8', bg: '#080f1e', text: '#f0f9ff' },
      { name: 'Pure Herbal', primary: '#15803d', secondary: '#a3e635', bg: '#051608', text: '#f7fee7' }
    ]
  },
  {
    id: "grocery_food",
    name: "🍎 Minimarkets y Alimentos",
    palettes: [
      { name: 'Tomato Fresh', primary: '#ef4444', secondary: '#f87171', bg: '#1a0505', text: '#fff5f5' },
      { name: 'Organic Green', primary: '#16a34a', secondary: '#4ade80', bg: '#051508', text: '#f0fdf4' },
      { name: 'Banana Sweet', primary: '#eab308', secondary: '#fde047', bg: '#131001', text: '#fefdf0' },
      { name: 'Blueberry Rich', primary: '#1d4ed8', secondary: '#3b82f6', bg: '#050a1b', text: '#eff6ff' },
      { name: 'Citrus Orange', primary: '#f97316', secondary: '#fb923c', bg: '#170c04', text: '#fffaf0' },
      { name: 'Carrot Glow', primary: '#ea580c', secondary: '#fdba74', bg: '#160802', text: '#fff7ed' },
      { name: 'Apple Green', primary: '#84cc16', secondary: '#bef264', bg: '#0f1505', text: '#f7fee7' },
      { name: 'Cacao Brown', primary: '#78350f', secondary: '#b45309', bg: '#140a04', text: '#fffbeb' },
      { name: 'Clean Dairy', primary: '#0ea5e9', secondary: '#38bdf8', bg: '#09101d', text: '#f0f9ff' },
      { name: 'Wine Red', primary: '#991b1b', secondary: '#f87171', bg: '#180404', text: '#fff5f5' }
    ]
  }
];

export default function App() {
  const { showAlert, showConfirm } = useAlertConfirm()
  const { toast, showToast, hideToast } = useToast()
  const [isCopied, copy] = useCopyToClipboard()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [activeMetricModal, setActiveMetricModal] = useState(null)
  const [newClientName, setNewClientName] = useState('')
  const [selectedCrmClientId, setSelectedCrmClientId] = useState(null)
  const [crmSearch, setCrmSearch] = useState('')
  const [clientesSaas, setClientesSaas] = useState([
    { id: 'ventas-smartfix', comisionPorcentaje: 1.5 },
    { id: 'tienda-calzado-x', comisionPorcentaje: 2.0 },
    { id: 'restaurante-gourmet', comisionPorcentaje: 1.0 },
    { id: 'minimercado-central', comisionPorcentaje: 1.2 },
    { id: 'moda-express', comisionPorcentaje: 1.8 },
    { id: 'ferreteria-nacional', comisionPorcentaje: 1.5 }
  ])
  const [telemetryTokens, setTelemetryTokens] = useState([])
  const [onboardingData, setOnboardingData] = useState(null)

  // Estados para el aprovisionamiento de nuevo cliente
  const [billingMode, setBillingMode] = useState('percentage')
  const [comisionPorcentaje, setComisionPorcentaje] = useState(1.5)
  const [montoFijoServicio, setMontoFijoServicio] = useState(500)
  const [pagoMensualFijo, setPagoMensualFijo] = useState(50000)
  const [niche, setNiche] = useState('retail_clothing')

  // Estados de edición para CRM de clientes
  const [editNiche, setEditNiche] = useState('retail_clothing')
  const [editBillingMode, setEditBillingMode] = useState('percentage')
  const [crmTab, setCrmTab] = useState('config') // 'config' | 'drift'
  const [driftData, setDriftData] = useState(null)
  const [driftLoading, setDriftLoading] = useState(false)
  const [activeDiffFile, setActiveDiffFile] = useState(null)
  const [syncingFile, setSyncingFile] = useState({})
  const [editComisionPorcentaje, setEditComisionPorcentaje] = useState(1.5)
  const [editMontoFijoServicio, setEditMontoFijoServicio] = useState(500)
  const [editPagoMensualFijo, setEditPagoMensualFijo] = useState(50000)
  const [editEnableDianBilling, setEditEnableDianBilling] = useState(false)
  const [editCostoPorFacturaDian, setEditCostoPorFacturaDian] = useState(150)

  const [fbApiKey, setFbApiKey] = useState('')
  const [fbAuthDomain, setFbAuthDomain] = useState('')
  const [fbProjectId, setFbProjectId] = useState('')
  const [fbStorageBucket, setFbStorageBucket] = useState('')
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState('')
  const [fbAppId, setFbAppId] = useState('')
  const [targetPath, setTargetPath] = useState('')
  const [templates, setTemplates] = useState([
    { id: 'template-core-seed', name: 'Crear desde cero' }
  ])
  const [selectedTemplate, setSelectedTemplate] = useState('template-core-seed')
  const [isRegistering, setIsRegistering] = useState(false)
  const [enableGithub, setEnableGithub] = useState(true)
  const [enableFirebaseDeploy, setEnableFirebaseDeploy] = useState(true)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [isFetchingConfig, setIsFetchingConfig] = useState(false)
  const [fbVapidKey, setFbVapidKey] = useState('')
  const [autoProvisionFirebase, setAutoProvisionFirebase] = useState(false)
  // Logo & Validation States (Mejoras de Robustez)
  const [logoFilename, setLogoFilename] = useState('')
  const [logoBase64, setLogoBase64] = useState('')
  const [logoLocalPath, setLogoLocalPath] = useState('')
  const [isValidatingCredentials, setIsValidatingCredentials] = useState(false)
  const [credentialsValidationError, setCredentialsValidationError] = useState(null)
  const [isCredentialsValidated, setIsCredentialsValidated] = useState(false)
  const [pendingCliProvisioning, setPendingCliProvisioning] = useState(null)

  // Onboarding & Branding premium states
  const [isOnboardingActive, setIsOnboardingActive] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [secondaryColor, setSecondaryColor] = useState('#a855f7')
  const [bgColor, setBgColor] = useState('#0f172a')
  const [textColor, setTextColor] = useState('#f8fafc')
  const [googleFont, setGoogleFont] = useState('Inter')
  const [enablePwa, setEnablePwa] = useState(true)
  const [enablePush, setEnablePush] = useState(true)
  const [enableBilling, setEnableBilling] = useState(false)
  const [enableDianBilling, setEnableDianBilling] = useState(false)
  const [costoPorFacturaDian, setCostoPorFacturaDian] = useState(150)
  const [customRequirements, setCustomRequirements] = useState('')
  const [wizardTab, setWizardTab] = useState('server')
  const [expandedPaletteCategory, setExpandedPaletteCategory] = useState('retail_clothing')
  const [isFontModalOpen, setIsFontModalOpen] = useState(false)
  const [fontSearchQuery, setFontSearchQuery] = useState('')
  const [fontCategoryFilter, setFontCategoryFilter] = useState('all')
  const [historyPage, setHistoryPage] = useState(1)
  const [showArchivedHistory, setShowArchivedHistory] = useState(false)
  const [selectedDiagnosticError, setSelectedDiagnosticError] = useState(null)
  const [codeSnippet, setCodeSnippet] = useState(null)
  const [loadingCode, setLoadingCode] = useState(false)
  const [codeError, setCodeError] = useState(null)

  // Estados Interactivos del Mockup de Smartphone en Vista Previa
  const [mockActiveTab, setMockActiveTab] = useState('inicio')
  const [mockOrders, setMockOrders] = useState([
    { id: 1, title: 'iPhone 15 Pro Max', time: 'Hace 5 min', val: 4800000 },
    { id: 2, title: 'Servicio Técnico Calzado', time: 'Hace 2 horas', val: 150000 },
    { id: 3, title: 'Licencia Premium de Instancia', time: 'Ayer', val: 350000 }
  ])
  const [mockIsNewSaleOpen, setMockIsNewSaleOpen] = useState(false)
  const [mockNewSaleTitle, setMockNewSaleTitle] = useState('')
  const [mockNewSaleValue, setMockNewSaleValue] = useState('')
  const [mockTheme, setMockTheme] = useState('dark')


  // Pre-load all Google Fonts for previews when onboarding is active
  useEffect(() => {
    if (!isOnboardingActive) return;
    const allFontsId = 'all-preview-fonts';
    let link = document.getElementById(allFontsId);
    if (!link) {
      link = document.createElement('link');
      link.id = allFontsId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const families = AVAILABLE_FONTS.map(f => `family=${f.value.replace(/ /g, '+')}:wght@400;600;700`).join('&');
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }, [isOnboardingActive]);

  // Dynamic font loader for premium mobile preview
  useEffect(() => {
    const fontId = 'dynamic-preview-font';
    let link = document.getElementById(fontId);
    if (!link) {
      link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${googleFont.replace(' ', '+')}:wght@400;600;800&display=swap`;
  }, [googleFont]);

  // Carga reactiva de fragmento de código para diagnóstico de errores
  useEffect(() => {
    if (!selectedDiagnosticError) {
      setCodeSnippet(null);
      setCodeError(null);
      return;
    }

    const getFileAndLine = () => {
      const text = `${selectedDiagnosticError.errorMsg || ''}\n${selectedDiagnosticError.stack || ''}`;
      const srcRegex = /(src\/[a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9]+)(?:\?[^:]*)?:(\d+)/i;
      const srcMatch = text.match(srcRegex);
      if (srcMatch) return { file: srcMatch[1], line: parseInt(srcMatch[2]) || null };
      
      const stackLines = (selectedDiagnosticError.stack || '').split('\n');
      for (const line of stackLines) {
        if (line.includes('node_modules') || line.includes('installHook.js') || line.includes('react-dom') || line.includes('react.development')) {
          continue;
        }
        const fileLineRegex = /([\w\-\/.]+\.[jt]sx?)(?:\?[^:]*)?:(\d+)/i;
        const match = line.match(fileLineRegex);
        if (match) {
          let file = match[1];
          if (file === 'App.jsx') file = 'src/App.jsx';
          return { file, line: parseInt(match[2]) || null };
        }
      }
      return { file: null, line: null };
    };

    const { file, line } = getFileAndLine();
    if (!file || file === 'N/A') {
      setCodeSnippet(null);
      setCodeError('No se pudo identificar una ruta de archivo válida en el error.');
      return;
    }

    setLoadingCode(true);
    setCodeError(null);

    fetch(`http://localhost:3001/api/project/file?clientId=${encodeURIComponent(selectedDiagnosticError.clientId)}&relativePath=${encodeURIComponent(file)}`)
      .then(res => {
        if (!res.ok) throw new Error('El archivo no está accesible en el servidor local o la CLI Bridge no está corriendo.');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setCodeSnippet({
            content: data.content,
            file: data.filePath,
            targetLine: line
          });
        } else {
          throw new Error(data.error || 'Fallo desconocido.');
        }
      })
      .catch(err => {
        console.error('Error al cargar fragmento de código:', err);
        setCodeError(err.message);
      })
      .finally(() => {
        setLoadingCode(false);
      });
  }, [selectedDiagnosticError]);

  // Control de Tema Claro/Oscuro
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Estados de carga, búsqueda y UI general
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [localServers, setLocalServers] = useState({})
  const [isSimulated, setIsSimulated] = useState(false)
  const [dbStatus, setDbStatus] = useState('conectando')
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true)
  const [telemetryClientFilter, setTelemetryClientFilter] = useState('todos')
  const [telemetryTypeFilter, setTelemetryTypeFilter] = useState('todos')
  const [telemetrySearchQuery, setTelemetrySearchQuery] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [systemLogs, setSystemLogs] = useState([])
  const [logPage, setLogPage] = useState(1)
  const [crmStatusFilter, setCrmStatusFilter] = useState('todos')

  // --- NAVEGACIÓN POR TABS ---
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [livePreviewComponent, setLivePreviewComponent] = useState(null)

  const [failures, setFailures] = useState([])
  const [selectedErrorClientFilter, setSelectedErrorClientFilter] = useState('todos')
  const [expandedErrorId, setExpandedErrorId] = useState(null)
  const [errorsPage, setErrorsPage] = useState(1)
  
  // --- MODAL DE SIMULACIÓN DE FALLOS AVANZADO ---
  const [isSimulateFailureModalOpen, setIsSimulateFailureModalOpen] = useState(false)
  const [simFailureClientId, setSimFailureClientId] = useState('')
  const [simFailureManualClientId, setSimFailureManualClientId] = useState('')
  const [simFailureNiche, setSimFailureNiche] = useState('Ropa y Calzado')
  const [simFailureErrorType, setSimFailureErrorType] = useState('0')
  const [simFailureCustomMsg, setSimFailureCustomMsg] = useState('')
  const [simFailureCustomStack, setSimFailureCustomStack] = useState('')
  const [simFailureType, setSimFailureType] = useState('error')
  const [simFailureSource, setSimFailureSource] = useState('automatic')

  // --- CRM: BATCH SYNC Y DEPLOY TERMINAL ---
  const [isBulkSyncModalOpen, setIsBulkSyncModalOpen] = useState(false)
  const [bulkSyncFiles, setBulkSyncFiles] = useState({})
  const [bulkSyncLoading, setBulkSyncLoading] = useState(false)

  const [isDeployTerminalOpen, setIsDeployTerminalOpen] = useState(false)
  const [deployTerminalClientId, setDeployTerminalClientId] = useState('')
  const [deployLogs, setDeployLogs] = useState([])
  const [deployState, setDeployState] = useState('idle') // idle | running | success | failed
  const [deployProgressPercent, setDeployProgressPercent] = useState(0)
  const [deployAuditScore, setDeployAuditScore] = useState(null)
  const [deployError, setDeployError] = useState(null)
  const [deployForce, setDeployForce] = useState(false)

  // --- CRM: GLOBAL BATCH SYNC Y DEPLOY QUEUES ---
  const [isGlobalSyncConfigModalOpen, setIsGlobalSyncConfigModalOpen] = useState(false)
  const [globalSyncCheckedClients, setGlobalSyncCheckedClients] = useState({})
  const [isGlobalSyncProcessActive, setIsGlobalSyncProcessActive] = useState(false)
  const [globalSyncCurrentClient, setGlobalSyncCurrentClient] = useState('')

  const [isGlobalDeployConfigModalOpen, setIsGlobalDeployConfigModalOpen] = useState(false)
  const [globalDeployCheckedClients, setGlobalDeployCheckedClients] = useState({})
  const [deployQueue, setDeployQueue] = useState([])
  const [deployQueueIndex, setDeployQueueIndex] = useState(-1)

  const [isGlobalTelemetryModalOpen, setIsGlobalTelemetryModalOpen] = useState(false)
  const [globalTelemetryCheckedClients, setGlobalTelemetryCheckedClients] = useState({})

  // --- SIMULADOR DE PROYECCIONES DE INGRESOS ---
  const [projNewClients, setProjNewClients] = useState(3)
  const [projAvgSales, setProjAvgSales] = useState(8000000)
  const [projRate, setProjRate] = useState(1.5)
  const [projMonths, setProjMonths] = useState(12)

  // --- GESTOR DE PLANTILLAS WHATSAPP ---
  const [waTemplates, setWaTemplates] = useState([
    {
      id: 'recordatorio-simple',
      name: 'Recordatorio Simple',
      body: 'Hola *{cliente}*, te informamos que la comisión del periodo *{periodo}* por valor de *${comision}* está pendiente. ¡Gracias por tu atención!'
    },
    {
      id: 'recordatorio-urgente',
      name: 'Recordatorio Urgente',
      body: '⚠️ *{cliente}*, tu saldo de comisión del mes *{periodo}* por *${comision}* aún no ha sido recibido. Por favor regulariza para evitar inconvenientes con el servicio.'
    },
    {
      id: 'confirmacion-pago',
      name: 'Confirmación de Pago Recibido',
      body: '✅ Hola *{cliente}*, confirmamos recibo del pago de comisión correspondiente al periodo *{periodo}* por *${comision}*. ¡Muchas gracias!'
    }
  ])
  const [selectedWaTemplate, setSelectedWaTemplate] = useState('recordatorio-simple')
  const [waClientId, setWaClientId] = useState('')
  const [waPeriodo, setWaPeriodo] = useState(() => new Date().toISOString().substring(0, 7))
  const [waComision, setWaComision] = useState('')
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [editingTemplateBody, setEditingTemplateBody] = useState('')

  // Listado unificado de clientes que envían telemetría
  const telemetryClientsList = useMemo(() => {
    const ids = new Set([
      ...clientesSaas.map(c => c.id),
      ...reports.map(r => r.clientId),
      ...failures.map(f => f.clientId),
      ...systemLogs.map(l => l.client).filter(Boolean)
    ])
    return Array.from(ids).map(id => {
      const failuresCount = failures.filter(f => f.clientId === id && !f.resolved).length
      const billingCount = reports.filter(r => r.clientId === id).length
      const config = clientesSaas.find(c => c.id === id) || {}
      return {
        id,
        name: config.clientName || id,
        failuresCount,
        billingCount,
        niche: config.niche || 'general',
        billingMode: config.billingMode || 'percentage'
      }
    })
  }, [clientesSaas, reports, failures, systemLogs])

  // Filtrado avanzado de logs de la consola de telemetría
  const filteredTelemetryLogs = useMemo(() => {
    return systemLogs.filter(log => {
      // Filtro por Cliente
      const matchesClient = telemetryClientFilter === 'todos' || (log.client && log.client.toLowerCase() === telemetryClientFilter.toLowerCase());
      
      // Filtro por Tipo de Log
      let matchesType = true;
      if (telemetryTypeFilter === 'error') {
        matchesType = log.type === 'error';
      } else if (telemetryTypeFilter === 'billing') {
        matchesType = log.type === 'success' && (log.message.includes('facturación') || log.message.includes('cobro') || log.message.includes('Billing') || log.message.includes('reportes'));
      } else if (telemetryTypeFilter === 'info_warning') {
        matchesType = log.type === 'info' || log.type === 'warning';
      }
      
      // Filtro por caja de búsqueda de texto
      const matchesSearch = !telemetrySearchQuery || 
                            log.message.toLowerCase().includes(telemetrySearchQuery.toLowerCase()) || 
                            (log.client && log.client.toLowerCase().includes(telemetrySearchQuery.toLowerCase()));
      
      return matchesClient && matchesType && matchesSearch;
    });
  }, [systemLogs, telemetryClientFilter, telemetryTypeFilter, telemetrySearchQuery])

  const getClientRate = (clientId) => {
    const configObj = clientesSaas.find(c => c.id.toLowerCase() === clientId.toLowerCase())
    return configObj && configObj.comisionPorcentaje !== undefined ? parseFloat(configObj.comisionPorcentaje) : 1.5
  }

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Cola Reactiva de Despliegue Global
  useEffect(() => {
    if (deployQueueIndex >= 0 && deployQueueIndex < deployQueue.length) {
      const nextClientId = deployQueue[deployQueueIndex];
      addLog(`[Cola Global] Iniciando despliegue de (${deployQueueIndex + 1}/${deployQueue.length}): ${nextClientId}...`, "info");
      handleDeployClient(nextClientId, false);
    } else if (deployQueueIndex >= deployQueue.length && deployQueue.length > 0) {
      addLog(`[Cola Global] Proceso de despliegue en lote completado.`, "success");
      showToast("Despliegue global finalizado.", { type: 'success' });
      setDeployQueue([]);
      setDeployQueueIndex(-1);
    }
  }, [deployQueueIndex]);

  useEffect(() => {
    if (deployQueueIndex >= 0 && (deployState === 'success' || deployState === 'failed')) {
      const timer = setTimeout(() => {
        setDeployQueueIndex(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deployState, deployQueueIndex]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Cargar plantillas dinámicamente y catálogo de la biblioteca
  const [libraryList, setLibraryList] = useState([])
  const [selectedRecomendations, setSelectedRecomendations] = useState([])

  useEffect(() => {
    // 1. Cargar plantillas
    fetch('http://localhost:3001/api/templates')
      .then(res => res.json())
      .then(data => {
        const seedTemplate = { id: 'template-core-seed', name: 'Crear desde cero' }
        const templatesArray = data && Array.isArray(data.templates) ? data.templates : (Array.isArray(data) ? data : []);
        if (templatesArray.length > 0) {
          const list = templatesArray.some(t => (t.id || t) === 'template-core-seed')
            ? templatesArray
            : [seedTemplate, ...templatesArray]
          setTemplates(list)
          if (list.length > 0 && !list.some(t => (t.id || t) === selectedTemplate)) {
            setSelectedTemplate(list[0].id || list[0])
          }
        } else {
          setTemplates([
            seedTemplate,
            { id: 'template-ventas', name: 'Plantilla de Ventas Base (Local)' }
          ])
        }
      })
      .catch(err => {
        console.warn("No se pudo cargar plantillas del backend CLI, usando fallback:", err)
        setTemplates([
          { id: 'template-core-seed', name: 'Crear desde cero' },
          { id: 'template-ventas', name: 'Plantilla de Ventas Base (Local)' }
        ])
      })

    // 2. Cargar catálogo de biblioteca para recomendaciones
    fetch('http://localhost:3001/api/library')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.categories)) {
          setLibraryList(data.categories)
        }
      })
      .catch(err => console.warn("No se pudo cargar catálogo de la biblioteca para recomendaciones:", err))
  }, [])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64Str = event.target.result.split(',')[1]
      setLogoFilename(file.name)
      setLogoBase64(base64Str)
      
      try {
        addLog(`Subiendo y optimizando logo: ${file.name}...`, "info")
        const res = await fetch('http://localhost:3001/api/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64: base64Str })
        })
        const data = await res.json()
        if (data.success) {
          setLogoLocalPath(data.filePath)
          showToast(data.message, { type: 'success' })
          addLog(`Logo procesado con éxito en el servidor. Ruta física: ${data.filePath}`, "info")
        } else {
          showToast(`Error al procesar logo: ${data.error}`, { type: 'error' })
        }
      } catch (err) {
        showToast(`Fallo al conectar con el optimizador: ${err.message}`, { type: 'error' })
      }
    }
    reader.readAsDataURL(file)
  }

  const validateFirebaseCreds = async () => {
    if (!fbApiKey.trim() || !fbProjectId.trim()) return
    setIsValidatingCredentials(true)
    setCredentialsValidationError(null)
    setIsCredentialsValidated(false)
    try {
      const res = await fetch('http://localhost:3001/api/firebase/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: fbApiKey.trim(), projectId: fbProjectId.trim() })
      })
      const data = await res.json()
      if (data.valid) {
        setIsCredentialsValidated(true)
        showToast(data.warning || 'Credenciales de Firebase validadas con éxito.', { type: 'success' })
      } else {
        setCredentialsValidationError(data.error)
        showToast(data.error, { type: 'warning' })
      }
    } catch (err) {
      setCredentialsValidationError(`Error de red: ${err.message}`)
    } finally {
      setIsValidatingCredentials(false)
    }
  }

  // Auto-detectar credenciales Firebase desde el CLI Bridge local
  const handleAutoDetectConfig = async () => {
    const cleanProjectId = fbProjectId.trim()
    if (!cleanProjectId) {
      showToast('Ingresa primero el Firebase Project ID para auto-detectar', { type: 'error' })
      return
    }
    setIsFetchingConfig(true)
    setIsCredentialsValidated(false)
    setCredentialsValidationError(null)
    addLog(`Auto-detectando credenciales Firebase para proyecto: ${cleanProjectId}...`, 'info')
    try {
      const res = await fetch(
        `http://localhost:3001/api/firebase-config?projectId=${encodeURIComponent(cleanProjectId)}&projectName=${encodeURIComponent((newClientName || '').trim() || cleanProjectId)}`
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error desconocido del servidor CLI.')
      }
      const { config, vapidKey } = data
      setFbApiKey((config.apiKey || '').trim())
      setFbAuthDomain((config.authDomain || '').trim())
      setFbStorageBucket((config.storageBucket || '').trim())
      setFbMessagingSenderId((config.messagingSenderId || '').trim())
      setFbAppId((config.appId || '').trim())
      if (vapidKey) {
        setFbVapidKey(vapidKey)
      }
      addLog(`✓ Credenciales Firebase auto-detectadas y cargadas para ${cleanProjectId}.`, 'success')
      showToast('Configuración de Firebase auto-detectada y rellenada ✓', { type: 'success' })
    } catch (err) {
      console.error('Auto-detect error:', err)
      addLog(`Error al auto-detectar config Firebase: ${err.message}`, 'error')
      showToast(`CLI offline o error: ${err.message}. Copia las credenciales manualmente.`, { type: 'error' })
    } finally {
      setIsFetchingConfig(false)
    }
  }

  const handleClientNameChange = (val) => {
    setNewClientName(val)
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setTargetPath(val.trim() ? `D:\\PROTOTIPE\\Instancias Clientes\\App-${slug}` : '')
  }

  // Reintentar solo el aprovisionamiento físico en disco (CLI) cuando Firestore ya fue exitoso
  const handleRetryCliProvisioning = async () => {
    if (!pendingCliProvisioning) return
    const { clientId, nombre, comisionPorcentaje, telemetryToken, payload } = pendingCliProvisioning

    addLog(`[Reintento] Volviendo a contactar el daemon CLI para provisionar: ${clientId}...`, 'warning')
    setIsProvisioning(true)

    try {
      const cliRes = await fetch('http://localhost:3001/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (cliRes.ok) {
        const resData = await cliRes.json()
        const promptResult = resData.prompt || (resData.data && resData.data.prompt) || ''
        addLog(`[CLI API] Reintento exitoso. Proyecto ${clientId} aprovisionado en disco.`, 'success')
        showToast(`Reintento exitoso — ${nombre} aprovisionado en disco ✓`, { type: 'success' })
        setOnboardingData(prev => prev ? { ...prev, prompt: promptResult } : {
          clientId,
          token: telemetryToken,
          comisionPorcentaje,
          vapidKey: payload.firebaseConfig?.vapidKey || '',
          prompt: promptResult
        })
        setPendingCliProvisioning(null)
      } else {
        const errText = await cliRes.text()
        let errMessage = ''
        try {
          const errData = JSON.parse(errText)
          errMessage = errData.error || errData.message || errText
        } catch (_) {
          errMessage = errText
        }
        addLog(`[Reintento fallido] CLI respondió con error: ${errMessage}`, 'error')
        showToast(`Sigue fallando: ${errMessage}`, { type: 'error' })
      }
    } catch (retryErr) {
      addLog(`[Reintento fallido] Daemon CLI sigue offline o hay error de conexión: ${retryErr.message}`, 'error')
      showToast(`El servidor CLI sigue offline o inaccesible: ${retryErr.message}`, { type: 'error' })
    } finally {
      setIsProvisioning(false)
    }
  }

  // Descartar aprovisionamiento pendiente eliminándolo físicamente de Firestore Central
  const handleDiscardPendingProvisioning = async () => {
    if (!pendingCliProvisioning) return
    const { clientId, telemetryToken, nombre } = pendingCliProvisioning

    const confirmed = await showConfirm({
      title: 'Descartar Aprovisionamiento',
      message: `¿Estás seguro de que deseas descartar y eliminar el registro de ${nombre} de Firestore central?`,
      confirmText: 'Sí, Descartar',
      cancelText: 'Cancelar',
      variant: 'error'
    })

    if (!confirmed) return

    addLog(`Descartando y eliminando cliente ${clientId} de Firestore central...`, "warning")

    if (isSimulated) {
      setPendingCliProvisioning(null)
      addLog(`[Sandbox] Registro de cliente ${clientId} descartado localmente.`, "success")
      showToast('Registro de cliente descartado (Sandbox) ✓', { type: 'success' })
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const batch = writeBatch(dbInstance)
      const clientRef = doc(dbInstance, 'clientes_control', clientId)
      const tokenRef = doc(dbInstance, 'tokens', telemetryToken)

      batch.delete(clientRef)
      batch.delete(tokenRef)

      await batch.commit()

      addLog(`[Firestore] Registro de cliente ${clientId} y su token ${telemetryToken} eliminados con éxito.`, "success")
      setPendingCliProvisioning(null)
      showToast('Registro de cliente descartado y eliminado de Firestore central', { type: 'success' })
    } catch (err) {
      console.error("Error al descartar cliente de Firestore:", err)
      addLog(`Error al descartar cliente: ${err.message}`, "error")
      showToast(`Error al descartar: ${err.message}`, { type: 'error' })
    }
  }

  // Agregar log a la consola
  const addLog = (message, type = 'info', client = null) => {
    const timestamp = new Date().toLocaleTimeString('es-CO')
    setSystemLogs(prev => [
      { timestamp, message, type, client },
      ...prev.slice(0, 49) // Limitar a 50 logs
    ])
    setLogPage(1) // Reset a la primera página para ver el nuevo log
  }

  // Obtener Firebase Central
  const getCentralApp = () => {
    if (!CENTRAL_CONFIG.apiKey || !CENTRAL_CONFIG.projectId) {
      return null
    }
    const appName = "centralDevApp"
    try {
      if (getApps().some(app => app.name === appName)) {
        return getApp(appName)
      } else {
        return initializeApp(CENTRAL_CONFIG, appName)
      }
    } catch (err) {
      console.error("Error inicializando Firebase Central:", err)
      return null
    }
  }

  // Network connection status listeners
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleOnline = () => {
      setIsOnline(true)
      addLog("Conexión de red restablecida. Consola de telemetría en línea.", "success")
    }
    const handleOffline = () => {
      setIsOnline(false)
      addLog("Sin conexión a internet. Operando en modo local/desconectado.", "error")
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auth y Firebase Listeners
  useEffect(() => {
    if (isSimulated) {
      loadSimulatedData()
      setDbStatus('simulado')
      setIsLoading(false)
      return
    }

    addLog("Iniciando conexión con Consola Central...", "warning")
    const centralApp = getCentralApp()
    if (!centralApp) {
      loadSimulatedData()
      setIsSimulated(true)
      setDbStatus('simulado')
      setIsLoading(false)
      addLog("Firebase Central no configurado en .env.local. Cargado entorno sandbox.", "warning")
      return
    }

    const authInstance = getAuth(centralApp)
    const dbInstance = getFirestore(centralApp)
    setDbStatus('conectado')
    addLog("Conexión con base de datos Firestore Central establecida.", "success")

    let unsubDocs = null
    let unsubClientes = null
    let unsubTokens = null
    let unsubFailures = null

    const cleanUpListeners = () => {
      if (typeof unsubDocs === 'function') {
        unsubDocs()
        unsubDocs = null
      }
      if (typeof unsubClientes === 'function') {
        unsubClientes()
        unsubClientes = null
      }
      if (typeof unsubTokens === 'function') {
        unsubTokens()
        unsubTokens = null
      }
      if (typeof unsubFailures === 'function') {
        unsubFailures()
        unsubFailures = null
      }
    }

    // Escuchar cambios de sesión
    const unsubAuth = onAuthStateChanged(authInstance, (firebaseUser) => {
      setUser(firebaseUser)
      cleanUpListeners()
      
      if (firebaseUser) {
        addLog(`Sesión iniciada como ${firebaseUser.email}`, "success")

        try {
          // Escuchar reportes en tiempo real
          const q = query(collection(dbInstance, 'reportesBilling'), orderBy('periodo', 'desc'))
          unsubDocs = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setReports(data)
            setIsLoading(false)
            // Log additions dynamically
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const docData = change.doc.data()
                addLog(`Reporte de facturación periodico [${docData.periodo}] registrado por valor de $${Number(docData.comisionValor || 0).toLocaleString()} (Ventas: $${Number(docData.totalVentas || 0).toLocaleString()}).`, "success", docData.clientId)
              }
            })
          }, (error) => {
            console.warn("Fallo al leer datos reales. Cargando sandbox local:", error)
            loadSimulatedData()
            setIsSimulated(true)
            setDbStatus('error-sandbox')
            setIsLoading(false)
            addLog("Acceso denegado a Firestore. Cargando Sandbox local automático.", "error")
          })

          // Escuchar configuración de tasas comisiones de instancias
          const qClientes = collection(dbInstance, 'clientes_control')
          unsubClientes = onSnapshot(qClientes, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setClientesSaas(data)
            addLog(`Sincronizadas ${data.length} configuraciones de clientes en tiempo real.`, "success")
          }, (error) => {
            console.warn("Fallo al escuchar clientes_control:", error)
          })

          // Escuchar tokens de telemetría en tiempo real
          const qTokens = collection(dbInstance, 'tokens')
          unsubTokens = onSnapshot(qTokens, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setTelemetryTokens(data)
          }, (error) => {
            console.warn("Fallo al escuchar tokens:", error)
          })

          // Escuchar fallos en tiempo real
          const qFailures = query(collection(dbInstance, 'app_failures'), orderBy('timestamp', 'desc'))
          unsubFailures = onSnapshot(qFailures, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setFailures(data)
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const docData = change.doc.data()
                addLog(`FALLO DETECTADO: "${docData.errorMsg || 'Error genérico'}" en ruta ${docData.environment?.url || 'N/A'}.`, "error", docData.clientId)
              }
            })
          }, (error) => {
            console.warn("Fallo al escuchar app_failures:", error)
          })
        } catch (dbErr) {
          console.error("Error setting up Firestore listeners:", dbErr)
        }
      } else {
        setReports([])
        setIsLoading(false)
        addLog("Cerrando sesión del desarrollador.", "info")
      }
    })

    return () => {
      unsubAuth()
      cleanUpListeners()
    }
  }, [isSimulated])

  const loadSimulatedData = () => {
    setReports([
      {
        id: 'ventas-smartfix_2026-06',
        clientId: 'ventas-smartfix',
        periodo: '2026-06',
        totalVentas: 6850000,
        comisionPorcentaje: 1.5,
        comisionValor: 102750,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date() }
      },
      {
        id: 'tienda-calzado-x_2026-06',
        clientId: 'tienda-calzado-x',
        periodo: '2026-06',
        totalVentas: 9400000,
        comisionPorcentaje: 2.0,
        comisionValor: 188000,
        estadoPago: 'pagado',
        updatedAt: { toDate: () => new Date(Date.now() - 3600000) }
      },
      {
        id: 'restaurante-gourmet_2026-05',
        clientId: 'restaurante-gourmet',
        periodo: '2026-05',
        totalVentas: 14200000,
        comisionPorcentaje: 1.0,
        comisionValor: 142000,
        estadoPago: 'pagado',
        updatedAt: { toDate: () => new Date(Date.now() - 172800000) }
      },
      {
        id: 'minimercado-central_2026-06',
        clientId: 'minimercado-central',
        periodo: '2026-06',
        totalVentas: 18900000,
        comisionPorcentaje: 1.2,
        comisionValor: 226800,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date(Date.now() - 5000000) }
      },
      {
        id: 'moda-express_2026-05',
        clientId: 'moda-express',
        periodo: '2026-05',
        totalVentas: 8100000,
        comisionPorcentaje: 1.8,
        comisionValor: 145800,
        estadoPago: 'pagado',
        updatedAt: { toDate: () => new Date(Date.now() - 15000000) }
      },
      {
        id: 'ferreteria-nacional_2026-05',
        clientId: 'ferreteria-nacional',
        periodo: '2026-05',
        totalVentas: 11500000,
        comisionPorcentaje: 1.5,
        comisionValor: 172500,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date(Date.now() - 25000000) }
      }
    ])
    setFailures([
      {
        id: 'fail-1',
        clientId: 'ventas-smartfix',
        niche: 'Ropa y Calzado',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        errorMsg: "TypeError: Cannot read properties of undefined (reading 'precio')",
        stack: "TypeError: Cannot read properties of undefined (reading 'precio')\n    at DetalleProducto.jsx:54:23\n    at callCallback (react-dom.development.js:20542:12)\n    at invokeGuardedCallbackDev (react-dom.development.js:20591:16)",
        deviceInfo: "Chrome v126 / Windows 11",
        resolved: false
      },
      {
        id: 'fail-2',
        clientId: 'tienda-calzado-x',
        niche: 'Calzado Deportivo',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        errorMsg: "FirebaseError: [code=permission-denied]: Missing or insufficient permissions.",
        stack: "FirebaseError: Missing or insufficient permissions.\n    at new FirestoreError (index.esm2017.js:342:15)\n    at index.esm2017.js:9304:18\n    at async getDoc (index.esm2017.js:1200:10)",
        deviceInfo: "Safari v17 / iOS 17.4",
        resolved: false
      },
      {
        id: 'fail-3',
        clientId: 'minimercado-central',
        niche: 'Retail Minimarket',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        errorMsg: "ReferenceError: React is not defined",
        stack: "ReferenceError: React is not defined\n    at CardItem (CardItem.jsx:5:2)\n    at renderWithHooks (react-dom.development.js:16305:18)",
        deviceInfo: "Firefox v125 / macOS",
        resolved: true
      }
    ])
  }

  // Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    addLog(`Intentando autenticación para ${email}...`, "info")

    const centralApp = getCentralApp()
    if (!centralApp) {
      // Si estamos en simulado, permitir entrada con cualquier dato
      setUser({ email, uid: 'simulated-uid' })
      setAuthLoading(false)
      addLog("Sandbox Bypass: Sesión simulada autorizada.", "success")
      return
    }

    try {
      const authInstance = getAuth(centralApp)
      await signInWithEmailAndPassword(authInstance, email, password)
    } catch (err) {
      console.error(err)
      setAuthError('Credenciales incorrectas o error de conexión.')
      addLog("Error de inicio de sesión: Credenciales inválidas.", "error")
    } finally {
      setAuthLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    const centralApp = getCentralApp()
    if (!centralApp) {
      setUser(null)
      return
    }
    const authInstance = getAuth(centralApp)
    await signOut(authInstance)
  }

  // Toggle estado de pago
  const handleTogglePayment = async (report) => {
    const nuevoEstado = (report.estadoPago || 'pendiente').toLowerCase() === 'pagado' ? 'pendiente' : 'pagado'
    
    const confirmed = await showConfirm({
      title: nuevoEstado === 'pagado' ? 'Aprobar Pago' : 'Marcar como Pendiente',
      message: `¿Estás seguro de que deseas marcar el reporte de ${report.clientId} (${report.periodo}) como ${nuevoEstado.toUpperCase()}?`,
      confirmText: nuevoEstado === 'pagado' ? 'Sí, Aprobar' : 'Sí, Pendiente',
      cancelText: 'Cancelar',
      variant: nuevoEstado === 'pagado' ? 'success' : 'warning'
    })
    
    if (!confirmed) return

    addLog(`Cambiando estado de pago para ${report.clientId} (${report.periodo}) a ${nuevoEstado.toUpperCase()}...`, "info")
    
    if (isSimulated) {
      setReports(prev => prev.map(r => r.id === report.id ? { 
        ...r, 
        estadoPago: nuevoEstado,
        updatedAt: { toDate: () => new Date() }
      } : r))
      
      // Actualizar inspector si está abierto
      if (selectedReport && selectedReport.id === report.id) {
        setSelectedReport(prev => ({ ...prev, estadoPago: nuevoEstado, updatedAt: { toDate: () => new Date() } }))
      }
      addLog(`[Sandbox] Estado de pago actualizado localmente para ${report.clientId}.`, "success")
      showToast(`[Sandbox] Pago actualizado a ${nuevoEstado}`, { type: 'success' })
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const docRef = doc(dbInstance, 'reportesBilling', report.id)
      await updateDoc(docRef, {
        estadoPago: nuevoEstado,
        updatedAt: serverTimestamp()
      })
      addLog(`[Firestore] Estado de pago guardado para ${report.clientId}.`, "success")
      showToast(`Pago de ${report.clientId} actualizado a ${nuevoEstado}`, { type: 'success' })
    } catch (err) {
      console.error("Error actualizando pago:", err)
      addLog(`Error al guardar estado de pago: ${err.message}`, "error")
      showToast(`Error al actualizar pago: ${err.message}`, { type: 'error' })
    }
  }

  // --- CHEQUEO Y CONTROL DE SERVIDORES DE DESARROLLO LOCAL POR CLIENTE ---
  useEffect(() => {
    if (activeTab === 'crm' && clientesSaas.length > 0) {
      clientesSaas.forEach(async (c) => {
        try {
          const res = await fetch(`http://127.0.0.1:3001/api/project/dev/status?clientId=${c.id}`);
          const data = await res.json();
          if (data.success) {
            setLocalServers(prev => ({
              ...prev,
              [c.id]: { running: data.running, url: data.url || '', loading: false }
            }));
          }
        } catch (err) {
          console.error("Error al obtener status local:", err);
        }
      });
    }
  }, [activeTab, clientesSaas]);

  const handleStartLocalServer = async (clientId) => {
    setLocalServers(prev => ({ ...prev, [clientId]: { ...prev[clientId], loading: true } }));
    addLog(`[Local Server] Iniciando npm run dev para ${clientId}...`, 'info');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/project/dev/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = await res.json();
      if (data.success) {
        setLocalServers(prev => ({
          ...prev,
          [clientId]: { running: true, url: data.url, loading: false }
        }));
        addLog(`[Local Server] Servidor local iniciado para ${clientId} en ${data.url}`, 'success');
        showToast(`Servidor local de ${clientId} iniciado`, { type: 'success' });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      setLocalServers(prev => ({ ...prev, [clientId]: { running: false, url: '', loading: false } }));
      addLog(`[Local Server Error] Falló al iniciar servidor local para ${clientId}: ${err.message}`, 'error');
      showToast(`Error al iniciar servidor local para ${clientId}`, { type: 'error' });
    }
  };

  const handleStopLocalServer = async (clientId) => {
    setLocalServers(prev => ({ ...prev, [clientId]: { ...prev[clientId], loading: true } }));
    addLog(`[Local Server] Deteniendo servidor local de ${clientId}...`, 'info');
    try {
      const res = await fetch('http://127.0.0.1:3001/api/project/dev/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      const data = await res.json();
      if (data.success) {
        setLocalServers(prev => ({
          ...prev,
          [clientId]: { running: false, url: '', loading: false }
        }));
        addLog(`[Local Server] Servidor local detenido para ${clientId}`, 'info');
        showToast(`Servidor local de ${clientId} detenido`, { type: 'info' });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      setLocalServers(prev => ({ ...prev, [clientId]: { ...prev[clientId], loading: false } }));
      addLog(`[Local Server Error] Falló al detener servidor para ${clientId}: ${err.message}`, 'error');
      showToast(`Error al detener servidor para ${clientId}`, { type: 'error' });
    }
  };

  // Solicitar telemetría de un cliente específico
  const handleRequestClientTelemetry = async (clientId) => {
    addLog(`Solicitando reporte de telemetría a ${clientId}...`, "info")
    
    if (isSimulated) {
      addLog(`[Sandbox] Telemetría solicitada para ${clientId}. (Simulado)`, "success")
      showToast(`[Sandbox] Telemetría solicitada para ${clientId}`, { type: 'success' })
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) {
      addLog("Error: No se pudo inicializar la aplicación central.", "error")
      return
    }
    const dbInstance = getFirestore(centralApp)

    try {
      const clientRef = doc(dbInstance, 'clientes_control', clientId.toLowerCase())
      await updateDoc(clientRef, {
        triggerTelemetryReport: Date.now()
      })
      addLog(`[Firestore] Telemetría solicitada exitosamente para ${clientId}.`, "success")
      showToast(`Telemetría solicitada para ${clientId}`, { type: 'success' })
    } catch (err) {
      console.error("Error solicitando telemetría:", err)
      addLog(`Error al solicitar telemetría para ${clientId}: ${err.message}`, "error")
      showToast(`Error al solicitar telemetría: ${err.message}`, { type: 'error' })
    }
  }

  // Solicitar telemetría de todos los clientes a nivel global (Abre modal de personalización)
  const handleRequestAllTelemetry = () => {
    const active = clientesSaas.filter(c => !c.archived);
    if (active.length === 0) {
      showToast("No hay clientes activos para solicitar telemetría", { type: 'error' });
      return;
    }
    const initialChecked = {};
    active.forEach(c => {
      initialChecked[c.id] = true;
    });
    setGlobalTelemetryCheckedClients(initialChecked);
    setIsGlobalTelemetryModalOpen(true);
  };

  const handleExecuteGlobalTelemetry = async () => {
    const active = clientesSaas.filter(c => !c.archived);
    const selectedIds = active.filter(c => globalTelemetryCheckedClients[c.id]).map(c => c.id);

    if (selectedIds.length === 0) {
      showToast("Debe seleccionar al menos un cliente para solicitar telemetría", { type: 'error' });
      return;
    }

    setIsGlobalTelemetryModalOpen(false);
    addLog(`Solicitando reporte de telemetría para ${selectedIds.length} clientes...`, "info");
    
    if (isSimulated) {
      addLog(`[Sandbox] Telemetría global solicitada para: ${selectedIds.join(', ')}. (Simulado)`, "success");
      showToast(`[Sandbox] Telemetría global solicitada`, { type: 'success' });
      return;
    }

    const centralApp = getCentralApp();
    if (!centralApp) {
      addLog("Error: No se pudo inicializar la aplicación central.", "error");
      return;
    }
    const dbInstance = getFirestore(centralApp);

    try {
      const timestamp = Date.now();
      const promises = selectedIds.map(clientId => {
        const clientRef = doc(dbInstance, 'clientes_control', clientId.toLowerCase());
        return updateDoc(clientRef, {
          triggerTelemetryReport: timestamp
        });
      });
      await Promise.all(promises);
      addLog(`[Firestore] Telemetría solicitada para ${selectedIds.length} clientes: ${selectedIds.join(', ')}.`, "success");
      showToast(`Telemetría solicitada para ${selectedIds.length} clientes`, { type: 'success' });
    } catch (err) {
      console.error("Error solicitando telemetría global:", err);
      addLog(`Error al solicitar telemetría global: ${err.message}`, "error");
      showToast(`Error al solicitar telemetría global: ${err.message}`, { type: 'error' });
    }
  };


  // Guardar configuración modificada en CRM
  const handleSaveCrmConfig = async () => {
    if (!selectedCrmClientId) return;
    
    addLog(`Guardando configuración de vertical/cobro para cliente ${selectedCrmClientId}...`, "info")
    
    if (isSimulated) {
      setClientesSaas(prev => prev.map(c => c.id.toLowerCase() === selectedCrmClientId.toLowerCase() ? {
        ...c,
        niche: editNiche,
        billingMode: editBillingMode,
        comisionPorcentaje: editComisionPorcentaje,
        montoFijoServicio: editMontoFijoServicio,
        pagoMensualFijo: editPagoMensualFijo,
        enableDianBilling: editEnableDianBilling,
        costoPorFacturaDian: editCostoPorFacturaDian
      } : c))
      
      addLog(`[Sandbox] Configuración de cliente ${selectedCrmClientId} actualizada localmente.`, "success")
      showToast('Configuración guardada (Modo Sandbox)', { type: 'success' })
      setActiveMetricModal(null)
      setSelectedCrmClientId(null)
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const clientRef = doc(dbInstance, 'clientes_control', selectedCrmClientId.toLowerCase())
      await updateDoc(clientRef, {
        niche: editNiche,
        billingMode: editBillingMode,
        comisionPorcentaje: editComisionPorcentaje,
        montoFijoServicio: editMontoFijoServicio,
        pagoMensualFijo: editPagoMensualFijo,
        enableDianBilling: editEnableDianBilling,
        costoPorFacturaDian: editCostoPorFacturaDian
      })
      
      addLog(`[Firestore] Configuración de cliente ${selectedCrmClientId} guardada en Firestore central.`, "success")
      showToast('Configuración guardada correctamente', { type: 'success' })
      setActiveMetricModal(null)
      setSelectedCrmClientId(null)
    } catch (err) {
      console.error("Error al actualizar cliente:", err)
      addLog(`Error al guardar configuración de cliente: ${err.message}`, "error")
      showToast(`Error al guardar configuración: ${err.message}`, { type: 'error' })
    }
  }

  const loadDriftData = async (clientId) => {
    setDriftLoading(true)
    setDriftData(null)
    try {
      const res = await fetch(`http://localhost:3001/api/project/drift?clientId=${clientId}`)
      const data = await res.json()
      if (data.success) {
        setDriftData(data)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      showToast(`Error al cargar desviación del Core: ${err.message}`, { type: 'error' })
    } finally {
      setDriftLoading(false)
    }
  }

  const handleSyncFile = async (clientId, filename) => {
    setSyncingFile(p => ({ ...p, [filename]: true }))
    try {
      const res = await fetch('http://localhost:3001/api/project/sync-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, file: filename })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Sincronizado: ${filename}`, { type: 'success' })
        await loadDriftData(clientId)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      showToast(`Error al sincronizar: ${err.message}`, { type: 'error' })
    } finally {
      setSyncingFile(p => ({ ...p, [filename]: false }))
    }
  }

  const isFileSensitive = (filename) => {
    const sens = ['index.html', 'package.json', 'tailwind.config.js', 'postcss.config.js', 'vite.config.js', 'firestore.rules', 'firestore.indexes.json', 'storage.rules', '.firebaserc', 'firebase.json'];
    const lower = filename.toLowerCase();
    if (sens.includes(lower)) return true;
    if (lower.startsWith('public/')) return true;
    return false;
  };

  const handleBulkSync = async (clientId, selectedFiles) => {
    setBulkSyncLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/project/sync-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, files: selectedFiles })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Sincronizados ${selectedFiles.length} archivos con éxito`, { type: 'success' })
        setIsBulkSyncModalOpen(false)
        await loadDriftData(clientId)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      showToast(`Error en sincronización masiva: ${err.message}`, { type: 'error' })
    } finally {
      setBulkSyncLoading(false)
    }
  }

  const handleDeployClient = (clientId, force = false) => {
    setDeployLogs([]);
    setDeployError(null);
    setDeployAuditScore(null);
    setDeployTerminalClientId(clientId);
    setDeployState('running');
    setDeployProgressPercent(5);
    setIsDeployTerminalOpen(true);

    const eventSource = new EventSource(`http://localhost:3001/api/project/deploy?clientId=${clientId}&force=${force}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
          setDeployLogs(prev => [...prev, data.line]);
          
          if (data.line.includes('Compilando aplicación local')) {
            setDeployProgressPercent(25);
          } else if (data.line.includes('Compilación exitosa')) {
            setDeployProgressPercent(50);
          } else if (data.line.includes('auditoría física')) {
            setDeployProgressPercent(70);
          } else if (data.line.includes('Subiendo a Firebase Hosting')) {
            setDeployProgressPercent(85);
          } else if (data.line.includes('Despliegue completado con éxito')) {
            setDeployProgressPercent(100);
            setDeployState('success');
          }
        } else if (data.type === 'result') {
          if (data.success) {
            setDeployState('success');
            setDeployProgressPercent(100);
            showToast(`¡Despliegue exitoso para ${clientId}!`, { type: 'success' });
          } else {
            setDeployState('failed');
            setDeployError(data.error);
            showToast(`Fallo en despliegue de ${clientId}`, { type: 'error' });
          }
          eventSource.close();
        } else if (data.type === 'audit_failed') {
          setDeployState('failed');
          setDeployAuditScore(data.score);
          setDeployLogs(prev => [...prev, `❌ AUDITORÍA DE CALIDAD FALLÓ (Puntaje: ${data.score}/100)`]);
          showToast(`Despliegue cancelado por puntaje de auditoría bajo: ${data.score}`, { type: 'error' });
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing deploy message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Deploy EventSource error:", err);
      setDeployState('failed');
      setDeployError("Conexión interrumpida con el servidor de compilación");
      eventSource.close();
    };
  };

  const handleGlobalSyncSafeFiles = () => {
    const active = clientesSaas.filter(c => !c.archived);
    if (active.length === 0) {
      showToast("No hay clientes activos para sincronizar", { type: 'error' });
      return;
    }
    const initialChecked = {};
    active.forEach(c => {
      initialChecked[c.id] = true;
    });
    setGlobalSyncCheckedClients(initialChecked);
    setIsGlobalSyncConfigModalOpen(true);
  };

  const handleExecuteGlobalSync = async () => {
    const active = clientesSaas.filter(c => !c.archived);
    const selectedIds = active.filter(c => globalSyncCheckedClients[c.id]).map(c => c.id);
    
    if (selectedIds.length === 0) {
      showToast("Debe seleccionar al menos un cliente para sincronizar", { type: 'error' });
      return;
    }
    
    setIsGlobalSyncConfigModalOpen(false);
    setIsGlobalSyncProcessActive(true);
    addLog(`[Sincronización Global] Iniciando análisis y sincronización para ${selectedIds.length} clientes...`, "info");
    showToast("Iniciando sincronización...", { type: 'info' });
    let totalSynced = 0;
    
    for (const clientId of selectedIds) {
      setGlobalSyncCurrentClient(clientId);
      try {
        const res = await fetch(`http://localhost:3001/api/project/drift?clientId=${clientId}`);
        const drift = await res.json();
        
        if (drift.success && drift.differences.length > 0) {
          const safeFiles = drift.differences
            .filter(d => !isFileSensitive(d.file))
            .map(d => d.file);
            
          if (safeFiles.length > 0) {
            addLog(`Sincronizando ${safeFiles.length} archivos seguros para: ${clientId}...`, "info");
            const syncRes = await fetch('http://localhost:3001/api/project/sync-files', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientId, files: safeFiles })
            });
            const syncData = await syncRes.json();
            if (syncData.success) {
              totalSynced += safeFiles.length;
              addLog(`✔ Sincronización completa para ${clientId}.`, "success");
            }
          } else {
            addLog(`Sincronización para ${clientId}: Sin archivos core pendientes de actualizar.`, "info");
          }
        } else {
          addLog(`Sincronización para ${clientId}: Paridad total con el Core de referencia.`, "success");
        }
      } catch (err) {
        addLog(`❌ Error sincronizando ${clientId}: ${err.message}`, "error");
      }
    }
    
    setIsGlobalSyncProcessActive(false);
    setGlobalSyncCurrentClient('');
    if (totalSynced > 0) {
      showToast(`Sincronización global completada: ${totalSynced} archivos seguros actualizados.`, { type: 'success' });
    } else {
      showToast("Sincronización global terminada sin cambios pendientes.", { type: 'info' });
    }
  };

  const handleGlobalDeployAll = () => {
    const active = clientesSaas.filter(c => !c.archived);
    if (active.length === 0) {
      showToast("No hay clientes activos para desplegar", { type: 'error' });
      return;
    }
    const initialChecked = {};
    active.forEach(c => {
      initialChecked[c.id] = true;
    });
    setGlobalDeployCheckedClients(initialChecked);
    setIsGlobalDeployConfigModalOpen(true);
  };

  const handleExecuteGlobalDeploy = () => {
    const active = clientesSaas.filter(c => !c.archived);
    const selectedIds = active.filter(c => globalDeployCheckedClients[c.id]).map(c => c.id);
    
    if (selectedIds.length === 0) {
      showToast("Debe seleccionar al menos un cliente para desplegar", { type: 'error' });
      return;
    }
    
    setIsGlobalDeployConfigModalOpen(false);
    addLog(`[Cola Global] Iniciando despliegue de hosting para ${selectedIds.length} clientes seleccionados.`, "info");
    setDeployQueue(selectedIds);
    setDeployQueueIndex(0);
  };

  const handleArchiveClient = async (clientId) => {
    if (isSimulated) {
      setClientesSaas(prev => prev.map(c => c.id.toLowerCase() === clientId.toLowerCase() ? { ...c, archived: true } : c))
      addLog(`[Sandbox] Cliente ${clientId} archivado localmente.`, "success")
      showToast(`Cliente ${clientId} archivado (Sandbox)`, { type: 'success' })
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const clientRef = doc(dbInstance, 'clientes_control', clientId.toLowerCase())
      await updateDoc(clientRef, { archived: true })
      addLog(`[Firestore] Cliente ${clientId} archivado en Firestore central.`, "success")
      showToast(`Cliente ${clientId} archivado correctamente`, { type: 'success' })
    } catch (err) {
      console.error(err)
      addLog(`Error al archivar cliente ${clientId}: ${err.message}`, "error")
      showToast(`Error al archivar cliente: ${err.message}`, { type: 'error' })
    }
  }

  const handleUnarchiveClient = async (clientId) => {
    if (isSimulated) {
      setClientesSaas(prev => prev.map(c => c.id.toLowerCase() === clientId.toLowerCase() ? { ...c, archived: false } : c))
      addLog(`[Sandbox] Cliente ${clientId} desarchivado localmente.`, "success")
      showToast(`Cliente ${clientId} desarchivado (Sandbox)`, { type: 'success' })
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const clientRef = doc(dbInstance, 'clientes_control', clientId.toLowerCase())
      await updateDoc(clientRef, { archived: false })
      addLog(`[Firestore] Cliente ${clientId} desarchivado en Firestore central.`, "success")
      showToast(`Cliente ${clientId} desarchivado correctamente`, { type: 'success' })
    } catch (err) {
      console.error(err)
      addLog(`Error al desactivar archivo para cliente ${clientId}: ${err.message}`, "error")
      showToast(`Error al desarchivar cliente: ${err.message}`, { type: 'error' })
    }
  }

  // SIMULAR Y GESTIONAR ERRORES CENTRALIZADOS
  const handleSimulateFailure = async (customParams = null) => {
    let errorMsg = ""
    let stack = ""
    let targetClientId = ""
    let niche = ""
    let type = "error"
    let source = "automatic"

    if (customParams) {
      errorMsg = customParams.errorMsg
      stack = customParams.stack
      targetClientId = customParams.clientId
      niche = customParams.niche
      type = customParams.type
      source = customParams.source
    } else {
      const errorTypes = [
        {
          msg: "TypeError: Cannot read properties of undefined (reading 'split')",
          stack: "TypeError: Cannot read properties of undefined (reading 'split')\n    at CategoriasView.jsx:42:15\n    at renderWithHooks (react-dom.development.js:15486:18)",
        },
        {
          msg: "FirebaseError: [code=unavailable]: The service is temporarily unavailable.",
          stack: "FirebaseError: The service is temporarily unavailable.\n    at index.esm2017.js:520:25",
        },
        {
          msg: "ReferenceError: process is not defined",
          stack: "ReferenceError: process is not defined\n    at index.js:12:5",
        }
      ]
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
      const targetCli = clientesSaas.length > 0 
        ? clientesSaas[Math.floor(Math.random() * clientesSaas.length)]
        : { id: 'ventas-smartfix', niche: 'Ropa y Calzado' }
      
      errorMsg = randomError.msg
      stack = randomError.stack
      targetClientId = targetCli.id
      niche = targetCli.niche
    }

    const tokenDoc = telemetryTokens.find(t => t.clientId === targetClientId)
    const activeToken = tokenDoc ? tokenDoc.id : (telemetryTokens[0]?.id || '')

    const newFailure = {
      clientId: targetClientId || 'desconocido',
      token: activeToken,
      niche: niche || 'General',
      timestamp: new Date().toISOString(),
      errorMsg: errorMsg,
      stack: stack,
      deviceInfo: `Chrome/124.0.0 (Windows NT 10.0; Win64; x64) WebView2`,
      resolved: false,
      type: type,
      source: source,
      environment: {
        url: `https://${targetClientId || 'ventas'}.grupocontrol.com/tienda`,
        userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0`,
        screenResolution: "1920x1080",
        viewport: "1440x900",
        language: "es-ES"
      },
      user: {
        uid: "usr-simulated-" + Math.floor(Math.random() * 1000),
        email: "simulado@test.com"
      }
    }

    if (isSimulated) {
      setFailures(prev => [
        { id: `sim-fail-${Date.now()}`, ...newFailure },
        ...prev
      ])
      addLog(`[SANDBOX] Fallo simulado agregado para: ${newFailure.clientId}`, 'error')
      showToast('Fallo simulado agregado (Sandbox)', { type: 'error' })
    } else {
      try {
        const dbInstance = getFirestore(getCentralApp())
        await addDoc(collection(dbInstance, 'app_failures'), newFailure)
        addLog(`[TELEMETRÍA] Registrado nuevo reporte de fallo de: ${newFailure.clientId} en Firestore Central`, 'error')
        showToast('Fallo inyectado en Firestore Central', { type: 'success' })
      } catch (err) {
        console.error("Error creating telemetry failure doc:", err)
        showToast('Error al inyectar fallo en base de datos', { type: 'error' })
      }
    }
  }

  const handleResolveFailure = async (id) => {
    if (isSimulated) {
      setFailures(prev => prev.map(f => f.id === id ? { ...f, resolved: true } : f))
      addLog(`[SANDBOX] Fallo ${id} marcado como resuelto.`, 'success')
      showToast('Fallo resuelto (Sandbox)', { type: 'success' })
    } else {
      try {
        const dbInstance = getFirestore(getCentralApp())
        await updateDoc(doc(dbInstance, 'app_failures', id), { resolved: true })
        addLog(`[TELEMETRÍA] Fallo ${id} marcado como resuelto en Firestore.`, 'success')
        showToast('Fallo marcado como resuelto', { type: 'success' })
      } catch (err) {
        console.error("Error updating failure doc:", err)
        showToast('Error al resolver fallo', { type: 'error' })
      }
    }
  }

  const handleResolveAllFailures = async () => {
    const activeFailures = failures.filter(f => !f.resolved)
    if (activeFailures.length === 0) {
      showToast('No hay fallos activos por resolver', { type: 'info' })
      return
    }

    if (isSimulated) {
      setFailures(prev => prev.map(f => ({ ...f, resolved: true })))
      addLog(`[SANDBOX] Todos los fallos (${activeFailures.length}) marcados como resueltos.`, 'success')
      showToast('Todos los fallos resueltos (Sandbox)', { type: 'success' })
    } else {
      try {
        const dbInstance = getFirestore(getCentralApp())
        const batchPromises = activeFailures.map(f => 
          updateDoc(doc(dbInstance, 'app_failures', f.id), { resolved: true })
        )
        await Promise.all(batchPromises)
        addLog(`[TELEMETRÍA] ${activeFailures.length} fallos marcados como resueltos en Firestore.`, 'success')
        showToast('Todos los fallos marcados como resueltos', { type: 'success' })
      } catch (err) {
        console.error("Error resolving all failures:", err)
        showToast('Error al resolver todos los fallos', { type: 'error' })
      }
    }
  }

  const handleClearAllFailures = async () => {
    if (failures.length === 0) {
      showToast('No hay incidentes para vaciar', { type: 'info' })
      return
    }

    const confirm = await showAlert({
      title: '¿Vaciar Historial?',
      message: `Esta acción eliminará de forma permanente los ${failures.length} incidentes del historial. No se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Sí, Vaciar',
      cancelText: 'Cancelar'
    })

    if (!confirm) return

    if (isSimulated) {
      setFailures([])
      setErrorsPage(1)
      addLog('[SANDBOX] Historial de incidentes vaciado por completo.', 'info')
      showToast('Historial vaciado (Sandbox)', { type: 'success' })
    } else {
      try {
        const dbInstance = getFirestore(getCentralApp())
        const batchPromises = failures.map(f => 
          deleteDoc(doc(dbInstance, 'app_failures', f.id))
        )
        await Promise.all(batchPromises)
        setErrorsPage(1)
        addLog(`[TELEMETRÍA] ${failures.length} incidentes eliminados físicamente de la colección 'app_failures'.`, 'success')
        showToast('Historial de incidentes vaciado por completo', { type: 'success' })
      } catch (err) {
        console.error("Error clearing all failures:", err)
        showToast('Error al vaciar el historial', { type: 'error' })
      }
    }
  }

  // Crear reporte prueba
  const handleCreateTestReport = async () => {
    const targetClient = isSimulated ? 'cliente-simulado-' + Math.floor(Math.random() * 10) : (reports[0]?.clientId || 'ventas-smartfix')
    const testPeriod = new Date().toISOString().substring(0, 7)
    const reportId = `${targetClient}_${testPeriod}`
    const sales = Math.floor(Math.random() * 8000000) + 2000000
    const pct = getClientRate(targetClient)
    const comValue = (sales * pct) / 100
    
    addLog(`Generando telemetría de prueba para ${targetClient} ($${sales.toLocaleString()} Ventas, ${pct}%)`, "info", targetClient)

    if (isSimulated) {
      const newRep = {
        id: reportId,
        clientId: targetClient,
        periodo: testPeriod,
        totalVentas: sales,
        comisionPorcentaje: pct,
        comisionValor: comValue,
        estadoPago: 'pendiente',
        updatedAt: { toDate: () => new Date() }
      }
      setReports(prev => [newRep, ...prev.filter(r => r.id !== reportId)])
      addLog(`[Sandbox] Reporte simulado insertado correctamente.`, "success", targetClient)
      return
    }

    const centralApp = getCentralApp()
    if (!centralApp) return
    const dbInstance = getFirestore(centralApp)

    try {
      const tokenDoc = telemetryTokens.find(t => t.clientId === targetClient)
      const activeToken = tokenDoc ? tokenDoc.id : DEV_TOKEN
      const docRef = doc(dbInstance, 'reportesBilling', reportId)
      await setDoc(docRef, {
        clientId: targetClient,
        token: activeToken,
        periodo: testPeriod,
        totalVentas: sales,
        comisionPorcentaje: pct,
        comisionValor: comValue,
        estadoPago: 'pendiente',
        updatedAt: serverTimestamp()
      })
      addLog(`[Firestore] Telemetría enviada con éxito a la nube central.`, "success", targetClient)
    } catch (err) {
      console.error(err)
      addLog(`Error al enviar telemetría: ${err.message}`, "error")
    }
  }

  // Filtro
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.clientId.toLowerCase().includes(searchQuery.toLowerCase()) || r.periodo.includes(searchQuery)
    const reportStatus = (r.estadoPago || 'pendiente').toLowerCase()
    const matchesStatus = statusFilter === 'todos' || reportStatus === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Métricas
  const totalComision = reports.reduce((sum, r) => sum + (r.comisionValor || 0), 0)
  const totalCobrado = reports.reduce((sum, r) => (r.estadoPago || 'pendiente').toLowerCase() === 'pagado' ? sum + (r.comisionValor || 0) : sum, 0)
  const totalPendiente = totalComision - totalCobrado
  const clientesActivos = new Set(reports.map(r => r.clientId)).size

  // Clientes ordenados por mayor comisión acumulada para el gráfico
  const clientAggregated = reports.reduce((acc, r) => {
    if (!acc[r.clientId]) {
      acc[r.clientId] = {
        name: r.clientId,
        totalSales: 0,
        totalCommission: 0,
        reportCount: 0,
        pendingCount: 0
      }
    }
    acc[r.clientId].totalSales += (r.totalVentas || 0)
    acc[r.clientId].totalCommission += (r.comisionValor || 0)
    acc[r.clientId].reportCount += 1
    const reportStatus = (r.estadoPago || 'pendiente').toLowerCase()
    if (reportStatus === 'pendiente') {
      acc[r.clientId].pendingCount += 1
    }
    return acc
  }, {})

  const chartData = Object.values(clientAggregated)
    .sort((a, b) => b.totalCommission - a.totalCommission)
    .slice(0, 5) // Top 5 clientes

  const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(c => c.totalCommission)) : 1

  // RENDER PANTALLA LOGIN
  if (!user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#070b13] px-4 font-sans overflow-hidden">
        {/* Background Gradients and blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_center,rgba(124,58,237,0.02),transparent)]" />

        <form 
          onSubmit={handleLogin}
          className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6"
        >
          <div className="text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2 select-none">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <img src="/logo.png?v=3" className="w-8 h-8 object-contain rounded-full" alt="Logo" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent leading-none">PROTOTIPE</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Consola Central de Aplicaciones a la Medida</p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 animate-pulse">
              <AlertTriangle size={15} className="shrink-0 text-red-400" />
              <p>{authError}</p>
            </div>
          )}

          {isSimulated && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-center gap-2.5">
              <ShieldAlert size={15} className="shrink-0 text-amber-500" />
              <p>Modo Sandbox local activo. Ingresa cualquier credencial para probar la UI.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="dev@prototipe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-200 transition-all placeholder:text-slate-600"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 rounded-xl bg-slate-950/80 border border-slate-800/80 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-200 transition-all placeholder:text-slate-600"
                />
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(124,58,237,0.2)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {authLoading ? (
              <>
                <RefreshCw className="animate-spin text-white" size={16} />
                Autenticando Acceso...
              </>
            ) : (
              "Ingresar a la Consola"
            )}
          </button>
        </form>
      </div>
    )
  }

  // RENDER PANEL PRINCIPAL
  if (isOnboardingActive) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans pb-12 overflow-x-clip transition-colors duration-300">
        {/* Background decorativos */}
        <div className="absolute top-0 right-0 w-[50%] h-[400px] rounded-full bg-gradient-to-b from-violet-500/5 to-cyan-500/0 blur-[150px] pointer-events-none opacity-50 dark:opacity-100" />
        
        {/* Barra de Navegación Premium */}
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
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">Aprovisionamiento y Onboarding</span>
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
                      {/* Toggle de Aprovisionamiento Automático */}
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
                                className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/25 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
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
                                    const res = await fetch('http://localhost:3001/api/vapid/generate');
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
                                className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/25 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Generar
                              </button>
                            </div>
                          </div>

                          {/* Validar Credenciales Firebase (Mejora 1) */}
                          <div className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-[var(--color-text)] block">Validar Credenciales</span>
                              <span className="text-[9px] text-[var(--color-text-muted)] block">Prueba la API Key y el Project ID contra Google Firebase.</span>
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
                              <span className="text-[9px] text-emerald-400 font-bold">🟢 Conexión validada con éxito. Credenciales listas y autorizadas.</span>
                            </div>
                          )}

                          {!isCredentialsValidated && !credentialsValidationError && fbApiKey.trim() && fbProjectId.trim() && !isValidatingCredentials && (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-1.5 animate-fade-in">
                              <span className="text-[9px] text-amber-400 font-bold">🟡 Credenciales listas para comprobar (presiona "Comprobar Conexión").</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {wizardTab === 'branding' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Paletas de Colores Preestablecidas (Por Categorías de Nicho) */}
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
                              {/* Header del acordeón */}
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

                              {/* Contenido (grilla de paletas) */}
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
                                            setPrimaryColor(preset.primary);
                                            setSecondaryColor(preset.secondary);
                                            setBgColor(preset.bg);
                                            setTextColor(preset.text);
                                            showToast(`Aplicada paleta: ${preset.name}`, { type: 'success' });
                                          }}
                                          className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                            isSelected 
                                              ? 'bg-indigo-600/20 border-indigo-500 shadow-md scale-[1.02]' 
                                              : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/80'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1 mb-1.5 justify-start">
                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} title="Primario" />
                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: preset.secondary }} title="Secundario" />
                                            <div className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: preset.bg }} title="Fondo" />
                                            <div className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: preset.text }} title="Texto" />
                                          </div>
                                          <span className="text-[9px] font-bold block text-[var(--color-text)] truncate" title={preset.name}>{preset.name}</span>
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

                    {/* Logo de Marca y Favicon (Mejora 2) */}
                    <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Logo Corporativo de Marca</span>
                        <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5">PWA & Favicon Auto-Ready</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selector de Archivo Físico */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Subir Archivo de Logo (SVG, PNG, JPG)</label>
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
                            <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5">Si supera los 2MB, se auto-optimizará a 512px.</span>
                          </div>
                        </div>

                        {/* O ingresar ruta absoluta manualmente */}
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">O ingresa la Ruta Absoluta del Archivo (Local)</label>
                            <input 
                              type="text" 
                              value={logoLocalPath}
                              onChange={(e) => setLogoLocalPath(e.target.value)}
                              placeholder="C:\Users\Sergio\Pictures\logo.svg"
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
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setPrimaryColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
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
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#a855f7', '#d97706', '#ec4899', '#be123c', '#06b6d4', '#4f46e5', '#3b82f6', '#10b981', '#64748b'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setSecondaryColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
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
                              onChange={(e) => setBgColor(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={bgColor} 
                            onChange={(e) => setBgColor(e.target.value)}
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#070b13', '#0f172a', '#1e293b', '#06130e', '#0c0714', '#140c0b', '#18080f', '#080f1e', '#f8fafc'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setBgColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
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
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-mono outline-none focus:border-indigo-500"
                          />
                        </div>
                        {/* Círculos de Selección Rápida */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['#f8fafc', '#ffffff', '#e2e8f0', '#ecfdf5', '#fdf6ff', '#fffcfb', '#fff1f2', '#f0f7ff', '#0f172a'].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setTextColor(c)}
                              className="w-4 h-4 rounded-full border border-white/10 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Selector de Fuentes con Modal y Previsualizaciones */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Google Font Seleccionada</label>
                        <div className="flex gap-2">
                          <div className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs flex-1 text-[var(--color-text)] font-semibold flex items-center justify-between">
                            <span>{googleFont}</span>
                            <span className="text-[11px] opacity-75 font-bold tracking-wide" style={{ fontFamily: `'${googleFont}', sans-serif` }}>Abc - Vista Previa</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFontSearchQuery('');
                              setIsFontModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Seleccionar fuente
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Validación de Accesibilidad WCAG 2.1 */}
                    <div className="p-4 bg-slate-500/5 dark:bg-slate-900/40 border border-[var(--color-border)] rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Estudio de Accesibilidad y Contraste WCAG 2.1</span>
                        <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5">Estándar W3C</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contraste Botón Primario */}
                        {(() => {
                          const ratio = getContrastRatio(primaryColor, '#ffffff');
                          const feedback = getContrastFeedback(ratio);
                          return (
                            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Contraste del Botón Primario</span>
                                <span className="text-xs font-black text-[var(--color-text)] block mt-0.5">{ratio.toFixed(2)} : 1</span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${feedback.badgeClass}`}>
                                  {feedback.text}
                                </span>
                                <div 
                                  className="px-2 py-1 rounded text-[9px] font-bold text-white shadow-sm"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  Botón Primario
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Contraste Fondo vs Texto */}
                        {(() => {
                          const ratio = getContrastRatio(bgColor, textColor);
                          const feedback = getContrastFeedback(ratio);
                          return (
                            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase block">Contraste Fondo vs Texto</span>
                                <span className="text-xs font-black text-[var(--color-text)] block mt-0.5">{ratio.toFixed(2)} : 1</span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${feedback.badgeClass}`}>
                                  {feedback.text}
                                </span>
                                <div 
                                  className="p-1 rounded text-[8px] border font-medium truncate max-w-[120px]"
                                  style={{ backgroundColor: bgColor, color: textColor, borderColor: `${textColor}20` }}
                                >
                                  Texto de Ejemplo
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {wizardTab === 'modules' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-4">
                      <div className="space-y-1.5 border-b border-[var(--color-border)] pb-4">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Nicho de Mercado / Vertical de Negocio</label>
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

                      {/* Selector de Recomendaciones de la Biblioteca — Premium Toggle Cards */}
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
                              <span className="text-[10px] text-[var(--color-text-muted)] italic">Cargando catálogo de componentes...</span>
                            </div>
                          ) : (
                            libraryList.map((cat, catIdx) => {
                              if (!cat.components || cat.components.length === 0) return null;
                              return (
                                <div key={catIdx} className="space-y-1.5">
                                  {/* Category header */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase font-extrabold tracking-widest" style={{ color: cat.isModule ? '#a78bfa' : '#60a5fa' }}>
                                      {cat.isModule ? '📦' : '📂'} {cat.name}
                                    </span>
                                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                                    <span className="text-[8px] text-[var(--color-text-muted)] font-mono">{cat.components.length}</span>
                                  </div>
                                  {/* Component toggle cards */}
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {cat.components.map((comp, compIdx) => {
                                      const isSelected = selectedRecomendations.some(r => r.link === comp.link);
                                      const isModule = comp.resourceType === 'module' || cat.isModule;
                                      return (
                                        <div
                                          key={compIdx}
                                          role="button"
                                          tabIndex={0}
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
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                              e.preventDefault();
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
                                            }
                                          }}
                                          className={`relative flex flex-col items-start gap-1 p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 group select-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-indigo-500/40 ${
                                            isSelected
                                              ? 'bg-indigo-600/15 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                                              : 'bg-[var(--color-surface-2)]/25 border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)]/50 hover:border-[var(--color-border)]'
                                          }`}
                                        >
                                          {/* Glow top edge when selected */}
                                          {isSelected && (
                                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
                                          )}

                                          {/* Check indicator + badge row */}
                                          <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                                                isModule
                                                  ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                                                  : 'text-sky-400 bg-sky-500/10 border-sky-500/20'
                                              }`}>
                                                {isModule ? '📦 Módulo' : '📂 Comp.'}
                                              </span>
                                              {getSandboxKey(comp.name, comp.technicalName) && (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLivePreviewComponent(comp);
                                                  }}
                                                  className="flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                                                  title="Ver demo en vivo"
                                                >
                                                  <Play size={8} fill="currentColor" />
                                                  Demo
                                                </button>
                                              )}
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
                                              isSelected
                                                ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]'
                                                : 'border-[var(--color-border)] group-hover:border-indigo-500/40'
                                            }`}>
                                              {isSelected && (
                                                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                              )}
                                            </div>
                                          </div>

                                          {/* Name */}
                                          <div className="w-full">
                                            <span className={`text-[10px] font-bold block leading-tight ${isSelected ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                                              {comp.name}
                                            </span>
                                            {comp.technicalName && (
                                              <span className="text-[8px] font-mono text-[var(--color-text-muted)]/60 block mt-0.5 truncate">
                                                {comp.technicalName}
                                              </span>
                                            )}
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
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Requerimientos Especiales del Cliente (Briefing/Notas)</label>
                        <textarea 
                          value={customRequirements}
                          onChange={(e) => setCustomRequirements(e.target.value)}
                          placeholder="Especificaciones o notas custom de negocio... (ej: El cliente requiere que la facturación valide cédula de extranjería...)"
                          rows={3}
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-sans resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation & Submit inside Wizard */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={wizardTab === 'server'}
                    onClick={() => setWizardTab(wizardTab === 'modules' ? 'branding' : (wizardTab === 'branding' ? 'server' : 'server'))}
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
                    if (!newClientName.trim()) return
                    
                    setIsRegistering(true)
                    setIsProvisioning(true)
                    const clientId = newClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    const telemetryToken = `${clientId}-token-${Date.now()}`

                    addLog(`Registrando nuevo cliente: ${clientId} (${billingMode})`, "info")

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
                      selectedRecomendations, // Inyección de componentes/módulos seleccionados
                      branding: {
                        primaryColor,
                        secondaryColor,
                        bgColor,
                        textColor,
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
                    }

                    if (isSimulated) {
                      const testPeriod = new Date().toISOString().substring(0, 7)
                      const reportId = `${clientId}_${testPeriod}`
                      const sales = Math.floor(Math.random() * 8000000) + 2000000
                      
                      let comValue = 0
                      if (billingMode === 'percentage') {
                        comValue = (sales * comisionPorcentaje) / 100
                      } else if (billingMode === 'fixed_per_service') {
                        comValue = montoFijoServicio * 12
                      } else if (billingMode === 'flat_monthly') {
                        comValue = pagoMensualFijo
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
                      }

                      setClientesSaas(prev => [...prev, { id: clientId, niche, billingMode, comisionPorcentaje, montoFijoServicio, pagoMensualFijo, enableDianBilling, costoPorFacturaDian }])
                      setReports(prev => [newRep, ...prev])
                      setTelemetryTokens(prev => [...prev, { id: telemetryToken, clientId }])

                      addLog(`[Sandbox] Cliente ${clientId} registrado y token configurado localmente.`, "success")
                      showToast(`Cliente ${newClientName} registrado (Sandbox)`, { type: 'success' })
                      
                      setOnboardingData({
                        clientId,
                        token: telemetryToken,
                        comisionPorcentaje,
                        vapidKey: fbVapidKey,
                        prompt: `# Antigravity Bootstrap Prompt for ${clientId}\n\nThis is a simulated prompt for testing purposes.`,
                        adminEmail: `admin@${clientId}.com`,
                        adminPassword: 'Admin2026!'
                      })
                      setIsOnboardingActive(false)
                      setNewClientName('')
                      setFbApiKey('')
                      setFbAuthDomain('')
                      setFbProjectId('')
                      setFbStorageBucket('')
                      setFbMessagingSenderId('')
                      setFbAppId('')
                      setFbVapidKey('')
                      setIsRegistering(false)
                      setIsProvisioning(false)
                      return
                    }

                    const centralApp = getCentralApp()
                    if (!centralApp) {
                      setIsRegistering(false)
                      setIsProvisioning(false)
                      return
                    }
                    const dbInstance = getFirestore(centralApp)

                    try {
                      const clientRef = doc(dbInstance, 'clientes_control', clientId)
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
                      })

                      const tokenRef = doc(dbInstance, 'tokens', telemetryToken)
                      await setDoc(tokenRef, {
                        active: true,
                        clientId,
                        creadoEn: serverTimestamp()
                      })

                      addLog(`[Firestore] Aprovisionamiento exitoso para el cliente ${clientId} en la nube central.`, "success")
                      
                      let promptResult = ''

                      try {
                        const cliRes = await fetch('http://localhost:3001/api/create-project', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(cliPayload)
                        })

                        if (cliRes.ok) {
                          const resData = await cliRes.json()
                          promptResult = resData.prompt || (resData.data && resData.data.prompt) || ''
                          addLog(`[CLI API] Aprovisionamiento físico del proyecto en disco completado correctamente.`, "success")
                          showToast(`Cliente ${newClientName} registrado y proyecto creado en disco`, { type: 'success' })
                        } else {
                          const errText = await cliRes.text()
                          let errMessage = ''
                          try {
                            const errData = JSON.parse(errText)
                            errMessage = errData.error || errData.message || errText
                          } catch (_) {
                            errMessage = errText
                          }
                          addLog(`[CLI API Warning] CLI respondió con error: ${errMessage}. Datos guardados en Firestore — puedes reintentar.`, "warning")
                          setPendingCliProvisioning({
                            clientId, nombre: newClientName.trim(), comisionPorcentaje, telemetryToken,
                            payload: cliPayload
                          })
                          showToast(`El cliente se guardó en Firestore. Presiona "Reintentar" cuando el CLI esté disponible.`, { type: 'error' })
                        }
                      } catch (cliErr) {
                        console.error("Error en API de aprovisionamiento:", cliErr)
                        addLog(`[CLI API Warning] Daemon CLI offline o error de conexión: ${cliErr.message}. Datos en Firestore seguros — usa el botón Reintentar cuando el CLI esté disponible.`, "warning")
                        setPendingCliProvisioning({
                          clientId, nombre: newClientName.trim(), comisionPorcentaje, telemetryToken,
                          payload: cliPayload
                        })
                        showToast('Daemon CLI offline. Firestore OK. Presiona "Reintentar" cuando el servidor esté disponible.', { type: 'error' })
                      }

                      setOnboardingData({
                        clientId,
                        token: telemetryToken,
                        comisionPorcentaje,
                        vapidKey: fbVapidKey,
                        prompt: promptResult,
                        adminEmail: `admin@${clientId}.com`,
                        adminPassword: 'Admin2026!'
                      })
                      setIsOnboardingActive(false)
                      setNewClientName('')
                      setFbApiKey('')
                      setFbAuthDomain('')
                      setFbProjectId('')
                      setFbStorageBucket('')
                      setFbMessagingSenderId('')
                      setFbAppId('')
                      setFbVapidKey('')
                      setCustomRequirements('')
                    } catch (err) {
                      console.error(err)
                      addLog(`Error registrando cliente: ${err.message}`, "error")
                      showToast(`Error al registrar cliente: ${err.message}`, { type: 'error' })
                    } finally {
                      setIsRegistering(false)
                      setIsProvisioning(false)
                    }
                  }}
                  className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-1.5 ${(isRegistering || isProvisioning || !newClientName.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {(isRegistering || isProvisioning) ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Procesando Aprovisionamiento...
                    </>
                  ) : (
                    "Registrar y Generar Onboarding"
                  )}
                </button>
              </div>
            </div>

            {/* MOCKUP PREVIEW PANEL (Right) */}
            <div className="lg:col-span-5 relative h-full">
              <div className="flex flex-col items-center justify-center bg-[var(--color-surface)]/50 p-5 rounded-3xl border border-[var(--color-border)] shadow-sm sticky top-24">
              <div className="text-center mb-3">
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider flex items-center justify-center gap-1">
                  <Smartphone size={10} />
                  Vista Previa Interactiva
                </span>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Interactúa con el mockup: registra ventas, cambia de pestaña y edita ajustes.</p>
              </div>

              {/* Smartphone mockup */}
              <div 
                className="w-[240px] h-[480px] rounded-[30px] p-2 relative shadow-2xl transition-all duration-300 ease-in-out border border-slate-700/50 flex flex-col"
                style={{ 
                  backgroundColor: mockTheme === 'dark' ? bgColor : '#ffffff', 
                  color: mockTheme === 'dark' ? textColor : '#0f172a',
                  fontFamily: `'${googleFont}', sans-serif`,
                  boxShadow: `0 20px 40px -10px ${primaryColor}20, 0 0 2px 2px ${primaryColor}40`
                }}
              >
                {/* Glass reflection effect overlay */}
                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />

                {/* Inner Screen Container */}
                <div className="h-full w-full flex flex-col justify-between relative overflow-hidden rounded-[22px] p-3 pt-5">
                  
                  {/* Dynamic Island / Camera Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-40 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full ml-auto mr-2" />
                  </div>

                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[8px] opacity-80 mb-2 font-mono">
                    <span>16:49</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-current rounded-sm p-0.5 flex items-center">
                        <div className="h-full w-2.5 bg-current rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Mock App Header */}
                  <div className="flex items-center justify-between mt-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {newClientName ? newClientName.substring(0, 1).toUpperCase() : 'V'}
                      </div>
                      <span className="text-[10px] font-bold truncate max-w-[120px]">
                        {newClientName.trim() || 'App de Ventas'}
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-slate-500/10 flex items-center justify-center cursor-pointer hover:bg-slate-500/20 transition-colors">
                      <span className="text-[8px]">🔔</span>
                    </div>
                  </div>

                  {/* Mock Contents */}
                  <div className="flex-1 my-3 overflow-y-auto space-y-3 scrollbar-none pr-0.5">
                    
                    {mockActiveTab === 'inicio' && (
                      <div className="space-y-3">
                        {/* Hero Commission Dashboard inside app */}
                        <div 
                          className="p-3 rounded-2xl relative overflow-hidden transition-all duration-300 shadow-md border"
                          style={{ 
                            backgroundColor: `${secondaryColor}12`,
                            borderColor: `${primaryColor}25`
                          }}
                        >
                          <span className="text-[8px] opacity-75 uppercase font-bold tracking-wider block">Balance de Hoy</span>
                          <span className="text-lg font-black block mt-0.5 tracking-tight">
                            ${mockOrders.reduce((sum, item) => sum + item.val, 0).toLocaleString('es-CO')}
                          </span>
                          <p className="text-[7px] opacity-80 mt-1">{mockOrders.length} ventas procesadas exitosamente</p>
                          
                          {/* Decorative gradient spot inside card */}
                          <div 
                            className="absolute right-[-10%] bottom-[-10%] w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40"
                            style={{ backgroundColor: secondaryColor }}
                          />
                        </div>

                        {/* Quick Action / Sale Registration Form */}
                        {mockIsNewSaleOpen ? (
                          <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-500/20 space-y-2 animate-scale-up">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-bold uppercase tracking-wider">Nueva Venta</span>
                              <button 
                                type="button" 
                                onClick={() => setMockIsNewSaleOpen(false)}
                                className="text-[8px] text-red-500 hover:text-red-400 font-bold cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                            <input 
                              type="text" 
                              placeholder="Ej: Mantenimiento PC"
                              value={mockNewSaleTitle}
                              onChange={(e) => setMockNewSaleTitle(e.target.value)}
                              className="w-full bg-slate-500/5 border border-slate-500/25 rounded px-2 py-1 text-[9px] outline-none focus:border-indigo-500"
                              style={{ color: 'inherit' }}
                            />
                            <input 
                              type="number" 
                              placeholder="Ej: 85000"
                              value={mockNewSaleValue}
                              onChange={(e) => setMockNewSaleValue(e.target.value)}
                              className="w-full bg-slate-500/5 border border-slate-500/25 rounded px-2 py-1 text-[9px] outline-none focus:border-indigo-500"
                              style={{ color: 'inherit' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!mockNewSaleTitle || !mockNewSaleValue) return;
                                setMockOrders([
                                  {
                                    id: Date.now(),
                                    title: mockNewSaleTitle,
                                    time: 'Hace un momento',
                                    val: Number(mockNewSaleValue)
                                  },
                                  ...mockOrders
                                ]);
                                setMockNewSaleTitle('');
                                setMockNewSaleValue('');
                                setMockIsNewSaleOpen(false);
                              }}
                              className="w-full py-1.5 rounded-lg text-[9px] font-bold text-white cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Agregar Venta
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setMockIsNewSaleOpen(true)}
                            className="w-full py-2 rounded-xl text-[9px] font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 hover:brightness-110"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <span>⚡ Registrar Nueva Venta</span>
                          </button>
                        )}

                        {/* Recent History (Top 3) */}
                        <div className="space-y-1.5">
                          <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider block">Últimas Ventas</span>
                          {mockOrders.length === 0 ? (
                            <p className="text-[8px] opacity-50 italic text-center py-2">No hay ventas registradas.</p>
                          ) : (
                            mockOrders.slice(0, 3).map((item) => (
                              <div 
                                key={item.id} 
                                className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/10 flex items-center justify-between text-[8px] hover:bg-slate-500/10 transition-colors"
                              >
                                <div>
                                  <p className="font-bold">{item.title}</p>
                                  <p className="opacity-60 text-[7px]">{item.time}</p>
                                </div>
                                <span className="font-mono font-bold" style={{ color: primaryColor }}>
                                  ${item.val.toLocaleString('es-CO')}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {mockActiveTab === 'ventas' && (
                      <div className="space-y-3">
                        {/* Analytical bars widget */}
                        <div className="p-2 rounded-2xl bg-slate-500/5 border border-slate-500/10 space-y-1.5">
                          <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider block">Distribución de Ventas</span>
                          {mockOrders.length === 0 ? (
                            <div className="h-10 flex items-center justify-center text-[8px] opacity-50 italic">Sin datos de gráfico</div>
                          ) : (
                            <div className="h-12 flex items-end gap-1.5 justify-center pt-2">
                              {mockOrders.slice(0, 6).map((item, idx) => {
                                const maxVal = Math.max(...mockOrders.map(o => o.val)) || 1;
                                const heightPercent = Math.max(15, Math.min(100, (item.val / maxVal) * 100));
                                return (
                                  <div key={item.id} className="flex-1 flex flex-col items-center gap-1 group">
                                    <div 
                                      className="w-3 rounded-t-sm transition-all duration-300 relative"
                                      style={{ 
                                        height: `${heightPercent * 0.35}px`,
                                        backgroundColor: idx === 0 ? primaryColor : secondaryColor,
                                        opacity: 0.85
                                      }}
                                    />
                                    <span className="text-[6px] opacity-50 font-mono">V{idx + 1}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Deletable Sales List */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider">Historial Completo</span>
                            <span className="text-[7px] font-bold opacity-50 font-mono">Total: {mockOrders.length}</span>
                          </div>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5 scrollbar-none">
                            {mockOrders.length === 0 ? (
                              <p className="text-[8px] opacity-50 italic text-center py-4">No hay ventas. ¡Registra una!</p>
                            ) : (
                              mockOrders.map((item) => (
                                <div 
                                  key={item.id} 
                                  className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/10 flex items-center justify-between text-[8px] hover:bg-red-500/5 group/row transition-all duration-200"
                                >
                                  <div>
                                    <p className="font-bold">{item.title}</p>
                                    <p className="opacity-60 text-[7px]">{item.time}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold" style={{ color: primaryColor }}>
                                      ${item.val.toLocaleString('es-CO')}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setMockOrders(mockOrders.filter(o => o.id !== item.id))}
                                      className="w-4 h-4 rounded bg-red-500/15 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center text-[7px] font-black cursor-pointer transition-colors"
                                      title="Eliminar venta"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {mockActiveTab === 'catalogo' && (
                      <div className="space-y-3 animate-fade-in">
                        <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider block">
                          {['technical_services', 'refrigeration_ac', 'contractors', 'machinery_rental', 'laundry', 'furniture_repair', 'wellness_podology'].includes(niche) ? '📌 Servicios de la Marca' : '🏷️ Catálogo de Productos'}
                        </span>
                        
                        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5 scrollbar-none">
                          {(MOCK_CATALOG[niche] || MOCK_CATALOG.retail_clothing).map((item) => (
                            <div 
                              key={item.id} 
                              className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/10 flex items-center justify-between gap-2 transition-all hover:bg-slate-500/10"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm shrink-0">{item.emoji}</span>
                                <div className="min-w-0">
                                  <p className="font-bold text-[8.5px] leading-tight truncate">{item.name}</p>
                                  <p className="text-[8px] font-mono opacity-85 mt-0.5" style={{ color: primaryColor }}>
                                    ${item.price.toLocaleString('es-CO')}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setMockOrders([
                                    {
                                      id: Date.now(),
                                      title: item.name,
                                      time: 'Hace un momento',
                                      val: item.price
                                    },
                                    ...mockOrders
                                  ]);
                                  showToast(`Añadido: ${item.name}`, { type: 'success' });
                                }}
                                className="px-2 py-1 rounded-lg text-[8px] font-bold text-white transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                                style={{ backgroundColor: primaryColor }}
                              >
                                + Registrar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mockActiveTab === 'ajustes' && (
                      <div className="space-y-3">
                        <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider block">Ajustes de Branding</span>
                        
                        {/* Interactive Toggles linked bidirectionally to wizard */}
                        <div className="space-y-2 p-2 rounded-2xl bg-slate-500/5 border border-slate-500/10 text-[8px]">
                          {/* Theme Mode Toggle inside phone */}
                          <div className="flex items-center justify-between py-1">
                            <span className="font-bold">Modo del Mockup</span>
                            <button
                              type="button"
                              onClick={() => setMockTheme(mockTheme === 'dark' ? 'light' : 'dark')}
                              className="px-2 py-0.5 rounded bg-slate-500/15 hover:bg-slate-500/25 cursor-pointer font-bold uppercase transition-colors"
                            >
                              {mockTheme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
                            </button>
                          </div>

                          {/* PWA Activation sync */}
                          <div className="flex items-center justify-between py-1 border-t border-slate-500/10">
                            <span className="font-bold">Soporte PWA</span>
                            <button
                              type="button"
                              onClick={() => setEnablePwa(!enablePwa)}
                              className={`w-7 h-4 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${enablePwa ? 'bg-emerald-500' : 'bg-slate-500/35'}`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${enablePwa ? 'translate-x-3' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {/* Push Notifications sync */}
                          <div className="flex items-center justify-between py-1 border-t border-slate-500/10">
                            <span className="font-bold">Notificaciones Push</span>
                            <button
                              type="button"
                              onClick={() => setEnablePush(!enablePush)}
                              className={`w-7 h-4 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${enablePush ? 'bg-emerald-500' : 'bg-slate-500/35'}`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${enablePush ? 'translate-x-3' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {/* Billing module sync */}
                          <div className="flex items-center justify-between py-1 border-t border-slate-500/10">
                            <span className="font-bold">Módulo de Facturación</span>
                            <button
                              type="button"
                              onClick={() => setEnableBilling(!enableBilling)}
                              className={`w-7 h-4 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${enableBilling ? 'bg-emerald-500' : 'bg-slate-500/35'}`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${enableBilling ? 'translate-x-3' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/15 text-center text-[7.5px] text-indigo-400">
                          ℹ️ Los interruptores de PWA, Push y Facturación modifican el formulario de registro en tiempo real.
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Navigation Bar inside phone */}
                  <div className="border-t border-slate-500/15 pt-2 flex justify-around text-[8px] opacity-90 shrink-0">
                    <button 
                      type="button"
                      onClick={() => setMockActiveTab('inicio')}
                      className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer bg-transparent border-0 p-0"
                      style={{ color: mockActiveTab === 'inicio' ? primaryColor : 'inherit', opacity: mockActiveTab === 'inicio' ? 1 : 0.6 }}
                    >
                      <span>🏠</span>
                      <span className="font-bold">Inicio</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMockActiveTab('catalogo')}
                      className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer bg-transparent border-0 p-0"
                      style={{ color: mockActiveTab === 'catalogo' ? primaryColor : 'inherit', opacity: mockActiveTab === 'catalogo' ? 1 : 0.6 }}
                    >
                      <span>📦</span>
                      <span className="font-bold">
                        {['technical_services', 'refrigeration_ac', 'contractors', 'machinery_rental', 'laundry', 'furniture_repair', 'wellness_podology'].includes(niche) ? 'Servicios' : 'Catálogo'}
                      </span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMockActiveTab('ventas')}
                      className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer bg-transparent border-0 p-0"
                      style={{ color: mockActiveTab === 'ventas' ? primaryColor : 'inherit', opacity: mockActiveTab === 'ventas' ? 1 : 0.6 }}
                    >
                      <span>📊</span>
                      <span className="font-bold">Ventas</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMockActiveTab('ajustes')}
                      className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer bg-transparent border-0 p-0"
                      style={{ color: mockActiveTab === 'ajustes' ? primaryColor : 'inherit', opacity: mockActiveTab === 'ajustes' ? 1 : 0.6 }}
                    >
                      <span>⚙️</span>
                      <span className="font-bold">Ajustes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        
        {/* Modal de Selección de Fuentes (Google Fonts) */}
        {isFontModalOpen && (
          <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-fade-in p-4">
            <div className="absolute inset-0" onClick={() => setIsFontModalOpen(false)} />
            
            <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up max-h-[80vh] flex flex-col overflow-hidden transition-colors duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Palette size={16} />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--color-text)]">Seleccionar Tipografía</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Explora la vista previa de cada fuente antes de aplicarla.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFontModalOpen(false)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] w-8 h-8 rounded-lg flex items-center justify-center font-bold border border-[var(--color-border)] cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Buscador de Fuentes */}
              <div className="mb-3 shrink-0">
                <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-colors duration-300">
                  <Search size={14} className="text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar tipografía por nombre..."
                    value={fontSearchQuery}
                    onChange={(e) => setFontSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
                  />
                </div>
              </div>

              {/* Categorías de Tipografía */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 shrink-0 scrollbar-none border-b border-[var(--color-border)]/50">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'sans-serif', label: 'Sans-Serif' },
                  { key: 'serif', label: 'Serif' },
                  { key: 'display', label: 'Display' },
                  { key: 'monospace', label: 'Monospace' },
                  { key: 'handwriting', label: 'Script' }
                ].map(cat => {
                  const isActive = fontCategoryFilter === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setFontCategoryFilter(cat.key)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                          : 'bg-[var(--color-surface-2)]/50 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Listado de Fuentes con Vista Previa */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[250px]">
                {AVAILABLE_FONTS
                  .filter(f => {
                    const matchesSearch = f.value.toLowerCase().includes(fontSearchQuery.toLowerCase());
                    const matchesCategory = fontCategoryFilter === 'all' || f.cat === fontCategoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map(font => {
                    const isSelected = googleFont === font.value;
                    return (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => {
                          setGoogleFont(font.value);
                          setIsFontModalOpen(false);
                          showToast(`Fuente cambiada a: ${font.value}`, { type: 'success' });
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-2 hover:scale-[1.01] ${
                          isSelected 
                            ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                            : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[var(--color-text)]">{font.value}</span>
                            <span className="text-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold px-1.5 py-0.5 rounded-md">
                              {font.label}
                            </span>
                          </div>
                          {isSelected && <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">Activa</span>}
                        </div>
                        
                        {/* Vista Previa de la Fuente */}
                        <div className="p-2.5 bg-[var(--color-bg)]/80 rounded-xl border border-[var(--color-border)] w-full text-center transition-colors">
                          <p 
                            className="text-sm font-semibold truncate text-[var(--color-text)]" 
                            style={{ fontFamily: `'${font.value}', sans-serif` }}
                          >
                            {font.value} Specimen
                          </p>
                          <p 
                            className="text-[9px] text-[var(--color-text-muted)] mt-1 truncate" 
                            style={{ fontFamily: `'${font.value}', sans-serif` }}
                          >
                            El veloz murciélago comía feliz cardo.
                          </p>
                        </div>
                        
                        <p className="text-[9px] text-[var(--color-text-muted)] leading-normal mt-0.5">{font.desc}</p>
                      </button>
                    );
                  })}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[var(--color-border)] flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFontModalOpen(false)}
                  className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold border border-[var(--color-border)] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Previsualización en Vivo */}
        {livePreviewComponent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
            <div 
              className="absolute inset-0 bg-transparent" 
              onClick={() => setLivePreviewComponent(null)} 
            />
            <div className="w-full max-w-4xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl flex flex-col h-[85vh] relative z-10 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] z-10 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Play size={8} fill="currentColor" /> Previsualización en Vivo
                  </span>
                  <span className="text-xs font-black text-[var(--color-text)]">
                    {livePreviewComponent.name}
                  </span>
                  {livePreviewComponent.technicalName && (
                    <span className="text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/50 px-2 py-0.5 rounded border border-[var(--color-border)]/50">
                      {livePreviewComponent.technicalName}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setLivePreviewComponent(null)}
                  className="p-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl cursor-pointer transition-all active:scale-95"
                  title="Cerrar previsualización"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Sandbox Render Container */}
              <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg)]/40 scrollbar-thin">
                <ComponentSandbox 
                  componentName={livePreviewComponent.name} 
                  technicalName={livePreviewComponent.technicalName} 
                />
              </div>
              
              {/* Footer */}
              <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] z-10 flex items-center justify-end gap-3 shadow-md">
                <button
                  type="button"
                  onClick={() => setLivePreviewComponent(null)}
                  className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 transition-all cursor-pointer"
                >
                  Cerrar
                </button>
                {(() => {
                  const isSelected = selectedRecomendations.some(r => r.link === livePreviewComponent.link);
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedRecomendations(prev => prev.filter(r => r.link !== livePreviewComponent.link));
                        } else {
                          setSelectedRecomendations(prev => [...prev, {
                            name: livePreviewComponent.name,
                            technicalName: livePreviewComponent.technicalName,
                            link: livePreviewComponent.link,
                            resourceType: livePreviewComponent.resourceType
                          }]);
                        }
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow ${
                        isSelected 
                          ? 'bg-red-650/80 hover:bg-red-600 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isSelected ? 'Remover de Recomendaciones' : 'Añadir a Recomendaciones'}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // CONSTANTES DE NAVEGACIÓN
  const NAV_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortLabel: 'Inicio' },
    { id: 'billing', label: 'Facturación', icon: CreditCard, shortLabel: 'Cobros' },
    { id: 'onboarding', label: 'Nuevo Cliente', icon: Sparkles, shortLabel: 'Nuevo' },
    { id: 'library', label: 'Biblioteca', icon: BookOpen, shortLabel: 'Biblioteca' },
    { id: 'errors', label: 'Consola de Errores', icon: AlertTriangle, shortLabel: 'Monitoreo' },
    { id: 'git', label: 'Control Git', icon: GitCommit, shortLabel: 'Git' },
    { id: 'e2e', label: 'Tests E2E', icon: FlaskConical, shortLabel: 'E2E' },
    { id: 'cores', label: 'Plantillas Core', icon: Layers, shortLabel: 'Cores' },
  ]

  // Proyecciones de ingresos calculadas
  const projExistingMonthly = clientesSaas.reduce((sum, c) => {
    const rate = parseFloat(c.comisionPorcentaje) || 1.5
    return sum + (projAvgSales * rate / 100)
  }, 0)
  const projNewMonthly = projNewClients * (projAvgSales * projRate / 100)
  const projTotalMonthly = projExistingMonthly + projNewMonthly
  const projTotalYear = projTotalMonthly * projMonths

  // Historial de Aprovisionamientos (Clientes activos o archivados)
  const filteredProvisionings = clientesSaas.filter(c => showArchivedHistory ? c.archived === true : c.archived !== true)
  const HISTORY_ITEMS_PER_PAGE = 10
  const totalHistoryPages = Math.ceil(filteredProvisionings.length / HISTORY_ITEMS_PER_PAGE) || 1
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages)
  const paginatedProvisionings = filteredProvisionings.slice(
    (currentHistoryPage - 1) * HISTORY_ITEMS_PER_PAGE,
    currentHistoryPage * HISTORY_ITEMS_PER_PAGE
  )

  // Historial de Errores e Incidentes
  const filteredFailures = failures.filter(f => selectedErrorClientFilter === 'todos' || f.clientId === selectedErrorClientFilter)
  const FAILURES_ITEMS_PER_PAGE = 10
  const totalFailuresPages = Math.ceil(filteredFailures.length / FAILURES_ITEMS_PER_PAGE) || 1
  const currentFailuresPage = Math.min(errorsPage, totalFailuresPages)
  const paginatedFailures = filteredFailures.slice(
    (currentFailuresPage - 1) * FAILURES_ITEMS_PER_PAGE,
    currentFailuresPage * FAILURES_ITEMS_PER_PAGE
  )

  // Obtener preview del mensaje WhatsApp
  const getWaPreview = () => {
    const tmpl = waTemplates.find(t => t.id === selectedWaTemplate)
    if (!tmpl) return ''
    const clientPending = reports
      .filter(r => r.clientId === waClientId && (r.estadoPago || 'pendiente') === 'pendiente')
      .reduce((sum, r) => sum + (r.comisionValor || 0), 0)
    const comVal = waComision || clientPending.toLocaleString('es-CO')
    return tmpl.body
      .replace(/{cliente}/g, waClientId || '{cliente}')
      .replace(/{periodo}/g, waPeriodo || '{periodo}')
      .replace(/{comision}/g, comVal || '{comision}')
  }

  const handleSendWhatsApp = () => {
    const msg = getWaPreview()
    if (!msg.trim()) {
      showToast('Completa los campos del mensaje', { type: 'error' })
      return
    }
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    showToast('Abriendo WhatsApp con el mensaje...', { type: 'success' })
  }

  const handleCopyWaMessage = () => {
    const msg = getWaPreview()
    copy(msg)
    showToast('Mensaje copiado al portapapeles ✓', { type: 'success' })
  }

  // RENDER PANEL PRINCIPAL
  return (
    <div className="h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans overflow-hidden selection:bg-violet-500/30 selection:text-violet-200 transition-colors duration-300 flex flex-col md:cursor-none">
      {/* Cursor personalizado — solo desktop */}
      <CustomCursor />

      {/* Background decorativos */}
      <div className="fixed top-0 right-0 w-[50%] h-[400px] rounded-full bg-gradient-to-b from-violet-500/5 to-purple-500/0 blur-[150px] pointer-events-none opacity-50 dark:opacity-100 z-0" />
      <div className="fixed top-[20%] left-[-10%] w-[40%] h-[400px] rounded-full bg-violet-500/2 blur-[150px] pointer-events-none opacity-50 dark:opacity-100 z-0" />

      {/* Topbar Premium */}
      <nav className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md pr-4 lg:pr-6 pl-0 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300 shrink-0">
        <div className="flex items-center gap-0">
          {/* Contenedor responsivo al colapso del sidebar */}
          <div 
            className={`hidden lg:flex items-center h-14 border-r border-[var(--color-border)] transition-all duration-300 shrink-0 px-4 ${
              sidebarCollapsed ? 'w-[64px] justify-center' : 'w-[220px] justify-start gap-3'
            }`}
          >
            {/* Hamburger Button (Always visible on the left) */}
            <button
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="w-8 h-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 hover:bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer shrink-0"
              title={sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <Menu size={15} />
            </button>

            {/* Logo & Brand (Inside wrapper, visible ONLY when expanded) */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 transition-all duration-300 ease-out select-none truncate">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <img src="/logo.png?v=3" className="w-5.5 h-5.5 object-contain rounded-full" alt="Logo" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm tracking-wide text-[var(--color-text)] leading-tight">PROTOTIPE</span>
                </div>
              </div>
            )}
          </div>
  
          {/* Logo & Brand (Visible always on mobile, on desktop only when sidebar is collapsed) */}
          <div 
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setSidebarCollapsed(false);
              }
            }}
            className={`flex items-center gap-3 pl-4 sm:pl-6 transition-all duration-300 ease-out cursor-pointer hover:opacity-80 select-none ${
              !sidebarCollapsed ? 'lg:hidden' : 'lg:flex'
            }`}
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <img src="/logo.png?v=3" className="w-5.5 h-5.5 object-contain rounded-full" alt="Logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wide text-[var(--color-text)] leading-tight">PROTOTIPE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('errors')}
            className={`hidden md:flex items-center gap-2 px-3 h-8 rounded-xl border text-[11px] font-bold cursor-pointer transition-all duration-200 active:scale-95 select-none ${
              isSimulated
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15'
                : failures.filter(f => !f.resolved).length > 0
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15'
            }`}
            title="Ver Consola de Errores y Monitoreo"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-radar-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSimulated 
                  ? 'bg-amber-400' 
                  : failures.filter(f => !f.resolved).length > 0 
                    ? 'bg-red-400' 
                    : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isSimulated 
                  ? 'bg-amber-500' 
                  : failures.filter(f => !f.resolved).length > 0 
                    ? 'bg-red-500' 
                    : 'bg-emerald-500'
              }`}></span>
            </span>
            <span className="tracking-wide">
              {isSimulated 
                ? 'Sandbox Local' 
                : failures.filter(f => !f.resolved).length > 0 
                  ? `${failures.filter(f => !f.resolved).length} Fallo${failures.filter(f => !f.resolved).length > 1 ? 's' : ''} en Apps` 
                  : 'Sistemas en Línea'
              }
            </span>
          </button>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="h-8 px-3 rounded-xl border bg-[var(--color-surface-2)]/50 hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-[var(--color-border)] transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs font-bold"
            title="Ver detalles del perfil"
          >
            <User size={13} />
            <span>Perfil</span>
          </button>
        </div>
      </nav>

      {/* ===== LAYOUT PRINCIPAL: SIDEBAR + CONTENIDO ===== */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* SIDEBAR - Desktop */}
        <aside className={`hidden lg:flex flex-col shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md transition-all duration-300 ${
          sidebarCollapsed ? 'w-[64px]' : 'w-[220px]'
        }`}>
          <div className="flex flex-col gap-1 p-3 flex-1 pt-5">
            {NAV_TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`sidebar-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  title={sidebarCollapsed ? tab.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border w-full text-left ${
                    isActive
                      ? 'sidebar-item-active text-violet-400 border-violet-500/30'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/50 border-transparent'
                  }`}
                >
                  <Icon size={16} className={`shrink-0 ${isActive ? 'text-violet-400' : ''}`} />
                  {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                  {!sidebarCollapsed && isActive && <ChevronRight size={12} className="ml-auto text-violet-400/60" />}
                </button>
              )
            })}
          </div>
          {/* Sidebar footer */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-[var(--color-border)] text-[9px] text-[var(--color-text-muted)] font-mono">
              v{new Date().getFullYear()} · PROTOTIPE ENGINE
            </div>
          )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-24 lg:pb-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-6 mt-6 space-y-6">

          {/* Alerta de Simulación (siempre visible) */}
          {isSimulated && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400/90 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <AlertTriangle size={16} className="shrink-0 text-amber-500 animate-pulse mt-0.5" />
              <div>
                <strong className="text-amber-900 dark:text-amber-300 font-bold block">Entorno Sandbox Activo</strong>
                <p className="text-[10px] opacity-80 mt-0.5">Los cambios son en memoria. Configura <code className="font-mono">VITE_DEVELOPER_CENTRAL_*</code> en <code className="font-mono">.env.local</code> para producción.</p>
              </div>
            </div>
          )}

          {/* Banner de Reintento CLI Pendiente */}
          {pendingCliProvisioning && (
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-red-500/10 rounded-xl shrink-0 mt-0.5">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-red-400 uppercase tracking-wider">Aprovisionamiento físico pendiente</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                    El cliente <strong className="text-[var(--color-text)] font-mono">{pendingCliProvisioning.clientId}</strong> fue registrado en Firestore, pero el daemon CLI (puerto 3001) no respondió.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleRetryCliProvisioning} disabled={isProvisioning}
                  className="px-3.5 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-xl text-[11px] font-extrabold cursor-pointer flex items-center gap-1.5 transition-all active:scale-95">
                  {isProvisioning ? <><RefreshCw size={12} className="animate-spin" /> Reintentando...</> : <><RefreshCw size={12} /> Reintentar</>}
                </button>
                <button onClick={handleDiscardPendingProvisioning}
                  className="px-3 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl text-[11px] font-bold cursor-pointer border border-[var(--color-border)] transition-colors">
                  Descartar
                </button>
              </div>
            </div>
          )}

          {/* ===== TAB: DASHBOARD ===== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 tab-content-enter">
              {/* Encabezado */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
                    <LayoutDashboard size={20} className="text-violet-400" />
                    Dashboard General
                  </h1>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Visión consolidada de ingresos y estado del sistema en tiempo real.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleCreateTestReport}
                    className="px-3 py-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-bold flex items-center gap-1.5 transition-all border border-[var(--color-border)] active:scale-[0.98] cursor-pointer">
                    <Database size={13} />
                    Test Telemetría
                  </button>
                  <button onClick={() => { setIsSimulated(prev => !prev); addLog(`Modo: ${!isSimulated ? 'SANDBOX' : 'CONECTADO'}`, 'warning') }}
                    className="px-3 py-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-bold flex items-center gap-1.5 transition-all border border-[var(--color-border)] active:scale-[0.98] cursor-pointer">
                    <Server size={13} />
                    {isSimulated ? 'Sandbox' : 'Conectado'}
                  </button>
                </div>
              </div>

              {/* Métricas - Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Comisión Acumulada', val: totalComision, icon: TrendingUp, col: 'from-violet-500/20 to-violet-500/5 dark:from-violet-500/10 dark:to-violet-500/2', iconCol: 'text-violet-650 dark:text-violet-400', type: 'comision' },
                  { label: 'Cobrado', val: totalCobrado, icon: CheckCircle, col: 'from-emerald-500/20 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/2', iconCol: 'text-emerald-600 dark:text-emerald-400', type: 'cobrado' },
                  { label: 'Por Recaudar', val: totalPendiente, icon: Clock, col: 'from-amber-500/20 to-amber-500/5 dark:from-amber-500/10 dark:to-amber-500/2', iconCol: 'text-amber-600 dark:text-amber-400', type: 'pendiente' },
                  { label: 'Clientes Activos', val: clientesActivos, icon: Users, col: 'from-cyan-500/20 to-cyan-500/5 dark:from-cyan-500/10 dark:to-cyan-500/2', iconCol: 'text-cyan-600 dark:text-cyan-400', isNumber: true, type: 'clientes' }
                ].map((card, idx) => (
                  <div key={idx} onClick={() => card.type === 'clientes' ? setActiveTab('crm') : setActiveMetricModal(card.type)}
                    className={`p-5 bg-gradient-to-br ${card.col} bg-[var(--color-surface)] rounded-2xl flex flex-col gap-2 shadow-sm relative overflow-hidden group active:scale-[0.98] cursor-pointer border border-[var(--color-border)] hover-glow-card`}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-widest leading-tight">{card.label}</span>
                      <div className={`p-1.5 rounded-lg bg-[var(--color-bg)] ${card.iconCol}`}>
                        <card.icon size={14} />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold mt-2 tracking-tight text-[var(--color-text)]">
                      {card.isNumber ? card.val : `$${card.val.toLocaleString('es-CO')}`}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts + Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                {/* Gráfico de barras */}
                <div className="lg:col-span-2 bg-[var(--color-surface)] p-6 rounded-2xl flex flex-col shadow-sm relative overflow-hidden transition-colors duration-300 border border-[var(--color-border)]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/3 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-1 mb-5">
                    <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">Métricas</span>
                    <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2">
                      <BarChart3 size={16} className="text-violet-550 dark:text-violet-400" />
                      Comisiones por Cliente
                    </h3>
                  </div>
                  {chartData.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-slate-500 text-xs">Sin datos suficientes.</div>
                  ) : (
                    <div className="space-y-3">
                      {chartData.map((client, idx) => {
                        const pctWidth = (client.totalCommission / maxChartValue) * 100
                        const colorSet = [
                          { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', bar: 'bg-violet-500' },
                          { text: 'text-cyan-650 dark:text-cyan-400', bg: 'bg-cyan-500/10', bar: 'bg-cyan-500' },
                          { text: 'text-emerald-650 dark:text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' },
                          { text: 'text-amber-650 dark:text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500' },
                          { text: 'text-pink-650 dark:text-pink-400', bg: 'bg-pink-500/10', bar: 'bg-pink-500' }
                        ][idx % 5]
                        return (
                          <div key={client.name} className="p-3 bg-[var(--color-surface-2)]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--color-surface-2)]/50 transition-all duration-300 shadow-sm">
                            <div className="flex items-center gap-3 min-w-[140px]">
                              <div className={`w-8 h-8 rounded-xl ${colorSet.bg} ${colorSet.text} font-bold flex items-center justify-center text-xs shrink-0`}>
                                {client.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-[var(--color-text)] truncate max-w-[100px]" title={client.name}>{client.name}</h4>
                                <p className="text-[9px] text-[var(--color-text-muted)]">{client.reportCount} reportes</p>
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between text-[9px] text-[var(--color-text-muted)]">
                                <span>Ventas</span>
                                <span className="font-mono">${client.totalSales.toLocaleString('es-CO')}</span>
                              </div>
                              <div className="h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${colorSet.bar}`} style={{ width: `${Math.max(pctWidth, 3)}%` }} />
                              </div>
                            </div>
                            <div className="text-right min-w-[90px]">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Comisión</span>
                              <span className="text-xs font-black text-violet-650 dark:text-violet-400 font-mono">${client.totalCommission.toLocaleString('es-CO')}</span>
                              {client.pendingCount > 0 ? (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 block mt-0.5">{client.pendingCount} pend.</span>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}`
                    </div>
                  )}
                </div>

                {/* Consola de Telemetría (Estilo Ventana de Comandos Real e Interactiva) */}
                <div className="bg-[var(--color-surface)] rounded-2xl flex flex-col shadow-sm transition-colors duration-300 border border-[var(--color-border)] overflow-hidden">
                  {/* Top Bar de Ventana de Comandos */}
                  <div className="bg-[var(--color-surface-2)]/60 px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/85 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/85 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/85 block" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider">telemetry_monitor.sh</span>
                    <span className="w-6" />
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">Live Monitor</span>
                        <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2">
                          <Activity size={16} className="text-violet-400 animate-pulse" />
                          Telemetría
                        </h3>
                      </div>
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          !isOnline ? 'bg-red-400' : (isSimulated ? 'bg-amber-400' : 'bg-emerald-400')
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          !isOnline ? 'bg-red-500' : (isSimulated ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}></span>
                      </span>
                    </div>

                    {/* Canal DB & Status Info Row */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex items-center gap-1.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${!isOnline ? 'bg-red-500' : (dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-500' : 'bg-amber-500')}`} />
                        <span className="truncate font-semibold text-[var(--color-text-muted)]">
                          {!isOnline ? 'Offline' : (dbStatus === 'conectado' && !isSimulated ? 'Firestore' : 'Sandbox')}
                        </span>
                      </div>
                      <div className="p-2 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate font-semibold text-[var(--color-text-muted)] uppercase">
                          {telemetryTypeFilter === 'todos' ? 'Todos' : telemetryTypeFilter}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Filters Bar */}
                    <div className="space-y-2">
                      {/* Tabs de tipo de log */}
                      <div className="flex bg-slate-950/40 p-0.5 rounded-xl border border-slate-900 justify-between">
                        {[
                          { id: 'todos', label: 'Todos' },
                          { id: 'error', label: 'Fallas' },
                          { id: 'billing', label: 'Cobros' },
                          { id: 'info_warning', label: 'Sistema' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => { setTelemetryTypeFilter(t.id); setLogPage(1); }}
                            className={`flex-1 text-center py-1 rounded-lg text-[8px] font-bold transition-all cursor-pointer ${
                              telemetryTypeFilter === t.id 
                                ? 'bg-indigo-650 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Buscador de logs compacto */}
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Buscar en logs..." 
                          value={telemetrySearchQuery}
                          onChange={(e) => { setTelemetrySearchQuery(e.target.value); setLogPage(1); }}
                          className="h-7 pl-7 pr-6 w-full bg-slate-950/40 border border-[var(--color-border)] text-[9px] text-slate-200 placeholder-slate-500 rounded-xl focus:outline-none focus:border-indigo-500/70 focus:bg-slate-900/40 transition-all"
                        />
                        <Search size={10} className="absolute left-2.5 top-2.5 text-slate-500" />
                        {telemetrySearchQuery && (
                          <button 
                            onClick={() => setTelemetrySearchQuery('')}
                            className="absolute right-2 top-2 text-[8px] font-bold text-slate-500 hover:text-white"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active client filter badge */}
                    {telemetryClientFilter !== 'todos' && (
                      <div className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full self-start">
                        <span className="text-[8px] font-bold uppercase text-indigo-400">Cliente:</span>
                        <span className="text-[8px] font-extrabold text-[var(--color-text)] font-mono truncate max-w-[90px]">{telemetryClientFilter}</span>
                        <button 
                          onClick={() => setTelemetryClientFilter('todos')}
                          className="text-[7px] text-indigo-300 hover:text-white ml-1 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Terminal logs list */}
                    <div className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 h-[240px] overflow-y-auto scrollbar-thin flex flex-col gap-2">
                      {filteredTelemetryLogs.length === 0 ? (
                        <div className="text-[var(--color-text-muted)] italic text-xs text-center my-auto flex flex-col items-center justify-center gap-1 select-none">
                          <Activity size={18} className="text-slate-650 dark:text-slate-755 animate-pulse mb-1" />
                          <span>Sin transmisiones registradas</span>
                          <span className="text-[8px] text-slate-500">Prueba cambiando los filtros</span>
                        </div>
                      ) : (
                        (() => {
                          const LOGS_PER_PAGE = 5
                          const totalLogPages = Math.ceil(filteredTelemetryLogs.length / LOGS_PER_PAGE) || 1
                          const currentPage = Math.min(logPage, totalLogPages)
                          const paginatedLogs = filteredTelemetryLogs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE)
                          return paginatedLogs.map((log, index) => {
                            const isClickable = log.type === 'error';
                            const hoverStyle = isClickable ? 'cursor-pointer hover:bg-red-500/10 active:scale-[0.99] transition-all' : '';
                            const cardStyle = { info: 'bg-[var(--color-surface-2)]/45 text-[var(--color-text-muted)] border-[var(--color-border)]', warning: 'bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20', error: 'bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/20', success: 'bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' }[log.type]
                            const badgeStyle = { info: 'bg-slate-500/10 text-slate-500 dark:text-slate-400', warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', error: 'bg-red-500/10 text-red-600 dark:text-red-400', success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }[log.type]
                            const label = { info: 'INFO', warning: 'WARN', error: 'ERR', success: 'OK' }[log.type]
                            return (
                              <div 
                                key={index} 
                                onClick={isClickable ? () => { setSelectedErrorClientFilter(log.client || 'todos'); setActiveTab('errors'); } : undefined}
                                className={`p-2 rounded-xl border ${cardStyle} ${hoverStyle} text-[9px] flex flex-col gap-1`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span className={`px-1 py-0.5 rounded text-[7px] font-bold ${badgeStyle}`}>{label}</span>
                                    {log.client && (
                                      <span 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTelemetryClientFilter(log.client);
                                        }}
                                        className="px-1 py-0.2 bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:text-indigo-400 rounded text-[7px] font-mono cursor-pointer"
                                        title="Filtrar por este cliente"
                                      >
                                        {log.client}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[7.5px] text-[var(--color-text-muted)] font-mono">{log.timestamp}</span>
                                </div>
                                <p className="font-mono leading-relaxed break-words pl-0.5">
                                  {log.message}
                                  {index === 0 && <span className="w-1.5 h-3 bg-violet-400 animate-cursor-blink inline-block ml-1" />}
                                </p>
                              </div>
                            )
                          })
                        })()
                      )}
                    </div>

                    {/* Pagination & Limpiar */}
                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                      <button 
                        onClick={() => { setSystemLogs([]); setLogPage(1) }} 
                        className="text-[9px] font-bold text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                      >
                        Limpiar
                      </button>
                      {filteredTelemetryLogs.length > 5 && (
                        <div className="flex items-center gap-1.5 text-[9px]">
                          <button 
                            disabled={logPage === 1} 
                            onClick={() => setLogPage(p => Math.max(p - 1, 1))} 
                            className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer font-bold"
                          >
                            ◀
                          </button>
                          <span className="font-mono text-[8.5px] text-[var(--color-text-muted)]">
                            {logPage}/{Math.ceil(filteredTelemetryLogs.length / 5)}
                          </span>
                          <button 
                            disabled={logPage >= Math.ceil(filteredTelemetryLogs.length / 5)} 
                            onClick={() => setLogPage(p => p + 1)} 
                            className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer font-bold"
                          >
                            ▶
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* SIMULADOR DE PROYECCIONES DE INGRESOS */}
              <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] transition-colors duration-300">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Herramienta Financiera</span>
                    <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2 mt-0.5">
                      <Calculator size={16} className="text-indigo-400" />
                      Simulador de Proyecciones de Ingresos
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Proyecta tu crecimiento añadiendo nuevas tiendas sobre la base actual de clientes.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Nuevas Tiendas a Añadir</label>
                    <input type="number" min="0" value={projNewClients === 0 ? '' : projNewClients} onChange={e => setProjNewClients(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Ventas Promedio/Tienda ($)</label>
                    <input type="number" min="0" step="500000" value={projAvgSales === 0 ? '' : projAvgSales} onChange={e => setProjAvgSales(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Tasa Nuevas Tiendas (%)</label>
                    <input type="number" min="0" step="0.1" value={projRate === 0 ? '' : projRate} onChange={e => setProjRate(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Horizonte (Meses)</label>
                    <input type="number" min="1" max="60" value={projMonths === 0 ? '' : projMonths} onChange={e => setProjMonths(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 w-full font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">Ingresos Actuales / Mes</span>
                    <p className="text-lg font-black font-mono text-[var(--color-text)] mt-1">${projExistingMonthly.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">{clientesSaas.length} clientes activos</p>
                  </div>
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-xl">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-400 block">Proyección Total / Mes</span>
                    <p className="text-lg font-black font-mono text-indigo-400 mt-1">${projTotalMonthly.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
                    <p className="text-[9px] text-indigo-400/70">+{projNewClients} tiendas nuevas</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 block">Proyección {projMonths} Meses</span>
                    <p className="text-lg font-black font-mono text-emerald-400 mt-1">${projTotalYear.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
                    <p className="text-[9px] text-emerald-400/70">Acumulado total estimado</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: CRM ===== */}
          {activeTab === 'crm' && (
            <div className="space-y-6 tab-content-enter">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
                    <Users size={20} className="text-purple-400" />
                    CRM de Clientes
                  </h1>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Directorio completo, configuración de facturación y portal de cada cliente.</p>
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <button onClick={handleGlobalSyncSafeFiles}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shrink-0">
                    <RefreshCw size={13} className="animate-pulse" />
                    Sincronización Global Core (Safe)
                  </button>
                  <button onClick={handleGlobalDeployAll}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shrink-0">
                    <Activity size={13} />
                    Despliegue Global Hosting
                  </button>
                  <button onClick={handleRequestAllTelemetry}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/25 text-purple-400 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shrink-0">
                    <Activity size={13} />
                    Obtener Telemetría Global
                  </button>
                  <button onClick={() => setActiveTab('onboarding')}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.98] cursor-pointer shrink-0">
                    <Plus size={13} />
                    Nuevo Cliente
                  </button>
                </div>
              </div>
              {/* Contenido CRM existente — modal de métrica reutilizado inline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2.5 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-all">
                  <Search size={14} className="text-slate-500 shrink-0" />
                  <input type="text" placeholder="Buscar cliente..." value={crmSearch} onChange={e => setCrmSearch(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0" />
                </div>
                {/* Lista de clientes */}
                {Object.values(clientAggregated).filter(c => c.name.toLowerCase().includes(crmSearch.toLowerCase())).map(client => (
                  <div key={client.name} className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black flex items-center justify-center text-sm border border-indigo-500/20">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[var(--color-text)]">{client.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{client.reportCount} reportes · {client.pendingCount} pendientes</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-3 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-[var(--color-border)] md:border-t-0">
                      <div className="flex items-center gap-6 pr-2">
                        <div className="text-left md:text-center">
                          <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Ventas</span>
                          <span className="text-xs font-black font-mono text-[var(--color-text)]">${client.totalSales.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="text-left md:text-center">
                          <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Comisión</span>
                          <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">${client.totalCommission.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* BOTÓN DESPLEGAR EN LOCAL */}
                        {(() => {
                          const server = localServers[client.name] || { running: false, url: '', loading: false };
                          if (server.loading) {
                            return (
                              <button disabled
                                className="px-3 py-1.5 bg-violet-600/10 text-violet-450 dark:text-violet-400 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all opacity-50 shrink-0 border border-violet-500/10">
                                <RefreshCw size={11} className="animate-spin" />
                                Procesando...
                              </button>
                            );
                          }
                          if (server.running) {
                            return (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <a href={server.url} target="_blank" rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-550 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm border-none flex items-center">
                                  <ArrowUpRight size={11} className="mr-0.5" />
                                  Ir a Local
                                </a>
                                <button onClick={() => handleStopLocalServer(client.name)}
                                  className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all active:scale-95 border border-red-500/10 hover:border-red-500/30">
                                  <StopCircle size={11} />
                                  Detener
                                </button>
                              </div>
                            );
                          }
                          return (
                            <button onClick={() => handleStartLocalServer(client.name)}
                              className="px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-650 dark:text-violet-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all active:scale-95 border border-violet-500/10 hover:border-violet-500/30 shrink-0">
                              <Play size={11} />
                              Desplegar en Local
                            </button>
                          );
                        })()}
                        <button onClick={() => handleRequestClientTelemetry(client.name)}
                          className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-650 dark:text-emerald-400 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all active:scale-95 border border-emerald-500/10 hover:border-emerald-500/30 shrink-0">
                          <Activity size={11} className="animate-pulse" />
                          Obtener Telemetría
                        </button>
                        <button onClick={() => { 
                          const cfg = clientesSaas.find(c => c.id.toLowerCase() === client.name.toLowerCase()) || {};
                          setEditNiche(cfg.niche || 'retail_clothing');
                          setEditBillingMode(cfg.billingMode || 'percentage');
                          setEditComisionPorcentaje(cfg.comisionPorcentaje !== undefined ? cfg.comisionPorcentaje : 1.5);
                          setEditMontoFijoServicio(cfg.montoFijoServicio !== undefined ? cfg.montoFijoServicio : 500);
                          setEditPagoMensualFijo(cfg.pagoMensualFijo !== undefined ? cfg.pagoMensualFijo : 50000);
                          setEditEnableDianBilling(!!cfg.enableDianBilling);
                          setEditCostoPorFacturaDian(cfg.costoPorFacturaDian !== undefined ? cfg.costoPorFacturaDian : 150);
                          setCrmTab('config');
                          setDriftData(null);
                          setSelectedCrmClientId(client.name); 
                          setActiveMetricModal('clientes'); 
                        }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all active:scale-95 shadow-sm shrink-0 border-none">
                          Gestionar
                          <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.values(clientAggregated).filter(c => c.name.toLowerCase().includes(crmSearch.toLowerCase())).length === 0 && (
                  <div className="p-12 text-center text-slate-500 text-xs">No hay clientes que coincidan con la búsqueda.</div>
                )}
              </div>
            </div>
          )}

          {/* ===== TAB: BILLING ===== */}
          {activeTab === 'billing' && (
            <div className="space-y-6 tab-content-enter">
              <div>
                <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
                  <CreditCard size={20} className="text-emerald-400" />
                  Facturación y Cobros
                </h1>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Consolidado de comisiones, estado de pagos y herramientas de cobro.</p>
              </div>

              {/* Listado de reportes */}
              <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] transition-colors duration-300">
                <div className="p-5 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="font-extrabold text-sm flex items-center gap-2 text-[var(--color-text)]">
                    <Layers size={15} className="text-indigo-400" />
                    Consolidado Mensual
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2 rounded-xl w-full sm:w-56 shadow-sm focus-within:border-indigo-500/50 transition-all">
                      <Search size={13} className="text-slate-500" />
                      <input type="text" placeholder="Buscar cliente o periodo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0" />
                    </div>
                    <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl shadow-sm">
                      {['todos', 'pendiente', 'pagado'].map(f => (
                        <button key={f} onClick={() => setStatusFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            statusFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                          }`}>{f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : 'Pagados'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {isLoading ? (
                  <div className="p-16 text-center text-slate-400 text-xs space-y-3">
                    <RefreshCw size={22} className="mx-auto animate-spin text-indigo-400" />
                    <p className="font-semibold uppercase tracking-wider text-[10px]">Cargando datos...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 text-xs">Ningún reporte coincide con los filtros.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/70 font-bold">
                          <th className="p-4 pl-5 uppercase tracking-wider text-[10px]">App Cliente</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Periodo</th>
                          <th className="p-4 text-right uppercase tracking-wider text-[10px]">Ventas</th>
                          <th className="p-4 text-center uppercase tracking-wider text-[10px]">Tarifa</th>
                          <th className="p-4 text-right uppercase tracking-wider text-[10px]">Comisión</th>
                          <th className="p-4 text-center uppercase tracking-wider text-[10px]">Estado</th>
                          <th className="p-4 pr-5 text-right uppercase tracking-wider text-[10px]">Transmisión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {filteredReports.map(report => (
                          <tr key={report.id} onClick={() => setSelectedReport(report)}
                            className={`hover:bg-[var(--color-surface-2)]/40 transition-colors cursor-pointer group ${
                              selectedReport && selectedReport.id === report.id ? 'bg-[var(--color-surface-2)]/60' : ''
                            }`}>
                            <td className="p-4 pl-5 font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${report.estadoPago === 'pagado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {report.clientId}
                              </div>
                            </td>
                            <td className="p-4 font-mono font-bold text-[var(--color-text)] opacity-90">{report.periodo}</td>
                            <td className="p-4 text-right font-mono text-[var(--color-text)]">${report.totalVentas.toLocaleString('es-CO')}</td>
                            <td className="p-4 text-center font-bold text-[var(--color-text-muted)]">
                              {(() => {
                                const cfg = clientesSaas.find(c => c.id.toLowerCase() === report.clientId.toLowerCase())
                                const mode = cfg?.billingMode || 'percentage'
                                if (mode === 'fixed_per_service') return `$${(cfg?.montoFijoServicio || 500).toLocaleString('es-CO')} c/u`
                                if (mode === 'flat_monthly') return `$${((cfg?.pagoMensualFijo || 50000) / 1000).toFixed(0)}k/mes`
                                return `${report.comisionPorcentaje || cfg?.comisionPorcentaje || 1.5}%`
                              })()}
                            </td>
                            <td className="p-4 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-300">${report.comisionValor.toLocaleString('es-CO')}</td>
                            <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleTogglePayment(report)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 mx-auto ${
                                  report.estadoPago === 'pagado'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${report.estadoPago === 'pagado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {report.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                              </button>
                            </td>
                            <td className="p-4 pr-5 text-right font-mono text-[10px] text-[var(--color-text-muted)] opacity-80">
                              {report.updatedAt?.toDate ? report.updatedAt.toDate().toLocaleDateString('es-CO') : 'Reciente'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* GESTOR DE PLANTILLAS WHATSAPP */}
              <div className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] transition-colors duration-300">
                <div className="mb-5">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Herramienta de Cobro</span>
                  <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2 mt-0.5">
                    <MessageSquare size={16} className="text-emerald-400" />
                    Gestor de Plantillas WhatsApp
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Personaliza y envía recordatorios de cobro con campos dinámicos a tus clientes.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel Izquierdo: Configuración */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Plantilla</label>
                      <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] p-1 rounded-xl gap-1 flex-wrap">
                        {waTemplates.map(t => (
                          <button key={t.id} onClick={() => setSelectedWaTemplate(t.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              selectedWaTemplate === t.id ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                            }`}>{t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Cliente ({'{cliente}'})</label>
                        <CustomSelect
                          value={waClientId}
                          onChange={e => setWaClientId(e.target.value)}
                          options={[{ id: '', name: '-- Seleccionar --' }, ...Object.keys(clientAggregated).map(k => ({ id: k, name: k }))]}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Periodo ({'{periodo}'})</label>
                        <input type="month" value={waPeriodo} onChange={e => setWaPeriodo(e.target.value)}
                          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 w-full" />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Comisión Manual ({'{comision}'}) <span className="font-normal">— Opcional, se auto-calcula si está vacío</span></label>
                        <input type="text" placeholder="Ej: 102,750 (dejar vacío para auto-calcular)" value={waComision} onChange={e => setWaComision(e.target.value)}
                          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 w-full font-mono" />
                      </div>
                    </div>
                    {/* Editor de plantilla */}
                    {editingTemplate === selectedWaTemplate ? (
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Editar cuerpo de la plantilla</label>
                        <textarea rows={4} value={editingTemplateBody} onChange={e => setEditingTemplateBody(e.target.value)}
                          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 w-full resize-none font-mono" />
                        <div className="flex gap-2">
                          <button onClick={() => {
                              setWaTemplates(prev => prev.map(t => t.id === editingTemplate ? { ...t, body: editingTemplateBody } : t))
                              setEditingTemplate(null)
                              showToast('Plantilla actualizada', { type: 'success' })
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors">Guardar</button>
                          <button onClick={() => setEditingTemplate(null)}
                            className="px-3 py-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl text-[10px] font-bold cursor-pointer border border-[var(--color-border)] transition-colors">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingTemplate(selectedWaTemplate); setEditingTemplateBody(waTemplates.find(t => t.id === selectedWaTemplate)?.body || '') }}
                        className="text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer underline">
                        Editar texto de esta plantilla
                      </button>
                    )}
                  </div>
                  {/* Panel Derecho: Preview + Acciones */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block mb-2">Vista Previa del Mensaje</label>
                      <div className="bg-[#075E54]/10 border border-[#075E54]/20 rounded-2xl p-4 min-h-[120px] relative">
                        <div className="absolute top-3 right-3 w-5 h-5 bg-[#25D366]/20 rounded-full flex items-center justify-center">
                          <MessageSquare size={10} className="text-[#25D366]" />
                        </div>
                        <p className="text-xs text-[var(--color-text)] leading-relaxed whitespace-pre-wrap font-sans">
                          {getWaPreview() || <span className="text-[var(--color-text-muted)] italic">Selecciona un cliente para ver la vista previa...</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={handleSendWhatsApp}
                        className="w-full py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                        <Send size={13} />
                        Abrir en WhatsApp
                      </button>
                      <button onClick={handleCopyWaMessage}
                        className="w-full py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border border-[var(--color-border)] active:scale-[0.98]">
                        <Copy size={13} />
                        Copiar Mensaje
                      </button>
                    </div>
                    <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                      <p className="text-[9px] text-[var(--color-text-muted)] font-mono leading-relaxed">
                        Variables disponibles: <span className="text-indigo-400">{'{cliente}'}</span> · <span className="text-indigo-400">{'{periodo}'}</span> · <span className="text-indigo-400">{'{comision}'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: LIBRARY ===== */}
          {activeTab === 'library' && (
            <ComponentLibraryView showToast={showToast} />
          )}

          {activeTab === 'onboarding' && (
            <div className="tab-content-enter h-full">
              {isOnboardingActive ? (
                <div className="text-center text-xs text-[var(--color-text-muted)] p-8">El asistente de aprovisionamiento está activo en la vista de pantalla completa.</div>
              ) : (
                <div className="space-y-6">
                  {/* Tarjeta de Inicio de Asistente */}
                  <div className="relative overflow-hidden w-full min-h-[420px] flex items-center justify-center rounded-3xl border border-[var(--color-border)] shadow-2xl p-8 sm:p-12 transition-all duration-300">
                    {/* Interactive Ambient Glow Background — ocupa todo el contenedor */}
                    <InteractiveAmbientGlow 
                      color1="var(--color-primary)"
                      color2="var(--color-accent)"
                      color3="#ec4899"
                      sensitivity={0.07}
                    />
                    
                    {/* Inner Content Card (Glassmorphism & Neon Shadows) */}
                    <div className="relative z-10 text-center max-w-xl mx-auto space-y-6 p-6 sm:p-8 rounded-2xl bg-[var(--color-surface-2)]/60 dark:bg-[var(--color-surface-2)]/45 backdrop-blur-xl border border-[var(--color-border)] shadow-xl transition-all duration-500 hover:shadow-indigo-500/10">
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
                        {/* Premium Interactive Button */}
                        <button 
                          onClick={() => setIsOnboardingActive(true)}
                          className="group relative px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2.5 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.97] hover:scale-[1.02] cursor-pointer"
                        >
                          {/* Glow effect on hover */}
                          <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300 pointer-events-none" />
                          
                          <span className="relative flex items-center gap-2">
                            <Sparkles size={14} className="animate-spin-slow text-indigo-200 group-hover:rotate-12 transition-transform" />
                            <span>Iniciar Asistente Premium</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                        
                        <div className="flex items-center gap-4 text-[9px] text-[var(--color-text-muted)] font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Branding en caliente
                          </span>
                          <span className="w-0.5 h-0.5 rounded-full bg-[var(--color-border)]" />
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-indigo-500" />
                            Base de datos seed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historial de Aprovisionamientos Previos */}
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
                            setShowArchivedHistory(prev => !prev)
                            setHistoryPage(1)
                          }}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none ${
                            showArchivedHistory
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                              : 'bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                          }`}
                        >
                          {showArchivedHistory ? 'Ver Activos' : 'Ver Archivados'}
                        </button>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full select-none shrink-0 whitespace-nowrap">
                          {filteredProvisionings.length} {showArchivedHistory ? 'Archivado' : 'Instancia'}{filteredProvisionings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/20">
                      {/* Vista Desktop: Tabla */}
                      <table className="w-full text-left border-collapse hidden md:table">
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
                                {showArchivedHistory 
                                  ? 'No se encontraron registros de aprovisionamiento archivados.'
                                  : 'No se encontraron registros de aprovisionamiento activos.'
                                }
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
                              ].find(n => n.id === client.niche) || { emoji: "📦", name: client.niche || "Desconocido" }
                              
                              return (
                                <tr key={client.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                                  <td className="p-4 font-extrabold text-[var(--color-text)]">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/15 select-none">
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
                                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 ml-auto"
                                      >
                                        Reactivar
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleArchiveClient(client.id)}
                                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1 ml-auto"
                                      >
                                        Archivar
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>

                      {/* Vista Móvil: Tarjetas */}
                      <div className="md:hidden divide-y divide-[var(--color-border)]">
                        {paginatedProvisionings.length === 0 ? (
                          <div className="p-8 text-center text-[var(--color-text-muted)] font-medium text-xs">
                            {showArchivedHistory 
                              ? 'No se encontraron registros de aprovisionamiento archivados.'
                              : 'No se encontraron registros de aprovisionamiento activos.'
                            }
                          </div>
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
                            ].find(n => n.id === client.niche) || { emoji: "📦", name: client.niche || "Desconocido" }

                            return (
                              <div key={client.id} className="p-4 space-y-3 hover:bg-[var(--color-surface-2)]/10 transition-colors">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/15 select-none">
                                      {client.id.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-extrabold text-[var(--color-text)] truncate max-w-[160px] text-xs">
                                        {client.nombre || client.id}
                                      </span>
                                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono font-medium">{client.id}</span>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                    client.enableDianBilling
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                      : 'bg-slate-500/10 text-slate-400 border-slate-500/25'
                                  }`}>
                                    DIAN: {client.enableDianBilling ? 'Habilitado' : 'Inactivo'}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[9px] font-bold text-[var(--color-text-muted)]">
                                      <span>{nicheData.emoji}</span>
                                      <span>{nicheData.name}</span>
                                    </span>
                                    <span className="text-[10px] font-extrabold text-[var(--color-text)]">
                                      {client.billingMode === 'percentage' 
                                        ? `${client.comisionPorcentaje}% Ventas` 
                                        : client.billingMode === 'fixed_per_service' 
                                          ? `$${(client.montoFijoServicio || 0).toLocaleString('es-CO')} / Serv` 
                                          : `$${(client.pagoMensualFijo || 0).toLocaleString('es-CO')} / Mes`
                                      }
                                    </span>
                                  </div>

                                  {showArchivedHistory ? (
                                    <button
                                      onClick={() => handleUnarchiveClient(client.id)}
                                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-lg text-[9px] font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                    >
                                      Reactivar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleArchiveClient(client.id)}
                                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg text-[9px] font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                                    >
                                      Archivar
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    {/* Pagination - Always visible */}
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
            </div>
          )}

          {/* ===== TAB: ERRORS ===== */}
          {activeTab === 'errors' && (
            <div className="space-y-6 tab-content-enter">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
                    <AlertTriangle size={20} className="text-red-500 animate-pulse" />
                    Consola de Errores y Diagnóstico
                  </h1>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Monitoreo en tiempo real de fallos e incidentes en aplicaciones de clientes.</p>
                </div>
                <div className="flex flex-row items-center gap-1.5 sm:gap-2.5 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setSimFailureClientId(clientesSaas[0]?.id || 'ventas-smartfix');
                      setSimFailureNiche(clientesSaas[0]?.niche || 'Ropa y Calzado');
                      setSimFailureManualClientId('');
                      setSimFailureErrorType('0');
                      setSimFailureCustomMsg('');
                      setSimFailureCustomStack('');
                      setIsSimulateFailureModalOpen(true);
                    }}
                    className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/25 text-violet-400 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 active:scale-95 shadow-sm shrink-0"
                  >
                    <Activity size={13} className="animate-pulse" />
                    Simular<span className="hidden sm:inline"> Fallo</span>
                  </button>
                  <button 
                    onClick={handleResolveAllFailures}
                    disabled={failures.filter(f => !f.resolved).length === 0}
                    className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm shrink-0"
                  >
                    <CheckCircle size={13} />
                    Resolver<span className="hidden sm:inline"> Todos</span>
                  </button>
                  <button 
                    onClick={handleClearAllFailures}
                    disabled={failures.length === 0}
                    className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/25 text-red-400 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm shrink-0"
                  >
                    <Trash2 size={13} />
                    Vaciar<span className="hidden sm:inline"> Historial</span>
                  </button>
                </div>
              </div>

              {/* Tarjetas de Resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    failures.filter(f => !f.resolved).length > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-wider">Fallos Activos</span>
                    <span className="text-xl font-black text-[var(--color-text)] leading-none mt-0.5">
                      {failures.filter(f => !f.resolved).length}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-wider">Clientes Afectados</span>
                    <span className="text-xl font-black text-[var(--color-text)] leading-none mt-0.5">
                      {new Set(failures.filter(f => !f.resolved).map(f => f.clientId)).size}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block tracking-wider">Uptime del Motor</span>
                    <span className="text-xl font-black text-[var(--color-text)] leading-none mt-0.5">
                      {failures.filter(f => !f.resolved).length > 0 ? '99.78%' : '100.00%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filtro y Listado */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-3xl space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                  <h3 className="font-extrabold text-sm text-[var(--color-text)]">Historial de Incidentes</h3>
                  
                  {/* Selector de Cliente */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Filtrar Cliente:</span>
                    <CustomSelect
                      value={selectedErrorClientFilter}
                      onChange={(e) => {
                        setSelectedErrorClientFilter(e.target.value)
                        setErrorsPage(1)
                      }}
                      options={[
                        { id: 'todos', label: 'Todos los Clientes' },
                        ...Array.from(new Set(failures.map(f => f.clientId))).map(cid => ({
                          id: cid,
                          label: cid
                        }))
                      ]}
                      className="!py-1 !px-2.5 font-bold min-w-[160px]"
                    />
                  </div>
                </div>

                {/* Listado */}
                {filteredFailures.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <CheckCircle size={36} className="text-emerald-500/40 mx-auto" />
                    <p className="text-xs font-bold text-[var(--color-text-muted)]">Sin incidentes reportados</p>
                    <p className="text-[10px] text-slate-500">Todas las instancias de aplicaciones cliente operan correctamente.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedFailures.map((fail) => {
                        const isExpanded = expandedErrorId === fail.id
                        return (
                          <div 
                            key={fail.id} 
                            className={`p-4 rounded-2xl border transition-all duration-200 ${
                              fail.resolved 
                                ? 'bg-[var(--color-surface-2)]/20 border-[var(--color-border)]/50 opacity-60' 
                                : 'bg-[var(--color-surface-2)]/30 border-red-500/20 hover:border-red-500/30'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              {/* Metadata de Fallo */}
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[9px] font-black rounded uppercase">
                                    {fail.clientId}
                                  </span>
                                  <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">
                                    • {fail.niche}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    • {new Date(fail.timestamp).toLocaleString()}
                                  </span>
                                  {fail.source === 'manual' ? (
                                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase rounded border border-amber-500/20">
                                      Manual
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase rounded border border-indigo-500/20">
                                      Automático
                                    </span>
                                  )}
                                  {fail.resolved ? (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded border border-emerald-500/20">
                                      Resuelto
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-black uppercase rounded border border-red-500/20 animate-pulse">
                                      Activo
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-red-400 break-words mt-1">{fail.errorMsg}</h4>
                                <p className="text-[10px] text-slate-450 dark:text-slate-500">Dispositivo: {fail.deviceInfo}</p>
                              </div>

                              {/* Acciones */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                                <button 
                                  onClick={() => setSelectedDiagnosticError(fail)}
                                  className="px-2.5 py-1 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/25 text-violet-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  Diagnosticar
                                </button>
                                <button 
                                  onClick={() => setExpandedErrorId(isExpanded ? null : fail.id)}
                                  className="px-2.5 py-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg transition-colors cursor-pointer"
                                >
                                  {isExpanded ? 'Ocultar Stack' : 'Ver Stack'}
                                </button>
                                {!fail.resolved && (
                                  <button 
                                    onClick={() => handleResolveFailure(fail.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95 shadow"
                                  >
                                    Resolver
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Stack Trace Expandido */}
                            {isExpanded && (
                              <div className="mt-3.5 space-y-1.5 animate-fade-in">
                                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono">Stack Trace Diagnóstico:</span>
                                <pre className="bg-[#0c101a] font-mono text-[10px] p-3.5 rounded-xl border border-red-500/15 overflow-x-auto text-red-300 leading-relaxed shadow-inner select-text select-all">
                                  {fail.stack}
                                </pre>
                              </div>
                            )}
                          </div>
                        )
                      })}

                    {/* Pagination - Always visible */}
                    <div className="pt-2 select-none">
                      <Pagination
                        currentPage={currentFailuresPage}
                        totalPages={totalFailuresPages}
                        onPageChange={setErrorsPage}
                        siblingCount={1}
                        showAlways={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== TAB: E2E TESTS ===== */}
          {activeTab === 'e2e' && (
            <E2EPanel />
          )}

          {/* ===== TAB: GESTIÓN DE CORES ===== */}
          {activeTab === 'cores' && (
            <CoreManagerPanel showToast={(msg, type) => showToast(msg, { type })} />
          )}

          {/* ===== TAB: CONTROL GIT ===== */}
          {activeTab === 'git' && (
            <GitBackupPanel showToast={showToast} />
          )}

          {/* ===== TAB: SETTINGS ===== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 tab-content-enter">
              <div>
                <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
                  <Settings size={20} className="text-slate-400" />
                  Configuración del Sistema
                </h1>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Ajustes globales de la consola central.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] space-y-4">
                  <h3 className="font-extrabold text-sm text-[var(--color-text)]">Entorno y Telemetría</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[var(--color-text)]">Modo de Ejecución</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Sandbox no afecta datos reales</p>
                      </div>
                      <button onClick={() => { setIsSimulated(p => !p); addLog(`Modo: ${!isSimulated ? 'SANDBOX' : 'CONECTADO'}`, 'warning') }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          isSimulated ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                        {isSimulated ? 'Sandbox' : 'Conectado'}
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[var(--color-text)]">Tema de Interfaz</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Modo oscuro o claro</p>
                      </div>
                      <DarkModeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] space-y-4">
                  <h3 className="font-extrabold text-sm text-[var(--color-text)]">Sesión</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                      <p className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] block">Autenticado como</p>
                      <p className="text-sm font-bold text-[var(--color-text)] mt-0.5">{user.email}</p>
                      <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Root Developer</p>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]">
                      <LogOut size={13} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
              {/* Panel de Telemetría Centralizada Multi-Cliente (Premium Matrix) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna 1: Tarjetas de Clientes Activos */}
                <div className="space-y-4">
                  <div className="bg-[var(--color-surface)] p-5 rounded-3xl border border-[var(--color-border)] shadow-md">
                    <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-2">
                      <Users size={16} className="text-indigo-400" />
                      Instancias Activas ({telemetryClientsList.length})
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      Monitoreo de estado por cliente. Haz clic en una tarjeta para filtrar sus logs de telemetría.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                    {telemetryClientsList.map(client => {
                      const isSelected = telemetryClientFilter.toLowerCase() === client.id.toLowerCase();
                      const hasFailures = client.failuresCount > 0;
                      
                      return (
                        <div 
                          key={client.id}
                          onClick={() => setTelemetryClientFilter(isSelected ? 'todos' : client.id)}
                          className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden select-none ${
                            isSelected 
                              ? 'bg-gradient-to-br from-indigo-500/15 via-[var(--color-surface-2)] to-indigo-500/5 border-indigo-500/40 shadow-md scale-[1.01]' 
                              : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-slate-700/50 hover:bg-[var(--color-surface-2)]/30'
                          }`}
                        >
                          {/* Top row: Client name & Status dot */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base select-none shrink-0">
                                {client.niche === 'wellness_podology' ? '🦶' :
                                 client.niche === 'retail_clothing' ? '👕' :
                                 client.niche === 'technical_services' ? '🛠️' :
                                 client.niche === 'refrigeration_ac' ? '❄️' :
                                 client.niche === 'contractors' ? '👷' :
                                 client.niche === 'machinery_rental' ? '🚜' :
                                 client.niche === 'carpentry' ? '🪚' :
                                 client.niche === 'laundry' ? '🧺' :
                                 client.niche === 'furniture_repair' ? '🛋️' :
                                 client.niche === 'grocery_food' ? '🛒' : '📦'}
                              </span>
                              <h4 className="font-extrabold text-xs text-[var(--color-text)] truncate select-all">{client.id}</h4>
                            </div>
                            <span className="flex h-2.5 w-2.5 relative shrink-0">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                hasFailures ? 'bg-red-400' : 'bg-emerald-400'
                              }`}></span>
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                hasFailures ? 'bg-red-500' : 'bg-emerald-500'
                              }`}></span>
                            </span>
                          </div>

                          {/* Client Nickname */}
                          {client.name !== client.id && (
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate font-medium">{client.name}</p>
                          )}

                          {/* Quick indicators */}
                          <div className="grid grid-cols-2 gap-2 mt-3.5">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedErrorClientFilter(client.id);
                                setActiveTab('errors');
                              }}
                              className={`p-2 rounded-xl border flex items-center justify-between text-[10px] font-bold transition-all hover:scale-[1.03] active:scale-[0.98] ${
                                hasFailures 
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                                  : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]'
                              }`}
                              title="Ver diagnósticos en pestaña errores"
                            >
                              <span>⚠️ Fallos</span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${hasFailures ? 'bg-red-500 text-white font-black' : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'}`}>
                                {client.failuresCount}
                              </span>
                            </div>

                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery(client.id);
                                setStatusFilter('todos');
                                setActiveTab('billing');
                              }}
                              className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between text-[10px] font-bold text-[var(--color-text-muted)] transition-all hover:scale-[1.03] active:scale-[0.98] hover:bg-[var(--color-surface-2)]"
                              title="Ver facturas en pestaña facturación"
                            >
                              <span>💳 Cobros</span>
                              <span className="px-1.5 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-md text-[9px]">
                                {client.billingCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Columna 2 y 3: Consola de logs estilo terminal UNIX */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-border)] shadow-xl relative overflow-hidden flex flex-col h-full justify-between">
                    {/* Efecto de brillo de terminal sutil en el fondo */}
                    <div className="absolute -top-[20%] -left-[10%] w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full z-0" />
                    <div className="absolute -bottom-[20%] -right-[10%] w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] pointer-events-none rounded-full z-0" />
                    
                    <div className="relative z-1 space-y-4 flex-1 flex flex-col">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--color-border)]/65 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                            <Terminal size={16} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-2">
                             Live System Telemetry Console
                              <span className="flex h-2 w-2 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                  !isOnline ? 'bg-red-400' : (isSimulated ? 'bg-amber-400' : 'bg-emerald-400')
                                }`}></span>
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                  !isOnline ? 'bg-red-500' : (isSimulated ? 'bg-amber-500' : 'bg-emerald-500')
                                }`}></span>
                              </span>
                            </h3>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-mono">
                              telemetry_monitor.sh • {!isOnline ? 'Network Offline' : (isSimulated ? 'Sandbox Mode' : 'Connected to Firestore Central')}
                            </p>
                          </div>
                        </div>
                        
                        {/* Botones de acción y filtros rápidos */}
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <button 
                            onClick={() => { setSystemLogs([]); setLogPage(1) }} 
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700/60 transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap"
                          >
                            Limpiar Terminal
                          </button>
                        </div>
                      </div>

                      {/* Barra de Filtros Interactivos de la Terminal */}
                      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between bg-slate-950/40 p-3 rounded-2xl border border-[var(--color-border)]/70">
                        {/* Tabs de tipo de log */}
                        <div className="flex flex-wrap gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                          {[
                            { id: 'todos', label: 'Todos' },
                            { id: 'error', label: 'Fallas (FAIL)' },
                            { id: 'billing', label: 'Cobros (BILLING)' },
                            { id: 'info_warning', label: 'Sistema' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => { setTelemetryTypeFilter(t.id); setLogPage(1); }}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                                telemetryTypeFilter === t.id 
                                  ? 'bg-indigo-650 text-white shadow-sm' 
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Buscador de logs */}
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Buscar en logs..." 
                            value={telemetrySearchQuery}
                            onChange={(e) => { setTelemetrySearchQuery(e.target.value); setLogPage(1); }}
                            className="h-8 pl-8 pr-3 w-full md:w-48 bg-slate-900/80 border border-slate-800 text-[10px] text-slate-200 placeholder-slate-500 rounded-xl focus:outline-none focus:border-indigo-500/70 focus:bg-slate-900 transition-all"
                          />
                          <Activity size={12} className="absolute left-3 top-2.5 text-slate-500 animate-pulse" />
                          {telemetrySearchQuery && (
                            <button 
                              onClick={() => setTelemetrySearchQuery('')}
                              className="absolute right-2.5 top-2.5 text-[9px] font-bold text-slate-500 hover:text-white"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Badge de Cliente Activo */}
                      {telemetryClientFilter !== 'todos' && (
                        <div className="flex items-center gap-1.5 self-start px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full animate-in slide-in-from-left duration-250">
                          <span className="text-[8px] font-bold uppercase text-indigo-400 tracking-wider">Filtrando:</span>
                          <span className="text-[9px] font-extrabold text-[var(--color-text)] font-mono">{telemetryClientFilter}</span>
                          <button 
                            onClick={() => setTelemetryClientFilter('todos')}
                            className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 flex items-center justify-center text-[8px] text-indigo-300 font-bold ml-1 cursor-pointer transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Terminal Screen */}
                      <div className="bg-[#0b0f19] border border-[var(--color-border)]/80 rounded-2xl p-4 h-[350px] overflow-y-auto scrollbar-thin flex flex-col gap-2.5 shadow-inner select-text flex-1">
                        {filteredTelemetryLogs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center my-auto space-y-2 select-none">
                            <Activity size={24} className="text-slate-650 dark:text-slate-700 animate-pulse" />
                            <div className="text-[var(--color-text-muted)] italic text-xs font-mono">
                              ~/telemetria $ escuchando_eventos_en_vivo...
                            </div>
                            <p className="text-[9px] text-slate-600">No hay registros que coincidan con los filtros activos.</p>
                          </div>
                        ) : (
                          filteredTelemetryLogs.map((log, index) => {
                            const isClickable = log.type === 'error';
                            const hoverStyle = isClickable ? 'cursor-pointer hover:bg-red-500/10 hover:border-red-500/30 active:scale-[0.99] transition-all' : '';
                            
                            const statusConfig = {
                              info: { label: 'INFO', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
                              warning: { label: 'WARN', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                              error: { label: 'FAIL', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                              success: { label: ' OK ', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
                            }[log.type] || { label: 'LOG', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };

                            return (
                              <div 
                                key={index} 
                                className={`p-3 rounded-xl border bg-slate-900/40 border-slate-800/40 flex flex-col gap-1.5 transition-all ${hoverStyle}`}
                              >
                                <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                                  <div className="flex items-center gap-2 select-none">
                                    <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-black uppercase border tracking-wider ${statusConfig.color}`}>
                                      {statusConfig.label}
                                    </span>
                                    {log.client && (
                                      <span 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTelemetryClientFilter(log.client);
                                        }}
                                        className="px-1.5 py-0.5 bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/40 hover:text-indigo-300 text-slate-400 font-mono text-[8px] rounded uppercase cursor-pointer select-all transition-colors"
                                        title="Filtrar por este cliente"
                                      >
                                        {log.client}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[8px] text-slate-500 font-mono select-none">{log.timestamp}</span>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                  <p className="font-mono text-[10px] text-slate-300 leading-relaxed break-words pl-1 flex-1">
                                    <span className="text-slate-500 mr-1 select-none">➔</span>
                                    {log.message}
                                  </p>
                                  {isClickable && (
                                    <button
                                      onClick={() => {
                                        setSelectedErrorClientFilter(log.client || 'todos');
                                        setActiveTab('errors');
                                      }}
                                      className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded text-[8px] font-bold font-mono transition-colors cursor-pointer shrink-0"
                                    >
                                      Diagnosticar
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          </div>
        </main>
      </div>

      {/* BOTTOM NAVIGATION - Móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl pb-safe animate-slide-up">
        <div className="grid grid-cols-5 items-center justify-items-center px-1 py-1.5">
          {NAV_TABS.filter(tab => tab.id !== 'e2e' && tab.id !== 'cores' && tab.id !== 'git').map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isCenterAction = tab.id === 'onboarding'
            
            if (isCenterAction) {
              return (
                <button
                  key={tab.id}
                  id={`bottom-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative -mt-3.5 flex flex-col items-center cursor-pointer transition-all duration-300 active:scale-95 group w-full"
                >
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 border border-violet-400/20 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] onboarding-center-btn ${
                    isActive ? 'scale-105 animate-pulse-glow' : 'animate-center-float'
                  }`}>
                    <Icon size={20} className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                  </div>
                  <span className={`text-[9px] font-black tracking-wide mt-1.5 transition-colors duration-200 ${
                    isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                  }`}>{tab.shortLabel}</span>
                </button>
              )
            }

            return (
              <button
                key={tab.id}
                id={`bottom-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 cursor-pointer w-full ${
                  isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-indigo-500/15 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : ''
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[9px] font-bold tracking-wide transition-all ${
                  isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                }`}>{tab.shortLabel}</span>
                {isActive && <div className="w-4 h-0.5 bg-indigo-400 rounded-full" />}
              </button>
            )
          })}
        </div>
      </nav>


      {/* Modal de Detalle y Gestión de Cliente (CRM) */}
      {activeMetricModal === 'clientes' && selectedCrmClientId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-black text-sm uppercase text-indigo-500 tracking-wider flex items-center gap-2">
                <Users size={16} />
                Gestionar Cliente: {selectedCrmClientId}
              </h3>
              <button 
                onClick={() => {
                  setActiveMetricModal(null)
                  setSelectedCrmClientId(null)
                }}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selector de Pestañas CRM */}
            <div className="flex border-b border-[var(--color-border)] pb-0.5 mb-2">
              <button
                onClick={() => setCrmTab('config')}
                className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  crmTab === 'config'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Configuración Operativa
              </button>
              <button
                onClick={() => {
                  setCrmTab('drift');
                  loadDriftData(selectedCrmClientId);
                }}
                className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  crmTab === 'drift'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Sincronización Core (Drift)
              </button>
            </div>

            {crmTab === 'config' ? (
              <>
                <div className="space-y-4">
                  {/* Nicho de Mercado */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Nicho de Mercado / Vertical de Negocio</label>
                    <CustomSelect 
                      value={editNiche} 
                      onChange={(e) => setEditNiche(e.target.value)}
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

                  {/* Modo de Facturación */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Modelo de Cobro Base</label>
                    <CustomSelect
                      value={editBillingMode}
                      onChange={(val) => setEditBillingMode(val)}
                      options={[
                        { value: "percentage", label: "Porcentaje sobre Ventas (%)" },
                        { value: "fixed_per_service", label: "Monto Fijo por Servicio" },
                        { value: "flat_monthly", label: "Pago Mensual Fijo" }
                      ]}
                    />
                  </div>

                  {editBillingMode === 'percentage' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Tasa de Comisión (%)</label>
                      <input 
                        type="number" 
                        value={editComisionPorcentaje} 
                        onChange={(e) => setEditComisionPorcentaje(parseFloat(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                        step="0.1"
                      />
                    </div>
                  )}

                  {editBillingMode === 'fixed_per_service' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Monto Fijo por Servicio ($ COP)</label>
                      <input 
                        type="number" 
                        value={editMontoFijoServicio} 
                        onChange={(e) => setEditMontoFijoServicio(parseInt(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  )}

                  {editBillingMode === 'flat_monthly' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Pago Mensual Fijo ($ COP)</label>
                      <input 
                        type="number" 
                        value={editPagoMensualFijo} 
                        onChange={(e) => setEditPagoMensualFijo(parseInt(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  )}

                  {/* Facturación Electrónica DIAN */}
                  <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                      <input 
                        type="checkbox" 
                        checked={editEnableDianBilling} 
                        onChange={(e) => setEditEnableDianBilling(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                      />
                      Habilitar Facturación Electrónica DIAN Directa
                    </label>

                    {editEnableDianBilling && (
                      <div className="space-y-1.5 animate-fade-in pl-6 border-l border-indigo-500/20">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Costo por Documento DIAN ($ COP)</label>
                        <input 
                          type="number" 
                          value={editCostoPorFacturaDian}
                          onChange={(e) => setEditCostoPorFacturaDian(parseFloat(e.target.value) || 0)}
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                  <button 
                    onClick={() => {
                      setActiveMetricModal(null)
                      setSelectedCrmClientId(null)
                    }}
                    className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveCrmConfig}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Panel de Sincronización Core (Drift) */}
                <div className="space-y-4">
                  {driftLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-500" />
                      <span className="text-xs text-[var(--color-text-muted)]">Analizando desviación respecto al Core...</span>
                    </div>
                  ) : driftData ? (
                    <div className="space-y-4">
                      {/* Resumen de paridad */}
                      <div className="flex items-center justify-between bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl p-4">
                        <div>
                          <p className="text-xs font-black text-[var(--color-text)]">Índice de Paridad de Código</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Core de Referencia: <span className="font-mono font-bold text-indigo-400">{driftData.coreId}</span></p>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          driftData.parityPercent >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {driftData.parityPercent}% Sincronizado
                        </span>
                      </div>

                      {/* Acciones Rápidas del Cliente */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const filesMap = {};
                            driftData.differences.forEach(diff => {
                              filesMap[diff.file] = !isFileSensitive(diff.file);
                            });
                            setBulkSyncFiles(filesMap);
                            setIsBulkSyncModalOpen(true);
                          }}
                          disabled={driftData.differences.length === 0}
                          className="py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                        >
                          <RefreshCw size={12} className="animate-pulse" />
                          Sincronizar Lote
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeployClient(selectedCrmClientId, false)}
                          className="py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          <Activity size={12} />
                          Desplegar Hosting
                        </button>
                      </div>

                      {/* Lista de desviaciones */}
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                        {driftData.differences.length === 0 ? (
                          <div className="text-center py-10 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                              <CheckCircle size={14} />
                              ¡Código 100% Alineado!
                            </p>
                            <p className="text-[10px] text-emerald-300/60 mt-1">Esta instancia de cliente no presenta desviaciones físicas con el Core.</p>
                          </div>
                        ) : (
                          driftData.differences.map((diff, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-surface-2)]/10 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-2)]/20 transition-all">
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-mono font-bold text-[var(--color-text)] break-all">{diff.file}</p>
                                <p className="text-[9px] text-[var(--color-text-muted)]">
                                  {diff.status === 'missing_in_client' ? '⚠️ Archivo ausente en cliente' : '✏️ Archivo modificado/desviado'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {diff.status === 'modified' && (
                                  <button
                                    onClick={() => setActiveDiffFile(diff)}
                                    className="h-6 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-bold cursor-pointer"
                                  >
                                    Ver Diff
                                  </button>
                                )}
                                <button
                                  onClick={() => handleSyncFile(selectedCrmClientId, diff.file)}
                                  disabled={syncingFile[diff.file]}
                                  className="h-6 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 disabled:opacity-40"
                                >
                                  {syncingFile[diff.file] ? <RefreshCw size={8} className="animate-spin" /> : <RefreshCw size={8} />}
                                  Sincronizar
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-muted)] italic text-center py-6">Selecciona cargar desviación para comparar archivos.</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                  <button 
                    onClick={() => {
                      setActiveMetricModal(null)
                      setSelectedCrmClientId(null)
                    }}
                    className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cerrar CRM
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Visor de Diffs */}
      {activeDiffFile && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-4 max-h-[85vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 shrink-0">
              <h4 className="font-mono text-xs text-indigo-400 font-bold break-all">
                Diferencias: {activeDiffFile.file}
              </h4>
              <button 
                onClick={() => setActiveDiffFile(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-auto font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-[50vh]">
              {activeDiffFile.diff ? (
                activeDiffFile.diff.map((part, idx) => (
                  <span 
                    key={idx} 
                    className={
                      part.added 
                        ? 'text-emerald-400 bg-emerald-500/10 block w-full px-1 border-l-2 border-emerald-500' 
                        : part.removed 
                        ? 'text-red-400 bg-red-500/10 block w-full px-1 border-l-2 border-red-500' 
                        : 'text-slate-400 block w-full px-1'
                    }
                  >
                    {part.value}
                  </span>
                ))
              ) : (
                <p className="text-slate-400">Archivo nuevo (sin diferencias de líneas).</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)] shrink-0">
              <button 
                onClick={() => setActiveDiffFile(null)}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar Visor
              </button>
              <button 
                onClick={() => {
                  handleSyncFile(selectedCrmClientId, activeDiffFile.file);
                  setActiveDiffFile(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Aplicar Sincronización
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Onboarding / Checklist */}
      {onboardingData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
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

            {/* Checklist interactivo para Firestore, Auth y Storage */}
            <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block">Verificación de Configuración Manual de Firebase</span>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'fs', label: 'Habilitar Firestore Database y desplegar reglas/índices' },
                  { id: 'auth', label: 'Habilitar Firebase Authentication (Correo/Contraseña)' },
                  { id: 'storage', label: 'Habilitar Firebase Storage para subida de comprobantes' }
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
              {/* Credenciales de Administrador Autogeneradas */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-widest">Credenciales del Administrador (Autogeneradas)</span>
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between gap-3 bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)] min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase">EMAIL:</span>
                      <code className="text-[11px] font-mono text-emerald-300 truncate">{onboardingData.adminEmail || `admin@${onboardingData.clientId}.com`}</code>
                    </div>
                    <button 
                      onClick={() => {
                        copy(onboardingData.adminEmail || `admin@${onboardingData.clientId}.com`)
                        showToast('Correo copiado al portapapeles', { type: 'success' })
                      }}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                      title="Copiar Correo"
                    >
                      <Copy size={10} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)] min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase">PASS:</span>
                      <code className="text-[11px] font-mono text-emerald-300 truncate">{onboardingData.adminPassword || 'Admin2026!'}</code>
                    </div>
                    <button 
                      onClick={() => {
                        copy(onboardingData.adminPassword || 'Admin2026!')
                        showToast('Contraseña copiada al portapapeles', { type: 'success' })
                      }}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                      title="Copiar Contraseña"
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
                      copy(onboardingData.token)
                      showToast('Token copiado al portapapeles', { type: 'success' })
                    }}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer flex items-center justify-center shrink-0"
                    title="Copiar Token"
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
                        copy(onboardingData.prompt)
                        showToast('Prompt copiado al portapapeles', { type: 'success' })
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-extrabold cursor-pointer transition-all hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] flex items-center gap-1 shrink-0"
                      title="Copiar Prompt"
                    >
                      <Copy size={10} />
                      Copiar Prompt
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
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
                      <p className="text-[11px] text-[var(--color-text-muted)]">Agrega el token generado y el Client ID en el archivo local de la instancia del cliente:</p>
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
                      <p className="text-[11px] text-[var(--color-text-muted)]">Asegúrate de vincular el proyecto correcto de Firebase en la configuración local de la CLI:</p>
                      <pre className="bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] font-mono text-[10px] mt-1.5 text-slate-400 overflow-x-auto">
{`{
  "projects": {
    "default": "${CENTRAL_CONFIG.projectId || 'firebase-project-id'}"
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl flex gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-bold text-[var(--color-text)]">Configurar `public/firebase-messaging-sw.js` y VAPID Key</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">Establece las credenciales correspondientes de Firebase Messaging en el Service Worker. Tu clave VAPID pública es:</p>
                      {onboardingData.vapidKey ? (
                        <div className="flex items-center gap-2 mt-1.5 bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] min-w-0">
                          <code className="text-[10px] font-mono text-indigo-400 truncate flex-1 min-w-0">{onboardingData.vapidKey}</code>
                          <button
                            type="button"
                            onClick={() => {
                              copy(onboardingData.vapidKey)
                              showToast('VAPID Key copiada', { type: 'success' })
                            }}
                            className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold shrink-0 cursor-pointer"
                          >
                            Copiar
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-500 italic mt-1.5">No se especificó clave VAPID key en la configuración del cliente.</p>
                      )}
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



      {/* Overlay de Carga de Aprovisionamiento */}
      {isProvisioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-955/90 backdrop-blur-md animate-fade-in p-6">
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

      {/* Modal de Detalle de Perfil */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-sm bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
            
            {/* Header de Modal */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Perfil de Administrador</span>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg cursor-pointer transition-colors"
                title="Cerrar modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* Detalles del Perfil */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border-2 border-violet-500/40 flex items-center justify-center select-none shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <span className="text-xl font-extrabold text-violet-400">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-base text-[var(--color-text)] tracking-tight leading-tight">{user?.email}</p>
                <p className="text-[10px] text-violet-500 dark:text-violet-400 font-bold uppercase tracking-widest">Root Developer</p>
              </div>
            </div>

            {/* Información del Sistema / Base de Datos */}
            <div className="p-4 bg-gradient-to-br from-[var(--color-surface-2)]/40 to-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md space-y-3 text-xs text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-500"></div>
              
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={13} className="text-violet-400" />
                  Base de Datos
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider shadow-sm transition-all duration-300 flex items-center gap-1 ${
                  !isOnline 
                    ? 'bg-red-500/10 text-red-400 border-red-500/25 shadow-red-500/5'
                    : (dbStatus === 'conectado' && !isSimulated
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-amber-500/5')
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    !isOnline ? 'bg-red-500' : (dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-500' : 'bg-amber-500')
                  }`} />
                  {!isOnline ? 'Offline' : (dbStatus === 'conectado' && !isSimulated ? 'Firestore Online' : 'Sandbox')}
                </span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-[var(--color-border)]/50 via-[var(--color-border)] to-transparent" />
              
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-400" />
                  Entorno
                </span>
                <span className="font-extrabold text-[var(--color-text)] flex items-center gap-1 bg-[var(--color-surface-2)]/60 px-2 py-0.5 rounded-lg border border-[var(--color-border)] text-[10px]">
                  Vite + React 19
                </span>
              </div>
            </div>

            {/* Accesos a Herramientas de Desarrollador en Móvil */}
            <div className="lg:hidden grid grid-cols-3 gap-2 w-full mb-2">
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false)
                  setActiveTab('cores')
                }}
                className="py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <Layers size={13} />
                Cores
              </button>
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false)
                  setActiveTab('e2e')
                }}
                className="py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <FlaskConical size={13} />
                Tests E2E
              </button>
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false)
                  setActiveTab('git')
                }}
                className="py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <GitCommit size={13} />
                Git
              </button>
            </div>

            {/* Acción de Ajustes / Configuración */}
            <button 
              onClick={() => {
                setIsProfileModalOpen(false)
                setActiveTab('settings')
              }}
              className="w-full py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md mb-2"
            >
              <Settings size={13} />
              Ajustes del Sistema
            </button>

            {/* Acción de Cierre de Sesión */}
            <button 
              onClick={() => {
                setIsProfileModalOpen(false)
                handleLogout()
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
            >
              <LogOut size={13} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Drawer Lateral de Diagnóstico Inteligente */}
      {selectedDiagnosticError && (
        <div className="fixed inset-0 z-[80] overflow-hidden select-none">
          {/* Backdrop con desenfoque */}
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedDiagnosticError(null)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <div className="w-screen max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col justify-between select-text animate-slide-in-right">
              {/* Header */}
              <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[9px] font-black rounded uppercase">
                      {selectedDiagnosticError.clientId}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      {new Date(selectedDiagnosticError.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[var(--color-text)] mt-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    Diagnóstico de Incidente
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedDiagnosticError(null)}
                  className="w-8 h-8 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text)] flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Contenido (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Detalle del Error */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono">Mensaje de Error:</span>
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold font-mono break-words leading-relaxed shadow-sm">
                    {selectedDiagnosticError.errorMsg}
                  </div>
                </div>

                {/* Análisis y Causa Probable */}
                {(() => {
                  const errMsg = selectedDiagnosticError.errorMsg || '';
                  let diagnosis = "Error genérico de ejecución. Se recomienda auditar el stack trace para identificar el origen.";
                  let solution = "Revisar los imports, variables de estado de React, y asegurar que no haya referencias a objetos undefined.";

                  if (errMsg.includes('Failed to fetch dynamically imported module')) {
                    diagnosis = "Error de carga del módulo dinámico de la página. Esto ocurre usualmente por desconexión temporal de internet (modo offline) del usuario en el navegador, un caché corrupto del service worker, o si el archivo fue borrado o renombrado físicamente del disco.";
                    solution = "1. Verifica que el archivo de la página exista en la ruta especificada de la aplicación.\n2. Asegura que el router tenga correctamente declarada la importación perezosa.\n3. Si fue un corte de internet temporal del cliente en producción, no requiere cambios en el código.";
                  } else if (errMsg.includes('Missing or insufficient permissions') || errMsg.includes('permission-denied')) {
                    diagnosis = "Acceso denegado por Firestore Central. La consulta o escritura del cliente fue bloqueada por no cumplir con los criterios de seguridad definidos en las reglas de base de datos.";
                    solution = "1. Revisa las reglas en `firestore.rules` asociadas a la colección afectada.\n2. Verifica si el usuario cuenta con los claims o roles necesarios en su sesión de Firebase Auth.\n3. Asegúrate de invocar la limpieza de listeners `onSnapshot` al cerrar sesión.";
                  }

                  // Extraer archivo del error/stack trace de manera robusta
                  let detectedFile = 'N/A';
                  let detectedLine = 'N/A';
                  
                  const getFileAndLine = () => {
                    const text = `${selectedDiagnosticError.errorMsg || ''}\n${selectedDiagnosticError.stack || ''}`;
                    
                    // 1. Buscar archivos que contengan la ruta src/
                    const srcRegex = /(src\/[a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9]+)(?:\?[^:]*)?:(\d+)/i;
                    const srcMatch = text.match(srcRegex);
                    if (srcMatch) {
                      return { file: srcMatch[1], line: srcMatch[2] };
                    }
                    
                    // 2. Buscar en las líneas del stack trace omitiendo librerías comunes
                    const stackLines = (selectedDiagnosticError.stack || '').split('\n');
                    for (const line of stackLines) {
                      if (line.includes('node_modules') || line.includes('installHook.js') || line.includes('react-dom') || line.includes('react.development')) {
                        continue;
                      }
                      const fileLineRegex = /([\w\-\/.]+\.[jt]sx?)(?:\?[^:]*)?:(\d+)/i;
                      const match = line.match(fileLineRegex);
                      if (match) {
                        let file = match[1];
                        // Autocompletar si es App.jsx suelto a src/App.jsx
                        if (file === 'App.jsx') file = 'src/App.jsx';
                        return { file, line: match[2] };
                      }
                    }
                    
                    // 3. Match general sobre el mensaje de error completo
                    const generalRegex = /([\w\-\/.]+\.[jt]sx?)(?:\?[^:]*)?:(\d+)/i;
                    const genMatch = text.match(generalRegex);
                    if (genMatch) {
                      let file = genMatch[1];
                      if (file === 'App.jsx') file = 'src/App.jsx';
                      return { file, line: genMatch[2] };
                    }
                    
                    // 4. Último recurso: buscar nombre de archivo sin línea
                    const simpleFileRegex = /([\w\-\/.]+\.[jt]sx?)/i;
                    const simpleMatch = text.match(simpleFileRegex);
                    if (simpleMatch) {
                      let file = simpleMatch[1];
                      if (file === 'App.jsx') file = 'src/App.jsx';
                      return { file, line: 'N/A' };
                    }
                    
                    return { file: 'N/A', line: 'N/A' };
                  };
                  
                  const extracted = getFileAndLine();
                  detectedFile = extracted.file;
                  detectedLine = extracted.line;

                  return (
                    <>
                      <div className="space-y-4 bg-violet-500/5 border border-violet-500/15 p-5 rounded-2xl">
                        <h4 className="font-extrabold text-xs text-[var(--color-text)] flex items-center gap-1.5">
                          <Activity size={13} className="text-violet-400" />
                          Análisis del Asistente
                        </h4>
                        
                        <div className="space-y-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
                          <div>
                            <span className="font-extrabold text-[var(--color-text)] block mb-0.5">Causa Probable:</span>
                            <p>{diagnosis}</p>
                          </div>
                          <div>
                            <span className="font-extrabold text-[var(--color-text)] block mb-0.5">Solución Recomendada:</span>
                            <p className="whitespace-pre-line leading-relaxed">{solution}</p>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Portapapeles (Prompt e Integraciones) */}
                      <div className="grid grid-cols-1 gap-2.5">
                        <button
                          onClick={async () => {
                            const promptText = `En el proyecto '${selectedDiagnosticError.clientId}', corrige el error '${selectedDiagnosticError.errorMsg}' que está ocurriendo en el archivo '${detectedFile}' (Línea: ${detectedLine}, Niche: ${selectedDiagnosticError.niche}). Revisa el stack trace:\n${selectedDiagnosticError.stack || 'No stack trace available'}`;
                            try {
                              await navigator.clipboard.writeText(promptText);
                              showToast('Prompt copiado. ¡Pégalo en el chat de Antigravity!', { type: 'success' });
                            } catch (err) {
                              showToast('No se pudo copiar el prompt', { type: 'error' });
                            }
                          }}
                          className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <Copy size={13} />
                          Copiar Prompt para Antigravity
                        </button>

                        <button
                          onClick={async () => {
                            try {
                              const finalPath = codeSnippet?.file || detectedFile;
                              await navigator.clipboard.writeText(finalPath);
                              showToast('Ruta de archivo copiada', { type: 'success' });
                            } catch (err) {
                              showToast('Error al copiar ruta', { type: 'error' });
                            }
                          }}
                          className="w-full py-2.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-[var(--color-text)] font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <Database size={12} className="text-slate-400" />
                          Copiar Ruta de Archivo ({(codeSnippet?.file || detectedFile).split(/[\\/]/).pop()})
                        </button>
                      </div>
                    </>
                  );
                })()}

                {/* Visor de Código en Vivo */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono flex items-center gap-1.5">
                    <Terminal size={10} className="text-violet-400" /> Visor de Código en Vivo:
                  </span>
                  
                  {loadingCode && (
                    <div className="p-6 bg-[#0c101a] border border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center gap-2.5 min-h-[140px]">
                      <Activity size={18} className="text-indigo-400 animate-spin" />
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Conectando con CLI Bridge...</span>
                    </div>
                  )}

                  {codeError && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[10px] font-mono text-amber-500 leading-relaxed">
                      ⚠️ {codeError}
                    </div>
                  )}

                  {!loadingCode && !codeError && codeSnippet && (
                    <div className="bg-[#0c101a] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col shadow-inner">
                      {/* Header del visor */}
                      <div className="bg-[#070b12] px-3.5 py-2 border-b border-[var(--color-border)] flex items-center justify-between font-mono text-[9px] text-slate-400">
                        <span className="truncate">{codeSnippet.file.split(/[\\/]/).slice(-2).join('/')}</span>
                        {codeSnippet.targetLine && (
                          <span className="text-violet-400 font-extrabold shrink-0 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                            Línea: {codeSnippet.targetLine}
                          </span>
                        )}
                      </div>

                      {/* Contenedor del código */}
                      <div className="p-3.5 overflow-x-auto text-[9.5px] font-mono leading-relaxed text-slate-300 max-h-[260px] overflow-y-auto scrollbar-thin">
                        <pre className="grid grid-cols-1">
                          {(() => {
                            const lines = codeSnippet.content.split('\n');
                            const target = codeSnippet.targetLine;
                            const startIdx = target ? Math.max(0, target - 6) : 0;
                            const endIdx = target ? Math.min(lines.length - 1, target + 5) : lines.length - 1;
                            
                            const snippetLines = [];
                            for (let i = startIdx; i <= endIdx; i++) {
                              const lineNum = i + 1;
                              const isTarget = lineNum === target;
                              snippetLines.push(
                                <div 
                                  key={i} 
                                  className={`flex items-start select-text ${isTarget ? 'bg-red-500/15 text-red-200 border-l-2 border-red-500 pl-1 -ml-1 py-0.5 font-bold' : ''}`}
                                >
                                  <span className={`w-8 text-right select-none text-[8.5px] pr-2.5 font-mono ${isTarget ? 'text-red-400' : 'text-slate-650'}`}>
                                    {lineNum}
                                  </span>
                                  <span className="whitespace-pre break-all font-mono">
                                    {lines[i]}
                                  </span>
                                </div>
                              );
                            }
                            return snippetLines;
                          })()}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contexto Enriquecido de Telemetría (Environment & User) */}
                {selectedDiagnosticError.environment && (
                  <div className="space-y-3 bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] p-4 rounded-2xl text-xs">
                    <h4 className="font-extrabold text-xs text-[var(--color-text)] flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 mb-2">
                      <Smartphone size={13} className="text-indigo-400" />
                      Entorno de Ejecución
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[var(--color-text-muted)] font-mono text-[10px]">
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Resolución:</span>
                        <span>{selectedDiagnosticError.environment.screenResolution || 'Desconocida'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Viewport:</span>
                        <span>{selectedDiagnosticError.environment.viewport || 'Desconocido'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Idioma:</span>
                        <span>{selectedDiagnosticError.environment.language || 'Desconocido'}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] block">Página Activa:</span>
                        <a 
                          href={selectedDiagnosticError.environment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline break-all block"
                        >
                          {selectedDiagnosticError.environment.url ? new URL(selectedDiagnosticError.environment.url).pathname : 'Ver URL'}
                        </a>
                      </div>
                    </div>
                    {selectedDiagnosticError.environment.userAgent && (
                      <div className="mt-2 text-[9px] font-mono bg-slate-900/60 p-2 rounded-xl text-slate-400 break-all select-all">
                        <span className="font-bold text-[var(--color-text-muted)] block mb-1">User Agent:</span>
                        {selectedDiagnosticError.environment.userAgent}
                      </div>
                    )}
                  </div>
                )}

                {/* Datos de Usuario */}
                {selectedDiagnosticError.user && (
                  <div className="space-y-2 bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-2xl text-xs">
                    <h4 className="font-extrabold text-xs text-[var(--color-text)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2 mb-2">
                      <User size={13} className="text-indigo-400" />
                      Usuario Sesión
                    </h4>
                    <div className="space-y-1.5 text-[var(--color-text-muted)] font-mono text-[10px]">
                      <div>
                        <span className="font-extrabold text-[var(--color-text)] mr-1">UID:</span>
                        <span className="select-all">{selectedDiagnosticError.user.uid || 'N/A'}</span>
                      </div>
                      {selectedDiagnosticError.user.email && (
                        <div>
                          <span className="font-extrabold text-[var(--color-text)] mr-1">Email:</span>
                          <span className="select-all">{selectedDiagnosticError.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stack Trace */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider font-mono">Stack Trace Completo:</span>
                  <pre className="bg-[#0c101a] font-mono text-[9px] p-4 rounded-2xl border border-[var(--color-border)] overflow-x-auto text-red-350/90 leading-relaxed shadow-inner select-text select-all">
                    {selectedDiagnosticError.stack || "Sin stack trace disponible."}
                  </pre>
                </div>
              </div>

              {/* Footer Acciones */}
              <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/30 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedDiagnosticError(null)}
                  className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 transition-all cursor-pointer"
                >
                  Cerrar
                </button>

                {!selectedDiagnosticError.resolved && (
                  <button
                    onClick={async () => {
                      await handleResolveFailure(selectedDiagnosticError.id);
                      setSelectedDiagnosticError(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow"
                  >
                    Resolver Incidente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Previsualización en Vivo */}
      {livePreviewComponent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div 
            className="absolute inset-0 bg-transparent" 
            onClick={() => setLivePreviewComponent(null)} 
          />
          <div className="w-full max-w-4xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl flex flex-col h-[85vh] relative z-10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] z-10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Play size={8} fill="currentColor" /> Previsualización en Vivo
                </span>
                <span className="text-xs font-black text-[var(--color-text)]">
                  {livePreviewComponent.name}
                </span>
                {livePreviewComponent.technicalName && (
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/50 px-2 py-0.5 rounded border border-[var(--color-border)]/50">
                    {livePreviewComponent.technicalName}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setLivePreviewComponent(null)}
                className="p-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/80 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl cursor-pointer transition-all active:scale-95"
                title="Cerrar previsualización"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sandbox Render Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-bg)]/40 scrollbar-thin">
              <ComponentSandbox 
                componentName={livePreviewComponent.name} 
                technicalName={livePreviewComponent.technicalName} 
              />
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] z-10 flex items-center justify-end gap-3 shadow-md">
              <button
                type="button"
                onClick={() => setLivePreviewComponent(null)}
                className="px-4 py-2 border border-[var(--color-border)] text-xs font-bold rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/80 transition-all cursor-pointer"
              >
                Cerrar
              </button>
              {(() => {
                const isSelected = selectedRecomendations.some(r => r.link === livePreviewComponent.link);
                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedRecomendations(prev => prev.filter(r => r.link !== livePreviewComponent.link));
                      } else {
                        setSelectedRecomendations(prev => [...prev, {
                          name: livePreviewComponent.name,
                          technicalName: livePreviewComponent.technicalName,
                          link: livePreviewComponent.link,
                          resourceType: livePreviewComponent.resourceType
                        }]);
                      }
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow ${
                      isSelected 
                        ? 'bg-red-600/20 border border-red-500/30 hover:bg-red-600/35 text-red-400' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isSelected ? 'Remover de Recomendaciones' : 'Añadir a Recomendaciones'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Simulación de Fallos Avanzado */}
      {isSimulateFailureModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsSimulateFailureModalOpen(false)} />
          <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={16} className="text-violet-400 animate-pulse" />
                  Simulador de Fallos Telemetría (Sandbox)
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Inyecta fallos de prueba dirigidos a clientes y entornos reales o manuales.</p>
              </div>
              <button 
                onClick={() => setIsSimulateFailureModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors animate-in"
              >
                <X size={15} />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              
              {/* Cliente Destino */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">1. Cliente Destino</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-1">Seleccionar de CRM</span>
                    <select
                      value={simFailureClientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSimFailureClientId(val);
                        if (val !== 'manual') {
                          const cli = clientesSaas.find(c => c.id === val);
                          setSimFailureNiche(cli ? cli.niche : 'General');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70"
                    >
                      {clientesSaas.map(c => (
                        <option key={c.id} value={c.id}>{c.id} ({c.niche})</option>
                      ))}
                      <option value="manual">-- Ingresar ID Manual --</option>
                    </select>
                  </div>
                  
                  {simFailureClientId === 'manual' ? (
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-1">ID Cliente & Nicho</span>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="cliente-test"
                          value={simFailureManualClientId}
                          onChange={(e) => setSimFailureManualClientId(e.target.value)}
                          className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70"
                        />
                        <input
                          type="text"
                          placeholder="Nicho (ej. Modas)"
                          value={simFailureNiche}
                          onChange={(e) => setSimFailureNiche(e.target.value)}
                          className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-end">
                      <div className="p-2.5 bg-slate-950/50 border border-slate-800/40 rounded-xl">
                        <div className="text-[9px] text-slate-500">Nicho Detectado</div>
                        <div className="font-extrabold text-slate-300 mt-0.5">{simFailureNiche}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Plantilla de Error */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">2. Tipo de Incidente / Error</label>
                <select
                  value={simFailureErrorType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimFailureErrorType(val);
                    if (val !== 'custom') {
                      const errT = [
                        {
                          msg: "TypeError: Cannot read properties of undefined (reading 'split')",
                          stack: "TypeError: Cannot read properties of undefined (reading 'split')\n    at CategoriasView.jsx:42:15\n    at renderWithHooks (react-dom.development.js:15486:18)\n    at updateFunctionComponent (react-dom.development.js:17356:15)"
                        },
                        {
                          msg: "FirebaseError: [code=unavailable]: The service is temporarily unavailable.",
                          stack: "FirebaseError: The service is temporarily unavailable.\n    at index.esm2017.js:520:25\n    at async fetchCollection (uploadService.js:12:15)"
                        },
                        {
                          msg: "ReferenceError: process is not defined",
                          stack: "ReferenceError: process is not defined\n    at index.js:12:5\n    at Object.module.exports (main.js:2:1)"
                        },
                        {
                          msg: "TypeError: Failed to fetch (Network Request Blocked)",
                          stack: "TypeError: Failed to fetch\n    at async postTelemetry (telemetryService.js:45:12)\n    at async triggerReport (DeveloperBillingPanel.jsx:112:9)"
                        },
                        {
                          msg: "PaymentGatewayError: [code=gateway_timeout]: Connection to payment server timed out.",
                          stack: "PaymentGatewayError: Connection to payment server timed out.\n    at paymentService.js:84:18\n    at async processCheckout (CartDrawer.jsx:220:14)"
                        }
                      ][parseInt(val)];
                      setSimFailureCustomMsg(errT.msg);
                      setSimFailureCustomStack(errT.stack);
                    } else {
                      setSimFailureCustomMsg('');
                      setSimFailureCustomStack('');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70"
                >
                  <option value="0">TypeError (split of undefined) - JS Componentes</option>
                  <option value="1">FirebaseError (Servicio temporalmente caído) - Base de Datos</option>
                  <option value="2">ReferenceError (process is not defined) - Entorno/Vite</option>
                  <option value="3">TypeError: Failed to fetch - Problemas de Red/CORS</option>
                  <option value="4">PaymentGatewayError (Timeout) - Cobros/Monetización</option>
                  <option value="custom">-- Error Personalizado --</option>
                </select>
              </div>

              {/* Campos de texto dinámicos */}
              {(simFailureErrorType === 'custom' || simFailureCustomMsg) && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">Mensaje de Error</span>
                    <input
                      type="text"
                      placeholder="Mensaje o firma de error..."
                      value={simFailureCustomMsg}
                      onChange={(e) => setSimFailureCustomMsg(e.target.value)}
                      disabled={simFailureErrorType !== 'custom'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-mono text-[10px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">Pila de Llamadas (Stack Trace)</span>
                    <textarea
                      placeholder="Stack trace..."
                      value={simFailureCustomStack}
                      onChange={(e) => setSimFailureCustomStack(e.target.value)}
                      rows={3}
                      disabled={simFailureErrorType !== 'custom'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 disabled:opacity-75 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500/70 font-mono text-[9px] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Nivel de Gravedad y Origen */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Nivel */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">3. Tipo de Severidad</label>
                  <div className="flex gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                    {[
                      { id: 'error', label: 'FAIL (Crítico)' },
                      { id: 'warning', label: 'WARN' },
                      { id: 'info', label: 'INFO' }
                    ].map(x => (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => setSimFailureType(x.id)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                          simFailureType === x.id 
                            ? (x.id === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : (x.id === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'))
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {x.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origen */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider block">4. Origen de Reporte</label>
                  <div className="flex gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                    {[
                      { id: 'automatic', label: 'Automático' },
                      { id: 'manual', label: 'Manual' }
                    ].map(x => (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => setSimFailureSource(x.id)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                          simFailureSource === x.id 
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {x.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSimulateFailureModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalClientId = simFailureClientId === 'manual' ? simFailureManualClientId : simFailureClientId;
                  if (!finalClientId) {
                    showToast('Por favor escribe el ID del cliente', { type: 'error' });
                    return;
                  }
                  
                  let msg = simFailureCustomMsg;
                  let stk = simFailureCustomStack;
                  
                  if (simFailureErrorType !== 'custom') {
                    const idx = parseInt(simFailureErrorType);
                    const defaultTemplates = [
                      {
                        msg: "TypeError: Cannot read properties of undefined (reading 'split')",
                        stack: "TypeError: Cannot read properties of undefined (reading 'split')\n    at CategoriasView.jsx:42:15\n    at renderWithHooks (react-dom.development.js:15486:18)\n    at updateFunctionComponent (react-dom.development.js:17356:15)"
                      },
                      {
                        msg: "FirebaseError: [code=unavailable]: The service is temporarily unavailable.",
                        stack: "FirebaseError: The service is temporarily unavailable.\n    at index.esm2017.js:520:25\n    at async fetchCollection (uploadService.js:12:15)"
                      },
                      {
                        msg: "ReferenceError: process is not defined",
                        stack: "ReferenceError: process is not defined\n    at index.js:12:5\n    at Object.module.exports (main.js:2:1)"
                      },
                      {
                        msg: "TypeError: Failed to fetch (Network Request Blocked)",
                        stack: "TypeError: Failed to fetch\n    at async postTelemetry (telemetryService.js:45:12)\n    at async triggerReport (DeveloperBillingPanel.jsx:112:9)"
                      },
                      {
                        msg: "PaymentGatewayError: [code=gateway_timeout]: Connection to payment server timed out.",
                        stack: "PaymentGatewayError: Connection to payment server timed out.\n    at paymentService.js:84:18\n    at async processCheckout (CartDrawer.jsx:220:14)"
                      }
                    ];
                    msg = defaultTemplates[idx].msg;
                    stk = defaultTemplates[idx].stack;
                  }
                  
                  handleSimulateFailure({
                    clientId: finalClientId,
                    niche: simFailureNiche,
                    errorMsg: msg || 'Error simulado',
                    stack: stk || 'Stack simulado',
                    type: simFailureType,
                    source: simFailureSource
                  });
                  
                  setIsSimulateFailureModalOpen(false);
                }}
                className="px-4 py-2 bg-violet-650 hover:bg-violet-600/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-violet-950/20"
              >
                Inyectar Incidente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sincronización Inteligente Lote (Bulk Sync) */}
      {isBulkSyncModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsBulkSyncModalOpen(false)} />
          <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <RefreshCw size={16} className="text-indigo-400 animate-spin" />
                  Sincronización Inteligente Lote
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Sincroniza múltiples archivos desviados a la vez filtrando elementos sensibles.</p>
              </div>
              <button 
                onClick={() => setIsBulkSyncModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Lista de Archivos */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              {/* Alerta de archivos sensibles */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-[10px] text-amber-400">
                <p className="font-bold flex items-center gap-1.5">
                  ⚠️ Filtro de Seguridad Inteligente Activo
                </p>
                <p className="text-slate-300">
                  Hemos desmarcado por defecto los archivos sensibles (branding, configuraciones de pasarela o index de cliente) para evitar sobreescribir personalizaciones operativas.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Selecciona archivos para actualizar:</p>
                
                <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                  {Object.keys(bulkSyncFiles).map(filename => {
                    const isSensitive = isFileSensitive(filename);
                    return (
                      <label 
                        key={filename} 
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSensitive 
                            ? 'bg-amber-550/5 border-amber-500/15 hover:bg-amber-550/10' 
                            : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!bulkSyncFiles[filename]}
                          onChange={(e) => {
                            setBulkSyncFiles(prev => ({ ...prev, [filename]: e.target.checked }));
                          }}
                          className="mt-0.5 w-4 h-4 rounded accent-indigo-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[10px] text-slate-300 break-all">{filename}</span>
                          <span className="block text-[9px] font-bold">
                            {isSensitive ? (
                              <span className="text-amber-400">⚠️ Archivo Sensible (Branding/Config)</span>
                            ) : (
                              <span className="text-indigo-400">✔ Lógica Core (Seguro para actualizar)</span>
                            )}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkSyncModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={bulkSyncLoading || !Object.values(bulkSyncFiles).some(Boolean)}
                onClick={() => {
                  const filesToSync = Object.keys(bulkSyncFiles).filter(f => bulkSyncFiles[f]);
                  handleBulkSync(selectedCrmClientId, filesToSync);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-950/25 flex items-center gap-1.5"
              >
                {bulkSyncLoading && <RefreshCw size={12} className="animate-spin" />}
                Aplicar Sincronización ({Object.values(bulkSyncFiles).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terminal de Despliegue de Hosting (SSE Bridge) */}
      {isDeployTerminalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => {
            if (deployState !== 'running') setIsDeployTerminalOpen(false);
          }} />
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl relative z-10 flex flex-col h-[70vh] overflow-hidden">
            {/* Header / Barra de título */}
            <div className="p-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                <span className="text-[10px] font-mono text-slate-400 font-bold ml-2">
                  ssh developer@bridge-deploy:~/{deployTerminalClientId}
                  {deployQueue.length > 0 && ` [Cola: ${deployQueueIndex + 1}/${deployQueue.length}]`}
                </span>
              </div>
              <button
                onClick={() => setIsDeployTerminalOpen(false)}
                disabled={deployState === 'running'}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Terminal Screen / Logs */}
            <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-[10px] text-slate-350 space-y-1.5 scrollbar-thin text-left select-text">
              {deployLogs.map((log, index) => (
                <div key={index} className={`leading-relaxed whitespace-pre-wrap ${
                  log.startsWith('❌') ? 'text-red-400 font-bold' : 
                  log.startsWith('⚠') ? 'text-amber-400' : 
                  log.startsWith('✅') || log.startsWith('🎉') ? 'text-emerald-400 font-bold' : 
                  log.startsWith('🚀') || log.startsWith('📦') ? 'text-indigo-400 font-bold' : 'text-slate-300'
                }`}>
                  {log}
                </div>
              ))}
              {deployState === 'running' && (
                <div className="flex items-center gap-2 text-indigo-400 font-bold animate-pulse mt-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  <span>Ejecutando operaciones en la instancia...</span>
                </div>
              )}
            </div>

            {/* Status Bar / Progress */}
            <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3.5">
              {/* Barra de progreso */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">Progreso de Despliegue</span>
                  <span className={deployState === 'success' ? 'text-emerald-400' : deployState === 'failed' ? 'text-red-400' : 'text-indigo-400'}>
                    {deployState === 'success' ? '✔ COMPLETO' : deployState === 'failed' ? '❌ FALLIDO' : `${deployProgressPercent}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      deployState === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                      deployState === 'failed' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                    }`}
                    style={{ width: `${deployProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Botones de acción del terminal */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  {deployAuditScore !== null && (
                    <div className="text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                      Puntaje PWA: {deployAuditScore}/100 (Bajo)
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {deployQueue.length > 0 && (
                    <button
                      onClick={() => {
                        setDeployQueue([]);
                        setDeployQueueIndex(-1);
                        setDeployState('idle');
                        addLog(`[Cola Global] Cola de despliegue en lote cancelada por el desarrollador.`, "error");
                        showToast("Cola de despliegue cancelada", { type: 'info' });
                      }}
                      className="px-3.5 py-1.5 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar Cola
                    </button>
                  )}
                  {deployState === 'failed' && (
                    <button
                      onClick={() => handleDeployClient(deployTerminalClientId, true)}
                      className="px-3.5 py-1.5 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-400 font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Forzar Despliegue (Ignorar Auditoría)
                    </button>
                  )}
                  <button
                    onClick={() => setIsDeployTerminalOpen(false)}
                    disabled={deployState === 'running'}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-350 font-bold rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    Cerrar Consola
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Sincronización Global */}
      {isGlobalSyncConfigModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsGlobalSyncConfigModalOpen(false)} />
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <RefreshCw size={16} className="text-indigo-400" />
                  Sincronización Global Core (Safe)
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Selecciona los clientes en los que deseas sincronizar la lógica de archivos core.</p>
              </div>
              <button 
                onClick={() => setIsGlobalSyncConfigModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Client Checklist */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Clientes Activos</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const allChecked = {};
                      clientesSaas.filter(c => !c.archived).forEach(c => { allChecked[c.id] = true; });
                      setGlobalSyncCheckedClients(allChecked);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                  >
                    Seleccionar Todos
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setGlobalSyncCheckedClients({})}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {clientesSaas.filter(c => !c.archived).map(client => (
                  <label 
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer"
                  >
                    <input 
                      type="checkbox"
                      checked={!!globalSyncCheckedClients[client.id]}
                      onChange={(e) => {
                        setGlobalSyncCheckedClients(prev => ({ ...prev, [client.id]: e.target.checked }));
                      }}
                      className="w-4 h-4 rounded accent-indigo-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-200">{client.id}</span>
                      <span className="block text-[9px] text-slate-400 font-medium">Nicho: {client.niche || 'N/A'} • Versión: Ecosistema Core</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGlobalSyncConfigModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteGlobalSync}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-950/25 flex items-center gap-1.5"
              >
                Iniciar Sincronización ({Object.values(globalSyncCheckedClients).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Despliegue Global Hosting */}
      {isGlobalDeployConfigModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsGlobalDeployConfigModalOpen(false)} />
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  Despliegue Global Hosting
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Selecciona los clientes cuyos proyectos de hosting de Firebase se compilarán y subirán.</p>
              </div>
              <button 
                onClick={() => setIsGlobalDeployConfigModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Client Checklist */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Clientes Activos</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const allChecked = {};
                      clientesSaas.filter(c => !c.archived).forEach(c => { allChecked[c.id] = true; });
                      setGlobalDeployCheckedClients(allChecked);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                  >
                    Seleccionar Todos
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setGlobalDeployCheckedClients({})}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {clientesSaas.filter(c => !c.archived).map(client => (
                  <label 
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer"
                  >
                    <input 
                      type="checkbox"
                      checked={!!globalDeployCheckedClients[client.id]}
                      onChange={(e) => {
                        setGlobalDeployCheckedClients(prev => ({ ...prev, [client.id]: e.target.checked }));
                      }}
                      className="w-4 h-4 rounded accent-emerald-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-200">{client.id}</span>
                      <span className="block text-[9px] text-slate-400 font-medium">Nicho: {client.niche || 'N/A'} • Hosting: Firebase</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGlobalDeployConfigModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteGlobalDeploy}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-950/25 flex items-center gap-1.5"
              >
                Iniciar Despliegue ({Object.values(globalDeployCheckedClients).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Telemetría Global */}
      {isGlobalTelemetryModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsGlobalTelemetryModalOpen(false)} />
          <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 flex flex-col max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Obtener Telemetría Global
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Selecciona los clientes a los que deseas solicitar un reporte de telemetría y diagnóstico inmediato.</p>
              </div>
              <button 
                onClick={() => setIsGlobalTelemetryModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Client Checklist */}
            <div className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Clientes Activos</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const allChecked = {};
                      clientesSaas.filter(c => !c.archived).forEach(c => { allChecked[c.id] = true; });
                      setGlobalTelemetryCheckedClients(allChecked);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                  >
                    Seleccionar Todos
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setGlobalTelemetryCheckedClients({})}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {clientesSaas.filter(c => !c.archived).map(client => (
                  <label 
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer"
                  >
                    <input 
                      type="checkbox"
                      checked={!!globalTelemetryCheckedClients[client.id]}
                      onChange={(e) => {
                        setGlobalTelemetryCheckedClients(prev => ({ ...prev, [client.id]: e.target.checked }));
                      }}
                      className="w-4 h-4 rounded accent-indigo-600 bg-slate-950 border border-slate-800 focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-slate-200">{client.id}</span>
                      <span className="block text-[9px] text-slate-400 font-medium">Nicho: {client.niche || 'N/A'} • Control de Telemetría</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/85 bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGlobalTelemetryModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteGlobalTelemetry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-indigo-950/25 flex items-center gap-1.5"
              >
                Solicitar Reporte ({Object.values(globalTelemetryCheckedClients).filter(Boolean).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Notificaciones */}
      <GuidedToast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        actionText={toast.actionText}
        onActionClick={toast.onActionClick}
      />
    </div>
  )
}
