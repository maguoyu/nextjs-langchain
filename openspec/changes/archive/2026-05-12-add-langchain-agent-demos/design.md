## Context

项目已集成 LangChain 基础包 (`@langchain/core`, `langchain`)，但缺少实际使用示例。需要创建三个 Demo 页面展示 LangChain、LangGraph 和 DeepAgents 的核心功能。

当前技术栈：
- Next.js 15 App Router
- 已安装 `@langchain/core@^1.1.45` 和 `langchain@^1.4.0`
- 需要配置 AI 模型 API Key（环境变量）

## Goals / Non-Goals

**Goals:**
- 创建 LangChain 对话 Demo（简单对话问答）
- 创建 LangGraph 工作流 Demo（多步骤 Agent 推理）
- 创建 DeepAgents 推理 Demo（深度推理和问题分解）
- 统一的聊天 UI 组件和 API 路由结构

**Non-Goals:**
- 不实现完整的 RAG pipeline（向量数据库集成）
- 不实现复杂的 Agent 记忆系统
- 不实现流式响应（Streaming），使用同步请求

## Decisions

### 1. API 路由设计
每个 Demo 有独立的 API 路由：
- `/api/ai/langchain` - LangChain 对话
- `/api/ai/langgraph` - LangGraph 工作流
- `/api/ai/deepagents` - DeepAgents 推理

### 2. 模型选择
- **LangChain Demo**: 使用 OpenAI GPT-4o-mini（快速、便宜）
- **LangGraph Demo**: 使用 OpenAI GPT-4o（支持复杂推理）
- **DeepAgents Demo**: 使用 OpenAI GPT-4o（通用推理）

### 3. 页面组件结构
- 使用现有的 UI 组件库（Card、Button、Input 等）
- 复用 dashboard layout 和样式
- 统一的聊天消息展示组件

### 4. 环境变量
需要配置：
```
OPENAI_API_KEY=sk-...
DEEPAGENTS_API_KEY=sk-...
```

### 5. 包依赖
- `@langchain/langgraph` - LangGraph 工作流
- `@langchain/openai` - OpenAI 集成

## Risks / Trade-offs

[Risk] API Key 安全 → Mitigation: 仅在服务端 API 路由中使用，不暴露给客户端

[Risk] 模型调用延迟 → Mitigation: 添加加载状态，展示 "AI 思考中..."

[Risk] Demo 复杂度 → Mitigation: 使用简单示例，代码注释详细说明

## Migration Plan

1. 安装额外依赖（langgraph、openai SDK）
2. 创建 API 路由（服务端）
3. 创建 Demo 页面（客户端）
4. 添加菜单项到数据库
5. 测试各 Demo 功能

## Open Questions

- 是否需要流式响应支持？
- 是否需要持久化对话历史？
- DeepAgents API 是否已配置？
