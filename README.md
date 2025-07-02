# 葬送的芙莉莲 - 主题网站

本项目是一个基于 **Next.js** 和 **Tailwind CSS** 构建的现代化 Web 应用，作为课程期末项目。网站以著名动漫 **《葬送的芙莉莲》** 为主题，进行了全面的视觉设计和内容重构，旨在提供一个沉浸式的浏览体验。

项目不仅整合了课程期间完成的 **HTML/CSS/JS 作品集**，还集成了一个由 **QAnything 大语言模型** 驱动的定制化智能问答机器人——"芙莉莲问答"。

## ✨ 项目特色

-   **沉浸式主题设计**:
    -   以《葬送的芙莉莲》为核心视觉主题，所有页面均经过重新设计。
    -   采用**浅蓝色调**的色彩方案，营造出宁静、优雅的氛围。
    -   使用精美的角色图片作为**固定背景**和页面元素，增强视觉吸引力。

-   **芙莉莲的旅程记录 (作品集)**:
    -   将课程练习作业以卡片画廊的形式进行展示。
    -   每个卡片都配有来自《芙莉莲》的精美插图，使作品集与主题完美融合。

-   **芙莉莲问答 (QAnything 集成)**:
    -   提供一个定制化的聊天界面，用户可以与"芙莉莲"（由 QAnything 模型驱动）进行互动。
    -   前端界面完全自定义，实现了与后端 API 的安全通信，保障了 API Key 的安全。

-   **WakaTime 集成**:
    -   在页脚低调地集成了 WakaTime API，实时展示开发者的总编码时长。

## 🛠️ 技术栈

-   **框架**: [Next.js](https://nextjs.org/) (React 框架)
-   **UI 库**: [React](https://reactjs.org/)
-   **语言**: [TypeScript](https://www.typescriptlang.org/)
-   **样式**: [Tailwind CSS](https://tailwindcss.com/)
-   **API 集成**:
    -   [WakaTime API](https://wakatime.com/developers) - 用于编码活动跟踪
    -   [QAnything API](https://qanything.ai/) - 用于驱动智能问答机器人

## 🚀 本地开发指南

1.  **克隆仓库**
    ```bash
    git clone [你的仓库URL]
    cd final-project
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **设置环境变量**
    创建 `.env.local` 文件，并填入您的 API 密钥和 Agent UUID：
    ```
    # 从 https://wakatime.com/settings/api-key 获取
    WAKATIME_API_KEY="YOUR_WAKATIME_API_KEY"

    # 从你的QAnything服务商获取
    QANYTHING_API_KEY="YOUR_QANYTHING_API_KEY"
    QANYTHING_AGENT_UUID="YOUR_QANYTHING_AGENT_UUID"
    ```

4.  **运行开发服务器**
    ```bash
    npm run dev
    ```

    在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看最终效果。

## 📂 项目结构

```
/final-project
├── app/
│   ├── components/       # 共享组件 (Header, Footer)
│   ├── portfolio/        # 作品集页面 ("芙莉莲的旅程记录")
│   ├── qanything/        # 问答页面 ("芙莉莲问答")
│   ├── api/              # 后端 API 路由 (代理外部 API 请求)
│   ├── layout.tsx        # 全局布局
│   ├── globals.css       # 全局样式与背景图
│   └── page.tsx          # 应用首页
├── public/               # 静态资源 (图片等)
├── .env.local            # 环境变量
└── README.md             # 项目说明文件
```

## QAnything 集成路径与实现

**选择路径**: 进阶路径 (Advanced Path)

**原因**:
选择进阶路径是为了更深入地挑战自我，全面实践前端开发的各项技能。通过自行设计和开发与 QAnything API 交互的前端界面，可以更好地掌握 API 对接、前端状态管理、异步操作、错误处理以及 UI/UX 设计。这不仅能满足作业的最高要求，也是一个将所学知识融会贯通的绝佳机会。

**实现细节**:
- **前端界面**: 在 `/app/qanything` 路径下，使用 React 和 Tailwind CSS 构建一个用户友好的聊天界面，包括输入框、发送按钮、以及展示问答历史的区域。
- **API 调用**: 将在后端 API 路由 (`/app/api/qanything`) 中处理对 QAnything API 的请求。这样做可以隐藏 API Key，避免其暴露在客户端，提高安全性。
- **状态管理**: 使用 React Hooks (如 `useState`, `useEffect`) 来管理用户输入、加载状态、API 返回的答案以及可能的错误信息。
- **高级特性**: (可选) 后续可能实现流式输出，以提升用户体验。

## WakaTime API 集成方法

1.  从 [WakaTime Settings](https://wakatime.com/settings/api-key) 获取个人 API Key。
2.  将 API Key 存储在 `.env.local` 文件的 `WAKATIME_API_KEY` 变量中。
3.  创建一个服务器端函数或 API 路由，用于获取 WakaTime 数据，避免在客户端暴露 API Key。
4.  在全局 Footer 组件中调用该函数，获取并展示总编码时长。

## GitHub 仓库管理

本项目所有代码和文档均通过 Git 进行版本控制，并托管在公共 GitHub 仓库中。Commit 信息遵循清晰、有意义的原则，以保持良好的开发历史记录。
