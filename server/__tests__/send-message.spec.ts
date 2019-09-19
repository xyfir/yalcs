import { sendMessage } from 'lib/send-message';

test('sendMessage()', async () => {
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
