'use strict';

const REGISTRY_OWNER = 'cursimple';
const REGISTRY_REPO = 'cursimple-plugins';
const REGISTRY_BRANCH = 'main';
const REGISTRY_PATH = 'plugins.json';
const REGISTRY_RAW_URL = `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}/${REGISTRY_PATH}`;
const EDIT_ON_GITHUB_URL = `https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/edit/${REGISTRY_BRANCH}/${REGISTRY_PATH}`;
const STARS_BRANCH = 'plugin-stars-data';
const STARS_PATH = 'plugins-stars.json';
const STARS_RAW_URL = `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${STARS_BRANCH}/${STARS_PATH}`;

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  wireTabs();
  elements.btnEditOnGithub.href = EDIT_ON_GITHUB_URL;
  loadAndRenderBrowse();
});

function cacheElements() {
  elements.tabs = document.querySelectorAll('.tab');
  elements.views = document.querySelectorAll('.view');
  elements.grid = document.getElementById('grid');
  elements.statusBrowse = document.getElementById('status-browse');
  elements.cellTemplate = document.getElementById('grid-cell-template');

  elements.btnEditOnGithub = document.getElementById('btn-edit-on-github');
}

function wireTabs() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tab) {
  elements.tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  elements.views.forEach((v) => v.classList.toggle('active', v.id === `view-${tab}`));
}

function parseRegistry(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('plugins.json 必须是数组');
  const seen = new Set();
  return data.filter((item) => {
    if (typeof item !== 'string') return false;
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

async function loadAndRenderBrowse() {
  setStatus(elements.statusBrowse, '加载中...');
  elements.grid.innerHTML = '';
  try {
    const [repos, repoMetaByName] = await Promise.all([fetchRegistry(), fetchPluginStars()]);
    if (repos.length === 0) {
      setStatus(elements.statusBrowse, '注册表为空。', 'success');
      return;
    }
    setStatus(elements.statusBrowse, `共 ${repos.length} 个插件，正在加载元信息...`);
    const metas = repos.map((repo) => buildRepoMeta(repo, repoMetaByName));
    metas.forEach((meta) => elements.grid.appendChild(renderCell(meta)));
    setStatus(elements.statusBrowse, '');
  } catch (err) {
    setStatus(elements.statusBrowse, `加载失败：${err.message}`, 'error');
  }
}

async function fetchRegistry() {
  const res = await fetch(`${REGISTRY_RAW_URL}?_=${Date.now()}`);
  if (!res.ok) throw new Error(`无法读取 plugins.json (${res.status})`);
  return parseRegistry(await res.text());
}

async function fetchPluginStars() {
  const res = await fetch(`${STARS_RAW_URL}?_=${Date.now()}`);
  if (!res.ok) throw new Error(`无法读取 plugins-stars.json (${res.status})`);
  return parsePluginStars(await res.json());
}

function parsePluginStars(data) {
  if (!data || !Array.isArray(data.repositories)) {
    throw new Error('plugins-stars.json 必须包含 repositories 数组');
  }

  return data.repositories.reduce((repoMetaByName, item, index) => {
    if (!item || typeof item.name !== 'string' || !Number.isInteger(item.star) || item.star < 0) {
      throw new Error(`plugins-stars.json repositories 第 ${index + 1} 项格式错误`);
    }
    repoMetaByName.set(item.name, item);
    return repoMetaByName;
  }, new Map());
}

function getStoredRepoMeta(fullName, repoMetaByName) {
  if (!repoMetaByName.has(fullName)) {
    throw new Error(`plugins-stars.json 缺少 ${fullName} 的数据`);
  }
  return repoMetaByName.get(fullName);
}

function buildRepoMeta(fullName, repoMetaByName) {
  const stored = getStoredRepoMeta(fullName, repoMetaByName);
  const [owner, name] = fullName.split('/');
  return {
    fullName,
    name: stored.repo || name,
    owner: stored.owner || owner,
    avatar: stored.avatar || `https://github.com/${owner}.png?size=80`,
    description: stored.description || '点击查看 GitHub 仓库',
    stars: stored.star,
    language: stored.language || '',
    htmlUrl: stored.url || `https://github.com/${fullName}`,
  };
}

function renderCell(meta) {
  const node = elements.cellTemplate.content.cloneNode(true);
  const root = node.querySelector('.cell');
  root.href = meta.htmlUrl;
  node.querySelector('.avatar').src = meta.avatar;
  node.querySelector('.cell-name').textContent = meta.name;
  node.querySelector('.cell-owner').textContent = meta.owner;
  node.querySelector('.cell-desc').textContent = meta.description || '（无描述）';
  node.querySelector('.star-count').textContent = meta.stars;
  node.querySelector('.lang').textContent = meta.language;
  return node;
}

function setStatus(el, msg, kind) {
  el.textContent = msg || '';
  el.classList.remove('error', 'success');
  if (kind) el.classList.add(kind);
}
