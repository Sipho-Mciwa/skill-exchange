import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { subscribeToMessages, sendMessage } from '../services/conversations';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types';

export function ConversationPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId, setMessages);
    return unsubscribe; // cleanup unsubscribes the onSnapshot listener
  }, [conversationId]);

  // Fetch conversation once to determine the other participant
  useEffect(() => {
    if (!conversationId || !user) return;
    getDoc(doc(db, 'conversations', conversationId))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as { participantIds: string[] };
          const other = data.participantIds.find((id) => id !== user.id) ?? null;
          setRecipientId(other);
        }
      })
      .catch(() => {
        // non-critical — badge won't increment but messages still send
      });
  }, [conversationId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !conversationId || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendMessage(conversationId, user.id, recipientId ?? '', body.trim());
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-4 py-8" style={{ height: 'calc(100vh - 64px)' }}>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Conversation</h1>

      {error && (
        <p className="mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? 'rounded-br-sm bg-indigo-600 text-white'
                    : 'rounded-bl-sm bg-gray-100 text-gray-800'
                }`}
              >
                {msg.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Send form */}
      <div className="mt-3 flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Type a message… (Enter to send)"
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => void handleSend()}
          disabled={sending || !body.trim()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <Send size={16} />
        </button>
      </div>
    </main>
  );
}
