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
}: {
  question: string;
  conversation_id?: number;
}) => {
  const response = await fetch(getApiUrl('/api/data/query'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      conversation_id,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
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
