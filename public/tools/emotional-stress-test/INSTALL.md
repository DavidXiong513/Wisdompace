# 抑郁、焦虑、压力心理健康综合测评 - 安装指南

> **版本**: v2.1.0 | **适用平台**: WorkBuddy Skills 市场 / 独立Web应用

## 安装方式

### 方式1：通过 Skills 市场安装（推荐）

在 WorkBuddy Skills 平台搜索 **"抑郁、焦虑、压力心理健康综合测评"** 或 **"抑郁自测"**，一键安装即可。

安装后 Skill 会自动部署到 `~/.workbuddy/skills/depression-anxiety-stress-assessment/`，无需手动操作。

### 方式2：手动安装

1. 下载整个 `depression-anxiety-stress-assessment` 文件夹
2. 将其复制到 WorkBuddy Skills 目录：
   - **Windows**: `C:\Users\<用户名>\.workbuddy\skills\`
   - **macOS/Linux**: `~/.workbuddy/skills/`
3. 重启 WorkBuddy 或重新加载 Skills
4. 确保文件夹结构如下：
   ```
   ~/.workbuddy/skills/depression-anxiety-stress-assessment/
   ├── SKILL.md                    # Skill核心定义（必须）
   ├── interactive-assessment.html # 主交互界面
   ├── README.md                   # 使用说明
   ├── INSTALL.md                  # 本文件
   ├── demo-test.html              # 功能演示页
   ├── references/                 # 参考资料文档
   │   ├── sds_questions.md        # SDS抑郁量表题目+规则
   │   ├── sas_questions.md        # SAS焦虑量表题目+规则
   │   ├── les_events.md           # LES生活事件量表
   │   └── risk_algorithm.md       # 三维风险矩阵算法
   ├── scripts/                    # 计算脚本
   │   ├── calc_engine.py          # Python计算引擎
   │   └── final_validation.js     # 验证测试脚本
   └── assets/                     # 资源文件
       └── report-template.html    # HTML报告模板
   ```

### 方式3：作为独立 Web 应用

无需安装任何环境，直接使用：

1. 下载整个文件夹到本地
2. 用浏览器打开 `interactive-assessment.html`
3. 即可开始测评，所有数据保存在浏览器本地

> 💡 **适合场景**：离线使用、分享给他人、嵌入到现有网页中

## 验证安装

### 验证 Skill 是否生效

1. 在 WorkBuddy 中输入关键词触发：
   - "抑郁自测"
   - "焦虑自测"
   - "心理健康评估"
   - "压力测试"
2. 应该看到 Skill 的响应和引导

### 验证 HTML 界面

1. 在浏览器中打开 `interactive-assessment.html`
2. 应看到欢迎页面 + 4张功能卡片（SDS / SAS / LES / 报告）
3. 完成任意一项测评 → 查看综合报告

### 验证计算引擎

```bash
cd scripts/

# 运行 JavaScript 验证脚本（46项测试）
node final_validation.js

# 或用 Python 引擎单独测试
python calc_engine.py --sds 55 --les 168
```

## 配置选项

### 自定义风险阈值

如需调整风险分级标准，可编辑以下文件：

| 文件 | 作用 |
|------|------|
| `references/risk_algorithm.md` | 三维风险矩阵参数定义 |
| `scripts/calc_engine.py` | Python引擎中的阈值常量 |
| `interactive-assessment.html` | 前端JS中的分级函数 |

### 自定义建议内容

- **Python引擎**: 编辑 `scripts/calc_engine.py` 中的 recommendations 字典
- **前端界面**: 编辑 `interactive-assessment.html` 中的 `generateRecommendations()` 函数
- **报告模板**: 编辑 `assets/report-template.html`

## 故障排除

### Skill 不响应

1. **检查位置** — 确保 `depression-anxiety-stress-assessment` 文件夹在 `~/.workbuddy/skills/` 下
2. **检查SKILL.md** — 该文件必须存在且命名正确（全大写）
3. **重启WorkBuddy** — 有时需要完全重启才能加载新Skill
4. **检查权限** — 确保WorkBuddy有读取该目录的权限

### HTML界面异常

1. **浏览器兼容性** — 推荐Chrome / Edge / Firefox 现代版本
2. **JavaScript** — 确认浏览器未禁用JS
3. **localStorage** — 确保浏览器允许本地存储（隐私模式可能受限）
4. **查看控制台** — 按 F12 打开开发者工具，查看报错信息

### 计算结果异常

1. **Python版本** — 需要 Python 3.7+（仅命令行引擎需要）
2. **反向计分题** — SDS有10道、SAS有5道，确认算法正确处理
3. **标准分转换** — 原始分 × 1.25 = 标准分（取整数）

## 更新与卸载

### 更新

从 Skills 市场获取最新版本即可覆盖更新。本地安装的用户数据（localStorage）不会丢失。

### 卸载

```bash
# 删除Skill目录
# Windows
rmdir /s "%USERPROFILE%\.workbuddy\skills\depression-anxiety-stress-assessment"

# macOS/Linux
rm -rf ~/.workbuddy/skills/depression-anxiety-stress-assessment
```

浏览器 localStorage 数据需手动清除（或通过HTML界面的重置按钮）。

---

## 版本信息

| 版本 | 日期 | 主要变化 |
|------|------|----------|
| v2.1.0 | 2026-04-04 | 全量审计修正阈值统一(40)、补全重度等级、移除install.bat |
| v2.0.0 | 2026-04-04 | 新增SAS焦虑量表，升级为三维风险评估(SDS×SAS×LES) |
| v1.0.0 | 2026-04-04 | 首版发布，SDS+LES双量表 |

---

*适用于 depression-anxiety-stress-assessment v2.1.0*
