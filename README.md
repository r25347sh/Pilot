# Pilot

試験的機能を大量に格納するリポジトリ。

## Virtual OS Prototype

GitHub Pages（完全静的ホスト）で公開する、ポートフォリオサイト用の「仮想OS（バーチャルデバイス）システム」の最小プロトタイプです。

PCで見たときとスマホで見たときで、エミュレートする「仮想OSの概念」そのものが180度切り替わる、レスポンシブGUIハックの実験プロジェクトです。

### 技術スタック

- React 18
- Tailwind CSS
- Vite
- framer-motion（モバイルのスライドアップアニメーション用）

### ディレクトリ構造

```
Pilot/
├── public/                 # iframeで読み込む「中身（アプリ）」の静的HTML
│   ├── app-profile.html
│   ├── app-works.html
│   └── app-contact.html
├── src/
│   ├── components/
│   │   ├── desktop/        # PC用：Window.jsx, Desktop.jsx, Taskbar.jsx
│   │   └── mobile/         # スマホ用：HomeScreen.jsx, AppWindow.jsx, Dock.jsx
│   ├── App.jsx             # 画面幅(768px未満)でDesktopOSとMobileOSを完全に出し分ける
│   └── main.jsx
├── sitemap/                # 動的リポジトリ構成ビューア（HTML/CSS/JS分離）
│   ├── index.html
│   ├── style.css
│   └── script.js
└── ...
```

### 機能概要

#### PC版（DesktopOS）
- デスクトップ風GUI + タスクバー
- アイコンをダブルクリックでウィンドウを開く
- ウィンドウはドラッグ移動・リサイズ可能
- iframeで `public/app-*.html` を読み込み
- クリックで最前面（z-index管理）

#### スマホ版（MobileOS）
- `100dvh` + `overflow: hidden` のスマホOS風GUI
- ホーム画面にアプリアイコン
- タップで下から全画面アプリがせり上がる（framer-motion）
- 下部Dock（ホーム戻る / タスク）

### ローカル開発

```bash
npm install
npm run dev
```

### ビルド & GitHub Pages

```bash
npm run build
```

`vite.config.js` で `base: '/Pilot/'` を設定済み。  
GitHub Pages の Source を `gh-pages` ブランチ or GitHub Actions で `dist` をデプロイしてください。

### Sitemap

`/sitemap/` にアクセスすると、GitHub API からリポジトリの tree を動的に取得して表示します。

---

実験的リポジトリのため、破壊的変更が入る可能性があります。
