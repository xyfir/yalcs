import { ThreadStore } from 'lib/ThreadStore';
import { getThread } from 'lib/get-thread';
import { Yalcs } from 'types/yalcs';
import storage from 'node-persist';
import uuid from 'uuid/v4';

test('getThread()', async () => {
  // Mock storage
  const mockGetItem = ((storage as any).getItem = jest.fn());
  const mockSetItem = ((storage as any).setItem = jest.fn());
  mockGetItem.mockResolvedValueOnce(undefined); // no thread

  // Create thread
  const _thread: Yalcs.Thread = {
    thread_ts: '1568858478.1174',
    messages: [{ text: 'test', ts: '1568858478.1175' }],
    key: uuid()
  };
  await ThreadStore.save(_thread);
  mockGetItem.mockResolvedValueOnce(_thread);

  // Get thread
  const thread = await getThread({
    thread_ts: _thread.thread_ts,
    key: _thread.key
  });
  expect(thread).toMatchObject(_thread);
});
