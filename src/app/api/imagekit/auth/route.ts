import ImageKit from 'imagekit';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Pastikan semua environment variables ada di sini, di dalam handler
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      // Ini akan mengirim error 500 jika variabel tidak ada
      throw new Error("Variabel lingkungan ImageKit tidak diatur dengan lengkap di server.");
    }

    // Pindahkan inisialisasi ImageKit ke dalam blok try
    const imagekit = new ImageKit({
      publicKey: publicKey,
      privateKey: privateKey,
      urlEndpoint: urlEndpoint,
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    // Tangkap semua error, termasuk error inisialisasi
    console.error("[ImageKit Auth Error]:", error.message);
    
    return NextResponse.json(
      { error: "Gagal mengautentikasi dengan ImageKit. Periksa konsol server untuk detail." },
      { status: 500 }
    );
  }
}