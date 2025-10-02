
'use client';

import { useState, useRef } from 'react';
import ImageKit from 'imagekit-javascript';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Label } from '../ui/label';

interface ImageUploaderProps {
  currentImageUrl: string;
  onUploadSuccess: (url: string) => void;
  folder?: string;
  label: string;
}

const imageKit = new ImageKit({
  publicKey: 'public_Gy68WWuFttNb85Sfzcy0VJ9EACw=',
  urlEndpoint: 'https://ik.imagekit.io/2kxgubui1',
});

export function ImageUploader({ currentImageUrl, onUploadSuccess, folder = 'landease', label }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await imageKit.upload({
        file,
        fileName: file.name,
        folder: folder,
        // WARNING: This is an unauthenticated upload. 
        // For production, you must implement a server-side authentication endpoint.
        // See: https://docs.imagekit.io/getting-started/quickstart-guides/javascript#client-side-file-upload-with-authentication-endpoint
      });
      onUploadSuccess(result.url);
      toast({ title: 'Upload Successful', description: 'Your image has been uploaded.' });
    } catch (error) {
      console.error('ImageKit upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload the image. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentImageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <Image src={currentImageUrl} alt="Current image" fill style={{ objectFit: 'contain' }} />
        </div>
      )}
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
        disabled={isUploading}
      />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isUploading ? 'Uploading...' : 'Upload File'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">Or paste an image URL below.</p>
       <Input
          value={currentImageUrl}
          onChange={(e) => onUploadSuccess(e.target.value)}
          placeholder="https://example.com/image.png"
        />
    </div>
  );
}
