const args = new Set(process.argv.slice(2));

if (args.has('--emulator')) {
  process.env.FIREBASE_USE_EMULATOR = 'true';
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:18080';
  process.env.FIREBASE_PROJECT_ID ||= 'campus-knowledge-agent-dev';
}

process.env.AI_ENGINE_URL ||= 'http://127.0.0.1:65535';
process.env.AI_ENGINE_TIMEOUT = '1000';

const REQUEST_TIMEOUT_MS = 10000;

const request = async (baseUrl, path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const { headers = {}, ...fetchOptions } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
};

const assertOk = (label, result, predicate = null) => {
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`${label} failed with ${result.status}: ${JSON.stringify(result.body)}`);
  }
  if (predicate && !predicate(result.body)) {
    throw new Error(`${label} returned an unexpected payload: ${JSON.stringify(result.body)}`);
  }
  console.log(`OK ${label}`);
};

const main = async () => {
  if (args.has('--seed')) {
    const { configureSeedEnvironment, seedFirestore } = await import('../../firebase/seeders/seed-firestore.mjs');
    configureSeedEnvironment({ useEmulator: args.has('--emulator') });
    await seedFirestore({ reset: args.has('--reset') });
  }

  const { initializeFirebase } = await import('../src/configs/firebase.js');
  await initializeFirebase();

  const { default: app } = await import('../src/app.js');
  const server = await new Promise((resolve, reject) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
    instance.on('error', reject);
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const login = await request(baseUrl, '/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ce2603d101@student.nexuscampus.edu',
        password: 'Campus@12345',
      }),
    });
    assertOk('auth login', login, (body) => Boolean(body.data?.token));

    const token = login.body.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    const checks = [
      ['GET timetable', '/api/v1/timetable?day=monday', (body) => Array.isArray(body.data)],
      ['GET notices', '/api/v1/notices?limit=5', (body) => Array.isArray(body.data)],
      ['GET events', '/api/v1/events?upcoming=false&limit=5', (body) => Array.isArray(body.data)],
      ['GET faculty', '/api/v1/faculty?limit=5', (body) => Array.isArray(body.data)],
      ['GET faq', '/api/v1/faq?limit=5', (body) => Array.isArray(body.data)],
      ['GET notifications', '/api/v1/notifications?limit=5', (body) => Array.isArray(body.data)],
    ];

    for (const [label, path, predicate] of checks) {
      const result = await request(baseUrl, path, { headers: authHeaders });
      assertOk(label, result, predicate);
    }

    const notifications = await request(baseUrl, '/api/v1/notifications?limit=1', { headers: authHeaders });
    const notificationId = notifications.body.data?.[0]?.id;
    if (notificationId) {
      const markRead = await request(baseUrl, `/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      assertOk('PATCH notification read', markRead, (body) =>
        body.data?.notification?.readBy?.includes(login.body.data.user.id)
      );
    }

    const chat = await request(baseUrl, '/api/v1/chat/query', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ query: 'What is my timetable today?' }),
    });
    assertOk('POST versioned chat query', chat, (body) =>
      Boolean(body.success && body.intent && body.response && body.metadata?.processing_time_ms >= 0)
    );

    const chatAlias = await request(baseUrl, '/api/chat/query', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ query: 'Show me latest notices' }),
    });
    assertOk('POST /api/chat/query alias', chatAlias, (body) => Boolean(body.success && body.response));

    const intentTest = await request(baseUrl, '/api/ai/test/intent', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ query: 'Who is my mentor faculty?' }),
    });
    assertOk('POST /api/ai/test/intent', intentTest, (body) =>
      Boolean(body.predicted_intent && body.processing_time_ms >= 0)
    );

    console.log('\nPhase 4 API verification passed.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

main().catch((error) => {
  console.error('Phase 4 API verification failed:', error.message);
  process.exit(1);
});
