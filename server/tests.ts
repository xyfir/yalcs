import { config } from 'dotenv';
config();
import 'enve';

import { verifySlackRequest } from 'lib/verify-slack-request';
import { slackListener } from 'lib/slack-listener';
import { sendMessage } from 'lib/send-message';
import { getMessages } from 'lib/get-messages';
import { ThreadStore } from 'lib/ThreadStore';
import { createHmac } from 'crypto';
import { getThread } from 'lib/get-thread';
import { Yalcs } from 'types/yalcs';
import * as uuid from 'uuid/v4';
import 'jest-extended';

let nonce = 0;
const timestamp = () => (Date.now() / 1000).toFixed(4) + nonce++;

test('ThreadStore', async () => {
  expect.assertions(4);

  const _thread: Yalcs.Thread = {
    thread_ts: timestamp(),
    messages: [{ text: 'test', ts: timestamp() }],
    key: uuid()
  };

  const promise = new Promise(resolve =>
    ThreadStore.subscribe(_thread.thread_ts, thread => {
      expect(thread).toMatchObject(_thread);
      resolve();
    })
  );
  await ThreadStore.save(_thread);
  await promise;

  _thread.messages = _thread.messages.concat(_thread.messages[0]);
  await ThreadStore.save(_thread);

  const thread = await ThreadStore.read(_thread.thread_ts, _thread.key);
  expect(thread).toMatchObject(_thread);

  await expect(ThreadStore.read(_thread.thread_ts, '')).toReject();
  await expect(
    ThreadStore.read(_thread.thread_ts, process.enve.SLACK_SIGNING_SECRET)
  ).toResolve();
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

  const thread_ts = timestamp();
  const _message: Yalcs.Message = { text: 'test', ts: timestamp() };
  const _thread: Yalcs.Thread = { thread_ts, messages: [], key: uuid() };

  await ThreadStore.save(_thread);
  _thread.messages.push(_message);

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
  const thread = await ThreadStore.read(thread_ts, _thread.key);
  expect(thread).toMatchObject(_thread);
});

test('getThread', async () => {
  const _thread: Yalcs.Thread = {
    thread_ts: timestamp(),
    messages: [{ text: 'test', ts: timestamp() }],
    key: uuid()
  };

  await ThreadStore.save(_thread);
  let thread = await getThread({
    thread_ts: _thread.thread_ts,
    key: _thread.key
  });
  expect(thread).toMatchObject(_thread);
});

test('sendMessage', async () => {
  const newThread = await sendMessage({
    text: Date.now().toString(),
    ip: '::1'
  });
  const updatedThread = await sendMessage({
    thread_ts: newThread.thread_ts,
    text: Date.now().toString(),
    key: newThread.key,
    ip: '::1'
  });
  expect(newThread.thread_ts).toMatch(/^\d+\.\d+$/);
  expect(newThread.messages[0].text).toMatch(/^\d{13}$/);
  expect(newThread.messages[0].ts).toMatch(/^\d+\.\d+$/);
  expect(updatedThread.thread_ts).toBe(newThread.thread_ts);
  expect(updatedThread.messages[0].text).toMatch(/^\d{13}$/);
  expect(updatedThread.messages[0].ts).toMatch(/^\d+\.\d+$/);
});

test('getMessages', async () => {
  expect.assertions(2);

  const thread_ts = timestamp();
  const _thread: Yalcs.Thread = {
    thread_ts,
    messages: [{ text: 'test', ts: timestamp() }]
  };
  await ThreadStore.save(_thread);

  _thread.messages.push({ text: 'test 2', ts: timestamp() });

  const promise = getMessages({
    message_ts: _thread.messages[0].ts,
    thread_ts
  });
  await new Promise(r => setTimeout(r, 500));
  await ThreadStore.save(_thread);
  const messages = await promise;

  expect(messages).toBeArrayOfSize(1);
  expect(messages[0]).toMatchObject(_thread.messages[1]);
});
