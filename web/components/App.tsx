import * as React from 'react';
import { Chat } from 'components/Chat';
import { hot } from 'react-hot-loader/root';
import {
  MuiThemeProvider,
  createMuiTheme,
  CssBaseline
} from '@material-ui/core';

const theme = createMuiTheme(process.enve.THEME);

const _App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Chat />
  </MuiThemeProvider>
);

export const App = hot(_App);
