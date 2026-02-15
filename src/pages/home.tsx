import { useRef, useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryData, fetchConversation } from '@/queries/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Citation {
  number: number;
  title?: string;
  url?: string;
  sourceType?: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  created_at: string;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const hasCitations = message.citations?.length > 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {!isUser && hasCitations && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="sources" className="border-0">
                <AccordionTrigger className="py-2 text-xs hover:no-underline cursor-pointer">
                  Sources ({message.citations.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2 space-y-2">
                    {message.citations.map((citation) => (
                      <div
                        key={citation.number}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span className="text-muted-foreground font-mono shrink-0">
                          [{citation.number}]
                        </span>
                        <div className="flex-1 min-w-0">
                          {citation.url ? (
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <span className="truncate">
                                {citation.title || citation.url}
                              </span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">
                              {citation.title || 'Unknown source'}
                            </span>
                          )}
                          {citation.sourceType && (
                            <span className="ml-2 text-xs text-muted-foreground/60">
                              ({citation.sourceType})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const conversationIdParam = searchParams.get('conversation');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = conversationIdParam
    ? parseInt(conversationIdParam)
    : undefined;

  const { data: messages = [], isLoading: isLoadingConversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId!),
    enabled: !!conversationId,
    select: (response) => (response.data?.messages as Message[]) || [],
  });

  const queryMutation = useMutation({
    mutationFn: queryData,
    onSuccess: (data) => {
      const response = data.data;

      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['conversation', conversationId],
        });
      }

      if (response?.conversation_id && !conversationId) {
        navigate(`/?conversation=${response.conversation_id}`, {
          replace: true,
        });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const handleNewChat = () => {
    navigate('/');
  };

  const handleSubmit = () => {
    if (!input.trim()) return;

    queryMutation.mutate({
      question: input,
      conversation_id: conversationId,
    });

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conversationTitle =
    messages[0]?.content.slice(0, 60) +
    (messages[0]?.content.length > 60 ? '...' : '');

  return (
    <div className="h-full w-full flex flex-col relative">
      {conversationId && (
        <div className="border-b p-2 flex items-center justify-between bg-card">
          <h2 className="text-sm font-medium truncate flex-1 mr-4">
            {conversationTitle || 'Chat'}
          </h2>
          <Button
            onClick={handleNewChat}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingConversation ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <p>Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <p>Start a conversation with AI</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {queryMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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
            disabled={!input.trim() || queryMutation.isPending}
          >
            {queryMutation.isPending ? '...' : 'Ask'}
          </Button>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          AI can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
}
