import * as request from 'request-promise-native';
import { Yalcs } from 'types/yalcs';

export async function sendMessage({
  thread_ts,
  text,
  ip
}: Yalcs.SendMessageOptions): Promise<Yalcs.MessageInThread> {
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

    return {
      thread_ts,
      message: { outgoing: true, text, ts: res.message.ts }
    };
  } catch (err) {
    console.error(err);
  }
}
