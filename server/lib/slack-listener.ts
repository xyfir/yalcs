import { verifySlackRequest } from 'lib/verify-slack-request';

export async function slackListener(
  event: {
    challenge?: string;
    token: string;
    type: 'url_verification';
  },
  signature: string,
  timestamp: number
): Promise<any> {
  verifySlackRequest(signature, timestamp, event);

  if (event.type == 'url_verification') return event.challenge;
}
