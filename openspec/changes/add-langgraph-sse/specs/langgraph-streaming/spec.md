## ADDED Requirements

### Requirement: SSE endpoint accepts task input

The system SHALL expose a POST endpoint at `/api/ai/langgraph/stream` that accepts a JSON body with a `task` string and optional `threadId` string, and responds with `text/event-stream`.

#### Scenario: Valid request initiates SSE stream
- **WHEN** POST request sent to `/api/ai/langgraph/stream` with `{ "task": "..." }`
- **THEN** server returns `200` with `Content-Type: text/event-stream` and begins emitting events

#### Scenario: Unauthenticated request returns 401
- **WHEN** POST request sent without valid session
- **THEN** server returns `401` with `{ "error": "未授权" }`

#### Scenario: Empty task returns 400
- **WHEN** POST request sent with `{ "task": "" }` or missing `task`
- **THEN** server returns `400` with `{ "error": "task cannot be empty" }`

---

### Requirement: SSE content event streams step output

The system SHALL emit `event: content` SSE events as the LangGraph agent produces step output.

#### Scenario: Content event emitted per step
- **WHEN** agent processes a step
- **THEN** server emits `event: content` with `data: { content: string, step: number }`

#### Scenario: Multiple content events emitted in sequence
- **WHEN** agent processes multiple steps
- **THEN** server emits a `content` event for each step in order

---

### Requirement: SSE done event contains final steps

The system SHALL emit a final `event: done` SSE event with the complete steps array when the workflow completes.

#### Scenario: Done event on successful completion
- **WHEN** agent workflow completes successfully
- **THEN** server emits `event: done` with `data: { steps: StepRecord[] }`

---

### Requirement: SSE error event on failure

The system SHALL emit `event: error` SSE events when the workflow encounters an error.

#### Scenario: Error event when API key missing
- **WHEN** `OPENAI_API_KEY` is not configured
- **THEN** server emits `event: error` with `data: { error: "..." }` and closes the stream

#### Scenario: Error event on upstream failure
- **WHEN** the LLM call fails
- **THEN** server emits `event: error` with error message and closes the stream

---

### Requirement: Dashboard page consumes SSE stream

The `/dashboard/langgraph` page SHALL connect to `/api/ai/langgraph/stream` and progressively render agent steps as they are streamed.

#### Scenario: Page shows loading state while streaming
- **WHEN** user submits a task and SSE connection is open
- **THEN** page displays "AI 思考中..." indicator

#### Scenario: Content events update step display progressively
- **WHEN** `event: content` is received
- **THEN** page appends or updates the corresponding step in the workflow timeline

#### Scenario: Done event shows final steps
- **WHEN** `event: done` is received
- **THEN** page replaces any streaming steps with the authoritative `steps` array from the event

#### Scenario: Error event shows error message
- **WHEN** `event: error` is received
- **THEN** page displays the error message and resets loading state

#### Scenario: New request closes existing SSE connection
- **WHEN** user submits a new task while a stream is active
- **THEN** existing `EventSource` connection is closed before opening a new one
