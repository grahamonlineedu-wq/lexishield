const { once } = require('node:events');
const { spawn } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');

function startServer() {
  const child = spawn(process.execPath, ['index.js'], {
    env: {
      ...process.env,
      PORT: '3456',
      API_SECRET_KEY: 'test-secret-key',
      GROQ_API_KEY: 'test-groq-key'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  return child;
}

test('GET /health returns ok', async () => {
  const child = startServer();

  try {
    await once(child.stdout, 'data');
    const response = await fetch('http://127.0.0.1:3456/health');
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
  } finally {
    child.kill('SIGTERM');
  }
});

test('POST /api/v1/analyze requires Authorization header', async () => {
  const child = startServer();

  try {
    await once(child.stdout, 'data');
    const response = await fetch('http://127.0.0.1:3456/api/v1/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText: 'This is a test contract for authentication checks.' })
    });

    const body = await response.json();
    assert.equal(response.status, 401);
    assert.match(body.error, /Unauthorized/i);
  } finally {
    child.kill('SIGTERM');
  }
});

test('POST /api/v1/analyze accepts valid bearer token but fails gracefully when AI config is missing', async () => {
  const child = spawn(process.execPath, ['index.js'], {
    env: {
      ...process.env,
      PORT: '3457',
      API_SECRET_KEY: 'test-secret-key',
      GROQ_API_KEY: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await once(child.stdout, 'data');
    const response = await fetch('http://127.0.0.1:3457/api/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-secret-key'
      },
      body: JSON.stringify({ documentText: 'This is a long enough document to pass validation and test the auth path before the AI backend is reached.' })
    });

    const body = await response.json();
    assert.equal(response.status, 503);
    assert.match(body.error, /not configured/i);
  } finally {
    child.kill('SIGTERM');
  }
});
