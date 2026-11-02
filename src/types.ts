export type GameMode = 'osu' | 'taiko' | 'fruits' | 'mania';

export type ScoreType = 'best' | 'firsts' | 'recent' | 'pinned';

export type BeatmapsetType =
  | 'favourite'
  | 'graveyard'
  | 'loved'
  | 'most_played'
  | 'pending'
  | 'ranked';

export type RankingType = 'charts' | 'country' | 'performance' | 'score';

export interface OsuApiOptions {
  apiKey?: string;
  clientId?: number | string;
  clientSecret?: string;
  accessToken?: string;
  expiresAt?: number;
  baseUrl?: string;
  tokenUrl?: string;
  v1BaseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  signal?: AbortSignal;
}

export interface V1RequestOptions {
  headers?: Record<string, string>;
  query?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
