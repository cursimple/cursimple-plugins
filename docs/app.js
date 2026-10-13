'use strict';
const catalog = PluginCatalog;
const locale = PluginI18n;
const storageKey = 'cursimple-plugins-language';
// Pages serves docs/ only, so the registry is read from the repository with a CDN fallback.
const sources = (branch, file) => [
  `https://raw.githubusercontent.com/cursimple/cursimple-plugins/${branch}/${file}`,
  `https://cdn.jsdelivr.net/gh/cursimple/cursimple-plugins@${branch}/${file}`,
];
let language = 'zh-CN';
try { language = locale.normalize(new URL(location.href).searchParams.get('lang') || localStorage.getItem(storageKey)); } catch { /* Use the default language. */ }
const state = { entries: [], metadata: new Map(), loading: false, notice: null, query: '' };
let loadGeneration = 0;
const $ = (id) => document.getElementById(id);
const text = (key, values) => locale.t(key, language, values);

async function fetchJson(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const result = await fetch(`${url}?_=${Date.now()}`, { signal: controller.signal, credentials: 'omit', cache: 'no-cache' });
    if (!result.ok) throw new Error(`HTTP ${result.status}`);
    return await result.json();
  } finally { clearTimeout(timer); }
}

async function fetchFirst(urls, timeout) {
  let failure;
  for (const url of urls) {
    try { return await fetchJson(url, timeout); } catch (error) { failure = error; }
  }
  throw failure;
}

function translate() {
  document.documentElement.lang = language;
  document.title = text('title');
  document.querySelector('meta[name=description]').content = text('intro');
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = text(node.dataset.i18n); });
  $('language').value = language;
  $('search').placeholder = text('search'); $('search').ariaLabel = text('search');
  $('refresh').ariaLabel = text('refresh'); $('refresh').title = text('refresh');
  $('contribution-link').href = language === 'en'
    ? 'https://github.com/cursimple/cursimple-plugins/blob/main/README_EN.md#-how-to-submit-a-plugin'
    : 'https://github.com/cursimple/cursimple-plugins#-如何提交插件';
}

function render() {
  const labels = locale.labels(language);
  const visible = catalog.search(state.entries, state.query, state.metadata, labels);
  const active = document.activeElement;
  const focusedRepo = active?.closest('[data-repo]')?.dataset.repo;
  const focusedAction = active?.dataset.action;
  const nodes = visible.map((entry) => {
    const node = $('plugin-template').content.cloneNode(true);
    const card = node.querySelector('article'); card.dataset.repo = entry.repo;
    const meta = state.metadata.get(entry.repo.toLowerCase());
    const known = labels[entry.repo];
    node.querySelector('.plugin-name').textContent = known?.name || entry.aliases[0] || entry.repo.split('/')[1];
    node.querySelector('.repository').textContent = entry.repo;
    node.querySelector('.repository').title = entry.repo;
    node.querySelector('.description').textContent = known?.description || meta?.description || text('fallback');
    const image = node.querySelector('.avatar');
    image.src = meta?.avatar || './assets/icon.png';
    image.onerror = () => { image.onerror = null; image.src = './assets/icon.png'; };
    const aliases = node.querySelector('.aliases'); aliases.ariaLabel = text('alias');
    entry.aliases.forEach((alias) => { const chip = document.createElement('span'); chip.textContent = alias; aliases.append(chip); });
    const stars = node.querySelector('.stars'); stars.textContent = `★ ${meta?.stars ?? '—'}`; stars.ariaLabel = `${text('stars')}: ${meta?.stars ?? '—'}`;
    node.querySelector('.code-language').textContent = meta?.language || '';
    for (const action of ['repo', 'releases']) {
      const link = node.querySelector(`[data-action=${action}]`);
      link.href = `https://github.com/${entry.repo}${action === 'releases' ? '/releases' : ''}`;
      link.textContent = text(action);
    }
    return node;
  });
  $('grid').replaceChildren(...nodes);
  if (focusedRepo && focusedAction) [...$('grid').querySelectorAll('[data-repo]')]
    .find((node) => node.dataset.repo === focusedRepo)?.querySelector(`[data-action=${focusedAction}]`)?.focus({ preventScroll: true });
  $('count').textContent = state.loading && !state.entries.length ? text('loading')
    : text(state.query ? 'results' : 'count', { count: visible.length, total: state.entries.length });
  $('status').hidden = !state.notice;
  $('status').textContent = state.notice ? text(state.notice) : '';
  $('status').classList.toggle('error', state.notice === 'failed');
  $('empty').hidden = visible.length > 0 || state.loading || state.notice === 'failed';
  $('empty').textContent = text(state.entries.length ? 'empty' : 'noEntries');
  $('refresh').disabled = state.loading;
  $('browse-panel').ariaBusy = String(state.loading);
}

async function load() {
  if (state.loading) return;
  const generation = ++loadGeneration;
  state.loading = true; state.notice = null; render();
  try {
    const entries = catalog.parseRegistry(await fetchFirst(sources('main', 'plugins.json')));
    state.entries = entries;
    // Show the registry first; stars and avatars are optional extras.
    state.loading = false; render();
    window.catalogReady = true;
    try {
      const metadata = catalog.parseMetadata(await fetchFirst(sources('plugin-stars-data', 'plugins-stars.json'), 6000));
      if (generation !== loadGeneration) return;
      state.metadata = metadata; render();
    } catch { if (generation === loadGeneration) { state.notice = 'cached'; render(); } }
  } catch {
    state.loading = false;
    state.notice = 'failed'; render();
    window.catalogReady = true;
  }
}

function selectTab(tab, focus = false) {
  document.querySelectorAll('[role=tab]').forEach((button) => {
    const selected = button === tab;
    button.ariaSelected = String(selected); button.tabIndex = selected ? 0 : -1;
    $(button.dataset.panel).hidden = !selected;
  });
  if (focus) tab.focus();
}

document.querySelectorAll('[role=tab]').forEach((tab, index, list) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % list.length;
    if (event.key === 'ArrowLeft') next = (index + list.length - 1) % list.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = list.length - 1;
    if (next != null) { event.preventDefault(); selectTab(list[next], true); }
  });
});
$('search').addEventListener('input', () => { state.query = $('search').value; render(); });
$('refresh').addEventListener('click', load);
$('language').addEventListener('change', () => {
  language = locale.normalize($('language').value);
  try { localStorage.setItem(storageKey, language); } catch { /* Continue without persistence. */ }
  translate(); render();
});
translate(); load();
