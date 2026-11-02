export interface OsuApiOptions {
  clientId?: number | string;
  clientSecret?: string;
  accessToken?: string;
  expiresAt?: number;
  baseUrl?: string;
  tokenUrl?: string;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
}

export class OsuApi {
  constructor(options?: OsuApiOptions);
  clientId?: number | string;
  clientSecret?: string;
  accessToken: string | null;
  expiresAt: number;
  baseUrl: string;
  tokenUrl: string;

  getToken(): Promise<string>;
  request<T = any>(endpoint: string, options?: RequestOptions): Promise<T>;
  getUser<T = any>(user: string | number, mode?: string, params?: Record<string, any>): Promise<T>;
  getUserScores<T = any>(userId: string | number, type?: 'best' | 'firsts' | 'recent' | 'pinned', params?: Record<string, any>): Promise<T>;
  getUserBeatmaps<T = any>(userId: string | number, type?: 'favourite' | 'graveyard' | 'loved' | 'most_played' | 'pending' | 'ranked', params?: Record<string, any>): Promise<T>;
  getBeatmap<T = any>(beatmapId: string | number): Promise<T>;
  getBeatmapScores<T = any>(beatmapId: string | number, params?: Record<string, any>): Promise<T>;
  getBeatmapset<T = any>(beatmapsetId: string | number): Promise<T>;
  searchBeatmaps<T = any>(params?: Record<string, any>): Promise<T>;
  getRanking<T = any>(mode: string, type: string, params?: Record<string, any>): Promise<T>;
}

export default OsuApi;
