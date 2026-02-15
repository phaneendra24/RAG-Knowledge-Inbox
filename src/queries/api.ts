import { getApiUrl } from '@/lib/api-config';

export const fetchAllitems = async ({ queryKey }: { queryKey: string[] }) => {
  const [, source] = queryKey;
  console.log(queryKey, source);

  const response = await fetch(getApiUrl(`/api/data/items?source=${source}`));

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const ingestNotes = async ({ content }: { content: string }) => {
  const response = await fetch(getApiUrl('/api/data/ingest'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'NOTE',
      content: content,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const ingestUrls = async ({ url }: { url: string }) => {
  const response = await fetch(getApiUrl('/api/data/ingest'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'URL',
      content: url,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const queryData = async ({
  question,
  conversation_id,
  signal,
  timeout = 60000, // 60 second default timeout
}: {
  question: string;
  conversation_id?: number;
  signal?: AbortSignal;
  timeout?: number;
}) => {
  // Create a timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  // Combine user signal with timeout signal if provided
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(getApiUrl('/api/data/query'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        conversation_id,
      }),
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

export const fetchConversations = async () => {
  const response = await fetch(getApiUrl('/api/data/conversations'));

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const fetchConversation = async (id: number) => {
  const response = await fetch(getApiUrl(`/api/data/conversations/${id}`));

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};
