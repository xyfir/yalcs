import { slackListener } from 'lib/slack-listener';
import { ThreadStore } from 'lib/ThreadStore';
import { createHmac } from 'crypto';
import { Yalcs } from 'types/yalcs';
import storage from 'node-persist';
import uuid from 'uuid/v4';

test('slackListener() challenge', () => {
  const date = Math.floor(Date.now() / 1000);
  const data = { type: 'url_verification', challenge: 'test123' };

  const hmac = createHmac('sha256', process.enve.SLACK_SIGNING_SECRET);
  hmac.update(`v0:${date}:${JSON.stringify(data)}`);

  expect(slackListener(data, `v0=${hmac.digest('hex')}`, date)).resolves.toBe(
    'test123'
  );
});

test('slackListener() message', async () => {
  expect.assertions(1);

  // Mock storage
  const mockGetItem = ((storage as any).getItem = jest.fn());
  const mockSetItem = ((storage as any).setItem = jest.fn());

  // Create thread
  const thread_ts = '1568858478.1172';
  const _message: Yalcs.Message = { text: 'test', ts: '1568858478.1173' };
  const _thread: Yalcs.Thread = { thread_ts, messages: [], key: uuid() };
  await ThreadStore.save(_thread);
  _thread.messages.push(_message);
  mockGetItem.mockResolvedValue(_thread);

  // Mock request from Slack
  const date = Math.floor(Date.now() / 1000);
  const data = {
    event: {
      thread_ts,
      ..._message,
      subtype: 'message_replied',
      channel: process.enve.SLACK_CHANNEL,
      type: 'message'
    },
    type: 'event_callback'
  };
  const hmac = createHmac('sha256', process.enve.SLACK_SIGNING_SECRET);
  hmac.update(`v0:${date}:${JSON.stringify(data)}`);
  await slackListener(data, `v0=${hmac.digest('hex')}`, date);

  // Validate thread
  const thread = await ThreadStore.read(thread_ts, _thread.key);
  expect(thread).toMatchObject(_thread);
});
