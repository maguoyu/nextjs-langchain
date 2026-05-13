## 1. Create SSE Streaming Endpoint

- [x] 1.1 Create `src/app/api/ai/langgraph/stream/route.ts` — POST handler with SSE `ReadableStream` emitting `content`, `done`, `error` events

## 2. Update LangGraph Dashboard Page

- [x] 2.1 Update `src/app/dashboard/langgraph/page.tsx` — replace JSON fetch with `fetch` + `ReadableStream` SSE client, render steps progressively on `content` events, handle `done` and `error` events

## 3. Verify

- [x] 3.1 Run `next build` — no TypeScript/ESLint errors
- [x] 3.2 Test `/api/ai/langgraph/stream` — endpoint responds correctly: 401 for unauthenticated, SSE stream for authenticated (verified via manual curl test)
