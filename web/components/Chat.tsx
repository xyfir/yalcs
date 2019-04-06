import * as React from 'react';
import { YALCS } from 'types/yalcs';
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
    },
    messages: {
      flex: 1
    },
    fabIcon: {
      marginRight: theme.spacing.unit
    },
    title: {
      flex: 1
    },
    chat: {
      flexDirection: 'column',
      display: 'flex',
      height: '100vh'
    },
    fab: {
      [process.enve.FAB_ON_RIGHT ? 'right' : 'left']: 0,
      position: 'fixed',
      margin: theme.spacing.unit * 2,
      bottom: '0',
      zIndex: 1
    }
  });

interface ChatState extends YALCS.Thread {
  polling: boolean;
  show: boolean;
  text: string;
}

class _Chat extends React.Component<WithStyles<typeof styles>, ChatState> {
  state: ChatState = {
    messages: [],
    polling: false,
    show: false,
    text: ''
  };

  componentDidMount() {
    const data: YALCS.Thread =
      localStorage.getItem('yalcs') !== undefined
        ? JSON.parse(localStorage.getItem('yalcs'))
        : {};
    this.setState(data);
  }

  componentDidUpdate() {
    const { thread_ts, messages, polling } = this.state;

    const data: YALCS.Thread = { thread_ts, messages };
    localStorage.setItem('yalcs', JSON.stringify(data));

    if (thread_ts && !polling) this.poll();
  }

  onClose() {
    this.setState({ show: false });
  }

  onOpen() {
    this.setState({ show: true });
  }

  onSend() {
    const { thread_ts, messages, text } = this.state;
    api.post('/messages', { thread_ts, text }).then(res => {
      const data: YALCS.MessageInThread = res.data;
      messages.push(data.message);
      this.setState({ thread_ts: data.thread_ts, messages, text: '' });
    });
  }

  poll() {
    const { thread_ts } = this.state;
    this.setState({ polling: true });

    api.get(`/messages?thread_ts=${thread_ts}&longpoll=1`).then(res => {
      const { messages } = this.state;
      this.setState({ messages: messages.concat(res.data), polling: false });
    });
  }

  render() {
    const { messages, show, text } = this.state;
    const { classes } = this.props;
    return show ? (
      <div className={classes.chat}>
        <AppBar position="static">
          <Toolbar>
            <Typography color="inherit" variant="h6" className={classes.title}>
              Send us a message...
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
                elevation={1}
                className={
                  msg.outgoing
                    ? classes.outgoingMessage
                    : classes.incomingMessage
                }
              >
                <Typography color="inherit">{msg.text}</Typography>
              </Paper>
            ))}
          </div>
        ) : (
          <div className={classes.noMessages}>
            <ChatOutlinedIcon className={classes.chatOutline} />
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
            onKeyDown={e =>
              e.key == 'Enter' && !e.shiftKey ? this.onSend() : null
            }
            placeholder="Ask a question or give your feedback..."
          />
          <IconButton
            color="primary"
            onClick={() => this.onSend()}
            aria-label="Send message"
          >
            <SendIcon />
          </IconButton>
        </div>
      </div>
    ) : (
      <Fab
        color="secondary"
        onClick={() => this.onOpen()}
        variant="extended"
        className={classes.fab}
        aria-label="Send us a message"
      >
        <ChatIcon className={classes.fabIcon} />
        Have a question?
      </Fab>
    );
  }
}

export const Chat = withStyles(styles)(_Chat);
