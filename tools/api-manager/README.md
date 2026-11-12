# 本地 API 管理器

在项目根目录双击 **管理API.cmd**，会打开 `http://127.0.0.1:4190/`。需要 Node.js 22 与已登录 GitHub 的 Git Credential Manager；管理器本身只用 Node 标准库，无需额外安装依赖。也可运行 `npm run manage-api`。

使用方式与个人网站本地 CMS 类似：在浏览器管理，服务只监听这台电脑。

1. **检测连接 / 重新读取馆藏**：查看 API 状态、论文数量、Zotero 版本、Group ID 与 GitHub Pages 跨域访问状态。
2. **保存连接设置**：先校验 HTTPS API 和 CORS，再写入本机 `.env.local` 与 GitHub 仓库变量 `ZOTERO_API_URL`。不会丢弃 `.env.local` 中其他设置。
3. **发布网站**：手动启动 GitHub Pages 工作流，使用 GitHub 上的最新代码与已保存的 API 地址；在页面查看真实发布状态和记录。代码修改仍通过正常 Git 提交/推送更新。
4. **关闭管理器**：点击页面按钮或关闭启动终端。

本机状态保存在 `.local/api-manager.json`；两份本机配置均被 Git 忽略。GitHub 凭据通过操作系统的 Git Credential Manager 临时取得，只在服务器内存中使用，不发送到管理页面。当前管理仓库为 `abbyabbyZzz/xr-women-library`，启动发布前会校验账号身份。

Zotero 密钥和原 Zotero API 的运行变量继续在原托管服务中维护；管理器显示健康检查结果，不读取密钥。替换 API 服务时，需让新 API 允许网站 origin `https://abbyabbyzzz.github.io`。管理器不会更改 Zotero 论文或上线 `/api/graph`。

若 GitHub 连接失效，先用 Git Credential Manager 登录自己的账号，再刷新管理页。再次双击启动文件会打开已运行的同一管理器；若端口被其他程序占用，可运行 `node tools/api-manager/server.mjs --port 4191 --open`。不要把这个管理服务部署为公开网站。
