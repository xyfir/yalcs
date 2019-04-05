import { YALCS } from 'types/yalcs';

type ThreadListener = (message: YALCS.Message) => void;

interface Threads {
  [thread_ts: string]: {
    listener?: ThreadListener;
    messages: YALCS.Message[];
  };
}

export class MessageStore {
  static threads: Threads = {};

  static subscribe(thread_ts: string, listener: ThreadListener): void {
    // Initialize thread
    if (!this.threads[thread_ts])
      this.threads[thread_ts] = { messages: [], listener };
    // Add listener
    else this.threads[thread_ts].listener = listener;
  }

  static save(thread_ts: string, message: YALCS.Message): void {
    // Initialize thread
    if (!this.threads[thread_ts]) {
      this.threads[thread_ts] = { messages: [message] };
    }
    // Send to listener
    else if (this.threads[thread_ts].listener) {
      this.threads[thread_ts].listener(message);
      delete this.threads[thread_ts];
    }
    // Add to thread
    else {
      this.threads[thread_ts].messages.push(message);
    }
  }

  static read(thread_ts: string): YALCS.Message[] {
    if (!this.threads[thread_ts]) return [];
    const { messages } = this.threads[thread_ts];
    this.threads[thread_ts].messages = [];
    return messages;
  }
}
