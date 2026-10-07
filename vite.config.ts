import { defineConfig } from 'vite';

const pdfStorage = new Map<string, { buffer: Buffer; filename: string; timestamp: number }>();

// Auto clean entries older than 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of pdfStorage.entries()) {
    if (now - item.timestamp > 300000) {
      pdfStorage.delete(id);
    }
  }
}, 60000);

export default defineConfig({
  plugins: [
    {
      name: 'pdf-download-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/pdf-store') && req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            req.on('end', () => {
              const buffer = Buffer.concat(chunks);
              const id = Math.random().toString(36).substring(2, 12);
              const filename = (req.headers['x-filename'] as string) || 'luyen-viet.pdf';
              pdfStorage.set(id, { buffer, filename, timestamp: Date.now() });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ id, filename }));
            });
            return;
          }

          if (req.url?.startsWith('/api/pdf-download')) {
            const url = new URL(req.url, 'http://localhost');
            const id = url.searchParams.get('id');
            const fallbackName = url.searchParams.get('filename') || 'luyen-viet.pdf';
            const item = id ? pdfStorage.get(id) : null;

            if (item) {
              const encodedFilename = encodeURIComponent(item.filename);
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);
              res.setHeader('Content-Length', String(item.buffer.length));
              res.end(item.buffer);
              // Clean up after download
              pdfStorage.delete(id!);
              return;
            } else {
              res.statusCode = 404;
              res.end('PDF not found');
              return;
            }
          }

          next();
        });
      },
    },
  ],
});
