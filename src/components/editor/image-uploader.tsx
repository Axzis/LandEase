'use client';

import { IKContext, IKUpload } from 'imagekitio-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';

// Ganti dengan kredensial ImageKit Anda dari file .env.local
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const authenticationEndpoint = '/api/imagekit/auth';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const { toast } = useToast();

  if (!publicKey || !urlEndpoint) {
    console.error("ImageKit public key or URL endpoint is not configured.");
    return <p className="text-destructive text-sm">Image Uploader is not configured.</p>;
  }

  const handleUploadStart = () => {
    toast({
      title: 'Uploading...',
      description: 'Your image is being uploaded.',
    });
  };

  const handleUploadSuccess = (result: any) => {
    const imageUrl = result.url;
    onUploadSuccess(imageUrl); // Kirim URL kembali ke parent component
    toast({
      title: 'Upload Successful!',
      description: 'Your image has been added.',
    });
  };

  const handleUploadError = (err: any) => {
    // Log error yang lebih detail ke konsol
    console.error("ImageKit upload error detail:", err);
    toast({
      variant: 'destructive',
      title: 'Upload Failed',
      // Tampilkan pesan error yang lebih informatif
      description: err.message || 'An unknown error occurred during upload. Check console for details.',
    });
  };

  return (
    <IKContext
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticationEndpoint={authenticationEndpoint}
    >
      <IKUpload
        fileName="new-image.jpg" // Nama file default
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