import { verifySlackRequest } from 'lib/verify-slack-request';
import { createHmac } from 'crypto';

test('verifySlackRequest()', () => {
  const date = Math.floor(Date.now() / 1000);
  const data = { type: 'event_callback' };

  const hmac = createHmac('sha256', process.enve.SLACK_SIGNING_SECRET);
  hmac.update(`v0:${date}:${JSON.stringify(data)}`);

  verifySlackRequest(`v0=${hmac.digest('hex')}`, date, data);
});
