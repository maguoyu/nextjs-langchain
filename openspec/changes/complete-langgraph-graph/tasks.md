## 1. Define typed state channels with Annotation

- [x] 1.1 Import `Annotation`, `StateGraph`, `END`, `MemorySaver` from `@langchain/langgraph`
- [x] 1.2 Define `AgentState` using `Annotation.Root()` with reducers for `messages`, `steps`, `currentStep`

## 2. Implement graph nodes

- [x] 2.1 Implement `reasonNode`: extract `thought` from last message, append step record, increment `currentStep`
- [x] 2.2 Implement `actNode`: call LLM with user input, append final step record with model response

## 3. Wire up graph edges and compile

- [x] 3.1 Define `shouldContinue` routing function: `currentStep >= 2` → `END`, else → `'act'`
- [x] 3.2 Build `StateGraph` with `reason` and `act` nodes, edges: `START → reason`, `reason → [act|END]`, `act → END`
- [x] 3.3 Compile graph with `MemorySaver` checkpointer, export as `graph`

## 4. Add streaming generator

- [x] 4.1 Implement `runWorkflowStream(input, threadId?)` async generator using `graph.stream()`
- [x] 4.2 Yield `{ content: string }` chunks from LLM output, align with SSE event schema

## 5. Maintain backward compatibility

- [x] 5.1 Keep existing `runWorkflow(input)` returning `{ response, steps }` using the graph
- [x] 5.2 Verify `WorkflowResult` interface unchanged

## 6. Verify

- [x] 6.1 Run `next build` — no TypeScript/ESLint errors
- [x] 6.2 Test `/api/ai/langgraph` with a curl or browser request, verify JSON response with `steps` array
