# 贡献

我们非常感谢你对 **Flow** 项目的贡献兴趣！贡献对于项目的成长和成功至关重要。本文档概述了贡献指南，以确保开发过程的顺利进行和协作。

## 开始使用

本项目是一个使用 [Yarn workspaces](https://yarnpkg.com/features/workspaces) 管理的 monorepo。它包含以下包：

- `apps`：所有不同平台的应用程序
- `packages/core`：核心功能库，包含共享工具和公共状态

### 前提条件

确保你已经[设置好开发环境](https://reactnative.dev/docs/set-up-your-environment)。

- [Node.js](https://nodejs.org/)（v18 或更高版本）
- [Yarn Classic](https://classic.yarnpkg.com/en/docs)
- iOS 开发：macOS 和 Xcode
- Android 开发：Android Studio

### 开发工作流程

1. **Fork 仓库**

   Fork [`flow`](https://github.com/nodefinity/flow) 仓库。

2. **克隆**

   ```bash
   git clone https://github.com/your-username/flow.git
   cd flow
   ```

3. **安装依赖**

   ```bash
   pnpm install
   ```

4. **安装开发包**

   ```bash
   # iOS
   pnpm mobile ios

   # Android
   pnpm mobile android
   ```

5. **启动项目**

   ```bash
   pnpm dev
   ```

## 贡献指南

### 提交规范

我们遵循[约定式提交规范](https://www.conventionalcommits.org/en)来编写提交信息：

- `fix`：bug 修复，例如修复因废弃方法导致的崩溃
- `feat`：新功能，例如为模块添加新方法
- `refactor`：代码重构，例如从类组件迁移到 hooks
- `docs`：文档更改，例如为模块添加使用示例
- `test`：添加或更新测试，例如使用 detox 添加集成测试
- `chore`：工具更改，例如更改 CI 配置

我们的预提交钩子会在提交时验证你的提交信息是否符合此格式。

### 代码检查和格式化

我们严格遵守代码质量和编码标准，以维护高质量的代码库。

我们使用 [ESLint](https://eslint.org/) 来检查和格式化代码。请确保你的 VScode 安装了推荐的扩展。

### 发送拉取请求

> **第一次提交拉取请求？** 你可以通过这个免费系列学习：[如何在 GitHub 上为开源项目做贡献](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github)。

当你发送拉取请求时：

- 优先选择专注于一个更改的小型拉取请求
- 验证代码检查和测试是否通过
- 检查文档以确保其看起来良好
- 在打开拉取请求时遵循拉取请求模板
- 对于更改 API 或实现的拉取请求，请先通过创建 issue 与维护者讨论
