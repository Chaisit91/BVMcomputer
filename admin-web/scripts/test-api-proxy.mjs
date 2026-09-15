import assert from 'node:assert/strict'
import http from 'node:http'
import { createServer } from 'vite'

// Exercise the real Vite config with a test backend, without real credentials.
const backend = http.createServer((req, res) => {
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    res.setHeader('Set-Cookie', 'bvm_session=test-session; Path=/; HttpOnly; SameSite=Lax')
    res.end('{}')
    return
  }
  res.statusCode = req.headers.cookie === 'bvm_session=test-session' ? 200 : 401
  res.end('{}')
})
await new Promise(resolve => backend.listen(0, '127.0.0.1', resolve))
process.env.BACKEND_PROXY_TARGET = `http://127.0.0.1:${backend.address().port}`
let vite
try {
  vite = await createServer({ server: { host: '127.0.0.1', port: 0, open: false } })
  await vite.listen()
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`
  assert.equal((await fetch(origin + '/api/cpus')).status, 401)
  const login = await fetch(origin + '/api/auth/login', { method: 'POST' })
  assert.equal(login.status, 200)
  const cookie = login.headers.get('set-cookie')
  assert.ok(cookie.includes('SameSite=Lax'))
  assert.ok(!/Domain=/i.test(cookie))
  const products = await fetch(origin + '/api/cpus', { headers: { Cookie: cookie.split(';')[0] } })
  assert.equal(products.status, 200)
  console.log('PASS: same-origin login cookie and authenticated inventory request through Vite proxy')
} finally {
  await vite?.close()
  await new Promise(resolve => backend.close(resolve))
}
