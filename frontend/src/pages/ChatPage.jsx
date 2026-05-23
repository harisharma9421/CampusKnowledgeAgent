import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { sendChatQuery } from '../services/chatService.js';

const createSessionId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createMessage = ({ role, content, metadata = null }) => ({
  id: createSessionId(),
  role,
  content,
  metadata,
  createdAt: new Date().toISOString(),
});

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const promptLibrary = [
  'What is my timetable today?',
  'Show the latest notices',
  'Which events are upcoming?',
  'Who teaches Data Structures?',
];

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const historyKey = `campus_chat_history_${user?.id || 'member'}`;
  const [storedHistory, setStoredHistory, clearStoredHistory] = useLocalStorage(historyKey, []);
  const [messages, setMessages] = useState(storedHistory);
  const [sessionId] = useState(() => createSessionId());
  const [query, setQuery] = useState(() =>
    typeof location.state?.prompt === 'string' ? location.state.prompt : ''
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const hasMessages = messages.length > 0;
  const canSend = query.trim().length >= 2 && !isSending;

  useEffect(() => {
    setStoredHistory(messages.slice(-40));
  }, [messages, setStoredHistory]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Member';

  const handleSubmit = async (event) => {
    event?.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2 || isSending) {
      return;
    }

    setError(null);
    setQuery('');
    setIsSending(true);

    const userMessage = createMessage({
      role: 'user',
      content: trimmedQuery,
    });
    setMessages((current) => [...current, userMessage]);

    try {
      const payload = await sendChatQuery(trimmedQuery, sessionId);
      const assistantMessage = createMessage({
        role: 'assistant',
        content: payload.response,
        metadata: {
          intent: payload.intent,
          confidence: payload.confidence,
          source: payload.metadata?.source,
          processingTimeMs: payload.metadata?.processing_time_ms,
          retrieval: payload.metadata?.retrieval,
          aiService: payload.metadata?.ai_service,
          gemini: payload.metadata?.gemini,
        },
      });
      setMessages((current) => [...current, assistantMessage]);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the chatbot API.');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const sendPrompt = (prompt) => {
    if (isSending) {
      return;
    }
    setQuery(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const clearHistory = () => {
    setMessages([]);
    clearStoredHistory();
    setError(null);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[620px] flex-col overflow-hidden rounded-lg border border-surface-200 bg-white shadow-card animate-fade-in">
      <header className="flex flex-col gap-4 border-b border-surface-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
            <ChatIcon />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-surface-900 sm:text-xl">
              AI Chatbot
            </h1>
            <p className="mt-0.5 text-sm text-surface-500">
              {roleLabel} assistant connected to the backend AI pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Live
          </span>
          <button
            type="button"
            onClick={clearHistory}
            className="btn-secondary px-3 py-1.5"
            disabled={!hasMessages || isSending}
          >
            <TrashIcon />
            Clear
          </button>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto bg-surface-50 px-4 py-5 lg:px-6">
            {!hasMessages && (
              <div className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-5 py-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
                    Backend-grounded chat
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-surface-900">
                    Ask about campus academics
                  </h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {promptLibrary.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendPrompt(prompt)}
                      className="rounded-lg border border-surface-200 bg-white px-4 py-3 text-left text-sm font-medium text-surface-700 shadow-xs transition hover:border-primary-200 hover:text-primary-700 disabled:opacity-60"
                      disabled={isSending}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasMessages && (
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            )}

            {isSending && (
              <div className="mx-auto mt-4 flex max-w-4xl justify-start">
                <div className="rounded-lg rounded-bl-sm border border-surface-200 bg-white px-4 py-3 shadow-xs">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {error && (
            <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 lg:px-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-surface-200 bg-white p-4 lg:px-6">
            <div className="flex items-end gap-3">
              <label className="sr-only" htmlFor="chat-query">
                Message
              </label>
              <textarea
                id="chat-query"
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                rows={1}
                className="input max-h-32 min-h-11 resize-none py-3"
                placeholder="Ask a campus question"
                disabled={isSending}
              />
              <button type="submit" className="btn-primary h-11 px-4" disabled={!canSend}>
                <SendIcon />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>

        <aside className="hidden border-l border-surface-200 bg-white p-4 lg:block">
          <div className="space-y-4">
            <InfoPanel title="Session">
              <InfoRow label="Role" value={roleLabel} />
              <InfoRow label="Messages" value={String(messages.length)} />
              <InfoRow label="State" value={isSending ? 'Processing' : 'Ready'} />
            </InfoPanel>
            <InfoPanel title="Latest Response">
              <LatestMetadata messages={messages} />
            </InfoPanel>
          </div>
        </aside>
      </section>
    </div>
  );
};

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[84%] rounded-lg px-4 py-3 shadow-xs ${
          isUser
            ? 'rounded-br-sm bg-primary-600 text-white'
            : 'rounded-bl-sm border border-surface-200 bg-white text-surface-800'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        <div
          className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${
            isUser ? 'text-primary-100' : 'text-surface-500'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {!isUser && message.metadata?.intent && <span>{message.metadata.intent}</span>}
          {!isUser && Number.isFinite(message.metadata?.confidence) && (
            <span>{Math.round(message.metadata.confidence * 100)}%</span>
          )}
        </div>
      </div>
    </article>
  );
};

const LatestMetadata = ({ messages }) => {
  const latest = [...messages].reverse().find((message) => message.role === 'assistant');
  if (!latest?.metadata) {
    return <p className="text-sm text-surface-500">No backend response yet.</p>;
  }

  return (
    <div className="space-y-2">
      <InfoRow label="Source" value={latest.metadata.source || 'Backend'} />
      <InfoRow label="Intent" value={latest.metadata.intent || 'n/a'} />
      <InfoRow
        label="Timing"
        value={
          latest.metadata.processingTimeMs
            ? `${latest.metadata.processingTimeMs} ms`
            : 'n/a'
        }
      />
      <InfoRow
        label="Retrieval"
        value={
          latest.metadata.retrieval
            ? `${latest.metadata.retrieval.ranked_count || 0}/${latest.metadata.retrieval.candidate_count || 0}`
            : 'n/a'
        }
      />
    </div>
  );
};

const InfoPanel = ({ title, children }) => (
  <section>
    <h2 className="mb-3 text-sm font-semibold text-surface-900">{title}</h2>
    <div className="space-y-2 rounded-lg border border-surface-200 bg-surface-50 p-3">
      {children}
    </div>
  </section>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-surface-500">{label}</span>
    <span className="truncate font-medium text-surface-800">{value}</span>
  </div>
);

const TypingDots = () => (
  <div className="flex items-center gap-1.5" aria-label="Loading response">
    {[0, 1, 2].map((index) => (
      <span
        key={index}
        className="h-2 w-2 animate-bounce-dot rounded-full bg-primary-500"
        style={{ animationDelay: `${index * 0.15}s` }}
      />
    ))}
  </div>
);

const ChatIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5m8-2a9 9 0 11-4.25-7.64L21 4l-.86 4.25A8.96 8.96 0 0121 12z" />
  </svg>
);

const SendIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-5-5m5 5l-5 5" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12m-9 0V5h6v2m-8 3v8m4-8v8m4-8v8M8 7l1 13h6l1-13" />
  </svg>
);

import PropTypes from 'prop-types';

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['user', 'assistant']).isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    metadata: PropTypes.object,
  }).isRequired,
};

LatestMetadata.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

InfoPanel.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default ChatPage;
