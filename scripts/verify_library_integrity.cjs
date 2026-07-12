const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readJsonSafe(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmpPath, filePath);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copySkillFile(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function getSkillNames(rootDir) {
  if (!fs.existsSync(rootDir)) return new Set();

  return new Set(
    fs.readdirSync(rootDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((skillName) => fs.existsSync(path.join(rootDir, skillName, "SKILL.md")))
  );
}

function newestFile(activePath, backupPath) {
  const activeMtime = fs.statSync(activePath).mtimeMs;
  const backupMtime = fs.statSync(backupPath).mtimeMs;
  return activeMtime >= backupMtime ? "active" : "backup";
}


// Resolver rutas relativas basadas en el directorio de ejecución (scripts)
const devDashboardDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(devDashboardDir, '..', '..');
const docsRoot = path.join(rootDir, 'Documentacion PROTOTIPE');
const libraryReadmePath = path.join(docsRoot, '06_Biblioteca_Componentes', 'README.md');
const componentsDir = path.join(docsRoot, '06_Biblioteca_Componentes');
const modulesDir = path.join(docsRoot, '09_Modulos_Completos');
const componentSandboxPath = path.join(devDashboardDir, 'src', 'components', 'admin', 'ComponentSandbox.jsx');

// Cargar nichos oficiales desde la configuración del CLI para validación automatizada
const nichesJsonPath = path.join(rootDir, 'Prototipe-CLI', 'config', 'niches.json');
let officialNicheKeys = [];
if (fs.existsSync(nichesJsonPath)) {
  try {
    const nichesData = JSON.parse(fs.readFileSync(nichesJsonPath, 'utf8'));
    officialNicheKeys = Object.keys(nichesData);
  } catch (e) {
    console.warn('[Integridad] No se pudo leer niches.json:', e.message);
  }
}

console.log('==================================================');
console.log('  EJECUTANDO VERIFICACIÓN DE INTEGRIDAD DE BIBLIOTECA');
console.log('==================================================');
console.log(`Directorio del Dashboard: ${devDashboardDir}`);
console.log(`Directorio de Documentación: ${docsRoot}`);

let hasErrors = false;
let linterFailsCount = 0;


// 1. Obtener archivos markdown recursivos físicos
function getFilesRecursive(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFilesRecursive(filePath, fileList);
    } else {
      if (filePath.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

// Función de normalización de cadenas para comparaciones tolerantes
function cleanString(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar marcas de acentuación
    .replace(/_/g, ' ')             // Reemplazar guiones bajos por espacios
    .replace(/[^a-z0-9 ]/g, '')     // Eliminar puntuaciones
    .replace(/\s+/g, ' ')           // Colapsar espacios múltiples
    .trim();
}

try {
  // Escaneo físico de archivos md en biblioteca y módulos completos
  const compFiles = getFilesRecursive(componentsDir);
  const modFiles = getFilesRecursive(modulesDir);
  const allPhysicalFiles = [...compFiles, ...modFiles]
    .filter(f => !f.toLowerCase().endsWith('readme.md') && !f.toLowerCase().endsWith('catalogo_componentes_atomicos.md'));

  console.log(`[Info] Total archivos físicos detectados (excluyendo indices): ${allPhysicalFiles.length}`);

  // 2. Leer README.md de la biblioteca para buscar referencias
  if (!fs.existsSync(libraryReadmePath)) {
    console.error(`[Error] No existe el índice README.md en: ${libraryReadmePath}`);
    process.exit(1);
  }
  const readmeContent = fs.readFileSync(libraryReadmePath, 'utf8');
  const cleanReadme = cleanString(readmeContent);

  // Validar si están listados en el índice de la biblioteca
  const unlisted = [];
  allPhysicalFiles.forEach(file => {
    const basename = path.basename(file);
    const cleanBase = cleanString(path.basename(file, '.md'));

    // Búsqueda flexible por nombre de archivo o su variante limpia
    const escapedName = basename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedName, 'i');

    const isListed = regex.test(readmeContent) || cleanReadme.includes(cleanBase);

    if (!isListed) {
      unlisted.push(file);
    }
  });

  if (unlisted.length > 0) {
    console.error(`\n[FALLO] Existen ${unlisted.length} archivos físicos de documentación no listados en README.md:`);
    unlisted.forEach(f => {
      const rel = path.relative(docsRoot, f).replace(/\\/g, '/');
      console.error(`  - rel: ${rel}`);
    });
    hasErrors = true;
  } else {
    console.log('[Éxito] Todos los archivos físicos están debidamente indexados en README.md.');
  }

  // 3. Buscar enlaces rotos (file:///) en el README.md de la biblioteca
  const readmeLines = readmeContent.split('\n');
  let brokenLinksCount = 0;
  readmeLines.forEach((line, index) => {
    // Buscar file:///[letra]:/PROTOTIPE/Documentacion%20PROTOTIPE/...
    const matches = line.match(/file:\/\/\/[a-zA-Z]:\/PROTOTIPE\/Documentacion%20PROTOTIPE\/[a-zA-Z0-9_\-\/%]+\.[a-zA-Z0-9]+/gi);
    if (matches) {
      matches.forEach(matchedUri => {
        const cleanUri = decodeURIComponent(matchedUri);
        const relativePart = cleanUri.replace(/file:\/\/\/[a-zA-Z]:\/PROTOTIPE\//i, '').replace(/\//g, path.sep);
        const fullPath = path.join(rootDir, relativePart);
        if (!fs.existsSync(fullPath)) {
          console.error(`  - L${index + 1}: Enlace roto en README.md -> ${matchedUri} (No existe en disco: ${fullPath})`);
          brokenLinksCount++;
        }
      });
    }
  });

  if (brokenLinksCount > 0) {
    console.error(`\n[FALLO] Se detectaron ${brokenLinksCount} enlaces rotos en el index README.md de la biblioteca.`);
    hasErrors = true;
  } else {
    console.log('[Éxito] Cero enlaces rotos detectados en el index README.md de la biblioteca.');
  }

  // 4. Paridad con ComponentSandbox.jsx
  if (!fs.existsSync(componentSandboxPath)) {
    console.error(`[Error] No existe ComponentSandbox.jsx en: ${componentSandboxPath}`);
    process.exit(1);
  }
  const sandboxContent = fs.readFileSync(componentSandboxPath, 'utf8');
  const cleanSandbox = cleanString(sandboxContent);

  const missingInSandbox = [];
  allPhysicalFiles.forEach(file => {
    // Extraer el nombre del directorio padre
    const dirName = path.basename(path.dirname(file));
    const cleanDir = cleanString(dirName);

    // Extraer el nombre del archivo sin extensión
    const baseName = path.basename(file, '.md');
    const cleanBaseName = cleanString(baseName);

    // Comprobación flexible en ComponentSandbox.jsx (limpios de acentos y caracteres especiales)
    const isMapped = cleanSandbox.includes(cleanDir) || cleanSandbox.includes(cleanBaseName);

    if (!isMapped) {
      missingInSandbox.push({ file, dirName });
    }
  });

  if (missingInSandbox.length > 0) {
    console.error(`\n[FALLO] Existen ${missingInSandbox.length} componentes documentados sin registro en ComponentSandbox.jsx (en SANDBOXES, COMPONENT_SANDBOX_MAP o COMPONENT_META):`);
    missingInSandbox.forEach(item => {
      const rel = path.relative(docsRoot, item.file).replace(/\\/g, '/');
      console.error(`  - Módulo/Componente: ${item.dirName} (${rel})`);
    });
    console.error('\n> [Solución] Regístralos en ComponentSandbox.jsx, ya sea importando su playground en SANDBOXES / COMPONENT_SANDBOX_MAP, o añadiendo una nota explicativa en la constante COMPONENT_META (para hooks y servicios sin UI).');
    hasErrors = true;
  } else {
    console.log('[Éxito] Todos los componentes físicos tienen su playground o metadato en ComponentSandbox.jsx.');
  }

  // 5. Validar existencia y formato de metadatos (Manifest JSON) en documentación md
  let invalidManifestsCount = 0;
  allPhysicalFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const manifestMatch = content.match(/<!--\s*(\{[\s\S]*?\})\s*-->/);
    if (!manifestMatch) {
      console.error(`  - [Fallo Manifest] No se encontró el bloque de metadatos (<!-- { ... } -->) en: ${path.basename(file)}`);
      invalidManifestsCount++;
    } else {
      try {
        const manifest = JSON.parse(manifestMatch[1]);
        if (!manifest.technicalName || !manifest.targetPath) {
          console.error(`  - [Fallo Manifest] Campos obligatorios "technicalName" y/o "targetPath" faltantes en: ${path.basename(file)}`);
          invalidManifestsCount++;
        }



        // Evitar que el targetPath apunte a carpetas de sandbox o desarrollo central
        if (manifest.targetPath && (manifest.targetPath.includes('sandboxes/') || manifest.targetPath.includes('dev-dashboard'))) {
          console.warn(`  - [Alerta Linter] El "targetPath" en ${path.basename(file)} apunta al sandbox: "${manifest.targetPath}". Debe apuntar a la ruta de producción del cliente (ej: "src/features/[featureName]/components/...").`);
          linterFailsCount++;
        }

        // Evitar que el targetPath apunte a carpetas legacy (hooks/ o services/) para features
        if (manifest.targetPath && (manifest.targetPath.startsWith('src/hooks/') || manifest.targetPath.startsWith('src/services/'))) {
          console.warn(`  - [Alerta Linter] El "targetPath" en ${path.basename(file)} apunta a un directorio legacy: "${manifest.targetPath}". Debe usar la arquitectura Feature-Sliced (ej: "src/features/[featureName]/hooks/...").`);
          linterFailsCount++;
        }


        // ── CORE-207: Blindaje Atómico ──────────────────────────────────────
        // Todo componente dentro de Componentes_Atomicos/ DEBE declarar "type": "atom".
        // Si no lo hace, el API lo clasifica en el grupo "Componentes UI" y desaparece
        // del filtro de Átomos en el dashboard (discrepancia silenciosa).
        if (file.includes(`${path.sep}Componentes_Atomicos${path.sep}`)) {
          if (manifest.type !== 'atom') {
            console.error(`  - [Fallo Manifest] Componente en Componentes_Atomicos/ tiene "type": "${manifest.type || 'undefined'}" en lugar de "atom": ${path.basename(file)}. Todos los átomos DEBEN declarar "type": "atom".`);
            invalidManifestsCount++;
          }
        }

        // Validar clasificación y nichos para componentes sectoriales (evitar CORE-186)
        if (file.startsWith(componentsDir)) {
          const relPath = path.relative(componentsDir, file);
          const pathParts = relPath.split(path.sep);
          if (pathParts.length > 1) {
            const categoryFolder = pathParts[0];
            const normalizedFolder = categoryFolder.toLowerCase().replace(/_/g, '-');
            const normalizedFolderSnake = categoryFolder.toLowerCase().replace(/-/g, '_');
            const matchedNicheKey = officialNicheKeys.find(key => 
              key.toLowerCase().replace(/_/g, '-') === normalizedFolder ||
              key.toLowerCase().replace(/-/g, '_') === normalizedFolderSnake
            );

            if (matchedNicheKey) {
              if (!manifest.type) {
                console.error(`  - [Fallo Manifest] Campo obligatorio "type" faltante en componente de nicho: ${path.basename(file)}`);
                invalidManifestsCount++;
              }
              if (!manifest.niches || !Array.isArray(manifest.niches) || !manifest.niches.includes(matchedNicheKey)) {
                console.error(`  - [Fallo Manifest] El componente de nicho ${path.basename(file)} debe incluir "${matchedNicheKey}" en su propiedad "niches" del manifiesto.`);
                invalidManifestsCount++;
              }
              if (manifest.type === 'component' && !manifest.targetPath.startsWith('src/components/common/')) {
                console.error(`  - [Fallo Manifest] Componente sectorial ${path.basename(file)} tiene targetPath incorrecto: "${manifest.targetPath}". Debe estar en "src/components/common/"`);
                invalidManifestsCount++;
              }
            }
          }
        }
        
        // Validar enlaces de dependencias internas si están presentes
        if (manifest.dependencies && Array.isArray(manifest.dependencies.internal)) {
          manifest.dependencies.internal.forEach(dep => {
            if (dep.link) {
              const decoded = decodeURIComponent(dep.link);
              const rel = decoded.replace(/file:\/\/\/D:\/PROTOTIPE\//i, '').replace(/\//g, path.sep);
              const depPath = path.join(rootDir, rel);
              if (!fs.existsSync(depPath)) {
                console.error(`  - [Fallo Manifest] Enlace roto de dependencia interna "${dep.name}" en ${path.basename(file)}: ${dep.link}`);
                invalidManifestsCount++;
              }
            }
          });
        }
      } catch (err) {
        console.error(`  - [Fallo Manifest] Sintaxis JSON inválida en el manifest de: ${path.basename(file)} (${err.message})`);
        invalidManifestsCount++;
      }
    }
  });

  if (invalidManifestsCount > 0) {
    console.error(`\n[FALLO] Se detectaron ${invalidManifestsCount} archivos de documentación con manifiesto de metadatos inválido o ausente.`);
    hasErrors = true;
  } else {
    console.log('[Éxito] Todos los archivos físicos de documentación tienen manifiestos JSON válidos.');
  }

  // 5.5 Linter Estético, de Animaciones y Robustez (Garantizar Estándar Premium)
  console.log('\n[Info] Ejecutando linter estético y de robustez sobre fichas técnicas y sandboxes...');


  // Escaneo de fichas markdown (.md)
  allPhysicalFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const filename = path.basename(file);

    // 1. Título de Código React
    const hasCodeTitle = /## \d+\..*?C[óo]digo/i.test(content);
    if (!hasCodeTitle) {
      console.warn(`  - [Alerta Linter] Título de código no estándar en: ${filename} (Debe llamarse "## 3. Código React Completo" o similar para que el visor lo extraiga)`);
      linterFailsCount++;
    }

    // 2. Verificar placeholders en código
    const codeBlocks = [...content.matchAll(/```jsx([\s\S]*?)```/g)];
    codeBlocks.forEach(match => {
      const code = match[1];
      if (/\/\/\s*\.\.\./.test(code) || /\/\/\s*resto/.test(code) || /\/\/\s*placeholder/i.test(code)) {
        console.error(`  - [Fallo Linter] Código incompleto (contiene placeholders "// ...") en: ${filename}`);
        linterFailsCount++;
      }

      // 3. Colores estáticos oscuros quemados o prohibidos
      if (/bg-slate-(900|950)/.test(code) || /border-slate-(800|850|900)/.test(code)) {
        console.error(`  - [Fallo Linter] Colores estáticos oscuros detectados en: ${filename} (Usa variables HSL del tema como bg-[var(--color-surface)]/20)`);
        linterFailsCount++;
      }

      // 3.1 Validaciones de Design Integrity Guard (CORE-226) en bloques de documentación
      const FORBIDDEN_FIXED_WIDTH_RE = /\b(min-|max-)?w-\[(?:[3-9]\d{2}|\d{4,})px\]/g;
      const FORBIDDEN_HEX_RE = /\b[a-zA-Z0-9_:-]+-\[#[0-9a-fA-F]{3,8}\](?:\/\d{1,3})?\b/g;
      const DIRTY_SHADOW_RE = /\b(?:shadow-\[.*(?:rgba?\(0,\s*0,\s*0|#000|black).*]|shadow-black(?:\/\d{1,3})?)\b/g;
      const UNSAFE_MOBILE_GRID_RE = /(?<!\b(?:sm|md|lg|xl|2xl):)grid-cols-2\b/g;

      const fixedWidths = code.match(FORBIDDEN_FIXED_WIDTH_RE) ?? [];
      for (const token of fixedWidths) {
        console.error(`  - [Fallo Linter] Ancho fijo prohibido "${token}" en bloque de código de: ${filename}`);
        linterFailsCount++;
      }

      const hexColors = code.match(FORBIDDEN_HEX_RE) ?? [];
      for (const token of hexColors) {
        console.error(`  - [Fallo Linter] Color hexadecimal hardcodeado "${token}" en bloque de código de: ${filename}`);
        linterFailsCount++;
      }

      const dirtyShadows = code.match(DIRTY_SHADOW_RE) ?? [];
      for (const token of dirtyShadows) {
        console.error(`  - [Fallo Linter] Sombra negra/opaca prohibida "${token}" en bloque de código de: ${filename}`);
        linterFailsCount++;
      }

      const unsafeGrids = code.match(UNSAFE_MOBILE_GRID_RE) ?? [];
      for (const token of unsafeGrids) {
        console.error(`  - [Fallo Linter] grid-cols-2 sin breakpoint responsivo móvil "${token}" en bloque de código de: ${filename}`);
        linterFailsCount++;
      }

      // 4. Clipping en Scroll
      if (/overflow-[xy]-auto/.test(code)) {
        const hasPadding = /p[xy]?-[34567891012]/.test(code);
        if (!hasPadding) {
          console.error(`  - [Fallo Linter] Contenedor de scroll sin padding en: ${filename} (Usa py-4 o px-4 para evitar truncamiento de escalas y sombras)`);
          linterFailsCount++;
        }
      }

      // 5. Rutas absolutas locales hardcoded
      const ABSOLUTE_PATH_RE = /(?:[a-zA-Z]:[/\\]|\/)(?:PROTOTIPE|Users|home|Users\/[^\/]+)[/\\]/gi;
      const absolutePathMatch = code.match(ABSOLUTE_PATH_RE);
      if (absolutePathMatch) {
        console.error(`  - [Fallo Linter] Ruta absoluta local detectada en: ${filename} (No uses rutas absolutas de tu máquina local: "${absolutePathMatch[0]}")`);
        linterFailsCount++;
      }

      // 6. Hostnames y puertos locales quemados
      const LOCALHOST_RE = /(?:https?:\/\/)?(?:localhost|127\.0\.0\.1):\d+/gi;
      const localMatch = code.match(LOCALHOST_RE);
      if (localMatch) {
        console.error(`  - [Fallo Linter] URL/Puerto local quemado "${localMatch[0]}" detectado en: ${filename} (Usa variables de entorno como import.meta.env.VITE_API_URL)`);
        linterFailsCount++;
      }
    });
  });

  // Escaneo de archivos Sandbox (.jsx)
  const sandboxFolder = path.join(devDashboardDir, 'src', 'components', 'admin', 'sandboxes');
  if (fs.existsSync(sandboxFolder)) {
    const sandboxFiles = fs.readdirSync(sandboxFolder).filter(f => f.endsWith('.jsx'));
    sandboxFiles.forEach(file => {
      const filePath = path.join(sandboxFolder, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 1. Uso de select nativo
      if (/<select\b/.test(content)) {
        console.error(`  - [Fallo Linter] Sandbox usa select nativo de HTML en: ${file} (Debe usar CustomSelect)`);
        linterFailsCount++;
      }

      // 2. Colores estáticos oscuros quemados
      if (/bg-slate-(900|950)/.test(content) || /border-slate-(800|850|900)/.test(content)) {
        console.error(`  - [Fallo Linter] Colores estáticos oscuros detectados en sandbox: ${file} (Usa variables HSL del tema)`);
        linterFailsCount++;
      }

      // 3. Clipping en Scroll
      if (/overflow-[xy]-auto/.test(content)) {
        const hasPadding = /p[xy]?-[34567891012]/.test(content);
        if (!hasPadding) {
          console.error(`  - [Fallo Linter] Contenedor de scroll sin padding en sandbox: ${file} (Usa py-4 o px-4 para evitar truncamiento)`);
          linterFailsCount++;
        }
      }

      // 4. Rutas absolutas locales hardcoded
      const ABSOLUTE_PATH_RE = /(?:[a-zA-Z]:[/\\]|\/)(?:PROTOTIPE|Users|home|Users\/[^\/]+)[/\\]/gi;
      const absolutePathMatch = content.match(ABSOLUTE_PATH_RE);
      if (absolutePathMatch) {
        console.error(`  - [Fallo Linter] Ruta absoluta local detectada en sandbox: ${file} (No uses rutas absolutas de tu máquina local: "${absolutePathMatch[0]}")`);
        linterFailsCount++;
      }

      // 5. Hostnames y puertos locales quemados
      const LOCALHOST_RE = /(?:https?:\/\/)?(?:localhost|127\.0\.0\.1):\d+/gi;
      const localMatch = content.match(LOCALHOST_RE);
      if (localMatch) {
        console.error(`  - [Fallo Linter] URL/Puerto local quemado "${localMatch[0]}" detectado en sandbox: ${file} (Usa variables de entorno como import.meta.env.VITE_API_URL)`);
        linterFailsCount++;
      }
    });
  }

  // Escaneo de Seguridad de Vistas Administrativas (RBAC & Admin Bypass)
  console.log('\n[Info] Ejecutando linter de seguridad y control de acceso (RBAC Guard)...');

  // 1. Validar que las rutas administrativas de la plantilla del cliente estén protegidas
  const clientAppRoutesPath = path.join(rootDir, 'Plantillas Core', 'App Ventas', 'src', 'routes', 'AppRoutes.jsx');
  if (fs.existsSync(clientAppRoutesPath)) {
    const content = fs.readFileSync(clientAppRoutesPath, 'utf8');
    
    // Validar existencia de guardia de autenticación por rol
    const hasRequireAuth = /RequireAuth/i.test(content);
    const hasAdminRoleGuard = /allowedRole\s*=\s*{\s*(?:ROLES\.ADMIN|['"]admin['"])\s*}/i.test(content) || /allowedRole\s*=\s*(?:ROLES\.ADMIN|['"]admin['"])/i.test(content);

    if (!hasRequireAuth || !hasAdminRoleGuard) {
      console.error(`  - [Fallo Linter de Seguridad] El archivo de enrutamiento del cliente "${path.basename(clientAppRoutesPath)}" carece de protección robusta de rutas por rol "admin". Asegura que las rutas "/admin" requieran allowedRole={ROLES.ADMIN}.`);
      linterFailsCount++;
    }
  }

  // 2. Validar que los layouts de administración de la plantilla del cliente validen autenticación
  const clientAdminLayoutPath = path.join(rootDir, 'Plantillas Core', 'App Ventas', 'src', 'layouts', 'AdminLayout.jsx');
  if (fs.existsSync(clientAdminLayoutPath)) {
    const content = fs.readFileSync(clientAdminLayoutPath, 'utf8');
    const validatesAuth = /useAuthStore|auth|signOut|RequireAuth/i.test(content);

    if (!validatesAuth) {
      console.error(`  - [Fallo Linter de Seguridad] El Layout Administrativo "${path.basename(clientAdminLayoutPath)}" carece de hooks de autenticación. Debe interactuar conuseAuthStore o Firebase Auth.`);
      linterFailsCount++;
    }
  }

  // 3. Escaneo preventivo de vistas administrativas sueltas o legacy
  const templateVentasSrc = path.join(rootDir, 'Plantillas Core', 'App Ventas', 'src');
  if (fs.existsSync(templateVentasSrc)) {
    const walkSync = (dir, fileList = []) => {
      fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walkSync(filePath, fileList);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
          fileList.push(filePath);
        }
      });
      return fileList;
    };

    const clientFiles = walkSync(templateVentasSrc);
    clientFiles.forEach(filePath => {
      const filename = path.basename(filePath);
      const normalizedPath = filePath.replace(/\\/g, '/');
      
      // Auditar archivos que se hagan pasar por paneles o admin pero que estén fuera de rutas protegidas
      // ej. en components/common/ o public/ sin estar integrados en AppRoutes
      if (/admin|panel/i.test(filename) && 
          !normalizedPath.includes('routes') && 
          !normalizedPath.includes('layouts') && 
          !normalizedPath.includes('verify_library_integrity') && 
          !normalizedPath.includes('particlesIcons') &&
          !normalizedPath.includes('pages/admin')) { // Las páginas dentro de pages/admin ya están cubiertas por el AppRoutes global
        
        const content = fs.readFileSync(filePath, 'utf8');
        const hasRbacCheck = /role\s*===\s*['"]admin['"]|role\s*==\s*['"]admin['"]|isAdmin|AuthGuard|requireAdmin|roleCheck|user\.role|profile\.role/i.test(content);
        
        if (!hasRbacCheck) {
          console.error(`  - [Fallo Linter de Seguridad] Componente administrativo huérfano detectado: "${filename}" (${path.relative(rootDir, filePath)}). Fuera de pages/admin y carece de validación de rol "admin" explícita. Protégelo.`);
          linterFailsCount++;
        }
      }
    });
  }



  if (linterFailsCount > 0) {
    console.warn(`\n[Advertencia Linter] El linter visual y estético detectó ${linterFailsCount} desviaciones de calidad del estándar premium (sólo informativo, no bloquea el build).`);
  } else {
    console.log('[Éxito] Linter visual y estético al 100% limpio (variables HSL, sin selectores nativos, sin clipping).');
  }

  // 6. Sincronización Automática Bidireccional de Skills de IA (CORE-228)
  console.log('\n[Info] Sincronizando habilidades del agente IA (.agents/skills <-> Resguardo)...');
  try {
    const activeRoot = path.join(rootDir, '.agents', 'skills');
    const backupRoot = path.join(docsRoot, '04_Estandares_y_Skills', 'Copia_Seguridad_Reglas_y_Skills', 'Skills');
    const manifestPath = path.join(activeRoot, 'sync_manifest.json');

    if (fs.existsSync(activeRoot) && fs.existsSync(backupRoot)) {
      const now = new Date().toISOString();
      const manifest = readJsonSafe(manifestPath, {
        schemaVersion: 1,
        lastSyncAt: null,
        skills: {}
      });

      const activeSkills = getSkillNames(activeRoot);
      const backupSkills = getSkillNames(backupRoot);
      const allSkills = new Set([
        ...activeSkills,
        ...backupSkills,
        ...Object.keys(manifest.skills || {})
      ]);

      const conflicts = [];
      const actions = [];

      for (const skillName of allSkills) {
        // Ignorar el archivo de manifiesto si por error se listó
        if (skillName === 'sync_manifest.json') continue;

        const activePath = path.join(activeRoot, skillName, 'SKILL.md');
        const backupPath = path.join(backupRoot, skillName, 'SKILL.md');

        const activeExists = fs.existsSync(activePath);
        const backupExists = fs.existsSync(backupPath);
        const storedHash = manifest.skills?.[skillName]?.sha256 ?? null;

        if (!activeExists && !backupExists) {
          conflicts.push({
            skill: skillName,
            type: 'DELETE_REVIEW',
            reason: 'La skill existía en el manifiesto pero ya no existe en activo ni en respaldo.'
          });
          continue;
        }

        if (storedHash && (!activeExists || !backupExists)) {
          conflicts.push({
            skill: skillName,
            type: 'DELETE_REVIEW',
            reason: 'La skill falta en uno de los lados. No se permite borrar o restaurar automáticamente.'
          });
          continue;
        }

        if (!activeExists && backupExists && !storedHash) {
          copySkillFile(backupPath, activePath);
          const hash = sha256File(activePath);
          manifest.skills[skillName] = { sha256: hash, syncedAt: now };
          actions.push({ skill: skillName, action: 'bootstrap backup -> active' });
          console.log(`🆕 Operativa de IA restaurada para: ${skillName}`);
          continue;
        }

        if (activeExists && !backupExists && !storedHash) {
          copySkillFile(activePath, backupPath);
          const hash = sha256File(activePath);
          manifest.skills[skillName] = { sha256: hash, syncedAt: now };
          actions.push({ skill: skillName, action: 'bootstrap active -> backup' });
          console.log(`🔒 Resguardo inicial creado para: ${skillName}`);
          continue;
        }

        const activeHash = sha256File(activePath);
        const backupHash = sha256File(backupPath);

        if (!storedHash) {
          const winner = newestFile(activePath, backupPath);

          if (activeHash !== backupHash) {
            if (winner === 'active') copySkillFile(activePath, backupPath);
            else copySkillFile(backupPath, activePath);
          }

          const finalHash = winner === 'active' ? sha256File(activePath) : sha256File(backupPath);
          manifest.skills[skillName] = { sha256: finalHash, syncedAt: now };
          actions.push({ skill: skillName, action: `initial sync ${winner}` });
          console.log(`🔒 Sincronización inicial completada para: ${skillName} (Origen: ${winner})`);
          continue;
        }

        const activeChanged = activeHash !== storedHash;
        const backupChanged = backupHash !== storedHash;

        if (activeChanged && backupChanged) {
          if (activeHash === backupHash) {
            manifest.skills[skillName] = { sha256: activeHash, syncedAt: now };
            actions.push({ skill: skillName, action: 'resolve_identical_sync' });
            console.log(`🔒 Manifiesto actualizado para: ${skillName} (Contenido idéntico)`);
            continue;
          }
          conflicts.push({
            skill: skillName,
            type: 'THREE_WAY_CONFLICT',
            reason: 'Ambas copias fueron modificadas independientemente desde la última sincronización.',
            activeHash,
            backupHash,
            storedHash
          });
          continue;
        }

        if (activeChanged && !backupChanged) {
          copySkillFile(activePath, backupPath);
          manifest.skills[skillName] = { sha256: activeHash, syncedAt: now };
          actions.push({ skill: skillName, action: 'active -> backup' });
          console.log(`🔒 Resguardo actualizado para: ${skillName}`);
          continue;
        }

        if (!activeChanged && backupChanged) {
          copySkillFile(backupPath, activePath);
          manifest.skills[skillName] = { sha256: backupHash, syncedAt: now };
          actions.push({ skill: skillName, action: 'backup -> active' });
          console.log(`🆕 Operativa de IA restaurada para: ${skillName}`);
          continue;
        }

        actions.push({ skill: skillName, action: 'noop' });
      }

      // Contar categorías para el reporte
      const noopCount = actions.filter(a => a.action === 'noop').length;
      const activeToBackupCount = actions.filter(a => a.action === 'active -> backup' || a.action === 'bootstrap active -> backup' || a.action === 'resolve_identical_sync').length;
      const backupToActiveCount = actions.filter(a => a.action === 'backup -> active' || a.action === 'bootstrap backup -> active').length;
      const initialSyncCount = actions.filter(a => a.action.startsWith('initial sync')).length;
      const deleteReviewCount = conflicts.filter(c => c.type === 'DELETE_REVIEW').length;
      const threeWayConflictCount = conflicts.filter(c => c.type === 'THREE_WAY_CONFLICT').length;

      console.log('\n--- CORE-228 Skills Sync Summary ---');
      console.log(`- Skills evaluadas: ${allSkills.size}`);
      console.log(`- No-op: ${noopCount}`);
      console.log(`- Activo -> Backup: ${activeToBackupCount}`);
      console.log(`- Backup -> Activo: ${backupToActiveCount}`);
      console.log(`- Sincronizaciones iniciales: ${initialSyncCount}`);
      console.log(`- Conflictos (THREE_WAY): ${threeWayConflictCount}`);
      console.log(`- Deletes en revisión (DELETE_REVIEW): ${deleteReviewCount}`);
      console.log(`- Manifiesto actualizado: ${conflicts.length === 0 && actions.some(a => a.action !== 'noop') ? 'Sí' : 'No'}`);
      console.log('------------------------------------');

      if (conflicts.length > 0) {
        console.error('\n❌ [CORE-228] Conflictos de sincronización de skills detectados:');
        conflicts.forEach(c => {
          console.error(`\nSkill: ${c.skill}`);
          console.error(`Tipo: ${c.type}`);
          if (c.type === 'THREE_WAY_CONFLICT') {
            console.error(`Activo:   ${c.activeHash}`);
            console.error(`Backup:   ${c.backupHash}`);
            console.error(`Manifest: ${c.storedHash}`);
            console.error('Acción requerida: resolver manualmente el drift y ejecutar npm run validate de nuevo.');
          } else {
            console.error(`Razón: ${c.reason}`);
            console.error('Acción requerida: restaurar el archivo faltante o eliminar su entrada en sync_manifest.json para confirmar el borrado.');
          }
        });
        hasErrors = true;
      } else {
        // Solo actualizar y escribir si realmente hubo alguna acción de sincronización (no todas noop)
        const hasRealActions = actions.some(a => a.action !== 'noop');
        if (hasRealActions) {
          manifest.lastSyncAt = now;
          writeJsonAtomic(manifestPath, manifest);
          console.log('[Info] Manifiesto sync_manifest.json actualizado de forma atómica debido a cambios en skills.');
        } else {
          // Si no hubo cambios reales, no escribimos para evitar marcar el archivo como modificado en Git
          console.log('[Info] Sin cambios detectados en skills. sync_manifest.json se conserva intacto.');
        }
      }
    }
  } catch (syncErr) {
    console.error(`⚠️ Error al sincronizar habilidades de IA: ${syncErr.message}`);
    hasErrors = true;
  }

  // 7. Validación de Trazabilidad de Roadmap (Git status vs Tarea Activa) (CORE-285)
  console.log('\n[Info] Validando correspondencia de cambios en Git con la tarea activa del Roadmap...');
  try {
    const roadmapPath = path.join(rootDir, 'Documentacion PROTOTIPE', '02_Tareas_Roadmap', 'tareas_pendientes.md');
    if (fs.existsSync(roadmapPath)) {
      const lines = fs.readFileSync(roadmapPath, 'utf8').split(/\r?\n/);
      const bulletRegex = /^\s*[-*]\s+(?:\*\*)?\[( |\/|x)\]\s+(?:~~)?(.+?)(?:~~)?(?:\*\*)?\s*$/i;

      // Buscar la primera tarea activa (no tachada con ~~)
      let activeTaskId = null;
      let activeTaskArchivos = new Set();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(bulletRegex);
        if (match) {
          const isCompleted = line.includes('~~'); // Si está tachado es histórica/cerrada
          const titleText = match[2];
          if (!isCompleted) {
            // Es la tarea activa!
            const idRegex = /(?:(CORE|CLI|BUG|DASH|TPL|PLT|INST|DOC|LND|BIZ|HOTFIX|CLIENTE|E2E)-([A-Z0-9_-]+))/i;
            const idMatch = titleText.match(idRegex);
            if (idMatch) {
              activeTaskId = `${idMatch[1].toUpperCase()}-${idMatch[2].toUpperCase()}`;

              // Extraer archivos declarados en esta tarea activa
              let inArchivos = false;
              let j = i + 1;
              while (j < lines.length) {
                const l = lines[j];
                if (l.match(/^\s*[-*]\s+(?:\*\*)?\[[ x\/]\]/i)) break;
                const trimmed = l.trim();
                if (trimmed.match(/^-\s*Archivos:/i)) {
                  const inlineRest = trimmed.replace(/^-\s*Archivos:\s*/i, '').trim();
                  if (inlineRest) {
                    const inlineFileRegex = /\[`?([^`\]]+)`?\]/g;
                    let fm;
                    while ((fm = inlineFileRegex.exec(inlineRest)) !== null) {
                      const cleanPath = fm[1].replace(/\\/g, '/');
                      activeTaskArchivos.add(cleanPath);
                    }
                  }
                  inArchivos = true;
                } else if (inArchivos) {
                  const fileMatch = trimmed.match(/^-?\s*\[`?([^`\]]+)`?\]/);
                  if (fileMatch) {
                    const cleanPath = fileMatch[1].replace(/\\/g, '/');
                    activeTaskArchivos.add(cleanPath);
                  }
                }
                j++;
              }
              break; // Solo nos interesa la primera tarea activa (la actual)
            }
          }
        }
      }

      if (activeTaskId) {
        // Obtener archivos modificados locales vía git (cubre múltiples repos del monorepo)
        const { execSync } = require('child_process');
        let gitChanges = [];

        // Helper para parsear el output de git status --porcelain
        const parseGitStatus = (output, pathPrefix = '') => {
          return output.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
              const parts = line.split(/\s+/);
              const status = parts[0];
              let filePath = parts.slice(1).join(' ').replace(/\\/g, '/');
              // Eliminar comillas dobles que git añade en Windows a rutas con espacios o no-ASCII
              if (filePath.startsWith('"') && filePath.endsWith('"')) {
                filePath = filePath.slice(1, -1);
              }
              return { status, path: pathPrefix ? `${pathPrefix}/${filePath}` : filePath };
            });
        };

        try {
          // 1. Repositorio raíz del monorepo (Documentacion, Prototipe-CLI, etc.)
          const statusRoot = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
          gitChanges.push(...parseGitStatus(statusRoot));
        } catch (err) {
          console.warn(`⚠️ No se pudo obtener el estado de Git (raíz): ${err.message}`);
        }

        // 2. Auto-descubrimiento dinámico de subrepos (todos los .git bajo rootDir hasta profundidad 4)
        // Cubre: dev-dashboard, Plantillas Core/App Ventas, Instancias Clientes actuales y futuras
        const findSubRepos = (baseDir, maxDepth = 4) => {
          const repos = [];
          const scan = (dir, depth) => {
            if (depth > maxDepth) return;
            try {
              const entries = fs.readdirSync(dir, { withFileTypes: true });
              for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const fullPath = path.join(dir, entry.name);
                // Si este directorio tiene un .git propio y no es el rootDir
                if (entry.name === '.git' && dir !== rootDir) {
                  repos.push(dir);
                  return; // No seguir escaneando dentro de un subrepo
                }
                // Ignorar node_modules, .git dirs, dist
                if (['node_modules', '.git', 'dist', '.cache'].includes(entry.name)) continue;
                scan(fullPath, depth + 1);
              }
            } catch (_) { /* Sin permisos, ignorar */ }
          };
          scan(baseDir, 0);
          return repos;
        };

        const subRepos = findSubRepos(rootDir);
        for (const repoPath of subRepos) {
          try {
            const statusSub = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf8' });
            if (!statusSub.trim()) continue; // Sin cambios, saltar
            // Calcular ruta relativa al rootDir para normalizar el prefijo
            const relPrefix = path.relative(rootDir, repoPath).replace(/\\/g, '/');
            gitChanges.push(...parseGitStatus(statusSub, relPrefix));
          } catch (_) { /* Subrepo sin cambios o sin git, ignorar */ }
        }


        const missingRegistries = [];
        gitChanges.forEach(change => {
          const file = change.path;
          // Ignorar archivos de sistema y temporales
          if (
            file.includes('node_modules') ||
            file.startsWith('.gemini') ||
            file.startsWith('.git') ||
            file.includes('sync_manifest.json') ||
            file.endsWith('tareas_pendientes.md') ||
            file.endsWith('bitacora_cambios.md') ||
            file.includes('scratch/') ||
            file.endsWith('notification_config.json') ||
            file.includes('/.tmp/') ||
            file.includes('\\.tmp\\') ||
            file.includes('.firebase/') ||
            file.endsWith('.cache') ||
            file.endsWith('GEMINI.md') ||
            file.endsWith('AGENTS.md')
          ) {
            return;
          }

          // Verificar si la ruta del archivo modificado coincide con alguna declarada en la tarea
          let isRegistered = false;
          const fileLower = file.toLowerCase();
          // Si git reporta un directorio completo (untracked dir termina en '/'),
          // basta con que algún archivo registrado empiece con ese prefijo de directorio
          const isDir = fileLower.endsWith('/');
          for (const registeredPath of activeTaskArchivos) {
            const regLower = registeredPath.toLowerCase();
            if (
              fileLower === regLower ||
              fileLower.endsWith(regLower) ||
              (isDir && regLower.startsWith(fileLower)) ||
              (!isDir && regLower.endsWith(fileLower))
            ) {
              isRegistered = true;
              break;
            }
          }

          if (!isRegistered) {
            missingRegistries.push(file);
          }
        });

        if (missingRegistries.length > 0) {
          console.error(`\n❌ [Fallo Linter] Se detectaron cambios locales en Git no registrados en la tarea activa (${activeTaskId}):`);
          missingRegistries.forEach(file => {
            console.error(`  - [No Registrado] ${file}`);
          });
          console.error(`Acción requerida: Registra estos archivos en la lista '- Archivos:' de la tarea ${activeTaskId} en tareas_pendientes.md.`);
          hasErrors = true;
        } else {
          console.log(`[Éxito] Todos los cambios locales en Git están debidamente registrados en la tarea activa (${activeTaskId}).`);
        }
      } else {
        console.warn('⚠️ No se detectó ninguna tarea activa en progreso en tareas_pendientes.md.');
      }
    }
  } catch (err) {
    console.error(`⚠️ Error al validar correspondencia de cambios en Git con el Roadmap: ${err.message}`);
    hasErrors = true;
  }

  // Comportamiento de salida final
  if (hasErrors) {
    console.error('\n==================================================');
    console.error(' ❌ LA VERIFICACIÓN DE INTEGRIDAD FALLÓ.');
    console.error(' Corrige los errores descritos arriba para poder construir la app.');
    console.error('==================================================');

    // Alerta DevOps: Fallo de Integridad (Build)
    const payload = {
      clientId: 'dev-dashboard',
      componentName: 'verify_library_integrity.cjs',
      errorMessage: 'Fallo de verificación de integridad en prebuild del dashboard.',
      stackTrace: 'El linter local detectó desalineación en el roadmap, enlaces rotos, componentes huérfanos o violación del estándar.',
      severity: 'high'
    };

    fetch('http://localhost:5050/api/notify/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(() => process.exit(1))
      .catch(() => process.exit(1));
  } else {
    console.log('\n==================================================');
    console.log('  ✅ INTEGRIDAD DE LA BIBLIOTECA AL 100% OK.');
    console.log('==================================================\n');
    process.exit(0);
  }

} catch (error) {
  console.error('[Error] Error grave al validar la integridad de la biblioteca:', error);

  // Alerta DevOps: Excepción en verificación
  const payload = {
    clientId: 'dev-dashboard',
    componentName: 'verify_library_integrity.cjs',
    errorMessage: `Excepción grave en verificación: ${error.message}`,
    stackTrace: error.stack || 'Error de compilación o ejecución del script.',
    severity: 'critical'
  };

  fetch('http://localhost:5050/api/notify/error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(() => process.exit(1))
    .catch(() => process.exit(1));
}
