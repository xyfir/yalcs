import { ThreadStore } from 'lib/ThreadStore';
import { Yalcs } from 'types/yalcs';

export async function getThread({
  thread_ts,
  longpoll
}: Yalcs.GetThreadOptions): Promise<Yalcs.Thread> {
  // Wait for new incoming message
  if (longpoll)
    return await new Promise(r => ThreadStore.subscribe(thread_ts, t => r(t)));
  else return await ThreadStore.read(thread_ts);
}
