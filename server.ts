import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount API endpoints dynamically
  const mountRoutes = async (dir: string, baseRoute: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        await mountRoutes(fullPath, `${baseRoute}/${file}`);
      } else if (file.endsWith('.ts')) {
        const routeModule = await import(fullPath);
        const routeName = file.replace('.ts', '');
        const routePath = `${baseRoute}/${routeName}`;
        
        console.log(`Mounting ${routePath}`);
        if (routeModule.default) {
          app.all(routePath, async (req, res) => {
            try {
              await routeModule.default(req, res);
            } catch (e) {
              console.error(`Error in ${routePath}:`, e);
              if (!res.headersSent) {
                res.status(500).json({ error: 'Internal Server Error' });
              }
            }
          });
        }
      }
    }
  };

  await mountRoutes(path.join(__dirname, 'api'), '/api');

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
