import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const key = req.query.key;
  if (key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { blobs } = await list({ prefix: 'responses/' });

    // Show all properties of first blob
    const firstBlob = blobs[0];
    const blobKeys = firstBlob ? Object.keys(firstBlob) : [];
    const blobInfo = firstBlob ? {
      pathname: firstBlob.pathname,
      url: firstBlob.url,
      downloadUrl: firstBlob.downloadUrl,
      size: firstBlob.size,
    } : null;

    // Try to fetch the first blob
    let fetchResult = null;
    if (firstBlob) {
      // Try downloadUrl first
      if (firstBlob.downloadUrl) {
        try {
          const r = await fetch(firstBlob.downloadUrl);
          fetchResult = { method: 'downloadUrl', status: r.status, body: await r.text() };
        } catch (e) {
          fetchResult = { method: 'downloadUrl', error: e.message };
        }
      }
      // If no downloadUrl, try url
      if (!fetchResult || fetchResult.error) {
        try {
          const r = await fetch(firstBlob.url);
          fetchResult = { method: 'url', status: r.status, body: await r.text() };
        } catch (e) {
          fetchResult = { method: 'url', error: e.message };
        }
      }
    }

    return res.status(200).json({
      blobCount: blobs.length,
      blobKeys,
      blobInfo,
      fetchResult
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
