import { Router } from 'express';
import * as c from './controllers';

export const router = Router();

router.post('/slack', c.api_slackListener);
router.get('/messages', c.api_getMessages);
router.post('/messages', c.api_sendMessages);
