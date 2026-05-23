import asyncHandler from '../utils/asyncHandler.js';
import * as aiClient from '../services/aiClient.service.js';
import * as academicService from '../services/academic.service.js';
import { flattenAcademicContext, toSemanticDocuments } from '../services/semanticRetrieval.service.js';

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

const buildSemanticCorpus = async (user) => {
  const context = await academicService.getAcademicContextForUser(user);
  const documents = flattenAcademicContext(context);
  return {
    context,
    documents,
    semanticDocuments: toSemanticDocuments(documents),
  };
};

export const testEmbedding = asyncHandler(async (req, res) => {
  const texts = req.body.texts || [req.body.text || req.body.query];
  const result = await aiClient.generateEmbeddings(texts);

  return res.status(result.status === 'ok' ? 200 : 503).json({
    query: req.body.query,
    texts_count: result.texts_count || texts.length,
    dimensions: result.dimensions,
    embeddings: result.embeddings,
    processing_time_ms: result.processingTimeMs,
    provider: result.provider,
    status: result.status,
    error: result.error,
  });
});

export const testSemanticSearch = asyncHandler(async (req, res) => {
  const corpus = await buildSemanticCorpus(req.user);
  const result = await aiClient.semanticSearch({
    query: req.body.query,
    topK: req.body.topK || req.body.top_k || 5,
    collection: req.body.collection,
    documents: corpus.semanticDocuments,
    namespace: `test:${req.user.id}`,
    threshold: req.body.threshold,
  });

  return res.status(result.status === 'ok' ? 200 : 503).json({
    query: req.body.query,
    results: result.results,
    diagnostics: {
      ...result.diagnostics,
      candidate_count: corpus.documents.length,
      collections: [...new Set(corpus.documents.map((document) => document.collection))],
    },
    processing_time_ms: result.processingTimeMs,
    provider: result.provider,
    status: result.status,
    error: result.error,
  });
});

export const testFaissHealth = asyncHandler(async (_req, res) => {
  const result = await aiClient.getFaissHealth();

  return res.status(result.status === 'ok' ? 200 : 503).json({
    status: result.status,
    provider: result.provider,
    processing_time_ms: result.processingTimeMs,
    error: result.error,
    data: {
      model: result.model,
      model_status: result.model_status,
      embedding_dimension: result.embedding_dimension,
      faiss_index_dir: result.faiss_index_dir,
      persisted_indexes: result.persisted_indexes,
      cached_namespaces: result.cached_namespaces,
      similarity_threshold: result.similarity_threshold,
    },
  });
});

export default { testIntent, testEmbedding, testSemanticSearch, testFaissHealth };
