# 部署說明

## 前提

這個前端項目使用 Vite 多入口構建，構建輸出位於 `dist/`。

當前入口包括：

- `index.html`
- `auth/`
- `menu/`
- `intro/`
- `explore/`
- `villagesML/`

另外 `public/detail/` 會作為靜態內容輸出到 `dist/detail/`。

## 常用命令

```bash
npm run build
```

Windows PowerShell：

```powershell
npm run build
.\deploy.ps1
```

Git Bash / Bash：

```bash
npm run build
bash deploy.sh
```

## 必須上傳的輸出

至少需要部署：

- `dist/index.html`
- `dist/assets/`
- `dist/auth/`
- `dist/detail/`
- `dist/explore/`
- `dist/intro/`
- `dist/menu/`
- `dist/villagesML/`

如果你的服務端還依賴以下文件，也需要一起上傳：

- `dist/config.js`
- `dist/vite.svg`
- `dist/鍾偉國公開.xlsx`

## 最重要的路由規則

項目使用 `createWebHistory()`，部署時一定要做路由回退。

尤其是：

- `/villagesML`
- `/villagesML/*`

必須回退到：

- `villagesML/index.html`

而不是主站的 `index.html`。

同理，其它多入口路徑也應各自回退到自己的入口：

- `/auth` -> `auth/index.html`
- `/menu` -> `menu/index.html`
- `/intro` -> `intro/index.html`
- `/explore` -> `explore/index.html`
- `/` -> `index.html`

## Nginx 參考

```nginx
location = /villagesML {
  try_files /villagesML/index.html =404;
}

location ^~ /villagesML/ {
  try_files $uri $uri/ /villagesML/index.html;
}

location = /auth {
  try_files /auth/index.html =404;
}

location ^~ /auth/ {
  try_files $uri $uri/ /auth/index.html;
}

location = /menu {
  try_files /menu/index.html =404;
}

location ^~ /menu/ {
  try_files $uri $uri/ /menu/index.html;
}

location = /intro {
  try_files /intro/index.html =404;
}

location ^~ /intro/ {
  try_files $uri $uri/ /intro/index.html;
}

location = /explore {
  try_files /explore/index.html =404;
}

location ^~ /explore/ {
  try_files $uri $uri/ /explore/index.html;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

## 腳本對齊

當前倉庫內有兩個部署腳本：

- `deploy.sh`
- `deploy.ps1`

它們都應包含 `villagesML/` 的上傳，否則新架構下的 VillagesML 入口會缺失。
