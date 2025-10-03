import ImageKit from "imagekit";

// Tambahkan baris ini untuk memberitahu Next.js bahwa route ini dinamis
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const imagekit = new ImageKit({
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  });

  const result = imagekit.getAuthenticationParameters();
  return Response.json(result);
}