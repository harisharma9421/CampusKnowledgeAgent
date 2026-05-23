import axios from 'axios';
import env from '../configs/env.js';
import logger from '../utils/logger.js';

const client = axios.create({
  baseURL: env.AI_ENGINE_URL,
  timeout: env.AI_ENGINE_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const unwrapAiResponse = (response) => response.data?.data || response.data || {};

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const isRetryableAiError = (error) => {
  if (!error.response) {
    return true;
  }
  return error.response.status >= 500 || error.response.status === 429;
};

const requestWithRetry = async (operation) => {
  let lastError = null;

  for (let attempt = 0; attempt <= env.AI_ENGINE_RETRIES; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= env.AI_ENGINE_RETRIES || !isRetryableAiError(error)) {
        throw error;
      }
      await sleep(env.AI_ENGINE_RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw lastError;
};

const keywordIntentRules = [
  {
    intent: 'schedule_update',
    confidence: 0.7,
    keywords: ['update', 'changed', 'cancelled', 'rescheduled', 'notification'],
  },
  {
    intent: 'timetable_query',
    confidence: 0.74,
    keywords: ['timetable', 'lecture', 'class', 'period', 'today', 'tomorrow'],
  },
  {
    intent: 'notice_query',
    confidence: 0.72,
    keywords: ['notice', 'announcement', 'circular', 'exam schedule', 'deadline'],
  },
  {
    intent: 'event_query',
    confidence: 0.72,
    keywords: ['event', 'workshop', 'seminar', 'meet', 'symposium', 'registration'],
  },
  {
    intent: 'faculty_query',
    confidence: 0.71,
    keywords: ['faculty', 'teacher', 'professor', 'mentor', 'contact', 'office'],
  },
  {
    intent: 'faq_query',
    confidence: 0.68,
    keywords: ['how', 'where', 'what', 'who', 'help', 'faq'],
  },
];

const classifyWithKeywords = (query) => {
  const normalized = query.toLowerCase();
  const match = keywordIntentRules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (!match) {
    return {
      intent: 'faq_query',
      confidence: 0.55,
      provider: 'backend_keyword_fallback',
      status: 'fallback',
    };
  }

  return {
    intent: match.intent,
    confidence: match.confidence,
    provider: 'backend_keyword_fallback',
    status: 'fallback',
  };
};

export const classifyIntent = async (query, user) => {
  const startedAt = Date.now();

  try {
    const response = await requestWithRetry(() => client.post('/infer/classify', {
      query,
      user_id: user.id,
      context: {
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        division: user.division,
        batch: user.batch,
      },
    }));

    const data = unwrapAiResponse(response);
    const intent = data.predicted_intent || data.intent || 'unknown';
    const confidence = Number(data.confidence || 0);

    if (intent !== 'unknown' && confidence > 0) {
      return {
        intent,
        confidence,
        allIntents: data.all_intents || [],
        model: data.model,
        modelStatus: data.model_status,
        fallbackReason: data.fallback_reason,
        provider: 'ai_engine',
        status: 'ok',
        processingTimeMs: Date.now() - startedAt,
      };
    }

    return {
      ...classifyWithKeywords(query),
      aiIntent: intent,
      aiConfidence: confidence,
      processingTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    logger.warn(`[AI] Intent classification unavailable: ${error.message}`);
    return {
      ...classifyWithKeywords(query),
      aiError: error.message,
      processingTimeMs: Date.now() - startedAt,
    };
  }
};

export const generateEmbeddings = async (texts) => {
  const startedAt = Date.now();

  try {
    const response = await requestWithRetry(() => client.post('/embed/generate', {
      texts: Array.isArray(texts) ? texts : [texts],
    }));
    const data = unwrapAiResponse(response);
    return {
      ...data,
      provider: 'ai_engine',
      status: 'ok',
      processingTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    logger.warn(`[AI] Embedding generation unavailable: ${error.message}`);
    return {
      embeddings: [],
      provider: 'ai_engine',
      status: 'error',
      error: error.message,
      processingTimeMs: Date.now() - startedAt,
    };
  }
};

export const getHealth = async () => {
  const startedAt = Date.now();

  try {
    const response = await requestWithRetry(() => client.get('/health'));
    return {
      ...unwrapAiResponse(response),
      provider: 'ai_engine',
      status: 'ok',
      processingTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    logger.warn(`[AI] Health check unavailable: ${error.message}`);
    return {
      provider: 'ai_engine',
      status: 'error',
      error: error.message,
      processingTimeMs: Date.now() - startedAt,
    };
  }
};

export const semanticSearch = async ({
  query,
  topK = 5,
  collection = null,
  documents = [],
  namespace = 'default',
  threshold,
}) => {
  const startedAt = Date.now();

  try {
    const response = await requestWithRetry(() => client.post('/embed/search', {
      query,
      top_k: topK,
      collection,
      documents,
      namespace,
      threshold,
    }));
    const data = unwrapAiResponse(response);
    return {
      results: data.results || [],
      diagnostics: {
        topK: data.top_k,
        threshold: data.threshold,
        accepted: data.accepted,
        embeddingDimension: data.embedding_dimension,
        documentCount: data.document_count,
        indexPath: data.index_path,
        processingTimeMs: data.processing_time_ms,
      },
      provider: 'ai_engine',
      status: 'ok',
      processingTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    logger.warn(`[AI] Semantic search unavailable: ${error.message}`);
    return {
      results: [],
      provider: 'backend_ranker',
      status: 'fallback',
      error: error.message,
      processingTimeMs: Date.now() - startedAt,
    };
  }
};

export const getFaissHealth = async () => {
  const startedAt = Date.now();

  try {
    const response = await requestWithRetry(() => client.get('/embed/faiss-health'));
    return {
      ...unwrapAiResponse(response),
      provider: 'ai_engine',
      status: 'ok',
      processingTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    logger.warn(`[AI] FAISS health unavailable: ${error.message}`);
    return {
      provider: 'ai_engine',
      status: 'error',
      error: error.message,
      processingTimeMs: Date.now() - startedAt,
    };
  }
};

export const enhanceWithGemini = async ({ query, intent, draftResponse, context }) => {
  const startedAt = Date.now();

  try {
    const response = await requestWithRetry(() => client.post('/gemini/enhance', {
      query,
      intent,
      draft_response: draftResponse,
      context,
      instruction:
        'Improve readability only. Do not add facts, dates, names, rooms, subjects, or notices not present in context.',
    }));
    const data = unwrapAiResponse(response);
    const status = data.status || (data.response || data.enhanced_response ? 'ok' : 'empty');
    return {
      response: data.response || data.enhanced_response || null,
      prompt: data.prompt,
      provider: data.provider || 'vertex_ai_gemini',
      model: data.model,
      status,
      fallbackReason: data.fallback_reason,
      validationError: data.validation_error,
      geminiProcessingTimeMs: data.processing_time_ms,
      processingTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      response: null,
      provider: 'backend_formatter',
      status: 'fallback',
      error: error.message,
      processingTimeMs: Date.now() - startedAt,
    };
  }
};

export default {
  classifyIntent,
  generateEmbeddings,
  getHealth,
  semanticSearch,
  getFaissHealth,
  enhanceWithGemini,
};
