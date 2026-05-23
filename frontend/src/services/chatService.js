import apiClient from './apiClient.js';

export const sendChatQuery = async (query, sessionId = null) => {
  const response = await apiClient.post('/chat/query', {
    query,
    ...(sessionId ? { sessionId } : {}),
  });
  return response.data;
};

export default { sendChatQuery };
