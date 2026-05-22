import apiClient from './apiClient.js';

export const sendChatQuery = (query, sessionId = null) =>
  apiClient.post('/chat/query', {
    query,
    ...(sessionId ? { sessionId } : {}),
  });

export default { sendChatQuery };
