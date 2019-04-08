import * as storage from 'node-persist';
import { Yalcs } from 'types/yalcs';

type ThreadListener = (thread: Yalcs.Thread) => void;

interface ThreadListeners {
  [thread_ts: string]: ThreadListener;
}

storage.init(process.enve.STORAGE);

export class ThreadStore {
  static listeners: ThreadListeners = {};

  static subscribe(thread_ts: string, listener: ThreadListener): void {
    if (!this.listeners[thread_ts]) this.listeners[thread_ts] = listener;
  }

  static async save(thread: Yalcs.Thread): Promise<void> {
    // Send to listener
    if (this.listeners[thread.thread_ts] !== undefined) {
      this.listeners[thread.thread_ts](thread);
      delete this.listeners[thread.thread_ts];
    }

    // Save thread to disk
    await storage.setItem(`thread-${thread.thread_ts}`, thread);
  }

  static async read(thread_ts: string): Promise<Yalcs.Thread> {
    return await storage.getItem(`thread-${thread_ts}`);
  }
}
