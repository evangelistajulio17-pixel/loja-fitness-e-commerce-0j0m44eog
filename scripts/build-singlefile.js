/**
 * Script gerador de versão single-file (HTML único com JS/CSS embutidos)
 * para abertura direta via duplo-clique no arquivo local (protocolo file://),
 * sem quebrar nem alterar o build padrão para servidores web.
 *
 * Como usar:
 *   npm run build:local
 *
 * Gera o arquivo:
 *   dist/loja-fitness-local.html (e atualiza dist/index.html se desejado)
 * que pode ser aberto diretamente no Google Chrome, Edge, Firefox ou Safari
 * sem necessidade de servidor local (Node, Python ou Live Server).
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const distDir = path.resolve(rootDir, 'dist')

console.log('🚀 Iniciando build single-file para abertura local via file://...')

// 1. Executa o build de produção padrão caso a pasta dist não exista ou precise ser atualizada
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('📦 Executando "npm run build" para compilar os assets...')
  execSync('npm run build', { stdio: 'inherit' })
}

const htmlPath = path.join(distDir, 'index.html')
if (!fs.existsSync(htmlPath)) {
  console.error('❌ Erro: dist/index.html não foi encontrado após o build.')
  process.exit(1)
}

let html = fs.readFileSync(htmlPath, 'utf-8')

// 2. Localiza e embute todos os arquivos CSS <link rel="stylesheet" href="...">
html = html.replace(/<link\s+[^>]*?rel=["']stylesheet["'][^>]*?>/gi, (match) => {
  const hrefMatch = match.match(/href=["']([^"']+)["']/i)
  if (!hrefMatch) return match

  let cssRelPath = hrefMatch[1]
  // Remove ./ ou / inicial
  cssRelPath = cssRelPath.replace(/^\.?\//, '')
  const fullCssPath = path.join(distDir, cssRelPath)

  if (fs.existsSync(fullCssPath)) {
    console.log(`✨ Embutindo CSS: ${cssRelPath}`)
    const cssContent = fs.readFileSync(fullCssPath, 'utf-8')
    const sanitizedCss = cssContent.replace(/@charset\s+["'][^"']*["'];?/gi, '').trim()
    return `<style>\n${sanitizedCss}\n</style>`
  }

  return match
})

// 3. Remove tags <link rel="modulepreload" ...>
html = html.replace(/<link\s+[^>]*?rel=["']modulepreload["'][^>]*?>\s*/gi, '')

// 4. Localiza e embute os scripts <script type="module" crossorigin src="..."></script>
html = html.replace(/<script\s+[^>]*?src=["']([^"']+)["'][^>]*?>\s*<\/script>/gi, (match, src) => {
  // Ignora scripts externos como https://goskip.dev/skip.js
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
    return match
  }

  let jsRelPath = src.replace(/^\.?\//, '')
  const fullJsPath = path.join(distDir, jsRelPath)

  if (fs.existsSync(fullJsPath)) {
    console.log(`✨ Embutindo JS: ${jsRelPath}`)
    let jsContent = fs.readFileSync(fullJsPath, 'utf-8')

    // Evita fechamentos de tags prematuras em strings
    jsContent = jsContent
      .replace(/"?__VITE_PRELOAD__"?/g, 'void 0')
      .replace(/<\/script>/gi, '<\\/script>')

    // Ao embutir inline dentro do HTML, um <script type="module"> inline executa normalmente
    // no navegador em páginas file:// no Chrome, Edge e Firefox modernos.
    return `<script type="module">\n${jsContent}\n</script>`
  }

  return match
})

// 4.1 Injeta <base href="./"> se ainda não houver, para suporte a arquivos relativos em file://
if (!html.includes('<base')) {
  html = html.replace(/<head[^>]*>/i, (match) => `${match}\n    <base href="./" />`)
}

// 5. Salva o arquivo gerado
const outputSingleFilePath = path.join(distDir, 'loja-fitness-local.html')
fs.writeFileSync(outputSingleFilePath, html, 'utf-8')

// Também grava dist/index-local.html para conveniência
fs.writeFileSync(path.join(distDir, 'index-local.html'), html, 'utf-8')

console.log('✅ Sucesso! Arquivo single-file gerado em:')
console.log(`   👉 ${outputSingleFilePath}`)
console.log(`   👉 ${path.join(distDir, 'index-local.html')}`)
console.log('   Você pode dar duplo clique diretamente nesse arquivo ou abrir com seu navegador!')
