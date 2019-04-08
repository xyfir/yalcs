import { MessageStore } from 'lib/MessageStore';
import { YALCS } from 'types/yalcs';

export async function getMessages({
  thread_ts,
  longpoll
}: {
  thread_ts: string;
  longpoll: boolean;
}): Promise<YALCS.Message[]> {
  // Return messages held in memory
  const messages = MessageStore.read(thread_ts);
  if (messages.length || !longpoll) return messages;

  // Wait for new incoming message
  return await new Promise(r => MessageStore.subscribe(thread_ts, m => r([m])));
}
