import * as React from 'react';
import { YALCS } from 'types/yalcs';
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
  Theme,
  Fab
} from '@material-ui/core';
import {
  Close as CloseIcon,
  Chat as ChatIcon,
  Send as SendIcon
} from '@material-ui/icons';

const styles = (theme: Theme) =>
  createStyles({
    sendMessage: {
      alignItems: 'center',
      display: 'flex',
      margin: theme.spacing.unit
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
      position: 'fixed',
      bottom: '1em',
      zIndex: 1
    }
  });

interface ChatState extends YALCS.LocalStore {
  show: boolean;
  text: string;
}

class _Chat extends React.Component<WithStyles<typeof styles>, ChatState> {
  state: ChatState = {
    messages: [],
    show: false,
    text: ''
  };

  componentDidMount() {
    const data: YALCS.LocalStore =
      localStorage.getItem('yalcs') !== undefined
        ? JSON.parse(localStorage.getItem('yalcs'))
        : {};
    this.setState(data);
  }

  onClose() {
    this.setState({ show: false });
  }

  onOpen() {
    this.setState({ show: true });
  }

  onSend() {}

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
        <div className={classes.messages}>
          {messages.map(msg => (
            <div key={msg.ts}>{msg.text}</div>
          ))}
        </div>
        <Divider />
        <div className={classes.sendMessage}>
          <TextField
            id="message-text"
            type="text"
            value={text}
            margin="normal"
            onChange={e => this.setState({ text: e.target.value })}
            fullWidth
            multiline
          />
          <IconButton onClick={() => this.onSend()} aria-label="Send message">
            <SendIcon />
          </IconButton>
        </div>
      </div>
    ) : (
      <Fab
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
