import { getMessages } from 'lib/get-messages';
import { ThreadStore } from 'lib/ThreadStore';
import { Yalcs } from 'types/yalcs';
import storage from 'node-persist';

test('getMessages()', async () => {
  expect.assertions(2);

  // Mock storage
  const mockGetItem = ((storage as any).getItem = jest.fn());
  const mockSetItem = ((storage as any).setItem = jest.fn());
  mockGetItem.mockResolvedValueOnce(undefined); // no thread

  // Create thread
  const thread_ts = '1568858478.1176';
  const _thread: Yalcs.Thread = {
    thread_ts,
    messages: [{ text: 'test', ts: '1568858478.1177' }]
  };
  await ThreadStore.save(_thread);
  mockGetItem.mockResolvedValueOnce(_thread);

  // Listen for new messages
  const promise = getMessages({
    message_ts: _thread.messages[0].ts,
    thread_ts
  });
  await new Promise(r => setTimeout(r, 500));
  _thread.messages.push({ text: 'test 2', ts: '1568858478.1178' });
  mockGetItem.mockResolvedValueOnce(_thread);
  await ThreadStore.save(_thread, true);
  const messages = await promise;

  // Validate new message
  expect(messages).toBeArrayOfSize(1);
  expect(messages[0]).toMatchObject(_thread.messages[1]);
});
