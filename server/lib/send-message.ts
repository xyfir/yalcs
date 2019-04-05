import * as request from 'request-promise-native';
import { YALCS } from 'types/yalcs';

export async function sendMessage(
  { ts, text }: { ts?: string; text: string },
  ip: string
): Promise<YALCS.Message> {
  try {
    // Create first message which will start thread
    if (!ts) {
      const res = await request.post('https://slack.com/api/chat.postMessage', {
        auth: { bearer: process.enve.SLACK_BOT_TOKEN },
        json: {
          channel: process.enve.SLACK_CHANNEL,
          text: ip
        }
      });
      ts = res.message.ts;
    }

    // Add message to thread
    await request.post('https://slack.com/api/chat.postMessage', {
      auth: { bearer: process.enve.SLACK_BOT_TOKEN },
      json: {
        thread_ts: ts,
        channel: process.enve.SLACK_CHANNEL,
        text
      }
    });

    return { text, ts };
  } catch (err) {
    console.error(err);
  }
}
