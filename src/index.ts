import type {
  BeatmapsetType,
  GameMode,
  OAuthTokenResponse,
  OsuApiOptions,
  RankingType,
  RequestOptions,
  ScoreType,
  V1RequestOptions
} from './types';

export * from './types';

export class OsuApi {
  clientId?: number | string;
  clientSecret?: string;
  apiKey?: string;
  accessToken: string | null;
  expiresAt: number;
  baseUrl: string;
  tokenUrl: string;
  v1BaseUrl: string;
  readonly v1: OsuApiV1;
  readonly v2: OsuApiV2;
  private readonly fetchFn: typeof fetch;

  constructor(options: OsuApiOptions = {}) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.apiKey = options.apiKey;
    this.accessToken = options.accessToken || null;
    this.expiresAt = options.expiresAt || 0;
    this.baseUrl = options.baseUrl || 'https://osu.ppy.sh/api/v2';
    this.tokenUrl = options.tokenUrl || 'https://osu.ppy.sh/oauth/token';
    this.v1BaseUrl = options.v1BaseUrl || 'https://osu.ppy.sh/api';
    this.fetchFn = options.fetch || globalThis.fetch;
    this.v1 = new OsuApiV1(this);
    this.v2 = new OsuApiV2(this);
  }

  async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }
    if (this.clientId === undefined || !this.clientSecret) {
      throw new Error('clientId and clientSecret are required to get an osu! API v2 token');
    }

    const res = await this.fetchFn(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: Number(this.clientId),
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        scope: 'public'
      })
    });

    if (!res.ok) {
      throw new Error(`osu! token request failed (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as OAuthTokenResponse;
    if (!data.access_token || !Number.isFinite(data.expires_in)) {
      throw new Error('osu! token response is missing access_token or expires_in');
    }
    this.accessToken = data.access_token;
    this.expiresAt = Date.now() + Math.max(0, data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = await this.getToken();
    const url = new URL(
      endpoint.startsWith('http')
        ? endpoint
        : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
    );
    appendQuery(url, options.query);

    const res = await this.fetchFn(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal
    });

    return parseResponse<T>(res, 'osu! API v2');
  }

  async requestV1<T = unknown>(
    endpoint: string,
    options: V1RequestOptions = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('apiKey is required to use the osu! API v1');
    }
    if (!/^[a-z_]+$/.test(endpoint)) {
      throw new Error('API v1 endpoint must contain only lowercase letters and underscores');
    }

    const url = new URL(`${this.v1BaseUrl}/${endpoint}`);
    appendQuery(url, options.query);
    url.searchParams.set('k', this.apiKey);

    const res = await this.fetchFn(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...options.headers
      },
      signal: options.signal
    });

    return parseResponse<T>(res, 'osu! API v1');
  }

  getUser<T = unknown>(
    user: string | number,
    mode?: GameMode,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.v2.getUser<T>(user, mode, params);
  }

  getUserScores<T = unknown>(
    userId: string | number,
    type: ScoreType = 'best',
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.v2.getUserScores<T>(userId, type, params);
  }

  getUserBeatmaps<T = unknown>(
    userId: string | number,
    type: BeatmapsetType = 'ranked',
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.v2.getUserBeatmaps<T>(userId, type, params);
  }

  getBeatmap<T = unknown>(beatmapId: string | number): Promise<T> {
    return this.v2.getBeatmap<T>(beatmapId);
  }

  getBeatmapScores<T = unknown>(
    beatmapId: string | number,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.v2.getBeatmapScores<T>(beatmapId, params);
  }

  getBeatmapset<T = unknown>(beatmapsetId: string | number): Promise<T> {
    return this.v2.getBeatmapset<T>(beatmapsetId);
  }

  searchBeatmaps<T = unknown>(params?: Record<string, unknown>): Promise<T> {
    return this.v2.searchBeatmaps<T>(params);
  }

  getRanking<T = unknown>(
    mode: GameMode,
    type: RankingType,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.v2.getRanking<T>(mode, type, params);
  }
}

export class OsuApiV1 {
  constructor(private readonly client: OsuApi) {}

  request<T = unknown>(endpoint: string, options?: V1RequestOptions): Promise<T> {
    return this.client.requestV1<T>(endpoint, options);
  }

  getBeatmaps<T = unknown>(params: Record<string, unknown> = {}): Promise<T> {
    return this.request<T>('get_beatmaps', { query: params });
  }

  getUser<T = unknown>(
    user: string | number,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    return this.request<T>('get_user', { query: { ...params, u: user } });
  }

  getScores<T = unknown>(
    beatmapId: string | number,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    return this.request<T>('get_scores', { query: { ...params, b: beatmapId } });
  }

  getUserBest<T = unknown>(
    user: string | number,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    return this.request<T>('get_user_best', { query: { ...params, u: user } });
  }

  getUserRecent<T = unknown>(
    user: string | number,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    return this.request<T>('get_user_recent', { query: { ...params, u: user } });
  }

  getReplay<T = unknown>(
    beatmapId: string | number,
    user: string | number,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    return this.request<T>('get_replay', {
      query: { ...params, b: beatmapId, u: user }
    });
  }
}

export class OsuApiV2 {
  constructor(private readonly client: OsuApi) {}

  request<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.client.request<T>(endpoint, options);
  }

  getUser<T = unknown>(
    user: string | number,
    mode?: GameMode,
    params?: Record<string, unknown>
  ): Promise<T> {
    const path = `/users/${encodeURIComponent(user)}${mode ? `/${mode}` : ''}`;
    return this.request<T>(path, { query: params });
  }

  getUserScores<T = unknown>(
    userId: string | number,
    type: ScoreType = 'best',
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(`/users/${encodeURIComponent(userId)}/scores/${type}`, {
      query: params
    });
  }

  getUserBeatmaps<T = unknown>(
    userId: string | number,
    type: BeatmapsetType = 'ranked',
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(`/users/${encodeURIComponent(userId)}/beatmapsets/${type}`, {
      query: params
    });
  }

  getBeatmap<T = unknown>(beatmapId: string | number): Promise<T> {
    return this.request<T>(`/beatmaps/${encodeURIComponent(beatmapId)}`);
  }

  getBeatmapScores<T = unknown>(
    beatmapId: string | number,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(`/beatmaps/${encodeURIComponent(beatmapId)}/scores`, {
      query: params
    });
  }

  getBeatmapset<T = unknown>(beatmapsetId: string | number): Promise<T> {
    return this.request<T>(`/beatmapsets/${encodeURIComponent(beatmapsetId)}`);
  }

  searchBeatmaps<T = unknown>(params?: Record<string, unknown>): Promise<T> {
    return this.request<T>('/beatmapsets/search', { query: params });
  }

  getRanking<T = unknown>(
    mode: GameMode,
    type: RankingType,
    params?: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(`/rankings/${mode}/${type}`, { query: params });
  }
}

function appendQuery(url: URL, query?: Record<string, unknown>): void {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
}

async function parseResponse<T>(res: Response, apiName: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`${apiName} error (${res.status} ${res.statusText}): ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export default OsuApi;

module.exports = Object.assign(OsuApi, {
  OsuApi,
  OsuApiV1,
  OsuApiV2,
  default: OsuApi
});
