## Context

`src/lib/ai/langgraph.ts` has a partial LangGraph import (`END`, `MemorySaver` from `@langchain/langgraph`) but implements the agent logic as a plain `while` loop manually routing between `reasonNode` → `actNode`. This provides no checkpointing, no streaming, and no graph-native features.

The project already uses SSE streaming in the `/api/ai/chat`, `/api/ai/langchain`, and `/api/ai/deepagents` routes. The langgraph route should follow the same pattern.

## Goals / Non-Goals

**Goals:**
- Replace the manual loop with a proper `StateGraph` using the `Pregel` API
- Add `MemorySaver` checkpointing for conversation persistence across requests
- Add a `runWorkflowStream()` async generator matching the SSE event schema (`event: content/done/error`)
- Keep the route's JSON response API surface for backward compatibility (add streaming separately)

**Non-Goals:**
- Modifying `/api/ai/langgraph/route.ts` API contract (it stays JSON-only; streaming can be added later)
- Supporting multiple concurrent agents
- Complex multi-agent orchestration

## Decisions

### 1. Use `StateGraph` with `Annotation` for typed state channels

LangChain 1.x uses `Annotation` to define typed state channels with reducers:

```typescript
import { Annotation } from '@langchain/langgraph'

const AgentState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (a, b) => [...a, ...b],
  }),
  input: Annotation<string>(),
  steps: Annotation<StepRecord[]>({
    reducer: (a, b) => [...a, ...b],
  }),
  currentStep: Annotation<number>(),
})
```

This replaces the manual spread-merging in the current `runAgent` function.

### 2. Nodes: `reason` and `act`

Two nodes mirror the current logic:
- `reasonNode`: extracts `thought` from last message, appends step record with empty observation
- `actNode`: calls the model and fills in the observation + final step

### 3. Edges: `START → reason → [act | end]`

Conditional edge from `reason`:
- `shouldContinue`: `state.currentStep >= 2` → `END`, else → `'act'`
- Direct edge `act → END`

### 4. `MemorySaver` for checkpointer

Instantiate at module level:
```typescript
const checkpointer = new MemorySaver()
const graph = workflow.compile({ checkpointer })
```

The checkpointer persists state between invocations when the same thread ID is provided.

### 5. Streaming: `runWorkflowStream()` async generator

Returns an async generator yielding `StreamChunk` objects matching the SSE schema:

```typescript
export async function* runWorkflowStream(
  input: string,
  threadId?: string
): AsyncGenerator<StreamChunk, void, unknown> {
  const config = { configurable: { thread_id: threadId ?? crypto.randomUUID() } }
  // ... stream events from graph.stream() or astreams()
}
```

This aligns with the `simpleChatStream` pattern in `langchain.ts`.

### 6. Keep `runWorkflow()` for backward compatibility

The existing `runWorkflow()` function stays unchanged (returns `WorkflowResult` with `response` and `steps`). New code uses the graph directly.

## Risks / Trade-offs

- **[Risk]** LangGraph API surface changed significantly between 0.x and 1.x. The installed version is `^1.3.0`, which uses the `Annotation`-based state API. Must use that pattern, not the old `channels` dict approach. → Mitigation: use `@langchain/langgraph` `Annotation` and `StateGraph` from the v1 API.

- **[Trade-off]** `MemorySaver` is in-memory; state is lost on server restart. For production, swap for `PostgresSaver` or `RedisSaver`. Out of scope for this change but noted for future.

- **[Risk]** The route currently returns JSON (`runWorkflow`). Adding SSE streaming would require a new endpoint (`/api/ai/langgraph/stream`). Keeping JSON for now avoids breaking changes.

## Migration Plan

1. Add new graph definition alongside existing code
2. Add `runWorkflowStream()` generator
3. Verify both `runWorkflow()` (existing tests) and new graph produce identical output
4. No route changes required
5. Rollback: revert `langgraph.ts` to previous version

## Open Questions

- Should the route gain a streaming variant? (Deferred — out of scope for this change)
- Do we want to expose `thread_id` in the route request body for multi-turn conversations? (Deferred)
