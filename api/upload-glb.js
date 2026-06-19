// Serverless function: accepts GLB binary upload, stores temporarily, returns public URL
// Files are stored in /tmp (ephemeral, ~10 min lifespan on Vercel)

import { writeFile, mkdir } from 'fs/promises';
import { randomBytes } from 'crypto';
import { existsSync } from 'fs';

const TEMP_DIR = '/tmp/ar-models';

export const config = {
  api: {
    bodyParser: false, // We handle raw binary
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Serve a stored GLB file
    const id = req.query.id;
    if (!id || !/^[a-f0-9]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const filePath = `${TEMP_DIR}/${id}.glb`;
    try {
      const { readFile } = await import('fs/promises');
      const data = await readFile(filePath);
      res.setHeader('Content-Type', 'model/gltf-binary');
      res.setHeader('Content-Disposition', `inline; filename="table-${id}.glb"`);
      res.setHeader('Cache-Control', 'public, max-age=600'); // 10 min cache
      return res.status(200).send(data);
    } catch {
      return res.status(404).json({ error: 'Model not found or expired' });
    }
  }

  if (req.method === 'POST') {
    // Receive GLB binary and store it
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      if (buffer.length < 100) {
        return res.status(400).json({ error: 'Empty or invalid GLB' });
      }
      if (buffer.length > 20 * 1024 * 1024) { // 20MB limit
        return res.status(413).json({ error: 'File too large (max 20MB)' });
      }

      // Generate unique ID
      const id = randomBytes(8).toString('hex');

      // Ensure temp directory exists
      if (!existsSync(TEMP_DIR)) {
        await mkdir(TEMP_DIR, { recursive: true });
      }

      // Write file
      await writeFile(`${TEMP_DIR}/${id}.glb`, buffer);

      // Return the public URL
      const host = req.headers.host || 'zazawoods-esstisch-konfigurator-production.up.railway.app';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const url = `${protocol}://${host}/api/upload-glb?id=${id}`;

      return res.status(200).json({ url, id });
    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
