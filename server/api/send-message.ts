import { NextFunction, Response, Request } from 'express';
import { sendMessage } from 'lib/send-message';

export function api_sendMessages(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let ip: string;
  if(process.enve.TRUST_PROXY && req.ips.length > 0) {
    ip = req.ips[0];
  } else {
    ip = req.ip;
  }
  sendMessage({ ...req.body, ip })
    .then(data => res.status(200).json(data))
    .catch(next);
}
