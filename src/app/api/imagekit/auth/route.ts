import { imagekit } from "@/lib/imagekit-server"; // Impor instance yang sudah dibuat

export async function GET(request: Request) {
  const result = imagekit.getAuthenticationParameters();
  return Response.json(result);
}