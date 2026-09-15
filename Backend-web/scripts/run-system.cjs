// Start all three services with private, per-run service tokens.
const { spawn } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const net = require('node:net')
const backend = path.resolve(__dirname, '..')
const root = path.resolve(backend, '..')
const config = { ...dotenv.parse(fs.readFileSync(path.join(backend, '.env'))), ...process.env }
const port = Number(config.PORT || 8080)
const aiPort = Number(config.AI_PORT || 8100)
if ([port, aiPort].some(value => !Number.isInteger(value) || value < 1 || value > 65535) || !config.DATABASE_URL) throw new Error('Check Backend-web/.env: PORT, AI_PORT and DATABASE_URL')
const origin = `http://127.0.0.1:${port}`
const aiOrigin = `http://127.0.0.1:${aiPort}`
const catalogToken = randomBytes(32).toString('hex')
const serviceToken = randomBytes(32).toString('hex')
const children = []
const clientEnv = { ...process.env }
for (const key of Object.keys(clientEnv)) {
  if (/^(DATABASE_URL|DIRECT_URL|SUPABASE_|JWT_SECRET|PGPASSWORD|AI_CATALOG_TOKEN|AI_SERVICE_TOKEN|BUILDCORES_API_TOKEN)/.test(key)) delete clientEnv[key]
}
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill()
  process.exitCode = code
}
function start(command, args, cwd, env) {
  const child = spawn(command, args, { cwd, env, stdio: 'inherit', windowsHide: true })
  children.push(child)
  child.on('error', () => { console.error('Could not start service in ' + path.basename(cwd)); stop(1) })
  child.on('exit', code => { if (!stopping) { console.error(path.basename(cwd) + ' exited with code ' + code); stop(code ?? 1) } })
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
async function main() {
  // Windows can otherwise allow two Python servers to bind the same port.
  for (const value of [port, aiPort, 5173]) {
    await new Promise((resolve, reject) => {
      const probe = net.createServer()
      probe.once('error', () => reject(new Error(`Port ${value} is already in use. Stop that service or change PORT/AI_PORT.`)))
      probe.listen(value, '127.0.0.1', () => probe.close(resolve))
    })
  }
  start(process.execPath, ['-r', 'ts-node/register', 'src/index.ts'], backend, {
    ...config, PORT: String(port), CORS_ORIGIN: config.CORS_ORIGIN || 'http://localhost:5173',
    AI_SERVICE_URL: aiOrigin, AI_SERVICE_TOKEN: serviceToken, AI_CATALOG_TOKEN: catalogToken,
  })
  let ready = false
  for (let i = 0; i < 60 && !stopping; i++) {
    try {
      const res = await fetch(origin + '/api/internal/ai/catalog', { headers: { Authorization: `Bearer ${catalogToken}` }, signal: AbortSignal.timeout(2000) })
      if (res.ok) { ready = true; break }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Backend or Supabase is not ready. Check the Backend log.')
  start(config.PYTHON || 'python', ['-B', '-u', 'my-scripts/compatibility_api.py', '--host', '127.0.0.1', '--port', String(aiPort)], path.join(root, 'ai'), {
    ...clientEnv, AI_BACKEND_URL: origin, AI_CATALOG_TOKEN: catalogToken, BUILDCORES_API_TOKEN: serviceToken,
  })
  start(process.execPath, [path.join(root, 'admin-web/node_modules/vite/bin/vite.js'), '--host', 'localhost', '--port', '5173', '--strictPort'], path.join(root, 'admin-web'), {
    ...clientEnv, VITE_API_URL: '/api', BACKEND_PROXY_TARGET: origin, VITE_USE_MOCK_DATA: 'false',
  })
  console.log('Admin: http://localhost:5173 | Backend: ' + origin + ' | AI: private port ' + aiPort)
  console.log('Supabase drafts are visible in Admin. Publish reviewed products to make them available to AI.')
  if (process.argv.includes('--check')) {
    let checked = false
    let failure = 'Services did not become ready'
    for (let i = 0; i < 40 && !stopping; i++) {
      try {
        const health = await fetch(aiOrigin + '/health', { headers: { Authorization: `Bearer ${serviceToken}` }, signal: AbortSignal.timeout(2000) })
        const admin = await fetch('http://localhost:5173', { signal: AbortSignal.timeout(2000) })
        if (health.ok && admin.ok) {
          const result = await health.json()
          if (result.catalog_source !== 'backend-postgres') throw new Error('Unexpected AI catalog source')
          console.log(JSON.stringify({ connected: true, ai: result.catalog_source, counts: result.catalog_counts, admin: admin.status }))
          checked = true
          break
        }
        failure = `AI HTTP ${health.status}, Admin HTTP ${admin.status}`
      } catch (error) { failure = error.message + (error.cause?.code ? ': ' + error.cause.code : '') }
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    if (!checked) console.error(failure)
    stop(checked ? 0 : 1)
  }
}
main().catch(error => { console.error(error.message); stop(1) })
