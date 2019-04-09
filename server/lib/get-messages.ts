import { ThreadStore } from 'lib/ThreadStore';
import { Yalcs } from 'types/yalcs';

export async function getMessages({
  message_ts,
  thread_ts,
  key
}: Yalcs.GetMessageOptions): Promise<Yalcs.Message[]> {
  // Check if there are any messages already saved for us to return
  // This also serves to validate thread/key before subscribing to it
  const thread = await ThreadStore.read(thread_ts, key);
  const messages = thread.messages.filter(message => +message.ts > +message_ts);
  if (messages.length) return messages;

  // Wait for new incoming message
  return await new Promise(resolve =>
    ThreadStore.subscribe(thread_ts, thread =>
      resolve(thread.messages.filter(message => +message.ts > +message_ts))
    )
  );
}
