import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
import { fetchAllitems, ingestNotes } from '@/queries/api';

interface Note {
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

function NotesSkeleton() {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Input skeleton */}
      <div className="flex-none p-4 pb-0">
        <div className="relative max-w-3xl mx-auto p-2 border rounded-xl shadow-sm bg-card">
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="max-w-3xl mx-auto mt-2 flex justify-end">
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />

          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </CardContent>
                <CardFooter className="pt-2">
                  <Skeleton className="h-4 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const [input, setInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const { isPending, error, data } = useQuery({
    queryKey: ['notes', 'NOTE'],
    queryFn: async ({ queryKey }) => {
      const response = await fetchAllitems({ queryKey: queryKey as string[] });
      return response as {
        success: boolean;
        data: Note[];
      };
    },
  });

  const ingestNotesMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const response = await ingestNotes({ content });
      return response as IngestResponse;
    },
    onSuccess: (data) => {
      setSubmitError(null);
      if (data.success) {
        toast.success('Note added successfully!', {
          description: 'Your note has been saved to the knowledge base.',
        });
        setInput('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        queryClient.invalidateQueries({ queryKey: ['notes', 'NOTE'] });
      } else {
        const errorMessage = data.message || 'Something went wrong while saving your note.';
        setSubmitError(errorMessage);
        toast.error('Failed to add note', {
          description: errorMessage,
        });
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setSubmitError(errorMessage);
      toast.error('Failed to add note', {
        description: errorMessage,
      });
    },
  });

  const handleSubmit = () => {
    if (!input.trim()) {
      toast.warning('Empty note', {
        description: 'Please enter some content before submitting.',
      });
      return;
    }

    if (input.trim().length < 10) {
      toast.warning('Note too short', {
        description: 'Please enter at least 10 characters.',
      });
      return;
    }

    ingestNotesMutation.mutate({ content: input });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (submitError) {
      setSubmitError(null);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (input === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  if (isPending) {
    return <NotesSkeleton />;
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4">
        <div className="p-6 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-center max-w-md">
          <h3 className="font-semibold mb-2">Failed to load notes</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex mt-3 flex-col relative">
      <div className="flex-none p-4 pb-0">
        <div className="relative max-w-3xl mx-auto flex items-center gap-2 p-2 border rounded-xl shadow-sm bg-card focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Add a new note..."
            className="min-h-24 max-h-[200px] grow resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-2"
            rows={1}
            disabled={ingestNotesMutation.isPending}
          />
          <Button
            size="icon"
            className="px-7 rounded-md shrink-0"
            onClick={handleSubmit}
            disabled={!input.trim() || ingestNotesMutation.isPending}
          >
            {ingestNotesMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add'
            )}
          </Button>
        </div>

        {/* Submission error message */}
        {submitError && (
          <div className="max-w-3xl mx-auto mt-2 flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground mt-2">
          Try Adding new sources to feed the knowledge base.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Your Notes
          </h2>

          {data?.data.length === 0 && (
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-muted rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No notes yet</p>
              <p className="text-sm">Create your first note above!</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {data?.data?.map((note: Note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate" title={note.title}>
                    {note.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-0 flex justify-between items-center">
                  {new Date(note.created_at).toLocaleDateString()}
                  <Sheet>
                    <SheetTrigger>
                      <div className="border rounded-md px-2 py-1 hover:bg-muted cursor-pointer">
                        View
                      </div>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto sm:max-w-xl">
                      <SheetHeader>
                        <SheetTitle>{note.title}</SheetTitle>
                        <SheetDescription className="text-left whitespace-pre-wrap mt-4">
                          {note.content}
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
