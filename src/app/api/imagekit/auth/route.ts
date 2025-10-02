import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit-server'; // <-- Impor instance yang sudah dibuat

export async function GET(request: Request) {
  try {
    // Langsung gunakan instance imagekit yang sudah diimpor
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    // Jika ada error (meskipun kecil kemungkinannya sekarang), log dan kirim respons error
    console.error("[ImageKit Auth Error]:", error.message);
    
    return NextResponse.json(
      { error: "Gagal mengautentikasi dengan ImageKit. Periksa konsol server untuk detail." },
      { status: 500 }
    );
  }
}