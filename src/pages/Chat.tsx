import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, FileText, Play, Send } from 'lucide-react';
import { guestAdminApi } from '../api';
import type { Message, MessageMedia } from '../api/models';
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

  // Keyed on the newest message so loading older history doesn't yank the view down.
  const newestMessageId = messages.items[messages.items.length - 1]?.id;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [newestMessageId]);

  // Loading older history prepends content above the viewport. Anchor the scroll
  // so the message the reader was on stays in place: capture the height on click,
  // then offset scrollTop by the growth once the older page has rendered.
  const heightBeforeOlder = useRef<number | null>(null);
  const oldestMessageId = messages.items[0]?.id;
  function loadOlder() {
    heightBeforeOlder.current = scrollRef.current?.scrollHeight ?? null;
    void messages.fetchMore();
  }
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && heightBeforeOlder.current !== null) {
      el.scrollTop += el.scrollHeight - heightBeforeOlder.current;
      heightBeforeOlder.current = null;
    }
  }, [oldestMessageId]);

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

      {/* Requested banner — only for agreements the server will actually act on
          (raw `requested`); `created` drafts also map to the `requested` pill. */}
      {booking?.canRespond && (
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
        {messages.hasMore && (
          <div className="flex justify-center pb-1">
            <Button
              variant="ghost"
              className="border border-neutral-200 px-4 py-1.5 text-[13px]"
              onClick={loadOlder}
              disabled={messages.isFetchingMore}
            >
              {messages.isFetchingMore ? 'loading…' : 'load older messages'}
            </Button>
          </div>
        )}
        {messages.items.map((m) => (
          <MessageRow key={m.id} m={m} />
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

/** A single message: optional attachments stacked above an optional text bubble. */
function MessageRow({ m }: { m: Message }) {
  const mine = m.from === 'me';
  return (
    <div className={`flex max-w-[78%] flex-col gap-1.5 ${mine ? 'items-end self-end' : 'items-start self-start'}`}>
      {m.media?.map((media) => (
        <Attachment key={media.id} media={media} mine={mine} />
      ))}
      {m.text && (
        <div
          className={
            mine
              ? 'rounded-[16px_16px_4px_16px] bg-brand-600 px-4 py-2.5 text-[15px] leading-6 text-white'
              : 'rounded-[16px_16px_16px_4px] bg-neutral-200 px-4 py-2.5 text-[15px] leading-6 text-neutral-500'
          }
        >
          {m.text}
        </div>
      )}
      <span className="text-[11px] text-neutral-300">
        {m.senderName ? `${m.senderName} · ${m.time}` : m.time}
      </span>
    </div>
  );
}

/** Renders one chat attachment by kind: image thumbnail, video player, or document chip. */
function Attachment({ media, mine }: { media: MessageMedia; mine: boolean }) {
  if (media.kind === 'image') {
    return (
      <a href={media.url} target="_blank" rel="noreferrer" className="block">
        <img
          src={media.previewUrl || media.url}
          alt={media.name ?? 'shared image'}
          className="max-h-64 w-auto max-w-full rounded-[12px] object-cover"
        />
      </a>
    );
  }

  if (media.kind === 'video') {
    return (
      <video
        src={media.url}
        poster={media.previewUrl}
        controls
        preload="metadata"
        className="max-h-64 w-auto max-w-full rounded-[12px] bg-black"
      >
        <a href={media.url} target="_blank" rel="noreferrer">
          <Play size={16} strokeWidth={2} /> play video
        </a>
      </video>
    );
  }

  return (
    <a
      href={media.url}
      target="_blank"
      rel="noreferrer"
      className={`flex max-w-full items-center gap-2.5 rounded-[12px] px-3.5 py-2.5 transition-colors ${
        mine
          ? 'bg-brand-600 text-white hover:bg-brand-700'
          : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
      }`}
    >
      <FileText size={18} strokeWidth={2} className={mine ? 'text-white' : 'text-brand-600'} />
      <span className="truncate text-[14px] font-bold">{media.name ?? 'attachment'}</span>
    </a>
  );
}
