import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  BookOpen, Search, Copy, RefreshCw, Terminal, Folder,
  FileText, Play, Code2, ChevronRight, Package, Sparkles,
  X, AlertTriangle, Check, Layers, Zap, Hash, List, Eye, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import ComponentSandbox, { COMPONENT_SANDBOX_MAP, getSandboxKey } from './ComponentSandbox';

const CLI_URL = 'http://localhost:3001';

// ─── Constantes ────────────────────────────────────────────────────────────────
const DETAIL_TABS = [
  { id: 'docs', label: 'Documentación', icon: FileText },
  { id: 'code', label: 'Código Fuente', icon: Code2 },
  { id: 'sandbox', label: 'Sandbox', icon: Play },
];

// ─── Highlight de término de búsqueda ────────────────────────────────────────
function HighlightText({ text, term }) {
  if (!term || !text) return <span>{text}</span>;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-indigo-500/30 text-indigo-300 rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ─── Botón de copia con feedback ──────────────────────────────────────────────
function CopyButton({ text, label = 'Copiar', size = 'sm', className = '' }) {
  const [copied, setCopied] = useState(false);
  const handleClick = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const isSmall = size === 'sm';
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 font-bold cursor-pointer transition-all ${
        copied
          ? 'text-emerald-400'
          : isSmall
            ? 'text-slate-500 hover:text-slate-300'
            : 'text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl'
      } ${className}`}
    >
      {copied
        ? <><Check size={isSmall ? 10 : 12} />{isSmall ? 'Copiado' : 'Copiado ✓'}</>
        : <><Copy size={isSmall ? 10 : 12} />{label}</>
      }
    </button>
  );
}

// ─── Renderizador Markdown con tablas y resaltado ────────────────────────────
function MarkdownRenderer({ content, searchTerm = '' }) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Bloque de código ──
    if (line.startsWith('```')) {
      const lang = line.replace('```', '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const code = codeLines.join('\n');
      const key = `code-${blockIndex++}`;
      elements.push(
        <div key={key} className="relative bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden my-3 group">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              {lang || 'code'}
            </span>
            <CopyButton text={code} label="Copiar" size="sm" />
          </div>
          <div className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
            <pre className="font-mono text-[10px] leading-relaxed text-slate-300 whitespace-pre">{code}</pre>
          </div>
        </div>
      );
      i++;
      continue;
    }

    // ── Tabla Markdown ──
    if (line.startsWith('|') && i + 1 < lines.length && lines[i + 1].startsWith('|---')) {
      const headers = line.split('|').filter(Boolean).map(h => h.trim());
      i += 2; // saltar header y separador
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim()));
        i++;
      }
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-[var(--color-surface-2)]/80">
                {headers.map((h, idx) => (
                  <th key={idx} className="px-3 py-2 text-left font-black text-[var(--color-text)] border-b border-[var(--color-border)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-[var(--color-surface-2)]/20'}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3 py-2 text-[var(--color-text)] opacity-85 border-b border-[var(--color-border)]/40"
                      dangerouslySetInnerHTML={{
                        __html: cell
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/`([^`]+)`/g, '<code class="font-mono text-[9px] bg-slate-900 text-indigo-300 px-1 py-0.5 rounded">$1</code>')
                      }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── H1 ──
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-base font-black text-[var(--color-text)] border-b border-[var(--color-border)] pb-3 mb-4 mt-2">
          {line.replace('# ', '')}
        </h1>
      );
      i++; continue;
    }

    // ── H2 ──
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-6 mb-2 flex items-center gap-1.5">
          <ChevronRight size={11} />
          {line.replace('## ', '')}
        </h2>
      );
      i++; continue;
    }

    // ── H3 ──
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xs font-bold text-[var(--color-text)] mt-4 mb-1.5">
          {line.replace('### ', '')}
        </h3>
      );
      i++; continue;
    }

    // ── H4 ──
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-[11px] font-bold text-[var(--color-text-muted)] mt-3 mb-1">
          {line.replace('#### ', '')}
        </h4>
      );
      i++; continue;
    }

    // ── Lista ──
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1 my-2 pl-3">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] text-[var(--color-text)] leading-relaxed opacity-85">
              <span className="text-indigo-400 mt-1 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{
                __html: item
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`([^`]+)`/g, '<code class="font-mono text-[9px] bg-slate-900 text-indigo-300 px-1 py-0.5 rounded">$1</code>')
              }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Línea horizontal ──
    if (line.trim() === '---') {
      elements.push(<hr key={`hr-${i}`} className="border-[var(--color-border)] my-5" />);
      i++; continue;
    }

    // ── Línea vacía ──
    if (line.trim() === '') { i++; continue; }

    // ── Párrafo ──
    const parsed = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="font-mono text-[9px] bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded-md">$1</code>');
    elements.push(
      <p
        key={`p-${i}`}
        className="text-[11px] text-[var(--color-text)] leading-relaxed opacity-85 my-1"
        dangerouslySetInnerHTML={{ __html: parsed }}
      />
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// ─── Extractor de todos los bloques de código relevantes ─────────────────────
function extractAllCodeBlocks(md) {
  if (!md) return null;
  const regex = /```(?:javascript|jsx|js|tsx|ts)\n?([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = regex.exec(md)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks.length > 0 ? blocks.join('\n\n// ──────────────────────────────\n\n') : null;
}

// ─── Extractor de código React JSX tolerante de la ficha técnica ─────────────
function extractReactCode(md) {
  if (!md) return null;
  // Regex tolerante a la sección y número: busca cualquier encabezado con "Código" y extrae el primer bloque ```jsx o ```js
  // Si no se encuentra un ``` de cierre, se detiene ante el siguiente encabezado de nivel 2, regla horizontal o fin de archivo.
  const match = md.match(/## \d+\..*?C[óo]digo[\s\S]*?```(?:javascript|jsx|js|tsx|ts)\n?([\s\S]*?)(?:```|(?=\n## \d+\.)|(?=\n---)|$)/i);
  return match ? match[1].trim() : null;
}

// ─── Genera la ruta de destino por defecto para la auto-inyección ────────────
function getDefaultRelativePath(comp) {
  if (!comp) return '';
  const cleanName = comp.technicalName || comp.name.replace(/[^a-zA-Z0-9]/g, '');
  const mdLower = comp.link.toLowerCase();
  
  if (mdLower.includes('/logica_y_hooks/') || mdLower.includes('hook') || comp.name.toLowerCase().startsWith('use')) {
    return `src/hooks/${cleanName.startsWith('use') ? cleanName : 'use' + cleanName}.js`;
  }
  if (mdLower.includes('/servicios_y_firebase/') || mdLower.includes('service')) {
    return `src/services/${cleanName.charAt(0).toLowerCase() + cleanName.slice(1)}Service.js`;
  }
  if (mdLower.includes('/utilidades/') || mdLower.includes('util')) {
    return `src/utils/${cleanName.charAt(0).toLowerCase() + cleanName.slice(1)}.js`;
  }
  if (mdLower.includes('/paginas/') || mdLower.includes('page')) {
    return `src/pages/${cleanName}Page.jsx`;
  }
  if (comp.resourceType === 'module') {
    return `src/components/common/${cleanName}.jsx`;
  }
  return `src/components/ui/${cleanName}.jsx`;
}

export default function ComponentLibraryView({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentContent, setComponentContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [activeTab, setActiveTab] = useState('docs');
  const [sandboxFilter, setSandboxFilter] = useState('all'); // 'all' | 'sandbox' | 'docs'
  const [resourceFilter, setResourceFilter] = useState('all'); // 'all' | 'component' | 'module'
  const [expandedCat, setExpandedCat] = useState(null);

  // Estado para filtrado por etiquetas
  const [selectedTag, setSelectedTag] = useState(null);

  // Estados para extracción de componentes
  const [showExtractForm, setShowExtractForm] = useState(false);
  const [extSourcePath, setExtSourcePath] = useState('');
  const [extTargetName, setExtTargetName] = useState('');
  const [extCategory, setExtCategory] = useState('');
  const [extDescription, setExtDescription] = useState('');
  const [extracting, setExtracting] = useState(false);

  // Estados para inyección en clientes locales
  const [showInjectPanel, setShowInjectPanel] = useState(false);
  const [injectTargetClient, setInjectTargetClient] = useState('');
  const [injectRelativePath, setInjectRelativePath] = useState('');
  const [injecting, setInjecting] = useState(false);
  const [clients, setClients] = useState([]);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnoseResult, setDiagnoseResult] = useState(null);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false);

  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.tagName === 'SELECT' ||
          document.activeElement.isContentEditable)
      ) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleDiagnose = async (clientName) => {
    if (!clientName || !selectedComponent?.link) {
      setDiagnoseResult(null);
      return;
    }
    setDiagnosing(true);
    setDiagnoseResult(null);
    try {
      const res = await fetch(`${CLI_URL}/api/library/inject/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientName,
          componentLink: selectedComponent.link
        })
      });
      const data = await res.json();
      if (data.success) {
        setDiagnoseResult(data);
      } else {
        throw new Error(data.error || 'Fallo al realizar diagnóstico de dependencias');
      }
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setDiagnosing(false);
    }
  };

  const handleExtract = async () => {
    if (!extSourcePath || !extTargetName || !extCategory) return;
    setExtracting(true);
    try {
      const res = await fetch(`${CLI_URL}/api/library/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceFilePath: extSourcePath,
          targetName: extTargetName,
          category: extCategory,
          description: extDescription
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.('¡Componente extraído y catalogado con éxito!', 'success');
        setShowExtractForm(false);
        setExtSourcePath('');
        setExtTargetName('');
        setExtDescription('');
        await fetchLibrary();
      } else {
        throw new Error(data.error || 'Fallo al extraer');
      }
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setExtracting(false);
    }
  };

  const handleInject = async () => {
    if (!injectTargetClient || !injectRelativePath || !selectedComponent?.link) return;
    setInjecting(true);
    try {
      const res = await fetch(`${CLI_URL}/api/library/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: injectTargetClient,
          componentLink: selectedComponent.link,
          targetRelativePath: injectRelativePath
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(`¡Inyección completada con éxito en el cliente ${injectTargetClient}!`, 'success');
        setShowInjectPanel(false);
        setDiagnoseResult(null);
        setInjectTargetClient('');
        setInjectRelativePath('');
      } else {
        throw new Error(data.error || 'Fallo al inyectar');
      }
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setInjecting(false);
    }
  };

  const toggleCategory = useCallback((name) => {
    setExpandedCat(prev => prev === name ? null : name);
  }, []);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${CLI_URL}/api/library?_t=${Date.now()}`);
      if (!res.ok) throw new Error('El CLI Daemon no está respondiendo en el puerto 3001.');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setExpandedCat(null); // Siempre arrancar con todas las categorías contraídas
        const firstCat = data.categories.find(c => c.components?.length > 0);
        if (firstCat) setSelectedComponent(firstCat.components[0]);
      } else {
        throw new Error(data.error || 'Error al cargar la biblioteca.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${CLI_URL}/api/git/targets`);
      const data = await res.json();
      if (data.success && data.targets?.instances) {
        setClients(data.targets.instances);
      }
    } catch (err) {
      console.warn('[Fetch Clients] No se pudo cargar el listado de clientes locales.', err);
    }
  };

  useEffect(() => {
    fetchLibrary();
    fetchClients();
  }, []);

  // Contraer categorías al cambiar filtros de tipo, sandbox o tag
  // (searchTerm no se incluye: la condición || !!searchTerm en el render ya expande automáticamente)
  useEffect(() => {
    setExpandedCat(null);
  }, [resourceFilter, sandboxFilter, selectedTag]);

  // ── Carga del Markdown ──
  useEffect(() => {
    if (!selectedComponent) return;
    const fetchComponentFile = async () => {
      try {
        setLoadingContent(true);
        setComponentContent('');
        const res = await fetch(`${CLI_URL}/api/library/file?fileUri=${encodeURIComponent(selectedComponent.link)}&_t=${Date.now()}`);
        if (!res.ok) throw new Error('Error al obtener el archivo del componente.');
        const data = await res.json();
        if (data.success) {
          setComponentContent(data.content || '');
        } else {
          throw new Error(data.error || 'No se pudo leer el contenido.');
        }
      } catch (err) {
        setComponentContent(`## Error al cargar documentación\n\nNo se pudo leer el archivo. Detalle: ${err.message}`);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchComponentFile();
    setActiveTab('docs');
  }, [selectedComponent]);

  // Obtener todas las etiquetas únicas presentes en el catálogo
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    categories.forEach(cat => {
      cat.components?.forEach(comp => {
        comp.tags?.forEach(tag => tagsSet.add(tag));
      });
    });
    return Array.from(tagsSet).sort();
  }, [categories]);

  // ── Filtrado con contador ──
  const filteredCategories = categories
    .map(cat => ({
      ...cat,
      components: cat.components.filter(comp => {
        const tagsText = (comp.tags || []).join(' ');
        const matchesSearch = `${comp.name} ${comp.technicalName} ${comp.description} ${comp.category} ${tagsText}`
          .toLowerCase().includes(searchTerm.toLowerCase());
        
        const hasSandbox = getSandboxKey(comp.name, comp.technicalName) !== null;

        const matchesSandbox = sandboxFilter === 'sandbox' ? hasSandbox : (sandboxFilter === 'docs' ? !hasSandbox : true);
        const matchesType = resourceFilter === 'all'
          ? true
          : (resourceFilter === 'module' ? comp.resourceType === 'module' : comp.resourceType !== 'module');

        const matchesTag = !selectedTag || (comp.tags && comp.tags.includes(selectedTag));

        return matchesSearch && matchesSandbox && matchesType && matchesTag;
      }),
    }))
    .filter(cat => cat.components.length > 0);

  const totalComponents = categories.reduce((acc, c) => acc + (c.components?.length || 0), 0);
  const filteredTotal = filteredCategories.reduce((acc, c) => acc + c.components.length, 0);
  const allCode = extractAllCodeBlocks(componentContent);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 tab-content-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)] flex items-center gap-2.5">
            <BookOpen size={20} className="text-indigo-400" />
            Biblioteca de Componentes
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {loading ? 'Cargando...' : error ? 'Sin conexión al CLI Daemon'
              : `${totalComponents} componentes · ${categories.length} categorías`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 self-start">
          <button
            onClick={() => setShowExtractForm(p => !p)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/25 hover:bg-indigo-600/20 text-xs font-bold text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles size={13} />
            Extraer Componente
          </button>
          <button
            onClick={fetchLibrary}
            className="px-3.5 py-2 rounded-xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Formulario de extracción de componentes */}
      {showExtractForm && (
        <div className="bg-[var(--color-surface)]/80 border border-indigo-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-[var(--color-text)]">Extractor de Componentes a la Biblioteca</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ruta del Archivo Origen</label>
              <input
                className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                value={extSourcePath}
                onChange={e => setExtSourcePath(e.target.value)}
                placeholder="Ej: D:\PROTOTIPE\Plantillas Core\App Ventas\src\components\ui\BotonPremium.jsx"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nombre del Componente (CamelCase / PascalCase)</label>
              <input
                className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                value={extTargetName}
                onChange={e => setExtTargetName(e.target.value)}
                placeholder="Ej: Boton_Premium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Categoría del Catálogo</label>
              <select
                className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 transition-colors"
                value={extCategory}
                onChange={e => setExtCategory(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {categories.map(c => (
                  <option key={c.name} value={c.folder ? c.folder.split('/').pop() : c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descripción del Componente</label>
              <input
                className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                value={extDescription}
                onChange={e => setExtDescription(e.target.value)}
                placeholder="Ej: Botón HSL premium con micro-interacciones avanzadas y hover glow."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowExtractForm(false)} className="text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-xl transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleExtract}
              disabled={extracting || !extSourcePath || !extTargetName || !extCategory}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer"
            >
              {extracting ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {extracting ? 'Extrayendo...' : 'Extraer a Biblioteca'}
            </button>
          </div>
        </div>
      )}

      {/* Estado de Error */}
      {error ? (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-4 max-w-2xl mx-auto">
          <Terminal size={32} className="text-red-400 mx-auto" />
          <div>
            <h3 className="font-bold text-sm text-[var(--color-text)]">CLI Daemon Desconectado</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
              El dev-dashboard requiere que el servidor local esté corriendo en el puerto 3001.
            </p>
          </div>
          <div className="p-3 bg-[var(--color-bg)]/80 rounded-xl border border-[var(--color-border)] text-left font-mono text-[10px] text-red-300">
            cd D:\PROTOTIPE\Prototipe-CLI && node server.js
          </div>
          <button onClick={fetchLibrary} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
            Reintentar
          </button>
        </div>

      ) : loading ? (
        <div className="p-16 text-center text-slate-400 text-xs space-y-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl">
          <RefreshCw size={24} className="mx-auto animate-spin text-indigo-400" />
          <p className="font-bold uppercase tracking-wider text-[10px]">Cargando Biblioteca...</p>
        </div>

      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ── Columna 1: Panel Lateral (Búsqueda, Filtros y Árbol) (Ancho: 4 / ~33%) ── */}
          <div className={`${isWorkspaceExpanded ? 'hidden' : 'lg:col-span-4 xl:col-span-4'} space-y-3 lg:sticky lg:top-5`}>

            {/* Buscador mejorado */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2.5 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-all flex items-center gap-2">
              <Search size={13} className="text-slate-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar componente..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) {
                    setSandboxFilter('all');
                  }
                }}
                className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none text-xs w-full text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
              />
              {searchTerm ? (
                <button onClick={() => setSearchTerm('')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                  <X size={11} />
                </button>
              ) : (
                <span className="px-1.5 py-0.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] rounded text-[8px] font-mono shrink-0 select-none">
                  /
                </span>
              )}
            </div>

            {/* Filtros de Tipo de Recurso (Componentes vs Módulos) */}
            <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)] gap-1">
              <button
                onClick={() => setResourceFilter('all')}
                title="Todos los Recursos"
                className={`flex-grow py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  resourceFilter === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Layers size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Todos</span>
              </button>
              <button
                onClick={() => setResourceFilter('component')}
                title="Solo Componentes"
                className={`flex-grow py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  resourceFilter === 'component'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Code2 size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Comp</span>
              </button>
              <button
                onClick={() => setResourceFilter('module')}
                title="Solo Módulos Completos"
                className={`flex-grow py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  resourceFilter === 'module'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Package size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Módulos</span>
              </button>
            </div>

            {/* Filtros de Sandbox interactivos */}
            <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)] gap-1">
              <button
                onClick={() => setSandboxFilter('all')}
                title="Todos los Filtros"
                className={`flex-grow py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  sandboxFilter === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <List size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Todos</span>
              </button>
              <button
                onClick={() => setSandboxFilter('sandbox')}
                title="Filtrar por Interactivos en Sandbox"
                className={`flex-grow py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  sandboxFilter === 'sandbox'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Eye size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Sandbox</span>
              </button>
              <button
                onClick={() => setSandboxFilter('docs')}
                title="Filtrar por Solo Documentación"
                className={`flex-grow py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  sandboxFilter === 'docs'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <FileText size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Docs</span>
              </button>
            </div>

            {/* Tag Cloud */}
            {allTags.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 rounded-xl space-y-2 flex flex-col min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5 shrink-0 select-none">
                  <Hash size={10} className="text-indigo-400" />
                  Filtrar por Etiquetas
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin w-full shrink-0">
                  {allTags.map(tag => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-indigo-500/25 border-indigo-500/50 text-indigo-400'
                            : 'bg-[var(--color-surface-2)]/40 border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-indigo-500/20'
                        }`}
                      >
                        #{tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Contador de resultados */}
            {searchTerm && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  <span className="text-indigo-400 font-black">{filteredTotal}</span> resultado{filteredTotal !== 1 ? 's' : ''} para
                </span>
                <span className="text-[10px] font-bold text-indigo-400 italic">"{searchTerm}"</span>
                {filteredTotal === 0 && <X size={10} className="text-red-400" />}
              </div>
            )}

            {/* Árbol en Cards */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="p-3 space-y-3.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {filteredCategories.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Search size={20} className="mx-auto text-[var(--color-text-muted)] opacity-30" />
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      Sin resultados para "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  filteredCategories.map(cat => {
                    const isExpanded = expandedCat === cat.name || !!searchTerm;
                    return (
                      <div key={cat.name} className="space-y-1.5">
                        {/* Selector Desplegable Premium de Categoría */}
                        <button
                          onClick={() => toggleCategory(cat.name)}
                          className="w-full flex items-center gap-2 text-[9px] font-black uppercase text-indigo-400 tracking-wider px-2.5 py-2 bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/35 rounded-xl transition-all duration-200 cursor-pointer text-left shadow-sm group"
                        >
                          <ChevronRight
                            size={10}
                            className={`text-indigo-400/70 transition-transform duration-300 ${
                              isExpanded ? 'rotate-90 text-indigo-400' : ''
                            }`}
                          />
                          <Folder size={10} className="text-indigo-400/60 group-hover:text-indigo-400 transition-colors" />
                          <span className="truncate flex-1">{cat.name}</span>
                          <span className="bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded-full text-[8px] font-black shrink-0 border border-indigo-500/10">
                            {cat.components.length}
                          </span>
                        </button>

                        {/* Componentes Colapsables con AnimatePresence */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ 
                                height: 'auto', 
                                opacity: 1,
                                transition: { height: { type: 'spring', damping: 25, stiffness: 220 }, opacity: { duration: 0.15 } }
                              }}
                              exit={{ 
                                height: 0, 
                                opacity: 0,
                                transition: { height: { duration: 0.18 }, opacity: { duration: 0.1 } }
                              }}
                              className="overflow-hidden pl-3 space-y-2 border-l border-dashed border-indigo-500/15 ml-3.5"
                            >
                              {cat.components.map(comp => {
                                const isSelected = selectedComponent?.link === comp.link;
                                const hasSandbox = getSandboxKey(comp.name, comp.technicalName) !== null;
                                const ResourceIcon = comp.resourceType === 'module' ? Package : Code2;
                                return (
                                  <button
                                    key={comp.link}
                                    onClick={() => setSelectedComponent(comp)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2 shadow-sm ${
                                      isSelected
                                        ? 'bg-indigo-600/10 dark:bg-indigo-500/10 border-indigo-500/50 text-[var(--color-text)] font-semibold scale-[1.01]'
                                        : 'bg-[var(--color-surface-2)]/30 backdrop-blur-sm border-[var(--color-border)]/65 hover:bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-indigo-500/25 hover:scale-[1.01]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 w-full min-w-0">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <ResourceIcon size={12} className={isSelected ? 'text-indigo-400 shrink-0' : 'text-slate-500 shrink-0'} />
                                        <span className="truncate text-xs font-bold text-[var(--color-text)] min-w-0">
                                          {searchTerm
                                            ? <HighlightText text={comp.name} term={searchTerm} />
                                            : comp.name
                                          }
                                        </span>
                                      </div>
                                      {hasSandbox && (
                                        <span className="px-1 py-0.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded text-[7px] font-black shrink-0 leading-none" title="Sandbox Disponible">
                                          LIVE
                                        </span>
                                      )}
                                    </div>

                                    {comp.description && (
                                      <p className="text-[10px] text-[var(--color-text-muted)] leading-normal line-clamp-2 w-full">
                                        {comp.description}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between gap-2 w-full min-w-0 mt-0.5">
                                      {comp.technicalName ? (
                                        <span className="text-[8px] font-mono opacity-85 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.5 rounded leading-none shrink-0">
                                          {comp.technicalName}
                                        </span>
                                      ) : (
                                        <span />
                                      )}
                                      
                                      {comp.tags && comp.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 justify-end shrink-0">
                                          {comp.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="px-1 py-0.5 text-[7px] font-black uppercase text-indigo-400/85 bg-indigo-500/10 border border-indigo-500/15 rounded leading-none">
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
          {/* ── Columna 2: Panel de Detalle Workspace (Ancho: 8 / ~67%) ───────── */}
          <div className={`${isWorkspaceExpanded ? 'lg:col-span-12 xl:col-span-12' : 'lg:col-span-8 xl:col-span-8'} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col min-h-[600px] lg:sticky lg:top-5`}>

            {!selectedComponent ? (
              <div className="flex flex-col items-center justify-center h-full py-24 text-center space-y-4 text-[var(--color-text-muted)]">
                <div className="p-5 bg-[var(--color-surface-2)] rounded-3xl">
                  <Package size={32} className="text-indigo-400/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">Selecciona un componente</p>
                  <p className="text-xs mt-1">Elige un elemento del árbol para ver su documentación y playground.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header del visor */}
                <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/40 shrink-0">
                  <div className="px-5 pt-4 pb-0 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-sm text-[var(--color-text)] truncate">{selectedComponent.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg)]/60 px-2 py-0.5 rounded-lg border border-[var(--color-border)]">
                          {selectedComponent.category}
                        </span>
                        {selectedComponent.technicalName && (
                          <span className="text-[9px] font-mono text-indigo-400/70">
                            {selectedComponent.technicalName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones del header */}
                    {!loadingContent && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setShowInjectPanel(p => !p);
                            if (selectedComponent) {
                              setInjectRelativePath(getDefaultRelativePath(selectedComponent));
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Zap size={11} />
                          Instalar en Cliente
                        </button>
                        {allCode && (
                          <CopyButton
                            text={allCode}
                            label="Copiar todo el código"
                            size="lg"
                            className="text-[10px]"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pestañas */}
                  <div className="flex px-5 mt-3 justify-between items-center border-b border-[var(--color-border)]/30">
                    <div className="flex gap-1 -mb-[1px]">
                      {DETAIL_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                              isActive
                                ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
                                : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/40'
                            }`}
                          >
                            <Icon size={11} />
                            {tab.label}
                            {tab.id === 'sandbox' && (
                              <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[8px] font-black">
                                LIVE
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setIsWorkspaceExpanded(p => !p)}
                      title={isWorkspaceExpanded ? "Contraer área de trabajo" : "Ampliar área de trabajo"}
                      className="mb-1 px-2.5 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-indigo-400 hover:border-indigo-500/35 transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-bold shadow-sm"
                    >
                      {isWorkspaceExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                      <span>{isWorkspaceExpanded ? "Contraer" : "Ampliar"}</span>
                    </button>
                  </div>
                </div>

                {/* Panel de inyección en cliente */}
                {showInjectPanel && (
                  <div className="m-5 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Zap size={14} />
                      <h4 className="text-xs font-bold">Auto-Inyección en Proyecto Cliente</h4>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                      Esta herramienta extraerá el código React del componente/módulo e lo inyectará directamente en la carpeta física del cliente local que elijas.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Proyecto Destino (Cliente)</label>
                        <select
                          className="bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 transition-colors"
                          value={injectTargetClient}
                                                  onChange={e => { setInjectTargetClient(e.target.value); handleDiagnose(e.target.value); }}
                        >
                          <option value="">-- Seleccionar Cliente --</option>
                          {clients.map(c => (
                            <option key={c.path} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ruta Relativa en el Proyecto</label>
                        <input
                          type="text"
                          className="bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] outline-none focus:border-emerald-500 transition-colors"
                          value={injectRelativePath}
                          onChange={e => setInjectRelativePath(e.target.value)}
                          placeholder="Ej: src/components/ui/MiComponente.jsx"
                        />
                      </div>
                    </div>
                    
                    {/* Diagnóstico de dependencias */}
                    {diagnosing && (
                      <div className="p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)]/50 rounded-xl flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
                        <RefreshCw size={12} className="animate-spin text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Analizando dependencias en el cliente...</span>
                      </div>
                    )}

                    {!diagnosing && diagnoseResult && (
                      <div className="space-y-2">
                        {/* Dependencias NPM */}
                        <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]/50 rounded-xl space-y-1.5">
                          <h5 className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                            <span>📦 Dependencias NPM (package.json)</span>
                          </h5>
                          {Object.keys(diagnoseResult.npmMissing).length === 0 ? (
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <span>✓</span> Todas las librerías requeridas ya están instaladas.
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-[9px] text-[var(--color-text-muted)]">Los siguientes paquetes se instalarán automáticamente en la carpeta del cliente:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(diagnoseResult.npmMissing).map(([name, ver]) => (
                                  <span key={name} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded text-[9px] font-mono">
                                    {name}@{ver}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Dependencias Internas */}
                        {diagnoseResult.internalDependencies && diagnoseResult.internalDependencies.length > 0 && (
                          <div className="p-3 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)]/50 rounded-xl space-y-1.5">
                            <h5 className="text-[10px] font-bold text-slate-300">
                              🧩 Subcomponentes y Hooks Requeridos
                            </h5>
                            <div className="space-y-1.5">
                              {diagnoseResult.internalDependencies.map(dep => (
                                <div key={dep.name} className="flex items-center justify-between text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">[{dep.type}]</span>
                                    <span className="text-[var(--color-text)] font-semibold">{dep.name}</span>
                                  </div>
                                  {dep.exists ? (
                                    <span className="text-emerald-400 flex items-center gap-1 text-[9px]">
                                      <span>✓</span> Ya presente
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 font-medium flex items-center gap-1 text-[9px]">
                                      <span>⚠️</span> Se inyectará automáticamente
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Alerta de dependencias */}
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/15 rounded-xl flex items-start gap-2">
                      <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-amber-300/80 leading-relaxed">
                        <strong>Nota Importante:</strong> El código se inyectará recursivamente en cascada. Tras completarse, verifica las rutas de imports y estilos en el cliente para asegurar que el resolvedor de Vite los compile correctamente.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => { setShowInjectPanel(false); setDiagnoseResult(null); }}
                        className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleInject}
                        disabled={injecting || diagnosing || !injectTargetClient || !injectRelativePath}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-white text-xs px-4 py-1.5 rounded-xl transition-all font-semibold cursor-pointer"
                      >
                        {injecting ? <RefreshCw size={11} className="animate-spin" /> : <Zap size={11} />}
                        {injecting ? 'Instalando e Inyectando...' : 'Confirmar e Instalar Todo'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Contenido de la pestaña activa */}
                <div className="flex-1 overflow-y-auto max-h-[70vh] scrollbar-thin">
                  {loadingContent ? (
                    <div className="py-20 text-center space-y-3 text-[var(--color-text-muted)]">
                      <RefreshCw size={20} className="mx-auto animate-spin text-indigo-400" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Cargando documentación...</p>
                    </div>
                  ) : activeTab === 'docs' ? (
                    <div className="p-5">
                      {componentContent ? (
                        <MarkdownRenderer content={componentContent} searchTerm={searchTerm} />
                      ) : (
                        <div className="py-16 text-center text-[var(--color-text-muted)] text-xs space-y-2">
                          <FileText size={24} className="mx-auto opacity-30" />
                          <p>No hay documentación disponible para este componente.</p>
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'code' ? (
                    <div className="p-5">
                      {componentContent ? (
                        (() => {
                          const reactCode = extractReactCode(componentContent);
                          return reactCode ? (
                            <div className="relative bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden my-1 group">
                              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/60">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                                  React JSX
                                </span>
                                <CopyButton text={reactCode} label="Copiar Código React" size="sm" />
                              </div>
                              <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
                                <pre className="font-mono text-[10px] leading-relaxed text-slate-300 whitespace-pre">{reactCode}</pre>
                              </div>
                            </div>
                          ) : (
                            <div className="py-16 text-center text-[var(--color-text-muted)] text-xs space-y-2">
                              <AlertTriangle size={24} className="mx-auto text-amber-500 opacity-60" />
                              <p>No se pudo aislar un bloque de código React JSX en la documentación de este componente.</p>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="py-16 text-center text-[var(--color-text-muted)] text-xs space-y-2">
                          <Code2 size={24} className="mx-auto opacity-30" />
                          <p>No hay código disponible para este componente.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-5 h-full">
                      <ComponentSandbox 
                        componentName={selectedComponent.name} 
                        technicalName={selectedComponent.technicalName} 
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
