## ADDED Requirements

### Requirement: DeepAgents Reasoning Interface
The system SHALL provide a chat interface optimized for deep reasoning capabilities.

#### Scenario: User submits complex reasoning question
- **WHEN** user enters a complex question requiring step-by-step reasoning
- **THEN** system displays thinking process and final answer

#### Scenario: Thinking process visible
- **WHEN** model generates reasoning
- **THEN** system displays the thinking/reasoning chain before final answer

#### Scenario: Model supports multi-turn conversation
- **WHEN** user continues the conversation
- **THEN** system maintains context across multiple exchanges

---

### Requirement: DeepAgents API Integration
The system SHALL route requests through `/api/ai/deepagents` endpoint.

#### Scenario: API sends request to DeepAgents
- **WHEN** POST request sent to `/api/ai/deepagents` with `{ "messages": [...], "thinking": true }`
- **THEN** API calls DeepAgents with reasoning enabled

#### Scenario: API returns both thinking and response
- **WHEN** DeepAgents returns result
- **THEN** API returns `{ "response": "...", "thinking": "...", "reasoning": "..." }`

#### Scenario: API handles DeepAgents unavailable
- **WHEN** DEEPAGENTS_API_KEY is not configured
- **THEN** API returns 500 error with setup instructions

---

### Requirement: Reasoning Toggle
The system SHALL allow users to toggle reasoning visibility.

#### Scenario: User enables thinking display
- **WHEN** user toggles "Show Thinking" switch ON
- **THEN** system displays the model's reasoning process inline

#### Scenario: User disables thinking display
- **WHEN** user toggles "Show Thinking" switch OFF
- **THEN** system shows only the final response
