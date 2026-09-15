const OWNER = 'r25347sh';
const REPO = 'Pilot';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`;

const treeEl = document.getElementById('tree');
const statusEl = document.getElementById('status');
const refreshBtn = document.getElementById('refreshBtn');

function formatSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIcon(type, path) {
  if (type === 'tree') return '📁';
  const ext = path.split('.').pop().toLowerCase();
  const map = {
    js: '📜', jsx: '⚛️', ts: '📘', tsx: '⚛️',
    html: '🌐', css: '🎨', json: '📋', md: '📝',
    svg: '🖼️', png: '🖼️', jpg: '🖼️',
  };
  return map[ext] || '📄';
}

function buildTree(items) {
  // path でソートし、ディレクトリ優先で表示しやすい順序に
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  treeEl.innerHTML = '';

  sorted.forEach((item) => {
    const depth = item.path.split('/').length - 1;
    const name = item.path.split('/').pop();
    const isDir = item.type === 'tree';

    const row = document.createElement('div');
    row.className = 'tree-item';
    row.style.paddingLeft = `${depth * 1.25}rem`;

    row.innerHTML = `
      <span class="icon">${getIcon(item.type, item.path)}</span>
      <span class="name ${isDir ? 'dir' : 'file'}">${name}${isDir ? '/' : ''}</span>
      ${!isDir && item.size != null ? `<span class="size">${formatSize(item.size)}</span>` : ''}
    `;

    treeEl.appendChild(row);
  });
}

async function fetchTree() {
  statusEl.textContent = '読み込み中...';
  refreshBtn.disabled = true;
  treeEl.innerHTML = '';

  try {
    const res = await fetch(API_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.tree || !Array.isArray(data.tree)) {
      throw new Error('Unexpected API response');
    }

    // blob = file, tree = directory
    buildTree(data.tree);
    statusEl.textContent = `${data.tree.length} アイテム · 最終更新: ${new Date().toLocaleString('ja-JP')}`;
  } catch (err) {
    console.error(err);
    treeEl.innerHTML = `<div class="error">取得に失敗しました。<br>${err.message}</div>`;
    statusEl.textContent = 'エラー';
  } finally {
    refreshBtn.disabled = false;
  }
}

refreshBtn.addEventListener('click', fetchTree);

// 初回読み込み
fetchTree();
