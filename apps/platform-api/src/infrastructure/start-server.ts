import { createPlatformApi } from './create-platform-api.js';
import { listenPlatformApi } from './node-http-server.js';

const port = Number.parseInt(process.env.PORT ?? '8787', 10);
const host = process.env.HOST ?? '127.0.0.1';

const api = createPlatformApi();
const listening = await listenPlatformApi(api, Number.isFinite(port) ? port : 8787, host);

console.log(`[platform-api] listening on http://${listening.host}:${listening.port}`);
console.log(`[platform-api] POST /v1/boom/launch  GET /health  GET /v1/tenants/:id`);
