### 🆕 New Features
  * none

### 🛠️ Bug Fixes
  * 优化 `Geo Manifest` 资源清单缓存流程，补强下载、缓存校验与解码保护逻辑，提升资源清单刷新、读取与回退时的稳定性。
  * 改进不同地区 `Geo Manifest` 的缓存预热与复用逻辑，并修正 `XX -> US` 的回源处理，减少切换地区后资源清单异常或缓存失效的情况。

### 🔣 Dependencies
  * 更新 `@auraflare/shared` 至 `1.1.1`，同步调整包源配置以适配共享存储能力。

### ‼️ Breaking Changes
  * none

### 🔄 Other Changes
  * 调整自托管 Worker 的默认缓存绑定配置，新增 `Maps` KV 绑定并改为复用共享 KV 实例，以改善持续运行场景下的缓存持久化表现。
