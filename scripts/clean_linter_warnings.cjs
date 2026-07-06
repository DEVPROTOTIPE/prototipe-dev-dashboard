const fs = require('fs');
const path = require('path');

const rootDir = 'D:\\PROTOTIPE';
const docsRoot = path.join(rootDir, 'Documentacion PROTOTIPE');
const devDashboardDir = path.join(rootDir, 'Central PROTOTIPE', 'dev-dashboard');

const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

if (isDryRun) {
  console.log('==================================================');
  console.log('  MODO SIMULACIÓN (DRY-RUN) ACTIVO');
  console.log('  No se realizarán escrituras físicas en disco.');
  console.log('==================================================\n');
}

// Recursively find files
function getFiles(dir, filter) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, filter));
    } else if (filter(fullPath)) {
      results.push(fullPath);
    }
  });
  return results;
}

// 1. Process Markdown Files
const mdFiles = getFiles(path.join(docsRoot, '06_Biblioteca_Componentes'), f => f.endsWith('.md'))
  .concat(getFiles(path.join(docsRoot, '09_Modulos_Completos'), f => f.endsWith('.md')));

let mdUpdatesCount = 0;
mdFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  const basename = path.basename(file);

  // Replace colors
  const newContent = content
    .replace(/bg-slate-950/g, 'bg-[var(--color-bg)]')
    .replace(/bg-slate-900/g, 'bg-[var(--color-surface)]')
    .replace(/border-slate-800/g, 'border-[var(--color-border)]')
    .replace(/border-slate-850/g, 'border-[var(--color-border)]')
    .replace(/border-slate-900/g, 'border-[var(--color-border)]');

  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  // Regex flexible para capturar títulos de código no estándar
  const headingRegex = /^##\s+(?!3\.|[0-9]+\.)(?:[^\n\w]*\s*)?C[óo]digo(?:\s+React)?(?:\s+Completo)?(?:\s+y\s+100%\s+Funcional)?(?:\s*\(.*?\))?\s*$/gim;
  if (headingRegex.test(content)) {
    content = content.replace(headingRegex, '## 3. Código React Completo');
    changed = true;
  }

  // Tratamiento especial para propuestas o informes técnicos sin código react
  if (basename === 'propuesta_commits_despliegues.md') {
    if (!content.includes('## 3. Código React Completo')) {
      content += '\n\n## 3. Código React Completo\n\n```jsx\n// No aplica para propuesta técnica\n```\n';
      changed = true;
    }
  }

  if (changed) {
    mdUpdatesCount++;
    if (isDryRun) {
      console.log(`[Simulación] Se actualizaría ficha: ${basename}`);
    } else {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated markdown file: ${basename}`);
    }
  }
});

// 2. Process Sandbox JSX Files
const jsxFiles = getFiles(path.join(devDashboardDir, 'src', 'components', 'admin', 'sandboxes'), f => f.endsWith('.jsx'));

let jsxUpdatesCount = 0;
jsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = content
    .replace(/bg-slate-950/g, 'bg-[var(--color-bg)]')
    .replace(/bg-slate-900/g, 'bg-[var(--color-surface)]')
    .replace(/border-slate-800/g, 'border-[var(--color-border)]')
    .replace(/border-slate-850/g, 'border-[var(--color-border)]')
    .replace(/border-slate-900/g, 'border-[var(--color-border)]');

  if (newContent !== content) {
    jsxUpdatesCount++;
    if (isDryRun) {
      console.log(`[Simulación] Se actualizaría sandbox: ${path.basename(file)}`);
    } else {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Updated JSX file: ${path.basename(file)}`);
    }
  }
});

console.log('\n==================================================');
if (isDryRun) {
  console.log(`[Simulación completada] Propuestas: ${mdUpdatesCount} fichas MD y ${jsxUpdatesCount} sandboxes JSX.`);
} else {
  console.log(`[Limpieza completada] Se modificaron físicamente: ${mdUpdatesCount} fichas MD y ${jsxUpdatesCount} sandboxes JSX.`);
}
console.log('==================================================\n');
