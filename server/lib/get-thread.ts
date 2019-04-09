import { ThreadStore } from 'lib/ThreadStore';
import { Yalcs } from 'types/yalcs';

export function getThread(thread_ts: string): Promise<Yalcs.Thread> {
  return ThreadStore.read(thread_ts);
}
