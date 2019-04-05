import { verifySlackRequest } from 'lib/verify-slack-request';
import { MessageStore } from 'lib/MessageStore';

export async function slackListener(
  data: {
    challenge?: string;
    event?: {
      thread_ts: string;
      subtype: 'message_replied' | string;
      channel: string;
      type: 'message' | string;
      text: string;
      ts: string;
    };
    type: 'url_verification' | 'event_callback' | string;
  },
  signature: string,
  timestamp: number
): Promise<any> {
  verifySlackRequest(signature, timestamp, data);

  if (data.type == 'url_verification') return data.challenge;
  if (data.type != 'event_callback') return;
  if (data.event.channel != process.enve.SLACK_CHANNEL) return;
  if (data.event.type != 'message') return;
  if (!data.event.thread_ts) return;

  MessageStore.save(data.event.thread_ts, {
    text: data.event.text,
    ts: data.event.ts
  });
}
