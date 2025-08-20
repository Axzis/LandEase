'use client';

import { useState } from 'react';
import { generateHeadline } from '@/ai/flows/generate-headline';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';

interface AIHeadlineGeneratorProps {
  existingHeadline: string;
  onSelectHeadline: (headline: string) => void;
}

export function AIHeadlineGenerator({
  existingHeadline,
  onSelectHeadline,
}: AIHeadlineGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!existingHeadline) {
      toast({
        variant: 'destructive',
        title: 'Tidak dapat menghasilkan',
        description: 'Silakan masukkan judul terlebih dahulu.',
      });
      return;
    }
    setIsLoading(true);
    setHeadlines([]);
    try {
      const result = await generateHeadline({ existingHeadline });
      if (result.alternativeHeadlines && result.alternativeHeadlines.length > 0) {
        setHeadlines(result.alternativeHeadlines);
        toast({ title: 'Judul berhasil dibuat!', description: 'Pilih judul baru dari dropdown.' });
      } else {
        throw new Error('No headlines returned.');
      }
    } catch (error) {
      console.error('Error generating headlines:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat',
        description: 'Tidak dapat membuat judul. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
        <Label>Generator Judul AI</Label>
        <p className="text-sm text-muted-foreground">Hasilkan judul alternatif berdasarkan teks saat ini.</p>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Membuat...' : 'Buat dengan AI'}
          </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full" disabled={headlines.length === 0}>
                Lihat Saran ({headlines.length})
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72">
          <DropdownMenuLabel>Saran</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {headlines.length > 0 ? (
            headlines.map((headline, index) => (
              <DropdownMenuItem key={index} onSelect={() => onSelectHeadline(headline)}>
                {headline}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>Belum ada saran. Klik buat!</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
