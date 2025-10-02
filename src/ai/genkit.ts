import {genkit, Plugin} from 'genkit';
import {googleAI, GoogleAIPlugin} from '@genkit-ai/googleai';

// Load environment variables from .env file
import {config} from 'dotenv';
config();

let googleAiPlugin: Plugin<[GoogleAIPlugin] | []>;

// Check if the environment variable exists and is not an empty string
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.trim() !== '') {
  try {
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
    googleAiPlugin = googleAI({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
    });
  } catch (e) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON', e);
    // Fallback to default initialization if JSON parsing fails
    googleAiPlugin = googleAI();
  }
} else {
  // Default initialization if the environment variable is not set
  googleAiPlugin = googleAI();
}

export const ai = genkit({
  plugins: [googleAiPlugin],
  model: 'googleai/gemini-2.0-flash',
});
