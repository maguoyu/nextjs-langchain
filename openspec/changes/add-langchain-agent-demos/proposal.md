## Why

项目已集成 Next.js 和 LangChain 基础架构，需要添加 LangChain、LangGraph 和 DeepAgents 的实际使用示例页面，展示 AI 对话、Agent 工作流和深度推理能力，帮助用户快速上手 LangChain 官方 AI Agent 开发体系。

## What Changes

- 新增 `/dashboard/langchain` 页面：展示基于 LangChain 的对话示例
- 新增 `/dashboard/langgraph` 页面：展示基于 LangGraph 的多步骤 Agent 工作流
- 新增 `/dashboard/deepagents` 页面：展示 DeepAgents 深度推理示例
- 添加必要的 API 路由处理这些请求
- 更新侧边栏菜单添加 AI Demo 入口
- 更新 `.env.example` 添加所需的环境变量

## Capabilities

### New Capabilities

- `langchain-chat`: LangChain 对话 Demo，展示基础对话和简单问答能力
- `langgraph-workflow`: LangGraph 工作流 Demo，展示 Agent 的状态机和多步骤推理
- `deepagents-reasoning`: DeepAgents 推理 Demo，展示深度推理和问题分解能力

### Modified Capabilities

- `sidebar-menu`: 添加 AI Demo 菜单分组

## Impact

- 新增 `src/app/dashboard/langchain/page.tsx`
- 新增 `src/app/dashboard/langgraph/page.tsx`
- 新增 `src/app/dashboard/deepagents/page.tsx`
- 新增 `src/app/api/ai/langchain/route.ts`
- 新增 `src/app/api/ai/langgraph/route.ts`
- 新增 `src/app/api/ai/deepagents/route.ts`
- 新增 `src/lib/ai/models.ts`
- 新增 `src/lib/ai/langchain.ts`
- 新增 `src/lib/ai/langgraph.ts`
- 新增 `src/lib/ai/deepagents.ts`
- 修改菜单数据库添加 AI Demo 菜单项
