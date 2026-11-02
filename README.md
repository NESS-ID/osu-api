# osu-api

Client osu! API v1 dan v2 untuk JavaScript dan TypeScript. API v1 dan v2 memakai autentikasi berbeda; pilih konfigurasi sesuai versi yang digunakan. Client tidak memiliki dependency runtime dan menggunakan `fetch`.

## Instalasi

```bash
npm install osu-api
```

Node.js 18 atau lebih baru diperlukan. TypeScript didukung melalui deklarasi tipe bawaan.

## JavaScript: CommonJS

```js
const OsuApi = require('osu-api');

const api = new OsuApi({
  apiKey: process.env.OSU_API_KEY, // untuk v1
  clientId: process.env.OSU_CLIENT_ID, // untuk v2
  clientSecret: process.env.OSU_CLIENT_SECRET // untuk v2
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

const api = new OsuApi({ clientId: 12345, clientSecret: process.env.OSU_CLIENT_SECRET });
const user = await api.v2.getUser('peppy', 'osu');
```

CommonJS dan ESM sama-sama bisa menggunakan `new OsuApi(...)`. TypeScript bisa mengimpor default atau named export:

```ts
import OsuApi, { type OsuApiOptions } from 'osu-api';

const options: OsuApiOptions = {
  clientId: 12345,
  clientSecret: process.env.OSU_CLIENT_SECRET
};
const api = new OsuApi(options);
const scores = await api.v2.getUserScores(2, 'best', { limit: 5 });
```

## Memilih API

- **API v1**: berikan `apiKey`. Akses melalui `api.v1`; misalnya `getBeatmaps`, `getUser`, `getScores`, `getUserBest`, `getUserRecent`, dan `getReplay`. Untuk endpoint v1 lain, gunakan `api.v1.request('get_beatmaps', { query: { ... } })`.
- **API v2**: berikan `clientId` dan `clientSecret` untuk OAuth client credentials, atau token yang masih berlaku melalui `accessToken` dan `expiresAt`. Akses melalui `api.v2`; misalnya `getUser`, `getUserScores`, `getBeatmap`, `searchBeatmaps`, dan `getRanking`. Endpoint v2 lain tersedia melalui `api.v2.request('/me')`.

Helper lama seperti `api.getUser(...)` dan `api.request(...)` tetap tersedia dan tetap mengarah ke API v2.

`apiKey` adalah kredensial rahasia. Simpan di environment variable dan jangan masukkan ke kode publik/browser. API v1 memiliki cakupan endpoint dan parameter berbeda dari v2.

## Konfigurasi lanjutan

`baseUrl`, `tokenUrl`, dan `v1BaseUrl` dapat diubah untuk server kompatibel atau pengujian. `fetch` juga dapat diinjeksi, misalnya untuk runtime yang menyediakan implementasi fetch sendiri.

## License

MIT
