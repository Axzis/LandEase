// src/lib/imagekit-server.ts

import ImageKit from 'imagekit';

// Inisialisasi instance ImageKit.
// Jika environment variables tidak ada, ia akan kosong tetapi tidak akan menyebabkan crash di sini.
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export { imagekit };