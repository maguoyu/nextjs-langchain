## 1. SSE Stream Client Foundation

- [x] 1.1 Create `src/lib/ai/stream-client.ts` with `StreamEvent` type definitions (discriminated union: `content`, `thinking`, `done`, `error`)
- [x] 1.2 Implement `createSSEStream(endpoint, body)` function using `fetch` + `ReadableStream` + SSE parser, returning `{ events: AsyncIterable<StreamEvent>, abort: () => void }`
- [x] 1.3 Add `parseSSELine(line)` and `parseSSEEvent(lines[])` helper functions to decode `event:` and `data:` fields
- [x] 1.4 Handle non-2xx HTTP responses by reading JSON error body and yielding `StreamEvent` of type `error`
- [x] 1.5 Verify `stream-client.ts` compiles without TypeScript errors

## 2. langchain Route SSE Refactor

- [x] 2.1 Refactor `src/app/api/ai/langchain/route.ts` to use `model.stream()` instead of `simpleChat()` / `.invoke()`
- [x] 2.2 Iterate over `ChatGenerationChunk` stream, extract `chunk.content`, push each as `event: content\ndata: {"content":"..."}\n`
- [x] 2.3 Send final `event: done\ndata: {"content":"<full response>"}\n` after stream completes
- [x] 2.4 Send `event: error\ndata: {"error":"..."}\n` on exception and close
- [x] 2.5 Set correct SSE headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no`
- [x] 2.6 Create optional debug endpoint `/api/ai/langchain/sync` that returns full JSON (non-streaming) for curl/dev testing
- [ ] 2.7 Test langchain SSE endpoint with curl: `curl -X POST http://localhost:3000/api/ai/langchain -d '{"messages":[{"role":"user","content":"Hello"}]}'` and verify SSE events are received

## 3. deepagents Route SSE Refactor

- [x] 3.1 Refactor `src/app/api/ai/deepagents/route.ts` to detect SSE support in upstream DeepAgents API
- [x] 3.2 If upstream returns SSE: decode upstream `delta.content` and `delta.thinking` events, forward as standard `event: content\n` and `event: thinking\n`
- [x] 3.3 Send `event: done\ndata: {"content":"...","thinking":"..."}\n` after upstream stream completes
- [x] 3.4 If upstream does not support SSE: fall back to current JSON response and stream tokens server-side using server-sent reconstruction
- [x] 3.5 Set correct SSE headers (same as langchain route)
- [x] 3.6 Create optional debug endpoint `/api/ai/deepagents/sync` for debugging (returns full JSON)
- [ ] 3.7 Test deepagents SSE endpoint manually or via curl

## 4. chat Route Format Normalization

- [x] 4.1 Audit `src/app/api/ai/chat/route.ts` — current SSE output already uses `data: {content}` format; ensure it also emits `event: done\n` with full content
- [x] 4.2 Ensure error handling path emits `event: error\n` instead of plain `controller.error()`

## 5. Frontend SSE Integration — ChatRoom

- [x] 5.1 Refactor `src/app/dashboard/ai-chat/ChatRoom.tsx`: replace inline `fetch + body.getReader()` loop with `createSSEStream('/api/ai/chat', { message, history })`
- [x] 5.2 Update message state as `content` events arrive (append to message content incrementally)
- [x] 5.3 Transition from streaming indicator to complete on `done` event
- [x] 5.4 Show error message from `error` event in message bubble
- [x] 5.5 Verify typing indicator hides and content appears progressively on send

## 6. Frontend SSE Integration — LangChain Page

- [x] 6.1 Refactor `src/app/dashboard/langchain/page.tsx`: replace sync `fetch` + `res.json()` call with `createSSEStream('/api/ai/langchain', { messages })`
- [x] 6.2 Show streaming indicator while `content` events arrive
- [x] 6.3 On `done` event: add assistant message to history, clear loading state
- [x] 6.4 On `error` event: display error message in the card
- [x] 6.5 Verify example prompts work with progressive streaming

## 7. Frontend SSE Integration — DeepAgents Page

- [x] 7.1 Refactor `src/app/dashboard/deepagents/page.tsx`: replace sync `fetch` + `res.json()` with `createSSEStream('/api/ai/deepagents', { messages, thinking })`
- [x] 7.2 Update `thinking` bubble in real-time as `thinking` events arrive
- [x] 7.3 Update `content` bubble in real-time as `content` events arrive
- [x] 7.4 On `done` event: finalize message with full content and thinking
- [x] 7.5 On `error` event: display error message
- [x] 7.6 Verify "Show Thinking" toggle works with real-time thinking streaming

## 8. Verification & Polish

- [x] 8.1 Run `npm run build` to ensure no TypeScript/ESLint errors across all modified files
- [x] 8.2 Test AI-Chat page in browser: verify tokens stream character-by-character, no flash/jump in layout
- [x] 8.3 Test LangChain page in browser: verify streaming behavior, example prompts work
- [x] 8.4 Test DeepAgents page in browser: verify thinking and content stream simultaneously
- [x] 8.5 Test unauthenticated requests: verify 401 JSON error (not SSE)
- [x] 8.6 Test empty message: verify 400 JSON error (not SSE)
- [x] 8.7 (Optional) Test with `curl`: verify `curl -N http://localhost:3000/api/ai/chat` works for SSE consumption
