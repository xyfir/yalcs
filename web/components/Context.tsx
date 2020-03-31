import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme =>
  createStyles({
    context: {
      color: "rgba(0,0,0,0.6)",
      padding: '5px',
      wordWrap: 'anywhere'
    }
  })
);

type ContextProps = {
  name: string;
  firstname: string;
  email: string;
};

export function Context({ name, firstname, email }: ContextProps) {
  const classes = useStyles();

  return (<div className={`${classes.context}`}>
      Bonjour {firstname} {name} ({email}).<br/>
      Posez votre question.
    </div>);
}
