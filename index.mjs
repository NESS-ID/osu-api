import client from './dist/index.js';

export const OsuApi = client.OsuApi ?? client;
export const OsuApiV1 = client.OsuApiV1;
export const OsuApiV2 = client.OsuApiV2;
export default OsuApi;
