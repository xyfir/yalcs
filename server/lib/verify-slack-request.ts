import timingSafeCompare from 'tsscmp';
import { createHmac } from 'crypto';

// Based on https://github.com/slackapi/node-slack-events-api/blob/master/src/http-handler.js
export function verifySlackRequest(
  signature: string,
  timestamp: number,
  body: any
): void {
  if (timestamp < Math.floor(Date.now() / 1000) - 60 * 5)
    throw new Error('Slack request signing verification outdated');

  const hmac = createHmac('sha256', process.enve.SLACK_SIGNING_SECRET);
  const [version, hash] = signature.split('=');
  hmac.update(`${version}:${timestamp}:${JSON.stringify(body)}`);

  if (!timingSafeCompare(hash, hmac.digest('hex')))
    throw new Error('Slack request signing verification failed');
}
