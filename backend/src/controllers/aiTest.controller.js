import asyncHandler from '../utils/asyncHandler.js';
import * as aiClient from '../services/aiClient.service.js';

export const testIntent = asyncHandler(async (req, res) => {
  const result = await aiClient.classifyIntent(req.body.query, req.user);

  return res.status(200).json({
    query: req.body.query,
    predicted_intent: result.intent,
    confidence: result.confidence,
    processing_time_ms: result.processingTimeMs,
    provider: result.provider,
    status: result.status,
  });
});

export default { testIntent };
