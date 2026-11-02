# osu-api

Client JavaScript dan TypeScript untuk osu! API v1 dan v2. Setiap versi API menggunakan autentikasi berbeda, jadi atur kredensial sesuai versi yang ingin digunakan. Client ini tidak memiliki dependency runtime dan menggunakan `fetch`.

## Instalasi

```bash
npm install osu-api
```

Membutuhkan Node.js versi 18 atau lebih baru. Deklarasi tipe TypeScript sudah disertakan.

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

CommonJS dan ESM sama-sama mendukung `new OsuApi(...)`. TypeScript dapat menggunakan default export atau named export:

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

- **API v1**: berikan `apiKey`, lalu akses melalui `api.v1`. Helper yang tersedia antara lain `getBeatmaps`, `getUser`, `getScores`, `getUserBest`, `getUserRecent`, dan `getReplay`. Untuk endpoint v1 lainnya, gunakan `api.v1.request('get_beatmaps', { query: { ... } })`.
- **API v2**: berikan `clientId` dan `clientSecret` untuk OAuth client credentials, atau token yang masih berlaku melalui `accessToken` dan `expiresAt`. Gunakan `api.v2` untuk helper seperti `getUser`, `getUserScores`, `getBeatmap`, `searchBeatmaps`, dan `getRanking`. Endpoint v2 lainnya dapat dipanggil melalui `api.v2.request('/me')`.

Helper yang sudah ada seperti `api.getUser(...)` dan `api.request(...)` tetap tersedia dan tetap menggunakan API v2.

`apiKey` adalah kredensial rahasia. Simpan di environment variable dan jangan tampilkan di kode publik atau aplikasi browser. API v1 memiliki cakupan endpoint dan parameter yang berbeda dari API v2.

## Konfigurasi lanjutan

Atur `baseUrl`, `tokenUrl`, dan `v1BaseUrl` untuk menggunakan server kompatibel atau keperluan pengujian. `fetch` juga dapat diinjeksi, misalnya jika runtime menyediakan implementasi fetch sendiri.

## Lisensi

MIT
