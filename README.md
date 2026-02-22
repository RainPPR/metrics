# ✨ Github Metrics Advanced Dashboard

> 一个纯静态、极简、治愈系风格的 GitHub 数据聚合看板。

[![Deploy Metrics Dashboard](https://github.com/RainPPR/metrics/actions/workflows/deploy.yml/badge.svg)](https://github.com/RainPPR/metrics/actions/workflows/deploy.yml)

## 🎨 治愈系设计 (Healing Aesthetics)

本项目专为 **RainPPR** 及其好友设计，追求“治愈而不失高级”的视觉体验：
- **极简配色**：以黑白为底色，搭配 Pastel Pink (治愈粉) 与 Pastel Blue (治愈蓝) 的微光晕与焦点色。
- **动效先行**：使用 Framer Motion 实现所有 Bento 卡片的平滑交互与分屏加载。
- **Geek 字体**：正文 Inter，数据 Fira Code。

## 🚀 功能特性

- **多账户聚合**：自动抓取并汇总 RainPPR, RaineMtF, raineblog, rainewhk 的全量 GitHub 数据。
- **Bento 布局**：响应式便当盒布局，包含统计汇总、Page 橱窗、语言占比、热力图、贡献墙等。
- **自动运维**：依托 GitHub Actions 每天零点自动更新数据并部署至 GitHub Pages。
- **PAT Pool**：支持多 Token 轮询抓取，规避 API 限流与权限问题。

## 🛠️ 快速启动

### 1. 配置 Secrets (必须)
在 GitHub 仓库中设置以下 Secret：
- `TOKENS_POOL`: 包含一个或多个 GitHub PAT (Personal Access Tokens) 的列表。

### 2. 本地开发
```bash
# 安装依赖
pnpm install

# 手动触发数据抓取 (需要环境变量 TOKENS_POOL)
node scripts/fetch-github-data.mjs

# 启动开发服务器
pnpm run dev
```

### 3. 构建发布
```bash
pnpm run build
```

## 📂 技术栈
- **Frontend**: Vite + React + TypeScript + Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Backend-ish**: Node.js Script (fetch-github-data.mjs)
- **Deployment**: GitHub Actions + GitHub Pages

---
Made with ❤ by RainPPR & AI Dashboard.
