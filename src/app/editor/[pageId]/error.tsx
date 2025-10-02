'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
    
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-destructive">Terjadi Kesalahan di Editor</h2>
        <p className="mb-6 text-card-foreground">
          Maaf, terjadi kesalahan tak terduga. Anda bisa mencoba memuat ulang editor atau kembali ke dasbor Anda.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()}>Coba Lagi</Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">Detail Error</summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-4 text-xs text-muted-foreground">
                    {error.name}: {error.message}\n{error.stack}
                </pre>
            </details>
        )}
      </div>
    </div>
  );
}
