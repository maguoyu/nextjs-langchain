# langgraph-workflow

## ADDED Requirements

### Requirement: LangGraph StateGraph definition

The system SHALL define a LangGraph `StateGraph` using the `@langchain/langgraph` v1 `Annotation` API with typed state channels: `messages`, `input`, `steps`, and `currentStep`.

### Requirement: reason node

The graph SHALL have a `reason` node that appends a step record to `state.steps` with `thought` extracted from the last message, empty `observation`, and increments `state.currentStep`.

### Requirement: act node

The graph SHALL have an `act` node that calls the LLM with the user's input and appends a final step record with the model's reasoning content and `observation: 'Response ready'`.

### Requirement: Conditional routing

The graph SHALL route from `reason` → `act` → `END` for steps < 2, and `reason` → `END` when `currentStep >= 2`.

### Requirement: MemorySaver checkpointer

The graph SHALL be compiled with a `MemorySaver` checkpointer for in-memory conversation persistence across requests within the same thread.

### Requirement: Backward-compatible runWorkflow

The `runWorkflow(input)` function SHALL return `{ response: string, steps: StepRecord[] }` matching the existing interface, so callers require no changes.

### Requirement: Streaming generator

The system SHALL provide a `runWorkflowStream(input, threadId?)` async generator that yields `{ content: string }` chunks for SSE consumption.

### Requirement: Graph export

The graph instance SHALL be exported from `langgraph.ts` as `graph` so the route or other consumers can call `graph.invoke()` or `graph.stream()` directly.
