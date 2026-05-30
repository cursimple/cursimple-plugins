# 📦 Cursimple 插件市场

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?style=flat-square&logo=github)](https://cursimple.github.io/cursimple-plugins/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Plugins](https://img.shields.io/badge/Plugins-counted-brightgreen?style=flat-square)](https://cursimple.github.io/cursimple-plugins/)

**[English](README_EN.md)** | **中文**

> **课简（Cursimple）的官方插件总仓库。**  
> 只有收录在此仓库中的插件，才会在课简的插件市场中显示。

---

## 🎯 这是什么？

这是课简（Cursimple）的**官方插件注册表**。所有在课简中展示的插件，都需要被收录到本仓库的 [`plugins.json`](plugins.json) 文件中。

**插件市场地址：** [https://cursimple.github.io/cursimple-plugins/](https://cursimple.github.io/cursimple-plugins/)

---

## 🔍 如何使用插件市场？

### 1️⃣ 浏览插件

访问 [插件市场页面](https://cursimple.github.io/cursimple-plugins/)，你可以：

- **查看所有可用插件** - 以卡片形式展示，包含插件名称、描述、星标数等信息
- **点击插件卡片** - 直接跳转到插件的 GitHub 仓库，了解详情和安装方法
- **按星标排序** - 星标数多的插件会优先显示

### 2️⃣ 安装插件

1. 在插件市场中找到你需要的插件
2. 点击插件卡片，进入其 GitHub 仓库
3. 按照插件仓库中的说明进行安装

---

## 📋 当前收录的插件

| 插件仓库 | 说明 |
|---------|------|
| [cursimple/YangtzU_course_plugin](https://github.com/cursimple/YangtzU_course_plugin) | 扬州大学课程插件 |

> 💡 插件列表会定期自动更新星标等元数据。

---

## 🤝 如何提交插件？

如果你想让自己的插件出现在课简的插件市场中：

### 方法一：直接编辑（需协作者权限）

1. 点击 [在 GitHub 编辑 plugins.json](https://github.com/cursimple/cursimple-plugins/edit/main/plugins.json)
2. 在 JSON 数组中添加你的插件仓库地址（格式：`"owner/repo"`）
3. 提交更改

### 方法二：提交 Pull Request（推荐）

1. Fork 本仓库
2. 在 `plugins.json` 中添加你的插件仓库地址
3. 提交 Pull Request
4. 等待审核合并

### 插件要求

- 插件必须托管在 GitHub 上
- 插件仓库必须是公开的
- 插件应与课简（Cursimple）兼容

---

## 🛠️ 技术细节

### 文件结构

```
cursimple-plugins/
├── .github/
│   └── workflows/
│       └── update-plugin-stars.yml  # 自动更新星标数据的 GitHub Actions
├── docs/
│   ├── index.html                   # 插件市场页面
│   ├── style.css                    # 页面样式
│   └── app.js                       # 页面逻辑
├── plugins.json                     # 插件注册表（核心文件）
├── fetch_plugin_stars.py            # 获取插件星标数据的脚本
└── LICENSE                          # MIT 许可证
```

### 工作原理

1. **插件注册**：插件信息存储在 `plugins.json` 中，格式为 GitHub 仓库的 `"owner/repo"` 字符串数组
2. **数据更新**：GitHub Actions 每 6 小时自动运行一次，获取所有插件的星标等元数据
3. **页面展示**：静态页面从 GitHub 读取数据并展示插件列表

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

## 🔗 相关链接

- [课简（Cursimple）](https://github.com/cursimple) - 课简主项目
- [插件市场](https://cursimple.github.io/cursimple-plugins/) - 在线浏览插件
- [提交插件](https://github.com/cursimple/cursimple-plugins/edit/main/plugins.json) - 添加你的插件

---

<p align="center">
  <sub>由课简团队维护 ❤️</sub>
</p>