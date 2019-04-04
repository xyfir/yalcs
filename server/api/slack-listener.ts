import { NextFunction, Response, Request } from 'express';
import { slackListener } from 'lib/slack-listener';

export function api_slackListener(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  slackListener(
    req.body,
    req.headers['x-slack-signature'] as string,
    +req.headers['x-slack-request-timestamp']
  )
    .then(response => res.status(200).json(response))
    .catch(next);
}
