### 🆕 New Features
  * 新增基于 `Workers` 的 `Maps (Rewrite)` 新模块，面向 `Loon`、`Surge`、`Stash`、`Shadowrocket`、`Egern` 提供新的 Rewrite 版本配置。

### 🛠️ Bug Fixes
  * 修正 `卫星图像(Satellite)` 版本选项的文案描述，明确该设置仅影响 `2D` 卫星图像版本，并减少 `HYBRID` 表述歧义。

### 🔣 Dependencies
  * 新增基础依赖：`hono`、`fetch-cookie`、`@biomejs/biome`。
  * 更新开发与基础依赖：`@rspack/cli`、`@rspack/core` 升级至 `^1.7.7`，`@nsnanocat/util` 升级至 `^2.2.3`。

### ‼️ Breaking Changes
  * none

### 🔄 Other Changes
  * 统一 `Workers` 模块命名，配置名称追加 `(Rewrite)` 后缀，提升不同版本的辨识度。
