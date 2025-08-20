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
    setIsLoading(true);
    setHeadlines([]);
    try {
      const result = await generateHeadline({ existingHeadline });
      if (result.alternativeHeadlines && result.alternativeHeadlines.length > 0) {
        setHeadlines(result.alternativeHeadlines);
        toast({ title: 'Headlines generated!', description: 'Choose a new headline from the dropdown.' });
      } else {
        throw new Error('No headlines returned.');
      }
    } catch (error) {
      console.error('Error generating headlines:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate headlines. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
        <Label>AI Headline Generator</Label>
        <p className="text-sm text-muted-foreground">Generate alternative headlines based on the current text.</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate with AI'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72">
          <DropdownMenuLabel>Suggestions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {headlines.length > 0 ? (
            headlines.map((headline, index) => (
              <DropdownMenuItem key={index} onSelect={() => onSelectHeadline(headline)}>
                {headline}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No suggestions yet. Click generate!</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
