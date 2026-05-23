export const scoreRetrievalQuality = (results = [], threshold = 0.32) => {
  const scores = results.map((result) => Number(result.score || result.similarity || 0));
  const accepted = scores.filter((score) => score >= threshold);
  const bestScore = scores.length ? Math.max(...scores) : 0;

  return {
    result_count: results.length,
    accepted_count: accepted.length,
    best_score: Number(bestScore.toFixed(4)),
    threshold,
    quality:
      bestScore >= 0.7
        ? 'high'
        : bestScore >= threshold
          ? 'acceptable'
          : 'low_confidence',
  };
};

export const summarizeEmbeddingDiagnostics = (result) => ({
  status: result.status,
  provider: result.provider,
  texts_count: result.texts_count,
  dimensions: result.dimensions,
  processing_time_ms: result.processingTimeMs,
  generated: Array.isArray(result.embeddings) ? result.embeddings.length : 0,
});

export const summarizePipelineDiagnostics = (chatResult) => ({
  intent: {
    label: chatResult.intent,
    confidence: chatResult.confidence,
  },
  ai_service: chatResult.metadata?.ai_service,
  gemini: chatResult.metadata?.gemini,
  retrieval: chatResult.metadata?.retrieval,
  pipeline_timing_ms: chatResult.metadata?.processing_time_ms,
});

export const benchmarkAsync = async (label, operation) => {
  const startedAt = Date.now();
  const result = await operation();
  return {
    label,
    result,
    processing_time_ms: Date.now() - startedAt,
  };
};

export default {
  scoreRetrievalQuality,
  summarizeEmbeddingDiagnostics,
  summarizePipelineDiagnostics,
  benchmarkAsync,
};
