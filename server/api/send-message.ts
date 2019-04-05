import { NextFunction, Response, Request } from 'express';
import { sendMessage } from 'lib/send-message';

export function api_sendMessages(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  sendMessage(req.body, req.ip)
    .then(data => res.status(200).json(data))
    .catch(next);
}
