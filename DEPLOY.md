# 扑克计时器 - 部署指南

## 快速部署到 Vercel（推荐，免费）

### 1. 准备代码
- 把整个 `poker-timer` 文件夹推到 GitHub 仓库
- 仓库必须是 Public（Vercel 免费版）或升级到 Pro

```bash
cd poker-timer
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/你的用户名/poker-timer.git
git push -u origin main
```

### 2. Vercel 部署
1. 访问 https://vercel.com 用 GitHub 登录
2. 点击 "Add New Project"
3. 选择 `poker-timer` 仓库
4. Framework Preset 选 **Vite**
5. Build Command 留默认 `npm run build`
6. Output Directory 留默认 `dist`
7. 点击 Deploy

### 3. 得到域名
部署成功后会得到一个域名，格式：
```
https://poker-timer-你的用户名.vercel.app
```

### 4. 投屏设备
把上面的网址用投屏电脑/电视打开即可。

---

## 微信云开发同步（跨设备）

### 1. 开通云开发
- 微信开发者工具打开小程序项目
- 点击"云开发"→"开通"
- 选择免费版（足够 1-2 个店铺使用）
- 记下 **环境 ID**（如 `cloudbase-xxx`）

### 2. 部署云函数
- 右键 `cloudfunctions/pokerSync` → 上传并部署：云端安装依赖
- 部署完成后云函数就绪

### 3. Web 端配置
在 Vercel 项目设置中添加环境变量：
- `VITE_CLOUD_ENV_ID` = 你的环境 ID

### 4. 修改 cloudSync.ts（待实现）
```ts
// 拉取云端 state
export async function pullFromCloud(storeId = 'default') {
  const res = await fetch(`https://${import.meta.env.VITE_CLOUD_ENV_ID}.service.tcloudbase.com/pokerSync`, {
    method: 'POST',
    body: JSON.stringify({ action: 'get', storeId })
  });
  return res.json();
}
```

---

## 域名（可选）

如果需要自己的域名：
1. 阿里云/腾讯云买域名（如 `timer.zuilearena.com`）
2. Vercel 项目 → Settings → Domains → 添加
3. 按提示在域名商处加 CNAME 记录

---

## 单店 vs 多店

### 单店模式（当前推荐）
- 投屏设备直接打开 Vercel 域名
- 裁判用手机/小程序后台控制
- 所有数据共享一个 `storeId = 'default'`

### 多店模式（后续扩展）
- 投屏设备打开 `https://domain/?storeId=shopA`
- 裁判在后台选店铺
- 每个店铺独立数据

---

## 当前状态
- ✅ Web 投屏页可部署到 Vercel
- ✅ 投屏页 + 后台 同浏览器同步已 work
- ⏳ 跨设备同步需要云函数（云开发或自建）
