export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'taskId required' });

  try {
    const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
      headers: { 'x-api-key': process.env.PIAPI_KEY }
    });

    const data = await response.json();
    const status = data?.data?.status;
    const videoUrl = data?.data?.output?.works?.[0]?.resource?.resource ||
                     data?.data?.output?.video_url ||
                     data?.data?.output?.works?.[0]?.video?.resource;

    res.json({ status, videoUrl: videoUrl || null, error: data?.data?.error?.message || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
