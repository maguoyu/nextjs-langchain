## ADDED Requirements

### Requirement: createSSEStream utility function

The system SHALL provide a `createSSEStream(endpoint, body)` utility in `src/lib/ai/stream-client.ts` that encapsulates all SSE consumption logic. The function SHALL accept an endpoint URL string and a request body object, perform a `fetch` POST request, and return an object containing:

- `events`: an `AsyncIterable<StreamEvent>` that yields parsed stream events
- `abort`: a `() => void` function to abort the in-flight request

#### Scenario: Successful stream consumption
- **WHEN** `createSSEStream('/api/ai/chat', { message: 'hello', history: [] })` is called
- **THEN** the function SHALL return an object with an `events` iterable that yields `StreamEvent` objects with `type` and `data` fields

#### Scenario: Request abort
- **WHEN** the caller invokes the `abort()` function while the stream is active
- **THEN** the underlying `AbortController` SHALL cancel the fetch request and the `events` iterable SHALL stop yielding

### Requirement: StreamEvent type definition

The `StreamEvent` type SHALL be defined as a discriminated union:

```typescript
type StreamEvent =
  | { type: 'content'; content: string }
  | { type: 'thinking'; thinking: string }
  | { type: 'done'; content: string; thinking?: string }
  | { type: 'error'; error: string }
```

#### Scenario: Parser emits correct event types
- **WHEN** the SSE reader encounters `event: content\ndata: {"content":"Hi"}\n`
- **THEN** it SHALL yield `{ type: 'content', content: 'Hi' }`
- **WHEN** it encounters `event: done\ndata: {"content":"Done","thinking":"..."}\n`
- **THEN** it SHALL yield `{ type: 'done', content: 'Done', thinking: '...' }`
- **WHEN** it encounters `event: error\ndata: {"error":"Oops"}\n`
- **THEN** it SHALL yield `{ type: 'error', error: 'Oops' }`

### Requirement: Error handling and graceful degradation

`createSSEStream` SHALL catch network errors and emit a final `StreamEvent` of type `error`. It SHALL NOT throw unhandled exceptions to the caller during stream consumption.

#### Scenario: Network error emits error event
- **WHEN** the network connection is lost mid-stream
- **THEN** the `events` iterable SHALL yield `{ type: 'error', error: '<error message>' }` and then complete

#### Scenario: Non-2xx HTTP response
- **WHEN** the server returns a non-2xx HTTP status
- **THEN** `createSSEStream` SHALL read the response body as JSON and yield `{ type: 'error', error: '<server message>' }`

### Requirement: Frontend pages use createSSEStream for all AI interactions

The three AI frontend pages (`ChatRoom.tsx`, `langchain/page.tsx`, `deepagents/page.tsx`) SHALL use `createSSEStream` to consume SSE from their respective endpoints. No page SHALL directly implement `fetch().body.getReader()` logic inline.

#### Scenario: ChatRoom streams AI response incrementally
- **WHEN** a user sends a message in the AI-Chat page
- **THEN** `ChatRoom` SHALL call `createSSEStream('/api/ai/chat', ...)` and update the message content in real-time as `content` events arrive

#### Scenario: DeepAgents page streams thinking and content
- **WHEN** a user sends a message in the DeepAgents page
- **THEN** `deepagents/page.tsx` SHALL stream both `thinking` events (to update the thinking bubble in real-time) and `content` events (to update the response bubble)

#### Scenario: Loading state during streaming
- **WHEN** a stream is in progress
- **THEN** the UI SHALL show a streaming indicator (typing dots or similar)
- **WHEN** a `done` event is received
- **THEN** the UI SHALL transition from streaming to complete state

### Requirement: UI components remain event-agnostic

`ChatMessage` and `ChatInput` components SHALL NOT contain any SSE/fetch logic. They SHALL receive data (content string, thinking string) as props and render accordingly.

#### Scenario: ChatMessage renders content and thinking
- **WHEN** `ChatMessage` receives `{ role: 'assistant', content: 'Hello', thinking: 'I am thinking' }`
- **THEN** it SHALL render both the content bubble and the thinking bubble
