import { NextFunction, Response, Request } from 'express';
import { getMessages } from 'lib/get-messages';

export function api_getMessages(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.setTimeout(60 * 60 * 1000, () => null);
  getMessages(req.query)
    .then(messages => res.status(200).json(messages))
    .catch(next);
}
