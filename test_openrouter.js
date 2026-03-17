import axios from 'axios';

async function testOpenRouter() {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openrouter/free',
      messages: [{ role: 'user', content: 'test' }]
    }, {
      headers: {
        'Authorization': `Bearer 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`,
        'HTTP-Referer': 'http://localhost:5173',
      }
    });
  } catch (err) {
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', err.response.data);
    } else {
      console.log('Error:', err.message);
    }
  }
}
testOpenRouter();
