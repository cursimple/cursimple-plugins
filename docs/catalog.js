(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PluginCatalog = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const repoPattern = /^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9._-]+$/;
  const words = (value) => (Array.isArray(value) ? value : [])
    .filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
  function parseRegistry(data) {
    if (!Array.isArray(data)) throw new Error('Invalid plugin registry');
    const seen = new Set();
    return data.flatMap((item) => {
      const repo = (typeof item === 'string' ? item : item?.repo)?.trim();
      if (!repo || !repoPattern.test(repo) || ['.', '..'].includes(repo.split('/')[1])) throw new Error('Invalid plugin repository');
      if (typeof item === 'object' && item.kind && item.kind !== 'schedule') throw new Error('Not a schedule plugin');
      const key = repo.toLowerCase();
      if (seen.has(key)) return [];
      seen.add(key);
      // Schools come first: the app titles a plugin with its first school alias.
      return [{ repo, aliases: [...new Set([...words(item?.schools), ...words(item?.aliases)])] }];
    });
  }
  function parseMetadata(data) {
    if (!data || !Array.isArray(data.repositories)) throw new Error('Invalid plugin metadata');
    return new Map(data.repositories.filter((item) => item && typeof item.name === 'string')
      .map((item) => [item.name.toLowerCase(), {
        description: typeof item.description === 'string' ? item.description : '',
        stars: Number.isInteger(item.star) && item.star >= 0 ? item.star : null,
        language: typeof item.language === 'string' ? item.language : '',
        avatar: safeAvatar(item.avatar),
      }]));
  }
  function safeAvatar(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && ['avatars.githubusercontent.com', 'github.com'].includes(url.hostname) ? url.href : null;
    } catch { return null; }
  }
  function search(entries, query, metadata = new Map(), labels = {}) {
    const terms = query.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
    return entries.filter((entry) => {
      const text = [entry.repo, ...entry.aliases, metadata.get(entry.repo.toLowerCase())?.description || '', labels[entry.repo]?.name || '', labels[entry.repo]?.description || '']
        .join(' ').normalize('NFKC').toLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }
  return { parseRegistry, parseMetadata, search, safeAvatar };
});
