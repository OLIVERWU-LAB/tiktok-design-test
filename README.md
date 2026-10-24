# Oliver Wu · TikTok AI Design Test

三题整合答卷。HTML、CSS 与原生 JavaScript，无构建步骤。

- **测试提交链接**：https://oliverwu-lab.github.io/tiktok-design-test/
- **第二题在线体验**：https://oliverwu-lab.github.io/live-expression-effects/
- **第二题 Public 源码**：https://github.com/OLIVERWU-LAB/live-expression-effects

## 内容

1. 自动化 Pipeline 设计：四类 Agent、调用契约、质量拦截与重试预算。
2. Vibe Coding：实时表情互动、三种风格的动态预览及 193 字开发复盘。
3. 图像美学评测：20 张图像，五维标准、排序与逐图依据。

## 本地查看

在仓库根目录运行 `python3 -m http.server 4188`，打开 http://127.0.0.1:4188/ 。
请通过 HTTP 服务查看，以便载入评分数据。GitHub Pages 从 `main` 分支根目录发布。

## 第二题预览

八个静音代码预览直接复用最终 Demo 的粒子工厂与绘制器。默认自动播放；点击画面暂停／继续，画面底部内嵌进度条支持定位。减少动态效果偏好下默认暂停。移出视口或隐藏页面后暂停绘制，不加载识别模型或音效。礼物图集解码共享。

`effect-preview/` 只用于展示动画；真实表情、头部、身体和手部碰撞在独立体验链接中使用摄像头运行。

本仓库不包含 Sites 访问凭证、私人备份、历史模型与旧版预览。

## 当前底稿

第一题与第三题使用「设计测试答卷-干净版」中提供的最新代码与数据；仅替换第二题为已确认的在线体验、源码入口、八个独立动态预览及193字复盘。
