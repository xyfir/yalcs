import { ThreadStore } from 'lib/ThreadStore';
import { Yalcs } from 'types/yalcs';
import * as uuid from 'uuid/v4';

test('ThreadStore', async () => {
  expect.assertions(4);

  const _thread: Yalcs.Thread = {
    thread_ts: '1568858478.1170',
    messages: [{ text: 'test', ts: '1568858478.1171' }],
    key: uuid()
  };

  const promise = new Promise(resolve =>
    ThreadStore.subscribe(_thread.thread_ts, thread => {
      expect(thread).toMatchObject(_thread);
      resolve();
    })
  );
  await ThreadStore.save(_thread, true);
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
