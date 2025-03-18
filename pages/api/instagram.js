import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_url&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`);
    res.status(200).json(response.data.data);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    res.status(500).json({ error: 'Error fetching Instagram posts' });
  }
}
