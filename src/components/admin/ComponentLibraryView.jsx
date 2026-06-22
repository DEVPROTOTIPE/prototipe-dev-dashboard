import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Search, Copy, RefreshCw, Terminal, Folder,
  FileText, Play, Code2, ChevronRight, Package, Sparkles,
  X, AlertTriangle, Check, Layers, Zap, Hash, List, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import ComponentSandbox, { COMPONENT_SANDBOX_MAP, getSandboxKey } from './ComponentSandbox';

const CLI_URL = 'http://localhost:3001';

// ─── Constantes ────────────────────────────────────────────────────────────────
const DETAIL_TABS = [
  { id: 'docs', label: 'Documentación', icon: FileText },
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

  // Estados para extracción de componentes
  const [showExtractForm, setShowExtractForm] = useState(false);
  const [extSourcePath, setExtSourcePath] = useState('');
  const [extTargetName, setExtTargetName] = useState('');
  const [extCategory, setExtCategory] = useState('');
  const [extDescription, setExtDescription] = useState('');
  const [extracting, setExtracting] = useState(false);

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

  useEffect(() => { fetchLibrary(); }, []);

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

  // ── Filtrado con contador ──
  const filteredCategories = categories
    .map(cat => ({
      ...cat,
      components: cat.components.filter(comp => {
        const matchesSearch = `${comp.name} ${comp.technicalName} ${comp.description} ${comp.category}`
          .toLowerCase().includes(searchTerm.toLowerCase());
        
        const hasSandbox = getSandboxKey(comp.name, comp.technicalName) !== null;

        const matchesSandbox = sandboxFilter === 'sandbox' ? hasSandbox : (sandboxFilter === 'docs' ? !hasSandbox : true);
        const matchesType = resourceFilter === 'all'
          ? true
          : (resourceFilter === 'module' ? comp.resourceType === 'module' : comp.resourceType !== 'module');

        return matchesSearch && matchesSandbox && matchesType;
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

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">

            {/* Buscador mejorado */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2.5 rounded-xl shadow-sm focus-within:border-indigo-500/50 transition-all flex items-center gap-2">
              <Search size={13} className="text-slate-500 shrink-0" />
              <input
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
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Filtros de Tipo de Recurso (Componentes vs Módulos) */}
            <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)]">
              <button
                onClick={() => setResourceFilter('all')}
                title="Todos los Recursos"
                className={`flex-grow py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  resourceFilter === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Layers size={13} />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">Todos</span>
              </button>
              <button
                onClick={() => setResourceFilter('component')}
                title="Solo Componentes"
                className={`flex-grow py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  resourceFilter === 'component'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Code2 size={13} />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">Componentes</span>
              </button>
              <button
                onClick={() => setResourceFilter('module')}
                title="Solo Módulos Completos"
                className={`flex-grow py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  resourceFilter === 'module'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Package size={13} />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">Módulos</span>
              </button>
            </div>

            {/* Filtros de Sandbox interactivos */}
            <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)]">
              <button
                onClick={() => setSandboxFilter('all')}
                title="Todos los Filtros"
                className={`flex-grow py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  sandboxFilter === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <List size={13} />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">Todos</span>
              </button>
              <button
                onClick={() => setSandboxFilter('sandbox')}
                title="Filtrar por Interactivos en Sandbox"
                className={`flex-grow py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  sandboxFilter === 'sandbox'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Eye size={13} />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">Sandbox</span>
              </button>
              <button
                onClick={() => setSandboxFilter('docs')}
                title="Filtrar por Solo Documentación"
                className={`flex-grow py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  sandboxFilter === 'docs'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md scale-[1.02]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <FileText size={13} />
                <span className="text-[8px] font-black uppercase tracking-wider leading-none">Solo Docs</span>
              </button>
            </div>

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

            {/* Árbol */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="p-3 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
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
                      <div key={cat.name} className="space-y-1">
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
                              className="overflow-hidden pl-3 space-y-0.5 border-l border-dashed border-indigo-500/15 ml-3.5"
                            >
                              {cat.components.map(comp => {
                                const isSelected = selectedComponent?.link === comp.link;
                                const hasSandbox = getSandboxKey(comp.name, comp.technicalName) !== null;
                                return (
                                  <button
                                    key={comp.link}
                                    onClick={() => setSelectedComponent(comp)}
                                    className={`w-full text-left p-2 rounded-xl text-xs transition-all cursor-pointer flex flex-col gap-0.5 ${
                                      isSelected
                                        ? 'bg-indigo-600/15 border border-indigo-500/40 text-[var(--color-text)] font-semibold'
                                        : 'border border-transparent hover:bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                    }`}
                                  >
                                    <div className="flex flex-col gap-0.5 w-full min-w-0">
                                      <div className="flex items-center gap-1.5 w-full min-w-0">
                                        {hasSandbox && <Eye size={11} className="text-indigo-400 shrink-0" title="Simulable en Sandbox" />}
                                        <span className="truncate flex-1 text-xs font-semibold text-[var(--color-text)] min-w-0">
                                          {searchTerm
                                            ? <HighlightText text={comp.name} term={searchTerm} />
                                            : comp.name
                                          }
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 w-full min-w-0 text-[9px] text-[var(--color-text-muted)]">
                                        {comp.resourceType === 'module' ? (
                                          <span className="text-[7px] font-black uppercase bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 px-1 py-0.5 rounded leading-none shrink-0">
                                            Módulo
                                          </span>
                                        ) : (
                                          <span className="text-[7px] font-black uppercase bg-slate-500/10 border border-slate-800 text-slate-400 px-1 py-0.5 rounded leading-none shrink-0">
                                            Comp
                                          </span>
                                        )}
                                        {comp.technicalName && (
                                          <span className="text-[7.5px] font-mono opacity-65 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1 py-0.5 rounded shrink-0 leading-none">
                                            {comp.technicalName}
                                          </span>
                                        )}
                                        {comp.description && (
                                          <span className="truncate flex-1 text-left opacity-75">
                                            {comp.description}
                                          </span>
                                        )}
                                      </div>
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

          {/* ── Panel Derecho ─────────────────────────────────────────────── */}
          <div className="lg:col-span-8 xl:col-span-9 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col min-h-[600px]">

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
                    {!loadingContent && allCode && (
                      <div className="flex items-center gap-2 shrink-0">
                        <CopyButton
                          text={allCode}
                          label="Copiar todo el código"
                          size="lg"
                          className="text-[10px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Pestañas */}
                  <div className="flex px-5 mt-3 gap-1">
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
                </div>

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
