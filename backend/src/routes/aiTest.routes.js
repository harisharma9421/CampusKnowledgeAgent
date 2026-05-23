import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  chatQuerySchema,
  embeddingTestSchema,
  geminiTestSchema,
  semanticSearchTestSchema,
} from '../validators/academic.validator.js';
import {
  testEmbedding,
  testFaissHealth,
  testGemini,
  testHealth,
  testIntent,
  testPipeline,
  testSemanticSearch,
} from '../controllers/aiTest.controller.js';

const router = Router();

router.get('/test/health', authenticate, testHealth);
router.get('/test/faiss-health', authenticate, testFaissHealth);
router.post('/test/intent', authenticate, validateBody(chatQuerySchema), testIntent);
router.post('/test/embedding', authenticate, validateBody(embeddingTestSchema), testEmbedding);
router.post('/test/semantic-search', authenticate, validateBody(semanticSearchTestSchema), testSemanticSearch);
router.post('/test/gemini', authenticate, validateBody(geminiTestSchema), testGemini);
router.post('/test/pipeline', authenticate, validateBody(chatQuerySchema), testPipeline);

export default router;
