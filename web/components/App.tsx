import { createMuiTheme, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { Chat } from 'components/Chat';
import React from 'react';

const theme = createMuiTheme(process.enve.THEME);

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Chat />
  </ThemeProvider>
);
