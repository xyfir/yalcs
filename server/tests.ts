import { config } from 'dotenv';
config();
import 'enve';

import { MessageStore } from 'lib/MessageStore';
import { YALCS } from 'types/yalcs';
import 'jest-extended';

test('MessageStore', async () => {
  expect.assertions(3);

  const _message: YALCS.Message = {
    text: 'test',
    ts: '2345.6789'
  };
  const thread_ts = '1234.5678';

  const promise = new Promise(resolve =>
    MessageStore.subscribe(thread_ts, message => {
      expect(message).toMatchObject(_message);
      resolve();
    })
  );
  MessageStore.save(thread_ts, _message);
  await promise;

  MessageStore.save(thread_ts, _message);
  expect(MessageStore.read(thread_ts)).toMatchObject([_message]);
  expect(MessageStore.read(thread_ts)).toMatchObject([]);
});
