import {genkit, type Plugin} from 'genkit';
import {googleAI, type GoogleAIPlugin} from '@genkit-ai/googleai';

// Load environment variables from .env file
import {config} from 'dotenv';
config();

let googleAiPlugin: Plugin<[GoogleAIPlugin] | []>;

// Check if the environment variable exists AND is not an empty string
const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (credsJson && credsJson.trim().startsWith('{') && credsJson.trim().endsWith('}')) {
  try {
    const serviceAccount = JSON.parse(credsJson);
    googleAiPlugin = googleAI({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
    });
  } catch (e) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Using default Genkit initialization.', e);
    // Fallback to default initialization if JSON parsing fails
    googleAiPlugin = googleAI();
  }
} else {
  // Default initialization if the environment variable is not set or invalid
  if (credsJson && credsJson.trim() !== '') {
    console.error('GOOGLE_APPLICATION_CREDENTIALS_JSON is set but is not a valid JSON object. Using default Genkit initialization.');
  }
  googleAiPlugin = googleAI();
}

export const ai = genkit({
  plugins: [googleAiPlugin],
  // You can specify a default model here if needed
  // model: 'googleai/gemini-1.5-flash-latest',
});
