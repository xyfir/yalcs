import { MessageStore } from 'lib/MessageStore';
import { Yalcs } from 'types/yalcs';

export async function getMessages({
  thread_ts,
  longpoll
}: Yalcs.GetMessageOptions): Promise<Yalcs.Message[]> {
  // Return messages held in memory
  const messages = MessageStore.read(thread_ts);
  if (messages.length || !longpoll) return messages;

  // Wait for new incoming message
  return await new Promise(r => MessageStore.subscribe(thread_ts, m => r([m])));
}
