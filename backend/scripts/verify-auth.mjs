/**
 * Phase 2 auth verification script.
 * Run with backend server and Firestore (emulator or cloud) available.
 *
 * Usage:
 *   node backend/scripts/verify-auth.mjs
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

const unique = Date.now();
const testUser = {
  email: `verify.student.${unique}@campus.test`,
  password: 'TestPass123!',
  displayName: 'Verify Student',
  role: 'student',
  branch: 'computer_engineering',
  semester: 5,
  division: 'D1',
  batch: 'A1',
  rollNumber: `ROLL-${unique}`,
};

const REQUEST_TIMEOUT_MS = 15000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: controller.signal,
    ...options,
  }).finally(() => clearTimeout(timeout));

  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

async function run() {
  console.log('Verifying Phase 2 authentication...\n');

  const healthUrl = (process.env.API_BASE_URL || 'http://localhost:5000').replace(/\/api\/v1$/, '');
  const health = await fetch(`${healthUrl}/health`).catch(() => null);
  if (!health?.ok) {
    console.error('Cannot reach API. Start the backend: npm run dev:backend');
    process.exit(1);
  }
  console.log('✓ Health check');

  const register = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });

  if (register.status !== 201) {
    console.error('Register failed:', register.status, register.body);
    process.exit(1);
  }
  console.log('✓ Register');

  const token = register.body?.data?.token;
  if (!token) {
    console.error('Register response missing token');
    process.exit(1);
  }

  const me = await request('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (me.status !== 200) {
    console.error('Protected /auth/me failed:', me.status, me.body);
    process.exit(1);
  }
  console.log('✓ Protected /auth/me');

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });

  if (login.status !== 200) {
    console.error('Login failed:', login.status, login.body);
    process.exit(1);
  }
  console.log('✓ Login');

  const verify = await request('/auth/verify', {
    method: 'GET',
    headers: { Authorization: `Bearer ${login.body?.data?.token || token}` },
  });

  if (verify.status !== 200) {
    console.error('Token verify failed:', verify.status, verify.body);
    process.exit(1);
  }
  console.log('✓ Token verify');

  console.log('\nPhase 2 authentication verification passed.');
}

run().catch((error) => {
  console.error('Verification error:', error.message);
  process.exit(1);
});
