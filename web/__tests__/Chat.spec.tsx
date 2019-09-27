import { Yalcs } from 'types/yalcs';
import { Chat } from 'components/Chat';
import * as api from 'lib/api';
import React from 'react';
import {
  waitForDomChange,
  fireEvent,
  render,
  wait
} from '@testing-library/react';

// Placeholder test
test('<Chat>', async () => {
  // Mock data
  const thread: Yalcs.Thread = {
    thread_ts: '1569526000.000000',
    messages: [
      {
        outgoing: true,
        text: 'I need help!',
        ts: '1569526001.000000'
      }
    ],
    key: '1f8f8ea7'
  };
  const message: Yalcs.Message = {
    text: 'What can I do for you?',
    ts: '1569526002.000000'
  };
  const threadOpt: Yalcs.GetThreadOptions = {
    thread_ts: thread.thread_ts,
    key: thread.key
  };
  const messageOpt: Yalcs.GetMessageOptions = {
    message_ts: thread.messages![0].ts,
    ...threadOpt
  };

  // Mock storage
  const mockGetItem = jest.fn();
  const mockSetItem = jest.fn();
  Object.defineProperty(window, 'localStorage', {
    value: { setItem: mockSetItem, getItem: mockGetItem }
  });
  mockGetItem.mockReturnValueOnce(threadOpt.thread_ts); // yalcs.thread_ts
  mockGetItem.mockReturnValueOnce(threadOpt.key); // yalcs.key

  // Mock API
  const mockPost = jest.fn();
  const mockGet = jest.fn();
  (api as any).api = { post: mockPost, get: mockGet };
  mockGet.mockResolvedValueOnce({ data: thread }); // get thread
  mockGet.mockReturnValueOnce(
    new Promise(r => setTimeout(() => r({ data: [message] }), 1000))
  ); // polling

  // Render Chat
  const { getByLabelText, getByText } = render(<Chat />);

  // Validate initial API call
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet.mock.calls[0][0]).toBe('/thread');
  expect(mockGet.mock.calls[0][1]).toMatchObject({ params: threadOpt });

  // Validate storage
  expect(mockGetItem).toHaveBeenCalledTimes(2);
  expect(mockGetItem).toHaveBeenCalledWith('yalcs.thread_ts');
  expect(mockGetItem).toHaveBeenCalledWith('yalcs.key');
  // await wait(() => expect(mockSetItem).toHaveBeenCalledTimes(2));
  // expect(mockSetItem).toHaveBeenCalledWith('yalcs.thread_ts', thread.thread_ts);
  // expect(mockSetItem).toHaveBeenCalledWith('yalcs.key', thread.key);

  // // Validate polling
  // await wait(() => expect(mockGet).toHaveBeenCalledTimes(2));
  // expect(mockGet.mock.calls[1][0]).toBe('/messages');
  // expect(mockGet.mock.calls[1][1]).toMatchObject({ params: messageOpt });
});
