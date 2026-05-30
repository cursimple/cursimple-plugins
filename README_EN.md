# 📦 Cursimple Plugin Marketplace

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?style=flat-square&logo=github)](https://cursimple.github.io/cursimple-plugins/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Plugins](https://img.shields.io/badge/Plugins-counted-brightgreen?style=flat-square)](https://cursimple.github.io/cursimple-plugins/)

**English** | **[中文](README.md)**

> **The official plugin registry for Cursimple.**  
> Only plugins listed in this repository will appear in the Cursimple plugin marketplace.

---

## 🎯 What is this?

This is the **official plugin registry** for Cursimple. All plugins displayed in Cursimple need to be registered in the [`plugins.json`](plugins.json) file of this repository.

**Plugin Marketplace:** [https://cursimple.github.io/cursimple-plugins/](https://cursimple.github.io/cursimple-plugins/)

---

## 🔍 How to Use the Plugin Marketplace?

### 1️⃣ Browse Plugins

Visit the [Plugin Marketplace](https://cursimple.github.io/cursimple-plugins/) to:

- **View all available plugins** - Displayed as cards with plugin name, description, star count, etc.
- **Click plugin cards** - Directly navigate to the plugin's GitHub repository for details and installation instructions
- **Sorted by stars** - Plugins with more stars are displayed first

### 2️⃣ Install Plugins

1. Find the plugin you need in the marketplace
2. Click the plugin card to visit its GitHub repository
3. Follow the installation instructions in the plugin repository

---

## 📋 Currently Listed Plugins

| Plugin Repository | Description |
|------------------|-------------|
| [cursimple/YangtzU_course_plugin](https://github.com/cursimple/YangtzU_course_plugin) | Yangzhou University Course Plugin |

> 💡 The plugin list is automatically updated with star counts and other metadata periodically.

---

## 🤝 How to Submit a Plugin?

If you want your plugin to appear in the Cursimple plugin marketplace:

### Method 1: Direct Edit (Requires Collaborator Access)

1. Click [Edit plugins.json on GitHub](https://github.com/cursimple/cursimple-plugins/edit/main/plugins.json)
2. Add your plugin repository address to the JSON array (format: `"owner/repo"`)
3. Commit changes

### Method 2: Submit a Pull Request (Recommended)

1. Fork this repository
2. Add your plugin repository address to `plugins.json`
3. Submit a Pull Request
4. Wait for review and merge

### Plugin Requirements

- Plugin must be hosted on GitHub
- Plugin repository must be public
- Plugin should be compatible with Cursimple

---

## 🛠️ Technical Details

### File Structure

```
cursimple-plugins/
├── .github/
│   └── workflows/
│       └── update-plugin-stars.yml  # GitHub Actions for auto-updating star data
├── docs/
│   ├── index.html                   # Plugin marketplace page
│   ├── style.css                    # Page styles
│   └── app.js                       # Page logic
├── plugins.json                     # Plugin registry (core file)
├── fetch_plugin_stars.py            # Script to fetch plugin star data
└── LICENSE                          # MIT License
```

### How It Works

1. **Plugin Registration**: Plugin information is stored in `plugins.json` as an array of GitHub repository `"owner/repo"` strings
2. **Data Updates**: GitHub Actions runs automatically every 6 hours to fetch star counts and other metadata for all plugins
3. **Page Display**: The static page reads data from GitHub and displays the plugin list

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🔗 Related Links

- [Cursimple](https://github.com/cursimple) - Main Cursimple project
- [Plugin Marketplace](https://cursimple.github.io/cursimple-plugins/) - Browse plugins online
- [Submit Plugin](https://github.com/cursimple/cursimple-plugins/edit/main/plugins.json) - Add your plugin

---

<p align="center">
  <sub>Maintained by the Cursimple Team ❤️</sub>
</p>