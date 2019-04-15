import * as React from 'react';
import { Yalcs } from 'types/yalcs';
import { api } from 'lib/api';
import {
  createStyles,
  withStyles,
  WithStyles,
  IconButton,
  Typography,
  TextField,
  Divider,
  Toolbar,
  AppBar,
  Paper,
  Theme,
  Fab
} from '@material-ui/core';
import {
  NotificationImportant as NotificationImportantIcon,
  ChatOutlined as ChatOutlinedIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Send as SendIcon
} from '@material-ui/icons';

const styles = (theme: Theme) =>
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
      margin: theme.spacing.unit
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
      marginRight: theme.spacing.unit
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
      margin: theme.spacing.unit,
      height: `calc(100vh - ${theme.spacing.unit * 2}px)`,
      width: `calc(100vw - ${theme.spacing.unit * 2}px)`
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
      margin: theme.spacing.unit * 2,
      right: process.enve.FAB_ON_RIGHT ? '0' : ''
    }
  });

interface ChatState extends Yalcs.Thread {
  polling: boolean;
  alert: boolean;
  show: boolean;
  text: string;
}

class _Chat extends React.Component<WithStyles<typeof styles>, ChatState> {
  state: ChatState = {
    messages: [],
    polling: false,
    alert: false,
    show: false,
    text: ''
  };
  anchor = React.createRef<HTMLDivElement>();

  componentDidMount() {
    // Load thread
    const thread_ts: Yalcs.Thread['thread_ts'] =
      localStorage.getItem('yalcs.thread_ts') || undefined;
    const key: Yalcs.Thread['key'] =
      localStorage.getItem('yalcs.key') || undefined;
    if (!thread_ts || !key) return;
    const opt: Yalcs.GetThreadOptions = { thread_ts, key };
    api
      .get('/thread', { params: opt })
      .then(res => this.setState({ ...res.data, thread_ts, key }))
      .catch(err => console.error('yalcs load thread error', err));
  }

  componentDidUpdate(prevProps, prevState: ChatState) {
    const { thread_ts, messages, polling, show, key } = this.state;

    // Update localStorage from state
    if (thread_ts) {
      localStorage.setItem('yalcs.thread_ts', thread_ts);
      localStorage.setItem('yalcs.key', key);
    }

    // Scroll to anchor element (bottom of message list)
    if (show && messages.length) this.anchor.current.scrollIntoView();

    // Begin polling for new messages
    if (thread_ts && !polling) this.poll();

    // Notify parent window of new show state
    if (prevState.show != show) {
      const event: Yalcs.EventData = { yalcs: true, show };
      window.parent.postMessage(event, '*');
    }
  }

  onClickLink(link: string) {
    const event: Yalcs.EventData = { yalcs: true, link };
    window.parent.postMessage(event, '*');
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Send on Enter, allow multiple lines while holding Shift
    if (e.key != 'Enter' || e.shiftKey) return;
    e.preventDefault();
    this.onSend();
  }

  onClose() {
    this.setState({ show: false });
  }

  onOpen() {
    this.setState({ show: true, alert: false });
  }

  onSend() {
    // Send message and push to state if successful
    const { thread_ts, text, key } = this.state;
    const opt: Yalcs.SendMessageOptions = { thread_ts, text, key };
    api.post('/messages', opt).then(res => {
      const thread: Yalcs.Thread = res.data;
      this.setState({ ...thread, text: '' });
    });
  }

  poll() {
    const { thread_ts, messages, key } = this.state;
    this.setState({ polling: true });

    // Keep connection alive until a new message is received
    // Will automatically reconnect on component update if !polling
    const opt: Yalcs.GetMessageOptions = {
      message_ts: messages[messages.length - 1].ts,
      thread_ts,
      key
    };
    api
      .get('/messages', { params: opt })
      .then(res => {
        const { messages, show } = this.state;
        this.setState({
          messages: messages.concat(res.data),
          polling: false,
          // Show alert fab if chat window is closed
          alert: !show && res.data.length
        });
      })
      .catch(err => {
        console.error('yalcs polling error', err);
        // Prevent instantly sending thousands of requests
        setTimeout(() => this.setState({ polling: false }), 60 * 1000);
      });
  }

  render() {
    const { messages, alert, show, text } = this.state;
    const { classes } = this.props;
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
                  {process.enve.TITLE_TEXT}
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={() => this.onClose()}
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
                <div ref={this.anchor} />
              </div>
            ) : (
              <div className={classes.noMessages}>
                <ChatOutlinedIcon className={classes.chatOutline} />
                <Typography className={classes.poweredBy}>
                  Chat powered by{' '}
                  <a
                    onClick={() =>
                      this.onClickLink('https://github.com/Xyfir/yalcs')
                    }
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
                onChange={e => this.setState({ text: e.target.value })}
                fullWidth
                multiline
                onKeyDown={e => this.onKeyDown(e)}
                placeholder={process.enve.MESSAGE_PLACEHOLDER_TEXT}
                InputProps={{ classes: { inputMultiline: classes.textarea } }}
              />
              <IconButton
                color="primary"
                onClick={() => this.onSend()}
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
            onClick={() => this.onOpen()}
            variant="extended"
            className={`${classes.fab} ${show ? classes.hiddenFab : ''}`}
            aria-label={process.enve.UNREAD_MESSAGES_FAB_TEXT}
          >
            <NotificationImportantIcon className={classes.fabIcon} />
            {process.enve.UNREAD_MESSAGES_FAB_TEXT}
          </Fab>
        ) : (
          <Fab
            color="secondary"
            onClick={() => this.onOpen()}
            variant="extended"
            className={`${classes.fab} ${show ? classes.hiddenFab : ''}`}
            aria-label={process.enve.FAB_TEXT}
          >
            <ChatIcon className={classes.fabIcon} />
            {process.enve.FAB_TEXT}
          </Fab>
        )}
      </React.Fragment>
    );
  }
}

export const Chat = withStyles(styles)(_Chat);
