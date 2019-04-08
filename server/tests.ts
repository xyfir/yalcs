import { config } from 'dotenv';
config();
import 'enve';

import { verifySlackRequest } from 'lib/verify-slack-request';
import { slackListener } from 'lib/slack-listener';
import { MessageStore } from 'lib/MessageStore';
import { sendMessage } from 'lib/send-message';
import { getMessages } from 'lib/get-messages';
import { createHmac } from 'crypto';
import { Yalcs } from 'types/yalcs';
import 'jest-extended';

test('MessageStore', async () => {
  expect.assertions(3);

  const _message: Yalcs.Message = {
    text: 'test',
    ts: '2345.6789'
  };
  const thread_ts = '1234.5678';

  const promise = new Promise(resolve =>
    MessageStore.subscribe(thread_ts, message => {
      expect(message).toMatchObject(_message);
      resolve();
    })
  );
  MessageStore.save(thread_ts, _message);
  await promise;

  MessageStore.save(thread_ts, _message);
  expect(MessageStore.read(thread_ts)).toMatchObject([_message]);
  expect(MessageStore.read(thread_ts)).toMatchObject([]);
});

test('verifySlackRequest', () => {
  const date = Math.floor(Date.now() / 1000);
  const data = { type: 'event_callback' };

  const hmac = createHmac('sha256', process.enve.SLACK_SIGNING_SECRET);
  hmac.update(`v0:${date}:${JSON.stringify(data)}`);

  verifySlackRequest(`v0=${hmac.digest('hex')}`, date, data);
});

test('slackListener challenge', () => {
  const date = Math.floor(Date.now() / 1000);
  const data = { type: 'url_verification', challenge: 'test123' };

  const hmac = createHmac('sha256', process.enve.SLACK_SIGNING_SECRET);
  hmac.update(`v0:${date}:${JSON.stringify(data)}`);

  expect(slackListener(data, `v0=${hmac.digest('hex')}`, date)).resolves.toBe(
    'test123'
  );
});

test('slackListener message', async () => {
  expect.assertions(1);

  const thread_ts = '1234.5678';
  const _message: Yalcs.Message = {
    text: 'test',
    ts: '2345.6789'
  };
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
  expect(MessageStore.read(thread_ts)).toMatchObject([_message]);
});

test('getMessages', async () => {
  const thread_ts = '1234.5678';
  const _message: Yalcs.Message = {
    text: 'test',
    ts: '2345.6789'
  };

  MessageStore.save(thread_ts, _message);
  let messages = await getMessages({ thread_ts, longpoll: false });
  expect(messages).toMatchObject([_message]);

  messages = await getMessages({ thread_ts, longpoll: false });
  expect(messages).toMatchObject([]);

  const promise = getMessages({ thread_ts, longpoll: true });
  MessageStore.save(thread_ts, _message);
  messages = await promise;
  expect(messages).toMatchObject([_message]);
});

test('sendMessage', async () => {
  const res1 = await sendMessage({ text: Date.now().toString() }, '::1');
  const res2 = await sendMessage(
    { thread_ts: res1.thread_ts, text: Date.now().toString() },
    '::1'
  );
  expect(res1.thread_ts).toMatch(/^\d+\.\d+$/);
  expect(res1.message.text).toMatch(/^\d{13}$/);
  expect(res1.message.ts).toMatch(/^\d+\.\d+$/);
  expect(res2.thread_ts).toBe(res1.thread_ts);
  expect(res2.message.text).toMatch(/^\d{13}$/);
  expect(res2.message.ts).toMatch(/^\d+\.\d+$/);
});
