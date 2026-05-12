## Why

`src/lib/ai/langgraph.ts` imports `END` and `MemorySaver` from `@langchain/langgraph` but never uses them — the agent is implemented as a manual `while` loop instead of a proper LangGraph state graph. This prevents the use of persistence (checkpoints), streaming, and proper graph visualization/debugging.

## What Changes

- Replace the manual `while` loop in `runAgent()` with a proper LangGraph `StateGraph` definition
- Use `MemorySaver` for conversation checkpointing
- Define graph nodes, edges, and conditional routing explicitly
- Add `runWorkflowStream()` generator for SSE streaming support (aligning with the existing SSE streaming pattern in the codebase)
- Keep the existing `/api/ai/langgraph/route.ts` compatible — only `langgraph.ts` implementation changes

## Capabilities

### New Capabilities

- `langgraph-workflow`: Full LangGraph ReAct agent with StateGraph, MemorySaver checkpointing, and streaming support

### Modified Capabilities

- (none)

## Impact

- **Modified**: `src/lib/ai/langgraph.ts` — core graph definition, replaces manual loop
- **Modified**: `src/app/api/ai/langgraph/route.ts` — may need minor updates if the graph API changes
- **New dependency**: `@langchain/langgraph` (already imported but unused — verify it's in `package.json`)
