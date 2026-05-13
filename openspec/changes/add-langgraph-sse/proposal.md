## Why

The `/api/ai/langgraph` endpoint currently returns a synchronous JSON response. The LangGraph agent already has streaming support via `graph.stream()`, and the existing SSE streaming pattern is well-established in `/api/ai/chat`. Adding SSE streaming to the langgraph endpoint enables real-time step-by-step visualization on the frontend, improving UX significantly.

## What Changes

- Add a new `/api/ai/langgraph/stream` endpoint using SSE (`text/event-stream`) that streams agent step results in real-time
- The existing JSON endpoint `/api/ai/langgraph` remains unchanged for backward compatibility
- The frontend `/dashboard/langgraph` page already exists; update it to use SSE streaming instead of waiting for the full response

## Capabilities

### New Capabilities

- `langgraph-streaming`: SSE streaming for LangGraph workflow — streams step-by-step agent reasoning and final response in real-time

### Modified Capabilities

- (none)

## Impact

- **New**: `src/app/api/ai/langgraph/stream/route.ts` — SSE streaming endpoint
- **Modified**: `src/app/dashboard/langgraph/page.tsx` — consume SSE stream, render steps progressively
- **Unchanged**: `src/lib/ai/langgraph.ts` — `runWorkflowStream()` already exists and is exported

## Non-Goals

- Modifying the JSON endpoint API contract
- Adding streaming to other endpoints (langchain, deepagents)
- Persistent thread/conversation state in the stream endpoint
