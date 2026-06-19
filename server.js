const express = require('express');
const compression = require('compression');
const { writeFile, readFile, mkdir } = require('fs/promises');
const { randomBytes } = require('crypto');
const { existsSync } = require('fs');
const path = require('path');

const app = express();

// Gzip/deflate compression for all responses
app.use(compression());
const PORT = process.env.PORT || 3000;
const TEMP_DIR = '/tmp/ar-models';

// CORS for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Security & embedding headers for all other routes
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://zazawoods.de https://www.zazawoods.de https://zazawoods.nl https://www.zazawoods.nl https://zazawoods-esstisch-konfigurator-production.up.railway.app");
  }
  next();
});

// API: upload-glb
app.get('/api/upload-glb', async (req, res) => {
  const id = req.query.id;
  if (!id || !/^[a-f0-9]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const data = await readFile(`${TEMP_DIR}/${id}.glb`);
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Disposition', `inline; filename="table-${id}.glb"`);
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.status(200).send(data);
  } catch {
    return res.status(404).json({ error: 'Model not found or expired' });
  }
});

app.post('/api/upload-glb', async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length < 100) {
      return res.status(400).json({ error: 'Empty or invalid GLB' });
    }
    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large (max 20MB)' });
    }

    const id = randomBytes(8).toString('hex');

    if (!existsSync(TEMP_DIR)) {
      await mkdir(TEMP_DIR, { recursive: true });
    }

    await writeFile(`${TEMP_DIR}/${id}.glb`, buffer);

    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    const url = `${protocol}://${host}/api/upload-glb?id=${id}`;

    return res.status(200).json({ url, id });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve static files from /configurator (HTML/CSS/JS: no-cache, must revalidate every request)
app.use(express.static(path.join(__dirname, 'configurator'), {
  maxAge: 0,
  etag: true,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache, must-revalidate')
}));

// Serve root-level assets:
//   HTML / CSS / JS  → no-cache (must revalidate so deploys propagate immediately)
//   GLB / textures / swatches / fonts → 7 day cache
app.use(express.static(__dirname, {
  etag: true,
  setHeaders: (res, filePath) => {
    if (/\.(?:html?|css|js|mjs|json)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
}));

// Rewrite: root serves configurator index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'configurator', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zaza Woods Esstisch-Konfigurator running on port ${PORT}`);
});
