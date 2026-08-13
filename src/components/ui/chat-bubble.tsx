import { cn } from '@/lib/utils';
import type { ChatMessageRole } from '@/lib/backend';

type ChatBubbleProps = {
  role: ChatMessageRole;
  children: React.ReactNode;
  time?: string;
  className?: string;
};

export function ChatBubble({ role, children, time, className }: ChatBubbleProps) {
  const isDoctor = role === 'doctor';

  return (
    <div className={cn('flex w-full', isDoctor ? 'justify-end' : 'justify-start', className)}>
      <div
        className={cn(
          'max-w-[min(75%,520px)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-none',
          isDoctor
            ? 'rounded-br-md bg-teal-600 text-white'
            : 'rounded-bl-md bg-neutral-100 text-neutral-900',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{children}</p>
        {time ? (
          <p className={cn('mt-1 text-[10px]', isDoctor ? 'text-white/60' : 'text-neutral-500')}>{time}</p>
        ) : null}
      </div>
    </div>
  );
}
