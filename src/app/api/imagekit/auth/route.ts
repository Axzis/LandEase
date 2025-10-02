
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// CATATAN: 'dotenv' tidak diperlukan di Next.js. Variabel lingkungan dari .env dimuat secara otomatis.

export async function GET(request: Request) {
  try {
    // Inisialisasi ImageKit di dalam handler untuk memastikan variabel env sudah dimuat.
    // Pastikan variabel lingkungan ini ada di file .env Anda.
    const imageKit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    });

    const authenticationParameters = imageKit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("Error getting ImageKit authentication parameters:", error);
    // Memberikan error yang lebih deskriptif jika inisialisasi gagal.
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Could not get authentication parameters.", details: errorMessage },
      { status: 500 }
    );
  }
}
