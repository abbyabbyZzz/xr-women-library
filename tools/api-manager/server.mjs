import { createServer, get } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createGitHubClient, defaultApiUrl, pagesUrl, repository } from './github.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
function readRunningManager(port) {
  return new Promise(resolve => {
    const request = get(`http://127.0.0.1:${port}/manager/session`, { agent: false }, response => {
      let body = '';
      response.on('data', chunk => {
        body += chunk;
        if (body.length > 32768) { resolve(null); request.destroy(); }
      });
      response.on('end', () => {
        try { resolve(response.statusCode === 200 ? JSON.parse(body) : null); } catch { resolve(null); }
      });
      response.on('error', () => resolve(null));
    });
    request.setTimeout(5000, () => { resolve(null); request.destroy(); });
    request.on('error', () => resolve(null));
  });
}
export function validateApiUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('请输入完整的 HTTPS API 地址。'); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.port || host === 'localhost' || host.endsWith('.localhost') || !host.includes('.') || /^\d|^\[/.test(host)) throw new Error('API 必须是公开的 HTTPS 地址，不包含账号、密码、端口或查询参数。');
  return url.href;
}
export async function probeApi(value) {
  const apiUrl = validateApiUrl(value);
  const checkedAt = new Date().toISOString();
  const start = performance.now();
  const target = new URL(apiUrl);
  target.searchParams.set('_check', Date.now().toString());
  const origin = new URL(pagesUrl).origin;
  const response = await fetch(target, { headers: { Accept: 'application/json', Origin: origin, 'Cache-Control': 'no-cache' }, redirect: 'error', signal: AbortSignal.timeout(20000) });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload?.data)) throw new Error(`API 没有返回可用馆藏（HTTP ${response.status}）。请检查服务端连接设置。`);
  const cors = response.headers.get('access-control-allow-origin');
  const health = await fetch(new URL('/health', apiUrl), { redirect: 'error', signal: AbortSignal.timeout(10000) }).then(r => r.ok ? r.json() : null).catch(() => null);
  return {
    apiUrl, checkedAt, count: payload.data.length, version: payload.meta?.libraryVersion || '—', groupId: payload.meta?.groupId || '—',
    fetchedAt: payload.meta?.fetchedAt || checkedAt, latency: Math.round(performance.now() - start), httpStatus: response.status,
    corsAllowed: cors === '*' || cors === origin, serverConfigured: typeof health?.configured === 'boolean' ? health.configured : null,
  };
}

export function createManager({ root = path.resolve(directory, '../..'), github = createGitHubClient(), probe = probeApi } = {}) {
  const token = randomBytes(32).toString('hex');
  const configFile = path.join(root, '.local/api-manager.json');
  let writing = false;
  async function loadSettings() {
    if (!existsSync(configFile)) return { apiUrl: defaultApiUrl, savedAt: null };
    const settings = JSON.parse(await readFile(configFile, 'utf8'));
    return { apiUrl: validateApiUrl(settings.apiUrl), savedAt: settings.savedAt || null };
  }
  function json(response, status, data) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(data));
  }
  const server = createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    const port = server.address()?.port;
    const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!hosts.includes(request.headers.host) || (request.headers.origin && !hosts.some(host => request.headers.origin === `http://${host}`))) return json(response, 403, { error: '只接受本机管理页面的请求。' });
    const url = new URL(request.url, `http://${request.headers.host}`);
    try {
      if (request.method === 'GET') {
        if (url.pathname === '/manager/session') return json(response, 200, { token, repository, pagesUrl, ...await loadSettings() });
        if (url.pathname === '/manager/status') {
          try { return json(response, 200, await github.status()); }
          catch (error) { return json(response, 200, { connected: false, repository, pagesUrl, error: error.message, runs: [] }); }
        }
        const assets = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'] };
        const asset = assets[url.pathname];
        if (!asset) return json(response, 404, { error: '页面不存在。' });
        response.writeHead(200, { 'Content-Type': asset[1] });
        return response.end(await readFile(path.join(directory, 'web', asset[0])));
      }
      if (request.method !== 'POST') return json(response, 405, { error: '此操作不受支持。' });
      const supplied = Buffer.from(String(request.headers['x-manager-token'] || ''));
      if (supplied.length !== token.length || !timingSafeEqual(supplied, Buffer.from(token)) || !request.headers['content-type']?.startsWith('application/json')) return json(response, 403, { error: '管理页面会话已失效，请刷新页面重试。' });
      let text = '';
      for await (const chunk of request) {
        text += chunk;
        if (Buffer.byteLength(text) > 16384) return json(response, 413, { error: '设置内容过长。' });
      }
      let body;
      try { body = JSON.parse(text || '{}'); } catch { return json(response, 400, { error: '设置格式无效。' }); }
      if (url.pathname === '/manager/probe') return json(response, 200, await probe(validateApiUrl(body.apiUrl)));
      if (url.pathname === '/manager/stop') {
        json(response, 200, { message: '管理器已关闭。下次双击启动文件即可重新打开。' });
        setTimeout(() => { server.close(); server.closeAllConnections(); }, 150).unref();
        return;
      }
      if (!['/manager/save', '/manager/publish'].includes(url.pathname)) return json(response, 404, { error: '操作不存在。' });
      if (writing) return json(response, 409, { error: '上一个更新操作还未完成，请稍后重试。' });
      writing = true;
      try {
        if (url.pathname === '/manager/publish') return json(response, 200, await github.publish());
        const apiUrl = validateApiUrl(body.apiUrl);
        const report = await probe(apiUrl);
        if (!report.corsAllowed) return json(response, 400, { error: 'API 尚未允许 GitHub Pages 域名访问。请先在服务端添加网站域名，再保存。' });
        await github.saveApiUrl(apiUrl);
        const savedAt = new Date().toISOString();
        await mkdir(path.dirname(configFile), { recursive: true });
        await writeFile(`${configFile}.tmp`, JSON.stringify({ apiUrl, savedAt }, null, 2) + '\n');
        await rename(`${configFile}.tmp`, configFile);
        const envFile = path.join(root, '.env.local');
        const existing = existsSync(envFile) ? await readFile(envFile, 'utf8') : '';
        const setting = `VITE_ZOTERO_API_URL=${apiUrl}`;
        const next = /^VITE_ZOTERO_API_URL=.*$/m.test(existing) ? existing.replace(/^VITE_ZOTERO_API_URL=.*$/m, setting) : `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}${setting}\n`;
        await writeFile(`${envFile}.tmp`, next);
        await rename(`${envFile}.tmp`, envFile);
        return json(response, 200, { apiUrl, savedAt, message: '连接设置已保存到本机和 GitHub。点击“发布网站”使线上生效。' });
      } finally { writing = false; }
    } catch (error) {
      const message = error.name === 'TimeoutError' ? '连接超时，请检查网络后重试。' : error.message === 'fetch failed' ? '无法连接服务，请检查网络和 API 地址。' : error.message;
      json(response, 400, { error: message });
    }
  });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const portIndex = process.argv.indexOf('--port');
  const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 4190;
  const server = createManager();
  const openBrowser = url => {
    if (process.argv.includes('--open') && process.platform === 'win32') spawn('explorer.exe', [url], { windowsHide: true, detached: true, stdio: 'ignore' }).unref();
  };
  server.on('error', async error => {
    if (error.code === 'EADDRINUSE') {
      const url = `http://127.0.0.1:${port}/`;
      const existing = await readRunningManager(port);
      if (existing?.repository === repository && existing?.pagesUrl === pagesUrl && typeof existing?.token === 'string') {
        console.log(`管理器已经在运行：${url}`);
        openBrowser(url);
        return;
      }
      console.error(`端口 ${port} 已被其他程序使用，请使用 --port 指定另一个端口。`);
    } else console.error('本地管理器无法启动。');
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`XR Women API 管理器：${url}\n只在本机开放。关闭此窗口或页面中的“关闭管理器”即可停止。`);
    openBrowser(url);
  });
}
