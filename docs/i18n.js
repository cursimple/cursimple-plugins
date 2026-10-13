(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PluginI18n = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const messages = {
    'zh-CN': {
      title: '课简 · 插件收录', brand: '课简插件', app: '课简官网', components: '扩展组件', source: '插件仓库',
      browse: '浏览插件', submit: '提交收录', eyebrow: 'CURSIMPLE PLUGINS',
      heading: '登录教务，把课表导进课简', intro: '每所学校由独立插件适配。搜索你的学校，安装对应插件，登录教务系统后课表会自动导入。',
      search: '搜索学校名、拼音或缩写', refresh: '刷新插件', loading: '正在加载插件…',
      count: '已收录 {total} 个插件', results: '找到 {count} 个插件，共收录 {total} 个',
      empty: '还没有适配这所学校。可以换个简称或拼音试试，也欢迎提交插件。', noEntries: '当前还没有收录插件。',
      failed: '暂时无法加载插件，请重试或前往插件仓库查看。', cached: '星标等在线资料暂时不可用，插件列表不受影响。',
      repo: '查看仓库', releases: '版本与下载', stars: 'GitHub 星标', alias: '覆盖学校与别名',
      fallback: '打开仓库了解适配的教务系统、使用方式与兼容版本。',
      installationTitle: '在课简中安装', installation: '打开课简的「从教务系统导课」，搜索学校名并安装对应插件，插件装好会自动启用。也可以从插件仓库的 Release 下载插件 ZIP，再用「导入 ZIP」安装。',
      compatibility: '导入时在插件页面登录学校教务系统，账号只提交给学校。兼容版本以插件详情为准；学校系统改版后，插件需要更新才能继续导入。',
      submitTitle: '把你的插件加入收录', submitIntro: '网页和课简的导课页共用 plugins.json。提交仓库地址和覆盖的学校，合并后由工作流更新收录资料。',
      edit: '在 GitHub 编辑', pullRequest: '查看贡献说明', requirements: '准备插件包',
      requirementsText: '插件仓库需公开托管在 GitHub。Release 附件需要同时上传插件 ZIP 与下载清单 manifest.json，清单里的 filename 要和 ZIP 文件名一致。',
      format: '注册条目示例', schoolsTip: 'schools 请写全学校全称、常用简称、拼音全拼与首字母、英文名或缩写。课简按子串匹配搜索，不做拼音转换。',
      developer: '插件开发指南', privacy: '本网页只用于浏览收录资料；教务登录与导课在课简中完成，安装操作在课简或 GitHub 中完成。',
      yangtzeName: '长江大学', yangtzeDesc: '登录长江大学教务系统，把本学期课表导入课简。',
    },
    'zh-TW': {
      title: '課簡 · 外掛收錄', brand: '課簡外掛', app: '課簡官網', components: '擴充元件', source: '外掛儲存庫',
      browse: '瀏覽外掛', submit: '提交收錄', eyebrow: 'CURSIMPLE PLUGINS',
      heading: '登入教務，把課表匯入課簡', intro: '每所學校由獨立外掛支援。搜尋你的學校，安裝對應外掛，登入教務系統後課表會自動匯入。',
      search: '搜尋學校名稱、拼音或縮寫', refresh: '重新整理外掛', loading: '正在載入外掛…',
      count: '已收錄 {total} 個外掛', results: '找到 {count} 個外掛，共收錄 {total} 個',
      empty: '還沒有支援這所學校。可以換個簡稱或拼音試試，也歡迎提交外掛。', noEntries: '目前尚未收錄外掛。',
      failed: '暫時無法載入外掛，請重試或前往外掛儲存庫查看。', cached: '星標等線上資料暫時無法取得，外掛清單不受影響。',
      repo: '查看儲存庫', releases: '版本與下載', stars: 'GitHub 星標', alias: '涵蓋學校與別名',
      fallback: '開啟儲存庫了解支援的教務系統、使用方式與相容版本。',
      installationTitle: '在課簡中安裝', installation: '開啟課簡的「從教務系統匯入課表」，搜尋學校名稱並安裝對應外掛，外掛安裝後會自動啟用。也可從外掛儲存庫的 Release 下載外掛 ZIP，再用「匯入 ZIP」安裝。',
      compatibility: '匯入時在外掛頁面登入學校教務系統，帳號只提交給學校。相容版本以外掛詳情為準；學校系統改版後，外掛需要更新才能繼續匯入。',
      submitTitle: '把你的外掛加入收錄', submitIntro: '網頁與課簡的匯入課表頁共用 plugins.json。提交儲存庫網址與涵蓋的學校，合併後由工作流程更新收錄資料。',
      edit: '在 GitHub 編輯', pullRequest: '查看貢獻說明', requirements: '準備外掛套件',
      requirementsText: '外掛儲存庫需公開託管於 GitHub。Release 附件需同時上傳外掛 ZIP 與下載清單 manifest.json，清單中的 filename 須與 ZIP 檔名一致。',
      format: '註冊項目範例', schoolsTip: 'schools 請寫齊學校全稱、常用簡稱、拼音全拼與首字母、英文名稱或縮寫。課簡以子字串比對搜尋，不做拼音轉換。',
      developer: '外掛開發指南', privacy: '本網頁只用於瀏覽收錄資料；教務登入與匯入在課簡中完成，安裝操作在課簡或 GitHub 中完成。',
      yangtzeName: '長江大學', yangtzeDesc: '登入長江大學教務系統，把本學期課表匯入課簡。',
    },
    en: {
      title: 'CurSimple · Plugin catalog', brand: 'CurSimple', app: 'App website', components: 'Components', source: 'Registry',
      browse: 'Browse', submit: 'Contribute', eyebrow: 'CURSIMPLE PLUGINS',
      heading: 'Import your timetable from school', intro: 'Each school is supported by an independent plugin. Find your school, install its plugin and sign in to the academic system to import your timetable.',
      search: 'Search schools or pinyin', refresh: 'Refresh plugins', loading: 'Loading plugins…',
      count: '{total} listed plugins', results: '{count} matches out of {total} plugins',
      empty: 'No plugin for this school yet. Try another abbreviation or pinyin, or contribute a plugin.', noEntries: 'No plugins are listed yet.',
      failed: 'Cannot load the catalog. Retry or open the plugin registry.', cached: 'Stars and other online metadata are unavailable. The plugin list is unaffected.',
      repo: 'Repository', releases: 'Releases', stars: 'GitHub stars', alias: 'Schools and aliases',
      fallback: 'Open the repository for the supported academic system, usage and compatible versions.',
      installationTitle: 'Install in CurSimple', installation: 'Open “Import from your university” in CurSimple, search for your school and install its plugin; it is enabled automatically. You can also download a plugin ZIP from its GitHub Release and use Import ZIP.',
      compatibility: 'Sign in to your school system on the plugin page; credentials go only to the school. Check plugin details for compatibility. When a school system changes, its plugin needs an update before imports work again.',
      submitTitle: 'List your plugin', submitIntro: 'The website and the in-app school import share plugins.json. Add your repository and the schools it covers; workflows update the catalog after the change is merged.',
      edit: 'Edit on GitHub', pullRequest: 'Contribution guide', requirements: 'Prepare the package',
      requirementsText: 'Host the plugin in a public GitHub repository. Upload both the plugin ZIP and the download manifest.json as Release assets; the manifest filename must match the ZIP name.',
      format: 'Registry entry example', schoolsTip: 'List the full school name, common abbreviations, full and initial pinyin, and English names in schools. CurSimple matches substrings and performs no transliteration.',
      developer: 'Plugin development guide', privacy: 'This page browses catalog information. School sign-in and imports take place in CurSimple; installation takes place in CurSimple or GitHub.',
      yangtzeName: 'Yangtze University', yangtzeDesc: 'Sign in to the Yangtze University academic system and import this term’s timetable into CurSimple.',
    },
  };
  function normalize(value) {
    if (typeof value !== 'string') return 'zh-CN';
    value = value.replace(/_/g, '-');
    if (/^en(?:-|$)/i.test(value)) return 'en';
    if (/^zh-(?:TW|HK|MO|Hant)/i.test(value)) return 'zh-TW';
    return 'zh-CN';
  }
  function t(key, language = 'zh-CN', values = {}) {
    const text = messages[normalize(language)][key];
    if (text == null) throw new Error(`Missing translation: ${key}`);
    return text.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
  }
  function labels(language) {
    return {
      'cursimple/YangtzU_course_plugin': { name: t('yangtzeName', language), description: t('yangtzeDesc', language) },
    };
  }
  return { messages, normalize, t, labels };
});
