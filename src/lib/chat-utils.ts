import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export function formatChatListTime(iso: string) {
  const date = dayjs(iso);
  const now = dayjs();

  if (date.isSame(now, 'day')) return date.format('HH:mm');
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Kemarin';
  if (date.isAfter(now.subtract(7, 'day'))) return date.format('ddd');
  return date.format('D MMM');
}

export function formatChatMessageTime(iso: string) {
  return dayjs(iso).format('HH:mm');
}

export function getLastMessage(conversation: { messages: { content: string; createdAt: string }[] }) {
  const last = conversation.messages.at(-1);
  if (!last) return { preview: 'Belum ada pesan', at: new Date().toISOString() };
  return { preview: last.content, at: last.createdAt };
}
