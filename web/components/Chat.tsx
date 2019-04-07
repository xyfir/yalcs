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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
    },
    messages: {
      overflow: 'auto',
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
      // Expand to iframe container's size
      margin: theme.spacing.unit,
      height: `calc(100vh - ${theme.spacing.unit * 2}px)`,
      width: `calc(100vw - ${theme.spacing.unit * 2}px)`
    },
    fab: {
      margin: theme.spacing.unit * 2
    }
  });

interface ChatState extends YALCS.Thread {
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
    const data: YALCS.Thread =
      localStorage.getItem('yalcs') !== undefined
        ? JSON.parse(localStorage.getItem('yalcs'))
        : {};
    this.setState(data);
  }

  componentDidUpdate(prevProps, prevState: ChatState) {
    const { thread_ts, messages, polling, show } = this.state;

    const data: YALCS.Thread = { thread_ts, messages };
    localStorage.setItem('yalcs', JSON.stringify(data));

    if (show) this.anchor.current.scrollIntoView();

    if (thread_ts && !polling) this.poll();

    if (prevState.show != show) {
      const event: YALCS.EventData = { yalcs: true, show };
      window.parent.postMessage(event, '*');
    }
  }

  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key == 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.onSend();
    }
  }

  onClose() {
    this.setState({ show: false });
  }

  onOpen() {
    this.setState({ show: true, alert: false });
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

    api
      .get('/messages', { params: { thread_ts, longpoll: true } })
      .then(res => {
        const { messages, show } = this.state;
        this.setState({
          messages: messages.concat(res.data),
          polling: false,
          alert: !show
        });
      })
      .catch(err => {
        console.error('yalcs polling error', err);
        this.setState({ polling: false });
      });
  }

  render() {
    const { messages, alert, show, text } = this.state;
    const { classes } = this.props;
    return show ? (
      <Paper elevation={1} className={classes.chat}>
        <AppBar position="static">
          <Toolbar>
            <Typography color="inherit" variant="h6" className={classes.title}>
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
    ) : alert ? (
      <Fab
        color="secondary"
        onClick={() => this.onOpen()}
        variant="extended"
        className={classes.fab}
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
        className={classes.fab}
        aria-label={process.enve.FAB_TEXT}
      >
        <ChatIcon className={classes.fabIcon} />
        {process.enve.FAB_TEXT}
      </Fab>
    );
  }
}

export const Chat = withStyles(styles)(_Chat);
