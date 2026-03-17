import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    
    // Extract video ID from URL
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Fetch transcript
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Combine the text blocks into one string
    const fullText = transcriptArray.map(t => t.text).join(' ');

    return res.status(200).json({ transcript: fullText });
  } catch (error) {
    console.error('Transcript API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch transcript: ' + error.message });
  }
}
