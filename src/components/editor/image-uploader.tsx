'use client';

import { IKUpload } from 'imagekitio-react';
import { ImageUp, Loader2 } from 'lucide-react';
import { useRef } from 'react';

interface ImageUploaderProps {
  onSuccess: (url: string) => void;
}

export function ImageUploader({ onSuccess }: ImageUploaderProps) {
  const uploaderRef = useRef<HTMLInputElement>(null);

  const onError = (err: any) => {
    console.error("ImageKit Upload Error:", err);
    alert('Image upload failed. Check the console for details.');
  };

  const onUploadSuccess = (res: any) => {
    onSuccess(res.url);
  };

  // Fungsi authenticator yang akan mengambil kredensial dari backend Anda
  const authenticator = async () => {
    try {
      const response = await fetch('/api/imagekit/auth');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error) {
      // Tampilkan error di console jika gagal fetch
      console.error("Authentication request failed:", error);
      throw new Error(`Authentication request failed: ${(error as Error).message}`);
    }
  };

  return (
    <IKUpload
      authenticator={authenticator} // Gunakan fungsi authenticator di sini
      onError={onError}
      onSuccess={onUploadSuccess}
      style={{ display: 'none' }} // Sembunyikan input default
      inputRef={uploaderRef}
    >
      <button
        onClick={() => uploaderRef.current?.click()}
        className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <ImageUp className="h-8 w-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload an image</span>
      </button>
    </IKUpload>
  );
}