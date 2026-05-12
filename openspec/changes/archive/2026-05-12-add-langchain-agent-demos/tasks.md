## 1. Setup Dependencies

- [x] 1.1 Install langgraph package: `npm install @langchain/langgraph`
- [x] 1.2 Install openai package: `npm install @langchain/openai`
- [x] 1.3 Create environment variable template `.env.example` with OPENAI_API_KEY and DEEPAGENTS_API_KEY

## 2. Create AI Utilities Library

- [x] 2.1 Create `src/lib/ai/models.ts` for LLM initialization
- [x] 2.2 Create `src/lib/ai/langchain.ts` for LangChain utilities
- [x] 2.3 Create `src/lib/ai/langgraph.ts` for LangGraph agent setup
- [x] 2.4 Create `src/lib/ai/deepagents.ts` for DeepAgents client
- [x] 2.5 Test OpenAI-compatible API endpoint (taotoken.net with deepseek-v4-pro model)

## 3. Create API Routes

- [x] 3.1 Create `src/app/api/ai/langchain/route.ts` - LangChain chat endpoint
- [x] 3.2 Create `src/app/api/ai/langgraph/route.ts` - LangGraph workflow endpoint
- [x] 3.3 Create `src/app/api/ai/deepagents/route.ts` - DeepAgents reasoning endpoint

## 4. Create Chat UI Components

- [x] 4.1 Create `src/components/ai/ChatMessage.tsx` - Message bubble component
- [x] 4.2 Create `src/components/ai/ChatInput.tsx` - Input with send button
- [x] 4.3 Create `src/components/ai/WorkflowTimeline.tsx` - LangGraph step visualization

## 5. Create Demo Pages

- [x] 5.1 Create `src/app/dashboard/langchain/page.tsx` - LangChain conversation demo
- [x] 5.2 Create `src/app/dashboard/langgraph/page.tsx` - LangGraph workflow demo
- [x] 5.3 Create `src/app/dashboard/deepagents/page.tsx` - DeepAgents reasoning demo

## 6. Add Menu Items

- [x] 6.1 Add AI Demo menu items to database via SQL or API
- [x] 6.2 Update sidebar menu configuration
