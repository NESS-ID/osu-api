# osu-api

Lightweight osu! API v2 client for Node.js (zero dependencies, native `fetch`).

## Installation

```bash
npm install osu-api
```

## Setup

Dapatkan `clientId` dan `clientSecret` dari [osu! OAuth settings](https://osu.ppy.sh/home/account/edit#oauth).

## Usage

```javascript
const OsuApi = require('osu-api');

const api = new OsuApi({
  clientId: 12345,
  clientSecret: 'your_client_secret'
});

async function main() {
  // Ambil profil user
  const user = await api.getUser('peppy', 'osu');
  console.log(user.username, user.statistics.pp);

  // Ambil best score user
  const scores = await api.getUserScores(user.id, 'best', { limit: 5 });
  console.log(scores);

  // Ambil beatmap
  const beatmap = await api.getBeatmap(75);
  console.log(beatmap.beatmapset.title);

  // Endpoint kustom lainnya
  const data = await api.request('/me');
}

main().catch(console.error);
```

## License

MIT

