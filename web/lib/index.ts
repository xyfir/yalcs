import * as React from 'react';
import { render } from 'react-dom';
import { Yalcs } from 'types/yalcs';
import { App } from 'components/App';
import 'typeface-roboto';

declare global {
  namespace NodeJS {
    interface Process {
      enve: Yalcs.Env.Web;
    }
  }
}

render(React.createElement(App), document.getElementById('content'));
