import { createMuiTheme, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { Chat } from 'components/Chat';
import { hot } from 'react-hot-loader/root';
import React from 'react';

const theme = createMuiTheme(process.enve.THEME);

const _App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Chat />
  </ThemeProvider>
);

export const App = hot(_App);
