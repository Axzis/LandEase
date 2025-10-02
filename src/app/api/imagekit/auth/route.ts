// src/app/api/imagekit/auth/route.ts

import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit-server';

export async function GET(request: Request) {
  // Periksa apakah kredensial ada di sini.
  // imagekit.sdkConfig akan berisi nilai-nilai yang digunakan saat inisialisasi.
  if (
    !imagekit.sdkConfig.publicKey ||
    !imagekit.sdkConfig.privateKey ||
    !imagekit.sdkConfig.urlEndpoint
  ) {
    console.error("[ImageKit Auth Error]: Server-side environment variables for ImageKit are missing or empty.");
    return NextResponse.json(
      { error: "Konfigurasi ImageKit di sisi server tidak lengkap. Periksa file .env.local dan restart server." },
      { status: 500 }
    );
  }

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    console.error("[ImageKit Auth Error]:", error.message);
    return NextResponse.json(
      { error: "Gagal menghasilkan token autentikasi ImageKit." },
      { status: 500 }
    );
  }
}