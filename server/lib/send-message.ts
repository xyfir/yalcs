import { ThreadStore } from 'lib/ThreadStore';
import * as request from 'request-promise-native';
import { Yalcs } from 'types/yalcs';

export async function sendMessage({
  thread_ts,
  text,
  ip
}: Yalcs.SendMessageOptions): Promise<Yalcs.Thread> {
  try {
    // Create first message which will start thread
    if (!thread_ts) {
      const res = await request.post('https://slack.com/api/chat.postMessage', {
        auth: { bearer: process.enve.SLACK_BOT_TOKEN },
        json: {
          channel: process.enve.SLACK_CHANNEL,
          text: ip
        }
      });
      thread_ts = res.message.ts;
    }

    // Add message to thread
    const res = await request.post('https://slack.com/api/chat.postMessage', {
      auth: { bearer: process.enve.SLACK_BOT_TOKEN },
      json: {
        thread_ts,
        channel: process.enve.SLACK_CHANNEL,
        text
      }
    });

    // Get full thread from disk
    let thread: Yalcs.Thread = await ThreadStore.read(thread_ts);

    // Create new thread
    if (!thread) {
      thread = {
        thread_ts,
        messages: [{ outgoing: true, text, ts: res.message.ts }]
      };
    }
    // Add message to existing thread
    else {
      thread.messages.push({ outgoing: true, text, ts: res.message.ts });
    }

    // Write thread to disk
    await ThreadStore.save(thread);

    return thread;
  } catch (err) {
    console.error(err);
  }
}
