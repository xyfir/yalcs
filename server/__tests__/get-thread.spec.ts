import { ThreadStore } from 'lib/ThreadStore';
import { getThread } from 'lib/get-thread';
import { Yalcs } from 'types/yalcs';
import uuid from 'uuid/v4';

test('getThread()', async () => {
  const _thread: Yalcs.Thread = {
    thread_ts: '1568858478.1174',
    messages: [{ text: 'test', ts: '1568858478.1175' }],
    key: uuid()
  };

  await ThreadStore.save(_thread);
  const thread = await getThread({
    thread_ts: _thread.thread_ts,
    key: _thread.key
  });
  expect(thread).toMatchObject(_thread);
});
