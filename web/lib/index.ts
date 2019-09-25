import { render } from 'react-dom';
import { Yalcs } from 'types/yalcs';
import { App } from 'components/App';
import React from 'react';
import 'typeface-roboto';

declare global {
  namespace NodeJS {
    interface Process {
      enve: Yalcs.Env.Web;
    }
  }
}

render(React.createElement(App), document.getElementById('content'));
