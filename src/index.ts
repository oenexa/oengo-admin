import http from 'node:http';
import { CommerceAdminService } from './service/CommerceAdminService.js';

export * from './domain/types.js';
export * from './domain/events.js';
export * from './service/CommerceAdminService.js';

const admin = new CommerceAdminService();
const PORT = Number(process.env.PORT) || 3011;

export const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'UP', service: 'oengo-admin', timestamp: new Date().toISOString() }));
  }

  if (req.url === '/api/admin/outbox' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ success: true, data: admin.getOutbox() }));
  }

  res.writeHead(404);
  return res.end(JSON.stringify({ success: false, error: 'Endpoint Not Found' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[oengo-admin] Quick Commerce Regional Admin Microservice listening on port ${PORT}`);
  });
}
