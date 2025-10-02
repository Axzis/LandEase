import ImageKit from 'imagekit';

// Memeriksa environment variables saat file ini di-import oleh server
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

if (!publicKey || !privateKey || !urlEndpoint) {
  throw new Error(
    "FATAL: Environment variables for ImageKit are not configured correctly on the server."
  );
}

// Inisialisasi instance ImageKit sekali dan ekspor
export const imagekit = new ImageKit({
  publicKey: publicKey,
  privateKey: privateKey,
  urlEndpoint: urlEndpoint,
});