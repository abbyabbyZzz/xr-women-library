import { spawnSync } from 'node:child_process';

export const repository = 'abbyabbyZzz/xr-women-library';
export const pagesUrl = 'https://abbyabbyzzz.github.io/xr-women-library/';
export const defaultApiUrl = 'https://xr-women-zotero-api-abby.snugotter139.chatgpt.site/api/papers';

export function createGitHubClient() {
  let token;
  let checkedAt = 0;
  async function request(path, method = 'GET', body) {
    const response = await fetch(`https://api.github.com${path}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, data: await response.json().catch(() => ({})) };
  }
  async function connect() {
    if (token && Date.now() - checkedAt < 240000) return;
    const owner = repository.split('/')[0];
    const credential = spawnSync('git', ['credential', 'fill'], {
      input: `protocol=https\nhost=github.com\nusername=${owner}\n\n`,
      encoding: 'utf8', windowsHide: true, timeout: 10000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
    });
    if (credential.status !== 0) throw new Error('无法读取本机 GitHub 登录。请用 Git Credential Manager 登录自己的 GitHub 账号后重试。');
    token = credential.stdout.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
    if (!token) throw new Error('本机没有可用的 GitHub 登录凭据。');
    const user = await request('/user');
    if (user.status !== 200 || user.data.login?.toLowerCase() !== owner.toLowerCase()) {
      token = undefined;
      throw new Error(`GitHub 登录需要是 ${owner}，当前连接未通过核对。`);
    }
    checkedAt = Date.now();
  }
  const base = `/repos/${repository}`;
  function requireSuccess(result, operation) {
    if (result.status < 200 || result.status >= 300) throw new Error(`${operation}失败（GitHub HTTP ${result.status}）。请检查账号的仓库权限。`);
    return result.data;
  }
  return {
    async status() {
      await connect();
      const [repo, pages, runs, variable] = await Promise.all([
        request(base), request(`${base}/pages`), request(`${base}/actions/workflows/deploy-pages.yml/runs?per_page=3`), request(`${base}/actions/variables/ZOTERO_API_URL`),
      ]);
      const repoData = requireSuccess(repo, '读取仓库');
      if (variable.status !== 404) requireSuccess(variable, '读取连接设置');
      return {
        connected: true, login: repository.split('/')[0], repository, branch: repoData.default_branch,
        pagesUrl: pages.status === 200 ? pages.data.html_url : pagesUrl,
        apiUrl: variable.status === 200 ? variable.data.value : defaultApiUrl,
        runs: runs.status === 200 ? runs.data.workflow_runs.map(run => ({ id: run.id, status: run.status, conclusion: run.conclusion, url: run.html_url, updatedAt: run.updated_at, commit: run.head_sha.slice(0, 7) })) : [],
      };
    },
    async saveApiUrl(apiUrl) {
      await connect();
      const current = await request(`${base}/actions/variables/ZOTERO_API_URL`);
      if (current.status !== 404) requireSuccess(current, '读取连接设置');
      const result = current.status === 404
        ? await request(`${base}/actions/variables`, 'POST', { name: 'ZOTERO_API_URL', value: apiUrl })
        : await request(`${base}/actions/variables/ZOTERO_API_URL`, 'PATCH', { name: 'ZOTERO_API_URL', value: apiUrl });
      requireSuccess(result, '保存 API 地址');
    },
    async publish() {
      await connect();
      requireSuccess(await request(`${base}/actions/workflows/deploy-pages.yml/dispatches`, 'POST', { ref: 'main' }), '启动发布');
      return { message: '已启动发布。请在发布记录中等待完成后打开网站。' };
    },
  };
}
