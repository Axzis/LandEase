
import { NextResponse } from 'next/server';
// Gunakan library 'imagekit' Node.js di sisi server
import ImageKit from 'imagekit';

export async function GET(request: Request) {
  try {
    // Inisialisasi SDK di sini untuk memastikan variabel env dimuat dengan benar
    // oleh Next.js.
    const imageKit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    });
    
    // Metode ini sekarang akan menggunakan privateKey yang disediakan untuk menghasilkan
    // tanda tangan (signature) yang valid, bersama dengan token dan waktu kedaluwarsa.
    const authenticationParameters = imageKit.getAuthenticationParameters();
    
    return NextResponse.json(authenticationParameters);

  } catch (error) {
    console.error("Error getting ImageKit authentication parameters:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    // Kembalikan pesan error yang lebih informatif
    return NextResponse.json(
      { error: "Could not get authentication parameters.", details: errorMessage },
      { status: 500 }
    );
  }
}
