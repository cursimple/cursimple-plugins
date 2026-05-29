'use strict';

const REGISTRY_OWNER = 'cursimple';
const REGISTRY_REPO = 'cursimple-plugins';
const REGISTRY_BRANCH = 'main';
const REGISTRY_PATH = 'plugins.json';
const REGISTRY_RAW_URL = `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}/${REGISTRY_PATH}`;
const CONTENTS_API = `https://api.github.com/repos/${REGISTRY_OWNER}/${REGISTRY_REPO}/contents/${REGISTRY_PATH}`;
const EDIT_ON_GITHUB_URL = `https://github.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/edit/${REGISTRY_BRANCH}/${REGISTRY_PATH}`;
const STARS_BRANCH = 'plugin-stars-data';
const STARS_PATH = 'plugins-stars.json';
const STARS_RAW_URL = `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${STARS_BRANCH}/${STARS_PATH}`;
const PAT_STORAGE_KEY = 'cursimple-plugins:pat';

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  wireTabs();
  wireManage();
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
  elements.patInput = document.getElementById('pat-input');
  elements.btnSavePat = document.getElementById('btn-save-pat');
  elements.btnClearPat = document.getElementById('btn-clear-pat');
  elements.patStatus = document.getElementById('pat-status');
  elements.editPanel = document.getElementById('edit-panel');
  elements.addInput = document.getElementById('add-input');
  elements.btnAdd = document.getElementById('btn-add');
  elements.manageList = document.getElementById('manage-list');
}

function wireTabs() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tab) {
  elements.tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  elements.views.forEach((v) => v.classList.toggle('active', v.id === `view-${tab}`));
  if (tab === 'manage') {
    hydrateManageFromStored();
  }
}

function wireManage() {
  elements.btnSavePat.addEventListener('click', () => {
    const value = elements.patInput.value.trim();
    if (!value) {
      setStatus(elements.patStatus, '请输入 PAT', 'error');
      return;
    }
    localStorage.setItem(PAT_STORAGE_KEY, value);
    setStatus(elements.patStatus, '已保存，正在校验...');
    hydrateManageFromStored();
  });

  elements.btnClearPat.addEventListener('click', () => {
    localStorage.removeItem(PAT_STORAGE_KEY);
    elements.patInput.value = '';
    elements.btnClearPat.hidden = true;
    elements.editPanel.hidden = true;
    setStatus(elements.patStatus, '');
  });

  elements.btnAdd.addEventListener('click', onAdd);
}

function hydrateManageFromStored() {
  const pat = localStorage.getItem(PAT_STORAGE_KEY);
  if (!pat) {
    elements.editPanel.hidden = true;
    elements.btnClearPat.hidden = true;
    setStatus(elements.patStatus, '');
    return;
  }
  elements.patInput.value = pat;
  elements.btnClearPat.hidden = false;
  loadManageList();
}

async function loadManageList() {
  setStatus(elements.patStatus, '正在校验权限...');
  const pat = localStorage.getItem(PAT_STORAGE_KEY);
  try {
    const file = await fetchRegistryFile(pat);
    const repos = parseRegistry(file.content);
    renderManageList(repos, file.sha);
    elements.editPanel.hidden = false;
    setStatus(elements.patStatus, `已校验，注册表共 ${repos.length} 条`, 'success');
  } catch (err) {
    elements.editPanel.hidden = true;
    setStatus(elements.patStatus, `校验失败：${err.message}`, 'error');
  }
}

function renderManageList(repos, sha) {
  elements.manageList.innerHTML = '';
  repos.forEach((repo) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'repo';
    span.textContent = repo;
    const view = document.createElement('a');
    view.className = 'btn ghost';
    view.href = `https://github.com/${repo}`;
    view.target = '_blank';
    view.rel = 'noopener';
    view.textContent = '查看';
    const remove = document.createElement('button');
    remove.className = 'btn danger';
    remove.textContent = '移除';
    remove.addEventListener('click', () => onRemove(repo, sha));
    li.append(span, view, remove);
    elements.manageList.appendChild(li);
  });
}

async function onAdd() {
  const raw = elements.addInput.value.trim();
  const repo = normalizeRepoInput(raw);
  if (!repo) {
    setStatus(elements.patStatus, '请输入 owner/repo 或完整的 GitHub URL', 'error');
    return;
  }
  const pat = localStorage.getItem(PAT_STORAGE_KEY);
  setStatus(elements.patStatus, '正在添加...');
  try {
    const file = await fetchRegistryFile(pat);
    const repos = parseRegistry(file.content);
    if (repos.includes(repo)) {
      setStatus(elements.patStatus, `${repo} 已存在`, 'error');
      return;
    }
    const next = [...repos, repo];
    await commitRegistry(pat, next, file.sha, `Add ${repo}`);
    elements.addInput.value = '';
    setStatus(elements.patStatus, `已添加 ${repo}`, 'success');
    await loadManageList();
    await loadAndRenderBrowse();
  } catch (err) {
    setStatus(elements.patStatus, `添加失败：${err.message}`, 'error');
  }
}

async function onRemove(repo, _sha) {
  if (!confirm(`确认移除 ${repo}?`)) return;
  const pat = localStorage.getItem(PAT_STORAGE_KEY);
  setStatus(elements.patStatus, '正在移除...');
  try {
    const file = await fetchRegistryFile(pat);
    const repos = parseRegistry(file.content).filter((r) => r !== repo);
    await commitRegistry(pat, repos, file.sha, `Remove ${repo}`);
    setStatus(elements.patStatus, `已移除 ${repo}`, 'success');
    await loadManageList();
    await loadAndRenderBrowse();
  } catch (err) {
    setStatus(elements.patStatus, `移除失败：${err.message}`, 'error');
  }
}

function normalizeRepoInput(input) {
  if (!input) return null;
  const trimmed = input.trim().replace(/\/$/, '');
  const m = trimmed.match(/^(?:https?:\/\/github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (!m) return null;
  return `${m[1]}/${m[2]}`;
}

async function fetchRegistryFile(pat) {
  const res = await fetch(`${CONTENTS_API}?ref=${REGISTRY_BRANCH}`, {
    headers: githubHeaders(pat),
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await safeError(res)}`);
  }
  const body = await res.json();
  const content = atob(body.content.replace(/\n/g, ''));
  return { content, sha: body.sha };
}

async function commitRegistry(pat, repos, sha, message) {
  const payload = {
    message,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(repos, null, 2) + '\n'))),
    sha,
    branch: REGISTRY_BRANCH,
  };
  const res = await fetch(CONTENTS_API, {
    method: 'PUT',
    headers: { ...githubHeaders(pat), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`提交失败 ${res.status}: ${await safeError(res)}`);
  }
}

function githubHeaders(pat) {
  const headers = { Accept: 'application/vnd.github+json' };
  if (pat) headers.Authorization = `Bearer ${pat}`;
  return headers;
}

async function safeError(res) {
  try {
    const j = await res.json();
    return j.message || JSON.stringify(j);
  } catch (_) {
    return res.statusText;
  }
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
    const [repos, starsByRepo] = await Promise.all([fetchRegistry(), fetchPluginStars()]);
    if (repos.length === 0) {
      setStatus(elements.statusBrowse, '注册表为空。', 'success');
      return;
    }
    setStatus(elements.statusBrowse, `共 ${repos.length} 个插件，正在加载元信息...`);
    const metas = await Promise.all(
      repos.map((r) => fetchRepoMeta(r, starsByRepo).catch(() => placeholderMeta(r, starsByRepo)))
    );
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

  return data.repositories.reduce((starsByRepo, item, index) => {
    if (!item || typeof item.name !== 'string' || !Number.isInteger(item.star) || item.star < 0) {
      throw new Error(`plugins-stars.json repositories 第 ${index + 1} 项格式错误`);
    }
    starsByRepo.set(item.name, item.star);
    return starsByRepo;
  }, new Map());
}

function getStarCount(fullName, starsByRepo) {
  if (!starsByRepo.has(fullName)) {
    throw new Error(`plugins-stars.json 缺少 ${fullName} 的 star 数据`);
  }
  return starsByRepo.get(fullName);
}

async function fetchRepoMeta(fullName, starsByRepo) {
  const pat = localStorage.getItem(PAT_STORAGE_KEY);
  const res = await fetch(`https://api.github.com/repos/${fullName}`, { headers: githubHeaders(pat) });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const body = await res.json();
  return {
    fullName,
    name: body.name,
    owner: body.owner.login,
    avatar: body.owner.avatar_url,
    description: body.description || '',
    stars: getStarCount(fullName, starsByRepo),
    language: body.language || '',
    htmlUrl: body.html_url,
  };
}

function placeholderMeta(fullName, starsByRepo) {
  const [owner, name] = fullName.split('/');
  return {
    fullName,
    name,
    owner,
    avatar: `https://github.com/${owner}.png?size=80`,
    description: '（无法加载仓库元信息，可能受 API 速率限制）',
    stars: getStarCount(fullName, starsByRepo),
    language: '',
    htmlUrl: `https://github.com/${fullName}`,
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
