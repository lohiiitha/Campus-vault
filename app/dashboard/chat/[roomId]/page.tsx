'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ChatRoomPage() {
  const { roomId } = useParams()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    const res = await fetch(`/api/chat/${roomId}/messages`)
    const data = await res.json()
    setMessages(data.messages || [])
  }

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    await fetch(`/api/chat/${roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input }),
    })
    setInput('')
    setSending(false)
    fetchMessages()
  }

  const myId = (session?.user as any)?.id

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div className="glass border-b border-vault-border p-4 flex items-center gap-3">
        <a href="/dashboard/chat" className="text-vault-muted hover:text-stone-800">←</a>
        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm">💬</div>
        <div>
          <div className="font-semibold text-sm">Chat Room</div>
          <div className="text-xs text-vault-muted">Real-time messaging</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-vault-muted text-sm py-8">
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.senderId === myId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMe && (
                  <span className="text-xs text-vault-muted ml-1">{msg.sender?.name}</span>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-orange-500 text-stone-800 rounded-br-sm'
                    : 'card rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-vault-muted px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {isMe && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="glass border-t border-vault-border p-4 flex gap-3">
        <input
          className="input flex-1"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary px-6 py-2" disabled={sending || !input.trim()}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
