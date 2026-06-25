const fs = require('fs');
const path = require('path');

// Resolver rutas relativas basadas en el directorio de ejecución (scripts)
const devDashboardDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(devDashboardDir, '..', '..');
const docsRoot = path.join(rootDir, 'Documentacion PROTOTIPE');
const libraryReadmePath = path.join(docsRoot, '06_Biblioteca_Componentes', 'README.md');
const componentsDir = path.join(docsRoot, '06_Biblioteca_Componentes');
const modulesDir = path.join(docsRoot, '09_Modulos_Completos');
const componentSandboxPath = path.join(devDashboardDir, 'src', 'components', 'admin', 'ComponentSandbox.jsx');

console.log('==================================================');
console.log('  EJECUTANDO VERIFICACIÓN DE INTEGRIDAD DE BIBLIOTECA');
console.log('==================================================');
console.log(`Directorio del Dashboard: ${devDashboardDir}`);
console.log(`Directorio de Documentación: ${docsRoot}`);

let hasErrors = false;

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
    // Buscar file:///D:/PROTOTIPE/Documentacion%20PROTOTIPE/...
    const matches = line.match(/file:\/\/\/D:\/PROTOTIPE\/Documentacion%20PROTOTIPE\/[a-zA-Z0-9_\-\/%]+\.[a-zA-Z0-9]+/gi);
    if (matches) {
      matches.forEach(matchedUri => {
        const cleanUri = decodeURIComponent(matchedUri);
        const relativePart = cleanUri.replace(/file:\/\/\/D:\/PROTOTIPE\//i, '').replace(/\//g, path.sep);
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

  // Comportamiento de salida final
  if (hasErrors) {
    console.error('\n==================================================');
    console.error(' ❌ LA VERIFICACIÓN DE INTEGRIDAD FALLÓ.');
    console.error(' Corrige los errores descritos arriba para poder construir la app.');
    console.error('==================================================');
    process.exit(1);
  } else {
    console.log('\n==================================================');
    console.log('  ✅ INTEGRIDAD DE LA BIBLIOTECA AL 100% OK.');
    console.log('==================================================\n');
    process.exit(0);
  }

} catch (error) {
  console.error('[Error] Error grave al validar la integridad de la biblioteca:', error);
  process.exit(1);
}
