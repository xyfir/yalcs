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

test('<Chat>', async () => {
  // Mock thread
  const thread: Yalcs.Thread = {
    thread_ts: '1569526000.000000',
    messages: [
      {
        outgoing: true,
        text: 'Hello',
        ts: '1569526001.000000'
      }
    ],
    key: '1f8f8ea7'
  };
  const threadOpt: Yalcs.GetThreadOptions = {
    thread_ts: thread.thread_ts,
    key: thread.key
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
  mockGet.mockResolvedValueOnce({ data: thread });

  // Render Chat
  const { getByLabelText, getByText } = render(<Chat />);

  // Validate API calls
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet.mock.calls[0][0]).toBe('/thread');
  expect(mockGet.mock.calls[0][1]).toMatchObject({ params: threadOpt });

  // Validate storage
  expect(mockGetItem).toHaveBeenCalledTimes(2);
  expect(mockGetItem).toHaveBeenCalledWith('yalcs.thread_ts');
  expect(mockGetItem).toHaveBeenCalledWith('yalcs.key');

  // expect(mockSetItem).toHaveBeenCalledTimes(2);
  // expect(mockSetItem).toHaveBeenCalledWith('yalcs.thread_ts', thread.thread_ts);
  // expect(mockSetItem).toHaveBeenCalledWith('yalcs.key', thread.key);

  // Test polling / componentDidUpdate
});
