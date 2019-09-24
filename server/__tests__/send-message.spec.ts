import { sendMessage } from 'lib/send-message';
import request from 'request-promise-native';
import storage from 'node-persist';

test('sendMessage()', async () => {
  // Mock request
  const mockPost = ((request as any).post = jest.fn());
  mockPost.mockResolvedValueOnce({ message: { ts: '1568858478.1201' } });
  mockPost.mockResolvedValueOnce({ message: { ts: '1568858478.1202' } });

  // Mock storage
  const mockGetItem = ((storage as any).getItem = jest.fn());
  const mockSetItem = ((storage as any).setItem = jest.fn());
  mockGetItem.mockResolvedValueOnce(undefined); // no thread

  // Create thread and send first message
  const newThread = await sendMessage({
    text: 'text',
    ip: '::1'
  });

  // Validate new thread
  expect(newThread.thread_ts).toBe('1568858478.1201');
  expect(newThread.messages[0].text).toBe('text');
  expect(newThread.messages[0].ts).toBe('1568858478.1202');

  // Mock storage and request
  mockGetItem.mockResolvedValue({
    thread_ts: '1568858478.1201',
    messages: [
      {
        outgoing: true,
        text: 'text',
        ts: '1568858478.1202'
      }
    ],
    key: 'key'
  });
  mockPost.mockResolvedValueOnce({ message: { ts: '1568858478.1203' } });

  // Send second message
  const updatedThread = await sendMessage({
    thread_ts: newThread.thread_ts,
    text: Date.now().toString(),
    key: 'key',
    ip: '::1'
  });

  // Validate updated thread
  expect(updatedThread.thread_ts).toBe('1568858478.1201');
  expect(updatedThread.messages[0].text).toBe('text');
  expect(updatedThread.messages[0].ts).toBe('1568858478.1202');
});
