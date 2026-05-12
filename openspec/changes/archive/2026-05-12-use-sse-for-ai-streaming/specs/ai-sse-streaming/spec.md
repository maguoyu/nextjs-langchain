## ADDED Requirements

### Requirement: SSE endpoint returns text/event-stream

All AI API routes (`/api/ai/chat`, `/api/ai/langchain`, `/api/ai/deepagents`) that serve LLM responses SHALL return HTTP responses with `Content-Type: text/event-stream` and respond with Server-Sent Events per the SSE spec (W3C).

#### Scenario: Successful stream response
- **WHEN** a client sends a POST request to `/api/ai/chat` with a valid message
- **THEN** the server SHALL return HTTP 200 with `Content-Type: text/event-stream` and push SSE events until the model finishes generating

#### Scenario: Unauthenticated request
- **WHEN** a client sends a request without a valid session token
- **THEN** the server SHALL return HTTP 401 with a JSON error body (not an SSE stream)

#### Scenario: Empty message
- **WHEN** a client sends a request with an empty or whitespace-only message
- **THEN** the server SHALL return HTTP 400 with a JSON error body

### Requirement: Standard SSE event types

All SSE AI endpoints SHALL emit exactly one of the following event types per transmission:

| Event Type | data field | Description |
|---|---|---|
| `content` | `{"content": "text fragment"}` | A partial text fragment from the model. Multiple `content` events MAY be sent in sequence. |
| `thinking` | `{"thinking": "reasoning text"}` | A thinking/reasoning fragment (for models that support it). |
| `done` | `{"content": "full text", "thinking": "full thinking (optional)"}` | Sent exactly once when the model finishes. Contains the complete response. |
| `error` | `{"error": "error message"}` | Sent exactly once if an error occurs. |

#### Scenario: Partial content streamed via content events
- **WHEN** a model generates "Hello world"
- **THEN** the server SHALL emit `data: {"content":"H"}\n`, `data: {"content":"e"}\n`, ... incrementally, followed by `event: done\n data: {"content":"Hello world"}\n`

#### Scenario: Thinking content streamed separately
- **WHEN** a model (e.g. deepagents) generates both thinking and response
- **THEN** the server SHALL emit `event: thinking\n data: {"thinking":"...partial reasoning..."}\n` interleaved with `event: content\n` events, and a final `event: done\n` containing both fields

#### Scenario: Error event on upstream failure
- **WHEN** the upstream AI provider returns an error or the server encounters an exception
- **THEN** the server SHALL emit `event: error\n data: {"error":"<human-readable message>"}\n` and close the stream

### Requirement: Response headers for SSE

SSE responses SHALL include the following headers to ensure reliable delivery:

```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
X-Accel-Buffering: no
Connection: keep-alive
```

#### Scenario: Vercel/serverless compatibility
- **WHEN** the SSE endpoint is deployed on Vercel or behind an nginx proxy
- **THEN** the `X-Accel-Buffering: no` header SHALL prevent buffering that would block SSE delivery

### Requirement: langchain route streams via model.stream()

The `/api/ai/langchain` route SHALL use LangChain's `.stream()` method (not `.invoke()`) to generate token-by-token output and push each token as an SSE `content` event.

#### Scenario: LangChain streaming response
- **WHEN** a user sends a message to the LangChain chat page
- **THEN** the server SHALL stream the response token-by-token via `content` events and send `event: done\n` with the full content when complete

### Requirement: deepagents route forwards SSE from upstream

The `/api/ai/deepagents` route SHALL detect whether the upstream DeepAgents API returns SSE, and if so, decode and forward the upstream events to the client in the standard format.

#### Scenario: DeepAgents SSE forwarded
- **WHEN** the upstream DeepAgents API responds with SSE
- **THEN** the route SHALL decode the upstream SSE, emit `event: content\n` and `event: thinking\n` events per the standard format, and finally `event: done\n`

### Requirement: Optional sync fallback endpoints

The routes MAY provide internal sync endpoints (`/api/ai/langchain/sync`, `/api/ai/deepagents/sync`) that return the complete response as a single JSON object (non-streaming) for debugging and curl testing purposes. These endpoints SHALL NOT be linked or used by any frontend UI component.

#### Scenario: Debug sync endpoint returns complete JSON
- **WHEN** a developer sends a POST request to `/api/ai/langchain/sync`
- **THEN** the server SHALL return `{ "code": 200, "data": { "role": "assistant", "content": "..." } }` without SSE
