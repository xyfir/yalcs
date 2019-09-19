import { ThreadStore } from 'lib/ThreadStore';
import { Yalcs } from 'types/yalcs';
import storage from 'node-persist';
import uuid from 'uuid/v4';

test('ThreadStore', async () => {
  // Mock storage
  const mockGetItem = ((storage as any).getItem = jest.fn());
  const mockSetItem = ((storage as any).setItem = jest.fn());
  mockGetItem.mockResolvedValueOnce(undefined); // no thread

  // Subscribe to and start thread
  const _thread: Yalcs.Thread = {
    thread_ts: '1568858478.1170',
    messages: [{ text: 'test', ts: '1568858478.1171' }],
    key: uuid()
  };
  mockGetItem.mockResolvedValue(_thread);
  const promise = new Promise(resolve =>
    ThreadStore.subscribe(_thread.thread_ts, thread => {
      expect(thread).toMatchObject(_thread);
      resolve();
    })
  );
  await ThreadStore.save(_thread, true);
  await promise;
  expect(mockSetItem).toHaveBeenCalledWith('thread-1568858478.1170', _thread);

  // Add message
  _thread.messages = _thread.messages.concat(_thread.messages[0]);
  await ThreadStore.save(_thread);

  // // Load thread
  const thread = await ThreadStore.read(_thread.thread_ts, _thread.key);
  expect(thread).toMatchObject(_thread);
  await expect(ThreadStore.read(_thread.thread_ts, '')).toReject();
  await expect(
    ThreadStore.read(_thread.thread_ts, process.enve.SLACK_SIGNING_SECRET)
  ).toResolve();

  // Validate storage calls
  expect(mockGetItem).toHaveBeenCalledTimes(5);
  expect(mockGetItem).toHaveBeenCalledWith('thread-1568858478.1170');
  expect(mockSetItem).toHaveBeenCalledTimes(2);
  expect(mockSetItem).toHaveBeenNthCalledWith(
    2,
    'thread-1568858478.1170',
    _thread
  );
});
