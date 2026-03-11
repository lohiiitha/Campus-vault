'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ChatListPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chat').then(r => r.json()).then(d => {
      setRooms(d.rooms || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Messages</h1>
        <p className="text-vault-muted text-sm mt-1">Your conversations</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-16 rounded-xl animate-pulse" />)}
        </div>
      ) : rooms.length === 0 ? (
        <div className="card p-12 rounded-xl text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-vault-muted">No messages yet. Start chatting with sellers!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room: any) => {
            const lastMsg = room.messages?.[0]
            const hasUnread = room.unreadCount > 0
            return (
              <Link key={room.id} href={`/dashboard/chat/${room.id}`}
                className="card card-hover p-4 rounded-xl flex items-center gap-3"
                style={{ textDecoration: 'none', borderColor: hasUnread ? 'rgba(234,88,12,0.25)' : undefined }}>
                {/* Avatar */}
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: hasUnread ? 'rgba(234,88,12,0.15)' : 'rgba(234,88,12,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#ea580c', flexShrink: 0, position: 'relative' }}>
                  {room.otherUserName?.charAt(0).toUpperCase() || '?'}
                  {/* Unread dot */}
                  {hasUnread && (
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#ea580c', border: '2px solid #fff' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: '0.88rem', fontWeight: hasUnread ? 700 : 500, color: '#1a1a2e' }}>
                    {room.otherUserName}
                  </div>
                  {lastMsg && (
                    <div style={{ fontSize: '0.75rem', color: hasUnread ? '#574f4a' : '#a89d93', fontWeight: hasUnread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {lastMsg.sender?.name}: {lastMsg.content}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: '#a89d93' }}>
                    {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString() : ''}
                  </div>
                  {hasUnread && (
                    <div style={{ background: '#ea580c', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: 99, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                      {room.unreadCount}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
