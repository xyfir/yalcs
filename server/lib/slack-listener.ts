import { verifySlackRequest } from 'lib/verify-slack-request';
import { ThreadStore } from 'lib/ThreadStore';

export async function slackListener(
  data: {
    challenge?: string;
    event?: {
      thread_ts: string;
      subtype: 'message_replied' | 'bot_message' | string;
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

  // Ignore all non-thread reply events
  if (data.type == 'url_verification') return data.challenge;
  if (data.type != 'event_callback') return;
  if (data.event.channel != process.enve.SLACK_CHANNEL) return;
  if (data.event.type != 'message') return;
  if (!data.event.thread_ts) return;
  if (data.event.subtype == 'bot_message') return;

  // Load thread
  const thread = await ThreadStore.read(data.event.thread_ts);

  // Add message to thread
  thread.messages.push({ text: data.event.text, ts: data.event.ts });

  // Save message to disk and optionally notify subscriber
  await ThreadStore.save(thread);
}
