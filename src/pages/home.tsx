import { useRef, useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryData, fetchConversation } from '@/queries/api';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  ExternalLink,
  Square,
  Loader2,
  FileText,
  Link2,
  Sparkles,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
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
  id: number | string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  created_at: string;
  isOptimistic?: boolean;
  isLoading?: boolean;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const hasCitations = message.citations?.length > 0;
  const isLoading = message.isLoading;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">Thinking...</p>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}

        {!isUser && hasCitations && !isLoading && (
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

function WelcomeCard({
  icon: Icon,
  title,
  description,
  to,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col p-6 bg-card border-2 border-border rounded-2xl hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${color}`}
      />
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-20`}
      >
        <Icon className={`h-7 w-7 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 flex-grow">
        {description}
      </p>
      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Get Started <ArrowRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">
          Welcome to AI Knowledge Inbox
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Start a conversation or build your knowledge base by adding notes and
          URLs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <WelcomeCard
          icon={FileText}
          title="Add Notes"
          description="Write down your thoughts, ideas, or any text content. The AI will learn from it and use it to answer your questions."
          to="/notes"
          color="bg-blue-500"
        />
        <WelcomeCard
          icon={Link2}
          title="Add URLs"
          description="Scrape web pages and articles. The AI will read and understand the content to provide better answers."
          to="/urls"
          color="bg-green-500"
        />
      </div>

      <div className="mt-10 flex items-center gap-2 text-muted-foreground text-sm">
        <MessageSquare className="h-4 w-4" />
        <span>Or type a question below to start chatting</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const conversationIdParam = searchParams.get('conversation');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = conversationIdParam
    ? parseInt(conversationIdParam)
    : undefined;

  const { data: serverMessages = [], isLoading: isLoadingConversation } =
    useQuery({
      queryKey: ['conversation', conversationId],
      queryFn: () => fetchConversation(conversationId!),
      enabled: !!conversationId,
      select: (response) => (response.data?.messages as Message[]) || [],
    });

  // Combine server messages with optimistic messages
  const displayMessages = useMemo<Message[]>(() => {
    return conversationId
      ? [...serverMessages, ...optimisticMessages]
      : optimisticMessages;
  }, [conversationId, serverMessages, optimisticMessages]);

  const queryMutation = useMutation({
    mutationFn: async ({
      question,
      conversation_id,
    }: {
      question: string;
      conversation_id?: number;
    }) => {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const result = await queryData({
          question,
          conversation_id,
          signal: abortControllerRef.current.signal,
        });
        return result;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      }
    },
    onMutate: async (variables) => {
      // Add optimistic user message
      const optimisticUserMessage: Message = {
        id: `optimistic-user-${Date.now()}`,
        role: 'user',
        content: variables.question,
        citations: [],
        created_at: new Date().toISOString(),
        isOptimistic: true,
      };

      // Add optimistic assistant message (loading state)
      const optimisticAssistantMessage: Message = {
        id: `optimistic-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        citations: [],
        created_at: new Date().toISOString(),
        isOptimistic: true,
        isLoading: true,
      };

      setOptimisticMessages((prev) => [
        ...prev,
        optimisticUserMessage,
        optimisticAssistantMessage,
      ]);
      setIsProcessing(true);
      setInput('');

      return { optimisticUserMessage, optimisticAssistantMessage };
    },
    onSuccess: (data) => {
      const response = data.data;

      // Remove optimistic messages
      setOptimisticMessages([]);
      setIsProcessing(false);

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

      toast.success('Response received');
    },
    onError: (error, variables) => {
      // Remove optimistic messages on error
      setOptimisticMessages([]);
      setIsProcessing(false);

      // Restore the input so user can retry
      setInput(variables.question);

      if (error instanceof Error && error.message === 'Request cancelled') {
        toast.info('Request cancelled', {
          description: 'The query was stopped.',
        });
      } else {
        toast.error('Something went wrong', {
          description:
            error instanceof Error
              ? error.message
              : 'Failed to get response. Please try again.',
        });
      }
    },
  });

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    queryMutation.reset();
    setIsProcessing(false);
    setOptimisticMessages([]);
  };

  const handleNewChat = () => {
    if (isProcessing) {
      handleStop();
    }
    navigate('/');
    setOptimisticMessages([]);
    setInput('');
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    if (isProcessing) {
      toast.warning('Please wait', {
        description:
          'A query is already in progress. Stop it first or wait for it to complete.',
      });
      return;
    }

    queryMutation.mutate({
      question: input,
      conversation_id: conversationId,
    });

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
  }, [displayMessages]);

  // Clear optimistic messages when navigating to a different conversation
  useEffect(() => {
    setOptimisticMessages([]);
    setIsProcessing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const conversationTitle =
    displayMessages[0]?.content.slice(0, 60) +
    (displayMessages[0]?.content.length > 60 ? '...' : '');

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
            disabled={queryMutation.isPending}
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
        ) : displayMessages.length === 0 ? (
          <EmptyState />
        ) : (
          displayMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
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
            disabled={isProcessing}
          />
          {isProcessing ? (
            <Button
              size="icon"
              variant="destructive"
              className="px-7 rounded-md shrink-0 cursor-pointer"
              onClick={handleStop}
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="px-7 rounded-md shrink-0 cursor-pointer"
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Ask
            </Button>
          )}
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          AI can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
}
