const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../catalog.js');
const i18n = require('../i18n.js');

test('registry puts schools before aliases, supports legacy strings and deduplicates repositories', () => {
  const values = catalog.parseRegistry([{ repo: 'cursimple/Example', schools: ['长江大学', '长江大学'], aliases: ['cjdx'] }, 'cursimple/example']);
  assert.equal(values.length, 1);
  assert.deepEqual(values[0].aliases, ['长江大学', 'cjdx']);
  assert.deepEqual(catalog.parseRegistry(['owner/repo'])[0].aliases, []);
});

test('unsafe repository paths and extension components are refused', () => {
  for (const repo of ['https://example.com', 'owner/../private', 'owner/..', 'owner/<script>']) assert.throws(() => catalog.parseRegistry([repo]));
  assert.throws(() => catalog.parseRegistry([{ repo: 'owner/repo', kind: 'extension' }]));
});

test('search matches school aliases and localized labels without online metadata', () => {
  const entries = catalog.parseRegistry([{ repo: 'cursimple/YangtzU_course_plugin', schools: ['长江大学', '长大', 'cjdx'] }, 'other/plugin']);
  assert.equal(catalog.search(entries, '长江').length, 1);
  assert.equal(catalog.search(entries, 'CJDX').length, 1);
  assert.equal(catalog.search(entries, 'yangtze university', new Map(), i18n.labels('en'))[0].repo, entries[0].repo);
  assert.equal(catalog.search(entries, 'missing').length, 0);
});

test('metadata preserves a real zero star count and rejects unsafe avatar URLs', () => {
  const data = catalog.parseMetadata({ repositories: [{ name: 'cursimple/Example', star: 0, avatar: 'javascript:alert(1)' }] });
  assert.equal(data.get('cursimple/example').stars, 0);
  assert.equal(data.get('cursimple/example').avatar, null);
  assert.equal(catalog.safeAvatar('https://untrusted.example/photo'), null);
  assert.ok(catalog.safeAvatar('https://avatars.githubusercontent.com/u/1'));
});

test('all language keys and interpolation parameters agree and HTML references are translated', () => {
  const keys = Object.keys(i18n.messages['zh-CN']).sort();
  for (const language of ['zh-CN', 'zh-TW', 'en']) {
    assert.deepEqual(Object.keys(i18n.messages[language]).sort(), keys);
    for (const key of keys) {
      assert.ok(i18n.messages[language][key]);
      assert.deepEqual(i18n.messages[language][key].match(/\{\w+\}/g), i18n.messages['zh-CN'][key].match(/\{\w+\}/g));
    }
  }
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(keys.includes(match[1]));
});

test('the published registry parses and every entry declares schools for in-app search', () => {
  const entries = catalog.parseRegistry(JSON.parse(fs.readFileSync(path.join(__dirname, '../../plugins.json'), 'utf8')));
  assert.ok(entries.length > 0);
  for (const entry of entries) assert.ok(entry.aliases.length > 0, entry.repo);
});
