export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, preset, platforms, duration } = req.body;

  const presetDescriptions = {
    'bl-anime': 'BL/anime style with soft aesthetics, dramatic emotional cuts, and romantic tension',
    'hype': 'high-energy hype style with fast cuts, bold typography, and viral trending energy',
    'aesthetic': 'cinematic aesthetic/vlog style with slow burns and lifestyle feel',
    'promo': 'clean professional promotional style with clear messaging'
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: `You are an expert AI video prompt engineer for short-form social media videos.
Your job is to take a creator's rough idea and turn it into a detailed, vivid video generation prompt.
The prompt should describe: visual scenes, camera movements, lighting, mood, pacing, and key moments.
Keep it under 200 words. Be specific, cinematic, and evocative.
Style: ${presetDescriptions[preset] || 'general creator style'}
Platform: ${(platforms || []).join(', ') || 'TikTok/Shorts'}
Duration: ${duration || '30s'}
Respond with ONLY the refined prompt, no preamble.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    res.json({ refined: data.content[0].text.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
