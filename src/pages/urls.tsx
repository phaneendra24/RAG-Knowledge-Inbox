import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';

import { getApiUrl } from '@/lib/api-config';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { fetchAllitems } from '@/queries/api';

export default function Notes() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['urls', 'URL'],
    queryFn: async ({ queryKey }) => {
      const response = await fetchAllitems({ queryKey: queryKey as string[] });
      return (await response.json()) as {
        sucess: boolean;
        data: {
          content: string;
          id: number;
          created_at: string;
          updated_at: string;
          url: string;
          title: string;
        }[];
      };
    },
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    console.log('User submitted:', input);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
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
    return <span>Loading...</span>;
  }

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  console.log(data);

  return (
    <div className="h-full w-full flex mt-3 flex-col relative">
      <div className="flex-none p-4 pb-0">
        <div className="relative max-w-3xl mx-auto flex items-end gap-2 p-2 border rounded-xl shadow-sm bg-card focus-within:ring-1 focus-within:ring-ring">
          {/* <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Add a new note..."
            className="min-h-24 max-h-[200px] grow resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-2"
            rows={1}
          /> */}
          <Field orientation="horizontal">
            {' '}
            <Input type="search" placeholder="Search..." />
            <Button>Search</Button>
          </Field>

          <Button
            size="icon"
            className="px-7 rounded-md shrink-0"
            onClick={handleSubmit}
            disabled={!input.trim()}
          >
            Add
          </Button>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          Try Adding new sources to feed the knowledge base.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Your URLs</h2>

          {isPending && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-xl border bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-center">
              Failed to load notes. Please try again later.
            </div>
          )}

          {!isPending && !error && data?.data.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No notes found. Create one above!
            </div>
          )}

          <div className="flex flex-col gap-4">
            {data?.data?.map((note: any) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate" title={note.title}>
                    {note.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3 text-muted-foreground  whitespace-pre-wrap">
                    {note.content}
                  </p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-0 flex justify-between">
                  {new Date(note.created_at).toLocaleDateString()}

                  <Sheet>
                    <SheetTrigger>
                      {' '}
                      <div className=" border inset-ring-sidebar-border cursor-pointer rounded-md px-2 py-1">
                        Open
                      </div>
                    </SheetTrigger>
                    <SheetContent className="">
                      <SheetHeader>
                        <SheetTitle>{note.title}</SheetTitle>
                        <SheetDescription>{note.content}</SheetDescription>
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
