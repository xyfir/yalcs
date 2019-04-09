import { NextFunction, Response, Request } from 'express';
import { getThread } from 'lib/get-thread';

export function api_getThread(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  getThread(req.query.thread_ts)
    .then(thread => res.status(200).json(thread))
    .catch(next);
}
