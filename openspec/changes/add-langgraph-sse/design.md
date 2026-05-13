## Context

The `/api/ai/langgraph` endpoint currently returns a synchronous JSON response after the entire agent workflow completes. The `runWorkflowStream()` generator already exists in `src/lib/ai/langgraph.ts` but has no HTTP endpoint. The existing SSE streaming pattern in `/api/ai/chat` (with `sendEvent('content'|'done'|'error')` over `text/event-stream`) is well-established and should be mirrored.

The frontend `/dashboard/langgraph` page awaits the full response before rendering, preventing users from seeing the agent's reasoning steps in real time.

## Goals / Non-Goals

**Goals:**
- Add `/api/ai/langgraph/stream` SSE endpoint consuming `runWorkflowStream()`
- Align SSE event schema with `/api/ai/chat` (events: `content`, `done`, `error`)
- Update the langgraph dashboard page to use the SSE stream, rendering steps progressively

**Non-Goals:**
- Modifying the JSON endpoint at `/api/ai/langgraph`
- Adding streaming to other endpoints (langchain, deepagents)
- Persistent thread/conversation state

## Decisions

### 1. New `/api/ai/langgraph/stream` route (not replacing existing)

The JSON endpoint stays. A separate `/api/ai/langgraph/stream` route handles SSE.
Rationale: backward compatibility with any callers using the JSON API.

### 2. SSE event schema matches `/api/ai/chat`

Events emitted:
- `event: content` — `data: { content: string }` — incremental chunk
- `event: done` — `data: { steps: StepRecord[] }` — final state on completion
- `event: error` — `data: { error: string }` — on failure

Alternatives considered: use a single JSON-Lines (`application/x-ndjson`) format. Rejected because the existing SSE pattern uses named events which frontend `EventSource` listeners consume by name.

### 3. Frontend uses `EventSource` (not `fetch`)

The frontend page uses the browser's native `EventSource` API via `EventSource()`.
Rationale: consistent with the established pattern, simpler than manual `fetch` + `ReadableStream` parsing.

### 4. Frontend progressively renders steps

Each `content` event updates the current step's thought in the timeline.
The `done` event replaces the stream with the final persisted steps array for accuracy.

## Risks / Trade-offs

- [Risk] `runWorkflowStream()` yields step-by-step content — if the graph changes node behavior, SSE content changes. Mitigation: `done` event always sends the authoritative `steps` array.
- [Trade-off] `EventSource` is one-directional (server-to-client only). The page cannot send user abort signals mid-stream. Users can refresh to cancel. Acceptable for this scope.
