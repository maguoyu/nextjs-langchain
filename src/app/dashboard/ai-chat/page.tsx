import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChatRoom from './ChatRoom'

export const metadata: Metadata = {
  title: 'AI 对话 - RBAC 系统',
  description: '基于大模型的智能对话助手',
}

export default async function AIChatPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950">
      {/* Header */}
      <div className="shrink-0 h-14 border-b border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center px-6 gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-emerald-500/20">
          AI
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-800 dark:text-white leading-none mb-0.5">
            智能对话
          </h1>
          <p className="text-[11px] text-gray-400 leading-none">
            基于 GLM-4 大模型 · 流式输出
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-gray-400">在线</span>
        </div>
      </div>

      {/* Chat Room */}
      <div className="flex-1 overflow-hidden">
        <ChatRoom />
      </div>
    </div>
  )
}
