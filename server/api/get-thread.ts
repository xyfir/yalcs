import { NextFunction, Response, Request } from 'express';
import { getThread } from 'lib/get-thread';

export function api_getThread(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.setTimeout(60 * 60 * 1000, () => null);
  getThread(req.query)
    .then(thread => res.status(200).json(thread))
    .catch(next);
}
