import { genkit } from 'genkit';
import { nextjsPlugin } from '@genkit-ai/next';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';

export default genkit({
  plugins: [
    // Inisialisasi plugin Next.js di sini
    nextjsPlugin(),
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});