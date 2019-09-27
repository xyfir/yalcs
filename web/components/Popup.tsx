import { Yalcs } from 'types/yalcs';
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
  Paper
} from '@material-ui/core';
import {
  ChatOutlined as ChatOutlinedIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@material-ui/icons';

const { MESSAGE_PLACEHOLDER_TEXT, TITLE_TEXT } = process.enve;

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
    messages: {
      overflow: 'auto',
      flex: 1
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
    }
  })
);

type ChatPopupProps = {
  messages: Yalcs.Message[];
  setText: (text: string) => void;
  onClose: () => void;
  onSend: () => void;
  text: string;
};

export function ChatPopup({
  messages,
  setText,
  onClose,
  onSend,
  text
}: ChatPopupProps) {
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

  // Scroll to anchor element (bottom of message list)
  React.useEffect(() => {
    if (messages.length) anchor.current!.scrollIntoView();
  }, [messages.length]);

  return (
    <Paper elevation={1} className={classes.chat}>
      <AppBar
        position="static"
        elevation={0}
        classes={{ root: classes.appBar }}
        square={false}
      >
        <Toolbar>
          <Typography color="inherit" variant="h6" className={classes.title}>
            {TITLE_TEXT}
          </Typography>
          <IconButton color="inherit" onClick={onClose} aria-label="Close chat">
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
                msg.outgoing ? classes.outgoingMessage : classes.incomingMessage
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
        <IconButton color="primary" onClick={onSend} aria-label="Send message">
          <SendIcon />
        </IconButton>
      </div>
    </Paper>
  );
}
