'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { ChatMessage } from '@/components/ai/ChatMessage'
import { ChatInput } from '@/components/ai/ChatInput'
import { WorkflowTimeline } from '@/components/ai/WorkflowTimeline'

interface WorkflowStep {
  step: number
  thought: string
  action: string
  observation: string
}

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
      <span>AI Demo</span>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      <span className="text-[var(--foreground)] font-medium">LangGraph Workflow</span>
    </div>
  )
}

const exampleTasks = [
  'What is the weather in Tokyo?',
  'Help me plan a weekend trip to Paris',
  'Explain quantum computing in simple terms',
]

export default function LangGraphPage() {
  const [task, setTask] = useState('')
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitTask = useCallback(async (input: string) => {
    setTask(input)
    setLoading(true)
    setError(null)
    setSteps([])
    setResponse(null)

    try {
      const res = await fetch('/api/ai/langgraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: input }),
      })
      const data = await res.json()
      if (data.code === 200) {
        setSteps(data.data.steps || [])
        setResponse(data.data.response || '')
      } else {
        setError(data.message || 'Request failed')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb />
          <h1 className="text-lg font-bold text-[var(--foreground)]">LangGraph Workflow</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Input</CardTitle>
              <CardDescription>Enter a multi-step task to see the ReAct agent workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.length === 0 && !loading && (
                <div className="space-y-2">
                  <div className="text-sm text-[var(--muted-foreground)]">Try these examples:</div>
                  <div className="space-y-1.5">
                    {exampleTasks.map((t) => (
                      <button
                        key={t}
                        onClick={() => submitTask(t)}
                        className="w-full text-left text-xs px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)]/80 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <ChatInput onSend={submitTask} disabled={loading} placeholder="Enter a complex task..." />
            </CardContent>
          </Card>

          {response && (
            <Card>
              <CardHeader>
                <CardTitle>Final Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatMessage role="assistant" content={response} />
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
            <CardDescription>Step-by-step reasoning from the ReAct agent</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowTimeline steps={steps} isLoading={loading} />
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
