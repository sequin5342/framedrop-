export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, preset, platforms, duration } = req.body;

  const styleMap = {
    'bl-anime': 'soft cinematic BL anime aesthetic, pastel tones, warm lighting, emotional close-ups',
    'hype': 'high energy, fast cuts, vibrant colors, bold motion graphics',
    'aesthetic': 'cinematic slow motion, golden hour lighting, lifestyle aesthetic',
    'promo': 'clean modern commercial, professional lighting, clear product focus'
  };

  const fullPrompt = `${prompt}. Visual style: ${styleMap[preset] || ''}. Short-form vertical video for ${(platforms || []).join(', ') || 'social media'}.`;

  try {
    const response = await fetch('https://api.piapi.ai/api/v1/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.PIAPI_KEY
      },
      body: JSON.stringify({
        model: 'kling',
        task_type: 'video_generation',
        input: {
          prompt: fullPrompt,
          negative_prompt: 'blurry, low quality, distorted, watermark',
          duration: duration === '60s' ? 10 : 5,
          aspect_ratio: '9:16',
          mode: 'std',
          version: '1.6'
        },
        config: { service_mode: 'public' }
      })
    });

    const data = await response.json();
    const taskId = data?.data?.task_id;
    if (taskId) return res.json({ taskId });
    res.status(400).json({ error: data?.message || 'Failed to create task' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
