import storage from 'node-persist';
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

  static async save(
    thread: Yalcs.Thread,
    notify: boolean = false
  ): Promise<void> {
    // Validate thread and key
    try {
      await ThreadStore.read(thread.thread_ts, thread.key);
    } catch (err) {
      // If thread doesn't exist, that's okay; anything else, throw error
      if (!/Thread does not exist/.test(err)) throw err;
    }

    // Send to listener
    if (notify && this.listeners[thread.thread_ts] !== undefined) {
      this.listeners[thread.thread_ts](thread);
      delete this.listeners[thread.thread_ts];
    }

    // Save thread to disk
    await storage.setItem(`thread-${thread.thread_ts}`, thread);
  }

  static async read(
    thread_ts: Yalcs.Thread['thread_ts'],
    key: Yalcs.Thread['key']
  ): Promise<Yalcs.Thread> {
    const thread: Yalcs.Thread = await storage.getItem(`thread-${thread_ts}`);
    if (!thread) throw 'Thread does not exist';

    // Allow using Slack secret for Slack events where we don't have the key
    if (key != thread.key && key != process.enve.SLACK_SIGNING_SECRET)
      throw 'Cannot access thread';

    return thread;
  }
}
