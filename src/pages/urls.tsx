import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ExternalLink, Link2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { fetchAllitems, ingestUrls } from '@/queries/api';

interface UrlItem {
  content: string;
  id: number;
  created_at: string;
  updated_at: string;
  url: string;
  title: string;
}

interface IngestResponse {
  success: boolean;
  message: string;
}

const normalizeAndValidateUrl = (input: string): { url: string | null; error: string | null } => {
  let url = input.trim();
  
  if (!url) {
    return { url: null, error: 'Please enter a URL' };
  }

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { url: null, error: 'URL must start with http:// or https://' };
    }
    return { url, error: null };
  } catch {
    return { url: null, error: 'Invalid URL format' };
  }
};

export default function UrlsPage() {
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Auto-focus input when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const { isPending, error, data } = useQuery({
    queryKey: ['urls', 'URL'],
    queryFn: async ({ queryKey }) => {
      const response = await fetchAllitems({ queryKey: queryKey as string[] });
      return response as {
        success: boolean;
        data: UrlItem[];
      };
    },
  });

  const ingestUrlsMutation = useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      const response = await ingestUrls({ url });
      return response as IngestResponse;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('URL added successfully!', {
          description: 'The URL has been saved to the knowledge base.',
        });
        setInput('');
        setValidationError(null);
        queryClient.invalidateQueries({ queryKey: ['urls', 'URL'] });
      } else {
        toast.error('Failed to add URL', {
          description: data.message || 'Something went wrong while saving the URL.',
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to add URL', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    },
  });

  const handleSubmit = () => {
    const { url, error } = normalizeAndValidateUrl(input);

    if (error || !url) {
      setValidationError(error || 'Invalid URL');
      toast.warning('Invalid URL', {
        description: error || 'Please enter a valid URL.',
      });
      return;
    }

    setValidationError(null);
    ingestUrlsMutation.mutate({ url });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  if (isPending) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Loading URLs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4">
        <div className="p-6 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-center max-w-md">
          <h3 className="font-semibold mb-2">Failed to load URLs</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex mt-3 flex-col relative">
      <div className="flex-none p-4 pb-0">
        <div className={`relative max-w-3xl mx-auto flex items-end gap-2 p-2 border rounded-xl shadow-sm bg-card focus-within:ring-1 focus-within:ring-ring ${validationError ? 'border-destructive' : ''}`}>
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter a URL to scrape..."
            className="grow border-0 shadow-none focus-visible:ring-0 bg-transparent p-2"
            disabled={ingestUrlsMutation.isPending}
          />
          <Button
            size="icon"
            className="px-7 rounded-md shrink-0"
            onClick={handleSubmit}
            disabled={!input.trim() || ingestUrlsMutation.isPending}
          >
            {ingestUrlsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              'Add'
            )}
          </Button>
        </div>
        {validationError && (
          <div className="max-w-3xl mx-auto mt-2 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{validationError}</span>
          </div>
        )}
        <div className="text-center text-xs text-muted-foreground mt-2">
          Try Adding new URLs to feed the knowledge base.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Your URLs
          </h2>

          {data?.data.length === 0 && (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-muted rounded-lg">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No URLs yet</p>
              <p className="text-sm">Add your first URL above!</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {data?.data?.map((item: UrlItem) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate" title={item.title}>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3 text-muted-foreground whitespace-pre-wrap">
                    {item.content}
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-0 flex justify-between items-center">
                  {new Date(item.created_at).toLocaleDateString()}

                  <div className="flex gap-2">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border rounded-md px-2 py-1 hover:bg-muted flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit
                      </a>
                    )}
                    <Sheet>
                      <SheetTrigger>
                        <div className="border rounded-md px-2 py-1 hover:bg-muted cursor-pointer">
                          View
                        </div>
                      </SheetTrigger>
                      <SheetContent className="overflow-y-auto sm:max-w-xl">
                        <SheetHeader>
                          <SheetTitle>{item.title}</SheetTitle>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {item.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <SheetDescription className="text-left whitespace-pre-wrap mt-4">
                            {item.content}
                          </SheetDescription>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
