const test = require('node:test');
const assert = require('node:assert');
const OsuApi = require('./index.js');

test('OsuApi initializes with options', () => {
  const api = new OsuApi({ clientId: 12345, clientSecret: 'secret' });
  assert.strictEqual(api.clientId, 12345);
  assert.strictEqual(api.clientSecret, 'secret');
});

test('OsuApi uses cached accessToken if valid', async () => {
  const api = new OsuApi({ accessToken: 'valid_token', expiresAt: Date.now() + 100000 });
  const token = await api.getToken();
  assert.strictEqual(token, 'valid_token');
});

test('OsuApi getToken requests oauth endpoint and caches', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, opts) => {
      assert.strictEqual(url.toString(), 'https://osu.ppy.sh/oauth/token');
      const body = JSON.parse(opts.body);
      assert.strictEqual(body.client_id, 123);
      assert.strictEqual(body.client_secret, 'abc');
      return {
        ok: true,
        json: async () => ({ access_token: 'mock_token', expires_in: 86400 })
      };
    };

    const api = new OsuApi({ clientId: 123, clientSecret: 'abc' });
    const token = await api.getToken();
    assert.strictEqual(token, 'mock_token');
    assert.strictEqual(api.accessToken, 'mock_token');
    assert.ok(api.expiresAt > Date.now());
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('OsuApi request attaches bearer token and parses query', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, opts) => {
      assert.strictEqual(url.toString(), 'https://osu.ppy.sh/api/v2/users/peppy/osu?key=username');
      assert.strictEqual(opts.headers.Authorization, 'Bearer token_xyz');
      return {
        ok: true,
        json: async () => ({ id: 2, username: 'peppy' })
      };
    };

    const api = new OsuApi({ accessToken: 'token_xyz', expiresAt: Date.now() + 100000 });
    const user = await api.getUser('peppy', 'osu', { key: 'username' });
    assert.strictEqual(user.username, 'peppy');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
