import ImageKit from 'imagekit';

// --- LANGKAH DEBUGGING: HARDCODE KREDENSIAL DI SINI ---
// Ganti nilai-nilai string kosong di bawah ini dengan kredensial ImageKit Anda yang sebenarnya.
const publicKey = "public_gJz8oZ5g1a7a2P4E1i7w0Hw6g9o=";
const privateKey = "private_2i/7i7x1W9Hw6M4I1S8G2Z5A8P4=";
const urlEndpoint = "https://ik.imagekit.io/your_instance_id"; 
// ---------------------------------------------------------

// Error handling jika Anda lupa mengisi kredensial di atas
if (!publicKey || !privateKey || !urlEndpoint || urlEndpoint.includes('your_instance_id')) {
  throw new Error(
    "FATAL: Harap masukkan kredensial ImageKit Anda secara langsung di dalam file 'src/lib/imagekit-server.ts' untuk debugging."
  );
}

// Inisialisasi instance ImageKit sekali dan ekspor
export const imagekit = new ImageKit({
  publicKey: publicKey,
  privateKey: privateKey,
  urlEndpoint: urlEndpoint,
});