import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="h-full w-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
          <p>Start a conversation with AI</p>
        </div>
      </div>

      <div className="p-4 border-t ">
        <div className="relative max-w-3xl mx-auto flex items-end gap-2 p-2 border rounded-xl shadow-sm bg-card focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message AI..."
            className="min-h-[24px] max-h-[200px] w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-2"
            rows={1}
          />
          <Button
            size="icon"
            className="px-7 rounded-md shrink-0"
            onClick={handleSubmit}
            disabled={!input.trim()}
          >
            Ask
          </Button>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          AI can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
}
