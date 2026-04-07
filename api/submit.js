import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    if (!data.name || !data.rankings) return res.status(400).json({ error: 'Missing required fields' });

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `responses/${id}.json`;

    await put(filename, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return res.status(200).json({ success: true, id });
  } catch (e) {
    console.error('Submit error:', e);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
}
