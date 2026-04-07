import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Try listing with no prefix first
    const allBlobs = await list();

    // Then try with prefix
    const prefixBlobs = await list({ prefix: 'responses/' });

    return res.status(200).json({
      allCount: allBlobs.blobs.length,
      allPaths: allBlobs.blobs.map(b => b.pathname),
      prefixCount: prefixBlobs.blobs.length,
      prefixPaths: prefixBlobs.blobs.map(b => b.pathname),
      hasMore: allBlobs.hasMore,
      cursor: allBlobs.cursor,
      token: process.env.BLOB_READ_WRITE_TOKEN ? 'SET (' + process.env.BLOB_READ_WRITE_TOKEN.substring(0, 12) + '...)' : 'NOT SET'
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
