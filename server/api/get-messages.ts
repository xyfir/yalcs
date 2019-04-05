import { NextFunction, Response, Request } from 'express';
import { getMessages } from 'lib/get-messages';

export function api_getMessages(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  getMessages(req.query)
    .then(messages => res.status(200).json(messages))
    .catch(next);
}
