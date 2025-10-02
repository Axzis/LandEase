
import { NextResponse } from 'next/server';
// Gunakan 'imagekit-javascript' di sini untuk konsistensi
// Ini akan berfungsi di lingkungan edge Next.js
import ImageKit from 'imagekit-javascript';

export async function GET(request: Request) {
  try {
    // Inisialisasi SDK di sini untuk memastikan variabel env dimuat
    // Tidak seperti library 'imagekit', 'imagekit-javascript' tidak memerlukan kunci privat
    // saat membuat parameter otentikasi, karena ia tidak menandatanganinya sendiri.
    // Namun, kita akan membuat objek palsu untuk memuaskan antarmukanya.
    const imageKit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
      // Kunci privat diperlukan untuk pembuatan tanda tangan yang sebenarnya
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!
    });
    
    // Metode ini sekarang akan menggunakan privateKey yang disediakan untuk menghasilkan tanda tangan yang valid
    const authenticationParameters = imageKit.getAuthenticationParameters();
    
    return NextResponse.json(authenticationParameters);

  } catch (error) {
    console.error("Error getting ImageKit authentication parameters:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Could not get authentication parameters.", details: errorMessage },
      { status: 500 }
    );
  }
}
