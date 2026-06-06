import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)), '');
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'drizzle', 'scripts']);
const SKIP_FILES = new Set(['package-lock.json', 'tsconfig.tsbuildinfo']);
const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.scss']);

let totalFiles = 0;
let totalChanged = 0;

export function stripJSComments(code) {
  const len = code.length;
  const out = [];
  let i = 0;

  while (i < len) {
    const ch = code[i];

    // ── String literals (single/double quoted) ──
    if (ch === '"' || ch === "'") {
      out.push(ch);
      i++;
      while (i < len) {
        const c = code[i];
        if (c === '\\') {
          out.push(c);
          i++;
          if (i < len) { out.push(code[i]); i++; }
        } else if (c === ch) {
          out.push(c);
          i++;
          break;
        } else {
          out.push(c);
          i++;
        }
      }
      continue;
    }

    // ── Template literals (with ${} nesting tracking) ──
    if (ch === '`') {
      out.push('`');
      i++;
      let depth = 0;
      while (i < len) {
        const c = code[i];
        if (c === '\\') {
          out.push(c);
          i++;
          if (i < len) { out.push(code[i]); i++; }
        } else if (c === '`' && depth === 0) {
          out.push('`');
          i++;
          break;
        } else if (c === '$' && i + 1 < len && code[i + 1] === '{') {
          out.push('${');
          i += 2;
          depth++;
        } else if (c === '}' && depth > 0) {
          out.push('}');
          i++;
          depth--;
        } else {
          out.push(c);
          i++;
        }
      }
      continue;
    }

    // ── JSX comment: {/* ... */} ──
    if (ch === '{' && i + 2 < len && code[i + 1] === '/' && code[i + 2] === '*') {
      i += 3;
      while (i < len) {
        if (code[i] === '*' && i + 1 < len && code[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
      // Consume the closing `}` of the JSX expression
      if (i < len && code[i] === '}') {
        i++;
      }
      continue;
    }

    // ── Single-line comment: // ──
    if (ch === '/' && i + 1 < len && code[i + 1] === '/') {
      i += 2;
      while (i < len && code[i] !== '\n') {
        i++;
      }
      continue;
    }

    // ── Multi-line comment: /* ... */ ──
    if (ch === '/' && i + 1 < len && code[i + 1] === '*') {
      i += 2;
      while (i < len) {
        if (code[i] === '*' && i + 1 < len && code[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }

    out.push(ch);
    i++;
  }

  return out.join('');
}

export function stripCSSComments(code) {
  const len = code.length;
  const out = [];
  let i = 0;

  while (i < len) {
    const ch = code[i];

    // String literals
    if (ch === '"' || ch === "'") {
      out.push(ch);
      i++;
      while (i < len) {
        const c = code[i];
        if (c === '\\') { out.push(c); i++; if (i < len) { out.push(code[i]); i++; } }
        else if (c === ch) { out.push(c); i++; break; }
        else { out.push(c); i++; }
      }
      continue;
    }

    // /* ... */
    if (ch === '/' && i + 1 < len && code[i + 1] === '*') {
      i += 2;
      while (i < len) {
        if (code[i] === '*' && i + 1 < len && code[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }

    out.push(ch);
    i++;
  }

  return out.join('');
}

function processFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!SOURCE_EXTS.has(ext)) return false;

  const original = readFileSync(filePath, 'utf-8');
  const stripped = ext === '.css' || ext === '.scss'
    ? stripCSSComments(original)
    : stripJSComments(original);

  if (original === stripped) return false;
  writeFileSync(filePath, stripped, 'utf-8');
  return true;
}

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkDir(fullPath);
    } else if (entry.isFile() && !SKIP_FILES.has(entry.name)) {
      totalFiles++;
      if (processFile(fullPath)) {
        totalChanged++;
        console.log(`  ${relative(ROOT, fullPath)}`);
      }
    }
  }
}

console.log('Stripping comments from source files...\n');
walkDir(ROOT);
console.log(`\nDone — ${totalChanged} of ${totalFiles} files had comments removed.`);
