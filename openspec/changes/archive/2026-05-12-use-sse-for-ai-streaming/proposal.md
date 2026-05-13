## Why

目前项目中 `/api/ai/langchain` 和 `/api/ai/deepagents` 接口采用 HTTP 短轮询/同步响应方式交互——前端发送请求后等待整个响应完成才展示结果，用户体验较差（等待时间长、无法实时看到生成进度）。业界主流做法是通过 **Server-Sent Events (SSE)** 协议实现流式输出，让 AI 在生成 token 的同时将内容推送给前端逐字展示，既提升感知速度，也降低首 token 延迟。

## What Changes

1. **新增 SSE 流式路由**：将 `langchain` 和 `deepagents` 两个路由改造为 SSE 端点，返回 `text/event-stream`，实现真正的服务端推送流式输出。
2. **前端 SSE 消费层**：统一封装 SSE 读取逻辑，替换当前 ChatRoom 中直接读取 fetch body 的代码，支持错误恢复与连接中断重连。
3. **统一流式响应格式**：定义标准的 SSE data 字段结构（`content` / `thinking` / `done` / `error`），各 AI 后端统一适配。
4. **退化降级处理**：当 SSE 连接失败时，自动回退到普通 HTTP 请求，确保功能可用。
5. **移除旧的同步 HTTP 响应**：`langchain` 路由不再返回同步 JSON，同步接口仅作内部/调试用途（不再暴露给前端）。

## Capabilities

### New Capabilities

- `ai-sse-streaming`: 新增 SSE 流式交互能力，定义标准化 SSE 事件格式、前端消费 API 与后端流式实现规范，覆盖 `/api/ai/chat`、`/api/ai/langchain`、`/api/ai/deepagents` 三个路由的流式改造。
- `ai-stream-client`: 新增前端 SSE 消费 Hook/工具函数，统一处理 `EventSource` 或 `fetch + ReadableStream` 读取逻辑，向业务组件暴露简洁的 `useStream` / `createStreamConsumer` 接口，支持中断恢复和 loading 状态管理。

### Modified Capabilities

- *(无)* 项目中目前没有已发布的 AI 流式交互能力规范，不涉及对已有 spec 行为的修改。

## Impact

- **后端路由**：`/api/ai/chat`（已有 SSE 实现）、`/api/ai/langchain`、`/api/ai/deepagents` 均需改造响应格式。
- **前端组件**：`ChatRoom.tsx`（AI-Chat 页面）、`langchain/page.tsx`、`deepagents/page.tsx` 需改造 fetch 逻辑，替换为 SSE 消费层。
- **前端复用**：`components/ai/` 下的 `ChatMessage`、`ChatInput` 无需修改，仅交互层（fetch/SSE 读取）变更。
- **AI SDK / API**：LangChain OpenAI 调用和 DeepAgents API 调用内部均支持流式（`stream: true`），改动仅在封装层，不影响调用参数。
- **无破坏性变更**：旧路由保留内部同步路径，不影响无 SSE 能力的客户端（如 curl / 第三方调用）。
