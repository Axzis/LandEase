
import {genkit, type Plugin} from 'genkit';
import {googleAI, type GoogleAIPlugin} from '@genkit-ai/googleai';

// Next.js handles .env file loading automatically.
// The manual import and call to dotenv is not needed and can cause issues.

// The googleAI() plugin automatically finds credentials from the environment,
// including GOOGLE_APPLICATION_CREDENTIALS_JSON.
// The complex manual parsing logic is brittle and has been removed.
export const ai = genkit({
  plugins: [googleAI()],
});
