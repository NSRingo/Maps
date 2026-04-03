### 🆕 New Features
  * none

### 🛠️ Bug Fixes
  * 优化 `Geo Manifest` 资源清单缓存流程，补强下载、缓存校验与解码保护逻辑，提升资源清单刷新与回退时的稳定性。
  * 改进不同地区 `Geo Manifest` 缓存的预热与复用逻辑，减少切换地区后资源清单异常或缓存失效的情况。

### 🔣 Dependencies
  * 更新 `@nsnanocat/util` 并引入 `@auraflare/shared`，改善 Worker 场景下的共享能力与缓存兼容性。

### ‼️ Breaking Changes
  * none

### 🔄 Other Changes
  * 优化自托管 Worker 的默认缓存绑定配置与运行时放置策略，改善持续运行场景下的缓存持久化表现。
