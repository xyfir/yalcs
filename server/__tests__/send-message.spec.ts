import { sendMessage } from 'lib/send-message';
import request from 'request-promise-native';
import storage from 'node-persist';

test('sendMessage()', async () => {
  // Mock geoip request
  const mockGet = ((request as any).get = jest.fn());
  mockGet.mockResolvedValueOnce({
    country_name: 'United States',
    region_name: 'California',
    city: 'San Diego'
  });

  // Mock Slack request
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
    ip: '123.255.255.255'
  });

  // Validate new thread
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenCalledWith(
    'https://freegeoip.app/json/123.255.255.255'
  );
  expect(mockPost).toHaveBeenCalledTimes(2);
  expect(mockPost.mock.calls[0][1].json.text).toBe(
    '123.255.255.255 — San Diego, California, United States'
  );
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
    ip: '123.255.255.255'
  });

  // Validate updated thread
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(updatedThread.thread_ts).toBe('1568858478.1201');
  expect(updatedThread.messages[0].text).toBe('text');
  expect(updatedThread.messages[0].ts).toBe('1568858478.1202');
});
