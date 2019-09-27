import { ChatButton } from 'components/Button';
import { ChatPopup } from 'components/Popup';
import { Yalcs } from 'types/yalcs';
import { api } from 'lib/api';
import React from 'react';

export function Chat() {
  const [messages, setMessages] = React.useState<Yalcs.Message[]>([]);
  const [polling, setPolling] = React.useState(false);
  const [thread, setThread] = React.useState<Yalcs.Thread>({});
  const [alert, setAlert] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [text, setText] = React.useState('');

  function onClose() {
    setShow(false);
  }

  function onOpen() {
    setAlert(false);
    setShow(true);
  }

  function onSend() {
    // Send message and push to state if successful
    const opt: Yalcs.SendMessageOptions = {
      thread_ts: thread.thread_ts,
      text,
      key: thread.key
    };
    api.post('/messages', opt).then(res => {
      const thread: Yalcs.Thread = res.data;
      setMessages(thread.messages!);
      setThread(thread);
      setText('');
    });
  }

  function poll() {
    setPolling(true);

    // Keep connection alive until a new message is received
    // Will automatically reconnect on component update if !polling
    const opt: Yalcs.GetMessageOptions = {
      message_ts: messages[messages.length - 1].ts,
      thread_ts: thread.thread_ts,
      key: thread.key
    };
    api
      .get('/messages', { params: opt })
      .then(res => {
        setMessages(messages.concat(res.data));
        setPolling(false);
        // Show alert fab if chat window is closed
        setAlert(!show && res.data.length);
      })
      .catch(err => {
        console.error('yalcs polling error', err);
        // Prevent instantly sending thousands of requests
        setTimeout(() => setPolling(false), 60 * 1000);
      });
  }

  // Load thread on mount
  React.useEffect(() => {
    const thread_ts: Yalcs.Thread['thread_ts'] =
      localStorage.getItem('yalcs.thread_ts') || undefined;
    const key: Yalcs.Thread['key'] =
      localStorage.getItem('yalcs.key') || undefined;
    if (!thread_ts || !key) return;

    const opt: Yalcs.GetThreadOptions = { thread_ts, key };
    api
      .get('/thread', { params: opt })
      .then(res => setThread({ ...res.data, thread_ts, key }))
      .catch(err => console.error('yalcs load thread error', err));
  }, []);

  // Update localStorage from state
  React.useEffect(() => {
    if (!thread.thread_ts) return;
    localStorage.setItem('yalcs.thread_ts', thread.thread_ts);
    localStorage.setItem('yalcs.key', thread.key!);
  }, [thread.thread_ts]);

  // Begin polling for new messages
  React.useEffect(() => {
    if (thread.thread_ts && !polling) poll();
  }, [thread.thread_ts, polling]);

  // Notify parent window of new show state
  React.useEffect(() => {
    const event: Yalcs.EventData = { yalcs: true, show };
    window.parent.postMessage(event, '*');
  }, [show]);

  return (
    <React.Fragment>
      {show ? (
        <ChatPopup
          messages={messages}
          onClose={onClose}
          setText={setText}
          onSend={onSend}
          text={text}
        />
      ) : null}
      <ChatButton onOpen={onOpen} alert={alert} show={show} />
    </React.Fragment>
  );
}
