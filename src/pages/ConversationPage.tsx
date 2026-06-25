import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { subscribeToMessages, sendMessage, markConversationRead } from '../services/conversations';
import { getListing } from '../services/listings';
import { initiateSession, confirmSession, disputeSession, subscribeToSession } from '../services/sessions';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types';
import type { Session } from '../types';

interface ConversationMeta {
  listingTitle: string;
  listingId: string;
  participantIds: string[];
}

interface PendingMessage {
  tempId: string;
  body: string;
  status: 'pending' | 'error';
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}

function formatDaySeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'long' });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db2 = new Date(b);
  return da.getFullYear() === db2.getFullYear() &&
    da.getMonth() === db2.getMonth() &&
    da.getDate() === db2.getDate();
}

function minutesDiff(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

export function ConversationPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [meta, setMeta] = useState<ConversationMeta | null>(null);
  const [listingOwnerId, setListingOwnerId] = useState<string | null>(null);
  const [creditsPerHour, setCreditsPerHour] = useState<number>(1);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [hours, setHours] = useState(1);
  const [initiating, setInitiating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId, setMessages);
    return unsubscribe;
  }, [conversationId]);

  // Fetch conversation once to determine the other participant and meta, then mark as read
  useEffect(() => {
    if (!conversationId || !user) return;
    getDoc(doc(db, 'conversations', conversationId))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as { participantIds: string[]; listingTitle: string; listingId: string };
          const other = data.participantIds.find((id) => id !== user.id) ?? null;
          setRecipientId(other);
          setMeta({ listingTitle: data.listingTitle, listingId: data.listingId, participantIds: data.participantIds });

          // Fetch listing to get teacher and creditsPerHour
          return getListing(data.listingId);
        }
        return null;
      })
      .then((listing) => {
        if (listing) {
          setListingOwnerId(listing.userId);
          setCreditsPerHour(listing.creditsPerHour);
        }
      })
      .then(() => markConversationRead(conversationId, user.id))
      .catch(() => {
        // non-critical
      });
  }, [conversationId, user]);

  // Subscribe to active session for this conversation
  useEffect(() => {
    if (!conversationId) return;
    return subscribeToSession(conversationId, setActiveSession);
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  // Remove pending messages that have been confirmed by the subscription
  useEffect(() => {
    if (pending.length === 0) return;
    setPending((prev) =>
      prev.filter((p) => !messages.some((m) => m.body === p.body && m.senderId === user?.id))
    );
  }, [messages, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!user || !conversationId || !body.trim()) return;
    const trimmed = body.trim();
    const tempId = `pending-${Date.now()}`;

    // Optimistic: show message immediately
    setPending((prev) => [...prev, { tempId, body: trimmed, status: 'pending' }]);
    setBody('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setSending(true);
    setError(null);
    try {
      await sendMessage(conversationId, user.id, recipientId ?? '', trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Mark the optimistic message as errored
      setPending((prev) =>
        prev.map((p) => (p.tempId === tempId ? { ...p, status: 'error' as const } : p))
      );
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

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`; // max ~4 rows
  };

  const retryPending = (p: PendingMessage) => {
    setPending((prev) => prev.filter((x) => x.tempId !== p.tempId));
    setBody(p.body);
    textareaRef.current?.focus();
  };

  const handleInitiateSession = async () => {
    if (!user || !meta || !recipientId || !listingOwnerId) return;
    setInitiating(true);
    try {
      await initiateSession(conversationId!, meta.listingId, listingOwnerId, recipientId, creditsPerHour, hours);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate session');
    } finally {
      setInitiating(false);
    }
  };

  const handleConfirmSession = async () => {
    if (!activeSession) return;
    setConfirming(true);
    try {
      await confirmSession(activeSession.id, user!.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm session');
      setConfirming(false);
    }
  };

  const handleDisputeSession = async () => {
    if (!activeSession) return;
    try {
      await disputeSession(activeSession.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispute session');
    }
  };

  const isTeacher = !!listingOwnerId && user?.id === listingOwnerId;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border)] px-4 sm:px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <Link
          to="/inbox"
          className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors mr-1 text-lg leading-none"
          aria-label="Back to inbox"
        >
          ←
        </Link>
        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
          💬
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">
            {meta?.listingTitle ?? 'Conversation'}
          </p>
          {meta?.listingTitle && (
            <p className="text-xs text-[var(--color-muted)] truncate">Re: {meta.listingTitle}</p>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-[var(--color-bg)]">
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {messages.length === 0 && pending.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <span className="text-4xl">🌱</span>
            <p className="mt-3 text-sm text-[var(--color-muted)]">No messages yet — say hello!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.id;
              const prev = messages[idx - 1];
              const next = messages[idx + 1];

              // Day separator
              const showDaySep = !prev || !isSameDay(prev.createdAt, msg.createdAt);

              // Grouping: same sender + within 2 min of next message
              const isLastInGroup =
                !next ||
                next.senderId !== msg.senderId ||
                minutesDiff(msg.createdAt, next.createdAt) > 2;

              const isFirstInGroup =
                !prev ||
                prev.senderId !== msg.senderId ||
                minutesDiff(prev.createdAt, msg.createdAt) > 2;

              const gapClass = isFirstInGroup ? 'mt-3' : 'mt-1';

              return (
                <div key={msg.id}>
                  {showDaySep && (
                    <div className="text-xs text-[var(--color-muted)] text-center py-3">
                      {formatDaySeparator(msg.createdAt)}
                    </div>
                  )}
                  <div className={`flex ${isMe ? 'justify-end' : 'items-end gap-2'} ${gapClass}`}>
                    {/* Received: small avatar on last in group */}
                    {!isMe && (
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${isLastInGroup ? 'bg-[var(--color-primary)]' : 'opacity-0'}`}>
                        💬
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`text-sm px-4 py-2.5 shadow-sm max-w-xs sm:max-w-sm ${
                          isMe
                            ? 'bg-[var(--color-primary)] text-white rounded-2xl rounded-br-md'
                            : 'bg-white text-[var(--color-text)] border border-[var(--color-border)] rounded-2xl rounded-bl-md'
                        }`}
                      >
                        {msg.body}
                      </div>
                      {isLastInGroup && (
                        <span className={`text-xs text-[var(--color-muted)] mt-1 ${isMe ? 'text-right' : ''}`}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Optimistic / pending messages */}
            {pending.map((p) => (
              <div key={p.tempId} className="flex justify-end mt-1">
                <div className="flex flex-col items-end">
                  <div
                    className={`text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-xs sm:max-w-sm shadow-sm ${
                      p.status === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-[var(--color-primary)] text-white opacity-60'
                    }`}
                  >
                    {p.body}
                  </div>
                  <span className="text-xs text-[var(--color-muted)] mt-1 text-right">
                    {p.status === 'pending' ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </span>
                    ) : (
                      <button
                        onClick={() => retryPending(p)}
                        className="text-red-500 hover:underline"
                      >
                        ⚠ Failed — Retry?
                      </button>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Session banner */}
      {activeSession?.status === 'confirmed' ? (
        <div className="flex-shrink-0 mx-4 sm:mx-6 mb-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-green-600 text-lg">✓</span>
          <p className="text-sm text-green-800 font-medium">
            Session complete! {activeSession.totalCredits} credit{activeSession.totalCredits !== 1 ? 's' : ''} transferred. Check your wallet.
          </p>
        </div>
      ) : isTeacher && activeSession?.status === 'pending_learner' ? (
        <div className="flex-shrink-0 mx-4 sm:mx-6 mb-3 bg-[var(--color-accent-light,#f0f4ff)] border border-[var(--color-border)] rounded-2xl px-4 py-3 flex items-center gap-3">
          <svg className="animate-spin h-4 w-4 text-[var(--color-primary)] flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-[var(--color-text-sub,var(--color-muted))]">
            Waiting for learner to confirm {activeSession.totalCredits} credit{activeSession.totalCredits !== 1 ? 's' : ''}…
          </p>
        </div>
      ) : !isTeacher && activeSession?.status === 'pending_learner' ? (
        <div className="flex-shrink-0 mx-4 sm:mx-6 mb-3 bg-[var(--color-accent-light,#f0f4ff)] border border-[var(--color-border)] rounded-2xl px-4 py-3">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
            Confirm session — {activeSession.totalCredits} credit{activeSession.totalCredits !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-[var(--color-muted)] mb-3">
            {activeSession.hoursCompleted} hour{activeSession.hoursCompleted !== 1 ? 's' : ''} × {activeSession.creditsPerHour} credits/hr. Confirming will transfer credits to your teacher.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => void handleConfirmSession()}
              disabled={confirming}
              className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,var(--color-primary))] text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {confirming ? 'Confirming…' : 'Confirm'}
            </button>
            <button
              onClick={() => void handleDisputeSession()}
              disabled={confirming}
              className="flex-1 bg-white border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium py-2 px-4 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Dispute
            </button>
          </div>
        </div>
      ) : isTeacher && !activeSession && listingOwnerId ? (
        <div className="flex-shrink-0 mx-4 sm:mx-6 mb-3 bg-[var(--color-accent-light,#f0f4ff)] border border-[var(--color-border)] rounded-2xl px-4 py-3">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">Mark session complete</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-[var(--color-muted)]">Hours completed</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setHours((h) => Math.max(1, h - 1))}
                disabled={hours <= 1}
                aria-label="Decrease hours"
                className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm font-bold flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-[var(--color-text)]">{hours}</span>
              <button
                onClick={() => setHours((h) => Math.min(8, h + 1))}
                disabled={hours >= 8}
                aria-label="Increase hours"
                className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)] text-sm font-bold flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--color-muted)] mb-3">
            {hours} hr{hours !== 1 ? 's' : ''} × {creditsPerHour} credits/hr = <span className="font-semibold text-[var(--color-text)]">{hours * creditsPerHour} credits</span>
          </p>
          <button
            onClick={() => void handleInitiateSession()}
            disabled={initiating}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark,var(--color-primary))] text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {initiating ? 'Sending request…' : 'Mark complete'}
          </button>
        </div>
      ) : null}

      {/* Input bar */}
      <div className="bg-white border-t border-[var(--color-border)] px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
            placeholder="Type a message…"
            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors"
          />
          <button
            onClick={() => void handleSend()}
            disabled={sending || !body.trim()}
            aria-label="Send message"
            className="w-11 h-11 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
