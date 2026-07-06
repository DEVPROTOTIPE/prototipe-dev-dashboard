import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  BookOpen, Search, Copy, RefreshCw, Terminal, Folder,
  FileText, Play, Code2, ChevronRight, Package, Sparkles,
  X, AlertTriangle, Check, Layers, Zap, Hash, List, Eye, Maximize2, Minimize2,
  Shield, ChevronLeft, History, ArrowRight, CheckCircle2, XCircle, Loader2, FolderOpen, RotateCcw, Key,
  Clock, Filter, ChevronDown, ChevronUp, GitCompare, Box, Cpu, Diff, ArrowUpDown, Palette, Atom
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import ComponentSandbox, { COMPONENT_SANDBOX_MAP, getSandboxKey } from './ComponentSandbox';

import { CLI_URL } from '../../config';

// ─── Constantes ────────────────────────────────────────────────────────────────
const DETAIL_TABS = [
  { id: 'sandbox', label: 'Sandbox', icon: Play },
  { id: 'docs', label: 'Documentación', icon: FileText },
  { id: 'code', label: 'Código Fuente', icon: Code2 },
  { id: 'history', label: 'Historial', icon: History },
];

// ─── Normalización de Texto (ignora acentos y diacríticos) ───────────────────────
function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[._\-]/g, " ");
}

// ─── Distancia Levenshtein para errores ortográficos ─────────────────────────────
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ─── Puntuación de Relevancia para Búsqueda (CORE-195) ──────────────────────────
function getRelevanceScore(comp, query) {
  if (!query) return 0;
  
  const normQuery = normalizeText(query).trim().toLowerCase();
  const normName = normalizeText(comp.name || '').toLowerCase();
  const normTech = normalizeText(comp.technicalName || '').toLowerCase();
  const normDesc = normalizeText(comp.description || '').toLowerCase();
  const normCat = normalizeText(comp.category || '').toLowerCase();
  const normTags = (comp.tags || []).map(t => normalizeText(t).toLowerCase());

  let score = 0;

  // 1. Coincidencia exacta de nombre o nombre técnico (prioridad máxima)
  if (normName === normQuery || normTech === normQuery) {
    score += 10000;
  }
  
  // 2. Comienza con la consulta
  if (normName.startsWith(normQuery) || normTech.startsWith(normQuery)) {
    score += 5000;
  }

  // 3. Contiene la consulta de forma exacta
  if (normName.includes(normQuery)) {
    score += 3000;
  }
  if (normTech.includes(normQuery)) {
    score += 2000;
  }

  // 4. Coincidencias en los tokens individuales del query
  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 0);
  queryTokens.forEach(token => {
    if (normName.includes(token)) score += 500;
    if (normTech.includes(token)) score += 300;
    if (normDesc.includes(token)) score += 100;
    if (normCat.includes(token)) score += 50;
    if (normTags.some(t => t.includes(token))) score += 80;
  });

  // 5. Coincidencias en la descripción completa
  if (normDesc.includes(normQuery)) {
    score += 1000;
  }

  return score;
}

// ─── Comparación difusa e inteligente tolerante a ortografía ──────────────────────
function matchFuzzySearch(text, query) {
  if (!query) return true;
  if (!text) return false;

  const normQuery = normalizeText(query).trim();
  const normText = normalizeText(text);

  if (!normQuery) return true;

  // 1. Coincidencia continua exacta (normalizada)
  if (normText.includes(normQuery)) return true;

  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 0);
  const textTokens = normText.split(/\s+/).filter(t => t.length > 0);

  // Cada token del query debe estar presente de forma exacta o difusa
  return queryTokens.every(qToken => {
    if (qToken.length <= 2) {
      return normText.includes(qToken);
    }
    return textTokens.some(tToken => {
      if (tToken.includes(qToken) || qToken.includes(tToken)) return true;
      const maxDistance = qToken.length <= 4 ? 1 : 2;
      return getLevenshteinDistance(qToken, tToken) <= maxDistance;
    });
  });
}

// ─── Highlight de término de búsqueda tolerante a acentos y errores ───────────────
function HighlightText({ text, term }) {
  if (!term || !text) return <span>{text}</span>;

  const normText = normalizeText(text);
  const normTerm = normalizeText(term).trim();

  if (!normTerm) return <span>{text}</span>;

  // Intentamos coincidencia continua exacta
  const index = normText.indexOf(normTerm);
  if (index !== -1) {
    const before = text.slice(0, index);
    const match = text.slice(index, index + normTerm.length);
    const after = text.slice(index + normTerm.length);
    return (
      <span>
        {before}
        <mark className="bg-indigo-500/30 text-indigo-300 rounded px-0.5">{match}</mark>
        {after}
      </span>
    );
  }

  // Si no coincide continuo, intentamos resaltar palabras sueltas
  const words = normTerm.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return <span>{text}</span>;

  const makeAccentsInsensitive = (str) => {
    return str
      .replace(/[aáàäâ]/gi, '[aáàäâ]')
      .replace(/[eéèëê]/gi, '[eéèëê]')
      .replace(/[iíìïî]/gi, '[iíìïî]')
      .replace(/[oóòöô]/gi, '[oóòöô]')
      .replace(/[uúùüû]/gi, '[uúùüû]')
      .replace(/[nñ]/gi, '[nñ]');
  };

  const escapedWords = words.map(w => makeAccentsInsensitive(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const flexiblePattern = escapedWords.join('|');

  try {
    const regex = new RegExp(`(${flexiblePattern})`, 'gi');
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
  } catch (e) {
    return <span>{text}</span>;
  }
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

// ─── Selector Personalizado Premium (CustomSelect) ───────────────────────────
function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  size = 'md',
  className = '',
  triggerClassName = '',
  dropdownClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value) || { label: placeholder, value: '' };
  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl outline-none focus:border-indigo-500 hover:border-slate-500 transition-all cursor-pointer select-none ${
          isSmall ? 'px-2.5 py-1.5 text-[9px]' : 'px-3.5 py-2.5 text-xs'
        } ${triggerClassName}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedOption.icon && <span className="shrink-0 flex items-center">{selectedOption.icon}</span>}
          <span className="truncate text-left flex flex-col">
            <span className="truncate">{selectedOption.label || placeholder}</span>
            {selectedOption.subLabel && (
              <span className={`text-[8px] text-[var(--color-text-muted)] truncate ${isSmall ? '' : 'mt-0.5'}`}>{selectedOption.subLabel}</span>
            )}
          </span>
        </span>
        <ChevronDown size={isSmall ? 11 : 14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`absolute z-50 w-full mt-1 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar ${dropdownClassName}`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 text-left transition-colors hover:bg-indigo-600/10 cursor-pointer ${
                    isSmall ? 'px-2.5 py-1.5 text-[9px]' : 'px-3.5 py-2.5 text-xs'
                  } ${
                    isSelected ? 'text-indigo-400 font-bold bg-indigo-600/5' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {option.icon && <span className="shrink-0 flex items-center">{option.icon}</span>}
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.subLabel && (
                      <span className="block text-[8px] text-[var(--color-text-muted)] truncate font-normal mt-0.5">{option.subLabel}</span>
                    )}
                  </span>
                  {isSelected && <span className="text-indigo-400 font-bold shrink-0">●</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

// ─── Extractor de manifiesto JSON (metadata header) de la ficha técnica ────────
function extractManifest(md) {
  if (!md) return null;
  const match = md.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// ─── Genera la ruta de destino por defecto para la auto-inyección ────────────
function getDefaultRelativePath(comp, manifest = null) {
  if (!comp) return '';

  // Capa 1: Si hay un manifiesto parseado con targetPath válido, esa es la verdad absoluta
  if (manifest && typeof manifest.targetPath === 'string' && manifest.targetPath.trim() !== '') {
    return manifest.targetPath.trim();
  }

  // Capa 2: Resiliencia ante objetos incompletos o sin metadata
  const compName = comp.technicalName || comp.name || 'Component';
  const cleanName = compName.replace(/[^a-zA-Z0-9]/g, '');
  const mdLink = comp.link || '';
  const mdLower = mdLink.toLowerCase();
  const nameLower = cleanName.toLowerCase();

  // Normalización de Hooks (use[Nombre])
  if (mdLower.includes('/logica_y_hooks/') || mdLower.includes('hook') || nameLower.startsWith('use')) {
    let hookName = cleanName;
    if (nameLower.startsWith('use')) {
      // Normalizar para que empiece con "use" en minúsculas y luego camelCase
      hookName = 'use' + cleanName.slice(3).charAt(0).toUpperCase() + cleanName.slice(4);
    } else {
      hookName = 'use' + cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    return `src/hooks/${hookName}.js`;
  }

  // Normalización de Servicios
  if (mdLower.includes('/servicios_y_firebase/') || mdLower.includes('service')) {
    let serviceName = cleanName;
    if (nameLower.endsWith('service')) {
      serviceName = cleanName.slice(0, cleanName.length - 7) + 'Service';
    } else {
      serviceName = cleanName + 'Service';
    }
    // Asegurar minúscula inicial para servicios
    serviceName = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
    return `src/services/${serviceName}.js`;
  }

  // Normalización de Utilidades
  if (mdLower.includes('/utilidades/') || mdLower.includes('util')) {
    const utilName = cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
    return `src/utils/${utilName}.js`;
  }

  // Normalización de Páginas
  if (mdLower.includes('/paginas/') || mdLower.includes('page')) {
    let pageName = cleanName;
    if (nameLower.endsWith('page')) {
      pageName = cleanName.slice(0, cleanName.length - 4) + 'Page';
    } else {
      pageName = cleanName + 'Page';
    }
    return `src/pages/${pageName}.jsx`;
  }

  // Módulos Completos
  if (comp.resourceType === 'module' || mdLower.includes('/modulos_completos/')) {
    return `src/components/common/${cleanName}.jsx`;
  }

  // Componentes de negocio sectoriales → common (nunca ui/)
  const SECTOR_VERTICALS = [
    '/contractors/', '/carpentry/', '/machinery_rental/',
    '/refrigeration_ac/', '/technical_services/', '/wellness_podology/',
    '/grocery_food/', '/laundry/', '/furniture_repair/',
    '/insumos-agricolas/', '/alimentos-artesanales/', '/ferreteria-rural/',
    '/repuestos-motos/', '/distribuidoras-beauty/', '/petshops-locales/',
    '/repuestos-lineablanca/', '/moda-local-calzado/', '/alimentacion-saludable/',
    '/licores-cocteleria/', '/coleccionismo-geek/', '/distribucion-horeca/',
    '/home-office-ergonomia/',
  ];
  if (SECTOR_VERTICALS.some(v => mdLower.includes(v))) {
    return `src/components/common/${cleanName}.jsx`;
  }

  // Componentes de Interfaz (átomos y moléculas puros)
  return `src/components/ui/${cleanName}.jsx`;
}

// ─── Genera la sentencia de import estratégica según tipo de recurso ──────────
function generateStrategicImport(compName, rawPath, manifest, comp) {
  // Normalizar path
  let importPath = rawPath;
  if (importPath.startsWith('src/')) importPath = importPath.slice(4);
  importPath = importPath.replace(/\.(jsx|js|tsx|ts)$/, '');

  const resourceType = (manifest?.type || comp?.resourceType || 'component').toLowerCase();
  const pathLower = importPath.toLowerCase();

  // Hooks → named import
  if (resourceType === 'hook' || pathLower.includes('/hooks/') || compName.startsWith('use')) {
    return `import { ${compName} } from '@/${importPath}';`;
  }

  // Services → named import
  if (resourceType === 'service' || pathLower.includes('/services/')) {
    return `import { ${compName} } from '@/${importPath}';`;
  }

  // Utils → named import
  if (resourceType === 'util' || resourceType === 'utility' || pathLower.includes('/utils/')) {
    return `import { ${compName} } from '@/${importPath}';`;
  }

  // Componentes y páginas → default import
  return `import ${compName} from '@/${importPath}';`;
}

export default function ComponentLibraryView({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentContent, setComponentContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [activeTab, setActiveTab] = useState('sandbox');
  const [sandboxFilter, setSandboxFilter] = useState('all'); // 'all' | 'sandbox' | 'docs'
  const [resourceFilter, setResourceFilter] = useState('all'); // 'all' | 'component' | 'module' | 'hook' | 'service' | 'atom'
  const [expandedCat, setExpandedCat] = useState(null);

  // Estado para nichos dinámicos (mantenido para compatibilidad con la carga de datos)
  const [niches, setNiches] = useState({});

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
  const [injectStep, setInjectStep] = useState(1); // 1: configurar, 2: diagnosticar, 3: instalar
  const [injectTargetClient, setInjectTargetClient] = useState('');
  const [injectRelativePath, setInjectRelativePath] = useState('');
  const [injecting, setInjecting] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [clients, setClients] = useState([]);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnoseResult, setDiagnoseResult] = useState(null);
  const [preflightResult, setPreflightResult] = useState(null);
  const [preflighting, setPreflighting] = useState(false);
  const [injectLog, setInjectLog] = useState([]); // pasos SSE en vivo
  const [injectDone, setInjectDone] = useState(false);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(false);
  // CORE-123: Estados enriquecidos del wizard
  const [targetStack, setTargetStack] = useState(null);       // stack detectado del cliente destino
  const [envVarsMissing, setEnvVarsMissing] = useState([]);   // vars de entorno faltantes
  const [integrationSnippet, setIntegrationSnippet] = useState(null); // snippet de uso post-install
  const [buildPhase, setBuildPhase] = useState(null);         // 'running'|'success'|'error'|null
  const [clientRegistry, setClientRegistry] = useState(null); // inventario de componentes instalados
  const [showInventory, setShowInventory] = useState(false);  // toggle panel inventario
  const [envVarsValues, setEnvVarsValues] = useState({});     // CORE-126: valores ingresados por el usuario para env vars
  // CORE-127: Estado de auditoría
  const [auditTrail, setAuditTrail] = useState([]);          // entradas del historial paginadas
  const [cssDoctorLoading, setCssDoctorLoading] = useState(false);

  // Asistentes de Comandos de IA Híbridos
  const [iaCreateName, setIaCreateName] = useState('');
  const [iaCreateCategory, setIaCreateCategory] = useState('Formularios_y_UI');
  const [iaCreatePrompt, setIaCreatePrompt] = useState('');
  const [iaExtractPrompt, setIaExtractPrompt] = useState('');
  const [isIaCreateExpanded, setIsIaCreateExpanded] = useState(false);
  const [isIaExtractExpanded, setIsIaExtractExpanded] = useState(false);
  const [cssDoctorSuccess, setCssDoctorSuccess] = useState(false);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilter, setAuditFilter] = useState({ operation: '', status: '', search: '' });
  const [auditSelectedEntry, setAuditSelectedEntry] = useState(null);
  const [auditDiff, setAuditDiff] = useState(null);
  const [auditDiffLoading, setAuditDiffLoading] = useState(false);


  const searchInputRef = useRef(null);

  const categoryOptions = useMemo(() => {
    return [
      { value: '', label: '-- Seleccionar Categoría --' },
      ...categories.map(c => {
        const val = c.folder ? c.folder.split('/').pop() : c.name;
        return { value: val, label: c.name };
      })
    ];
  }, [categories]);

  const clientOptions = useMemo(() => {
    return [
      { value: '', label: '-- Seleccionar Cliente --' },
      ...clients.map(c => ({
        value: c.name,
        label: c.name,
        subLabel: c.branch ? `Rama: ${c.branch}` : null,
        icon: <FolderOpen size={12} className="text-emerald-400" />
      }))
    ];
  }, [clients]);

  const auditOperationOptions = [
    { value: '', label: 'Todas las operaciones' },
    { value: 'inject', label: 'Inyección', icon: '📦' },
    { value: 'rollback', label: 'Rollback', icon: '↩️' },
    { value: 'auto-rollback', label: 'Auto-rollback', icon: '🛡️' }
  ];

  const auditStatusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'success', label: 'Éxito', icon: '✅' },
    { value: 'error', label: 'Error', icon: '❌' }
  ];

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

  // CORE-127: Cargar historial de auditoría cuando se activa la pestaña
  const loadAuditTrail = useCallback(async (page = 1, filters = auditFilter) => {
    if (!injectTargetClient) return;
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({
        clientId: injectTargetClient,
        page: String(page),
        limit: '10',
        ...(filters.operation ? { operation: filters.operation } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.search ? { search: filters.search } : {}),
      });
      const res = await fetch(`${CLI_URL}/api/library/inject/audit-trail?${params}`);
      const data = await res.json();
      setAuditTrail(data.entries || []);
      setAuditTotal(data.total || 0);
      setAuditPage(data.page || 1);
      setAuditTotalPages(data.totalPages || 1);
    } catch (err) {
      console.warn('[CORE-127] Error loading audit trail:', err.message);
    } finally {
      setAuditLoading(false);
    }
  }, [injectTargetClient, auditFilter]);

  useEffect(() => {
    if (activeTab === 'history' && injectTargetClient) {
      loadAuditTrail(1, auditFilter);
    }
  }, [activeTab, injectTargetClient]);

  const loadAuditDiff = async (componentId) => {
    if (!injectTargetClient || !componentId) return;
    setAuditDiffLoading(true);
    setAuditDiff(null);
    try {
      const res = await fetch(`${CLI_URL}/api/library/inject/audit-diff?clientId=${encodeURIComponent(injectTargetClient)}&componentId=${encodeURIComponent(componentId)}`);
      const data = await res.json();
      setAuditDiff(data);
    } catch (err) {
      console.warn('[CORE-127] Error loading diff:', err.message);
    } finally {
      setAuditDiffLoading(false);
    }
  };

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

  const updateSuggestedPath = async (clientId) => {
    if (!clientId || !selectedComponent?.link) return;
    try {
      const res = await fetch(`${CLI_URL}/api/library/inject/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentLink: selectedComponent.link, clientId })
      });
      const data = await res.json();
      if (data.suggestedPath) {
        setInjectRelativePath(data.suggestedPath);
      }
    } catch (err) {
      console.error("Error al obtener ruta sugerida:", err);
    }
  };

  const handleCSSDoctor = async () => {
    if (!injectTargetClient || !targetStack?.cssVarsMissing || targetStack.cssVarsMissing.length === 0) return;
    setCssDoctorLoading(true);
    try {
      const res = await fetch(`${CLI_URL}/api/library/inject/css-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: injectTargetClient,
          cssVarsMissing: targetStack.cssVarsMissing
        })
      });
      const data = await res.json();
      if (data.success) {
        setCssDoctorSuccess(true);
        // Autocurar localmente los estados para limpiar advertencias
        setTargetStack(prev => ({
          ...prev,
          cssVarsDefined: [...(prev.cssVarsDefined || []), ...(prev.cssVarsMissing || [])],
          cssVarsMissing: []
        }));
      } else {
        alert(data.error || 'Ocurrió un error al aplicar CSS Doctor.');
      }
    } catch (err) {
      alert(`Error de red: ${err.message}`);
    } finally {
      setCssDoctorLoading(false);
    }
  };

  const fetchClientRegistry = async (clientId) => {
    if (!clientId) return;
    try {
      const res = await fetch(`${CLI_URL}/api/library/inject/registry?clientId=${clientId}`);
      const data = await res.json();
      if (data.success) {
        setClientRegistry(data.registry || { components: [] });
      } else {
        setClientRegistry(null);
      }
    } catch (err) {
      console.error("Error al obtener inventario del cliente:", err);
      setClientRegistry(null);
    }
  };

  const handleRollback = async (componentId) => {
    if (!injectTargetClient || !componentId) return;
    try {
      const res = await fetch(`${CLI_URL}/api/library/inject/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: injectTargetClient, componentId })
      });
      const data = await res.json();
      if (data.success) {
        showToast?.('¡Componente restaurado con éxito desde el backup!', 'success');
        fetchClientRegistry(injectTargetClient); // refrescar inventario
      } else {
        throw new Error(data.error || 'Fallo al restaurar backup');
      }
    } catch (err) {
      showToast?.(err.message, 'error');
    }
  };

  const toggleCategory = useCallback((key) => {
    setExpandedCat(prev => prev === key ? null : key);
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

  const fetchNiches = async () => {
    try {
      const res = await fetch(`${CLI_URL}/api/niches`);
      const data = await res.json();
      if (data && !data.error) {
        setNiches(data);
      }
    } catch (err) {
      console.warn('[Fetch Niches] Error:', err);
    }
  };

  useEffect(() => {
    fetchLibrary();
    fetchClients();
    fetchNiches();
  }, []);

  // Contraer categorías al cambiar filtros de tipo, sandbox, tag o nicho
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
    setActiveTab('sandbox');
    // Resetear el wizard al cambiar de componente
    setShowInjectPanel(false);
    setInjectStep(1);
    setDiagnoseResult(null);
    setPreflightResult(null);
    setInjectLog([]);
    setInjectDone(false);
    setOverwrite(false);
    // CORE-123: limpiar estados enriquecidos
    setTargetStack(null);
    setEnvVarsMissing([]);
    setIntegrationSnippet(null);
    setBuildPhase(null);
    setClientRegistry(null);
    setShowInventory(false);
  }, [selectedComponent]);

  // Obtener todas las etiquetas únicas presentes en el catálogo (incluyendo slugs de nicho como tags)
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    categories.forEach(cat => {
      cat.components?.forEach(comp => {
        comp.tags?.forEach(tag => {
          // Excluir solo los typeKeys de grupo para no duplicar los botones de tipo
          const typeKeys = ['component', 'module', 'hook', 'service', 'atom'];
          if (!typeKeys.includes(tag)) {
            tagsSet.add(tag);
          }
        });
      });
    });
    return Array.from(tagsSet).sort();
  }, [categories]);

  // ── Filtrado con contador y Ordenación por Relevancia (CORE-195) ──
  const filteredCategories = useMemo(() => {
    const mapped = categories
      .map(cat => {
        const filteredComps = cat.components.filter(comp => {
          const tagsText = (comp.tags || []).join(' ');
          const searchTextContainer = `${comp.name} ${comp.technicalName} ${comp.description} ${comp.category} ${tagsText}`;
          const matchesSearch = matchFuzzySearch(searchTextContainer, searchTerm);

          const hasSandbox = getSandboxKey(comp.name, comp.technicalName) !== null;
          const matchesSandbox = sandboxFilter === 'sandbox' ? hasSandbox : (sandboxFilter === 'docs' ? !hasSandbox : true);

          const matchesType = resourceFilter === 'all' ? true : comp.resourceType === resourceFilter;
          const matchesTag = !selectedTag || (comp.tags && comp.tags.includes(selectedTag));

          return matchesSearch && matchesSandbox && matchesType && matchesTag;
        });

        // Si hay término de búsqueda, calcular scores y ordenar componentes internamente
        let sortedComps = filteredComps;
        let maxScore = 0;
        if (searchTerm) {
          const compsWithScore = filteredComps.map(comp => {
            const score = getRelevanceScore(comp, searchTerm);
            if (score > maxScore) maxScore = score;
            return { ...comp, relevanceScore: score };
          });
          
          compsWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);
          sortedComps = compsWithScore;
        }

        return {
          ...cat,
          components: sortedComps,
          maxRelevanceScore: maxScore
        };
      })
      .filter(cat => cat.components.length > 0);

    // Si hay término de búsqueda, ordenar también las categorías para subir las más relevantes arriba
    if (searchTerm) {
      mapped.sort((a, b) => b.maxRelevanceScore - a.maxRelevanceScore);
    }

    return mapped;
  }, [categories, searchTerm, sandboxFilter, resourceFilter, selectedTag]);

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
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Categoría del Catálogo</label>
              <CustomSelect
                options={categoryOptions}
                value={extCategory}
                onChange={setExtCategory}
                placeholder="-- Seleccionar Categoría --"
              />
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
                    setResourceFilter('all');
                    setSelectedTag(null);
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

            {/* Selector de nicho eliminado: los nichos ahora son tags clicables en la nube */}

            {/* Filtros de Tipo de Recurso */}
            <div className="flex bg-[var(--color-surface-2)]/60 p-1 rounded-xl border border-[var(--color-border)] gap-1 overflow-x-auto custom-scrollbar shrink-0">
              <button
                onClick={() => setResourceFilter('all')}
                title="Todos los Recursos"
                className={`py-1.5 px-2.5 flex items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
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
                title="Solo Componentes UI"
                className={`py-1.5 px-2.5 flex items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                  resourceFilter === 'component'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Code2 size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">UI</span>
              </button>
              <button
                onClick={() => setResourceFilter('atom')}
                title="Solo Componentes Atómicos"
                className={`py-1.5 px-2.5 flex items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                  resourceFilter === 'atom'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Atom size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Átomos</span>
              </button>
              <button
                onClick={() => setResourceFilter('module')}
                title="Solo Módulos Completos"
                className={`py-1.5 px-2.5 flex items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                  resourceFilter === 'module'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Package size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Módulos</span>
              </button>
              <button
                onClick={() => setResourceFilter('hook')}
                title="Solo Hooks de Estado"
                className={`py-1.5 px-2.5 flex items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                  resourceFilter === 'hook'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Cpu size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Hooks</span>
              </button>
              <button
                onClick={() => setResourceFilter('service')}
                title="Solo Servicios y Conectores"
                className={`py-1.5 px-2.5 flex items-center justify-center gap-1 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 whitespace-nowrap ${
                  resourceFilter === 'service'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-indigo-500/10'
                }`}
              >
                <Zap size={11} className="shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Servicios</span>
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

            {/* Asistente de Creación con IA (Comando Híbrido) */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm transition-all duration-300 relative z-[60]">
              <button 
                onClick={() => setIsIaCreateExpanded(!isIaCreateExpanded)}
                className="w-full px-4 py-3 bg-[var(--color-surface-2)]/40 hover:bg-[var(--color-surface-2)] flex items-center justify-between border-b border-[var(--color-border)] cursor-pointer text-left rounded-t-xl"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5 select-none">
                  <Sparkles size={12} className="text-indigo-400" />
                  Creador con IA (Comando)
                </span>
                <span className="text-[10px] text-indigo-400 font-bold hover:underline">
                  {isIaCreateExpanded ? 'Contraer' : 'Expandir'}
                </span>
              </button>

              {isIaCreateExpanded && (
                <div className="p-3.5 space-y-3.5 tab-content-enter">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)]">Nombre del Componente</label>
                    <input 
                      type="text"
                      value={iaCreateName}
                      onChange={e => setIaCreateName(e.target.value.replace(/\s+/g, ''))}
                      placeholder="Ej: BotonPremium"
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 group relative">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)]">Categoría de Destino</label>
                      <svg className="w-3 h-3 text-[var(--color-text-muted)] cursor-help hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                      </svg>
                      
                      {/* Tooltip explicativo */}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-[70] w-64 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl text-[9px] text-slate-300 leading-relaxed space-y-1.5 animate-scale-up">
                        <span className="font-bold text-indigo-400 block">💡 Guía de Selección Rápida</span>
                        <p>Esta categoría le dice a la IA dónde debe guardar tu componente y cómo debe estructurar su código:</p>
                        <ul className="list-disc pl-3.5 space-y-1">
                          <li><strong>Formularios y UI:</strong> Para botones, inputs o elementos interactivos de pantalla.</li>
                          <li><strong>Lógica y Hooks:</strong> Para custom hooks o stores de Zustand sin interfaz visual.</li>
                          <li><strong>Módulos Completos:</strong> Para pantallas o flujos enteros de negocio.</li>
                          <li><strong>Servicios y Firebase:</strong> Para conectar con bases de datos en la nube.</li>
                          <li><strong>Utilidades:</strong> Para scripts de formato, fórmulas o convertidores rápidos.</li>
                        </ul>
                      </div>
                    </div>
                    <CustomSelect
                      value={iaCreateCategory}
                      onChange={setIaCreateCategory}
                      options={[
                        {
                          value: 'Formularios_y_UI',
                          label: 'Formularios y UI',
                          subLabel: 'Para elementos interactivos simples de pantalla. Ej: botones premium, campos de texto, selectores de fecha.'
                        },
                        {
                          value: 'Logica_y_Hooks',
                          label: 'Lógica y Hooks',
                          subLabel: 'Para lógica pura de comportamiento o estados sin diseño. Ej: guardar datos en el navegador, temporizadores.'
                        },
                        {
                          value: 'Modulos_Completos',
                          label: 'Módulos Completos',
                          subLabel: 'Para pantallas grandes o flujos de negocio enteros. Ej: agenda de citas, carrito de compras, caja diaria.'
                        },
                        {
                          value: 'Servicios_y_Firebase',
                          label: 'Servicios y Firebase',
                          subLabel: 'Para interactuar con la base de datos o inicios de sesión. Ej: guardar ventas en la nube, perfiles.'
                        },
                        {
                          value: 'Utilidades',
                          label: 'Utilidades',
                          subLabel: 'Para pequeños scripts de cálculo o formatos. Ej: convertidores de moneda, formateadores de fechas.'
                        }
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)]">Requerimientos / Prompt</label>
                    <textarea
                      rows={3}
                      value={iaCreatePrompt}
                      onChange={e => setIaCreatePrompt(e.target.value)}
                      placeholder="Ej: Un selector de fecha con efecto de brillo HSL y animaciones suaves con Framer Motion."
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Comando Generado */}
                  {iaCreateName && iaCreatePrompt && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Comando de Automatización</span>
                      <div className="flex items-center justify-between gap-2 bg-slate-950 px-2.5 py-2 border border-slate-800 rounded-lg">
                        <code className="font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-none select-all">
                          {`@crear-componente "${iaCreateCategory}" "${iaCreateName}" "${iaCreatePrompt.replace(/"/g, '\\"')}"`}
                        </code>
                        <button
                          onClick={() => {
                            const cmd = `@crear-componente "${iaCreateCategory}" "${iaCreateName}" "${iaCreatePrompt.replace(/"/g, '\\"')}"`;
                            navigator.clipboard.writeText(cmd);
                            showToast('Comando copiado. Pégalo en tu chat con Antigravity ✓', { type: 'success' });
                          }}
                          className="p-1 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-indigo-400 cursor-pointer flex items-center justify-center shrink-0"
                          title="Copiar comando al portapapeles"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                      <span className="text-[9px] text-[var(--color-text-muted)] italic block leading-relaxed">
                        Copia este comando y pégalo en el chat. La IA generará el componente y su sandbox automáticamente.
                      </span>
                    </div>
                  )}
                </div>
              )}
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

            {/* Árbol por Tipo — siempre expandido, agrupado por UI/Módulos/Hooks/Servicios */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="p-3 space-y-3.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {filteredCategories.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Search size={20} className="mx-auto text-[var(--color-text-muted)] opacity-30" />
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      Sin resultados{searchTerm ? ` para "${searchTerm}"` : ''}
                    </p>
                  </div>
                ) : (
                  filteredCategories.map(cat => {
                    // Determinar estilos por typeKey — activeBorder con clases Tailwind válidas
                    const typeStyles = {
                      atom:      { icon: '⚛️', color: 'text-rose-400',    bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   activeBorder: 'border-rose-400/50' },
                      component: { icon: '🧩', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', activeBorder: 'border-violet-400/50' },
                      module:    { icon: '📦', color: 'text-amber-400',   bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  activeBorder: 'border-amber-400/50' },
                      hook:      { icon: '⚡', color: 'text-sky-400',     bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    activeBorder: 'border-sky-400/50' },
                      service:   { icon: '🔌', color: 'text-emerald-400', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',activeBorder: 'border-emerald-400/50' },
                    };
                    const style = typeStyles[cat.typeKey] || typeStyles.component;
                    // expandedCat = string de la categoría activa abierta (acordeón exclusivo). Si es null, todas están contraídas.
                    // Si hay un término de búsqueda activo, ignorar el colapso para mostrar los resultados de inmediato.
                    const isCollapsed = !searchTerm && expandedCat !== (cat.typeKey || cat.name);

                    return (
                      <div key={cat.typeKey || cat.name} className="space-y-1.5">
                        {/* Encabezado colapsable */}
                        <button
                          onClick={() => toggleCategory(cat.typeKey || cat.name)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl ${style.bg} border ${style.border} hover:opacity-90 transition-opacity cursor-pointer text-left`}
                        >
                          <ChevronRight
                            size={10}
                            className={`${style.color} transition-transform duration-200 shrink-0 ${isCollapsed ? '' : 'rotate-90'}`}
                          />
                          <span className="text-sm leading-none shrink-0">{cat.icon || style.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${style.color}`}>
                              {cat.name}
                            </span>
                            {cat.description && !isCollapsed && (
                              <p className="text-[8px] text-[var(--color-text-muted)] truncate mt-0.5">{cat.description}</p>
                            )}
                          </div>
                          <span className={`${style.bg} ${style.color} px-1.5 py-0.5 rounded-full text-[8px] font-black shrink-0 border ${style.border}`}>
                            {cat.components.length}
                          </span>
                        </button>

                        {/* Lista de componentes con animación */}
                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1, transition: { height: { type: 'spring', damping: 25, stiffness: 220 }, opacity: { duration: 0.15 } } }}
                              exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.18 }, opacity: { duration: 0.1 } } }}
                              className="overflow-hidden pl-3 pr-1 py-1 space-y-1.5 border-l-2 border-dashed border-[var(--color-border)] ml-3.5"
                            >
                              {cat.components.map(comp => {
                                const isSelected = selectedComponent?.link === comp.link;
                                const hasSandbox = getSandboxKey(comp.name, comp.technicalName) !== null;
                                const nicheChips = (comp.niches || []).slice(0, 2);
                                return (
                                  <button
                                    key={comp.link}
                                    onClick={() => setSelectedComponent(comp)}
                                    className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 shadow-sm ${
                                      isSelected
                                        ? `${style.bg} ${style.activeBorder} text-[var(--color-text)] font-semibold scale-[1.01]`
                                        : 'bg-[var(--color-surface-2)]/30 backdrop-blur-sm border-[var(--color-border)]/65 hover:bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-indigo-500/25 hover:scale-[1.01]'
                                    }`}
                                  >
                                    {/* Fila 1: nombre + badge LIVE */}
                                    <div className="flex items-start justify-between gap-2 w-full min-w-0">
                                      <span className="truncate text-xs font-bold text-[var(--color-text)] min-w-0">
                                        {searchTerm
                                          ? <HighlightText text={comp.name} term={searchTerm} />
                                          : comp.name
                                        }
                                      </span>
                                      {hasSandbox && (
                                        <span className="px-1 py-0.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded text-[7px] font-black shrink-0 leading-none" title="Sandbox Disponible">
                                          LIVE
                                        </span>
                                      )}
                                    </div>

                                    {/* Fila 2: nombre técnico + chips de nicho */}
                                    <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
                                      {comp.technicalName ? (
                                        <span className="text-[8px] font-mono opacity-70 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.5 rounded leading-none shrink-0 truncate max-w-[55%]">
                                          {comp.technicalName}
                                        </span>
                                      ) : <span />}

                                      {nicheChips.length > 0 && (
                                        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                                          {nicheChips.map(n => (
                                            <span
                                              key={n}
                                              className="px-1 py-0.5 text-[7px] font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded leading-none"
                                            >
                                              {n.replace(/_/g, '-')}
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
                            setEnvVarsValues({}); // CORE-126: resetear valores
                            if (selectedComponent) {
                              const manifest = extractManifest(componentContent);
                              setInjectRelativePath(getDefaultRelativePath(selectedComponent, manifest));
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

                {/* ═══════════════════════════════════════════════════════════
                    MODAL WIZARD: Instalar en Cliente (3 pasos)
                ═══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                {showInjectPanel && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={e => { if (e.target === e.currentTarget && !injecting) { setShowInjectPanel(false); setInjectStep(1); } }}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                      className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden"
                    >
                      {/* Header del modal */}
                      <div className="px-6 pt-5 pb-4 bg-emerald-500/5 border-b border-emerald-500/15 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                            <Shield size={16} className="text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-[var(--color-text)]">Instalar en Cliente</h3>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate max-w-[280px]">{selectedComponent.name}</p>
                          </div>
                        </div>
                        <button onClick={() => { if (!injecting) { setShowInjectPanel(false); setInjectStep(1); } }}
                          className="p-1.5 rounded-xl hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer">
                          <X size={14} />
                        </button>
                      </div>

                      {/* Indicador de pasos */}
                      <div className="px-6 py-3 flex items-center gap-2 border-b border-[var(--color-border)]/40">
                        {[{ n: 1, label: 'Configurar' }, { n: 2, label: 'Verificar' }, { n: 3, label: 'Instalar' }].map(({ n, label }, idx) => (
                          <React.Fragment key={n}>
                            <div className={`flex items-center gap-1.5 ${
                              injectStep === n ? 'text-emerald-400' :
                              injectStep > n ? 'text-emerald-600' : 'text-[var(--color-text-muted)]'
                            }`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                                injectStep === n ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' :
                                injectStep > n ? 'bg-emerald-500/30 border-emerald-600 text-emerald-400' :
                                'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                              }`}>
                                {injectStep > n ? <Check size={9} /> : n}
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:block">{label}</span>
                            </div>
                            {idx < 2 && <div className={`flex-1 h-px transition-colors ${ injectStep > n ? 'bg-emerald-600' : 'bg-[var(--color-border)]' }`} />}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* ─── PASO 1: Configurar ─── */}
                      {injectStep === 1 && (
                        <div className="p-6 space-y-4">
                          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                            Selecciona el proyecto cliente y confirma la ruta destino donde se creará el archivo.
                          </p>
                          {/* Selector de cliente */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <FolderOpen size={10} className="text-emerald-400" />
                              Proyecto Destino (Cliente)
                            </label>
                            <CustomSelect
                              options={clientOptions}
                              value={injectTargetClient}
                              onChange={val => {
                                setInjectTargetClient(val);
                                setPreflightResult(null);
                                updateSuggestedPath(val);
                                fetchClientRegistry(val);
                              }}
                              placeholder="-- Seleccionar Cliente --"
                              triggerClassName="focus:border-emerald-500"
                            />
                          </div>

                          {/* CORE-123: Inventario de Componentes Instalados */}
                          {injectTargetClient && clientRegistry && clientRegistry.components && clientRegistry.components.length > 0 && (
                            <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-2)]/30 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setShowInventory(prev => !prev)}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-500/5 transition-colors cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Package size={12} className="text-indigo-400" />
                                  Componentes Instalados ({clientRegistry.components.length})
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {showInventory ? 'Ocultar' : 'Ver Lista'}
                                </span>
                              </button>
                              {showInventory && (
                                <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-1)]/40 max-h-[160px] overflow-y-auto space-y-2 custom-scrollbar">
                                  {clientRegistry.components.map((comp) => (
                                    <div key={comp.id} className="flex items-center justify-between text-[10px] bg-[var(--color-surface-2)]/40 p-2 rounded-lg border border-[var(--color-border)]/50">
                                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-slate-300 truncate">{comp.name}</span>
                                          <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-semibold ${
                                            comp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                                            comp.status === 'modified' ? 'bg-amber-500/10 text-amber-400' :
                                            comp.status === 'rolledback' ? 'bg-indigo-500/10 text-indigo-400' :
                                            'bg-red-500/10 text-red-400'
                                          }`}>
                                            {comp.status}
                                          </span>
                                        </div>
                                        <p className="text-[8px] text-slate-500 font-mono truncate" title={comp.targetPath}>{comp.targetPath}</p>
                                      </div>
                                      {comp.backupPath && comp.status !== 'rolledback' && (
                                        <button
                                          type="button"
                                          onClick={() => handleRollback(comp.id)}
                                          className="text-[9px] bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
                                          title="Restaurar backup previo a la inyección"
                                        >
                                          <RotateCcw size={9} /> Revertir
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ruta destino */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ruta Relativa en el Proyecto</label>
                            <input
                              type="text"
                              className="w-full bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--color-text)] outline-none focus:border-emerald-500 transition-colors"
                              value={injectRelativePath}
                              onChange={e => { setInjectRelativePath(e.target.value); setPreflightResult(null); }}
                              placeholder="Ej: src/components/ui/MiComponente.jsx"
                            />
                            {injectRelativePath && (
                              <p className="text-[9px] text-[var(--color-text-muted)]">El archivo se creará en: <code className="text-indigo-400">{injectTargetClient || '...'}/{injectRelativePath}</code></p>
                            )}
                          </div>
                          {/* Resultado preflight */}
                          {preflightResult && (
                            <div className={`p-3 rounded-xl border space-y-2 ${ preflightResult.canInject ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20' }`}>
                              {preflightResult.blockers?.map((b, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-red-400">
                                  <XCircle size={11} className="shrink-0 mt-0.5" /><span>{b}</span>
                                </div>
                              ))}
                              {preflightResult.warnings?.map((w, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-amber-400">
                                  <AlertTriangle size={11} className="shrink-0 mt-0.5" /><span>{w}</span>
                                </div>
                              ))}
                              {preflightResult.canInject && preflightResult.blockers?.length === 0 && preflightResult.warnings?.length === 0 && (
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                                  <CheckCircle2 size={11} /><span>Todo listo. El componente es inyectable.</span>
                                </div>
                              )}
                              {/* CORE-123: Badges del stack del cliente destino */}
                              {targetStack && (
                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5 mt-1">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${targetStack.hasAtAlias ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                                    @/ {targetStack.hasAtAlias ? '✓' : '✗'}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${targetStack.hasTailwind ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-500/15 text-slate-400'}`}>
                                    Tailwind {targetStack.hasTailwind ? '✓' : '✗'}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${targetStack.firebaseConfigRelPath ? 'bg-orange-500/15 text-orange-400' : 'bg-slate-500/15 text-slate-400'}`}>
                                    Firebase {targetStack.firebaseConfigRelPath ? '✓' : '✗'}
                                  </span>
                                  {targetStack.firebaseConfigRelPath && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono truncate max-w-[120px]" title={targetStack.firebaseConfigRelPath}>
                                      {targetStack.firebaseConfigRelPath}
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* CORE-123: Env vars faltantes */}
                              {envVarsMissing.length > 0 && (
                                <div className="flex items-start gap-1.5 text-[10px] text-amber-300 bg-amber-500/8 rounded-lg px-2 py-1.5">
                                  <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Vars de entorno faltantes</strong> (se agregarán como placeholder al .env.local):{' '}
                                    {envVarsMissing.map(v => <code key={v} className="text-amber-200 mx-0.5 bg-amber-500/20 px-1 rounded">{v}</code>)}
                                  </span>
                                </div>
                              )}
                              {preflightResult.destinationExists && (
                                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                  <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)}
                                    className="accent-emerald-500 w-3.5 h-3.5" />
                                  <span className="text-[10px] text-amber-300 font-semibold">Sobrescribir archivo existente (se creará backup automático)</span>
                                </label>
                              )}
                            </div>
                          )}
                          {/* Botones paso 1 */}
                          <div className="flex justify-between items-center pt-1">
                            <button onClick={() => { setShowInjectPanel(false); setInjectStep(1); }}
                              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                              Cancelar
                            </button>
                            <button
                              onClick={async () => {
                                if (!injectTargetClient || !injectRelativePath) return;
                                setPreflighting(true);
                                setPreflightResult(null);
                                setCssDoctorSuccess(false);
                                // CORE-123: Reset estados enriquecidos al re-verificar
                                setTargetStack(null);
                                setEnvVarsMissing([]);
                                setIntegrationSnippet(null);
                                setBuildPhase(null);
                                try {
                                  const res = await fetch(`${CLI_URL}/api/library/inject/preflight`, {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ componentLink: selectedComponent.link, targetRelativePath: injectRelativePath, clientId: injectTargetClient })
                                  });
                                  const data = await res.json();
                                  if (data.error) throw new Error(data.error);
                                  setPreflightResult(data);
                                  // CORE-123: Sincronizar campos enriquecidos del preflight
                                  if (data.targetStack) setTargetStack(data.targetStack);
                                  if (data.envVarsMissing?.length > 0) setEnvVarsMissing(data.envVarsMissing);
                                  if (data.integrationSnippet) setIntegrationSnippet(data.integrationSnippet);
                                  if (data.canInject) {
                                    // Si puede inyectar, avanzar automáticamente al diagnóstico
                                    setDiagnosing(true);
                                    setDiagnoseResult(null);
                                    setInjectStep(2);
                                    const dr = await fetch(`${CLI_URL}/api/library/inject/diagnose`, {
                                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ clientId: injectTargetClient, componentLink: selectedComponent.link })
                                    });
                                    const dd = await dr.json();
                                    setDiagnoseResult(dd.success ? dd : null);
                                    setDiagnosing(false);
                                  }
                                } catch (err) {
                                  setPreflightResult({ canInject: false, blockers: [err.message], warnings: [] });
                                } finally {
                                  setPreflighting(false);
                                }
                              }}
                              disabled={!injectTargetClient || !injectRelativePath || preflighting}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs px-4 py-1.5 rounded-xl transition-all font-semibold cursor-pointer"
                            >
                              {preflighting ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
                              {preflighting ? 'Verificando...' : 'Verificar y Continuar'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ─── PASO 2: Diagnóstico ─── */}
                      {injectStep === 2 && (
                        <div className="p-6 space-y-4">
                          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">
                            Revisión de dependencias antes de instalar.
                          </p>
                          {diagnosing ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-[var(--color-text-muted)]">
                              <Loader2 size={16} className="animate-spin text-emerald-400" />
                              <span className="text-[11px] font-bold">Analizando dependencias...</span>
                            </div>
                          ) : diagnoseResult ? (
                            <div className="space-y-3">
                              {/* Árbol de Dependencias en Cascada */}
                              <div className="bg-[var(--color-surface-2)]/40 border border-[var(--color-border)]/50 rounded-2xl p-4 space-y-3">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                                  <Layers size={11} /> Árbol de Dependencias y Componentes
                                </h5>
                                
                                <div className="pl-2 space-y-2.5 text-[10px]">
                                  {/* Componente Principal Root */}
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                      <div className="w-1 h-1 rounded-full bg-white" />
                                    </div>
                                    <span className="font-bold text-slate-100">{selectedComponent?.name || 'Componente'}</span>
                                    <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-mono">Principal</span>
                                  </div>

                                  {/* Hojas del árbol */}
                                  <div className="pl-3.5 border-l border-slate-800 space-y-2 ml-1.5">
                                    {/* 1. NPM Dependencies */}
                                    {(() => {
                                      const npmDeps = diagnoseResult.manifest?.dependencies?.npm || {};
                                      const npmList = Object.entries(npmDeps);
                                      if (npmList.length === 0) return null;
                                      return (
                                        <div className="space-y-1">
                                          <span className="text-[9px] text-[var(--color-text-muted)] font-semibold flex items-center gap-1">
                                            📦 Librerías NPM
                                          </span>
                                          <div className="pl-3.5 border-l border-slate-800/60 space-y-1">
                                            {npmList.map(([pkg, ver]) => {
                                              const isMissing = diagnoseResult.npmMissing && pkg in diagnoseResult.npmMissing;
                                              return (
                                                <div key={pkg} className="flex items-center gap-2">
                                                  <span className="text-slate-600 font-mono">├─</span>
                                                  <span className="font-mono text-slate-300">{pkg}</span>
                                                  <span className="text-[8px] font-mono text-slate-500">{ver}</span>
                                                  {isMissing ? (
                                                    <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-bold">
                                                      Faltante (se instalará)
                                                    </span>
                                                  ) : (
                                                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-bold">
                                                      Instalado
                                                    </span>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    {/* 2. Internal Dependencies */}
                                    {diagnoseResult.internalDependencies?.length > 0 && (
                                      <div className="space-y-1">
                                        <span className="text-[9px] text-[var(--color-text-muted)] font-semibold flex items-center gap-1">
                                          🧩 Componentes e Hijos
                                        </span>
                                        <div className="pl-3.5 border-l border-slate-800/60 space-y-1">
                                          {diagnoseResult.internalDependencies.map((dep, idx, arr) => {
                                            const isLast = idx === arr.length - 1;
                                            return (
                                              <div key={dep.name} className="flex items-center gap-2">
                                                <span className="text-slate-600 font-mono">{isLast ? '└─' : '├─'}</span>
                                                <span className="text-slate-300 font-semibold">{dep.name}</span>
                                                <span className="text-[8px] font-mono uppercase text-slate-500 bg-slate-850 px-1 py-0.25 rounded">{dep.type}</span>
                                                {dep.exists ? (
                                                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-bold">
                                                    Existente
                                                  </span>
                                                ) : (
                                                  <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-bold">
                                                    Faltante (se creará)
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* CSS Doctor (index.css) */}
                              {targetStack?.cssVarsMissing?.length > 0 && (
                                <div className="p-3 bg-[var(--color-surface-2)]/40 border border-amber-500/15 rounded-xl space-y-2.5">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                      <h5 className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                                        <Palette size={10} className="text-amber-400" /> Autocuración de Estilos (CSS Doctor)
                                      </h5>
                                      <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed">
                                        Inyecta automáticamente {targetStack.cssVarsMissing.length} variables CSS faltantes en <span className="font-mono text-slate-400 font-semibold">{targetStack.clientCSSFilePath || 'src/index.css'}</span>.
                                      </p>
                                    </div>
                                    {cssDoctorSuccess ? (
                                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase">Curado</span>
                                    ) : (
                                      <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black uppercase">Pendiente</span>
                                    )}
                                  </div>
                                  
                                  {!cssDoctorSuccess && (
                                    <div className="flex flex-wrap gap-1">
                                      {targetStack.cssVarsMissing.map(v => (
                                        <span key={v} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700/50 text-slate-400 rounded text-[8px] font-mono">{v}</span>
                                      ))}
                                    </div>
                                  )}

                                  {!cssDoctorSuccess && (
                                    <button
                                      onClick={handleCSSDoctor}
                                      disabled={cssDoctorLoading}
                                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                                    >
                                      {cssDoctorLoading ? (
                                        <Loader2 size={10} className="animate-spin" />
                                      ) : (
                                        <Palette size={10} />
                                      )}
                                      {cssDoctorLoading ? 'Curando Estilos...' : 'Autocurar Estilos en index.css'}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* CORE-126: Variables de Entorno Requeridas */}
                              {envVarsMissing.length > 0 && (
                                <div className="p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)]/50 rounded-xl space-y-2.5">
                                  <h5 className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                                    <Key size={10} className="text-amber-400" /> Configurar Variables de Entorno
                                  </h5>
                                  <p className="text-[9px] text-[var(--color-text-muted)] leading-relaxed">
                                    Se detectaron variables faltantes. Escribe los valores reales abajo o déjalos vacíos para usar placeholders de prueba.
                                  </p>
                                  <div className="space-y-2">
                                    {envVarsMissing.map(v => (
                                      <div key={v} className="space-y-1">
                                        <div className="flex justify-between items-center text-[9px] font-mono">
                                          <span className="text-slate-400 font-semibold">{v}</span>
                                          <span className="text-[8px] text-amber-400/80 bg-amber-500/10 px-1 rounded">Requerida</span>
                                        </div>
                                        <input
                                          type="text"
                                          className="w-full bg-[var(--color-surface-3)]/60 border border-[var(--color-border)]/60 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-[var(--color-text)] outline-none focus:border-emerald-500 transition-colors"
                                          placeholder={`Ej: valor_de_${v.toLowerCase()}`}
                                          value={envVarsValues[v] || ''}
                                          onChange={e => setEnvVarsValues(prev => ({ ...prev, [v]: e.target.value }))}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Overwrite check si existe */}
                              {preflightResult?.destinationExists && (
                                <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-amber-500/8 border border-amber-500/15 rounded-xl">
                                  <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)}
                                    className="accent-emerald-500 w-3.5 h-3.5" />
                                  <span className="text-[10px] text-amber-300 font-semibold">Sobrescribir archivo existente en el cliente</span>
                                </label>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-[var(--color-text-muted)] text-center py-4">No se pudo obtener el diagnóstico.</p>
                          )}
                          <div className="flex justify-between items-center pt-1">
                            <button onClick={() => setInjectStep(1)}
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                              <ChevronLeft size={11} /> Volver
                            </button>
                            <button
                              onClick={() => { setInjectStep(3); setInjectLog([]); setInjectDone(false); }}
                              disabled={diagnosing}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs px-4 py-1.5 rounded-xl transition-all font-semibold cursor-pointer"
                            >
                              <Zap size={11} /> Confirmar e Instalar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ─── PASO 3: Instalación con progreso SSE ─── */}
                      {injectStep === 3 && (
                        <div className="p-6 space-y-4">
                          {/* Auto-lanzar SSE al montar el paso 3 */}
                          {!injecting && !injectDone && injectLog.length === 0 && (() => {
                            // Efecto inline: usamos un dummy que dispara el fetch SSE
                            setTimeout(async () => {
                              setInjecting(true);
                              setInjectLog([{ phase: 'start', message: `Iniciando instalación en ${injectTargetClient}...`, status: 'done' }]);
                                try {
                                  const res = await fetch(`${CLI_URL}/api/library/inject/stream`, {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ clientId: injectTargetClient, componentLink: selectedComponent.link, targetRelativePath: injectRelativePath, overwrite, envValues: envVarsValues })
                                  });
                                const reader = res.body.getReader();
                                const decoder = new TextDecoder();
                                let buf = '';
                                while (true) {
                                  const { done, value } = await reader.read();
                                  if (done) break;
                                  buf += decoder.decode(value, { stream: true });
                                  const lines = buf.split('\n');
                                  buf = lines.pop();
                                  for (const line of lines) {
                                    if (line.startsWith('data: ')) {
                                      try {
                                        const evt = JSON.parse(line.slice(6));
                                        setInjectLog(prev => [...prev, evt]);
                                        // CORE-123: tracking de fases especiales
                                        if (evt.event === 'complete') {
                                          setInjectDone(true);
                                          if (evt.integrationSnippet) setIntegrationSnippet(evt.integrationSnippet);
                                          setBuildPhase('running');
                                        }
                                        if (evt.event === 'error') setInjectDone(true);
                                        if (evt.phase === 'build') {
                                          if (evt.status === 'success') setBuildPhase('success');
                                          else if (evt.status === 'error') setBuildPhase('error');
                                        }
                                      } catch {}
                                    }
                                  }
                                }
                              } catch (err) {
                                setInjectLog(prev => [...prev, { event: 'error', message: err.message, status: 'error' }]);
                                setInjectDone(true);
                              } finally {
                                setInjecting(false);
                              }
                            }, 50);
                            return null;
                          })()}

                          {/* Log de progreso */}
                          <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                            {injectLog.map((log, i) => {
                              const isErr = log.event === 'error' || log.status === 'error';
                              const isDone = log.status === 'done' || log.event === 'complete';
                              const isProgress = log.status === 'installing' || log.status === 'writing' || log.status === 'injecting';
                              const isBuild = log.phase === 'build'; // CORE-123: fase build
                              const isInfo = log.status === 'info' || log.status === 'warn' || log.phase === 'init' || log.phase === 'env' || log.phase === 'backup' || log.phase === 'transform';
                              return (
                                <div key={i} className={`flex items-start gap-2 text-[10px] p-2 rounded-lg ${
                                  isErr ? 'bg-red-500/8 text-red-400' :
                                  isDone ? 'bg-emerald-500/8 text-emerald-400' :
                                  isBuild ? 'bg-indigo-500/8 text-indigo-300' :
                                  isInfo ? 'bg-slate-500/8 text-slate-400' :
                                  isProgress ? 'bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)]' :
                                  'bg-[var(--color-surface-2)]/40 text-[var(--color-text-muted)]'
                                }`}>
                                  <div className="mt-0.5 shrink-0">
                                    {isErr ? <XCircle size={11} /> :
                                     isDone ? <CheckCircle2 size={11} /> :
                                     isProgress ? <Loader2 size={11} className="animate-spin" /> :
                                     isBuild ? <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> :
                                     <div className="w-2.5 h-2.5 rounded-full border border-current opacity-50" />}
                                  </div>
                                  <span className="leading-relaxed">{log.message}</span>
                                </div>
                              );
                            })}
                            {injecting && !injectDone && (
                              <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] p-2">
                                <Loader2 size={11} className="animate-spin text-emerald-400" />
                                <span>Procesando...</span>
                              </div>
                            )}
                          </div>

                          {/* Resultado final */}
                          {injectDone && (() => {
                            const finalEvt = [...injectLog].reverse().find(l => l.event === 'complete' || l.event === 'error');
                            const isSuccess = finalEvt?.event === 'complete';
                            return (
                              <div className="space-y-3">
                                {/* Banner de resultado */}
                                <div className={`p-3 rounded-xl border ${ isSuccess ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20' }`}>
                                  <p className={`text-[11px] font-bold ${ isSuccess ? 'text-emerald-400' : 'text-red-400' }`}>
                                    {isSuccess ? '✅ Instalación completada exitosamente.' : '❌ ' + (finalEvt?.message || 'Error en la instalación.')}
                                  </p>
                                  {isSuccess && finalEvt?.results && (
                                    <ul className="mt-2 space-y-0.5">
                                      {finalEvt.results.map((r, i) => (
                                        <li key={i} className="text-[9px] font-mono text-emerald-300/70">
                                          [{r.type}] {r.name} → {r.path || r.version || r.status}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                {/* CORE-123: Estado del build automático */}
                                {isSuccess && buildPhase && (
                                  <div className={`flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg ${
                                    buildPhase === 'success' ? 'bg-emerald-500/8 text-emerald-400' :
                                    buildPhase === 'error' ? 'bg-red-500/8 text-red-400' :
                                    'bg-slate-500/8 text-slate-400'
                                  }`}>
                                    {buildPhase === 'running' && <Loader2 size={11} className="animate-spin shrink-0" />}
                                    {buildPhase === 'success' && <CheckCircle2 size={11} className="shrink-0" />}
                                    {buildPhase === 'error' && <XCircle size={11} className="shrink-0" />}
                                    <span>
                                      {buildPhase === 'running' && 'Verificando compilación...'}
                                      {buildPhase === 'success' && 'Compilación exitosa — componente integrado correctamente.'}
                                      {buildPhase === 'error' && 'La compilación falló — revisa el log arriba para los errores.'}
                                    </span>
                                  </div>
                                )}
                                {/* CORE-123: Integration snippet copiable */}
                                {isSuccess && integrationSnippet && (
                                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--color-border)]">
                                      <span className="text-[9px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">Cómo usarlo</span>
                                      <button
                                        onClick={() => { navigator.clipboard.writeText(integrationSnippet); }}
                                        className="text-[9px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer px-1"
                                        title="Copiar snippet"
                                      >
                                        Copiar
                                      </button>
                                    </div>
                                    <pre className="text-[9px] font-mono text-emerald-300/80 px-3 py-2 overflow-x-auto whitespace-pre leading-relaxed">{integrationSnippet}</pre>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          <div className="flex justify-between items-center pt-1">
                            {!injecting && !injectDone && (
                              <button onClick={() => setInjectStep(2)}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                                <ChevronLeft size={11} /> Volver
                              </button>
                            )}
                            {injectDone && (
                              <button onClick={() => { setShowInjectPanel(false); setInjectStep(1); }}
                                className="ml-auto flex items-center gap-1.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] text-xs px-4 py-1.5 rounded-xl transition-all font-semibold cursor-pointer">
                                <X size={11} /> Cerrar
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
                </AnimatePresence>

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
                      {/* Copia de Importación Inteligente */}
                      {selectedComponent?.technicalName && (
                        <div className="mb-4 p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)]/50 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                              Importación Recomendada
                            </span>
                            <span className="text-[8px] text-[var(--color-text-muted)] font-mono">
                              Convención de ruta con alias @/
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg">
                            <code className="font-mono text-[10px] text-slate-300 select-all overflow-x-auto whitespace-nowrap scrollbar-none">
                              {(() => {
                                const compName = selectedComponent.technicalName;
                                const manifest = extractManifest(componentContent);
                                const resolvedPath = preflightResult?.suggestedPath
                                  || getDefaultRelativePath(selectedComponent, manifest);
                                return generateStrategicImport(compName, resolvedPath, manifest, selectedComponent);
                              })()}
                            </code>
                            <button
                              onClick={() => {
                                const compName = selectedComponent.technicalName;
                                const manifest = extractManifest(componentContent);
                                const resolvedPath = preflightResult?.suggestedPath
                                  || getDefaultRelativePath(selectedComponent, manifest);
                                const importText = generateStrategicImport(compName, resolvedPath, manifest, selectedComponent);
                                navigator.clipboard.writeText(importText);
                              }}
                              className="text-slate-400 hover:text-indigo-400 transition-colors p-1 bg-slate-900 rounded border border-slate-800 cursor-pointer flex items-center justify-center shrink-0"
                              title="Copiar Import"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Asistente de Extracción con IA (Comando Híbrido) */}
                      {selectedComponent && (
                        <div className="mb-4 p-3 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                          <button 
                            onClick={() => setIsIaExtractExpanded(!isIaExtractExpanded)}
                            className="w-full flex items-center justify-between cursor-pointer text-left focus:outline-none"
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5 select-none">
                              <Sparkles size={12} className="text-indigo-400" />
                              Asistente de Extracción (Comando IA)
                            </span>
                            <span className="text-[10px] text-indigo-400 font-bold hover:underline">
                              {isIaExtractExpanded ? 'Contraer' : 'Expandir'}
                            </span>
                          </button>

                          {isIaExtractExpanded && (
                            <div className="mt-3.5 space-y-3.5 tab-content-enter">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)]">Archivo de Destino</label>
                                <input 
                                  type="text"
                                  disabled
                                  value={selectedComponent.link.split('/').pop() || ''}
                                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] opacity-60 rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-muted)] cursor-not-allowed focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)]">Indicaciones de Adaptación (Opcional)</label>
                                <textarea
                                  rows={2}
                                  value={iaExtractPrompt}
                                  onChange={e => setIaExtractPrompt(e.target.value)}
                                  placeholder="Ej: Limpiar estilos ad-hoc y adaptar paleta a variables de colores HSL. Agregar framer motion."
                                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 resize-none"
                                />
                              </div>

                              {/* Comando de Extracción Generado */}
                              <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Comando de Extracción</span>
                                <div className="flex items-center justify-between gap-2 bg-slate-950 px-2.5 py-2 border border-slate-800 rounded-lg">
                                  <code className="font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-none select-all">
                                    {`@extraer-componente "${selectedComponent.link}"${iaExtractPrompt ? ` "${iaExtractPrompt.replace(/"/g, '\\"')}"` : ''}`}
                                  </code>
                                  <button
                                    onClick={() => {
                                      const cmd = `@extraer-componente "${selectedComponent.link}"${iaExtractPrompt ? ` "${iaExtractPrompt.replace(/"/g, '\\"')}"` : ''}`;
                                      navigator.clipboard.writeText(cmd);
                                      showToast('Comando de extracción copiado. Pégalo en tu chat con Antigravity ✓', { type: 'success' });
                                    }}
                                    className="p-1 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-indigo-400 cursor-pointer flex items-center justify-center shrink-0"
                                    title="Copiar comando de extracción"
                                  >
                                    <Copy size={11} />
                                  </button>
                                </div>
                                <span className="text-[9px] text-[var(--color-text-muted)] italic block leading-relaxed">
                                  Pega este comando en nuestro chat de Antigravity para extraer, portar y catalogar automáticamente el componente.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

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
                  ) : activeTab === 'sandbox' ? (
                    <div className="p-5 h-full">
                      <ComponentSandbox 
                        componentName={selectedComponent.name} 
                        technicalName={selectedComponent.technicalName} 
                        componentLink={selectedComponent.link}
                      />
                    </div>
                  ) : activeTab === 'history' ? (
                    <div className="p-4 space-y-4">
                      {/* Header Historial */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <History size={14} className="text-indigo-400" />
                          <h3 className="text-xs font-black text-[var(--color-text)] uppercase tracking-wider">Historial de Inyecciones</h3>
                          {auditTotal > 0 && <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[9px] font-black">{auditTotal} entrada{auditTotal !== 1 ? 's' : ''}</span>}
                        </div>
                        <button onClick={() => loadAuditTrail(auditPage, auditFilter)} className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition-all cursor-pointer">
                          <RefreshCw size={9} className={auditLoading ? 'animate-spin' : ''} />
                          Actualizar
                        </button>
                      </div>

                      {/* Selector de cliente */}
                      {!injectTargetClient && (
                        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                          <p className="text-[10px] text-amber-300">Selecciona un cliente en el panel de instalación para ver su historial.</p>
                        </div>
                      )}

                      {/* Filtros */}
                      {injectTargetClient && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-bold text-[var(--color-text-muted)] flex items-center gap-1"><Filter size={9}/> Filtros:</span>
                          <CustomSelect
                            options={auditOperationOptions}
                            value={auditFilter.operation}
                            onChange={val => {
                              const f = { ...auditFilter, operation: val };
                              setAuditFilter(f);
                              loadAuditTrail(1, f);
                            }}
                            size="sm"
                            className="min-w-[140px]"
                          />
                          <CustomSelect
                            options={auditStatusOptions}
                            value={auditFilter.status}
                            onChange={val => {
                              const f = { ...auditFilter, status: val };
                              setAuditFilter(f);
                              loadAuditTrail(1, f);
                            }}
                            size="sm"
                            className="min-w-[130px]"
                          />
                          <input
                            type="text"
                            placeholder="Buscar componente, ruta..."
                            value={auditFilter.search}
                            onChange={e => setAuditFilter(f => ({...f, search: e.target.value}))}
                            onKeyDown={e => e.key === 'Enter' && loadAuditTrail(1, auditFilter)}
                            className="flex-1 min-w-[120px] px-2 py-1 text-[9px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                          />
                          {(auditFilter.operation || auditFilter.status || auditFilter.search) && (
                            <button onClick={() => { const f = {operation:'',status:'',search:''}; setAuditFilter(f); loadAuditTrail(1, f); }} className="px-2 py-1 text-[9px] font-bold text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer">
                              <X size={9} className="inline mr-0.5" /> Limpiar
                            </button>
                          )}
                        </div>
                      )}

                      {/* Timeline de entradas */}
                      {auditLoading ? (
                        <div className="py-12 text-center">
                          <Loader2 size={18} className="mx-auto animate-spin text-indigo-400 mb-2" />
                          <p className="text-[10px] text-[var(--color-text-muted)]">Cargando historial...</p>
                        </div>
                      ) : auditTrail.length === 0 && injectTargetClient ? (
                        <div className="py-12 text-center space-y-2">
                          <History size={22} className="mx-auto text-[var(--color-text-muted)] opacity-30" />
                          <p className="text-[10px] text-[var(--color-text-muted)]">No hay entradas en el historial para <span className="text-indigo-400 font-mono">{injectTargetClient}</span>.</p>
                          <p className="text-[9px] text-[var(--color-text-muted)] opacity-60">Realiza una inyección para ver el historial aquí.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {auditTrail.map((entry, idx) => {
                            const isExpanded = auditSelectedEntry?.id === entry.id;
                            const opIcon = entry.operation === 'inject' ? '📦' : entry.operation === 'rollback' ? '↩️' : entry.operation === 'auto-rollback' ? '🛡️' : '🔧';
                            const stIcon = entry.status === 'success' ? '✅' : '❌';
                            const stColor = entry.status === 'success' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-rose-400 border-rose-500/30 bg-rose-500/5';
                            const compName = entry.primaryComponent?.name || entry.componentId || 'desconocido';
                            const ts = entry.timestamp ? new Date(entry.timestamp).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '-';
                            return (
                              <div key={entry.id || idx} className={`border rounded-xl transition-all ${stColor}`}>
                                {/* Fila principal */}
                                <button
                                  onClick={() => {
                                    setAuditSelectedEntry(isExpanded ? null : entry);
                                    setAuditDiff(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-left"
                                >
                                  <span className="text-base shrink-0">{opIcon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-black uppercase tracking-wide">{entry.operation}</span>
                                      <span className="text-[9px] font-mono opacity-80 truncate max-w-[180px]">{compName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Clock size={8} className="shrink-0 opacity-60" />
                                      <span className="text-[8px] opacity-60">{ts}</span>
                                      {entry.primaryComponent?.targetPath && <span className="text-[8px] font-mono opacity-50 truncate max-w-[130px]">→ {entry.primaryComponent.targetPath}</span>}
                                    </div>
                                  </div>
                                  <span className="text-[9px] shrink-0">{stIcon}</span>
                                  {isExpanded ? <ChevronUp size={10} className="shrink-0 opacity-50" /> : <ChevronDown size={10} className="shrink-0 opacity-50" />}
                                </button>

                                {/* Detalle expandido */}
                                {isExpanded && (
                                  <div className="px-3 pb-3 space-y-3 border-t border-current/10">
                                    {/* Info table */}
                                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                      {[
                                        ['Cliente', entry.clientId],
                                        ['Estado', entry.status],
                                        ['Build', entry.buildLog?.status || 'N/A'],
                                        ['ID', entry.id],
                                      ].map(([k, v]) => (
                                        <div key={k} className="flex items-center gap-1">
                                          <span className="text-[8px] font-bold opacity-60">{k}:</span>
                                          <span className="text-[8px] font-mono truncate">{v}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* NPM packages */}
                                    {Array.isArray(entry.npmPackages) && entry.npmPackages.length > 0 && (
                                      <div>
                                        <p className="text-[8px] font-black uppercase tracking-wide opacity-60 mb-1">NPM Instalados:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {entry.npmPackages.map(p => (
                                            <span key={p.name} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[8px]">{p.name}@{p.version}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Dependencias inyectadas */}
                                    {Array.isArray(entry.dependencies) && entry.dependencies.length > 0 && (
                                      <div>
                                        <p className="text-[8px] font-black uppercase tracking-wide opacity-60 mb-1">Dependencias ({entry.dependencies.length}):</p>
                                        <div className="space-y-0.5">
                                          {entry.dependencies.map((d, di) => (
                                            <div key={di} className="flex items-center gap-1 text-[8px] font-mono opacity-70">
                                              <Package size={7} className="shrink-0" />
                                              <span>{d.name} → {d.targetPath}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Env vars */}
                                    {Array.isArray(entry.envVarsConfigured) && entry.envVarsConfigured.length > 0 && (
                                      <div>
                                        <p className="text-[8px] font-black uppercase tracking-wide opacity-60 mb-1">Variables de entorno:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {entry.envVarsConfigured.map(v => (
                                            <span key={v} className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[8px]">{v}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Error message */}
                                    {entry.errorMessage && (
                                      <div className="p-2 bg-rose-900/20 border border-rose-500/20 rounded-lg">
                                        <p className="text-[8px] font-black text-rose-400 mb-0.5">Error:</p>
                                        <p className="text-[8px] font-mono text-rose-300">{entry.errorMessage}</p>
                                      </div>
                                    )}

                                    {/* Stack info */}
                                    {entry.stack && (
                                      <div className="flex items-center gap-3 text-[8px] opacity-50">
                                        <span>Alias @/: {entry.stack.hasAtAlias ? '✓' : '✗'}</span>
                                        <span>Tailwind: {entry.stack.hasTailwind ? '✓' : '✗'}</span>
                                        {entry.stack.firebaseConfig && <span>Firebase: {entry.stack.firebaseConfig}</span>}
                                      </div>
                                    )}

                                    {/* Botones de acción */}
                                    <div className="flex items-center gap-2 pt-1">
                                      {/* Ver Diff */}
                                      {entry.operation === 'inject' && entry.primaryComponent?.name && (
                                        <button
                                          onClick={() => loadAuditDiff(entry.primaryComponent.name)}
                                          disabled={auditDiffLoading}
                                          className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/10 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                          {auditDiffLoading ? <Loader2 size={9} className="animate-spin" /> : <GitCompare size={9} />}
                                          Ver Diff
                                        </button>
                                      )}
                                      {/* Copiar ID */}
                                      <CopyButton text={entry.id || ''} label="ID" size="sm" />
                                    </div>

                                    {/* Visor de Diff */}
                                    {auditDiff && auditSelectedEntry?.id === entry.id && (
                                      <div className="mt-2 bg-slate-950 border border-slate-700/50 rounded-xl overflow-hidden">
                                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/70 border-b border-slate-700/30">
                                          <span className="text-[9px] font-black text-violet-400 flex items-center gap-1"><GitCompare size={9}/> Diff: {auditDiff.componentId}</span>
                                          <span className="text-[8px] font-mono text-slate-500">{auditDiff.hasBackup ? 'backup vs actual' : 'sin backup'}</span>
                                        </div>
                                        <div className="p-2 overflow-x-auto max-h-[200px] overflow-y-auto">
                                          <pre className="font-mono text-[8px] leading-relaxed whitespace-pre text-slate-300">
                                            {auditDiff.diff ? auditDiff.diff.split('\n').map((line, li) => (
                                              <span key={li} className={`block ${line.startsWith('+') && !line.startsWith('+++') ? 'text-emerald-400 bg-emerald-900/20' : line.startsWith('-') && !line.startsWith('---') ? 'text-rose-400 bg-rose-900/20' : line.startsWith('@@') ? 'text-violet-400 bg-violet-900/10' : ''}`}>{line}</span>
                                            )) : <span className="text-slate-500">No hay diferencias o no hay backup disponible.</span>}
                                          </pre>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Paginación */}
                      {auditTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => { const p = Math.max(1, auditPage - 1); setAuditPage(p); loadAuditTrail(p, auditFilter); }}
                            disabled={auditPage <= 1}
                            className="px-2.5 py-1 text-[9px] font-bold border border-[var(--color-border)] rounded-lg disabled:opacity-30 hover:bg-[var(--color-surface-2)] cursor-pointer transition-all"
                          ><ChevronLeft size={10} className="inline" /> Ant</button>
                          <span className="text-[9px] text-[var(--color-text-muted)]">pág. {auditPage} / {auditTotalPages}</span>
                          <button
                            onClick={() => { const p = Math.min(auditTotalPages, auditPage + 1); setAuditPage(p); loadAuditTrail(p, auditFilter); }}
                            disabled={auditPage >= auditTotalPages}
                            className="px-2.5 py-1 text-[9px] font-bold border border-[var(--color-border)] rounded-lg disabled:opacity-30 hover:bg-[var(--color-surface-2)] cursor-pointer transition-all"
                          >Sig <ChevronRight size={10} className="inline" /></button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
