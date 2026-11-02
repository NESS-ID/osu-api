class OsuApi {
  constructor(options = {}) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.accessToken = options.accessToken || null;
    this.expiresAt = options.expiresAt || 0;
    this.baseUrl = options.baseUrl || 'https://osu.ppy.sh/api/v2';
    this.tokenUrl = options.tokenUrl || 'https://osu.ppy.sh/oauth/token';
  }

  // ponytail: client_credentials only; add authorization_code flow if user delegation needed.
  async getToken() {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }
    if (!this.clientId || !this.clientSecret) {
      throw new Error('clientId and clientSecret are required to get access token');
    }

    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: Number(this.clientId),
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        scope: 'public'
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`osu! token request failed (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    this.accessToken = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  // ponytail: simple fetch wrapper; add custom interceptors/backoff if rate limits hit.
  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);

    if (options.query) {
      for (const [key, val] of Object.entries(options.query)) {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      }
    }

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`osu! API error (${res.status} ${res.statusText}): ${errText}`);
    }

    return res.json();
  }

  getUser(user, mode, params) {
    const path = `/users/${encodeURIComponent(user)}${mode ? `/${mode}` : ''}`;
    return this.request(path, { query: params });
  }

  getUserScores(userId, type = 'best', params) {
    return this.request(`/users/${encodeURIComponent(userId)}/scores/${type}`, { query: params });
  }

  getUserBeatmaps(userId, type = 'ranked', params) {
    return this.request(`/users/${encodeURIComponent(userId)}/beatmapsets/${type}`, { query: params });
  }

  getBeatmap(beatmapId) {
    return this.request(`/beatmaps/${encodeURIComponent(beatmapId)}`);
  }

  getBeatmapScores(beatmapId, params) {
    return this.request(`/beatmaps/${encodeURIComponent(beatmapId)}/scores`, { query: params });
  }

  getBeatmapset(beatmapsetId) {
    return this.request(`/beatmapsets/${encodeURIComponent(beatmapsetId)}`);
  }

  searchBeatmaps(params) {
    return this.request('/beatmapsets/search', { query: params });
  }

  getRanking(mode, type, params) {
    return this.request(`/rankings/${mode}/${type}`, { query: params });
  }
}

module.exports = OsuApi;
module.exports.OsuApi = OsuApi;
module.exports.default = OsuApi;
