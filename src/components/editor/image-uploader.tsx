
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // 1. Get authentication parameters from our server
      const authResponse = await fetch('/api/imagekit/auth');
      if (!authResponse.ok) {
        throw new Error('Failed to get authentication parameters.');
      }
      const { signature, expire, token } = await authResponse.json();

      // 2. Prepare data for ImageKit upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
      formData.append('signature', signature);
      formData.append('expire', expire);
      formData.append('token', token);

      // 3. Upload the file to ImageKit
      const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'ImageKit upload failed.');
      }

      const result = await uploadResponse.json();
      
      onChange(result.url);
      setPreviewUrl(result.url);
      toast({ title: 'Upload Successful', description: 'Your image has been uploaded.' });

    } catch (error) {
      console.error('ImageKit upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not upload image.';
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearImage = () => {
      onChange('');
      setPreviewUrl('');
  }

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative group aspect-video w-full rounded-md border overflow-hidden">
          <Image src={previewUrl} alt="Image preview" fill style={{objectFit: 'contain'}} />
           <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={clearImage}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    )}
                    <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleUpload} disabled={isLoading} />
            </label>
        </div> 
      )}
    </div>
  );
}
