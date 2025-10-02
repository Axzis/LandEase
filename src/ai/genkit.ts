
import {genkit, type Plugin} from 'genkit';
import {googleAI, type GoogleAIPlugin} from '@genkit-ai/googleai';

// Load environment variables from .env file
import {config} from 'dotenv';
config();

let googleAiPlugin: Plugin<[GoogleAIPlugin] | []>;
const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

try {
  if (credsJson) {
    const serviceAccount = JSON.parse(credsJson);
    // Basic validation to ensure we have a service account-like object
    if (serviceAccount.client_email && serviceAccount.private_key) {
      googleAiPlugin = googleAI({
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key,
        },
      });
    } else {
      // The JSON is valid but doesn't look like a service account.
      // Fallback to default initialization.
      console.error('GOOGLE_APPLICATION_CREDENTIALS_JSON is valid JSON but not a valid service account. Using default Genkit initialization.');
      googleAiPlugin = googleAI();
    }
  } else {
    // If credsJson is null, undefined, or an empty string, use default initialization.
    googleAiPlugin = googleAI();
  }
} catch (e) {
  // This will catch any error from JSON.parse() if credsJson is malformed.
  console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Using default Genkit initialization.', e);
  googleAiPlugin = googleAI();
}


export const ai = genkit({
  plugins: [googleAiPlugin],
  // You can specify a default model here if needed
  // model: 'googleai/gemini-1.5-flash-latest',
});
