import { createStyles, makeStyles, Fab } from '@material-ui/core';
import React from 'react';
import {
  NotificationImportant as NotificationImportantIcon,
  Chat as ChatIcon
} from '@material-ui/icons';

const { UNREAD_MESSAGES_FAB_TEXT, FAB_TEXT, FAB_ICON_ONLY } = process.enve;

const useStyles = makeStyles(theme =>
  createStyles({
    hiddenFab: {
      transform: 'translate(0, 150%)'
    },
    fabIcon: {
      marginRight: FAB_ICON_ONLY ? '0' : theme.spacing()
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

type ChatButtonProps = {
  onOpen: () => void;
  alert: boolean;
  show: boolean;
};

export function ChatButton({ onOpen, alert, show }: ChatButtonProps) {
  const classes = useStyles();

  return alert ? (
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
      {FAB_ICON_ONLY ? '' : FAB_TEXT}
    </Fab>
  );
}
