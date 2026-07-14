import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Send } from 'lucide-react';
import { guestAdminApi } from '../api';
import {
  keys,
  useBooking,
  useBookingDecision,
  useBookings,
  useChats,
  useMessages,
  useSendMessage,
} from '../hooks';
import { Avatar, Button, Spinner } from '../components/ui';
import { useQueryClient } from '@tanstack/react-query';

export default function Chat() {
  const { chatId = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const chats = useChats();
  const bookings = useBookings();
  const messages = useMessages(chatId);
  const chat = chats.items.find((c) => c.id === chatId);
  // Replies are always sent as the room's company-side participant (chat.hostId),
  // which may be a different admin than the one currently logged in.
  const send = useSendMessage(chatId, chat?.hostId);
  const { accept, decline } = useBookingDecision();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  // Prefer the booking from the loaded pages; fall back to fetching it directly when
  // this chat's agreement sits beyond the pages the inbox/agreements lists have loaded.
  const listBooking = bookings.items.find((b) => b.id === chat?.agId || b.chatId === chatId);
  const fetchedBooking = useBooking(chat?.agId ?? '', { enabled: !listBooking && !!chat?.agId });
  const booking = listBooking ?? fetchedBooking.data;

  // Opening a chat zeroes its unread count
  useEffect(() => {
    if (chat && chat.unread > 0) {
      void guestAdminApi.markChatRead(chatId).then(() => {
        void qc.invalidateQueries({ queryKey: keys.chats });
      });
    }
  }, [chatId, chat, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.data?.length]);

  if (chats.isLoading || messages.isLoading) return <Spinner />;
  if (!chat)
    return (
      <p className="py-10 text-center text-neutral-400">
        conversation not found · <Link to="/inbox" className="font-bold text-brand-600">back to inbox</Link>
      </p>
    );

  function submit() {
    const text = draft.trim();
    if (!text) return;
    send.mutate(text);
    setDraft('');
  }

  const busy = accept.isPending || decline.isPending;

  return (
    <div className="mx-auto flex h-full max-w-[760px] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <button
          onClick={() => navigate('/inbox')}
          aria-label="back to inbox"
          className="cursor-pointer rounded-[10px] p-2 text-neutral-400 hover:bg-neutral-200"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <Avatar name={chat.name} src={chat.avatar} size={42} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-neutral-500">{chat.name}</div>
          <div className="truncate text-[13px] text-neutral-400">{chat.listing}</div>
        </div>
        {booking && (
          <Button variant="ghost" className="border border-neutral-200" onClick={() => navigate(`/agreements/${booking.id}`)}>
            view booking
          </Button>
        )}
      </div>

      {/* Requested banner */}
      {booking?.status === 'requested' && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl bg-warn-200 px-4 py-3">
          <span className="flex-1 text-[14px] font-bold text-brand-800">
            {chat.firstName} sent a booking request
          </span>
          <div className="flex gap-2">
            <Button variant="declineOutline" className="px-3 py-1.5 text-[13px]" disabled={busy} onClick={() => decline.mutate(booking.id)}>
              decline
            </Button>
            <Button variant="accept" className="px-3 py-1.5 text-[13px]" disabled={busy} onClick={() => accept.mutate(booking.id)}>
              accept
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto py-2">
        {(messages.data ?? []).map((m) => (
          <div key={m.id} className={`flex max-w-[75%] flex-col ${m.from === 'me' ? 'items-end self-end' : 'items-start self-start'}`}>
            <div
              className={
                m.from === 'me'
                  ? 'rounded-[16px_16px_4px_16px] bg-brand-600 px-4 py-2.5 text-[15px] leading-6 text-white'
                  : 'rounded-[16px_16px_16px_4px] bg-neutral-200 px-4 py-2.5 text-[15px] leading-6 text-neutral-500'
              }
            >
              {m.text}
            </div>
            <span className="mt-1 text-[11px] text-neutral-300">
              {m.senderName ? `${m.senderName} · ${m.time}` : m.time}
            </span>
          </div>
        ))}
      </div>

      {/* Composer */}
      {chat.hostName && (
        <div className="pt-2 text-right text-[11px] text-neutral-300">
          replying as {chat.hostName}
        </div>
      )}
      <div className="flex items-center gap-2.5 pt-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={`message ${chat.firstName}…`}
          className="flex-1 rounded-[10px] border-0 bg-neutral-200 px-4 py-3 text-[15px] text-neutral-500 outline-none placeholder:text-neutral-300"
        />
        <button
          onClick={submit}
          disabled={send.isPending}
          aria-label="send message"
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-brand-600 text-white transition-colors hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50"
        >
          <Send size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
