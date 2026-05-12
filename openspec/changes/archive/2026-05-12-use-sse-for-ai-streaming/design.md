## Context

项目中 AI 对话功能分布在三个入口：

- **`/api/ai/chat`** — 基于智谱 GLM-4，已实现 SSE 流式输出（`ReadableStream` 读取上游 SSE 事件并透传），前端 `ChatRoom.tsx` 使用 `fetch + ReadableStream` 消费。但代码分散在前端组件内部。
- **`/api/ai/langchain`** — 基于 OpenAI (GPT-4o)，当前返回同步 JSON 完整响应，前端需等待全部生成后才展示内容。
- **`/api/ai/deepagents`** — 基于 DeepAgents 推理模型，当前返回同步 JSON，包含 `response` / `thinking` / `reasoning` 三个字段。

前端三个 AI 页面各自独立实现了 fetch 逻辑，复用度低，且 LangChain/DeepAgents 页面无法展示实时流式效果。

当前技术约束：

- 目标运行时：Next.js App Router，`runtime = 'nodejs'`（支持完整 Node.js API）。
- AI 上游 API（智谱、DeepAgents）均支持 SSE 流式响应。
- 前端已有 `use client` 组件架构，支持 `ReadableStream` 读取。

## Goals / Non-Goals

**Goals:**

- 三个 AI 路由全部改为 SSE 流式响应，实现 token 级别实时推送。
- 抽象统一的前端 SSE 消费层（Hook / 工具函数），各页面复用，组件仅负责 UI 渲染。
- 定义标准的 SSE 事件格式规范，各后端路由适配统一格式。
- 保持向后兼容：同步调试接口（内部使用）不受影响，第三方调用（curl 等）可正常退化。

**Non-Goals:**

- 不修改 `ChatMessage` / `ChatInput` 等纯 UI 组件结构。
- 不引入 WebSocket，专注于 SSE（Server-Sent Events）。
- 不改动 AI 模型参数、Prompt 结构或业务逻辑，仅改造传输层。
- LangChain LangGraph 工作流（`/api/ai/langgraph`）暂不改为流式（其工作流结果为结构化 JSON，不适合 token 级别流式）。

## Decisions

### Decision 1: SSE vs WebSocket

**选择 SSE**（Server-Sent Events）。

- 理由：AI 生成场景是单向服务端推送（服务端 → 客户端），无需双向通信。SSE 基于 HTTP/1.1，无需额外协议升级，与现有 Next.js 路由完全兼容。
- 对比 WebSocket：WebSocket 支持双向通信但引入连接管理复杂度（心跳、重连），对纯流式输出场景过于重量。
- 对比 Long Polling：实时性差且浪费资源。

### Decision 2: 统一 SSE 事件格式

定义两种事件类型：

```
event: content
data: {"content": "部分文本内容"}

event: thinking
data: {"thinking": "推理过程文本"}

event: done
data: {"total": "完整响应文本"}

event: error
data: {"error": "错误描述"}
```

- `content`：逐 token/逐片段推送生成内容，前端实时追加展示。
- `thinking`：仅 `deepagents` 路由推送，前端在 `ChatMessage` 组件中渲染 thinking 区块。
- `done`：最终一次性推送完整内容（便于前端直接取用，不依赖中间拼接）。
- `error`：出错时的错误信息。

**替代方案**（被拒绝）：

- 统一用单一 `message` 事件，前端自行解析类型字段 —— 缺点：类型模糊，错误处理不明确。
- 只用 `content` + `done` 两种事件，不单独发送 `thinking` —— 缺点：`deepagents` thinking 内容需与 content 同步展示，拆分更清晰。

### Decision 3: 前端 SSE 消费层

实现路径：创建 `src/lib/ai/stream-client.ts`，导出 `createSSEStream` 工具函数。

```typescript
// 返回一个可消费对象，含 reader 和 abort 控制器
const stream = await createSSEStream('/api/ai/xxx', { message, history })
for await (const event of stream.events) {
  if (event.type === 'content') setContent(prev => prev + event.data.content)
  if (event.type === 'done') { setLoading(false); break }
}
```

- 使用 `fetch + ReadableStream`（替代 `EventSource` API），因为需要支持 POST 请求携带 body（历史消息）。
- `createSSEStream` 返回 `{ events: AsyncIterable<StreamEvent>, abort: () => void }`，提供手动中断能力。
- 各页面组件调用统一封装在 `useStream` hook（可选），简化使用。

**为什么不直接用 `EventSource`**：SSE 标准协议仅支持 GET 请求，无法传递 messages history 等 body 参数，`EventSource` 不适用。

### Decision 4: 路由响应实现

#### `/api/ai/chat`

已有 SSE 实现，保持不变，统一适配标准事件格式（`content` / `done`）。

#### `/api/ai/langchain`

改造：利用 LangChain 的 `.stream()` 方法替代 `.invoke()`，逐 token 流式推送。

- LangChain `ChatOpenAI` 支持 `stream: true`，调用 `model.stream(messages)` 返回 `IterableReadableStream<ChatGenerationChunk>`。
- 遍历 chunks，提取 `chunk.content`，逐条 SSE 推送。

#### `/api/ai/deepagents`

改造：DeepAgents API 本身支持 SSE 流式，上游推送 `delta.content` 和 `delta.thinking` 两种事件。将上游 SSE 解码后，按统一格式转发给前端。

### Decision 5: 内部同步回退路由（可选）

保留内部调试端点：`/api/ai/langchain/sync` 和 `/api/ai/deepagents/sync`，返回完整 JSON。

- 原因：开发调试、curl 测试、自动化测试脚本需要同步响应。
- 不暴露在前端导航中，仅供内部使用。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 上游 AI API 流式不稳定（断流、超时） | `createSSEStream` 封装 reader 错误捕获，超时后触发 `error` 事件并展示提示 |
| Next.js Vercel/Edge 运行时对 `ReadableStream` 支持不一致 | 明确 `runtime = 'nodejs'`，在 Edge 环境下给出明确提示 |
| 前端 SSE 读取逻辑分散导致不一致 | 统一 `stream-client.ts`，各页面调用同一接口，UI 组件不变 |
| thinking 内容与 content 推送时序不同步 | `deepagents` 路由在 `done` 事件中同时发送完整 `content` + `thinking`，前端可选择实时展示或等 done 后统一渲染 |

## Migration Plan

1. **创建 `src/lib/ai/stream-client.ts`**：实现 `createSSEStream` 工具函数和类型定义。
2. **改造 `/api/ai/langchain/route.ts`**：切换为 `model.stream()`，按统一格式推送 SSE 事件。
3. **改造 `/api/ai/deepagents/route.ts`**：将上游 SSE 解码并按统一格式转发。
4. **改造 `ChatRoom.tsx`**：用 `createSSEStream` 替换当前内联 SSE 读取逻辑。
5. **改造 `langchain/page.tsx`**：用 `createSSEStream` 替换同步 fetch，更新 `loading` 状态为实时流式。
6. **改造 `deepagents/page.tsx`**：同上，额外处理 thinking 实时推送。
7. **验证**：各页面在浏览器中测试，确认 token 逐字展示、thinking 同步推送、无报错。

**回滚策略**：若发现问题，直接回退对应 API 路由文件（Git revert），前端页面因共用 stream-client 需同步回退。流式切换为向后兼容，回滚风险低。

## Open Questions

1. **LangChain 流式是否需要单独拆分 SSE route？** 目前计划直接在现有 route 内改造（`simpleChat` → `model.stream()`）。若后续需要更复杂的流式编排逻辑，可考虑新建 `src/lib/ai/langchain-stream.ts` 封装。
2. **是否需要支持 `AbortSignal`（取消生成）？** 前端目前无取消按钮设计，可后续扩展。`createSSEStream` 已预留 `abort` 方法。
3. **deepagents 上游 API 是否已支持 SSE？** 需确认 `api.deepagents.com` 的 `/v1/chat` 接口在 `stream: true` 模式下是否返回 SSE。若不支持，需改用服务端逐 token 推送策略。
