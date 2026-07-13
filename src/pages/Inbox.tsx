import { useNavigate } from 'react-router';
import { useChats } from '../hooks';
import { Avatar, Card, Spinner } from '../components/ui';

export default function Inbox() {
  const navigate = useNavigate();
  const { data, isLoading } = useChats();

  if (isLoading) return <Spinner />;

  return (
    <div className="mx-auto max-w-[820px]">
      <h1 className="m-0 text-[28px] leading-[34px] font-bold text-ink-display">inbox</h1>
      <p className="mt-1 mb-5 text-[15px] text-neutral-400">conversations with your renters</p>

      <Card>
        {(data ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/inbox/${c.id}`)}
            className="flex w-full cursor-pointer items-center gap-3.5 border-b border-neutral-200 px-5 py-4 text-left last:border-b-0 hover:bg-brand-100"
          >
            <Avatar name={c.name} src={c.avatar} size={46} />
            <div className="min-w-0 flex-1">
              <div className="truncate">
                <span className="text-[15px] font-bold text-neutral-500">{c.name}</span>
                <span className="text-[13px] text-neutral-300"> · {c.listing}</span>
              </div>
              <div className="truncate text-[14px] text-neutral-400">{c.lastMessage}</div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-[12px] text-neutral-300">{c.time}</span>
              {c.unread > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                  {c.unread}
                </span>
              )}
            </div>
          </button>
        ))}
        {(data ?? []).length === 0 && (
          <p className="py-10 text-center text-[15px] text-neutral-400">no conversations yet</p>
        )}
      </Card>
    </div>
  );
}
