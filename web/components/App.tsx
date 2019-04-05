import * as React from 'react';
import { YALCS } from 'types/yalcs';
import { Chat } from 'components/Chat';
import { hot } from 'react-hot-loader/root';
import {
  MuiThemeProvider,
  createMuiTheme,
  CssBaseline
} from '@material-ui/core';

declare global {
  namespace NodeJS {
    interface Process {
      enve: YALCS.Env.Web;
    }
  }
}

const theme = createMuiTheme(process.enve.THEME);

const _App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Chat />
  </MuiThemeProvider>
);

export const App = hot(_App);
