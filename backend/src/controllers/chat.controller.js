import asyncHandler from '../utils/asyncHandler.js';
import * as chatService from '../services/chat.service.js';

export const queryChat = asyncHandler(async (req, res) => {
  const payload = await chatService.processChatQuery({
    query: req.body.query,
    user: req.user,
    sessionId: req.body.sessionId,
  });

  return res.status(200).json(payload);
});

export default { queryChat };
