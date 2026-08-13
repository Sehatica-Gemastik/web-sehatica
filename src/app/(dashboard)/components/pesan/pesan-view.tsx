'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ChatBubble } from '@/components/ui/chat-bubble';
import { cn } from '@/lib/utils';
import {
  formatChatListTime,
  formatChatMessageTime,
  getLastMessage,
} from '@/lib/chat-utils';
import type { ChatConversation, ChatMessage, MonitorPatientSummary } from '@/lib/backend';
import { Badge } from '@/components/ui/badge';

type PesanViewProps = {
  patients: MonitorPatientSummary[];
  conversations: ChatConversation[];
  activeId: number;
};

export function PesanView({ patients, conversations, activeId }: PesanViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [threads, setThreads] = useState(conversations);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const activePatient = patients.find((patient) => patient.id === activeId) ?? patients[0] ?? null;
  const activeThread = threads.find((thread) => thread.patientId === activeId) ?? null;

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((patient) => patient.name.toLowerCase().includes(q));
  }, [patients, query]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [activeId, activeThread?.messages.length, mobileShowThread]);

  useEffect(() => {
    setThreads((current) =>
      current.map((thread) =>
        thread.patientId === activeId ? { ...thread, unreadCount: 0 } : thread,
      ),
    );
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setMobileShowThread(true);
    }
  }, [activeId]);

  const selectPatient = (patientId: number) => {
    setMobileShowThread(true);
    router.push(`/pesan?patient=${patientId}`);
  };

  const handleSend = () => {
    const content = draft.trim();
    if (!content || !activePatient) return;

    const message: ChatMessage = {
      id: Date.now(),
      role: 'doctor',
      content,
      createdAt: new Date().toISOString(),
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.patientId === activePatient.id
          ? { ...thread, messages: [...thread.messages, message], unreadCount: 0 }
          : thread,
      ),
    );
    setDraft('');
  };

  if (!activePatient) {
    return (
      <div className="grid h-full place-items-center text-sm text-neutral-500">
        Belum ada pasien partner untuk diajak chat.
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col border-r border-neutral-100 bg-white md:w-[320px]',
          mobileShowThread ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="px-5 py-4">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Pesan</h1>
          <p className="mt-0.5 text-xs text-neutral-500">Chat dengan pasien partner</p>
        </div>

        <div className="px-4 py-3">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari pasien..."
              className="h-10 w-full rounded-full border-0 bg-neutral-100 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {filteredPatients.map((patient) => {
            const thread = threads.find((item) => item.patientId === patient.id);
            const last = thread ? getLastMessage(thread) : { preview: 'Belum ada pesan', at: new Date().toISOString() };
            const isActive = patient.id === activeId;
            const unread = thread?.unreadCount ?? 0;

            return (
              <button
                key={patient.id}
                type="button"
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-3 py-2.5 text-left transition-colors',
                  isActive ? 'bg-neutral-100' : 'bg-transparent hover:bg-neutral-50',
                )}
                onClick={() => selectPatient(patient.id)}
              >
                <Avatar initials={patient.avatarInitials} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-neutral-900">{patient.name}</span>
                    <span className="shrink-0 text-[11px] text-neutral-400">{formatChatListTime(last.at)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-neutral-500">{last.preview}</span>
                    {unread > 0 ? (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-teal-800 px-1 text-[10px] font-semibold text-white">
                        {unread}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section
        className={cn(
          'flex min-w-0 flex-1 flex-col bg-white',
          mobileShowThread ? 'flex' : 'hidden md:flex',
        )}
      >
        <header className="flex items-center gap-3 px-5 py-3.5">
          <button
            type="button"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-neutral-600 hover:bg-neutral-100 md:hidden"
            aria-label="Kembali ke daftar"
            onClick={() => setMobileShowThread(false)}
          >
            <ArrowLeft size={18} />
          </button>
          <Avatar initials={activePatient.avatarInitials} size="md" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-neutral-900">{activePatient.name}</h2>
            {/* <p className="text-xs text-neutral-500">
              {activePatient.age ? `${activePatient.age} tahun` : 'NaN'}
            </p> */}
            <Badge>
              {activePatient.age ? `${activePatient.age} tahun` : 'NaN'}
            </Badge>
          </div>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {activeThread?.messages.length ? (
            <div className="grid gap-4">
              {(activeThread.unreadCount ?? 0) > 0 ? (
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-[11px] font-medium text-neutral-400">Pesan baru</span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
              ) : null}

              {activeThread.messages.map((message) => {
                const isPatient = message.role === 'user';
                return (
                  <div key={message.id} className={cn('flex gap-2.5', isPatient ? 'items-end' : 'flex-row-reverse items-end')}>
                    {isPatient ? <Avatar initials={activePatient.avatarInitials} size="sm" /> : null}
                    <div className={cn('min-w-0 max-w-full', isPatient ? '' : 'flex flex-col items-end')}>
                      {isPatient ? (
                        <p className="mb-1 ml-1 text-[11px] font-semibold text-neutral-700">{activePatient.name}</p>
                      ) : null}
                      <ChatBubble role={message.role} time={formatChatMessageTime(message.createdAt)}>
                        {message.content}
                      </ChatBubble>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-sm text-neutral-500">
              Belum ada pesan. Mulai percakapan dengan pasien ini.
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 px-5 py-3">
          <form
            className="flex items-end gap-2 bg-neutral-100 px-3 py-2"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Pesan ${activePatient.name.split(' ')[0]}...`}
              rows={1}
              className="max-h-28 min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm leading-5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-teal-500 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Kirim pesan"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
