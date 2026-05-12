'use client'

interface WorkflowStep {
  step: number
  thought: string
  action: string
  observation: string
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
  isLoading?: boolean
}

export function WorkflowTimeline({ steps, isLoading }: WorkflowTimelineProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Workflow Steps</h3>
      {isLoading && steps.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          AI 思考中...
        </div>
      )}
      {steps.length === 0 && !isLoading && (
        <div className="text-sm text-[var(--muted-foreground)]">Submit a task to see the workflow steps.</div>
      )}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.step} className="relative flex gap-3 pl-9">
              <div className="absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-[var(--background)]" />
              <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium text-[var(--primary)]">Step {step.step}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                    {step.action}
                  </span>
                </div>
                <div className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{step.thought}</div>
                {step.observation && (
                  <div className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                    → {step.observation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
