'use client';

import { useState } from 'react';
import { generateTextBlock } from '@/ai/flows/generate-text-block';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';

interface AITextGeneratorProps {
  onGeneratedText: (text: string) => void;
}

export function AITextGenerator({
  onGeneratedText,
}: AITextGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Tidak dapat menghasilkan',
        description: 'Silakan masukkan topik atau deskripsi singkat terlebih dahulu.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateTextBlock({ topic });
      if (result.textBlock) {
        onGeneratedText(result.textBlock);
        toast({ title: 'Teks berhasil dibuat!'});
      } else {
        throw new Error('No text returned.');
      }
    } catch (error) {
      console.error('Error generating text:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat',
        description: 'Tidak dapat membuat teks. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
        <Label>Generator Teks AI</Label>
        <p className="text-sm text-muted-foreground">Hasilkan konten paragraf berdasarkan topik atau deskripsi singkat.</p>
        <Textarea 
            placeholder="Contoh: Jelaskan keunggulan utama produk kami..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
        />
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Membuat...' : 'Buat dengan AI'}
        </Button>
    </div>
  );
}
