import { Yalcs } from 'types/yalcs';
import { api } from 'lib/api';
import React from 'react';
import {
  createStyles,
  makeStyles,
  IconButton,
  Typography,
  TextField,
  Divider,
  Toolbar,
  AppBar,
  Paper,
  Fab
} from '@material-ui/core';
import {
  NotificationImportant as NotificationImportantIcon,
  ChatOutlined as ChatOutlinedIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Send as SendIcon
} from '@material-ui/icons';

const {
  UNREAD_MESSAGES_FAB_TEXT,
  MESSAGE_PLACEHOLDER_TEXT,
  TITLE_TEXT,
  FAB_TEXT
} = process.enve;

const useStyles = makeStyles(theme =>
  createStyles({
    outgoingMessage: {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '0.25em',
      marginLeft: '6em',
      padding: '0.5em',
      margin: '1em',
      color: theme.palette.secondary.contrastText
    },
    incomingMessage: {
      backgroundColor: theme.palette.grey[100],
      borderRadius: '0.25em',
      marginRight: '6em',
      padding: '0.5em',
      margin: '1em',
      color: theme.palette.getContrastText(theme.palette.grey[100])
    },
    chatOutline: {
      fontSize: '1000%',
      opacity: 0.1
    },
    sendMessage: {
      alignItems: 'center',
      display: 'flex',
      margin: theme.spacing()
    },
    noMessages: {
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      display: 'flex',
      flex: 1
    },
    poweredBy: {
      fontWeight: 'bold',
      opacity: 0.3
    },
    hiddenFab: {
      transform: 'translate(0, 150%)'
    },
    messages: {
      overflow: 'auto',
      flex: 1
    },
    fabIcon: {
      marginRight: theme.spacing()
    },
    textarea: {
      overflowY: 'hidden'
    },
    appBar: {
      borderBottomRightRadius: '0',
      borderBottomLeftRadius: '0'
    },
    title: {
      flex: 1
    },
    chat: {
      flexDirection: 'column',
      display: 'flex',
      // Expand to iframe container's size
      margin: theme.spacing(),
      height: `calc(100vh - ${theme.spacing(2)}px)`,
      width: `calc(100vw - ${theme.spacing(2)}px)`
    },
    link: {
      textDecoration: 'none',
      cursor: 'pointer',
      color: theme.palette.primary.main
    },
    fab: {
      transition: '0.5s',
      position: 'fixed',
      bottom: '0',
      margin: theme.spacing(2),
      right: process.enve.FAB_ON_RIGHT ? '0' : ''
    }
  })
);

export function Chat() {
  const [messages, setMessages] = React.useState<Yalcs.Message[]>([]);
  const [polling, setPolling] = React.useState(false);
  const [thread, setThread] = React.useState<Yalcs.Thread>({});
  const [alert, setAlert] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [text, setText] = React.useState('');
  const classes = useStyles();
  const anchor = React.useRef<HTMLDivElement>(null);

  function onClickLink(link: string) {
    const event: Yalcs.EventData = { yalcs: true, link };
    window.parent.postMessage(event, '*');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Send on Enter, allow multiple lines while holding Shift
    if (e.key != 'Enter' || e.shiftKey) return;
    e.preventDefault();
    onSend();
  }

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

  // Scroll to anchor element (bottom of message list)
  React.useEffect(() => {
    if (show && messages.length) anchor.current!.scrollIntoView();
  }, [show, messages.length]);

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
        <Paper elevation={1} className={classes.chat}>
          <AppBar
            position="static"
            elevation={0}
            classes={{ root: classes.appBar }}
            square={false}
          >
            <Toolbar>
              <Typography
                color="inherit"
                variant="h6"
                className={classes.title}
              >
                {TITLE_TEXT}
              </Typography>
              <IconButton
                color="inherit"
                onClick={onClose}
                aria-label="Close chat"
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          {messages.length ? (
            <div className={classes.messages}>
              {messages.map(msg => (
                <Paper
                  key={msg.ts}
                  elevation={2}
                  className={
                    msg.outgoing
                      ? classes.outgoingMessage
                      : classes.incomingMessage
                  }
                >
                  <Typography color="inherit">{msg.text}</Typography>
                </Paper>
              ))}
              <div ref={anchor} />
            </div>
          ) : (
            <div className={classes.noMessages}>
              <ChatOutlinedIcon className={classes.chatOutline} />
              <Typography className={classes.poweredBy}>
                Chat powered by{' '}
                <a
                  onClick={() => onClickLink('https://github.com/xyfir/yalcs')}
                  className={classes.link}
                >
                  Yalcs
                </a>
              </Typography>
            </div>
          )}

          <Divider />

          <div className={classes.sendMessage}>
            <TextField
              id="message-text"
              type="text"
              value={text}
              margin="normal"
              rowsMax={2}
              onChange={e => setText(e.target.value)}
              fullWidth
              multiline
              onKeyDown={onKeyDown}
              placeholder={MESSAGE_PLACEHOLDER_TEXT}
              InputProps={{ classes: { inputMultiline: classes.textarea } }}
            />
            <IconButton
              color="primary"
              onClick={onSend}
              aria-label="Send message"
            >
              <SendIcon />
            </IconButton>
          </div>
        </Paper>
      ) : null}

      {alert ? (
        <Fab
          color="secondary"
          onClick={onOpen}
          variant={UNREAD_MESSAGES_FAB_TEXT ? 'extended' : 'round'}
          className={`${classes.fab} ${show ? classes.hiddenFab : ''}`}
          aria-label={UNREAD_MESSAGES_FAB_TEXT}
        >
          <NotificationImportantIcon className={classes.fabIcon} />
          {UNREAD_MESSAGES_FAB_TEXT}
        </Fab>
      ) : (
        <Fab
          color="secondary"
          onClick={onOpen}
          variant={FAB_TEXT ? 'extended' : 'round'}
          className={`${classes.fab} ${show ? classes.hiddenFab : ''}`}
          aria-label={FAB_TEXT}
        >
          <ChatIcon className={classes.fabIcon} />
          {FAB_TEXT}
        </Fab>
      )}
    </React.Fragment>
  );
}
