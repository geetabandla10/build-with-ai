import axios from 'axios';

async function getFreeModels() {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models');
    const freeModels = response.data.data.filter(m => m.pricing && parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0);
    const names = freeModels.map(m => m.id).slice(0, 10);
    console.log('Free models:', names);
  } catch (e) {
    console.error(e.message);
  }
}
getFreeModels();
