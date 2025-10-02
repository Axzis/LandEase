// src/components/editor/image-uploader.tsx

'use client';

import { IKContext, IKUpload } from 'imagekitio-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react'; // Impor useState dan useEffect
import { Label } from '@/components/ui/label';

// Ganti dengan kredensial ImageKit Anda dari file .env.local
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

// Endpoint relatif tetap didefinisikan di sini
const authEndpointPath = '/api/imagekit/auth';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const { toast } = useToast();
  // State untuk menyimpan URL absolut
  const [absoluteAuthEndpoint, setAbsoluteAuthEndpoint] = useState('');

  // useEffect akan berjalan di sisi klien untuk mendapatkan origin URL
  useEffect(() => {
    // window.location.origin akan memberikan URL dasar (e.g., "https://....cloudworkstations.dev")
    setAbsoluteAuthEndpoint(window.location.origin + authEndpointPath);
  }, []);


  if (!publicKey || !urlEndpoint) {
    console.error("ImageKit public key or URL endpoint is not configured.");
    return <p className="text-destructive text-sm">Image Uploader is not configured.</p>;
  }

  // Jangan render apapun sampai URL absolut siap
  if (!absoluteAuthEndpoint) {
    return null;
  }

  const handleUploadStart = () => {
    toast({
      title: 'Uploading...',
      description: 'Your image is being uploaded.',
    });
  };

  const handleUploadSuccess = (result: any) => {
    onUploadSuccess(result.url);
    toast({
      title: 'Upload Successful!',
      description: 'Your image has been added.',
    });
  };

  const handleUploadError = (err: any) => {
    console.error("ImageKit upload error detail:", err);
    toast({
      variant: 'destructive',
      title: 'Upload Failed',
      description: err.message || 'An unknown error occurred. Check the browser console and network tab for details.',
    });
  };

  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticationEndpoint={absoluteAuthEndpoint} // <-- GUNAKAN URL ABSOLUT DI SINI
    >
      <IKUpload
        fileName="new-image.jpg"
        onUploadStart={handleUploadStart}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
        style={{ display: 'none' }}
        id="image-upload-input"
      />
      <Label htmlFor="image-upload-input" className="w-full">
        <Button asChild className="w-full cursor-pointer">
            <div>
                 <Upload className="mr-2 h-4 w-4" />
                 Upload Image
            </div>
        </Button>
      </Label>
    </IKContext>
  );
}