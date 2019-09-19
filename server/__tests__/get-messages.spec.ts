import { getMessages } from 'lib/get-messages';
import { ThreadStore } from 'lib/ThreadStore';
import { Yalcs } from 'types/yalcs';

test('getMessages()', async () => {
  expect.assertions(2);

  const thread_ts = '1568858478.1176';
  const _thread: Yalcs.Thread = {
    thread_ts,
    messages: [{ text: 'test', ts: '1568858478.1177' }]
  };
  await ThreadStore.save(_thread);

  _thread.messages.push({ text: 'test 2', ts: '1568858478.1178' });

  const promise = getMessages({
    message_ts: _thread.messages[0].ts,
    thread_ts
  });
  await new Promise(r => setTimeout(r, 500));
  await ThreadStore.save(_thread, true);
  const messages = await promise;

  expect(messages).toBeArrayOfSize(1);
  expect(messages[0]).toMatchObject(_thread.messages[1]);
});
