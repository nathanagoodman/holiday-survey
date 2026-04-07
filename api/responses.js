import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { blobs } = await list({ prefix: 'responses/' });

    const responses = [];
    for (const blob of blobs) {
      try {
        const r = await fetch(blob.url);
        const data = await r.json();
        responses.push({ id: blob.pathname, ...data });
      } catch (e) {
        console.error('Error reading blob:', blob.pathname, e);
      }
    }

    responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return res.status(200).json({ responses, count: responses.length });
  } catch (e) {
    console.error('Responses error:', e);
    return res.status(500).json({ error: 'Failed to fetch responses' });
  }
}
