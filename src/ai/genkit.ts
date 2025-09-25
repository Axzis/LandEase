import {genkit, Plugin} from 'genkit';
import {googleAI, GoogleAIPlugin} from '@genkit-ai/googleai';

// Load environment variables from .env file
import {config} from 'dotenv';
config();

let googleAiPlugin: Plugin<[GoogleAIPlugin] | []>;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
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
    googleAiPlugin = googleAI();
  }
} else {
  googleAiPlugin = googleAI();
}

export const ai = genkit({
  plugins: [googleAiPlugin],
  model: 'googleai/gemini-2.0-flash',
});
