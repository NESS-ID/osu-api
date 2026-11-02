# osu-api

A JavaScript and TypeScript client for the osu! API v1 and v2. Each API version uses different authentication, so configure the credentials for the version you plan to use. The client has no runtime dependencies and uses `fetch`.

## Installation

```bash
npm install osu-api
```

Requires Node.js 18 or later. TypeScript declarations are included.

## JavaScript: CommonJS

```js
const OsuApi = require('osu-api');

const api = new OsuApi({
  apiKey: process.env.OSU_API_KEY, // v1
  clientId: process.env.OSU_CLIENT_ID, // v2
  clientSecret: process.env.OSU_CLIENT_SECRET // v2
});

async function main() {
  const legacyUser = await api.v1.getUser('peppy');
  const user = await api.v2.getUser('peppy', 'osu');
  const beatmap = await api.v2.getBeatmap(75);

  console.log(legacyUser, user.username, beatmap.beatmapset.title);
}

main().catch(console.error);
```

## JavaScript: ESM

```js
import OsuApi, { OsuApi as NamedOsuApi } from 'osu-api';

const api = new OsuApi({
  clientId: 12345,
  clientSecret: process.env.OSU_CLIENT_SECRET
});
const user = await api.v2.getUser('peppy', 'osu');
```

CommonJS and ESM both support `new OsuApi(...)`. TypeScript can use the default or named export:

```ts
import OsuApi, { type OsuApiOptions } from 'osu-api';

const options: OsuApiOptions = {
  clientId: 12345,
  clientSecret: process.env.OSU_CLIENT_SECRET
};
const api = new OsuApi(options);
const scores = await api.v2.getUserScores(2, 'best', { limit: 5 });
```

## Choosing an API

- **API v1**: provide an `apiKey` and use `api.v1`. Helpers include `getBeatmaps`, `getUser`, `getScores`, `getUserBest`, `getUserRecent`, and `getReplay`. For other v1 endpoints, use `api.v1.request('get_beatmaps', { query: { ... } })`.
- **API v2**: provide `clientId` and `clientSecret` for OAuth client credentials, or a valid token with `accessToken` and `expiresAt`. Use `api.v2` for helpers such as `getUser`, `getUserScores`, `getBeatmap`, `searchBeatmaps`, and `getRanking`. Other v2 endpoints are available through `api.v2.request('/me')`.

Existing helpers such as `api.getUser(...)` and `api.request(...)` are still available and continue to use API v2.

An `apiKey` is a secret credential. Store it in an environment variable; do not expose it in public code or browser applications. API v1 has different endpoint coverage and parameters from API v2.

## Advanced configuration

Set `baseUrl`, `tokenUrl`, and `v1BaseUrl` to use compatible servers or for testing. You can also inject a `fetch` implementation, for example when your runtime provides its own.

## License

MIT
