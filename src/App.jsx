import React, { useEffect, useState, useRef } from 'react'
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
  Send
} from 'lucide-react'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp,
  setDoc,
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


// Variables de entorno para conectar al Firebase Central de Control
const CENTRAL_CONFIG = {
  apiKey: import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY || "",
  authDomain: import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID || ""
}

const CLIENT_ID = import.meta.env.VITE_DEVELOPER_CLIENT_ID || "ventas-smartfix"
const DEV_TOKEN = import.meta.env.VITE_DEVELOPER_TELEMETRY_TOKEN || "test-token"

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
        className={`bg-[var(--color-surface-2)]/40 hover:bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none flex items-center justify-between transition-colors focus:border-indigo-500 cursor-pointer ${className || ''}`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-scale-up">
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
                className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer block ${
                  isSelected 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
  // Guarda datos del cliente cuando Firestore OK pero CLI falla — permite reintentar solo el paso físico
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
  const [isFontModalOpen, setIsFontModalOpen] = useState(false)
  const [fontSearchQuery, setFontSearchQuery] = useState('')

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
    link.href = 'https://fonts.googleapis.com/css2?family=Cabin&family=DM+Sans&family=Fira+Sans&family=Inter&family=Lora&family=Manrope&family=Montserrat&family=Nunito&family=Outfit&family=Playfair+Display&family=Poppins&family=Plus+Jakarta+Sans&family=Quicksand&family=Roboto&family=Sora&family=Space+Grotesk&family=Syne&display=swap';
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

  // Control de Tema Claro/Oscuro
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Estados de carga, búsqueda y UI general
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isSimulated, setIsSimulated] = useState(false)
  const [dbStatus, setDbStatus] = useState('conectando')
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

  const getClientRate = (clientId) => {
    const configObj = clientesSaas.find(c => c.id === clientId)
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Cargar plantillas dinámicamente
  useEffect(() => {
    fetch('http://localhost:3001/api/templates')
      .then(res => res.json())
      .then(data => {
        const seedTemplate = { id: 'template-core-seed', name: 'Crear desde cero' }
        if (Array.isArray(data)) {
          const list = data.some(t => (t.id || t) === 'template-core-seed')
            ? data
            : [seedTemplate, ...data]
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
  }, [])

  // Auto-detectar credenciales Firebase desde el CLI Bridge local
  const handleAutoDetectConfig = async () => {
    if (!fbProjectId.trim()) {
      showToast('Ingresa primero el Firebase Project ID para auto-detectar', { type: 'error' })
      return
    }
    setIsFetchingConfig(true)
    addLog(`Auto-detectando credenciales Firebase para proyecto: ${fbProjectId}...`, 'info')
    try {
      const res = await fetch(
        `http://localhost:3001/api/firebase-config?projectId=${encodeURIComponent(fbProjectId)}&projectName=${encodeURIComponent(newClientName || fbProjectId)}`
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error desconocido del servidor CLI.')
      }
      const { config } = data
      setFbApiKey(config.apiKey || '')
      setFbAuthDomain(config.authDomain || '')
      setFbStorageBucket(config.storageBucket || '')
      setFbMessagingSenderId(config.messagingSenderId || '')
      setFbAppId(config.appId || '')
      addLog(`✓ Credenciales Firebase auto-detectadas y cargadas para ${fbProjectId}.`, 'success')
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
    setTargetPath(val.trim() ? `D:\\Aplicaciones\\App-${slug}` : '')
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
      const clientRef = doc(dbInstance, 'clientes_saas', clientId)
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

  // Auth y Firebase Listeners
  useEffect(() => {
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
            const clientsList = Array.from(new Set(data.map(d => d.clientId || 'desconocido'))).join(', ')
            addLog(`Sincronizados ${data.length} reportes de facturación de clientes en vivo. Clientes: [${clientsList}]`, "success")
          }, (error) => {
            console.warn("Fallo al leer datos reales. Cargando sandbox local:", error)
            loadSimulatedData()
            setIsSimulated(true)
            setDbStatus('error-sandbox')
            setIsLoading(false)
            addLog("Acceso denegado a Firestore. Cargando Sandbox local automático.", "error")
          })

          // Escuchar configuración de tasas comisiones SaaS
          const qClientes = collection(dbInstance, 'clientes_saas')
          unsubClientes = onSnapshot(qClientes, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setClientesSaas(data)
            addLog(`Sincronizadas ${data.length} configuraciones de clientes SaaS en tiempo real.`, "success")
          }, (error) => {
            console.warn("Fallo al escuchar clientes_saas:", error)
          })

          // Escuchar tokens de telemetría en tiempo real
          const qTokens = collection(dbInstance, 'tokens')
          unsubTokens = onSnapshot(qTokens, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            setTelemetryTokens(data)
          }, (error) => {
            console.warn("Fallo al escuchar tokens:", error)
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
  }, [])

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

  // Crear reporte prueba
  const handleCreateTestReport = async () => {
    const targetClient = isSimulated ? 'cliente-simulado-' + Math.floor(Math.random() * 10) : CLIENT_ID
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
            <div className="w-16 h-16 bg-gradient-to-tr from-violet-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(124,58,237,0.3)] animate-gradient-shift">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 15h40c13 0 20 7 20 20s-7 20-20 20H45v30H25V15zm20 20h18c4 0 6-2 6-5s-2-5-6-5H45v10z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">PROTOTIPE</h2>
            <p className="text-xs text-slate-400 mt-1">Consola Central de Aplicaciones a la Medida</p>
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
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans pb-12 overflow-x-hidden transition-colors duration-300">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* WIZARD PANEL (Left) */}
            <div className="lg:col-span-7 bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm border border-[var(--color-border)] flex flex-col gap-6">
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
                          placeholder="D:\Aplicaciones\App-ventas-smartfix"
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

                    <div className="border-t border-[var(--color-border)] pt-4 mt-2">
                      <div className="space-y-1.5 mb-4">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Firebase Project ID</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={fbProjectId}
                            onChange={(e) => setFbProjectId(e.target.value)}
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
                            onChange={(e) => setFbApiKey(e.target.value)}
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

                      <div className="space-y-1 mt-3">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">VAPID Key de Web Push (Manual)</label>
                        <input 
                          type="text" 
                          value={fbVapidKey}
                          onChange={(e) => setFbVapidKey(e.target.value)}
                          placeholder="BDd3L1s..."
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {wizardTab === 'branding' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Paletas de Colores Preestablecidas */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Paletas de Colores de Marca Recomendadas</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { name: 'Royal Indigo', primary: '#6366f1', secondary: '#a855f7', bg: '#070b13', text: '#f8fafc' },
                          { name: 'Esmeralda Tech', primary: '#10b981', secondary: '#06b6d4', bg: '#06130e', text: '#ecfdf5' },
                          { name: 'Cyberpunk Neon', primary: '#ff007f', secondary: '#00f0ff', bg: '#0c0714', text: '#fdf6ff' },
                          { name: 'Sunset Glow', primary: '#f97316', secondary: '#ef4444', bg: '#140c0b', text: '#fffcfb' },
                          { name: 'Crimson Rose', primary: '#e11d48', secondary: '#be123c', bg: '#18080f', text: '#fff1f2' },
                          { name: 'Amber Warm', primary: '#f59e0b', secondary: '#d97706', bg: '#15120c', text: '#fffdfa' },
                          { name: 'Ocean Wave', primary: '#0ea5e9', secondary: '#3b82f6', bg: '#080f1e', text: '#f0f7ff' },
                          { name: 'Slate Clean', primary: '#475569', secondary: '#94a3b8', bg: '#0f172a', text: '#f8fafc' }
                        ].map((preset, pIdx) => {
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
                              className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md scale-[1.02]' 
                                  : 'bg-[var(--color-surface-2)]/30 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/60'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                                <div className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ backgroundColor: preset.bg }} />
                                <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: preset.text }} />
                              </div>
                              <span className="text-[10px] font-bold block text-[var(--color-text)] truncate">{preset.name}</span>
                            </button>
                          );
                        })}
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
                  </div>
                )}

                {wizardTab === 'modules' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-4">
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

                          {enableDianBilling && (
                            <div className="space-y-1.5 animate-fade-in">
                              <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Costo Adicional por Documento DIAN ($ COP)</label>
                              <input 
                                type="number" 
                                value={costoPorFacturaDian}
                                onChange={(e) => setCostoPorFacturaDian(parseFloat(e.target.value) || 0)}
                                className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                                min="0"
                                placeholder="150"
                              />
                            </div>
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

                    addLog(`Registrando nuevo cliente SaaS: ${clientId} (${billingMode})`, "info")

                    const cliPayload = {
                      template: selectedTemplate,
                      projectName: newClientName.trim(),
                      targetPath,
                      telemetryToken,
                      paletteChoice: 'custom',
                      customPrimary: primaryColor,
                      customAccent: secondaryColor,
                      enableGithub,
                      enableFirebaseDeploy,
                      firebaseApiKey: fbApiKey,
                      firebaseAuthDomain: fbAuthDomain,
                      firebaseProjectId: fbProjectId,
                      firebaseStorageBucket: fbStorageBucket,
                      firebaseMessagingSenderId: fbMessagingSenderId,
                      firebaseAppId: fbAppId,
                      centralApiKey: CENTRAL_CONFIG.apiKey,
                      centralMessagingSenderId: CENTRAL_CONFIG.messagingSenderId,
                      centralAppId: CENTRAL_CONFIG.appId,
                      customRequirements: customRequirements.trim(),
                      billingMode,
                      comisionPorcentaje,
                      montoFijoServicio,
                      pagoMensualFijo,
                      enableDianBilling,
                      costoPorFacturaDian,
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

                      setClientesSaas(prev => [...prev, { id: clientId, billingMode, comisionPorcentaje, montoFijoServicio, pagoMensualFijo, enableDianBilling, costoPorFacturaDian }])
                      setReports(prev => [newRep, ...prev])
                      setTelemetryTokens(prev => [...prev, { id: telemetryToken, clientId }])

                      addLog(`[Sandbox] Cliente ${clientId} registrado y token configurado localmente.`, "success")
                      showToast(`Cliente ${newClientName} registrado (Sandbox)`, { type: 'success' })
                      
                      setOnboardingData({
                        clientId,
                        token: telemetryToken,
                        comisionPorcentaje,
                        vapidKey: fbVapidKey,
                        prompt: `# Antigravity Bootstrap Prompt for ${clientId}\n\nThis is a simulated prompt for testing purposes.`
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
                      const clientRef = doc(dbInstance, 'clientes_saas', clientId)
                      await setDoc(clientRef, {
                        nombre: newClientName.trim(),
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
                          apiKey: fbApiKey,
                          authDomain: fbAuthDomain,
                          projectId: fbProjectId,
                          storageBucket: fbStorageBucket,
                          messagingSenderId: fbMessagingSenderId,
                          appId: fbAppId,
                          vapidKey: fbVapidKey
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
                        prompt: promptResult
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
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[var(--color-surface)]/50 p-6 rounded-3xl border border-[var(--color-border)] shadow-sm sticky top-24">
              <div className="text-center mb-4">
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider flex items-center justify-center gap-1">
                  <Smartphone size={10} />
                  Vista Previa Interactiva
                </span>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">El mockup refleja branding y tipografías en tiempo real.</p>
              </div>

              {/* Smartphone mockup */}
              <div 
                className="w-[280px] h-[550px] rounded-[36px] p-2.5 relative shadow-2xl transition-all duration-555 ease-in-out border border-slate-700/50"
                style={{ 
                  backgroundColor: bgColor, 
                  color: textColor,
                  fontFamily: `'${googleFont}', sans-serif`,
                  boxShadow: `0 25px 50px -12px ${primaryColor}20, 0 0 2px 2px ${primaryColor}40`
                }}
              >
                {/* Glass reflection effect overlay */}
                <div className="absolute inset-0 rounded-[36px] bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />

                {/* Inner Screen Container */}
                <div className="h-full w-full flex flex-col justify-between relative overflow-hidden rounded-[28px] p-3 pt-6">
                  
                  {/* Dynamic Island / Camera Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-45 flex items-center justify-center">
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
                  <div className="flex items-center justify-between mt-1">
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
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center cursor-pointer">
                      <span className="text-[8px]">🔔</span>
                    </div>
                  </div>

                  {/* Mock Contents */}
                  <div className="flex-1 my-3 overflow-y-auto space-y-3.5 scrollbar-none pr-0.5">
                    {/* Hero Commission Dashboard inside app */}
                    <div 
                      className="p-3 rounded-2xl relative overflow-hidden transition-all duration-300 shadow-md border"
                      style={{ 
                        backgroundColor: `${secondaryColor}12`,
                        borderColor: `${primaryColor}25`
                      }}
                    >
                      <span className="text-[8px] opacity-75 uppercase font-bold tracking-wider block">Balance de Hoy</span>
                      <span className="text-lg font-black block mt-0.5 tracking-tight">$2,450,000</span>
                      <p className="text-[7px] opacity-80 mt-1">12 ventas procesadas exitosamente</p>
                      
                      {/* Decorative gradient spot inside card */}
                      <div 
                        className="absolute right-[-10%] bottom-[-10%] w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>

                    {/* Quick Action Button inside mockup */}
                    <button 
                      type="button"
                      className="w-full py-2 rounded-xl text-[9px] font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>⚡ Registrar Nueva Venta</span>
                    </button>

                    {/* Simulating Recent List */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider block">Historial de Ventas</span>
                      {[
                        { title: 'iPhone 15 Pro Max', time: 'Hace 5 min', val: '$4,800,000' },
                        { title: 'Servicio Técnico Calzado', time: 'Hace 2 horas', val: '$150,000' },
                        { title: 'Licencia Premium SaaS', time: 'Ayer', val: '$350,000' }
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[8px] hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="opacity-60 text-[7px]">{item.time}</p>
                          </div>
                          <span className="font-mono font-bold" style={{ color: primaryColor }}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Bar inside phone */}
                  <div className="border-t border-white/10 pt-2 flex justify-around text-[8px] opacity-80">
                    <div className="flex flex-col items-center gap-0.5" style={{ color: primaryColor }}>
                      <span>🏠</span>
                      <span className="font-bold">Inicio</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 opacity-60">
                      <span>📊</span>
                      <span>Ventas</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 opacity-60">
                      <span>⚙️</span>
                      <span>Ajustes</span>
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
              <div className="mb-4 shrink-0">
                <div className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] px-3.5 py-2 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-colors duration-300">
                  <Search size={14} className="text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar tipografía..."
                    value={fontSearchQuery}
                    onChange={(e) => setFontSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-0"
                  />
                </div>
              </div>

              {/* Listado de Fuentes con Vista Previa */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[250px]">
                {[
                  { value: 'Inter', desc: 'Sans-serif funcional y altamente legible a cualquier tamaño.' },
                  { value: 'Poppins', desc: 'Redondeada premium, excelente para interfaces amigables.' },
                  { value: 'Roboto', desc: 'Clásica, limpia, geométrica y balanceada.' },
                  { value: 'Montserrat', desc: 'Geométrica moderna, ideal para títulos impactantes.' },
                  { value: 'Outfit', desc: 'Moderna, estilizada y con personalidad geométrica.' },
                  { value: 'Plus Jakarta Sans', desc: 'Limpia, elegante y de estilo corporativo moderno.' },
                  { value: 'Sora', desc: 'Estilo tech muy marcado, ideal para productos de desarrollo.' },
                  { value: 'Manrope', desc: 'Grotesque contemporánea y de proporciones balanceadas.' },
                  { value: 'Space Grotesk', desc: 'Brutalista y futurista, con caracteres de gran impacto.' },
                  { value: 'Playfair Display', desc: 'Serif sumamente elegante, con alto contraste y clase.' },
                  { value: 'Lora', desc: 'Serif literaria y premium, con terminaciones suaves.' },
                  { value: 'Fira Sans', desc: 'Legible, humana y diseñada para pantallas de alta densidad.' },
                  { value: 'Cabin', desc: 'Neo-grotesque amigable con sutiles curvas humanistas.' },
                  { value: 'Nunito', desc: 'Suave, con esquinas redondeadas y tono cercano.' },
                  { value: 'Syne', desc: 'Artística, expresiva y diseñada para marcas de moda o creativas.' },
                  { value: 'DM Sans', desc: 'Limpia, neutra y corporativa de baja distracción.' },
                  { value: 'Quicksand', desc: 'Totalmente geométrica y redondeada con curvas amigables.' }
                ]
                .filter(f => f.value.toLowerCase().includes(fontSearchQuery.toLowerCase()))
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
                        <span className="text-xs font-black text-[var(--color-text)]">{font.value}</span>
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
      </div>
    )
  }

  // CONSTANTES DE NAVEGACIÓN
  const NAV_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortLabel: 'Inicio' },
    { id: 'crm', label: 'CRM Clientes', icon: Users, shortLabel: 'CRM' },
    { id: 'billing', label: 'Facturación', icon: CreditCard, shortLabel: 'Cobros' },
    { id: 'library', label: 'Biblioteca', icon: BookOpen, shortLabel: 'Biblioteca' },
    { id: 'onboarding', label: 'Nuevo Cliente', icon: Sparkles, shortLabel: 'Nuevo' },
    { id: 'settings', label: 'Ajustes', icon: Settings, shortLabel: 'Config' },
  ]

  // Proyecciones de ingresos calculadas
  const projExistingMonthly = clientesSaas.reduce((sum, c) => {
    const rate = parseFloat(c.comisionPorcentaje) || 1.5
    return sum + (projAvgSales * rate / 100)
  }, 0)
  const projNewMonthly = projNewClients * (projAvgSales * projRate / 100)
  const projTotalMonthly = projExistingMonthly + projNewMonthly
  const projTotalYear = projTotalMonthly * projMonths

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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200 transition-colors duration-300 flex flex-col">
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.15)] animate-gradient-shift shrink-0">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25 15h40c13 0 20 7 20 20s-7 20-20 20H45v30H25V15zm20 20h18c4 0 6-2 6-5s-2-5-6-5H45v10z"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm tracking-wide text-slate-800 dark:text-slate-100 leading-tight">PROTOTIPE</span>
                </div>
              </div>
            )}
          </div>

          {/* Logo & Brand (Outside wrapper, visible ONLY when collapsed to slide into topbar) */}
          {sidebarCollapsed && (
            <div 
              onClick={() => setSidebarCollapsed(false)}
              className="flex items-center gap-3 pl-6 transition-all duration-300 ease-out cursor-pointer hover:opacity-80 select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.15)] animate-gradient-shift shrink-0">
                <svg className="w-4.5 h-4.5" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 15h40c13 0 20 7 20 20s-7 20-20 20H45v30H25V15zm20 20h18c4 0 6-2 6-5s-2-5-6-5H45v10z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wide text-slate-800 dark:text-slate-100 leading-tight">PROTOTIPE</span>
                <span className="hidden sm:block text-[9px] text-slate-450 dark:text-slate-500 font-medium tracking-wider uppercase">
                  Motor de Aplicaciones a la Medida
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold ${
            dbStatus === 'conectado' && !isSimulated
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-radar-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            {dbStatus === 'conectado' && !isSimulated ? 'Live' : 'Sandbox'}
          </div>
          <DarkModeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-semibold text-[var(--color-text)] truncate max-w-[140px]">{user.email}</span>
            <span className="text-[9px] text-violet-500 dark:text-violet-400 font-bold uppercase tracking-wider">Root Dev</span>
          </div>
          <button 
            onClick={handleLogout}
            className="h-8 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Salir</span>
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
                  <div key={idx} onClick={() => setActiveMetricModal(card.type)}
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
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 block mt-0.5">Al día</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Consola de Telemetría (Estilo Ventana de Comandos Real) */}
                <div className="bg-[var(--color-surface)] rounded-2xl flex flex-col shadow-sm transition-colors duration-300 border border-[var(--color-border)] overflow-hidden">
                  {/* Top Bar de Ventana de Comandos */}
                  <div className="bg-[var(--color-surface-2)]/60 px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block" />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-wider">telemetry_monitor.sh</span>
                    <span className="w-6" />
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="space-y-1 mb-4">
                      <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">Live Monitor</span>
                      <h3 className="font-extrabold text-base text-[var(--color-text)] flex items-center gap-2">
                        <Activity size={16} className="text-violet-400 animate-pulse" />
                        Telemetría
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className={`animate-radar-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${dbStatus === 'conectado' && !isSimulated ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        </span>
                        <div className="min-w-0">
                          <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Canal DB</span>
                          <span className="text-[10px] font-bold text-[var(--color-text)] truncate block">{dbStatus === 'conectado' && !isSimulated ? 'Firestore' : 'Sandbox'}</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className={`animate-radar-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${systemLogs.length > 0 ? (systemLogs[0].type === 'error' ? 'bg-red-400' : systemLogs[0].type === 'warning' ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-slate-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${systemLogs.length > 0 ? (systemLogs[0].type === 'error' ? 'bg-red-500' : systemLogs[0].type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-500'}`}></span>
                        </span>
                        <div className="min-w-0">
                          <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Status</span>
                          <span className="text-[10px] font-bold text-[var(--color-text)] truncate block">{systemLogs.length > 0 ? systemLogs[0].type : 'Inactivo'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 h-[220px] overflow-y-auto scrollbar-thin flex flex-col gap-2">
                      {systemLogs.length === 0 ? (
                        <div className="text-[var(--color-text-muted)] italic text-xs text-center my-auto flex items-center justify-center gap-1">
                          <span>Sin transmisiones registradas</span>
                          <span className="w-1.5 h-3 bg-violet-400 animate-cursor-blink inline-block" />
                        </div>
                      ) : (
                        (() => {
                          const LOGS_PER_PAGE = 5
                          const totalLogPages = Math.ceil(systemLogs.length / LOGS_PER_PAGE) || 1
                          const currentPage = Math.min(logPage, totalLogPages)
                          const paginatedLogs = systemLogs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE)
                          return paginatedLogs.map((log, index) => {
                            const cardStyle = { info: 'bg-[var(--color-surface-2)]/45 text-[var(--color-text-muted)] border-[var(--color-border)]', warning: 'bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20', error: 'bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/20', success: 'bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' }[log.type]
                            const badgeStyle = { info: 'bg-slate-500/10 text-slate-500 dark:text-slate-400', warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', error: 'bg-red-500/10 text-red-600 dark:text-red-400', success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }[log.type]
                            const label = { info: 'INFO', warning: 'WARN', error: 'ERR', success: 'OK' }[log.type]
                            return (
                              <div key={index} className={`p-2 rounded-xl border ${cardStyle} text-[10px] flex flex-col gap-0.5`}>
                                <div className="flex items-center justify-between">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${badgeStyle}`}>{label}</span>
                                  <span className="text-[8px] text-[var(--color-text-muted)] font-mono">{log.timestamp}</span>
                                </div>
                                <p className="font-mono leading-relaxed break-words">
                                  {log.message}
                                  {index === 0 && <span className="w-1.5 h-3 bg-violet-400 animate-cursor-blink inline-block ml-1" />}
                                </p>
                              </div>
                            )
                          })
                        })()
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                      <button onClick={() => { setSystemLogs([]); setLogPage(1) }} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Limpiar</button>
                      {systemLogs.length > 5 && (
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button disabled={logPage === 1} onClick={() => setLogPage(p => Math.max(p - 1, 1))} className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer font-bold">◀</button>
                          <span className="font-mono text-[9px] text-[var(--color-text-muted)]">{logPage}/{Math.ceil(systemLogs.length / 5)}</span>
                          <button disabled={logPage >= Math.ceil(systemLogs.length / 5)} onClick={() => setLogPage(p => p + 1)} className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] disabled:opacity-30 cursor-pointer font-bold">▶</button>
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
                <button onClick={() => setActiveTab('onboarding')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.98] cursor-pointer shrink-0">
                  <Plus size={14} />
                  Nuevo Cliente
                </button>
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
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Ventas</span>
                        <span className="text-xs font-black font-mono text-[var(--color-text)]">${client.totalSales.toLocaleString('es-CO')}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-[var(--color-text-muted)] block">Comisión</span>
                        <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">${client.totalCommission.toLocaleString('es-CO')}</span>
                      </div>
                      <button onClick={() => { setSelectedCrmClientId(client.name); setActiveMetricModal('clientes') }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 shadow-sm">
                        Gestionar
                        <ChevronRight size={12} />
                      </button>
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
                                const cfg = clientesSaas.find(c => c.id === report.clientId)
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

          {/* ===== TAB: ONBOARDING ===== */}
          {activeTab === 'onboarding' && (
            <div className="tab-content-enter">
              {/* Reutilizar el wizard completo */}
              {isOnboardingActive ? (
                <div className="text-center text-xs text-[var(--color-text-muted)] p-8">El asistente de aprovisionamiento está activo en la vista de pantalla completa.</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
                      <Sparkles size={20} className="text-indigo-400" />
                      Nuevo Cliente
                    </h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Aprovisiona, configura y despliega una nueva instancia de aplicación para un cliente.</p>
                  </div>
                  <button onClick={() => setIsOnboardingActive(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(99,102,241,0.3)] active:scale-[0.98] cursor-pointer">
                    <Sparkles size={16} />
                    Iniciar Asistente de Aprovisionamiento
                  </button>
                  <p className="text-[10px] text-[var(--color-text-muted)]">El asistente te guiará paso a paso a través de la configuración del servidor, branding y módulos.</p>
                </div>
              )}
            </div>
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
              {/* Logs completos */}
              <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-sm text-[var(--color-text)] flex items-center gap-2">
                    <Terminal size={15} className="text-indigo-400" />
                    Consola del Sistema
                  </h3>
                  <button onClick={() => { setSystemLogs([]); setLogPage(1) }} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Limpiar</button>
                </div>
                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 h-[300px] overflow-y-auto scrollbar-thin flex flex-col gap-2">
                  {systemLogs.length === 0 ? (
                    <div className="text-[var(--color-text-muted)] italic text-xs text-center my-auto">Sin transmisiones registradas.</div>
                  ) : (
                    systemLogs.map((log, index) => {
                      const cardStyle = { info: 'bg-[var(--color-surface-2)]/45 text-[var(--color-text-muted)] border-[var(--color-border)]', warning: 'bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20', error: 'bg-red-500/5 text-red-700 dark:text-red-400 border-red-500/20', success: 'bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' }[log.type]
                      return (
                        <div key={index} className={`p-2 rounded-xl border ${cardStyle} text-[10px] flex flex-col gap-0.5`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold uppercase">{log.type}</span>
                            <span className="text-[8px] text-[var(--color-text-muted)] font-mono">{log.timestamp}</span>
                          </div>
                          <p className="font-mono leading-relaxed break-words">{log.message}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          </div>
        </main>
      </div>

      {/* BOTTOM NAVIGATION - Móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl pb-safe animate-slide-up">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`bottom-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[52px] ${
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
