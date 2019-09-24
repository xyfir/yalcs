import { ThreadStore } from 'lib/ThreadStore';
import request from 'request-promise-native';
import { Yalcs } from 'types/yalcs';
import uuid from 'uuid/v4';

export async function sendMessage({
  thread_ts,
  text,
  key,
  ip
}: Yalcs.SendMessageOptions): Promise<Yalcs.Thread> {
  try {
    let thread: Yalcs.Thread;

    // Get full thread from disk
    if (thread_ts) {
      thread = await ThreadStore.read(thread_ts, key);
    }
    // Create new thread
    else {
      // Get geolocation data from IP
      let geoip = ip;
      if (ip != '::ffff:127.0.0.1' && ip != '::1') {
        const res = await request.get(`https://freegeoip.app/json/${ip}`);
        geoip += ` — ${res.city}, ${res.region_name}, ${res.country_name}`;
      }

      // Create initial message to start thread
      const res = await request.post('https://slack.com/api/chat.postMessage', {
        auth: { bearer: process.enve.SLACK_BOT_TOKEN },
        json: {
          channel: process.enve.SLACK_CHANNEL,
          text: geoip
        }
      });
      thread = { thread_ts: res.message.ts, messages: [], key: uuid() };
    }

    // Add message to thread
    const res = await request.post('https://slack.com/api/chat.postMessage', {
      auth: { bearer: process.enve.SLACK_BOT_TOKEN },
      json: {
        thread_ts: thread.thread_ts,
        channel: process.enve.SLACK_CHANNEL,
        text
      }
    });
    thread.messages.push({ outgoing: true, text, ts: res.message.ts });

    // Write thread to disk
    await ThreadStore.save(thread);

    return thread;
  } catch (err) {
    console.error(err);
  }
}
