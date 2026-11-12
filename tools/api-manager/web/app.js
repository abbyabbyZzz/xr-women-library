const $ = selector => document.querySelector(selector);
let session;
let dirty = false;
let connected = false;
let poll;
const date = value => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—';
function message(text, error = false) { const box = $('#message'); box.hidden = false; box.textContent = text; box.classList.toggle('error', error); }
async function request(url, body) {
  const response = await fetch(url, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Manager-Token': session.token }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '操作未完成，请稍后重试。');
  return data;
}
async function busy(button, label, action) {
  const previous = button.textContent; button.disabled = true; button.textContent = label;
  try { return await action(); } catch (error) { message(error.message, true); } finally { button.disabled = false; button.textContent = previous; $('#publish').disabled = !connected || dirty; }
}
function paintReport(report) {
  $('#connection-state').textContent = `连接正常 · HTTP ${report.httpStatus} · ${report.latency} ms`;
  $('#connection-state').className = 'status-text good';
  $('#paper-count').textContent = report.count; $('#library-version').textContent = report.version; $('#group-id').textContent = report.groupId; $('#fetched-at').textContent = date(report.fetchedAt);
  $('#cors-state').textContent = `网站访问权限：${report.corsAllowed ? 'GitHub Pages 已允许' : '需要在服务端允许网站域名'}`;
  $('#server-state').textContent = `服务端连接：${report.serverConfigured === null ? '未提供健康检查' : report.serverConfigured ? '已配置' : '尚未配置'}`;
}
async function probe() {
  try { const report = await request('/manager/probe', { apiUrl: $('#api-url').value.trim() }); paintReport(report); return report; }
  catch (error) { $('#connection-state').textContent = error.message; $('#connection-state').className = 'status-text bad'; throw error; }
}
async function refresh() {
  const status = await request('/manager/status');
  connected = status.connected;
  $('#github-state').textContent = connected ? `已连接 ${status.login} · ${status.repository}` : status.error;
  $('#github-state').className = `status-text ${connected ? 'good' : 'bad'}`;
  $('#publish').disabled = !connected || dirty;
  if (!dirty && status.apiUrl) $('#api-url').value = status.apiUrl;
  const tbody = $('#runs'); tbody.replaceChildren();
  const labels = { queued: '等待中', in_progress: '发布中', completed: '已结束', success: '发布成功', failure: '发布失败', cancelled: '已取消', action_required: '需要处理', waiting: '等待中' };
  if (!status.runs.length) { const row = tbody.insertRow(); const cell = row.insertCell(); cell.colSpan = 4; cell.textContent = connected ? '暂无发布记录。' : '连接 GitHub 后查看发布记录。'; }
  for (const run of status.runs) {
    const row = tbody.insertRow();
    for (const text of [run.commit, labels[run.conclusion || run.status] || run.status, date(run.updatedAt)]) row.insertCell().textContent = text;
    const link = document.createElement('a'); link.href = run.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = '查看记录 ↗'; row.insertCell().append(link);
  }
  clearTimeout(poll);
  if (status.runs.some(run => run.status !== 'completed')) poll = setTimeout(() => refresh().catch(error => message(error.message, true)), 15000);
}
$('#api-url').addEventListener('input', () => { dirty = true; $('#save-state').textContent = '有未保存的修改'; $('#publish').disabled = true; });
$('#settings-form').addEventListener('submit', event => {
  event.preventDefault();
  busy($('#save'), '正在保存…', async () => { const result = await request('/manager/save', { apiUrl: $('#api-url').value.trim() }); dirty = false; $('#save-state').textContent = `已保存 ${date(result.savedAt)}`; message(result.message); await refresh(); });
});
$('#probe').addEventListener('click', () => busy($('#probe'), '正在检测…', probe));
$('#reload-library').addEventListener('click', () => busy($('#reload-library'), '正在读取…', probe));
$('#refresh').addEventListener('click', () => busy($('#refresh'), '刷新中…', async () => { await refresh(); await probe(); }));
$('#publish').addEventListener('click', () => busy($('#publish'), '正在启动发布…', async () => { const result = await request('/manager/publish', {}); message(result.message); clearTimeout(poll); poll = setTimeout(() => refresh().catch(error => message(error.message, true)), 5000); }));
$('#stop').addEventListener('click', () => busy($('#stop'), '正在关闭…', async () => { const result = await request('/manager/stop', {}); clearTimeout(poll); connected = false; message(result.message); }));
async function boot() {
  session = await request('/manager/session');
  $('#api-url').value = session.apiUrl;
  $('#site-link').href = session.pagesUrl;
  $('#repo-link').href = `https://github.com/${session.repository}`;
  $('#save-state').textContent = session.savedAt ? `已保存 ${date(session.savedAt)}` : '使用当前默认连接';
  await refresh();
  await probe();
}
boot().catch(error => message(error.message, true));
